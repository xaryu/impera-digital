-- Public forms go through the form-submit Edge Function (bug hunt 2026-11-13, #2 and #4).
--
-- Before: the contact form, the exit-intent popup (leads) and job applications inserted straight
-- from the browser with anon policies. Nobody was notified, and the only limit was a global hourly
-- cap per table, so one script could fill it and lock every real visitor out for an hour.
-- Now the browser calls form-submit, which drops honeypot hits, applies a per-IP limit, inserts
-- with the service role and emails the owner at site_settings.notification_email.
--
-- Order: push this migration, then deploy form-submit, then deploy the site. Between the push and
-- the site deploy the old site cannot submit these forms (its anon inserts are refused).

-- 1. Settings: where form notifications go. Exactly one row (id is always true), admins only.
CREATE TABLE public.site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  notification_email TEXT CHECK (
    notification_email IS NULL
    OR (char_length(notification_email) <= 255 AND notification_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  ),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.site_settings (id) VALUES (true);

-- No INSERT or DELETE policy: the single row always exists and is only updated.
CREATE POLICY "Admins can view settings" ON public.site_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update settings" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Per-IP limit: keyed hash of the caller's IP (as on calculator_submissions), cleared after 24h.
ALTER TABLE public.contact_submissions ADD COLUMN ip_hash TEXT;
ALTER TABLE public.leads ADD COLUMN ip_hash TEXT;
ALTER TABLE public.job_applications ADD COLUMN ip_hash TEXT;

CREATE INDEX idx_contact_submissions_ip_hash_created
  ON public.contact_submissions (ip_hash, created_at DESC) WHERE ip_hash IS NOT NULL;
CREATE INDEX idx_leads_ip_hash_created
  ON public.leads (ip_hash, created_at DESC) WHERE ip_hash IS NOT NULL;
CREATE INDEX idx_job_applications_ip_hash_created
  ON public.job_applications (ip_hash, created_at DESC) WHERE ip_hash IS NOT NULL;

-- 3. No more direct inserts from the browser. The function uses the service role, which bypasses
-- RLS; the hourly cap triggers from 20261030180000_public_forms_hardening.sql still apply to it.
DROP POLICY "Anyone can submit contact forms" ON public.contact_submissions;
DROP POLICY "Anyone can submit leads" ON public.leads;
DROP POLICY "Anyone can submit applications" ON public.job_applications;

-- 4. CVs: the browser still uploads the file itself (policy "Anyone can upload CVs" stays). Admins
-- may now delete CVs, so deleting a job opening also removes its applicants' files (#5).
CREATE POLICY "Admins can delete CVs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cv-uploads' AND public.has_role(auth.uid(), 'admin'));

-- 5. Retention of the IP hashes, same pg_cron guard as the calculator migrations.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
    PERFORM cron.schedule(
      'public-forms-ip-hash-retention',
      '*/30 * * * *',
      $job$
        UPDATE public.contact_submissions SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created_at < now() - interval '24 hours';
        UPDATE public.leads SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created_at < now() - interval '24 hours';
        UPDATE public.job_applications SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created_at < now() - interval '24 hours';
      $job$
    );
  ELSE
    RAISE NOTICE 'pg_cron is not available: the public forms IP hash retention job was not scheduled';
  END IF;
END
$$;
