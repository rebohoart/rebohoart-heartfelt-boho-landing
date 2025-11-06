# Como Aplicar a Migração da Tabela logos

## Objetivo

Esta migração cria uma nova tabela `logos` que permite armazenar múltiplos logos e escolher qual está ativo no site.

## Benefícios

- ✅ Armazenar múltiplos logos na galeria
- ✅ Escolher qual logo está ativo
- ✅ Eliminar logos não utilizados
- ✅ Garantir que apenas um logo está ativo por vez (via trigger)

## Solução

Siga estes passos para aplicar a migração:

### Opção 1: Usar o Supabase Dashboard (Recomendado)

1. Aceda ao [Supabase Dashboard](https://app.supabase.com)
2. Selecione o seu projeto **Rebohoart**
3. No menu lateral esquerdo, clique em **SQL Editor**
4. Clique em **+ New Query**
5. Copie todo o conteúdo do ficheiro `supabase/migrations/20251106000003_create_logos_table.sql`
6. Cole no editor SQL
7. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
8. Aguarde a confirmação de "Success"

### Opção 2: Usar o Supabase CLI

Se tiver o Supabase CLI instalado:

```bash
# Instalar o Supabase CLI (se necessário)
npm install -g supabase

# Autenticar
supabase login

# Aplicar a migração
supabase db push
```

## Verificação

Após aplicar a migração, pode verificar se funcionou:

1. No Supabase Dashboard, vá a **Table Editor**
2. Procure a tabela `logos`
3. Deve ver a tabela com as colunas: `id`, `url`, `is_active`, `created_at`

## Testar a Funcionalidade

1. Aceda ao backoffice do site: `/backoffice`
2. Vá ao separador **Configurações**
3. Na secção "Galeria de Logos":
   - Faça upload de um ou mais logos
   - Clique em "Ativar" no logo que deseja usar
   - Verifique que o badge "Ativo" aparece no logo selecionado
   - Recarregue a página principal e veja que o logo atualiza
4. Pode eliminar logos não utilizados (o logo ativo não pode ser eliminado)

## Notas Técnicas

A migração cria:
- ✅ Tabela `logos` com schema completo
- ✅ Row Level Security (RLS) ativado
- ✅ Políticas de acesso para utilizadores autenticados (CRUD completo)
- ✅ Política de leitura pública (select)
- ✅ Índice em `is_active` para queries rápidas
- ✅ Trigger `ensure_single_active_logo` - garante que apenas 1 logo está ativo

## Estrutura da Tabela

```sql
CREATE TABLE logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

## Como Funciona

1. **Upload**: Adiciona um novo logo à galeria (is_active = false por padrão)
2. **Ativar**: Marca um logo como ativo e automaticamente desativa todos os outros (via trigger)
3. **Eliminar**: Remove um logo da galeria (não pode eliminar o logo ativo)
4. **Exibição**: Os componentes Navigation e Hero buscam o logo com is_active = true

## Troubleshooting

**Erro de permissões ao executar:**
- Certifique-se de que está autenticado como proprietário do projeto no Supabase

**Erro ao fazer upload do logo:**
- Verifique se está autenticado como administrador no site
- Verifique se o bucket `product-images` existe no Storage

**Logo não atualiza no site:**
- Verifique se marcou o logo como ativo no backoffice
- Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)
- Verifique no Supabase Table Editor se existe um logo com is_active = true

## Migração de Logos Antigos (Opcional)

Se já tinha logos configurados via `site_settings`:

```sql
-- Migrar logo existente de site_settings para logos
INSERT INTO logos (url, is_active)
SELECT value, true
FROM site_settings
WHERE key = 'logo_url'
AND value IS NOT NULL
AND value != '';
```

Execute este SQL no SQL Editor do Supabase para importar o logo antigo.
