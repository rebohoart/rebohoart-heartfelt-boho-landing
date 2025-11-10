# GitHub Actions Workflows

Este diretório contém os workflows do GitHub Actions para automação do projeto.

## Deploy Automático de Edge Functions do Supabase

O workflow `deploy-supabase-functions.yml` faz deploy automático das Edge Functions do Supabase sempre que houver mudanças na pasta `supabase/functions/` e o código for merged na branch principal (main/master).

### Configuração Necessária

Para o workflow funcionar, você precisa configurar os seguintes **GitHub Secrets**:

#### 1. SUPABASE_ACCESS_TOKEN

Este é o token de acesso pessoal do Supabase para autenticar o deploy.

**Como obter:**
1. Acesse https://supabase.com/dashboard/account/tokens
2. Clique em "Generate new token"
3. Dê um nome descritivo (ex: "GitHub Actions Deploy")
4. Copie o token gerado (você só verá ele uma vez!)

**Como configurar no GitHub:**
1. Vá para o repositório no GitHub
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Nome: `SUPABASE_ACCESS_TOKEN`
5. Value: Cole o token que você copiou
6. Clique em **Add secret**

#### 2. SUPABASE_PROJECT_ID

Este é o ID do seu projeto no Supabase.

**Valor:** `gyvtgzdkuhypteiyhtaq` (já está no config.toml)

**Como configurar no GitHub:**
1. Vá para o repositório no GitHub
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Nome: `SUPABASE_PROJECT_ID`
5. Value: `gyvtgzdkuhypteiyhtaq`
6. Clique em **Add secret**

### Como Funciona

O workflow é acionado automaticamente quando:
- Há um push para a branch `main` ou `master`
- As mudanças afetam arquivos em `supabase/functions/**`

Você também pode executar o workflow manualmente:
1. Vá para **Actions** no GitHub
2. Selecione "Deploy Supabase Edge Functions"
3. Clique em **Run workflow**

### O que o Workflow Faz

1. ✅ Faz checkout do código
2. ✅ Instala a Supabase CLI
3. ✅ Conecta ao projeto do Supabase
4. ✅ Faz deploy de todas as Edge Functions
5. ✅ Mostra um resumo do deployment

### Functions Deployadas

Atualmente, o workflow faz deploy de:
- `send-order-email` - Edge Function para envio de emails de pedidos

### Troubleshooting

**Erro de autenticação:**
- Verifique se o `SUPABASE_ACCESS_TOKEN` está configurado corretamente
- Certifique-se de que o token não expirou

**Erro de projeto não encontrado:**
- Verifique se o `SUPABASE_PROJECT_ID` está correto
- Confirme que você tem acesso ao projeto no Supabase

**Workflow não executa:**
- Confirme que as mudanças estão em `supabase/functions/`
- Verifique se você está fazendo push para `main` ou `master`
