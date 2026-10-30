-- The hourly cap in claim_calculator_submission counted every row created in the last hour,
-- including attempts that never got a confirmation email out (overview review 2026-10-30,
-- finding 4). It now counts what it is meant to bound: confirmation emails that went out in the
-- last hour, plus rows being sent right now (their email may still go out after the claim's lock
-- is released). Same signature and statuses, so it is a plain replacement and keeps its grants.

CREATE INDEX idx_calculator_submissions_confirmation_sent
  ON public.calculator_submissions (confirmation_sent_at DESC) WHERE confirmation_sent_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.claim_calculator_submission(
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

  -- A confirmation email already went out for this address in the window.
  IF EXISTS (
    SELECT 1 FROM calculator_submissions
    WHERE email_key = p_email_key AND created_at >= v_since AND confirmation_sent_at IS NOT NULL
  ) THEN
    RETURN QUERY SELECT 'rate_limited'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- An earlier attempt stored the lead but no email went out: reuse the oldest such row with what
  -- the visitor submitted now, unless another request is sending it right now.
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

  IF (
    SELECT count(*) FROM calculator_submissions
    WHERE confirmation_sent_at >= now() - interval '1 hour'
       OR (confirmation_sent_at IS NULL AND sending_at >= now() - make_interval(secs => p_sending_seconds))
  ) >= p_hourly_cap THEN
    RETURN QUERY SELECT 'busy'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  INSERT INTO calculator_submissions (email, email_key, ip_hash, language, inputs, result, consent_at, sending_at)
  VALUES (p_email, p_email_key, p_ip_hash, p_language, p_inputs, p_result, now(), now())
  RETURNING id INTO v_id;
  RETURN QUERY SELECT 'ok'::TEXT, v_id;
END
$$;
