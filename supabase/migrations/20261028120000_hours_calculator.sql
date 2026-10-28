-- "How many hours is your team losing?" calculator.
--
-- calculator_submissions holds one row per visitor who asked for the breakdown
-- report. It is written only by the send-calculator-report edge function with
-- the service role — there is deliberately no anon INSERT policy, so a visitor
-- cannot write a row (and so cannot make us email an arbitrary address).
CREATE TABLE public.calculator_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT false,
  language TEXT NOT NULL DEFAULT 'en',

  -- What the visitor entered
  people INTEGER NOT NULL,
  hours_per_person_per_week INTEGER NOT NULL,
  hourly_cost INTEGER NOT NULL,
  tasks TEXT[] NOT NULL DEFAULT '{}',

  -- What we showed them, recomputed server-side from the inputs above
  hours_per_week INTEGER NOT NULL,
  hours_per_year INTEGER NOT NULL,
  yearly_cost INTEGER NOT NULL,
  automatable_hours_low INTEGER NOT NULL,
  automatable_hours_high INTEGER NOT NULL,
  automatable_cost_low INTEGER NOT NULL,
  automatable_cost_high INTEGER NOT NULL,

  report_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calculator_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view calculator submissions" ON public.calculator_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete calculator submissions" ON public.calculator_submissions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_calculator_submissions_created_at ON public.calculator_submissions (created_at DESC);

-- Funnel events. Anonymous by design: session_id is generated in memory on page
-- load and never stored in a cookie, and details only ever carries the
-- calculator inputs and results. The event name is constrained so the public
-- INSERT policy cannot be used to write arbitrary rows.
CREATE TABLE public.calculator_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL CHECK (
    event IN (
      'calculator_started',
      'calculator_finished',
      'calculator_email_submitted',
      'calculator_audit_clicked'
    )
  ),
  session_id TEXT NOT NULL CHECK (length(session_id) <= 64),
  language TEXT NOT NULL DEFAULT 'en' CHECK (length(language) <= 5),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calculator_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record calculator events" ON public.calculator_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view calculator events" ON public.calculator_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete calculator events" ON public.calculator_events
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_calculator_events_event ON public.calculator_events (event, created_at DESC);
