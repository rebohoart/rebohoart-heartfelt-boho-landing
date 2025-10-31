# 🚀 Deploy da Edge Function com Debug Melhorado

**Versão**: 2.0 - Com logging detalhado e informações de debug

---

## 🎯 O QUE MUDOU

Atualizei a Edge Function `send-order-email` para incluir:

- ✅ **Logging detalhado** de todas as operações
- ✅ **Validação de credenciais** (verifica formato do email e tamanho da App Password)
- ✅ **Resposta com detalhes** de sucesso/falha para cada email
- ✅ **Array de debug** com todos os logs para troubleshooting
- ✅ **Erros claros** quando algo falha

---

## 📋 PASSO A PASSO - FAZER DEPLOY

### Opção 1: Via Supabase Dashboard (RECOMENDADO)

#### Passo 1: Ir para Edge Functions

1. Abra: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions
2. Procure pela função `send-order-email`
3. Se existir, clique nela
4. Se NÃO existir, clique em **"New function"**

#### Passo 2: Copiar o Código

1. Abra o ficheiro local: `supabase/functions/send-order-email/index.ts`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)

#### Passo 3: Colar e Configurar

1. No editor do Supabase, **apague** todo o código existente
2. **Cole** o novo código
3. **IMPORTANTE**: Verifique se "Verify JWT" está **DESMARCADO** ❌
4. Clique em **"Deploy"** ou **"Save & Deploy"**

#### Passo 4: Aguardar Deploy

1. Aguarde a mensagem de sucesso (10-30 segundos)
2. Verá: ✅ "Function deployed successfully"

---

### Opção 2: Via Supabase CLI (para quem tem CLI instalado)

```bash
# 1. Certifique-se que está no diretório do projeto
cd /home/user/rebohoart-heartfelt-boho-landing

# 2. Login no Supabase (se ainda não fez)
supabase login

# 3. Link ao projeto (se ainda não fez)
supabase link --project-ref jjfqljrbgoymwwvyyvam

# 4. Deploy da função
supabase functions deploy send-order-email

# 5. Verificar se deployou com sucesso
supabase functions list
```

---

## ✅ TESTAR A NOVA VERSÃO

### Teste 1: Usando test-email.html

1. Abra: `test-email.html` no browser
2. Preencha os campos (já devem estar preenchidos)
3. Clique em **"🚀 Enviar Teste de Email"**
4. **AGORA** vais ver informações detalhadas:
   - ✅/❌ Se o email da loja foi enviado
   - ✅/❌ Se o email do cliente foi enviado
   - Para onde foram enviados
   - Erros específicos (se houver)
   - **Logs completos de debug** (clica em "Ver Logs de Debug")

### Teste 2: No Site Real

1. Vai ao site: `http://localhost:8080`
2. Adiciona um produto ao carrinho
3. Faz checkout
4. Abre o **Console do Browser** (F12)
5. Vê a resposta detalhada no console

---

## 🔍 INTERPRETAR OS RESULTADOS

### ✅ Sucesso Total

```json
{
  "success": true,
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
  }
}
```

**Significado**: Ambos os emails foram enviados! ✅
**Ação**: Verifica as caixas de entrada (e SPAM)

---

### ⚠️ Email da Loja Enviado, Cliente Falhou

```json
{
  "success": true,
  "details": {
    "storeEmail": {
      "sent": true,
      "recipient": "catarinarebocho30@gmail.com",
      "error": null
    },
    "customerEmail": {
      "sent": false,
      "recipient": "teste@example.com",
      "error": "Invalid email address"
    }
  }
}
```

**Significado**: Loja recebeu, mas email do cliente tem problema
**Ação**: Verifica se o email do cliente está correto

---

### ❌ Ambos Falharam

