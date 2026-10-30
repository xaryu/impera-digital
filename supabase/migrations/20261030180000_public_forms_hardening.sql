-- Hardening for the public forms and the CV bucket (overview review 2026-10-30, findings 2 and 5).
-- leads, contact_submissions, job_applications and the cv-uploads bucket all accept anonymous
-- writes straight from the browser. This bounds what one script can push in.

-- 1. CV bucket: same limits as the form (src/pages/CareerPost.tsx: 10 MB, .pdf/.doc/.docx).
UPDATE storage.buckets
SET file_size_limit = 10 * 1024 * 1024,
    allowed_mime_types = ARRAY[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
WHERE id = 'cv-uploads';

-- 2. Hourly caps. Counting needs to see rows the caller cannot read (anon has no SELECT), so the
-- counts run as SECURITY DEFINER. A global cap can lock real visitors out during an attack, but the
-- alternative is unbounded spam; the numbers are far above normal traffic for this site.
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications (created_at DESC);

-- Trigger argument: the hourly cap for that table. Raises, so PostgREST returns an error and the
-- forms show their generic error message.
CREATE FUNCTION public.enforce_public_insert_cap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Serialise inserts per table so concurrent requests cannot all pass the count.
  PERFORM pg_advisory_xact_lock(hashtext('public-insert-cap/' || TG_TABLE_NAME));
  EXECUTE format('SELECT count(*) FROM public.%I WHERE created_at >= now() - interval ''1 hour''', TG_TABLE_NAME)
    INTO v_count;
  IF v_count >= TG_ARGV[0]::INT THEN
    RAISE EXCEPTION 'too many submissions, try again later' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION public.enforce_public_insert_cap() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER leads_insert_cap BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.enforce_public_insert_cap('100');
CREATE TRIGGER contact_submissions_insert_cap BEFORE INSERT ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_public_insert_cap('50');
CREATE TRIGGER job_applications_insert_cap BEFORE INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_public_insert_cap('30');

-- 3. Size limits matching the form schemas (Contact.tsx, ExitIntentPopup.tsx, CareerPost.tsx).
-- NOT VALID: enforced for new rows only, existing rows are left alone.
ALTER TABLE public.leads
  ADD CONSTRAINT leads_email_length CHECK (char_length(email) <= 255) NOT VALID,
  ADD CONSTRAINT leads_source_length CHECK (char_length(source) <= 50) NOT VALID;
ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_submissions_lengths CHECK (
    char_length(name) <= 100 AND char_length(email) <= 255 AND char_length(coalesce(company, '')) <= 100
    AND char_length(coalesce(service, '')) <= 50 AND char_length(message) <= 5000
  ) NOT VALID;
ALTER TABLE public.job_applications
  ADD CONSTRAINT job_applications_lengths CHECK (
    char_length(full_name) <= 100 AND char_length(email) <= 255
    AND char_length(motivation_letter) <= 5000 AND char_length(coalesce(cv_url, '')) <= 500
  ) NOT VALID;

-- 4. Applications only for published openings.
DROP POLICY "Anyone can submit applications" ON public.job_applications;
CREATE POLICY "Anyone can submit applications" ON public.job_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.job_openings j WHERE j.id = job_opening_id AND j.published));

-- 5. CV uploads: only into the folder of a published opening (the form uploads to <job id>/...),
-- and at most 30 per hour in total.
CREATE FUNCTION public.cv_upload_allowed(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_openings j
    WHERE j.id::text = (storage.foldername(p_name))[1] AND j.published
  ) AND (
    SELECT count(*) FROM storage.objects o
    WHERE o.bucket_id = 'cv-uploads' AND o.created_at >= now() - interval '1 hour'
  ) < 30;
$$;

REVOKE ALL ON FUNCTION public.cv_upload_allowed(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cv_upload_allowed(TEXT) TO anon, authenticated;

DROP POLICY "Anyone can upload CVs" ON storage.objects;
CREATE POLICY "Anyone can upload CVs" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'cv-uploads' AND public.cv_upload_allowed(name));
