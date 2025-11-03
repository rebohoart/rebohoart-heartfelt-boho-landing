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
