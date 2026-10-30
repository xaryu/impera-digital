-- Double opt-in for the hours calculator report. Additive, plus two function replacements.
--
-- Before: submitting the form sent the report straight away, so the Impera domain could be used to
-- mail the report to any address. Now the submission only sends a short confirmation email with a
-- link; the report goes out when the address owner opens the link and confirms (second request).
--
--   confirm_token_hash  SHA-256 of the one-time token in the link. The token itself is never stored.
--   confirm_expires_at  the link stops working after this (24 hours after the confirmation email).
--   confirmation_sent_at the confirmation email went out (this is what the dedupe window counts now).
--   confirmed_at        the visitor clicked the link and the report was claimed for sending.
--   report_sent_at      unchanged: the report email itself went out.
ALTER TABLE public.calculator_submissions
  ADD COLUMN confirm_token_hash TEXT,
  ADD COLUMN confirm_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN confirmation_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;

-- Rows from before double opt-in were confirmed by definition (the report went straight out).
UPDATE public.calculator_submissions
SET confirmation_sent_at = report_sent_at, confirmed_at = report_sent_at
WHERE report_sent_at IS NOT NULL;

CREATE UNIQUE INDEX idx_calculator_submissions_confirm_token
  ON public.calculator_submissions (confirm_token_hash) WHERE confirm_token_hash IS NOT NULL;

-- 1. The claim now treats "a confirmation email went out in the window" as the already-sent case.
-- Same signature and statuses as before, so it is a plain replacement.
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

-- 2. Confirmation: look the token up, and claim the report for sending (atomic, so a double click or
-- a link scanner plus the visitor cannot send the report twice). Same advisory lock as the claim.
-- Statuses: ok (send the report now) | sent (already sent, nothing to do) | invalid | expired
--           | in_progress (another request is sending it).
CREATE FUNCTION public.confirm_calculator_submission(
  p_token_hash TEXT,
  p_sending_seconds INT
) RETURNS TABLE (status TEXT, submission_id UUID, email TEXT, language TEXT, inputs JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row calculator_submissions%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('calculator-report-claim'));

  SELECT * INTO v_row FROM calculator_submissions s WHERE s.confirm_token_hash = p_token_hash;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'invalid'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  IF v_row.report_sent_at IS NOT NULL THEN
    RETURN QUERY SELECT 'sent'::TEXT, v_row.id, NULL::TEXT, NULL::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  IF v_row.confirm_expires_at IS NULL OR v_row.confirm_expires_at < now() THEN
    RETURN QUERY SELECT 'expired'::TEXT, v_row.id, NULL::TEXT, NULL::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  IF v_row.sending_at IS NOT NULL AND v_row.sending_at >= now() - make_interval(secs => p_sending_seconds) THEN
    RETURN QUERY SELECT 'in_progress'::TEXT, v_row.id, NULL::TEXT, NULL::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  UPDATE calculator_submissions s
  SET sending_at = now(), confirmed_at = COALESCE(s.confirmed_at, now())
  WHERE s.id = v_row.id;
  RETURN QUERY SELECT 'ok'::TEXT, v_row.id, v_row.email, v_row.language, v_row.inputs;
END
$$;

REVOKE ALL ON FUNCTION public.confirm_calculator_submission(TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_calculator_submission(TEXT, INT) TO service_role;
