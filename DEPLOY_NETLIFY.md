# 🚀 Deploy para Produção via Netlify - Guia Completo

## 📌 Resumo

Este guia explica como fazer deploy das correções no Netlify e garantir que os produtos aparecem.

**Projeto Supabase:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq

---

## ✅ PASSO 1: Aplicar Migração no Supabase (CRÍTICO!)

**Antes de fazer deploy**, precisa garantir que os produtos existem na base de dados.

### Como aplicar:

1. **Aceda ao Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq
   ```

2. **Abra o SQL Editor:**
   - Menu lateral → **SQL Editor**
   - Clique em **"New Query"**

3. **Cole e execute este SQL:**

```sql
-- Esta migração insere produtos de teste se não existirem
DO $$
DECLARE
  product_count INTEGER;
BEGIN
  -- Conta produtos existentes
  SELECT COUNT(*) INTO product_count FROM public.products;

  RAISE NOTICE 'Produtos encontrados: %', product_count;

  -- Se não existirem produtos, insere produtos de teste
  IF product_count = 0 THEN
    RAISE NOTICE 'Inserindo produtos de teste...';

    INSERT INTO public.products (title, description, image, images, price, category, active) VALUES
      ('Macramé Wall Hanging', 'Handwoven cotton macramé with natural wood accent. Adds texture and warmth to any space.', 'product-macrame-wall.jpg', ARRAY['product-macrame-wall.jpg'], 45.00, 'Wall Art', true),
      ('Ceramic Planter Set', 'Hand-painted terracotta planters in earthy tones. Perfect for your favorite greenery.', 'product-ceramic-planter.jpg', ARRAY['product-ceramic-planter.jpg'], 38.00, 'Home Decor', true),
      ('Woven Storage Basket', 'Natural seagrass basket with organic patterns. Functional art for mindful living.', 'product-woven-basket.jpg', ARRAY['product-woven-basket.jpg'], 32.00, 'Storage', true),
      ('Abstract Canvas Art', 'Original painting on canvas featuring warm desert tones and organic shapes.', 'product-canvas-art.jpg', ARRAY['product-canvas-art.jpg'], 65.00, 'Wall Art', true);

    RAISE NOTICE '✅ 4 produtos inseridos com sucesso!';
  ELSE
    RAISE NOTICE 'Produtos já existem. A atualizar array de imagens...';

    -- Atualiza produtos existentes para garantir que têm o array de imagens
    UPDATE public.products
    SET images = ARRAY[image]
    WHERE images IS NULL OR images = ARRAY[]::TEXT[];

    RAISE NOTICE '✅ Produtos atualizados!';
  END IF;
END $$;
```

4. **Clique em "Run"** (ou pressione `Ctrl+Enter`)

5. **Verifique o resultado:**
   - Deve aparecer mensagens de sucesso no painel de saída
   - Se disser "4 produtos inseridos" → ✅ Perfeito!
   - Se disser "Produtos já existem" → ✅ Também está bem!

### Verificar produtos inseridos:

Execute esta query para confirmar:

```sql
SELECT
  id,
  title,
  category,
  price,
  active,
  array_length(images, 1) as num_images
FROM public.products
ORDER BY created_at;
```

Deve ver 4 produtos com `active = true` ✅

---

## ✅ PASSO 2: Deploy no Netlify

### Opção A - Deploy Automático (Recomendado)

Se o Netlify já está conectado ao repositório GitHub:

1. **Faça merge/push para a branch principal:**

   O código já está no branch:
   ```
   claude/fix-product-display-backend-011CUmcroakJv2smoCDimB7f
   ```

   **Criar Pull Request:**
   - Vá ao GitHub: https://github.com/rebohoart/rebohoart-heartfelt-boho-landing
   - Clique em "Compare & pull request"
   - Crie o PR e faça merge

2. **O Netlify fará deploy automaticamente** após o merge
   - Aguarde 2-5 minutos
   - Verifique o status no dashboard do Netlify

### Opção B - Deploy Manual via Netlify CLI

Se preferir fazer deploy manual:

```bash
# Instalar Netlify CLI (se ainda não tiver)
npm install -g netlify-cli

# Fazer login
netlify login

# Build do projeto
npm run build

