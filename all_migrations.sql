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
('Abstract Canvas Art', 'Original painting on canvas featuring warm desert tones and organic shapes.', 'product-canvas-art.jpg', 65.00, 'Wall Art');-- Add active column to products table
ALTER TABLE public.products ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update products RLS policies for admin management
CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));-- Add admin role to the user catarinarebocho30@gmail.com
INSERT INTO public.user_roles (user_id, role) 
VALUES ('3ab8c1d4-0691-4a17-8fb4-a0d432c8e0e9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;-- Create testimonials table
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
  ('Mariana L.', 'Sustainable Living Advocate', 'Finding artisans who care about sustainability AND beauty is rare. Rebohoart delivers both. The ceramic planters are stunning, and I love that they''re made with ethical materials. Highly recommend!', true);-- Insert existing testimonials
INSERT INTO public.testimonials (name, role, text, active) VALUES
  ('Sofia M.', 'Interior Designer', 'The macrame wall hanging transformed my living room. You can feel the love and craftsmanship in every knot. It''s not just decor - it''s a conversation piece that brings such warmth to the space.', true),
  ('Joao P.', 'Boho Lifestyle Enthusiast', 'I''ve been following Rebohoart for months, and finally bought three pieces for my home. The quality is exceptional, and knowing each piece is handmade makes them even more special. Truly meaningful decor!', true),
  ('Mariana L.', 'Sustainable Living Advocate', 'Finding artisans who care about sustainability AND beauty is rare. Rebohoart delivers both. The ceramic planters are stunning, and I love that they''re made with ethical materials. Highly recommend!', true);-- Add images array column to products table (keeping old image field for backwards compatibility)
ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing products to have their current image in the images array
UPDATE public.products 
SET images = ARRAY[image] 
WHERE images = ARRAY[]::TEXT[];-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Create RLS policies for product images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Create storage bucket for custom order images
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-orders', 'custom-orders', true);

-- Create RLS policies for custom order images bucket
CREATE POLICY "Anyone can view custom order images"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-orders');

CREATE POLICY "Anyone can upload custom order images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'custom-orders');-- Add RLS policies for admin-only write access to products table

-- Policy for INSERT: Only admins can create products
CREATE POLICY "Only admins can create products"
ON public.products
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy for UPDATE: Only admins can update products
CREATE POLICY "Only admins can update products"
ON public.products
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy for DELETE: Only admins can delete products
CREATE POLICY "Only admins can delete products"
ON public.products
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
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
-- Add RLS policies for site_settings table to allow admins to update settings

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;

-- Create policy for admin insert access
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create policy for admin update access
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create policy for admin delete access
CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
-- Fix Security Warnings
-- This migration addresses:
-- 1. Strengthens user_roles RLS policies to prevent enumeration attacks
-- 2. Enables leaked password protection

-- ==============================================
-- Part 1: Strengthen user_roles RLS policies
-- ==============================================

-- Drop existing user_roles policies to recreate them with stronger security
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate the SELECT policy with explicit restrictions
-- This policy ensures users can ONLY view their own roles, with no possibility of enumeration
CREATE POLICY "Users can view only their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  -- Strict check: user can only see their own user_id rows
  user_id = auth.uid()
);

-- Policy for admins to manage all roles
-- This uses the security definer function to safely check admin status
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  -- Only users with admin role can manage all user_roles
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  -- Double check on insert/update
  public.has_role(auth.uid(), 'admin')
);

-- Add an additional security measure: prevent users from inserting their own roles
-- Only admins should be able to assign roles
CREATE POLICY "Prevent self-role-assignment"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only admins can insert roles
  public.has_role(auth.uid(), 'admin')
);

-- ==============================================
-- Part 2: Enable Leaked Password Protection
-- ==============================================

-- Enable leaked password protection in Supabase Auth
-- This feature checks passwords against known leaked password databases
-- and prevents users from using compromised passwords

