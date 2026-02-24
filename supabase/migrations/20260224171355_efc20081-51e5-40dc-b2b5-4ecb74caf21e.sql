
-- Job openings table
CREATE TABLE public.job_openings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL DEFAULT 'General',
  type TEXT NOT NULL DEFAULT 'Full-time',
  location TEXT NOT NULL DEFAULT 'Remote',
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  benefits TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published jobs" ON public.job_openings
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can view all jobs" ON public.job_openings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert jobs" ON public.job_openings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update jobs" ON public.job_openings
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete jobs" ON public.job_openings
  FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_job_openings_updated_at
  BEFORE UPDATE ON public.job_openings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_job_openings_slug ON public.job_openings(slug);
CREATE INDEX idx_job_openings_published ON public.job_openings(published);

-- Job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_opening_id UUID NOT NULL REFERENCES public.job_openings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  motivation_letter TEXT NOT NULL DEFAULT '',
  cv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application (public form)
CREATE POLICY "Anyone can submit applications" ON public.job_applications
  FOR INSERT WITH CHECK (true);

-- Only authenticated users (admin) can view applications
CREATE POLICY "Authenticated users can view applications" ON public.job_applications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete applications" ON public.job_applications
  FOR DELETE TO authenticated USING (true);

-- Storage bucket for CVs
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-uploads', 'cv-uploads', false);

-- Anyone can upload CVs
CREATE POLICY "Anyone can upload CVs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cv-uploads');

-- Authenticated users can view CVs
CREATE POLICY "Authenticated users can view CVs" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'cv-uploads');
