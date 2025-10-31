# 🚀 DEPLOY URGENTE - Edge Function com Debug

## ⚠️ PROBLEMA IDENTIFICADO

A resposta `{"success": true}` **sem detalhes** significa que estás a usar a **versão antiga** da Edge Function!

Precisas fazer **deploy da versão nova** que tem os logs de debug.

---

## 📋 PASSO A PASSO - 5 MINUTOS

### Passo 1: Ir para Supabase Functions

**Link direto:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions

### Passo 2: Abrir a Função

- Se a função `send-order-email` **existe**: Clica nela
- Se **não existe**: Clica em "New function" → Nome: `send-order-email`

### Passo 3: Copiar o Código

**Localização do ficheiro:**
```
/home/user/rebohoart-heartfelt-boho-landing/supabase/functions/send-order-email/index.ts
```

**Como copiar:**

1. Abre o terminal/ficheiro no teu computador
2. Vai para: `supabase/functions/send-order-email/index.ts`
3. Seleciona **TODO** o conteúdo (Ctrl+A)
4. Copia (Ctrl+C)

**Ou copia daqui:**

O ficheiro tem **303 linhas**. Vou criar um comando para tu veres o ficheiro completo:

```bash
# No terminal, no diretório do projeto:
cat supabase/functions/send-order-email/index.ts
```

### Passo 4: Colar no Supabase

1. No editor do Supabase:
   - **Apaga** todo o código que lá está
   - **Cola** o código novo (Ctrl+V)

2. **MUITO IMPORTANTE:**
   - Procura a checkbox **"Verify JWT"**
   - **DESMARCA** essa opção ❌
   - Deve ficar: [ ] Verify JWT (não selecionado)

### Passo 5: Deploy

1. Clica no botão **"Deploy"** ou **"Save & Deploy"**
2. Aguarda a mensagem: ✅ "Function deployed successfully"
3. Deve demorar 10-30 segundos

---

## ✅ VERIFICAR SE DEPLOYOU CORRETAMENTE

Depois do deploy, testa novamente no `test-email.html`:

### Resposta Esperada (NOVA versão):

```json
{
  "success": true,
  "message": "Email processing completed",
  "details": {
    "storeEmail": {
      "sent": true/false,
      "recipient": "catarinarebocho30@gmail.com",
      "error": null
    },
    "customerEmail": {
      "sent": true/false,
      "recipient": "teste@example.com",
      "error": null
    }
  },
  "debug": [
    "=== EMAIL SENDING START ===",
    "Request type: cart",
    "Customer name: Teste Cliente",
    "=== ENVIRONMENT VARIABLES CHECK ===",
    "GMAIL_USER present: true",
    "..."
  ]
}
```

### Se ainda aparecer só `{"success": true}`:

❌ A versão antiga ainda está deployada. Repete o processo.

---

## 🔍 DIFERENÇAS ENTRE AS VERSÕES

### Versão ANTIGA (atual):
```json
{
  "success": true
}
```
- Sem detalhes
- Sem logs
- Não dá para debugar

### Versão NOVA (que precisas deployar):
```json
{
  "success": true,
  "message": "Email processing completed",
  "details": { ... },
  "debug": [ ... ]
}
```
- Com detalhes de cada email
- Com logs completos
- Mostra exatamente o que falhou

---

## 📝 CARACTERÍSTICAS DA VERSÃO NOVA

A nova versão tem estas linhas de código no início:

```typescript
const debugLog: string[] = [];
const log = (message: string) => {
  console.log(message);
  debugLog.push(message);
};
```

E no final retorna:

```typescript
return new Response(JSON.stringify({
  success: true,
  message: "Email processing completed",
  details: {
    storeEmail: {
      sent: storeEmailSuccess,
      recipient: storeEmail,
      error: storeEmailError ? String(storeEmailError) : null
    },
    customerEmail: {
      sent: customerEmailSuccess,
      recipient: customerEmail,
      error: customerEmailError ? String(customerEmailError) : null
    }
  },
  debug: debugLog
}), ...
```

Se o teu código **não tem** estas partes, é a versão antiga!

---

## 🆘 SE TIVERES DIFICULDADE

### Opção A: Usar o ficheiro local

1. Abre o Visual Studio Code (ou outro editor)
2. Navega até: `supabase/functions/send-order-email/index.ts`
3. Copia TODO o conteúdo (303 linhas)
4. Cola no Supabase Dashboard

### Opção B: Verificar o conteúdo

No terminal do projeto, executa:

```bash
# Ver as primeiras 30 linhas
head -30 supabase/functions/send-order-email/index.ts

# Deve aparecer:
# import { serve } from ...
# import { SMTPClient } from ...
# ...
# const debugLog: string[] = [];
# const log = (message: string) => {
#   console.log(message);
#   debugLog.push(message);
# };
```

Se aparecer `const debugLog` → Tens a versão certa! ✅
Se NÃO aparecer → Ficheiro errado ou versão antiga ❌

---

## 📞 APÓS O DEPLOY

1. Testa novamente no `test-email.html`
2. **Clica em "Ver Logs de Debug"**
3. Vais ver algo como:

```
=== EMAIL SENDING START ===
Request type: cart
Customer name: Teste Cliente
Customer email: catarinarebocho30@gmail.com
=== ENVIRONMENT VARIABLES CHECK ===
GMAIL_USER present: true
GMAIL_USER value: catarinarebocho30@gmail.com
GMAIL_APP_PASSWORD present: true
GMAIL_APP_PASSWORD length: 16 chars
STORE_EMAIL: catarinarebocho30@gmail.com
=== SMTP CLIENT CONFIGURATION ===
Hostname: smtp.gmail.com
Port: 465
TLS: true
Auth username: catarinarebocho30@gmail.com
SMTP client created successfully
=== SENDING EMAIL TO STORE ===
From: catarinarebocho30@gmail.com
To: catarinarebocho30@gmail.com
Subject: Nova Encomenda ReBoho
✓ Email sent successfully to store
```

**Com estes logs vou conseguir ver exatamente o que está a falhar!**

---

## ✅ CHECKLIST RÁPIDA

- [ ] Abri: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
- [ ] Cliquei em `send-order-email` (ou criei nova função)
- [ ] Copiei o código de `supabase/functions/send-order-email/index.ts`
- [ ] Colei no editor do Supabase
- [ ] **DESMARQUEI** "Verify JWT" ❌
- [ ] Cliquei em "Deploy"
- [ ] Aguardei mensagem de sucesso
- [ ] Testei novamente
- [ ] Agora vejo `"details"` e `"debug"` na resposta

---

**Faz o deploy e depois testa novamente! Vai aparecer tudo o que está a acontecer.** 🚀
