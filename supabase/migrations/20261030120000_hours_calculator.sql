-- "How many hours is your team losing?" calculator. Additive only.
--
-- calculator_submissions: one row per visitor who asked for the emailed report. Written only by
-- the calculator-report Edge Function (service role). There is deliberately no anon INSERT policy,
-- so nobody can write rows (and trigger emails to arbitrary addresses) straight into the table.
CREATE TABLE public.calculator_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL CHECK (char_length(email) <= 255),
  language TEXT NOT NULL CHECK (language IN ('en', 'fr', 'nl')),
  inputs JSONB NOT NULL,        -- {people, hoursPerPerson, hourlyCost, tasks[]}
  result JSONB NOT NULL,        -- computed by the function from the inputs, never from the browser
  consent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  report_sent_at TIMESTAMP WITH TIME ZONE,  -- null = the email failed, can be retried from the dashboard
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calculator_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view calculator submissions" ON public.calculator_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete calculator submissions" ON public.calculator_submissions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- The function checks "same email in the last 10 minutes" on every request.
CREATE INDEX idx_calculator_submissions_email_created
  ON public.calculator_submissions (email, created_at DESC);

-- calculator_events: funnel events with no personal data. run_id is random per modal open and
-- is held in memory only (no cookie, no storage), so no consent is needed.
CREATE TABLE public.calculator_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event TEXT NOT NULL CHECK (event IN ('started', 'finished', 'email_submitted', 'audit_clicked')),
  run_id UUID NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'fr', 'nl')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calculator_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log calculator events" ON public.calculator_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view calculator events" ON public.calculator_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_calculator_events_created_at ON public.calculator_events (created_at DESC);

-- Retention: submissions older than 24 months are deleted daily at 03:00 UTC. Events hold no
-- personal data and are kept.
-- pg_cron must be allowed on the project (Dashboard > Database > Extensions) before this runs.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.schedule(
  'calculator-submissions-retention',
  '0 3 * * *',
  $$DELETE FROM public.calculator_submissions WHERE created_at < now() - interval '24 months'$$
);