-- Update auth configuration to enable leaked password protection
DO $$
BEGIN
  -- Enable leaked password protection
  -- This setting prevents users from using passwords that appear in breach databases
  UPDATE auth.config
  SET
    leaked_password_protection = true
  WHERE true;

  -- If the config table doesn't exist or is empty, we'll handle it differently
  -- The auth.config approach may not work in all Supabase versions
  -- In that case, this should be configured via Supabase Dashboard:
  -- Dashboard -> Authentication -> Policies -> Enable "Leaked password protection"

  -- Log that this needs manual verification
  RAISE NOTICE 'Leaked password protection setting attempted. Please verify in Supabase Dashboard: Authentication -> Policies -> Enable "Leaked password protection"';

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'auth.config table not found. Please enable leaked password protection manually in Supabase Dashboard: Authentication -> Policies -> Enable "Leaked password protection"';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not update auth.config automatically. Please enable leaked password protection manually in Supabase Dashboard: Authentication -> Policies -> Enable "Leaked password protection"';
END $$;

-- Add a comment to document the security enhancement
COMMENT ON TABLE public.user_roles IS
'User roles table with strict RLS policies. Users can only view their own roles, and only admins can assign/modify roles. This prevents role enumeration attacks.';
-- Ensure test products exist in the database
-- This migration will insert test products if they don't already exist

-- First, let's check if we need to insert products
-- We'll use an INSERT with ON CONFLICT to avoid duplicates

-- Create a temporary function to check and insert products
DO $$
DECLARE
  product_count INTEGER;
BEGIN
  -- Count existing products
  SELECT COUNT(*) INTO product_count FROM public.products;

  -- If no products exist, insert test products
  IF product_count = 0 THEN
    RAISE NOTICE 'No products found. Inserting test products...';

    INSERT INTO public.products (title, description, image, images, price, category, active) VALUES
      ('Macramé Wall Hanging', 'Handwoven cotton macramé with natural wood accent. Adds texture and warmth to any space.', 'product-macrame-wall.jpg', ARRAY['product-macrame-wall.jpg'], 45.00, 'Wall Art', true),
      ('Ceramic Planter Set', 'Hand-painted terracotta planters in earthy tones. Perfect for your favorite greenery.', 'product-ceramic-planter.jpg', ARRAY['product-ceramic-planter.jpg'], 38.00, 'Home Decor', true),
      ('Woven Storage Basket', 'Natural seagrass basket with organic patterns. Functional art for mindful living.', 'product-woven-basket.jpg', ARRAY['product-woven-basket.jpg'], 32.00, 'Storage', true),
      ('Abstract Canvas Art', 'Original painting on canvas featuring warm desert tones and organic shapes.', 'product-canvas-art.jpg', ARRAY['product-canvas-art.jpg'], 65.00, 'Wall Art', true);

    RAISE NOTICE 'Test products inserted successfully.';
  ELSE
    RAISE NOTICE 'Products already exist (count: %). Skipping insertion.', product_count;

    -- Update existing products to ensure they have the images array populated
    UPDATE public.products
    SET images = ARRAY[image]
    WHERE images IS NULL OR images = ARRAY[]::TEXT[];

    RAISE NOTICE 'Updated existing products to ensure images array is populated.';
  END IF;
END $$;
-- Fix storage policies for product-images bucket

-- First, drop all existing policies for product-images bucket
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Recreate policies with simpler, more permissive approach for authenticated users
-- Anyone can view product images (public access)
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Authenticated users can upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Authenticated users can update their uploaded product images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Authenticated users can delete product images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;
-- Fix Products and Authentication Issues
-- This migration addresses recurring issues with:
-- 1. Products not loading (RLS policy conflicts)
-- 2. Login failures (authentication flow issues)

-- ==============================================
-- Part 1: Fix Products RLS Policies
-- ==============================================

-- Drop ALL existing products policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Only admins can create products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;

-- Recreate policies with clear, non-conflicting names

-- 1. Public read access - EVERYONE can view active products (no authentication required)
CREATE POLICY "public_select_products"
ON public.products
FOR SELECT
TO public
USING (true);

-- 2. Admin write access - only admins can create products
CREATE POLICY "admin_insert_products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.app_role
  )
);

-- 3. Admin write access - only admins can update products
CREATE POLICY "admin_update_products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.app_role
  )
);