# Deploy
netlify deploy --prod
```

### Opção C - Deploy via Netlify Dashboard

1. Aceda ao **Netlify Dashboard**: https://app.netlify.com
2. Selecione o site **rebohoart-heartfelt-boho-landing**
3. Vá a **"Deploys"** no menu
4. Clique em **"Trigger deploy"** → **"Deploy site"**
5. Aguarde o build completar (2-5 minutos)

---

## ✅ PASSO 3: Verificar Variáveis de Ambiente

**Importante:** O Netlify precisa das variáveis do Supabase!

1. **No Netlify Dashboard:**
   - Vá ao seu site
   - Menu lateral → **"Site configuration"** → **"Environment variables"**

2. **Verifique se existem estas variáveis:**
   - `VITE_SUPABASE_URL` = `https://gyvtgzdkuhypteiyhtaq.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Se não existirem, adicione:**
   - Clique em **"Add a variable"**
   - Adicione cada uma
   - Clique em **"Save"**

4. **Importante:** Após adicionar variáveis, precisa fazer **redeploy**:
   - Vá a "Deploys" → "Trigger deploy" → "Clear cache and deploy site"

---

## ✅ PASSO 4: Testar em Produção

### 4.1. Obter URL do site

No Netlify Dashboard, o URL estará visível (algo como `https://seu-site.netlify.app`)

### 4.2. Testar Página de Debug 🔍

**URL:** `https://seu-site.netlify.app/debug`

**O que deve ver:**
- ✅ Supabase URL: Configurado
- ✅ Supabase Key: Configurado
- ✅ Total de produtos: 4 (ou mais)
- ✅ Produtos ativos: 4 (ou mais)

**Se mostrar 0 produtos:**
- ❌ Volte ao PASSO 1 e execute a migração SQL
- Recarregue a página `/debug`

**Se mostrar erro "Failed to fetch":**
- ❌ As variáveis de ambiente não estão configuradas
- Volte ao PASSO 3

### 4.3. Testar Página Principal 🏠

**URL:** `https://seu-site.netlify.app`

**Deve ver:**
- ✅ Secção "Peças Disponíveis" com 4 produtos
- ✅ Imagens dos produtos (mesmo que sejam placeholders)
- ✅ Preços e botão "Adicionar"
- ✅ Consegue adicionar ao carrinho

**Se os produtos não aparecem:**
- Vá para `/debug` e verifique quantos produtos ativos existem
- Se 0 ativos → Vá ao backoffice e ative-os

### 4.4. Testar Backoffice 👨‍💼

#### Passo A - Criar conta Admin:

1. **Aceda a:** `https://seu-site.netlify.app/auth`
2. **Crie uma conta** (ou faça login se já tem)
3. **Anote o email** que usou

#### Passo B - Tornar-se Admin:

Depois de criar a conta, precisa atribuir permissões de admin:

1. **Vá ao Supabase Dashboard → SQL Editor**
2. **Execute para encontrar seu user ID:**
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';
   ```
3. **Copie o `id` retornado**
4. **Execute (substitua USER_ID pelo id copiado):**
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('USER_ID_AQUI', 'admin')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```
5. **Verifique que funcionou:**
   ```sql
   SELECT * FROM public.user_roles WHERE user_id = 'USER_ID_AQUI';
   ```

#### Passo C - Testar funcionalidades do Backoffice:

1. **Faça logout e login novamente** no site
2. **Aceda a:** `https://seu-site.netlify.app/backoffice`
3. **Teste:**
   - ✅ Ver lista de produtos
   - ✅ Editar um produto existente
   - ✅ Adicionar novo produto
   - ✅ Fazer upload de imagens
   - ✅ Ativar/desativar produtos (toggle switch)
   - ✅ Eliminar produto (teste com cuidado!)

---

## 🔧 Troubleshooting

### Problema 1: Produtos não aparecem no site

**Diagnóstico:**
1. Vá para `/debug`
2. Verifique "Total de produtos" e "Produtos ativos"

**Soluções:**
- **Se 0 produtos total** → Execute migração SQL (PASSO 1)
- **Se produtos existem mas 0 ativos** → Ative-os no backoffice
- **Se aparecer erro** → Verifique variáveis de ambiente (PASSO 3)

### Problema 2: Não consigo editar no backoffice

**Sintoma:** Botões de editar não funcionam ou dão erro

**Causa:** Não é admin

