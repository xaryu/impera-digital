-- Hardening for the hours calculator (review findings). Additive only.

-- 1. Columns for abuse control.
--   email_key  the address with plus-tags (and gmail dots) removed, computed by the Edge Function,
--              so a+1@x.com and a+2@x.com share one dedupe key. `email` stays what the visitor typed.
--   ip_hash    HMAC of the caller's IP (key never leaves the function), for a per-IP hourly limit.
--              Personal data, so it is cleared after 24 hours (job below) and stated in legal.json.
--   sending_at set while a request is sending the email, so a concurrent request waits (409)
--              instead of sending a second report.
ALTER TABLE public.calculator_submissions
  ADD COLUMN email_key TEXT,
  ADD COLUMN ip_hash TEXT,
  ADD COLUMN sending_at TIMESTAMP WITH TIME ZONE;

-- Existing rows: plus-tag stripping is enough for the 10-minute window, which they are long past.
UPDATE public.calculator_submissions SET email_key = regexp_replace(email, '\+[^@]*@', '@');
ALTER TABLE public.calculator_submissions ALTER COLUMN email_key SET NOT NULL;

-- The hourly cap counts by created_at alone; the existing index starts with email.
CREATE INDEX idx_calculator_submissions_created_at ON public.calculator_submissions (created_at DESC);
CREATE INDEX idx_calculator_submissions_email_key_created
  ON public.calculator_submissions (email_key, created_at DESC);
CREATE INDEX idx_calculator_submissions_ip_hash_created
  ON public.calculator_submissions (ip_hash, created_at DESC) WHERE ip_hash IS NOT NULL;

-- 2. Atomic dedupe + per-IP limit + hourly cap + insert. The Edge Function used to read, then
-- write, so two concurrent requests could both pass the checks. This function takes one
-- transaction-scoped advisory lock first, which serialises claims (volume is capped at ~100/hour,
-- so one global lock is cheap). Callable by the service role only.
-- Statuses: ok | rate_limited (already sent) | in_progress (another request is sending)
--           | ip_limited | busy (global cap).
CREATE FUNCTION public.claim_calculator_submission(
  p_email TEXT,
  p_email_key TEXT,
  p_ip_hash TEXT,
  p_language TEXT,
  p_inputs JSONB,
  p_result JSONB,
  p_window_minutes INT,
  p_hourly_cap INT,
  p_ip_hourly_cap INT,
  p_sending_seconds INT
) RETURNS TABLE (status TEXT, submission_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_since TIMESTAMP WITH TIME ZONE := now() - make_interval(mins => p_window_minutes);
  v_unsent calculator_submissions%ROWTYPE;
  v_id UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('calculator-report-claim'));

  -- A report already went out for this address in the window.
  IF EXISTS (
    SELECT 1 FROM calculator_submissions
    WHERE email_key = p_email_key AND created_at >= v_since AND report_sent_at IS NOT NULL
  ) THEN
    RETURN QUERY SELECT 'rate_limited'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- An earlier attempt stored the lead but the email never went out: reuse the oldest such row
  -- with what the visitor submitted now, unless another request is sending it right now.
  SELECT * INTO v_unsent FROM calculator_submissions
  WHERE email_key = p_email_key AND created_at >= v_since
  ORDER BY created_at, id
  LIMIT 1;
  IF FOUND THEN
    IF v_unsent.sending_at IS NOT NULL
       AND v_unsent.sending_at >= now() - make_interval(secs => p_sending_seconds) THEN
      RETURN QUERY SELECT 'in_progress'::TEXT, NULL::UUID;
      RETURN;
    END IF;
    UPDATE calculator_submissions
    SET email = p_email, language = p_language, inputs = p_inputs, result = p_result, sending_at = now()
    WHERE id = v_unsent.id;
    RETURN QUERY SELECT 'ok'::TEXT, v_unsent.id;
    RETURN;
  END IF;

  IF p_ip_hash IS NOT NULL AND (
    SELECT count(*) FROM calculator_submissions
    WHERE ip_hash = p_ip_hash AND created_at >= now() - interval '1 hour'
  ) >= p_ip_hourly_cap THEN
    RETURN QUERY SELECT 'ip_limited'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  IF (SELECT count(*) FROM calculator_submissions WHERE created_at >= now() - interval '1 hour') >= p_hourly_cap THEN
    RETURN QUERY SELECT 'busy'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  INSERT INTO calculator_submissions (email, email_key, ip_hash, language, inputs, result, consent_at, sending_at)
  VALUES (p_email, p_email_key, p_ip_hash, p_language, p_inputs, p_result, now(), now())
  RETURNING id INTO v_id;
  RETURN QUERY SELECT 'ok'::TEXT, v_id;
END
$$;

REVOKE ALL ON FUNCTION public.claim_calculator_submission(TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, INT, INT, INT, INT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_calculator_submission(TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, INT, INT, INT, INT)
  TO service_role;

-- 3. calculator_events: the anon INSERT policy was WITH CHECK (true). RLS cannot rate-limit, but it
-- can stop forged timestamps. A trigger bounds growth: at most 8 events per run_id (a real run logs
-- at most 4) and at most 1000 events per hour in total. run_id is chosen by the caller, so the
-- global cap is what really bounds the table; the price is that a flood can suppress analytics for
-- an hour. It cannot affect submissions. The event/language columns are already constrained by CHECKs.
DROP POLICY "Anyone can log calculator events" ON public.calculator_events;
CREATE POLICY "Anyone can log calculator events" ON public.calculator_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (created_at >= now() - interval '5 minutes' AND created_at <= now() + interval '1 minute');

CREATE INDEX idx_calculator_events_run_id ON public.calculator_events (run_id);

CREATE FUNCTION public.limit_calculator_events() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM calculator_events WHERE run_id = NEW.run_id) >= 8 THEN
    RAISE EXCEPTION 'too many events for this run' USING ERRCODE = 'check_violation';
  END IF;
  IF (SELECT count(*) FROM calculator_events WHERE created_at >= now() - interval '1 hour') >= 1000 THEN
    RAISE EXCEPTION 'too many events this hour' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER calculator_events_limit
  BEFORE INSERT ON public.calculator_events
  FOR EACH ROW EXECUTE FUNCTION public.limit_calculator_events();

-- Retention jobs, same pg_cron guard as the original migration. Events hold no personal data but
-- should not grow forever: keep 12 months. IP hashes: clear after 24 hours.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
    PERFORM cron.schedule(
      'calculator-events-retention',
      '10 3 * * *',
      $job$DELETE FROM public.calculator_events WHERE created_at < now() - interval '12 months'$job$
    );
    PERFORM cron.schedule(
      'calculator-ip-hash-retention',
      '*/30 * * * *',
      $job$UPDATE public.calculator_submissions SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created_at < now() - interval '24 hours'$job$
    );
  ELSE
    RAISE NOTICE 'pg_cron is not available: the calculator retention jobs were not scheduled';
  END IF;
END
$$;
