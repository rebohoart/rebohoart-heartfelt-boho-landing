# 📧 Configurar Template de Email de Reset de Password no Supabase

## ❗ Problema

Quando solicita um reset de password, o email enviado não contém o link para alterar a password.

## 🔍 Causa

O template de email no Supabase precisa ser configurado para incluir o link de recuperação (`{{ .ConfirmationURL }}`).

---

## ✅ Solução: Configurar o Template de Email

### Passo 1: Aceder às Configurações de Email

1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione o seu projeto: **gyvtgzdkuhypteiyhtaq**
3. No menu lateral, vá para **Authentication** > **Email Templates**

### Passo 2: Selecionar o Template "Reset Password"

1. Na lista de templates, clique em **"Reset Password"** (ou "Recover Password")
2. Você verá o editor de template de email

### Passo 3: Configurar o Template

Substitua o conteúdo do template pelo seguinte:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset da sua Password - Rebohoart</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    h1 {
      color: #8B7355;
      font-size: 24px;
      margin: 0;
    }
    .content {
      background-color: white;
      padding: 25px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      background-color: #8B7355;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #6d5942;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 20px;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin: 15px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Reset da sua Password</h1>
    </div>

    <div class="content">
      <p>Olá,</p>

      <p>Recebemos um pedido para resetar a password da sua conta Rebohoart.</p>

      <p>Para definir uma nova password, clique no botão abaixo:</p>

      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Definir Nova Password</a>
      </div>

      <p>Ou copie e cole este link no seu navegador:</p>
      <p style="word-break: break-all; color: #666; font-size: 12px;">
        {{ .ConfirmationURL }}
      </p>

      <div class="warning">
        <strong>⚠️ Importante:</strong> Este link expira em 60 minutos por motivos de segurança.
      </div>

      <p style="margin-top: 20px;">Se não solicitou este reset de password, pode ignorar este email com segurança. A sua password não será alterada.</p>
    </div>

    <div class="footer">
      <p>Este é um email automático do sistema Rebohoart.</p>
      <p>© {{ .SiteURL }} - Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>
```

### Passo 4: Configurar o Assunto do Email

No campo **"Subject"**, coloque:

```
Reset da sua Password - Rebohoart
```

### Passo 5: Salvar as Alterações

1. Clique no botão **"Save"** no final da página
2. Você verá uma confirmação de que o template foi atualizado

---

## 🧪 Testar o Fluxo Completo

### Passo 1: Solicitar Reset de Password

1. Vá para a página de autenticação: `http://localhost:8080/auth` (em dev) ou o seu domínio de produção
2. Clique em **"Esqueceu a password?"**
3. Insira o seu email
4. Clique em **"Enviar Email"**

### Passo 2: Verificar o Email

1. Abra o seu cliente de email
2. Procure pelo email de **"Reset da sua Password - Rebohoart"**
3. **Verifique se o botão "Definir Nova Password" está presente**
4. **Verifique se há um link abaixo do botão**

### Passo 3: Clicar no Link

1. Clique no botão **"Definir Nova Password"** no email
2. Você será redirecionado para a página de autenticação
3. **Deve ver o formulário "Definir Nova Password"** com dois campos:
   - Nova Password
   - Confirmar Password

### Passo 4: Definir Nova Password

1. Digite a sua nova password (mínimo 6 caracteres)
2. Confirme a password no segundo campo
3. Clique em **"Atualizar Password"**
4. Você verá a mensagem: **"Password atualizada com sucesso! Pode agora fazer login."**

### Passo 5: Fazer Login

1. Faça login com o seu email e a nova password
2. Deve ser redirecionado para o backoffice (se for admin)

---

## 🔧 Configurações Adicionais (Opcional mas Recomendado)

### Adicionar URLs Permitidas (Redirect URLs)

Para garantir que o redirect funciona corretamente em todos os ambientes:

1. No Supabase Dashboard, vá para **Authentication** > **URL Configuration**
2. Na seção **"Redirect URLs"**, adicione:
   ```
   http://localhost:8080/auth
   https://seu-dominio.com/auth
   ```
3. Clique em **"Save"**

### Configurar Site URL

1. Na mesma página **"URL Configuration"**
2. Em **"Site URL"**, coloque a URL principal do seu site:
   ```
   https://seu-dominio.com
   ```
   ou em desenvolvimento:
   ```
   http://localhost:8080
   ```

---

## ❓ Troubleshooting

### O Email Não Chega

**Possíveis causas:**

1. **Email na pasta de spam**: Verifique a pasta de spam/lixo
2. **Email não confirmado**: Confirme o email antes de solicitar reset
3. **Supabase ainda não configurou SMTP**: Em desenvolvimento, o Supabase usa um serviço de email limitado

**Solução temporária:**
- Use o método manual de reset via SQL (veja `GUIA_RESET_PASSWORD.md`)

### O Email Chega mas Sem Link

**Causa**: O template não foi salvo corretamente

**Solução:**
1. Volte para **Authentication** > **Email Templates** > **"Reset Password"**
2. Verifique se `{{ .ConfirmationURL }}` está presente no template
3. Clique em **"Save"** novamente

### O Link Não Funciona

**Possíveis causas:**

1. **Link expirado**: O link expira em 60 minutos
2. **URL não está na whitelist**: Adicione a URL em **"Redirect URLs"**

**Solução:**
- Solicite um novo reset de password
- Verifique a configuração de **"Redirect URLs"**

### Depois de Clicar no Link, Não Aparece o Formulário

**Causa**: O JavaScript não está detectando o evento de recovery

**Solução:**
1. Limpe o cache do browser (Ctrl+Shift+Delete)
2. Abra em modo anónimo/privado
3. Verifique o console do browser (F12) por erros

---

## 📋 Variáveis Disponíveis no Template

O Supabase fornece estas variáveis que pode usar no template de email:

- `{{ .ConfirmationURL }}` - Link de confirmação/reset (OBRIGATÓRIO)
- `{{ .Token }}` - Token de confirmação (não recomendado usar diretamente)
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do site configurado
- `{{ .Email }}` - Email do usuário

---

## 📧 Templates de Email Adicionais

Considere também configurar estes templates para uma melhor experiência:

### 1. Confirmation Email (Email de Confirmação)

Para quando novos usuários criam conta:

```
Assunto: Confirme o seu email - Rebohoart
```

### 2. Magic Link (Login sem password)

Se quiser permitir login por link mágico:

```
Assunto: Login na sua conta - Rebohoart
```

### 3. Email Change Confirmation

Quando o usuário muda de email:

```
Assunto: Confirme o seu novo email - Rebohoart
```

---

## 🎯 Checklist Final

Antes de considerar tudo configurado, verifique:

- [ ] Template de "Reset Password" configurado com `{{ .ConfirmationURL }}`
- [ ] Assunto do email definido
- [ ] Template salvo no Supabase Dashboard
- [ ] Redirect URLs adicionadas em URL Configuration
- [ ] Site URL configurada
- [ ] Testou o fluxo completo: solicitar → receber email → clicar link → definir password → login
- [ ] Email recebido com link visível
- [ ] Formulário de "Definir Nova Password" aparece após clicar no link
- [ ] Conseguiu atualizar a password com sucesso

---

## 🆘 Ainda com Problemas?

Se após seguir todos os passos ainda não funcionar:

1. **Verifique os logs do Supabase**:
   - Vá para **Logs** > **Auth Logs**
   - Procure por erros relacionados com email

2. **Teste com outro email**:
   - Alguns provedores de email bloqueiam emails automáticos
   - Teste com Gmail, Outlook, etc.

3. **Verifique se o serviço de email está ativo**:
   - Em desenvolvimento, o Supabase pode ter limitações de envio de emails
   - Considere configurar SMTP customizado em produção

4. **Use o método alternativo temporário**:
   - Enquanto configura o email, use o reset manual via SQL
   - Veja o arquivo `GUIA_RESET_PASSWORD.md`

---

**Nota**: Esta configuração é necessária apenas uma vez. Depois de configurada, todos os emails de reset de password incluirão automaticamente o link de recuperação.
