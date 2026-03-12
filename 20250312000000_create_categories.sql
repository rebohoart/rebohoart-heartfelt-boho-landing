-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can read categories
CREATE POLICY "Anyone can view categories"
ON public.categories FOR SELECT
USING (true);

-- Only admins can create categories
CREATE POLICY "Only admins can create categories"
ON public.categories FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete categories
CREATE POLICY "Only admins can delete categories"
ON public.categories FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