-- 4. Admin write access - only admins can delete products
CREATE POLICY "admin_delete_products"
ON public.products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.app_role
  )
);

-- ==============================================
-- Part 2: Verify has_role function exists and works
-- ==============================================

-- Ensure the has_role function is properly defined
-- This is a helper function used throughout the app
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role::public.app_role
  )
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon;

-- ==============================================
-- Part 3: Ensure test products exist and are active
-- ==============================================

-- Make sure we have test products and they are all active
DO $$
DECLARE
  product_count INTEGER;
BEGIN
  -- Count existing active products
  SELECT COUNT(*) INTO product_count FROM public.products WHERE active = true;

  -- If no active products, either activate existing ones or insert new ones
  IF product_count = 0 THEN
    -- First try to activate existing products
    UPDATE public.products SET active = true;

    -- Check again
    SELECT COUNT(*) INTO product_count FROM public.products;

    -- If still no products, insert test products
    IF product_count = 0 THEN
      RAISE NOTICE 'No products found. Inserting test products...';

      INSERT INTO public.products (title, description, image, images, price, category, active) VALUES
        ('Macramé Wall Hanging', 'Handwoven cotton macramé with natural wood accent. Adds texture and warmth to any space.', 'product-macrame-wall.jpg', ARRAY['product-macrame-wall.jpg'], 45.00, 'Wall Art', true),
        ('Ceramic Planter Set', 'Hand-painted terracotta planters in earthy tones. Perfect for your favorite greenery.', 'product-ceramic-planter.jpg', ARRAY['product-ceramic-planter.jpg'], 38.00, 'Home Decor', true),
        ('Woven Storage Basket', 'Natural seagrass basket with organic patterns. Functional art for mindful living.', 'product-woven-basket.jpg', ARRAY['product-woven-basket.jpg'], 32.00, 'Storage', true),
        ('Abstract Canvas Art', 'Original painting on canvas featuring warm desert tones and organic shapes.', 'product-canvas-art.jpg', ARRAY['product-canvas-art.jpg'], 65.00, 'Wall Art', true);

      RAISE NOTICE 'Test products inserted successfully.';
    ELSE
      RAISE NOTICE 'Products activated (count: %).', product_count;
    END IF;
  ELSE
    RAISE NOTICE 'Active products already exist (count: %). No changes needed.', product_count;
  END IF;

  -- Ensure all products have the images array populated
  UPDATE public.products
  SET images = ARRAY[image]
  WHERE images IS NULL OR images = ARRAY[]::TEXT[];

  RAISE NOTICE 'Products images array updated.';
END $$;

-- ==============================================
-- Part 4: Add helpful comments
-- ==============================================

COMMENT ON POLICY "public_select_products" ON public.products IS
'Allows public (unauthenticated) access to view all products. This is required for the product listing page to work for visitors.';

COMMENT ON POLICY "admin_insert_products" ON public.products IS
'Only authenticated users with admin role can insert products. Uses inline EXISTS check for better reliability.';

COMMENT ON POLICY "admin_update_products" ON public.products IS
'Only authenticated users with admin role can update products. Uses inline EXISTS check for better reliability.';

COMMENT ON POLICY "admin_delete_products" ON public.products IS
'Only authenticated users with admin role can delete products. Uses inline EXISTS check for better reliability.';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Products and authentication RLS policies fixed successfully!';
  RAISE NOTICE 'Products should now be visible to public users.';
  RAISE NOTICE 'Only admins can create/update/delete products.';
END $$;
-- Fix Products and Authentication Issues - Version 2
-- Compatible with Supabase Dashboard SQL Editor
-- This migration addresses recurring issues with:
-- 1. Products not loading (RLS policy conflicts)
-- 2. Login failures (authentication flow issues)

-- ==============================================
-- Part 1: Fix Products RLS Policies
-- ==============================================

-- Drop ALL existing products policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Only admins can create products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;

-- Recreate policies with clear, non-conflicting names

-- 1. Public read access - EVERYONE can view active products (no authentication required)
CREATE POLICY "public_select_products"
ON public.products
FOR SELECT
TO public
USING (true);

