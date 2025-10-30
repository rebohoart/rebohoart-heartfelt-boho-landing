-- Create storage bucket for product images
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
WITH CHECK (bucket_id = 'custom-orders');