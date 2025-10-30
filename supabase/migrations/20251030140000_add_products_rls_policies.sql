-- Add RLS policies for admin-only write access to products table

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
