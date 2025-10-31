# Configuracao de Emails com Gmail SMTP

Este guia explica como configurar o envio de emails usando sua conta Gmail diretamente, sem servicos externos como Resend.

---

## Passo 1: Criar App Password do Gmail

O Gmail requer uma "App Password" para permitir que aplicacoes externas enviem emails.

### Instrucoes:

1. **Aceda a sua conta Google:**
   - Va para: https://myaccount.google.com/

2. **Ative a Verificacao em 2 Etapas (se ainda nao tiver):**
   - Va para: https://myaccount.google.com/security
   - Clique em "Verificacao em 2 etapas"
   - Siga as instrucoes para ativar

3. **Crie uma App Password:**
   - Va para: https://myaccount.google.com/apppasswords
   - Selecione "Mail" como app
   - Selecione "Other" como dispositivo
   - Digite um nome: "ReBoho Supabase"
   - Clique em "Generate"
   - **COPIE A PASSWORD** (16 caracteres sem espacos)
   - Exemplo: `abcdabcdabcdabcd`

---

## Passo 2: Configurar Secrets no Supabase

Agora precisa adicionar 3 secrets na Edge Function do Supabase:

### Aceder aos Secrets:

1. Va para: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
2. Clique em **"Manage secrets"** ou **"Secrets"**

### Adicionar os Secrets:

**Secret 1: GMAIL_USER**
- Name: `GMAIL_USER`
- Value: `seu-email@gmail.com` (seu email completo do Gmail)

**Secret 2: GMAIL_APP_PASSWORD**
- Name: `GMAIL_APP_PASSWORD`
- Value: `abcdabcdabcdabcd` (a app password de 16 caracteres que copiou)

**Secret 3: STORE_EMAIL** (opcional)
- Name: `STORE_EMAIL`
- Value: `catarinarebocho30@gmail.com` (email que recebe as notificacoes)
- Se nao adicionar, usa o padrao: catarinarebocho30@gmail.com

---

## Passo 3: Fazer Deploy da Edge Function

### Opcao A: Via Dashboard (Manual)

1. Va para: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
2. Se a funcao `send-order-email` ja existe:
   - Clique nela
   - Clique em "Edit" ou "Code"
   - Copie o codigo do arquivo `supabase/functions/send-order-email/index.ts`
   - Cole no editor
   - Clique em "Deploy"

3. Se a funcao NAO existe:
   - Clique em "Create a new function"
   - Name: `send-order-email`
   - Desmarque "Verify JWT"
   - Cole o codigo
   - Clique em "Create" e depois "Deploy"

### Opcao B: Via CLI (Automatico)

Se tiver o Supabase CLI instalado:

```bash
supabase functions deploy send-order-email --project-ref gyvtgzdkuhypteiyhtaq
```

---

## Passo 4: Testar o Sistema

1. **Va para o seu site**
2. **Adicione um produto ao carrinho**
3. **Faca checkout**
4. **Verifique:**
   - Voce (loja) recebe email de notificacao
   - Cliente recebe email de confirmacao
   - Verifique tambem a pasta SPAM

---

## Troubleshooting

### Problema: "Invalid credentials"

**Causa:** App Password incorreta ou nao foi criada.

**Solucao:**
1. Verifique se a verificacao em 2 etapas esta ativa
2. Gere uma nova App Password
3. Atualize o secret `GMAIL_APP_PASSWORD` no Supabase
4. Copie a password SEM espacos

### Problema: "Authentication failed"

**Causa:** Email incorreto no secret `GMAIL_USER`.

**Solucao:**
1. Verifique se o email esta correto (completo, com @gmail.com)
2. Atualize o secret `GMAIL_USER`

### Problema: Emails nao chegam

**Causa:** Podem estar na pasta SPAM ou o Gmail bloqueou temporariamente.

**Solucao:**
1. Verifique a pasta SPAM
2. Verifique os logs da Edge Function no Supabase
3. O Gmail pode ter limite de envios por dia (geralmente 500 emails/dia)

### Problema: "Connection refused"

**Causa:** Porta SMTP bloqueada ou configuracao incorreta.

**Solucao:**
1. Verifique se os secrets estao configurados corretamente
2. Verifique os logs da Edge Function para detalhes do erro

---

## Limites do Gmail

- **500 emails por dia** (conta gratuita)
- **2000 emails por dia** (Google Workspace)

Se exceder o limite, o Gmail bloqueia temporariamente por 24 horas.

---

## Vantagens desta Solucao

✅ Usa sua conta Gmail existente
✅ Nao precisa de servicos externos (Resend, SendGrid, etc.)
✅ Gratuito ate 500 emails/dia
✅ Emails aparecem como enviados do seu email real
✅ Menos chance de ir para spam (dominio verificado do Gmail)

---

## Seguranca

⚠️ **IMPORTANTE:**
- NUNCA compartilhe sua App Password
- NUNCA commit a App Password no Git
- Use apenas secrets do Supabase para armazenar credenciais
- Se a App Password vazar, revogue-a imediatamente em: https://myaccount.google.com/apppasswords

---

## Resumo Rapido

1. ✅ Ativar verificacao em 2 etapas no Google
2. ✅ Criar App Password em https://myaccount.google.com/apppasswords
3. ✅ Adicionar 3 secrets no Supabase (GMAIL_USER, GMAIL_APP_PASSWORD, STORE_EMAIL)
4. ✅ Fazer deploy da Edge Function
5. ✅ Testar enviando uma encomenda

---

**Ultima atualizacao:** 2025-10-31
**Versao:** 2.0.0 (Gmail SMTP)
