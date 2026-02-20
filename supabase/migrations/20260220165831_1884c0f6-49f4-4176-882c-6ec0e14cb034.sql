
-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public read policy (leadership section is public-facing)
CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert team members"
  ON public.team_members FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update team members"
  ON public.team_members FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete team members"
  ON public.team_members FOR DELETE
  USING (auth.role() = 'authenticated');

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for team photos
INSERT INTO storage.buckets (id, name, public) VALUES ('team-photos', 'team-photos', true);

-- Public read on bucket
CREATE POLICY "Team photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-photos');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload team photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'team-photos' AND auth.role() = 'authenticated');

-- Authenticated users can update team photos
CREATE POLICY "Authenticated users can update team photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'team-photos' AND auth.role() = 'authenticated');

-- Authenticated users can delete team photos
CREATE POLICY "Authenticated users can delete team photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'team-photos' AND auth.role() = 'authenticated');
