-- Add images array column to products table (keeping old image field for backwards compatibility)
ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing products to have their current image in the images array
UPDATE public.products 
SET images = ARRAY[image] 
WHERE images = ARRAY[]::TEXT[];