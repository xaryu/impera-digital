-- Admin role: until now every policy trusted any authenticated user, and anyone
-- can sign up. Writes and private reads now require the 'admin' role.

CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users may see their own roles. There are deliberately no write policies:
-- roles are granted from the SQL editor / dashboard only.
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- SECURITY DEFINER so policies can check roles without recursing through
-- user_roles' own RLS.
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Record which admin account created each post / job.
ALTER TABLE public.blog_posts
  ADD COLUMN created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.job_openings
  ADD COLUMN created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;

-- team_members
DROP POLICY "Authenticated users can insert team members" ON public.team_members;
DROP POLICY "Authenticated users can update team members" ON public.team_members;
DROP POLICY "Authenticated users can delete team members" ON public.team_members;
CREATE POLICY "Admins can insert team members" ON public.team_members
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update team members" ON public.team_members
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete team members" ON public.team_members
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- blog_posts
DROP POLICY "Authenticated users can view all posts" ON public.blog_posts;
DROP POLICY "Authenticated users can insert posts" ON public.blog_posts;
DROP POLICY "Authenticated users can update posts" ON public.blog_posts;
DROP POLICY "Authenticated users can delete posts" ON public.blog_posts;
CREATE POLICY "Admins can view all posts" ON public.blog_posts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert posts" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update posts" ON public.blog_posts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete posts" ON public.blog_posts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- job_openings
DROP POLICY "Authenticated users can view all jobs" ON public.job_openings;
DROP POLICY "Authenticated users can insert jobs" ON public.job_openings;
DROP POLICY "Authenticated users can update jobs" ON public.job_openings;
DROP POLICY "Authenticated users can delete jobs" ON public.job_openings;
CREATE POLICY "Admins can view all jobs" ON public.job_openings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert jobs" ON public.job_openings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update jobs" ON public.job_openings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete jobs" ON public.job_openings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- job_applications (personal data: names, emails, CVs)
DROP POLICY "Authenticated users can view applications" ON public.job_applications;
DROP POLICY "Authenticated users can delete applications" ON public.job_applications;
CREATE POLICY "Admins can view applications" ON public.job_applications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete applications" ON public.job_applications
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- leads
DROP POLICY "Authenticated users can view leads" ON public.leads;
DROP POLICY "Authenticated users can delete leads" ON public.leads;
CREATE POLICY "Admins can view leads" ON public.leads
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete leads" ON public.leads
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- contact_submissions
DROP POLICY "Authenticated users can view submissions" ON public.contact_submissions;
DROP POLICY "Authenticated users can delete submissions" ON public.contact_submissions;
CREATE POLICY "Admins can view submissions" ON public.contact_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete submissions" ON public.contact_submissions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- storage: team photos
DROP POLICY "Authenticated users can upload team photos" ON storage.objects;
DROP POLICY "Authenticated users can update team photos" ON storage.objects;
DROP POLICY "Authenticated users can delete team photos" ON storage.objects;
CREATE POLICY "Admins can upload team photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update team photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete team photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'));

-- storage: CVs (private bucket)
DROP POLICY "Authenticated users can view CVs" ON storage.objects;
CREATE POLICY "Admins can view CVs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cv-uploads' AND public.has_role(auth.uid(), 'admin'));