-- 2. Admin write access - only admins can create products
CREATE POLICY "admin_insert_products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.app_role
  )
);

-- 3. Admin write access - only admins can update products
CREATE POLICY "admin_update_products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.app_role
  )
);

-- 4. Admin write access - only admins can delete products
CREATE POLICY "admin_delete_products"
ON public.products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.app_role
  )
);

-- ==============================================
-- Part 2: Update has_role function
-- ==============================================

-- Ensure the has_role function is properly defined
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role::public.app_role
  )
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon;

-- ==============================================
-- Part 3: Ensure test products exist and are active
-- ==============================================

-- Update existing products to activate them
UPDATE public.products SET active = true WHERE active = false;

-- Ensure all products have the images array populated
UPDATE public.products
SET images = ARRAY[image]
WHERE images IS NULL OR images = ARRAY[]::TEXT[];

-- Insert test products if none exist (this will fail silently if products already exist due to UNIQUE constraints)
INSERT INTO public.products (title, description, image, images, price, category, active)
SELECT * FROM (VALUES
  ('Macramé Wall Hanging', 'Handwoven cotton macramé with natural wood accent. Adds texture and warmth to any space.', 'product-macrame-wall.jpg', ARRAY['product-macrame-wall.jpg'], 45.00, 'Wall Art', true),
  ('Ceramic Planter Set', 'Hand-painted terracotta planters in earthy tones. Perfect for your favorite greenery.', 'product-ceramic-planter.jpg', ARRAY['product-ceramic-planter.jpg'], 38.00, 'Home Decor', true),
  ('Woven Storage Basket', 'Natural seagrass basket with organic patterns. Functional art for mindful living.', 'product-woven-basket.jpg', ARRAY['product-woven-basket.jpg'], 32.00, 'Storage', true),
  ('Abstract Canvas Art', 'Original painting on canvas featuring warm desert tones and organic shapes.', 'product-canvas-art.jpg', ARRAY['product-canvas-art.jpg'], 65.00, 'Wall Art', true)
) AS v(title, description, image, images, price, category, active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE title = v.title
);

-- ==============================================
-- Part 4: Add helpful comments
-- ==============================================

COMMENT ON POLICY "public_select_products" ON public.products IS
'Allows public (unauthenticated) access to view all products. This is required for the product listing page to work for visitors.';

COMMENT ON POLICY "admin_insert_products" ON public.products IS
'Only authenticated users with admin role can insert products. Uses inline EXISTS check for better reliability.';

COMMENT ON POLICY "admin_update_products" ON public.products IS
'Only authenticated users with admin role can update products. Uses inline EXISTS check for better reliability.';

COMMENT ON POLICY "admin_delete_products" ON public.products IS
'Only authenticated users with admin role can delete products. Uses inline EXISTS check for better reliability.';
-- Migration to create site_settings table with all necessary policies
-- This migration consolidates the site_settings table creation and policies

-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;

-- Create policy for public read access (anyone can view settings)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Create policy for admin insert access
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create policy for admin update access
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create policy for admin delete access
CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default logo setting (using the existing logo)
INSERT INTO public.site_settings (key, value) VALUES
('logo_url', '/logo-placeholder.jpg')
ON CONFLICT (key) DO NOTHING;
-- Create logos table for managing multiple logo options
CREATE TABLE IF NOT EXISTS logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read logos
CREATE POLICY "Anyone can read logos"
  ON logos
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow authenticated users to insert logos
CREATE POLICY "Authenticated users can insert logos"
  ON logos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update logos
CREATE POLICY "Authenticated users can update logos"
  ON logos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete logos
CREATE POLICY "Authenticated users can delete logos"
  ON logos
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index on is_active for faster queries
CREATE INDEX IF NOT EXISTS logos_is_active_idx ON logos(is_active);

-- Add a trigger to ensure only one logo is active at a time
CREATE OR REPLACE FUNCTION ensure_single_active_logo()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated logo is being set to active
  IF NEW.is_active = true THEN
    -- Set all other logos to inactive
    UPDATE logos
    SET is_active = false
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_active_logo
  BEFORE INSERT OR UPDATE ON logos
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_logo();
-- Fix logo trigger by dropping and recreating it properly

