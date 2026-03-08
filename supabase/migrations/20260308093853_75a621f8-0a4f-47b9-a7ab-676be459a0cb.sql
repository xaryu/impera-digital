
-- Add bio column to team_members
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- Delete all existing team members
DELETE FROM public.team_members;

-- Insert the three real team members
INSERT INTO public.team_members (name, role, bio, display_order) VALUES
  ('Flavian', 'Founder & Growth Strategist', 'Multilingual strategist (7 languages) with expertise in finance, scale-up dynamics, and AI-driven marketing automation. Founded Impera to bring sophisticated European brands the strategic edge they need to dominate their markets.', 1),
  ('Inna', 'Senior Marketing Strategist', '15 years crafting marketing strategies for premium brands across California and Europe. Brings Silicon Valley strategic thinking to European sophistication.', 2),
  ('Aslan', 'SEO & Technical Specialist', 'SEO expert focused on sustainable organic growth. Ensures clients dominate search through technical excellence and content strategy.', 3);