**Solução:**
1. Vá para `/debug`
2. Verifique "É Admin" → Se for ❌ Não
3. Execute SQL para atribuir role de admin (ver PASSO 4.4.B)
4. Faça logout e login novamente

### Problema 3: Erro "Failed to fetch" ou "Network error"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Netlify Dashboard → Site configuration → Environment variables
2. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Trigger deploy novamente: Deploys → Trigger deploy → Clear cache and deploy

### Problema 4: Build falha no Netlify

**Verifique os logs:**
1. Netlify Dashboard → Deploys → Último deploy
2. Clique em "Failed" para ver logs

**Causas comuns:**
- Erro de TypeScript → Verifique e corrija no código
- Dependências em falta → Execute `npm install` localmente
- Comando de build errado → Deve ser `npm run build`

### Problema 5: Deploy concluído mas mudanças não aparecem

**Solução:**
1. Limpe cache: Deploys → Trigger deploy → **Clear cache and deploy site**
2. Limpe cache do navegador: Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
3. Teste em modo anónimo/incógnito

### Problema 6: Imagens não aparecem

**Causa 1:** Bucket do Supabase Storage não está público

**Solução:**
1. Supabase Dashboard → Storage → `product-images`
2. Settings → Make public
3. Ou configure políticas RLS para permitir leitura pública

**Causa 2:** URLs das imagens estão incorretas

**Solução:**
1. No backoffice, faça upload de novas imagens
2. As URLs serão geradas automaticamente

---

## 📋 Checklist Final de Testes

Use este checklist após o deploy:

### Base de Dados:
- [ ] Migração SQL executada com sucesso
- [ ] 4+ produtos existem na tabela products
- [ ] Todos os produtos têm `active = true`
- [ ] Campo `images` está preenchido (array)

### Deploy:
- [ ] Build do Netlify concluído sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Site acessível pelo URL do Netlify

### Funcionalidades:
- [ ] Página `/debug` mostra produtos ativos ✅
- [ ] Página principal mostra produtos
- [ ] Carrinho funciona (adicionar/remover)
- [ ] Consegue fazer login/criar conta
- [ ] Conta tem permissões de admin
- [ ] Backoffice é acessível
- [ ] Consegue editar produtos no backoffice
- [ ] Upload de imagens funciona
- [ ] Consegue ativar/desativar produtos

---

## 🎉 Após Deploy Bem-Sucedido

1. **Personalize os produtos:**
   - Vá ao backoffice
   - Edite ou remova os produtos de teste
   - Adicione produtos reais com imagens próprias

2. **Configure domínio personalizado (opcional):**
   - Netlify Dashboard → Domain management
   - Add custom domain
   - Configure DNS conforme instruções

3. **Remova página /debug (opcional):**
   - Para produção, pode remover a rota `/debug`
   - Ou mantenha para troubleshooting futuro

4. **Configure backups automáticos:**
   - Supabase já faz backups automáticos
   - Verifique em: Dashboard → Database → Backups

---

## 🔗 Links Úteis

- **Supabase Dashboard:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq
- **Supabase SQL Editor:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/editor
- **Netlify Dashboard:** https://app.netlify.com
- **Repositório GitHub:** https://github.com/rebohoart/rebohoart-heartfelt-boho-landing
- **Troubleshooting Completo:** Ver arquivo `TROUBLESHOOTING.md`

---

## 🚨 Em caso de problemas graves

Se algo correr muito mal e precisar reverter:

### Rollback do código:
```bash
git revert HEAD
git push
```
O Netlify fará redeploy automaticamente da versão anterior.

### Rollback da base de dados:
```sql
-- Remover produtos de teste (se necessário)
DELETE FROM public.products
WHERE title IN ('Macramé Wall Hanging', 'Ceramic Planter Set', 'Woven Storage Basket', 'Abstract Canvas Art');
```

---

## 💡 Dicas Finais

1. **Sempre teste em `/debug` primeiro** - É a forma mais rápida de identificar problemas
2. **Use modo incógnito** ao testar - Evita problemas com cache
3. **Verifique os logs** - Tanto do Netlify como do Supabase
4. **Faça backups** antes de mudanças grandes na base de dados

---

**Precisa de ajuda?** Consulte o arquivo `TROUBLESHOOTING.md` para diagnóstico mais detalhado.
