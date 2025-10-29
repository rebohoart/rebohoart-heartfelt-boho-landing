-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active testimonials"
  ON public.testimonials
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update testimonials"
  ON public.testimonials
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing testimonials
INSERT INTO public.testimonials (name, role, text, active) VALUES
  ('Sofia M.', 'Interior Designer', 'The macramé wall hanging transformed my living room. You can feel the love and craftsmanship in every knot. It''s not just décor—it''s a conversation piece that brings such warmth to the space.', true),
  ('João P.', 'Boho Lifestyle Enthusiast', 'I''ve been following Rebohoart for months, and finally bought three pieces for my home. The quality is exceptional, and knowing each piece is handmade makes them even more special. Truly meaningful décor!', true),
  ('Mariana L.', 'Sustainable Living Advocate', 'Finding artisans who care about sustainability AND beauty is rare. Rebohoart delivers both. The ceramic planters are stunning, and I love that they''re made with ethical materials. Highly recommend!', true);