-- Hardening for the hours calculator (review findings). Additive only.

-- 1. The hourly cap counts rows by created_at alone; the existing index starts with email.
CREATE INDEX idx_calculator_submissions_created_at ON public.calculator_submissions (created_at DESC);

-- 2. Atomic dedupe + hourly cap + insert. The Edge Function used to read, then write, so two
-- concurrent requests could both pass the checks. This function takes one transaction-scoped
-- advisory lock first, which serialises claims (volume is capped at ~100/hour, so one global lock
-- is cheap). Callable by the service role only.
CREATE FUNCTION public.claim_calculator_submission(
  p_email TEXT,
  p_language TEXT,
  p_inputs JSONB,
  p_result JSONB,
  p_window_minutes INT,
  p_hourly_cap INT
) RETURNS TABLE (status TEXT, submission_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_since TIMESTAMP WITH TIME ZONE := now() - make_interval(mins => p_window_minutes);
  v_unsent UUID;
  v_id UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('calculator-report-claim'));

  -- A report already went out for this address in the window.
  IF EXISTS (
    SELECT 1 FROM calculator_submissions
    WHERE email = p_email AND created_at >= v_since AND report_sent_at IS NOT NULL
  ) THEN
    RETURN QUERY SELECT 'rate_limited'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- An earlier attempt stored the lead but the email never went out: reuse the oldest such row
  -- with what the visitor submitted now.
  SELECT id INTO v_unsent FROM calculator_submissions
  WHERE email = p_email AND created_at >= v_since
  ORDER BY created_at, id
  LIMIT 1;
  IF v_unsent IS NOT NULL THEN
    UPDATE calculator_submissions
    SET language = p_language, inputs = p_inputs, result = p_result
    WHERE id = v_unsent;
    RETURN QUERY SELECT 'ok'::TEXT, v_unsent;
    RETURN;
  END IF;

  IF (SELECT count(*) FROM calculator_submissions WHERE created_at >= now() - interval '1 hour') >= p_hourly_cap THEN
    RETURN QUERY SELECT 'busy'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  INSERT INTO calculator_submissions (email, language, inputs, result, consent_at)
  VALUES (p_email, p_language, p_inputs, p_result, now())
  RETURNING id INTO v_id;
  RETURN QUERY SELECT 'ok'::TEXT, v_id;
END
$$;

REVOKE ALL ON FUNCTION public.claim_calculator_submission(TEXT, TEXT, JSONB, JSONB, INT, INT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_calculator_submission(TEXT, TEXT, JSONB, JSONB, INT, INT)
  TO service_role;

-- 3. calculator_events: the anon INSERT policy was WITH CHECK (true). RLS cannot rate-limit, but it
-- can stop forged timestamps, and a trigger caps how many events one run_id can write (a real run
-- logs at most 4). The event/language columns are already constrained by CHECKs.
DROP POLICY "Anyone can log calculator events" ON public.calculator_events;
CREATE POLICY "Anyone can log calculator events" ON public.calculator_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (created_at >= now() - interval '5 minutes' AND created_at <= now() + interval '1 minute');

CREATE INDEX idx_calculator_events_run_id ON public.calculator_events (run_id);

CREATE FUNCTION public.limit_calculator_events_per_run() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM calculator_events WHERE run_id = NEW.run_id) >= 8 THEN
    RAISE EXCEPTION 'too many events for this run' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER calculator_events_limit_per_run
  BEFORE INSERT ON public.calculator_events
  FOR EACH ROW EXECUTE FUNCTION public.limit_calculator_events_per_run();

-- Retention: events hold no personal data but should not grow forever. Keep 12 months. Same
-- pg_cron guard as the original migration.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
    PERFORM cron.schedule(
      'calculator-events-retention',
      '10 3 * * *',
      $job$DELETE FROM public.calculator_events WHERE created_at < now() - interval '12 months'$job$
    );
  ELSE
    RAISE NOTICE 'pg_cron is not available: the calculator events retention job was not scheduled';
  END IF;
END
$$;
