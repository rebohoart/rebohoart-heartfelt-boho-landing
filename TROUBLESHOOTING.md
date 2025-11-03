# Troubleshooting - Produtos não aparecem e problemas no Backoffice

## Problema Reportado

1. **Os produtos não estão a aparecer no site**
2. **Não consigo alterar coisas no backoffice**

## Diagnóstico e Soluções

### 1. Página de Debug

Foi criada uma página especial de debug para ajudar a diagnosticar problemas: **http://localhost:8080/debug**

Esta página mostra:
- ✅ Estado da autenticação (se está logado e se é admin)
- 📦 Número de produtos na base de dados
- 🔍 Lista detalhada de todos os produtos
- ⚙️ Estado das variáveis de ambiente
- 🆕 Botão para inserir produtos de teste (apenas para admins)

**Como usar:**
1. Inicie o servidor: `npm run dev`
2. Abra o navegador em: http://localhost:8080/debug
3. Verifique as informações apresentadas

### 2. Causas Comuns e Soluções

#### Causa 1: Nenhum produto na base de dados

**Sintoma:** A página de debug mostra "0 Total de produtos"

**Solução:**
1. Aceda a http://localhost:8080/auth e faça login como admin
2. Depois aceda a http://localhost:8080/debug
3. Clique no botão "Inserir Produtos de Teste"
4. Os produtos serão adicionados automaticamente

**Alternativa (via Supabase Dashboard):**
1. Aceda ao Supabase Dashboard
2. Vá a SQL Editor
3. Execute a migração: `supabase/migrations/20251103200000_ensure_test_products.sql`

#### Causa 2: Produtos existem mas estão inativos

**Sintoma:** A página de debug mostra produtos mas "0 Produtos ativos"

**Solução via Backoffice:**
1. Faça login como admin: http://localhost:8080/auth
2. Aceda ao backoffice: http://localhost:8080/backoffice
3. Clique no botão de switch ao lado de cada produto para ativá-los

**Solução via SQL (Supabase Dashboard):**
```sql
UPDATE products SET active = true WHERE active = false;
```

#### Causa 3: Não é administrador

**Sintoma:** Não consegue editar produtos no backoffice

**Problema:** O seu utilizador não tem permissões de administrador. Apenas utilizadores com role 'admin' podem:
- Criar novos produtos
- Editar produtos existentes
- Eliminar produtos
- Ativar/desativar produtos

**Solução:**
1. Aceda ao Supabase Dashboard
2. Vá a SQL Editor
3. Execute o seguinte comando (substitua `seu-email@exemplo.com` pelo seu email):

```sql
-- Primeiro, encontre o ID do seu utilizador
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- Depois, atribua a role de admin (substitua USER_ID pelo ID retornado acima)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

#### Causa 4: Problemas de conectividade com Supabase

**Sintoma:** Erros de "fetch failed" ou "connection refused"

**Verificação:**
1. Confirme que o ficheiro `.env` existe e contém:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Verifique na página de debug se as variáveis estão configuradas
3. Teste a conectividade abrindo a página de debug no navegador

**Solução:**
- Se as variáveis não estiverem configuradas, copie-as do Supabase Dashboard
- Reinicie o servidor de desenvolvimento após alterar o `.env`

### 3. Políticas RLS (Row Level Security)

As seguintes políticas RLS estão configuradas:

**Produtos (products table):**
- ✅ **SELECT (ler):** Qualquer pessoa pode ver produtos
- 🔒 **INSERT (criar):** Apenas admins
- 🔒 **UPDATE (editar):** Apenas admins
- 🔒 **DELETE (eliminar):** Apenas admins

**Se não consegue editar produtos:**
1. Verifique se está autenticado
2. Verifique se é admin (na página de debug)
3. Se não for admin, siga as instruções da "Causa 3" acima

### 4. Estrutura da Tabela Products

A tabela de produtos deve ter as seguintes colunas:
- `id` (UUID, chave primária)
- `title` (TEXT)
- `description` (TEXT)
- `image` (TEXT) - URL ou nome do ficheiro da imagem principal
- `images` (TEXT[]) - Array de URLs/nomes de ficheiros
- `price` (NUMERIC)
- `category` (TEXT)
- `active` (BOOLEAN) - Define se o produto aparece no site
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 5. Ferramentas de Debug Criadas

#### 5.1. Página de Debug Frontend
- **Caminho:** `/debug` (http://localhost:8080/debug)
- **Ficheiro:** `src/pages/Debug.tsx`
- **Funcionalidades:**
  - Mostra estado da autenticação
  - Lista todos os produtos
  - Permite inserir produtos de teste (apenas admins)
  - Mostra configuração do Supabase

#### 5.2. Script de Verificação
- **Ficheiro:** `scripts/check-products.ts`
- **Como executar:** `npx tsx scripts/check-products.ts`
- **Nota:** Requer acesso à rede para conectar ao Supabase

#### 5.3. Migração de Produtos de Teste
- **Ficheiro:** `supabase/migrations/20251103200000_ensure_test_products.sql`
- **Como aplicar:**
  ```bash
  # Via CLI do Supabase (se tiver instalado)
  supabase migration up

  # Via Dashboard
  # Copie e cole o conteúdo do ficheiro no SQL Editor
  ```

### 6. Checklist de Resolução de Problemas

Use este checklist quando os produtos não aparecerem:

- [ ] 1. Servidor de desenvolvimento está a correr (`npm run dev`)
- [ ] 2. Abrir http://localhost:8080/debug no navegador
- [ ] 3. Verificar se o Supabase está configurado (variáveis de ambiente)
- [ ] 4. Verificar quantos produtos existem na base de dados
- [ ] 5. Se 0 produtos → Fazer login como admin → Inserir produtos de teste
- [ ] 6. Se produtos existem mas 0 ativos → Ativar produtos no backoffice
- [ ] 7. Verificar se o utilizador é admin (necessário para editar)
- [ ] 8. Se não for admin → Atribuir role de admin via SQL (ver secção "Causa 3")
- [ ] 9. Atualizar a página principal e verificar se os produtos aparecem
- [ ] 10. Testar edição de produtos no backoffice

### 7. Suporte Adicional

Se os problemas persistirem após seguir este guia:

1. **Verifique a consola do navegador** (F12) para erros JavaScript
2. **Verifique a consola do Supabase** para erros de políticas RLS
3. **Capture screenshots da página de debug** para análise

### 8. Próximos Passos Após Resolver

Depois de resolver os problemas de produtos:

1. **Adicione imagens reais:**
   - Faça upload de imagens no backoffice
   - As imagens são guardadas no Supabase Storage

2. **Configure produtos personalizados:**
   - Edite títulos, descrições e preços
   - Organize por categorias
   - Ative/desative conforme necessário

3. **Gerencie pedidos:**
   - Aceda ao backoffice para ver pedidos de clientes
   - Os pedidos custom também aparecem no backoffice

4. **Remova a página de debug (opcional):**
   - Quando tudo estiver a funcionar, pode remover `/debug` do `App.tsx`
   - Ou deixe-a para troubleshooting futuro
