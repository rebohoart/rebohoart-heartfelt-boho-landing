-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view settings)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default logo setting (using the existing logo)
INSERT INTO public.site_settings (key, value) VALUES
('logo_url', '/logo-placeholder.jpg')
ON CONFLICT (key) DO NOTHING;