```json
{
  "success": false,
  "error": "Failed to send store email: Invalid credentials",
  "debug": [
    "=== EMAIL SENDING START ===",
    "Request type: cart",
    "=== ENVIRONMENT VARIABLES CHECK ===",
    "GMAIL_USER present: true",
    "GMAIL_USER value: catarinarebocho30@gmail.com",
    "GMAIL_APP_PASSWORD present: true",
    "GMAIL_APP_PASSWORD length: 16 chars",
    "WARNING: GMAIL_APP_PASSWORD length is 14, expected 16",
    "=== SMTP CLIENT CONFIGURATION ===",
    "=== SENDING EMAIL TO STORE ===",
    "✗ Failed to send email to store",
    "Error message: Invalid credentials"
  ]
}
```

**Significado**: Credenciais do Gmail estão erradas
**Ação**: Gera uma NOVA App Password e atualiza os secrets

---

## 🔧 RESOLVER PROBLEMAS COMUNS

### Problema: "Invalid credentials"

**Causa**: App Password incorreta

**Solução**:
1. Gera nova App Password: https://myaccount.google.com/apppasswords
2. Copia os 16 caracteres **SEM ESPAÇOS**
3. Atualiza o secret no Supabase:
   - Vai a: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions
   - Clica em "Manage secrets"
   - Edita `GMAIL_APP_PASSWORD`
   - Cola a nova password
   - Salva

---

### Problema: "GMAIL_APP_PASSWORD length is X, expected 16"

**Causa**: App Password foi copiada com espaços ou está incompleta

**Solução**:
1. A App Password tem **exatamente 16 caracteres**
2. Copia novamente **SEM espaços**: `abcdabcdabcdabcd`
3. Atualiza o secret no Supabase

---

### Problema: Emails não chegam mas não dá erro

**Possíveis causas**:
1. **Estão no SPAM** ← Mais provável!
2. Gmail está a bloquear silenciosamente
3. `STORE_EMAIL` está configurado para outro email

**Solução**:
1. Verifica **SPAM** em ambos os emails
2. Vê os logs de debug para confirmar:
   - Para onde os emails foram enviados
   - Se houve algum erro silencioso
3. Verifica o secret `STORE_EMAIL` no Supabase

---

### Problema: "Missing environment variables"

**Causa**: Secrets não estão configurados

**Solução**:
1. Vai a: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions
2. Clica em "Manage secrets"
3. Adiciona os 3 secrets:
   - `GMAIL_USER` = `catarinarebocho30@gmail.com`
   - `GMAIL_APP_PASSWORD` = `[16 caracteres]`
   - `STORE_EMAIL` = `catarinarebocho30@gmail.com`

---

## 📊 LOGS DE DEBUG

A nova versão inclui estes logs úteis:

```
=== EMAIL SENDING START ===
Request type: cart
Customer name: Teste Cliente
Customer email: teste@example.com

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
✓ Email sent successfully to store: catarinarebocho30@gmail.com

=== SENDING EMAIL TO CUSTOMER ===
From: catarinarebocho30@gmail.com
To: teste@example.com
Subject: Encomenda Recebida - ReBoho Art
✓ Email sent successfully to customer: teste@example.com

=== CLOSING SMTP CONNECTION ===
✓ SMTP connection closed

=== EMAIL SENDING COMPLETED ===
```

**Use estes logs** no `test-email.html` (clica em "Ver Logs de Debug") para identificar exatamente onde está a falhar.

---

## 🆘 AINDA NÃO FUNCIONA?

Depois de fazer o deploy e testar:

1. **Abre** o `test-email.html`
2. **Envia** um teste
3. **Clica** em "Ver Logs de Debug"
4. **Copia** todos os logs
5. **Manda-me** os logs completos

Com os logs vou conseguir ver **exatamente** o que está a falhar!

---

## ✅ CHECKLIST DE DEPLOYMENT

- [ ] Código atualizado copiado do ficheiro local
- [ ] Colado no editor do Supabase
- [ ] "Verify JWT" está **DESMARCADO**
- [ ] Clicou em "Deploy"
- [ ] Aguardou mensagem de sucesso
- [ ] Testou com `test-email.html`
- [ ] Viu os logs de debug
- [ ] Verificou se emails foram enviados (incluindo SPAM)

---

**Data**: 2025-10-31
**Versão Edge Function**: 2.0 - Enhanced Debug
**Ficheiro**: `supabase/functions/send-order-email/index.ts`
