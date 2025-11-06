-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for admin read access
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for insert (anyone can create orders)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Create custom_orders table
CREATE TABLE public.custom_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  delivery_deadline DATE NOT NULL,
  images JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- Create policy for admin read access
CREATE POLICY "Admins can view all custom orders"
ON public.custom_orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for insert (anyone can create custom orders)
CREATE POLICY "Anyone can create custom orders"
ON public.custom_orders
FOR INSERT
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_custom_orders_created_at ON public.custom_orders(created_at DESC);
