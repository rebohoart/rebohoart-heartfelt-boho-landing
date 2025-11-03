# 🔧 Corrigir URL de Produção nos Emails de Recuperação

## 🚨 Problema

Quando recebe o email de recuperação de password em **produção**, o link aponta para `localhost` em vez da URL de produção.

## 🔍 Causa Raiz

A configuração do Supabase Dashboard está com a **"Site URL"** definida como `http://localhost:8080`, fazendo com que todos os emails gerados pelo Supabase (inclusive em produção) usem localhost nos links.

---

## ✅ Solução: Configurar URLs no Supabase Dashboard

### Passo 1: Descobrir a URL de Produção

Primeiro, precisa saber qual é a URL de produção do seu site. Exemplos comuns:
- Vercel: `https://rebohoart.vercel.app` ou domínio customizado
- Netlify: `https://rebohoart.netlify.app` ou domínio customizado
- Lovable: `https://seu-projeto.lovable.app`
- Domínio próprio: `https://rebohoart.com`

**Como descobrir:**
1. Abra o site em produção no browser
2. Copie a URL completa da barra de endereços
3. Exemplo: `https://rebohoart-heartfelt-boho-landing.lovable.app`

---

### Passo 2: Configurar Site URL no Supabase

1. Aceda ao **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione o projeto: **gyvtgzdkuhypteiyhtaq**
3. No menu lateral, vá para **Authentication** → **URL Configuration**

4. Na secção **"Site URL"**:
   - **Antes (problema)**: `http://localhost:8080`
   - **Depois (solução)**: `https://sua-url-de-producao.com`

   Exemplo:
   ```
   https://rebohoart-heartfelt-boho-landing.lovable.app
   ```

5. Clique em **"Save"**

---

### Passo 3: Adicionar Redirect URLs

Na mesma página **"URL Configuration"**, role até **"Redirect URLs"** e adicione **AMBAS** as URLs:

```
http://localhost:8080/auth
https://sua-url-de-producao.com/auth
```

Exemplo completo:
```
http://localhost:8080/auth
https://rebohoart-heartfelt-boho-landing.lovable.app/auth
```

**Por que adicionar as duas?**
- `localhost`: Para desenvolvimento local funcionar
- Produção: Para os emails em produção funcionarem

Clique em **"Save"**

---

### Passo 4: Testar em Produção

1. Aceda ao site em **produção** (não localhost)
2. Vá para `/auth`
3. Clique em "Esqueceu a password?"
4. Insira um email válido
5. Clique em "Enviar Email"
6. **Verifique o email recebido**
7. O link agora deve apontar para a URL de produção

---

## 🔄 Configuração Alternativa: Usar Variável de Ambiente

Se quiser que o código determine automaticamente a URL baseada no ambiente, o código atual já faz isso corretamente:

```typescript
const redirectUrl = `${window.location.origin}/auth`;
```

**Isto funciona se:**
- A "Site URL" no Supabase estiver vazia ou configurada corretamente
- As "Redirect URLs" incluírem todas as URLs possíveis

**Vantagem:**
- Funciona automaticamente em qualquer ambiente (dev, staging, produção)

**Desvantagem:**
- Precisa adicionar cada nova URL nas "Redirect URLs" do Supabase

---

## 📋 Checklist de Configuração

- [ ] Descobri a URL de produção do meu site
- [ ] Atualizei a "Site URL" no Supabase para a URL de produção
- [ ] Adicionei `http://localhost:8080/auth` nas "Redirect URLs"
- [ ] Adicionei `https://minha-url-producao.com/auth` nas "Redirect URLs"
- [ ] Salvei as configurações no Supabase
- [ ] Testei o fluxo de reset em produção
- [ ] O link no email agora aponta para produção (não localhost)

---

## 🎯 URLs Configuradas Corretamente

Após seguir os passos, deve ter:

### Site URL
```
https://rebohoart-heartfelt-boho-landing.lovable.app
```
(ou o seu domínio de produção)

### Redirect URLs
```
http://localhost:8080/auth
https://rebohoart-heartfelt-boho-landing.lovable.app/auth
```

### Template de Email
O template deve conter `{{ .ConfirmationURL }}` que será substituído automaticamente pela URL correta.

---

## ❓ FAQ

### Posso ter múltiplas URLs de produção?

Sim! Se tem staging, preview, e produção, adicione todas nas "Redirect URLs":

```
http://localhost:8080/auth
https://staging.rebohoart.com/auth
https://preview.rebohoart.com/auth
https://rebohoart.com/auth
```

A "Site URL" deve ser a principal (produção).

### E se eu mudar de domínio no futuro?

Basta atualizar:
1. A "Site URL" para o novo domínio
2. Adicionar o novo domínio às "Redirect URLs"
3. Pode manter URLs antigas temporariamente para transição

### O localhost deixa de funcionar se eu mudar a Site URL?

Não! Desde que `http://localhost:8080/auth` esteja nas "Redirect URLs", continuará funcionando em desenvolvimento.

---

## 🔧 Troubleshooting

### Ainda recebo localhost nos emails em produção

**Possíveis causas:**

1. **Cache do Supabase**: Aguarde 5-10 minutos após salvar as configurações
2. **URL não salva**: Confirme que clicou em "Save" e viu mensagem de sucesso
3. **Projeto errado**: Confirme que está no projeto correto (gyvtgzdkuhypteiyhtaq)

**Solução:**
- Limpe o cache: Force refresh (Ctrl+Shift+R)
- Teste em modo incógnito
- Aguarde alguns minutos e tente novamente

### O link dá erro "Invalid redirect URL"

**Causa:** A URL não está nas "Redirect URLs" permitidas

**Solução:**
1. Copie a URL exata do erro
2. Adicione-a às "Redirect URLs"
3. Certifique-se de incluir `/auth` no final

### Funciona em localhost mas não em produção

**Causa:** A URL de produção não está nas "Redirect URLs"

**Solução:**
1. Aceda ao site em produção
2. Copie a URL completa (ex: `https://abc123.lovable.app`)
3. Adicione `https://abc123.lovable.app/auth` às "Redirect URLs"

---

## 📚 Arquivos Relacionados

- `GUIA_COMPLETO_EMAILS.md` - Guia completo de emails (inclui esta secção)
- `CONFIGURAR_EMAIL_RESET.md` - Como configurar o template de email
- `src/pages/Auth.tsx:112` - Código que gera a URL de redirect

---

## ✅ Conclusão

Depois de configurar corretamente:

1. ✅ Emails enviados em **produção** terão links para **produção**
2. ✅ Emails enviados em **localhost** terão links para **localhost**
3. ✅ Todos os ambientes funcionam corretamente
4. ✅ Não precisa modificar código

**A chave é:**
- "Site URL" = URL principal de produção
- "Redirect URLs" = Todas as URLs possíveis (dev + produção)

---

**Última atualização**: 2025-11-03
**Versão**: 1.0.0
**Projeto**: ReBoho Art E-commerce
