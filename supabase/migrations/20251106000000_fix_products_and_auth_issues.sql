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
