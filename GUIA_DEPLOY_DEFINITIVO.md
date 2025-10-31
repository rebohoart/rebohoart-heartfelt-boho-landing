# 🚀 GUIA DEFINITIVO - Deploy da Edge Function Nova

## ⚠️ PROBLEMA CONFIRMADO

**Resposta atual:**
```json
{ "success": true }
```

**Resposta esperada (versão nova):**
```json
{
  "success": true,
  "message": "Email processing completed",
  "details": { ... },
  "debug": [ ... ]
}
```

**CONCLUSÃO:** Ainda estás a usar a **versão ANTIGA** da Edge Function!

---

## 📋 DEPLOY CORRETO - SIGA EXATAMENTE

### Método 1: Via Dashboard (RECOMENDADO)

#### Passo 1: Abrir o Editor

1. Vai a: **https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions/send-order-email**
2. Vais ver a página da função `send-order-email`
3. Procura um botão **"Edit"** ou **"Code"** ou já vês o editor diretamente

#### Passo 2: Ver o Código Atual

**ANTES de copiar o novo, verifica o código atual:**

Se vês algo como isto no **FINAL** do ficheiro:
```typescript
return new Response(JSON.stringify({
  success: true,
  message: "Emails sent successfully"
}), {
```

❌ **Versão ANTIGA!** Precisa atualizar!

Se vês algo como isto no **FINAL**:
```typescript
return new Response(JSON.stringify({
  success: true,
  message: "Email processing completed",
  details: {
    storeEmail: {
```

✅ **Versão NOVA!** Já está correto (mas então há outro problema)

#### Passo 3: Copiar o Código NOVO

**No teu computador:**

1. Navega até: `/home/user/rebohoart-heartfelt-boho-landing/supabase/functions/send-order-email/`
2. Abre o ficheiro: `index.ts`
3. **SELECIONA TUDO** (Ctrl+A ou Cmd+A)
4. **COPIA** (Ctrl+C ou Cmd+C)

**Ou via terminal:**
```bash
# Ver as primeiras linhas para confirmar que é a versão certa
head -30 /home/user/rebohoart-heartfelt-boho-landing/supabase/functions/send-order-email/index.ts

# Deve mostrar:
# const debugLog: string[] = [];
# const log = (message: string) => {
```

Se vês `const debugLog` → ✅ Código correto!

#### Passo 4: Substituir no Supabase

No editor do Supabase:

1. **APAGA TODO** o código que lá está
   - Ctrl+A (selecionar tudo)
   - Delete (apagar)
2. **COLA** o código novo
   - Ctrl+V ou Cmd+V
3. Verifica que o código começa com:
   ```typescript
   import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
   import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

   const corsHeaders = {
   ```
4. E contém estas linhas no início:
   ```typescript
   const debugLog: string[] = [];
   const log = (message: string) => {
     console.log(message);
     debugLog.push(message);
   };
   ```

#### Passo 5: Configurar Opções

**MUITO IMPORTANTE:**

Antes de fazer deploy, procura a opção:
- **"Verify JWT"** → Deve estar **DESMARCADA** ❌
- Se não vês esta opção, pode estar nas "Settings" ou "Configuration"

Deve ficar:
```
[ ] Verify JWT
```
(caixa VAZIA, não selecionada)

#### Passo 6: Deploy

1. Procura o botão:
   - **"Deploy"** ou
   - **"Save & Deploy"** ou
   - **"Update"**
2. **CLICA** nele
3. **AGUARDA** a confirmação (10-30 segundos)
4. Deve aparecer: ✅ "Function deployed successfully" ou similar

#### Passo 7: Verificar Deploy

Depois do deploy, **REFRESCA a página** do editor e verifica:
- O código ainda tem `const debugLog` no início? ✅
- O código ainda tem `details: {` e `debug: debugLog` no final? ✅

---

### Método 2: Via CLI (se tens Supabase CLI instalado)

```bash
# 1. Ir para o diretório do projeto
cd /home/user/rebohoart-heartfelt-boho-landing

# 2. Verificar que o código local está correto
grep "const debugLog" supabase/functions/send-order-email/index.ts
# Deve aparecer: const debugLog: string[] = [];

# 3. Login (se ainda não fez)
supabase login

# 4. Link ao projeto (se ainda não fez)
supabase link --project-ref jjfqljrbgoymwwvyyvam

# 5. Deploy da função
supabase functions deploy send-order-email --no-verify-jwt

# 6. Aguardar confirmação
# Deve aparecer: Deployed Function send-order-email
```

