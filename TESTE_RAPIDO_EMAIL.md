# 🚀 TESTE RÁPIDO DE EMAIL - Ver Erro Exato

**Problema**: Emails não funcionam e não consegues ver logs no Supabase
**Solução**: Usar teste direto no browser para ver o erro exato

---

## 🎯 MÉTODO 1: Teste HTML Direto (MAIS FÁCIL)

Criei um ficheiro de teste que mostra o erro exato no browser.

### Passo 1: Abrir o Teste

1. Abre o ficheiro: `test-email.html` no teu browser
2. Ou copia este caminho e cola na barra de endereços:
   ```
   file:///home/user/rebohoart-heartfelt-boho-landing/test-email.html
   ```

### Passo 2: Preencher os Dados

**Supabase URL:** (já está preenchido)
```
https://gyvtgzdkuhypteiyhtaq.supabase.co
```

**Supabase Anon Key:** (cola esta key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZnFsanJiZ295bXd3dnl5dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQwNDEsImV4cCI6MjA3NzM0MDA0MX0.Rqv7g7DTvhiDqtoWh6H6mVsc7U4jo-MS67SW2HuCf18
```

**Nome do Cliente:** (qualquer nome de teste)
```
Teste Cliente
```

**Email do Cliente:** (usa o teu email para receber o teste)
```
catarinarebocho30@gmail.com
```

### Passo 3: Enviar e Ver o Erro

1. Clica no botão **"🚀 Enviar Teste de Email"**
2. **Abre o Console do Browser** (F12 ou Ctrl+Shift+I)
3. Vê o erro que aparece (tanto na página como no console)

### Passo 4: Interpretar o Erro

**Se aparecer "Missing environment variables":**
```
❌ Problema: Os secrets não estão configurados no Supabase
✅ Solução:
   1. Vá para: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
   2. Clique em "Manage secrets"
   3. Adicione os 3 secrets (ver abaixo)
```

**Se aparecer "Invalid credentials" ou "Authentication failed":**
```
❌ Problema: App Password do Gmail incorreta
✅ Solução:
   1. Gera uma NOVA App Password: https://myaccount.google.com/apppasswords
   2. Copia a password (16 caracteres, sem espaços)
   3. Atualiza o secret GMAIL_APP_PASSWORD no Supabase
```

**Se aparecer "Function not found" ou erro 404:**
```
❌ Problema: Edge Function não foi deployada
✅ Solução:
   1. Vá para: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
   2. Clique em "Create function" (se não existir)
   3. Nome: send-order-email
   4. DESMARQUE "Verify JWT"
   5. Cole o código de: supabase/functions/send-order-email/index.ts
   6. Clique em "Deploy"
```

**Se aparecer erro 500:**
```
❌ Problema: Erro interno da função (provavelmente secrets incorretos)
✅ Solução:
   1. Verifique os secrets no Supabase
   2. GMAIL_USER deve ter o email COMPLETO (com @gmail.com)
   3. GMAIL_APP_PASSWORD deve ter 16 caracteres, SEM espaços
   4. Gere uma nova App Password se necessário
```

---

## 🎯 MÉTODO 2: Console do Browser no Site Real

Se preferires testar no site real:

### Passo 1: Abrir o Site e Console

1. Abre o teu site: `http://localhost:8080`
2. Abre o Console do Browser: **F12** ou **Ctrl+Shift+I** (Windows/Linux) ou **Cmd+Option+I** (Mac)
3. Vai para o tab **"Console"**

### Passo 2: Fazer uma Encomenda

1. Adiciona um produto ao carrinho
2. Clica no ícone do carrinho
3. Preenche o formulário:
   - Nome: `Teste`
   - Email: `catarinarebocho30@gmail.com`
4. Clica em "Finalizar Encomenda"

### Passo 3: Ver o Erro no Console

No console do browser, vais ver mensagens como:

```
Checkout form error: Error: Failed to send email
Function invocation error: {...}
```

**Copia o erro completo e manda-me** para eu poder ajudar melhor.

---

## 🔧 SECRETS NECESSÁRIOS NO SUPABASE

Se o erro for "Missing environment variables", precisa adicionar estes secrets:

**Link direto:** https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions

### Secret #1: GMAIL_USER
```
Name: GMAIL_USER
Value: catarinarebocho30@gmail.com
```

### Secret #2: GMAIL_APP_PASSWORD
```
Name: GMAIL_APP_PASSWORD
Value: [a tua App Password de 16 caracteres]
```

**Como obter a App Password:**
1. Vá para: https://myaccount.google.com/apppasswords
2. App: Mail
3. Device: Other → "ReBoho Supabase"
4. Copie a password (16 caracteres, sem espaços)

### Secret #3: STORE_EMAIL (opcional)
```
Name: STORE_EMAIL
Value: catarinarebocho30@gmail.com
```

---

## 🆘 VERIFICAÇÃO RÁPIDA

Antes de testar, confirma:

### ✅ Checklist de Configuração:

- [ ] **Verificação em 2 etapas ativa** no Google
  - Link: https://myaccount.google.com/security

- [ ] **App Password criada** (16 caracteres)
  - Link: https://myaccount.google.com/apppasswords

- [ ] **3 Secrets adicionados** no Supabase
  - Link: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
  - Secrets: GMAIL_USER, GMAIL_APP_PASSWORD, STORE_EMAIL

- [ ] **Edge Function deployada**
  - Link: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
  - Nome: `send-order-email`
  - Verify JWT: DESMARCADO ❌

---

## 📞 O QUE FAZER DEPOIS DO TESTE

Depois de fazer o teste e ver o erro:

### Se o teste funcionar ✅
```
Ótimo! O problema está resolvido.
Testa agora no site real para confirmar.
```

### Se aparecer erro específico ❌
```
1. Copia a mensagem de erro COMPLETA
2. Copia também o que aparece no console do browser
3. Verifica a secção "Passo 4: Interpretar o Erro" acima
4. Segue a solução para o teu erro específico
```

### Se não conseguires resolver ❌
```
Manda-me:
1. Screenshot do erro no test-email.html
2. Screenshot do console do browser (F12)
3. Confirmação de que os 3 secrets estão no Supabase
4. Screenshot da lista de Edge Functions (esconde dados sensíveis)
```

---

## 🎯 RESUMO ULTRA-RÁPIDO

```bash
# 1. Abrir o teste
Abre: test-email.html no browser

# 2. Preencher
- URL: https://gyvtgzdkuhypteiyhtaq.supabase.co
- Key: [cola a Anon Key do ficheiro .env]
- Nome: Teste
- Email: catarinarebocho30@gmail.com

# 3. Enviar e ver erro
- Clica "Enviar Teste"
- Abre Console (F12)
- Lê o erro que aparece

# 4. Resolver
- Se "Missing env vars" → Adiciona secrets no Supabase
- Se "Invalid credentials" → Gera nova App Password
- Se "Function not found" → Faz deploy da função
- Se erro 500 → Verifica se secrets estão corretos
```

---

## 📚 Links Úteis

- **Test Email HTML**: `file:///home/user/rebohoart-heartfelt-boho-landing/test-email.html`
- **Supabase Functions**: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **Gmail Security**: https://myaccount.google.com/security
- **Guia Completo (PT)**: DIAGNOSTICO_EMAIL_AGORA.md
- **Complete Guide (EN)**: EMAIL_DEBUG_NOW.md

---

**Data**: 2025-10-31
**Versão**: 1.0.0 - Teste Direto
