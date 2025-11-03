# Deploy para Produção - Guia Passo a Passo

Este guia explica como aplicar as correções de produtos em produção.

## ✅ Pré-requisitos

- [ ] Código já foi commitado e enviado para o repositório
- [ ] Servidor de desenvolvimento está funcionando sem erros
- [ ] Tem acesso ao Supabase Dashboard do projeto de produção
- [ ] URL do Supabase: https://gyvtgzdkuhypteiyhtaq.supabase.co

## 📋 Passos para Deploy em Produção

### PASSO 1: Aplicar Migração no Supabase de Produção

A migração mais importante é a `20251103200000_ensure_test_products.sql` que garante que produtos de teste existem.

**Opção A - Via Supabase Dashboard (RECOMENDADO):**

1. Aceda ao Supabase Dashboard: https://supabase.com/dashboard
2. Selecione o projeto: `gyvtgzdkuhypteiyhtaq`
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**
5. Copie e cole o conteúdo do ficheiro: `supabase/migrations/20251103200000_ensure_test_products.sql`
6. Clique em **"Run"** (ou Ctrl+Enter)
7. Verifique se aparece "Success. No rows returned"

**Conteúdo da migração a executar:**

```sql
-- Ensure test products exist in the database
-- This migration will insert test products if they don't already exist

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
```

**Opção B - Via Supabase CLI (se tiver instalado):**

```bash
# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref gyvtgzdkuhypteiyhtaq

# Aplicar migrações
supabase db push
```

### PASSO 2: Verificar se a Migração Funcionou

Após executar a migração, verifique se os produtos foram inseridos:

1. No Supabase Dashboard, vá a **"Table Editor"**
2. Selecione a tabela **"products"**
3. Verifique se os 4 produtos aparecem:
   - Macramé Wall Hanging
   - Ceramic Planter Set
   - Woven Storage Basket
   - Abstract Canvas Art
4. Confirme que todos têm `active = true`

**Ou via SQL Editor:**

```sql
SELECT id, title, category, price, active, images
FROM public.products
ORDER BY created_at;
```

### PASSO 3: Deploy do Código Frontend

O código já está no repositório. Dependendo da sua plataforma de hosting:

**Se usar Lovable/Vercel/Netlify (Auto-deploy):**
- O deploy acontece automaticamente quando faz push para o repositório
- Aguarde 2-5 minutos para o build completar
- Verifique o status no dashboard da plataforma

**Se usar deploy manual:**
```bash
# Fazer build de produção
npm run build

# O output estará em dist/
# Faça upload dos ficheiros para o servidor
```

### PASSO 4: Testar em Produção

Depois do deploy, teste:

#### 4.1. Testar Página Principal
1. Abra o site de produção
2. Os produtos devem aparecer na secção "Peças Disponíveis"
3. Verifique se consegue adicionar ao carrinho

#### 4.2. Testar Página de Debug
1. Aceda a: `https://seu-dominio.com/debug`
2. Verifique:
   - ✅ Supabase URL e Key configurados
   - ✅ Total de produtos: 4 (ou mais)
   - ✅ Produtos ativos: 4 (ou mais)

#### 4.3. Testar Backoffice
1. Faça login como admin: `https://seu-dominio.com/auth`
2. Aceda ao backoffice: `https://seu-dominio.com/backoffice`
3. Teste:
   - ✅ Visualizar lista de produtos
   - ✅ Editar um produto
   - ✅ Adicionar um novo produto
   - ✅ Fazer upload de imagens
   - ✅ Ativar/desativar produtos

### PASSO 5: Configurar Utilizador como Admin (se necessário)

Se não conseguir editar produtos no backoffice, precisa atribuir permissões de admin:

1. Primeiro, faça login no site de produção (crie uma conta se necessário)
2. No Supabase Dashboard, vá ao **SQL Editor**
3. Execute este comando para encontrar o seu user ID:

```sql
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';
```

4. Copie o `id` retornado
5. Execute este comando para atribuir role de admin (substitua `USER_ID`):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

6. Faça logout e login novamente no site
7. Agora deve conseguir editar produtos no backoffice

### PASSO 6: Verificação Final

Use este checklist para confirmar que tudo está funcionando:

- [ ] Página principal mostra produtos
- [ ] Consegue adicionar produtos ao carrinho
- [ ] Página /debug mostra produtos ativos
- [ ] Consegue fazer login como admin
- [ ] Backoffice permite ver produtos
- [ ] Backoffice permite editar produtos
- [ ] Backoffice permite adicionar novos produtos
- [ ] Upload de imagens funciona
- [ ] Consegue ativar/desativar produtos

## 🔧 Troubleshooting em Produção

### Problema: Produtos não aparecem no site

**Solução:**
1. Aceda a `/debug` em produção
2. Verifique se mostra produtos
3. Se mostrar 0 produtos → Execute a migração novamente
4. Se mostrar produtos mas 0 ativos → Ative-os no backoffice

### Problema: Não consegue editar no backoffice

**Solução:**
1. Aceda a `/debug` e verifique "É Admin"
2. Se for "❌ Não" → Siga o PASSO 5 para atribuir permissões
3. Faça logout e login novamente

### Problema: Erro "Failed to fetch" ou "Network error"

**Solução:**
1. Verifique se as variáveis de ambiente estão configuradas no hosting:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
2. No Vercel/Netlify, adicione as variáveis nas Settings → Environment Variables
3. Faça redeploy após adicionar as variáveis

### Problema: Imagens não aparecem

**Solução:**
1. Verifique se o bucket 'product-images' existe no Supabase Storage
2. Configure o bucket como público:
   - Supabase Dashboard → Storage → product-images → Settings
   - Ative "Public bucket"
3. Ou configure políticas RLS para permitir leitura pública

## 📱 URLs Úteis em Produção

- **Supabase Dashboard:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq
- **SQL Editor:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/editor
- **Table Editor:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/editor
- **Storage:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/storage/buckets

## 🎉 Após Deploy Bem-Sucedido

1. **Remova produtos de teste (opcional):**
   - Se inseriu produtos de teste, pode removê-los pelo backoffice
   - Adicione produtos reais com imagens próprias

2. **Configure imagens reais:**
   - No backoffice, edite os produtos
   - Faça upload de imagens reais dos produtos

3. **Remova página de debug (opcional):**
   - A página `/debug` pode ficar disponível para troubleshooting futuro
   - Ou pode removê-la editando `src/App.tsx` e removendo a rota

4. **Crie backup:**
   - No Supabase Dashboard, vá a Settings → Database
   - Configure backups automáticos se ainda não estiverem configurados

## 🚨 Rollback (em caso de problemas)

Se algo correr mal, pode fazer rollback:

1. **Reverter código:**
   ```bash
   git revert HEAD
   git push
   ```

2. **Reverter migração:**
   No SQL Editor do Supabase:
   ```sql
   -- Remover produtos de teste (se foram inseridos pela migração)
   DELETE FROM public.products
   WHERE title IN ('Macramé Wall Hanging', 'Ceramic Planter Set', 'Woven Storage Basket', 'Abstract Canvas Art');
   ```

## 📞 Suporte

Se tiver problemas:
1. Consulte `TROUBLESHOOTING.md` para problemas comuns
2. Use a página `/debug` para diagnóstico
3. Verifique os logs no dashboard da plataforma de hosting
4. Verifique os logs do Supabase na aba "Logs"
