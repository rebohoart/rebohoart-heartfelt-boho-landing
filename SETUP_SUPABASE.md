# 🚀 Setup do Supabase - Passo a Passo

## 📋 Instruções

Siga estes passos para configurar o banco de dados do seu projeto no Supabase.

---

## Passo 1: Aceder ao SQL Editor

1. Vá para: https://app.supabase.com/project/gyvtgzdkuhypteiyhtaq/sql/new
2. Você verá um editor SQL vazio

---

## Passo 2: Executar o Script SQL

**Copie TODO o script abaixo** e cole no editor SQL do Supabase:

```sql
-- ============================================
-- REBOHOART - DATABASE SETUP
-- ============================================

-- 1. CREATE FUNCTION FOR TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- 2. CREATE PRODUCTS TABLE
-- ============================================
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- 3. CREATE USER ROLES SYSTEM
-- ============================================
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


-- 4. CREATE TESTIMONIALS TABLE
-- ============================================
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================

-- PRODUCTS POLICIES
CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);

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

-- USER_ROLES POLICIES
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- TESTIMONIALS POLICIES
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


-- 6. STORAGE BUCKETS
-- ============================================

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

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
VALUES ('custom-orders', 'custom-orders', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for custom order images bucket
CREATE POLICY "Anyone can view custom order images"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-orders');

CREATE POLICY "Anyone can upload custom order images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'custom-orders');


-- 7. INSERT INITIAL DATA
-- ============================================

-- Insert sample products
INSERT INTO public.products (title, description, image, images, price, category, active) VALUES
('Macramé Wall Hanging', 'Handwoven cotton macramé with natural wood accent. Adds texture and warmth to any space.', 'https://images.unsplash.com/photo-1452865973-75380494dfbe?w=800', ARRAY['https://images.unsplash.com/photo-1452865973-75380494dfbe?w=800'], 45.00, 'Wall Art', true),
('Ceramic Planter Set', 'Hand-painted terracotta planters in earthy tones. Perfect for your favorite greenery.', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800', ARRAY['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'], 38.00, 'Home Decor', true),
('Woven Storage Basket', 'Natural seagrass basket with organic patterns. Functional art for mindful living.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800', ARRAY['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'], 32.00, 'Storage', true),
('Abstract Canvas Art', 'Original painting on canvas featuring warm desert tones and organic shapes.', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', ARRAY['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800'], 65.00, 'Wall Art', true);

-- Insert sample testimonials
INSERT INTO public.testimonials (name, role, text, active) VALUES
  ('Sofia M.', 'Interior Designer', 'The macramé wall hanging transformed my living room. You can feel the love and craftsmanship in every knot. It''s not just décor—it''s a conversation piece that brings such warmth to the space.', true),
  ('João P.', 'Boho Lifestyle Enthusiast', 'I''ve been following Rebohoart for months, and finally bought three pieces for my home. The quality is exceptional, and knowing each piece is handmade makes them even more special. Truly meaningful décor!', true),
  ('Mariana L.', 'Sustainable Living Advocate', 'Finding artisans who care about sustainability AND beauty is rare. Rebohoart delivers both. The ceramic planters are stunning, and I love that they''re made with ethical materials. Highly recommend!', true);


-- ============================================
-- SETUP COMPLETE! 🎉
-- ============================================
```

---

## Passo 3: Executar o Script

1. Com o script colado no editor SQL
2. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
3. Aguarde alguns segundos
4. Você verá a mensagem **"Success. No rows returned"**

---

## Passo 4: Criar o Seu Utilizador Admin

Agora precisa fazer login no site pela primeira vez para criar a sua conta:

1. Abra o preview do Lovable
2. Navegue para `/auth` (ou `http://localhost:8080/auth` em desenvolvimento)
3. **Faça login com o email**: `catarinarebocho30@gmail.com`
4. Se ainda não tem conta, crie uma nova conta com esse email
5. Depois volte aqui para o próximo passo

---

## Passo 5: Tornar-se Admin

Depois de criar a conta no passo anterior, precisa adicionar permissões de admin:

1. Volte ao SQL Editor: https://app.supabase.com/project/gyvtgzdkuhypteiyhtaq/sql/new
2. Execute este comando SQL (**IMPORTANTE: Substitua o email se for diferente**):

```sql
-- Adicionar role de admin ao seu utilizador
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

3. Clique **"Run"**
4. Faça logout e login novamente no site
5. Agora pode aceder ao `/backoffice`! 🎉

---

## ✅ Verificação Final

Para confirmar que tudo está correto:

1. **Verifique as tabelas** em: https://app.supabase.com/project/gyvtgzdkuhypteiyhtaq/editor
   - Deve ver: `products`, `user_roles`, `testimonials`

2. **Verifique os buckets** em: https://app.supabase.com/project/gyvtgzdkuhypteiyhtaq/storage/buckets
   - Deve ver: `product-images`, `custom-orders`

3. **Teste o site**:
   - Produtos aparecem na página inicial
   - Pode fazer login em `/auth`
   - Pode aceder ao backoffice em `/backoffice`
   - Pode adicionar/editar produtos

---

## 🆘 Problemas?

Se algo não funcionar:

1. **Erro "relation already exists"**: Algumas tabelas já existem. Pode ignorar ou apagar primeiro.
2. **Erro de permissões**: Certifique-se que executou o script completo.
3. **Não consegue fazer login**: Verifique se criou a conta com o email correto.
4. **Não é admin**: Execute novamente o script do Passo 5.

---

## 📝 Notas Importantes

- A chave `anon` que configuramos no `.env` é **pública** e segura
- Nunca partilhe a `service_role` key
- O email admin pode ser alterado no Passo 5
- Os produtos de exemplo usam imagens do Unsplash (temporárias)

---

**Está tudo pronto!** 🚀 Depois de executar estes passos, o Lovable preview vai funcionar perfeitamente!
