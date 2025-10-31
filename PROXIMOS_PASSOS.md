# 🎯 PRÓXIMOS PASSOS - Projeto Supabase Correto Configurado!

## ✅ O QUE FOI FEITO

Atualizei **20 ficheiros** com o ID correto do teu projeto Supabase:

**ID antigo (errado):** `jjfqljrbgoymwwvyyvam`
**ID novo (correto):** `gyvtgzdkuhypteiyhtaq` ✅

### Ficheiros Atualizados:
- ✅ `.env` - Variáveis de ambiente
- ✅ `supabase/config.toml` - Configuração do Supabase
- ✅ Todos os guias .md (17 ficheiros)
- ✅ Ambos os testes HTML

**Agora todos os links e configurações apontam para o teu projeto correto!**

---

## 🚀 AGORA PODES FAZER

### 1️⃣ Aceder às Edge Functions

**Link direto (agora funciona!):**
👉 https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions

### 2️⃣ Ver/Criar a Função `send-order-email`

Quando abrires o link acima:
- Se a função `send-order-email` **existe**: Clica nela
- Se **não existe**: Clica em **"New function"** → Nome: `send-order-email`

### 3️⃣ Fazer Deploy da Edge Function

#### Opção A: Via Dashboard

1. Clica na função `send-order-email` (ou cria se não existir)
2. Copia **TODO** o código de: `supabase/functions/send-order-email/index.ts`
3. Cola no editor do Supabase
4. **DESMARCA** "Verify JWT" ❌
5. Clica em **"Deploy"**

#### Opção B: Via CLI

```bash
cd /home/user/rebohoart-heartfelt-boho-landing
supabase login
supabase link --project-ref gyvtgzdkuhypteiyhtaq
supabase functions deploy send-order-email --no-verify-jwt
```

### 4️⃣ Configurar os Secrets

**Link direto:**
👉 https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions

Clica em **"Manage secrets"** e adiciona:

**Secret #1:**
```
Name: GMAIL_USER
Value: catarinarebocho30@gmail.com
```

**Secret #2:**
```
Name: GMAIL_APP_PASSWORD
Value: [a tua App Password de 16 caracteres]
```

**Como obter App Password:**
1. Vai a: https://myaccount.google.com/apppasswords
2. App: **Mail**
3. Device: **Other** → "ReBoho Supabase"
4. Gera e copia (16 caracteres, sem espaços)

**Secret #3:**
```
Name: STORE_EMAIL
Value: catarinarebocho30@gmail.com
```

### 5️⃣ Testar com a Ferramenta de Debug

1. Abre: `test-email-debug.html` no browser
2. Os campos já estão pré-preenchidos com o projeto correto
3. Clica em **"🚀 Enviar Teste com Debug Completo"**
4. Vê os logs detalhados

**Agora vais ver uma resposta como:**
```json
{
  "success": true,
  "message": "Email processing completed",
  "details": {
    "storeEmail": {
      "sent": true,
      "recipient": "catarinarebocho30@gmail.com",
      "error": null
    },
    "customerEmail": {
      "sent": true,
      "recipient": "teste@example.com",
      "error": null
    }
  },
  "debug": [
    "=== EMAIL SENDING START ===",
    "Request type: cart",
    "=== ENVIRONMENT VARIABLES CHECK ===",
    "GMAIL_USER present: true",
    "✓ Email sent successfully to store",
    "✓ Email sent successfully to customer"
  ]
}
```

---

## 🔗 LINKS ÚTEIS (Projeto Correto)

### Dashboard e Functions:
- **Dashboard Principal:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq
- **Edge Functions:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
- **Manage Secrets:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions (clica em "Manage secrets")
- **API Settings:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/settings/api

### Gmail Configuration:
- **App Passwords:** https://myaccount.google.com/apppasswords
- **2-Step Verification:** https://myaccount.google.com/security

### Testing:
- **Test Email (Basic):** Abre `test-email.html` no browser
- **Test Email (Debug):** Abre `test-email-debug.html` no browser

---

## 📋 CHECKLIST RÁPIDA

- [ ] Abri: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
- [ ] Vi ou criei a função `send-order-email`
- [ ] Copiei o código de `supabase/functions/send-order-email/index.ts`
- [ ] Colei no editor do Supabase
- [ ] **Desmarquei "Verify JWT"** ❌
- [ ] Fiz deploy (cliquei "Deploy")
- [ ] Configurei os 3 secrets (GMAIL_USER, GMAIL_APP_PASSWORD, STORE_EMAIL)
- [ ] Testei com `test-email-debug.html`
- [ ] Vi resposta com `details` e `debug` ✅

---

## 🎯 SE TUDO CORRER BEM

Depois de seguir todos os passos acima:
1. ✅ Vais ver logs completos no teste
2. ✅ Vais saber exatamente se os emails foram enviados
3. ✅ Se houver erro, vais ver qual é e como resolver

**Se aparecer algum erro específico nos logs, manda-me!** Com os logs completos vou conseguir resolver qualquer problema! 🚀

---

## 🆘 SE PRECISARES DE AJUDA

**Guias disponíveis:**
- `GUIA_DEPLOY_DEFINITIVO.md` - Deploy passo a passo
- `DIAGNOSTICO_EMAIL_AGORA.md` - Diagnóstico completo
- `RESOLVER_VERIFY_JWT.md` - Problema de "Verify JWT"
- `TESTE_RAPIDO_EMAIL.md` - Como usar os testes

**Ou simplesmente:**
Faz o teste e manda-me os logs completos que aparecem quando clicar em "Ver Logs de Debug"!

---

**Data:** 2025-10-31
**Projeto Supabase:** gyvtgzdkuhypteiyhtaq ✅
**Status:** Tudo atualizado e pronto para deploy! 🚀
