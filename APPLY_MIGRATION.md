# Como Aplicar a Migração da Tabela site_settings

## Problema
O erro ocorre porque a tabela `site_settings` não existe na base de dados do Supabase.

```
Could not find the table 'public.site_settings' in the schema cache
```

## Solução

Siga estes passos para aplicar a migração:

### Opção 1: Usar o Supabase Dashboard (Recomendado)

1. Aceda ao [Supabase Dashboard](https://app.supabase.com)
2. Selecione o seu projeto **Rebohoart**
3. No menu lateral esquerdo, clique em **SQL Editor**
4. Clique em **+ New Query**
5. Copie todo o conteúdo do ficheiro `supabase/migrations/20251106000002_apply_site_settings_table.sql`
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
2. Procure a tabela `site_settings`
3. Deve ver a tabela com as colunas: `id`, `key`, `value`, `created_at`, `updated_at`
4. Deve existir uma linha com `key = 'logo_url'`

## Testar a Funcionalidade

1. Aceda ao backoffice do site: `/backoffice`
2. Vá ao separador **Configurações**
3. Tente fazer upload de um logo
4. O upload deve funcionar sem erros 404

## Notas Técnicas

A migração cria:
- ✅ Tabela `site_settings` com schema completo
- ✅ Row Level Security (RLS) ativado
- ✅ Políticas de acesso para admins (insert, update, delete)
- ✅ Política de leitura pública (select)
- ✅ Trigger para atualização automática de `updated_at`
- ✅ Entrada padrão para `logo_url`

## Troubleshooting

**Erro de permissões ao executar:**
- Certifique-se de que está autenticado como proprietário do projeto no Supabase

**Erro "function update_updated_at_column() does not exist":**
- A migração agora cria a função automaticamente

**Erro ao fazer upload do logo após aplicar a migração:**
- Verifique se está autenticado como administrador no site
- Verifique se a tabela `user_roles` existe e tem o seu utilizador como admin
