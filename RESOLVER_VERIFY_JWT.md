# 🔧 Resolver Problema: Função funciona no Supabase mas não no HTML/Site

## 🎯 PROBLEMA IDENTIFICADO

✅ Função funciona quando testada **no Supabase Dashboard**
❌ Função NÃO funciona quando chamada do **HTML de teste** ou **site em produção**

**CAUSA MAIS PROVÁVEL:** A opção **"Verify JWT"** está **MARCADA** ✅

---

## ⚠️ O QUE É "Verify JWT"?

Quando **marcado** ✅:
- A função **exige autenticação**
- Só aceita requests de **utilizadores logados**
- **BLOQUEIA** requests anónimos (como do HTML de teste)
- O Supabase Dashboard consegue testar porque ele passa um token válido

Quando **desmarcado** ❌:
- A função **aceita requests anónimos**
- Qualquer pessoa pode chamar (perfeito para checkout público)
- HTML de teste e site funcionam normalmente

---

## 🚀 SOLUÇÃO (2 minutos)

### Passo 1: Abrir a Função

**Link direto:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions/send-order-email

Ou:
1. Vai a: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
2. Clica em **`send-order-email`**

### Passo 2: Procurar "Verify JWT"

Na página da função, procura:
- Uma checkbox/toggle com o texto **"Verify JWT"**
- Ou **"JWT Verification"**
- Ou **"Require Authentication"**

### Passo 3: DESMARCAR

Se estiver **marcado** ✅ → **DESMARCA** ❌

A opção deve ficar:
```
[ ] Verify JWT
```
(caixa vazia, não selecionada)

### Passo 4: Salvar

Clica em:
- **"Save"** ou
- **"Update"** ou
- **"Deploy"**

Aguarda confirmação (alguns segundos).

---

## ✅ TESTAR SE FUNCIONOU

### Teste 1: HTML de Teste Avançado

1. Abre o novo ficheiro: **`test-email-debug.html`**
2. Clica em **"🚀 Enviar Teste com Debug Completo"**
3. Vê os logs detalhados

**Se funcionou:**
- ✅ Vais ver: "Status: 200 OK"
- ✅ Vais ver: "Email da Loja: ✅ Enviado"
- ✅ Sem erros de CORS

**Se ainda não funciona:**
- ❌ Vais ver: "TypeError: Failed to fetch"
- ❌ Ou: "Status: 401 Unauthorized"
- ❌ Ou: "CORS error"

### Teste 2: Site Real

1. Vai ao site em produção
2. Adiciona produto ao carrinho
3. Faz checkout
4. Verifica se recebe email

---

## 🔍 VERIFICAR SE "Verify JWT" ESTÁ DESMARCADO

Não consegues ver a opção? Tenta:

### Via Settings da Função:

1. Vai a: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions/send-order-email
2. Procura por tabs/abas:
   - **"Settings"**
   - **"Configuration"**
   - **"Security"**
3. Dentro de Settings, procura:
   - **"JWT Verification"**
   - **"Verify JWT"**
   - **"Authentication"**

### Via Editor da Função:

Algumas versões do Supabase mostram esta opção:
1. No editor de código da função
2. No topo ou rodapé da página
3. Como uma checkbox antes de fazer deploy

---

## 🐛 OUTROS PROBLEMAS POSSÍVEIS

Se "Verify JWT" já está desmarcado mas ainda não funciona:

### Problema 2: Anon Key Incorreta

**Verificar:**
1. Vai a: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/settings/api
2. Copia a **"anon public"** key
3. Compara com a key no `test-email-debug.html`

**Key correta:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZnFsanJiZ295bXd3dnl5dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQwNDEsImV4cCI6MjA3NzM0MDA0MX0.Rqv7g7DTvhiDqtoWh6H6mVsc7U4jo-MS67SW2HuCf18
```

### Problema 3: CORS Configuration

Se aparecer erro de CORS mesmo com "Verify JWT" desmarcado:

**Verificar no código da função** (`supabase/functions/send-order-email/index.ts`):

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

Deve estar no início do ficheiro. Se não estiver, adiciona.

### Problema 4: URL Incorreta

**URL correta:**
```
https://gyvtgzdkuhypteiyhtaq.supabase.co/functions/v1/send-order-email
```

Verifica:
- Tem `/functions/v1/` (não `/functions/`)
- Nome da função está correto: `send-order-email`
- Não tem espaços ou caracteres especiais

---

## 📊 DIAGNÓSTICO COM O NOVO TESTE

Usa o **`test-email-debug.html`** para ver EXATAMENTE o que está a falhar:

### Cenário 1: Erro "Failed to fetch"
```
TypeError: Failed to fetch
⚠️ ERRO DE CORS OU REDE
Possíveis causas:
1. CORS bloqueado (Verify JWT marcado?)
```

**Solução:** DESMARCA "Verify JWT"

### Cenário 2: Erro 401 Unauthorized
```
Status: 401 Unauthorized
{
  "error": "JWT verification failed"
}
```

**Solução:** DESMARCA "Verify JWT"

### Cenário 3: Erro 404 Not Found
```
Status: 404 Not Found
```

**Solução:** Função não está deployada ou URL incorreta

### Cenário 4: Status 200 mas emails não enviados
```
Status: 200 OK
Email da Loja: ❌ Falhou
Email do Cliente: ❌ Falhou
```

**Solução:** Problema nos secrets (GMAIL_USER, GMAIL_APP_PASSWORD)

---

## ✅ CHECKLIST COMPLETA

- [ ] "Verify JWT" está **DESMARCADO** ❌
- [ ] Anon Key está correta
- [ ] URL da função está correta
- [ ] Função foi deployada com sucesso
- [ ] CORS headers estão no código
- [ ] Testei com `test-email-debug.html`
- [ ] Logs não mostram erro de CORS
- [ ] Status HTTP é 200

---

## 🆘 AINDA NÃO FUNCIONA?

1. **Abre** o `test-email-debug.html`
2. **Clica** em "Enviar Teste"
3. **Copia** TODOS os logs (botão direito → Selecionar tudo → Copiar)
4. **Manda-me** os logs completos

Com os logs vou ver **exatamente** qual é o problema!

---

## 📞 LINKS ÚTEIS

- **Supabase Functions:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
- **Função send-order-email:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions/send-order-email
- **API Settings (Anon Key):** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/settings/api
- **Teste HTML Debug:** `file:///home/user/rebohoart-heartfelt-boho-landing/test-email-debug.html`

---

**Data:** 2025-10-31
**Problema:** Função funciona no Supabase mas não em HTML/site
**Causa #1:** Verify JWT marcado (90% dos casos)
**Solução:** Desmarcar "Verify JWT" ❌
