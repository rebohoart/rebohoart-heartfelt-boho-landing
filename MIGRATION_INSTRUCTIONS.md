# Instruções para Aplicar a Migration

## ✅ Use esta versão da migration

Use o arquivo: `supabase/migrations/20251106000001_fix_products_and_auth_issues_v2.sql`

Esta versão foi otimizada para funcionar no SQL Editor do Supabase Dashboard.

## 📋 Passos para Aplicar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione o seu projeto
3. Vá para **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie **TODO** o conteúdo do arquivo `supabase/migrations/20251106000001_fix_products_and_auth_issues_v2.sql`
6. Cole no editor
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Verifique se a execução foi bem-sucedida (deve aparecer "Success" em verde)

### Opção 2: Via Supabase CLI

Se tiver o Supabase CLI instalado:

```bash
# Na raiz do projeto
supabase db push
```

## 🔍 Verificar se Funcionou

Após executar a migration, você pode verificar se funcionou executando esta query no SQL Editor:

```sql
-- Verificar políticas de produtos
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'products';

-- Verificar produtos ativos
SELECT id, title, active
FROM public.products;
```

Você deve ver:
- 4 políticas: `public_select_products`, `admin_insert_products`, `admin_update_products`, `admin_delete_products`
- Pelo menos 4 produtos com `active = true`

## ❓ Se Ainda Tiver Problemas

Se encontrar erros ao executar a migration, copie a mensagem de erro completa e me avise. Os erros mais comuns são:

1. **"policy already exists"** - Isso é ok, significa que a política já foi criada
2. **"function already exists"** - Também é ok, a função já existe
3. **"duplicate key value"** - Ok, significa que os produtos já existem

Esses "erros" são na verdade esperados se você já tentou executar uma migration similar antes.

## 🚀 Após Aplicar a Migration

1. Recarregue a página do site (Ctrl+F5 para limpar cache)
2. Abra as Developer Tools (F12)
3. Vá para a aba Console
4. Verifique se os produtos carregam com sucesso
5. Você deve ver mensagens como:
   - `🔍 Fetching products from Supabase...`
   - `✅ Products fetched successfully: 4 products`

## 📝 O que Esta Migration Faz

1. **Remove políticas RLS conflitantes** na tabela products
2. **Cria novas políticas limpas**:
   - Acesso público para visualizar produtos (não precisa login)
   - Apenas admins podem criar/editar/deletar produtos
3. **Atualiza a função has_role** para funcionar corretamente
4. **Garante que produtos existam** e estejam ativos no banco de dados
5. **Popula o array de imagens** para todos os produtos

Isso resolve os problemas recorrentes de produtos não carregarem!