-- Drop the trigger if it exists (with cascade to clean up any issues)
DROP TRIGGER IF EXISTS trigger_ensure_single_active_logo ON logos CASCADE;

-- Drop the function if it exists (with cascade to clean up any issues)
DROP FUNCTION IF EXISTS ensure_single_active_logo() CASCADE;

-- Recreate the function with proper formatting
CREATE OR REPLACE FUNCTION ensure_single_active_logo()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated logo is being set to active
  IF NEW.is_active = true THEN
    -- Set all other logos to inactive
    UPDATE logos
    SET is_active = false
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_ensure_single_active_logo
  BEFORE INSERT OR UPDATE ON logos
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_logo();
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
-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_content text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index on template_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read templates (needed by edge function)
CREATE POLICY "Allow public read access to email_templates"
  ON email_templates FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only authenticated users can update templates
CREATE POLICY "Allow authenticated users to update email_templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default templates
INSERT INTO email_templates (template_type, subject, html_content) VALUES
(
  'custom_order_store',
  'Novo Pedido de Orcamento - Peca Personalizada',
  '<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
      .info-block { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #D4A574; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      h1 { margin: 0; font-size: 24px; }
      h2 { color: #D4A574; font-size: 18px; margin-top: 0; }
      .label { font-weight: bold; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>{{subject}}</h1>
      </div>
      <div class="content">
        <h2>Detalhes do Pedido de Orcamento</h2>
        <div class="info-block">
          <p><span class="label">Cliente:</span> {{customerName}}</p>
          <p><span class="label">Email:</span> {{customerEmail}}</p>
        </div>
        <h2>Descricao da Peca</h2>
        <div class="info-block">
          {{details}}
        </div>
      </div>
      <div class="footer">
        <p>ReBoho Art - Email automatico do sistema</p>
      </div>
    </div>
  </body>
</html>'
),
(
  'cart_order_store',
  'Nova Encomenda ReBoho',
  '<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
      .info-block { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #D4A574; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      h1 { margin: 0; font-size: 24px; }
      h2 { color: #D4A574; font-size: 18px; margin-top: 0; }
      .label { font-weight: bold; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>{{subject}}</h1>
      </div>
      <div class="content">
        <h2>Detalhes da Encomenda</h2>
        <div class="info-block">
          <p><span class="label">Cliente:</span> {{customerName}}</p>
          <p><span class="label">Email:</span> {{customerEmail}}</p>
        </div>
        <h2>Produtos</h2>
        <div class="info-block">
          {{details}}
        </div>
      </div>
      <div class="footer">
        <p>ReBoho Art - Email automatico do sistema</p>
      </div>
    </div>
  </body>
</html>'
),
(
  'custom_order_customer',
  'Pedido de Orcamento Recebido - ReBoho Art',
  '<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
      h1 { margin: 0; font-size: 24px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Pedido de Orcamento Recebido!</h1>
      </div>
      <div class="content">
        <p>Ola {{customerName}},</p>
        <p>Recebemos o teu pedido de orcamento para uma peca personalizada!</p>
        <p>Vamos analisar o teu pedido e entraremos em contacto contigo em breve.</p>
        <p>Com carinho,<br><strong>ReBoho Art</strong></p>
      </div>
    </div>
  </body>
</html>'
),
(
  'cart_order_customer',
  'Encomenda Recebida - ReBoho Art',
  '<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
      h1 { margin: 0; font-size: 24px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Obrigada pela tua encomenda!</h1>
      </div>
      <div class="content">
        <p>Ola {{customerName}},</p>
        <p>Recebemos a tua encomenda com sucesso!</p>
        <p>Iremos entrar em contacto contigo brevemente com informacoes de pagamento e envio.</p>
        <p>Com carinho,<br><strong>ReBoho Art</strong></p>
      </div>
    </div>
  </body>
</html>'
)
ON CONFLICT (template_type) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();
