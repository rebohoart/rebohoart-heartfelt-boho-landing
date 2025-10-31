# 🚨 DIAGNÓSTICO E SOLUÇÃO DE EMAILS - AGORA

**Data**: 2025-10-31
**Problema**: Emails não estão a ser enviados
**Sistema**: Gmail SMTP via Supabase Edge Function

---

## ✅ CHECKLIST RÁPIDA - SIGA ESTA ORDEM

### 1️⃣ VERIFICAR SE A APP PASSWORD DO GMAIL EXISTE

**O que fazer:**
1. Aceda: https://myaccount.google.com/apppasswords
2. Verifique se tem uma App Password criada para "ReBoho" ou similar
3. Se NÃO tiver, **PARE AQUI** e vá para [Passo 2: Criar App Password](#2️⃣-criar-app-password-do-gmail)

**Nota importante:**
- A App Password é DIFERENTE da sua password normal do Gmail
- Tem 16 caracteres sem espaços (ex: `abcdabcdabcdabcd`)
- Só funciona se tiver verificação em 2 etapas ativa

---

### 2️⃣ CRIAR APP PASSWORD DO GMAIL

**Passo 2.1: Ativar Verificação em 2 Etapas** (se ainda não tiver)

1. Vá para: https://myaccount.google.com/security
2. Procure "Verificação em 2 etapas"
3. Clique e siga as instruções para ativar
4. Aguarde alguns minutos após ativar

**Passo 2.2: Criar App Password**

1. Vá para: https://myaccount.google.com/apppasswords
2. Se pedir login, faça login novamente
3. Em "Select app": escolha **Mail**
4. Em "Select device": escolha **Other (Custom name)**
5. Digite: `ReBoho Supabase`
6. Clique em **Generate**
7. **COPIE A PASSWORD** que aparece (16 caracteres amarelos)
8. Guarde num local seguro (vai precisar no próximo passo)

**Exemplo de App Password:**
```
abcdabcdabcdabcd
```
(copie SEM espaços, tudo junto)

---

### 3️⃣ CONFIGURAR SECRETS NO SUPABASE

**Passo 3.1: Ir para Secrets**

1. Abra: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/settings/functions
2. Procure a secção **"Edge Function Secrets"** ou **"Secrets"**
3. Ou vá direto para: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions

**Passo 3.2: Adicionar ou Atualizar Secrets**

Adicione estes 3 secrets (ou atualize se já existirem):

**Secret #1:**
- Name: `GMAIL_USER`
- Value: `catarinarebocho30@gmail.com` (ou o seu email Gmail completo)

**Secret #2:**
- Name: `GMAIL_APP_PASSWORD`
- Value: `abcdabcdabcdabcd` (cole a App Password de 16 caracteres que copiou)
  ⚠️ **SEM ESPAÇOS!** Tudo junto!

**Secret #3:**
- Name: `STORE_EMAIL`
- Value: `catarinarebocho30@gmail.com` (email que recebe as notificações de encomendas)

**Passo 3.3: Salvar**

Clique em **Save** ou **Add** para cada secret.

---

### 4️⃣ VERIFICAR SE A EDGE FUNCTION ESTÁ DEPLOYADA

**Passo 4.1: Ver Funções**

1. Vá para: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
2. Procure a função `send-order-email`
3. Verifique o status:
   - ✅ **Deployed** - Bom! Vá para [Passo 5](#5️⃣-testar-emails)
   - ❌ **Not deployed** ou não existe - Continue abaixo

**Passo 4.2: Fazer Deploy da Função**

**Opção A: Via Dashboard (MAIS FÁCIL)**

1. Na lista de funções, clique em `send-order-email`
2. Se não existir, clique em **"Create function"**
   - Name: `send-order-email`
   - ⚠️ **DESMARQUE** "Verify JWT"
3. No editor, cole o código de: `/supabase/functions/send-order-email/index.ts`
4. Clique em **Deploy** ou **Save & Deploy**
5. Aguarde o deploy completar (aparece mensagem de sucesso)

**Opção B: Via CLI (para quem tem Supabase CLI instalado)**

```bash
cd /home/user/rebohoart-heartfelt-boho-landing
supabase functions deploy send-order-email --project-ref gyvtgzdkuhypteiyhtaq
```

---

### 5️⃣ TESTAR EMAILS

**Passo 5.1: Fazer Teste Real**

1. Abra o seu site no browser
2. Adicione um produto ao carrinho
3. Clique no ícone do carrinho
4. Preencha o formulário de checkout com:
   - Nome: `Teste`
   - Email: `seu-email-pessoal@gmail.com` (use um email seu para testar)
5. Clique em **"Finalizar Encomenda"**

**Passo 5.2: Verificar Resultado**

**Se funcionar:**
- ✅ Aparece mensagem: "Encomenda enviada com sucesso!"
- ✅ Recebe email na loja (STORE_EMAIL)
- ✅ Cliente recebe email de confirmação

**Se NÃO funcionar:**
- ❌ Aparece mensagem de erro
- Continue para [Passo 6: Ver Logs](#6️⃣-ver-logs-de-erro)

---

### 6️⃣ VER LOGS DE ERRO

**Passo 6.1: Aceder aos Logs**

1. Vá para: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions/send-order-email/logs
2. Ou: Functions → send-order-email → Logs
3. Ordene por **"Most recent"**

**Passo 6.2: Identificar o Erro**

Procure mensagens de erro. Os erros mais comuns são:

**❌ Erro: "Missing environment variables"**
- **Problema**: Os secrets não estão configurados
- **Solução**: Volte ao [Passo 3](#3️⃣-configurar-secrets-no-supabase) e adicione os secrets

**❌ Erro: "Invalid credentials" ou "Authentication failed"**
- **Problema**: App Password incorreta ou GMAIL_USER errado
- **Solução**:
  1. Verifique se `GMAIL_USER` tem o email completo: `seuemail@gmail.com`
  2. Verifique se `GMAIL_APP_PASSWORD` foi copiada corretamente (16 caracteres, sem espaços)
  3. Se necessário, gere uma NOVA App Password e atualize o secret

**❌ Erro: "Connection refused" ou "Timeout"**
- **Problema**: Problema de rede ou configuração SMTP
- **Solução**:
  1. Aguarde 5 minutos e tente novamente
  2. Verifique se a App Password ainda é válida
  3. Tente gerar uma nova App Password

**❌ Erro: "Function not found"**
- **Problema**: Edge Function não foi deployada
- **Solução**: Volte ao [Passo 4](#4️⃣-verificar-se-a-edge-function-está-deployada)

---

## 🔧 SOLUÇÕES PARA PROBLEMAS COMUNS

### Problema: Emails vão para SPAM

**Solução temporária:**
1. Verifique a pasta SPAM/Lixo
2. Marque o email como "Não é spam"
3. Adicione o remetente aos contactos

**Solução permanente:**
- O Gmail geralmente não vai para spam quando envia do próprio domínio Gmail
- Se continuar, considere usar um serviço como Resend ou SendGrid

---

### Problema: "Encomenda enviada com sucesso" mas não recebe email

**Causas possíveis:**

1. **Email está no SPAM**
   - Verifique a pasta SPAM

2. **STORE_EMAIL incorreto**
   - Verifique o secret `STORE_EMAIL` no Supabase
   - Confirme que o email existe e está acessível

3. **Gmail bloqueou temporariamente**
   - O Gmail tem limite de 500 emails por dia
   - Se exceder, aguarde 24h

**Como verificar:**
1. Vá para os logs da Edge Function
2. Procure por: `"✓ Email sent successfully"`
3. Se aparecer, o email foi enviado (verifique SPAM)
4. Se não aparecer, veja o erro nos logs

---

### Problema: Não consegue criar App Password

**Causa:** Verificação em 2 etapas não está ativa ou não foi propagada.

**Solução:**
1. Ative a verificação em 2 etapas: https://myaccount.google.com/security
2. Aguarde 10-15 minutos
3. Faça logout e login novamente no Google
4. Tente criar a App Password novamente

---

## 📋 RESUMO ULTRA-RÁPIDO

```
1. ✅ Criar App Password: https://myaccount.google.com/apppasswords
2. ✅ Copiar password de 16 caracteres
3. ✅ Ir para Supabase Secrets: Dashboard → Functions → Secrets
4. ✅ Adicionar 3 secrets:
   - GMAIL_USER = seu-email@gmail.com
   - GMAIL_APP_PASSWORD = abcdabcdabcdabcd (sem espaços)
   - STORE_EMAIL = catarinarebocho30@gmail.com
5. ✅ Deploy da Edge Function (se necessário)
6. ✅ Testar no site
7. ✅ Verificar logs se falhar
```

---

## 🆘 AINDA NÃO FUNCIONA?

Se seguiu TODOS os passos acima e ainda não funciona:

### Checklist Final:

- [ ] Verificação em 2 etapas está ATIVA no Google
- [ ] App Password foi criada (16 caracteres)
- [ ] App Password foi copiada SEM ESPAÇOS
- [ ] Os 3 secrets estão no Supabase (GMAIL_USER, GMAIL_APP_PASSWORD, STORE_EMAIL)
- [ ] GMAIL_USER tem o email COMPLETO (com @gmail.com)
- [ ] Edge Function `send-order-email` está DEPLOYED
- [ ] Esperou pelo menos 2-3 minutos após configurar os secrets
- [ ] Verificou os LOGS da Edge Function
- [ ] Verificou a pasta SPAM

### Se mesmo assim não funcionar:

1. **Verifique os logs em tempo real:**
   - Abra: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions/send-order-email/logs
   - Deixe a página aberta
   - Faça uma encomenda teste
   - Veja o erro exato que aparece nos logs

2. **Teste a App Password manualmente:**
   - Use uma ferramenta de teste SMTP online
   - Teste se consegue enviar email com as credenciais
   - Isso confirma se o problema é da App Password ou da Edge Function

3. **Gere uma NOVA App Password:**
   - Delete a App Password antiga
   - Crie uma nova
   - Atualize o secret no Supabase

---

## 📞 INFORMAÇÃO DE DEBUG

Se precisar de ajuda adicional, forneça estas informações:

1. **Screenshot dos Secrets** (esconda a password!)
2. **Screenshot dos Logs da Edge Function** (últimas 10 linhas)
3. **Mensagem de erro exata** que aparece no browser
4. **Confirmação:**
   - [ ] Verificação em 2 etapas está ativa? (Sim/Não)
   - [ ] App Password foi criada? (Sim/Não)
   - [ ] Secrets foram adicionados? (Sim/Não)
   - [ ] Edge Function está deployed? (Sim/Não)

---

**Última atualização:** 2025-10-31
**Versão:** 1.0.0 - Diagnóstico Completo
