-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view products)
CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the existing products
INSERT INTO public.products (title, description, image, price, category) VALUES
('Macramé Wall Hanging', 'Handwoven cotton macramé with natural wood accent. Adds texture and warmth to any space.', 'product-macrame-wall.jpg', 45.00, 'Wall Art'),
('Ceramic Planter Set', 'Hand-painted terracotta planters in earthy tones. Perfect for your favorite greenery.', 'product-ceramic-planter.jpg', 38.00, 'Home Decor'),
('Woven Storage Basket', 'Natural seagrass basket with organic patterns. Functional art for mindful living.', 'product-woven-basket.jpg', 32.00, 'Storage'),
('Abstract Canvas Art', 'Original painting on canvas featuring warm desert tones and organic shapes.', 'product-canvas-art.jpg', 65.00, 'Wall Art');