---

## ✅ TESTAR SE DEPLOYOU CORRETAMENTE

### Teste 1: Via Browser

1. **REFRESCA** a página do `test-email-debug.html`
2. Clica em **"Enviar Teste"** novamente
3. **OLHA** para a secção "=== DADOS DA RESPOSTA ==="

**Se deployou corretamente, vais ver:**
```json
{
  "success": true,
  "message": "Email processing completed",
  "details": {
    "storeEmail": {
      "sent": true/false,
      "recipient": "catarinarebocho30@gmail.com",
      "error": null/"algum erro"
    },
    "customerEmail": {
      "sent": true/false,
      "recipient": "teste@example.com",
      "error": null/"algum erro"
    }
  },
  "debug": [
    "=== EMAIL SENDING START ===",
    "Request type: cart",
    "... muitas linhas de log ..."
  ]
}
```

**Se ainda aparecer só `{"success": true}`:**
❌ Deploy não funcionou ou não foi feito

### Teste 2: Via Supabase Dashboard

1. Vai a: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions/send-order-email
2. Procura um botão **"Test"** ou **"Run"**
3. Testa a função diretamente no dashboard
4. Vê se a resposta tem `details` e `debug`

---

## 🔍 VERIFICAÇÃO DO CÓDIGO

Para ter CERTEZA que tens a versão certa:

### No ficheiro local (`index.ts`), deve ter:

**Linha ~21-25:**
```typescript
const debugLog: string[] = [];
const log = (message: string) => {
  console.log(message);
  debugLog.push(message);
};
```

**Linha ~265-280 (perto do final):**
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
}), {
```

Se o teu código **TEM** estas partes → ✅ Versão correta!
Se **NÃO TEM** → ❌ Ficheiro errado ou precisa fazer git pull

---

## 🆘 SE O DEPLOY NÃO FUNCIONAR

### Problema: Não consigo encontrar o editor

**Solução:**
1. Vai a: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions
2. Clica na função `send-order-email` na lista
3. Procura por tabs: "Code", "Details", "Logs"
4. O editor deve estar no tab "Code" ou diretamente visível

### Problema: Não aparece botão "Deploy"

**Solução:**
- Pode estar no canto superior direito
- Ou no final da página
- Ou ao lado do editor
- Procura por: "Save", "Update", "Deploy", "Save & Deploy"

### Problema: Deploy dá erro

**Possíveis causas:**
1. **Erro de sintaxe** - Verifica se copiaste TODO o código
2. **Imports incorretos** - Verifica se as primeiras linhas estão corretas
3. **Timeout** - Aguarda mais tempo (até 1 minuto)

### Problema: Deploy completa mas resposta continua `{"success": true}`

**Solução:**
1. **REFRESCA** a página do Supabase Dashboard
2. Verifica se o código deployado tem `const debugLog`
3. Tenta fazer deploy novamente
4. Aguarda 1-2 minutos e testa novamente
5. Pode ser cache - limpa cache do browser (Ctrl+Shift+R)

---

## 📞 CHECKLIST FINAL

Antes de testar novamente, confirma:

- [ ] Abri: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions/send-order-email
- [ ] Vi o editor de código
- [ ] Apaguei TODO o código antigo
- [ ] Colei o código de: `supabase/functions/send-order-email/index.ts`
- [ ] Código tem `const debugLog` no início
- [ ] Código tem `details: {` e `debug: debugLog` no final
- [ ] **"Verify JWT" está DESMARCADO** ❌
- [ ] Cliquei em "Deploy" ou "Save"
- [ ] Aguardei mensagem de sucesso
- [ ] Refresquei a página do Supabase
- [ ] Refresquei a página do `test-email-debug.html`
- [ ] Testei novamente

---

## 🎯 DEPOIS DO DEPLOY CORRETO

Quando vires uma resposta com `details` e `debug`, **COPIA** todos os logs e manda-me!

Vou conseguir ver:
- ✅ Se os secrets estão configurados
- ✅ Se o Gmail User está correto
- ✅ Se o App Password tem 16 caracteres
- ✅ Qual o erro exato ao enviar o email
- ✅ Para onde o email está a ser enviado

**Aí sim vou resolver o problema de uma vez!** 🚀

---

**Data:** 2025-10-31
**Versão necessária:** Edge Function v2.0 com debug
**Ficheiro:** `supabase/functions/send-order-email/index.ts` (303 linhas)
**Característica principal:** Retorna objeto com `details` e `debug`
