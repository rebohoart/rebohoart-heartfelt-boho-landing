# 🚀 Deploy para Produção via Lovable - Guia Rápido

## 📌 Resumo

O seu projeto está hospedado no Lovable e o deploy é automático quando faz push para o repositório.

**URL do Projeto Lovable:** https://lovable.dev/projects/4fe76022-4fb8-4f5e-8f0f-92d4db1dd338

## ✅ Passo 1: Aplicar Migração no Supabase (IMPORTANTE!)

**Antes de testar**, precisa aplicar a migração para garantir que os produtos existem.

### Como aplicar:

1. **Aceda ao Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq

2. **Abra o SQL Editor:**
   - Menu lateral → SQL Editor → New Query

3. **Execute esta migração:**

```sql
-- Esta migração insere produtos de teste se não existirem
DO $$
DECLARE
  product_count INTEGER;
BEGIN
  -- Conta produtos existentes
  SELECT COUNT(*) INTO product_count FROM public.products;

  -- Se não existirem produtos, insere produtos de teste
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

    -- Atualiza produtos existentes para garantir que têm o array de imagens
    UPDATE public.products
    SET images = ARRAY[image]
    WHERE images IS NULL OR images = ARRAY[]::TEXT[];

    RAISE NOTICE 'Updated existing products to ensure images array is populated.';
  END IF;
END $$;
```

4. **Clique em "Run"** ou pressione `Ctrl+Enter`

5. **Verifique o resultado:**
   - Deve aparecer "Success" ou uma mensagem indicando quantos produtos foram inseridos

## ✅ Passo 2: Publicar no Lovable

O código já está no repositório. O Lovable fará deploy automaticamente!

### Verificar/Forçar Deploy:

1. **Abra o projeto no Lovable:**
   - https://lovable.dev/projects/4fe76022-4fb8-4f5e-8f0f-92d4db1dd338

2. **Clique em "Share" → "Publish"**
   - Isso força uma nova publicação se ainda não aconteceu automaticamente

3. **Aguarde o deploy (1-3 minutos)**

## ✅ Passo 3: Testar em Produção

### 3.1. Obter URL de Produção

1. No Lovable, clique em **"Share" → "View Published Site"**
2. Copie o URL (será algo como `https://seu-projeto.lovable.app`)

### 3.2. Testar Página de Debug

**URL:** `https://seu-projeto.lovable.app/debug`

Deve mostrar:
- ✅ Supabase configurado
- ✅ 4 produtos (ou mais)
- ✅ 4 produtos ativos

**Se mostrar 0 produtos:**
- Volte ao Passo 1 e execute a migração SQL
- Recarregue a página /debug

### 3.3. Testar Página Principal

**URL:** `https://seu-projeto.lovable.app`

Deve ver:
- ✅ Os 4 produtos na secção "Peças Disponíveis"
- ✅ Consegue clicar em "Adicionar ao carrinho"
- ✅ O carrinho funciona

### 3.4. Testar Backoffice

**Passo A - Criar conta/Login:**
1. Aceda a: `https://seu-projeto.lovable.app/auth`
2. Crie uma conta ou faça login

**Passo B - Tornar-se Admin:**

Depois de criar a conta, precisa atribuir permissões de admin:

1. Vá ao Supabase Dashboard → SQL Editor
2. Execute para encontrar seu user ID:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';
   ```
3. Copie o `id` retornado
4. Execute (substitua USER_ID pelo id copiado):
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('USER_ID', 'admin')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

**Passo C - Testar Backoffice:**
1. Faça logout e login novamente
2. Aceda a: `https://seu-projeto.lovable.app/backoffice`
3. Teste:
   - ✅ Ver lista de produtos
   - ✅ Editar um produto
   - ✅ Adicionar novo produto
   - ✅ Fazer upload de imagens
   - ✅ Ativar/desativar produtos

## 🔧 Resolução de Problemas Rápida

### Problema: Produtos não aparecem

**Solução:**
```
1. Ir para /debug em produção
2. Se mostrar 0 produtos → Executar migração SQL (Passo 1)
3. Se mostrar produtos mas 0 ativos → Ativar no backoffice
4. Recarregar a página principal
```

### Problema: Não consigo editar no backoffice

**Solução:**
```
1. Ir para /debug
2. Verificar "É Admin" → Se for ❌ Não
3. Executar SQL para atribuir role de admin (ver Passo 3.4.B)
4. Fazer logout e login novamente
```

### Problema: Erro "Failed to fetch"

**Solução:**
```
1. Verificar no Lovable: Settings → Environment Variables
2. Confirmar que existem:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
3. Se não existirem, adicionar e fazer redeploy
```

## 📋 Checklist Final

Após seguir todos os passos:

- [ ] Migração SQL executada com sucesso no Supabase
- [ ] Deploy publicado no Lovable
- [ ] Página `/debug` mostra 4+ produtos ativos
- [ ] Página principal mostra os produtos
- [ ] Carrinho funciona
- [ ] Conta de admin criada
- [ ] Backoffice acessível e funcional
- [ ] Consegue editar produtos
- [ ] Upload de imagens funciona

## 🎉 Próximos Passos

Agora que está tudo a funcionar:

1. **Personalize os produtos:**
   - Vá ao backoffice
   - Edite os produtos de teste ou adicione novos
   - Faça upload de imagens reais

2. **Configure domínio personalizado (opcional):**
   - No Lovable: Settings → Domains
   - Siga as instruções para conectar seu domínio

3. **Remova página /debug (opcional):**
   - Pode manter para troubleshooting futuro
   - Ou remova editando `src/App.tsx` e removendo a rota

## 🔗 Links Úteis

- **Projeto Lovable:** https://lovable.dev/projects/4fe76022-4fb8-4f5e-8f0f-92d4db1dd338
- **Supabase Dashboard:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq
- **Documentação Lovable:** https://docs.lovable.dev/
- **Troubleshooting Detalhado:** Ver arquivo `TROUBLESHOOTING.md`

## ❓ Dúvidas?

Se algo não funcionar:
1. Consulte o arquivo `TROUBLESHOOTING.md` para diagnóstico detalhado
2. Use a página `/debug` para identificar o problema
3. Verifique os logs no Supabase Dashboard → Logs
