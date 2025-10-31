# 📧 Guia Completo de Configuração de Emails - ReBoho Art

Este guia documenta todos os emails usados na loja ReBoho Art e como configurá-los.

---

## 📋 Índice

1. [Visão Geral dos Emails](#visão-geral-dos-emails)
2. [Emails de Encomendas (Resend API)](#emails-de-encomendas-resend-api)
3. [Emails de Autenticação (Supabase Auth)](#emails-de-autenticação-supabase-auth)
4. [Configuração do Email da Loja](#configuração-do-email-da-loja)
5. [Configuração do Sender (Remetente)](#configuração-do-sender-remetente)
6. [Checklist de Configuração Completa](#checklist-de-configuração-completa)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral dos Emails

A aplicação ReBoho Art envia **3 tipos principais de emails**:

### 1. Emails de Encomendas do Carrinho
- **Para a loja**: Notificação de nova encomenda com produtos e valores
- **Para o cliente**: Confirmação de que a encomenda foi recebida

### 2. Emails de Pedidos de Orçamento (Peças Personalizadas)
- **Para a loja**: Detalhes do pedido de orçamento personalizado
- **Para o cliente**: Confirmação de que o pedido foi recebido

### 3. Emails de Autenticação
- **Reset de Password**: Link para redefinir password
- **Confirmação de Email**: Confirmar nova conta (se ativado)
- **Magic Link**: Login sem password (se ativado)

---

## 📦 Emails de Encomendas (Resend API)

### Como Funciona

O sistema usa **Resend API** para enviar emails de encomendas e pedidos de orçamento através de uma Edge Function do Supabase.

**Arquivo**: `supabase/functions/send-order-email/index.ts`

### Configuração Necessária

#### 1. Obter API Key da Resend

1. Aceda a: https://resend.com/
2. Crie uma conta ou faça login
3. Vá para **API Keys**
4. Clique em **Create API Key**
5. Dê um nome (ex: "ReBoho Art Production")
6. Copie a API Key (começa com `re_...`)

#### 2. Adicionar API Key ao Supabase

1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione o projeto: **gyvtgzdkuhypteiyhtaq**
3. Vá para **Edge Functions** (no menu lateral)
4. Clique em **Manage secrets**
5. Adicione um novo secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Cole a API Key da Resend (ex: `re_ABC123...`)
6. Clique em **Save**

#### 3. Configurar Email da Loja (Destinatário)

**⚠️ IMPORTANTE**: O email da loja que recebe as notificações está configurado como variável de ambiente.

**Opção A: Usar Variável de Ambiente (Recomendado)**

1. Adicione ao ficheiro `.env`:
   ```
   VITE_STORE_EMAIL=catarinarebocho30@gmail.com
   ```

2. Se usar outra plataforma (Vercel, Netlify, etc.), adicione esta variável nas configurações de ambiente

**Opção B: Alterar Diretamente no Código**

Edite o arquivo `supabase/functions/send-order-email/index.ts` linha 30:
```typescript
const recipientEmail = "seu-email@dominio.com";
```

#### 4. Configurar Sender (Remetente)

**Email atual**: `ReBoho Art <onboarding@resend.dev>`

Este é o email de teste da Resend. Para usar um domínio personalizado:

**Passo 1: Adicionar Domínio na Resend**

1. No dashboard da Resend, vá para **Domains**
2. Clique em **Add Domain**
3. Insira o seu domínio (ex: `rebohoart.com`)
4. Siga as instruções para adicionar registos DNS:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)

**Passo 2: Verificar Domínio**

1. Aguarde a propagação DNS (pode demorar até 48h)
2. Clique em **Verify Domain** na Resend
3. Quando verificado, verá um ✅ verde

**Passo 3: Atualizar o Código**

Edite `supabase/functions/send-order-email/index.ts` linhas 96 e 189:
```typescript
from: "ReBoho Art <noreply@rebohoart.com>",
```

**Passo 4: Fazer Deploy da Edge Function**

```bash
supabase functions deploy send-order-email
```

### Emails Enviados

#### A) Email para a Loja (Owner)

**Encomenda do Carrinho:**
- **Assunto**: "Nova Encomenda ReBoho"
- **Conteúdo**:
  - Nome e email do cliente
  - Lista de produtos com quantidades e preços
  - Total da encomenda
  - Nota: "O cliente foi informado para aguardar novas indicações"

**Pedido de Orçamento:**
- **Assunto**: "Novo Pedido de Orçamento - Peça Personalizada"
- **Conteúdo**:
  - Nome e email do cliente
  - Título da peça
  - Descrição detalhada
  - Data de entrega desejada
  - Imagens de referência (se fornecidas)
  - Nota: "Entre em contacto com o cliente para discutir o orçamento"

#### B) Email para o Cliente

**Confirmação de Encomenda:**
- **Assunto**: "Encomenda Recebida - ReBoho Art"
- **Conteúdo**:
  - Saudação personalizada
  - Confirmação de recebimento
  - Próximos passos:
    - Confirmação de disponibilidade
    - Informações de pagamento
    - Detalhes de envio
  - Mensagem para aguardar contacto

**Confirmação de Pedido de Orçamento:**
- **Assunto**: "Pedido de Orçamento Recebido - ReBoho Art"
- **Conteúdo**:
  - Saudação personalizada
  - Confirmação de recebimento
  - Resumo do pedido
  - Próximos passos:
    - Orçamento detalhado
    - Prazo de execução
    - Sugestões criativas
  - Mensagem para aguardar contacto

### Estilo dos Emails

Todos os emails de encomenda seguem o tema boho da loja:
- **Cores**: Gradiente dourado (#D4A574 → #B8956A)
- **Design**: Limpo, profissional, com blocos de informação destacados
- **Emojis**: Usados com moderação para tornar emails mais amigáveis
- **Responsivo**: Design adaptável a mobile e desktop

---

## 🔐 Emails de Autenticação (Supabase Auth)

### Como Funciona

O Supabase tem um sistema de autenticação integrado que envia emails automaticamente para:
- Reset de password
- Confirmação de email de novas contas
- Magic links (login sem password)

### Configuração: Email de Reset de Password

#### 1. Configurar Template de Email

1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione o projeto: **gyvtgzdkuhypteiyhtaq**
3. Vá para **Authentication** > **Email Templates**
4. Clique em **"Reset Password"**
5. Configure:

**Assunto:**
```
Reset da sua Password - Rebohoart
```

**Template HTML:**
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

6. Clique em **Save**

#### 2. Configurar URLs Permitidas (Redirect URLs)

1. No Supabase Dashboard, vá para **Authentication** > **URL Configuration**
2. Na secção **"Redirect URLs"**, adicione:
   ```
   http://localhost:8080/auth
   https://seu-dominio.com/auth
   ```
   (substitua `seu-dominio.com` pelo seu domínio real)
3. Clique em **Save**

#### 3. Configurar Site URL

1. Na mesma página **"URL Configuration"**
2. Em **"Site URL"**, coloque:
   - **Desenvolvimento**: `http://localhost:8080`
   - **Produção**: `https://seu-dominio.com`
3. Clique em **Save**

### Fluxo de Reset de Password

1. Utilizador acede a `/auth`
2. Clica em "Esqueceu a password?"
3. Insere o email e clica em "Enviar Email"
4. Recebe email com botão "Definir Nova Password"
5. Clica no botão/link
6. É redirecionado para `/auth` com token
7. Formulário de "Definir Nova Password" aparece automaticamente
8. Insere nova password (mínimo 6 caracteres) e confirmação
9. Clica em "Atualizar Password"
10. Vê mensagem de sucesso
11. Pode fazer login com nova password

**Arquivos envolvidos**:
- `src/pages/Auth.tsx:93-94` - Detecção de evento `PASSWORD_RECOVERY`
- `src/contexts/AuthContext.tsx` - Função `updatePassword()`

---

## ⚙️ Configuração do Email da Loja

O email que **recebe** as notificações de encomendas pode ser configurado de duas formas:

### Opção 1: Variável de Ambiente (Recomendado)

Esta é a forma mais flexível e segura.

**Desenvolvimento Local (.env):**
```bash
VITE_STORE_EMAIL=catarinarebocho30@gmail.com
```

**Produção (Plataforma de Hosting):**

**Vercel:**
1. Vá para o seu projeto
2. **Settings** > **Environment Variables**
3. Adicione:
   - **Name**: `VITE_STORE_EMAIL`
   - **Value**: `catarinarebocho30@gmail.com`
   - **Environments**: Production, Preview, Development

**Netlify:**
1. Vá para o seu site
2. **Site settings** > **Environment variables**
3. Clique em **Add a variable**
4. **Key**: `VITE_STORE_EMAIL`
5. **Value**: `catarinarebocho30@gmail.com`

**Outras plataformas**: Consulte a documentação para adicionar variáveis de ambiente.

### Opção 2: Hardcoded no Código

Se preferir fixar no código (menos flexível):

Edite `supabase/functions/send-order-email/index.ts` linha 30:
```typescript
const recipientEmail = "seu-email@exemplo.com";
```

**⚠️ Nota**: Após alterar o código da edge function, precisa fazer deploy:
```bash
supabase functions deploy send-order-email
```

---

## 📮 Configuração do Sender (Remetente)

O email **remetente** (quem envia) pode ser configurado de duas formas:

### Opção 1: Usar Email de Teste da Resend (Atual)

**Email atual**: `onboarding@resend.dev`

- ✅ Funciona imediatamente
- ✅ Não requer configuração DNS
- ⚠️ Pode ir para spam
- ⚠️ Não é profissional (mostra "resend.dev")

**Bom para**: Testes, desenvolvimento

### Opção 2: Usar Domínio Próprio (Recomendado para Produção)

**Exemplo**: `noreply@rebohoart.com` ou `loja@rebohoart.com`

#### Passo 1: Adicionar Domínio na Resend

1. Aceda ao dashboard da Resend: https://resend.com/domains
2. Clique em **Add Domain**
3. Insira o seu domínio (ex: `rebohoart.com`)

#### Passo 2: Configurar DNS

A Resend fornecerá 3 registos DNS para adicionar:

**1. SPF Record (TXT)**
```
Name: @
Value: v=spf1 include:resend.com ~all
```

**2. DKIM Record (TXT)**
```
Name: resend._domainkey
Value: [valor fornecido pela Resend]
```

**3. DMARC Record (TXT)**
```
Name: _dmarc
Value: v=DMARC1; p=none
```

**Como adicionar**:
- Se usa **Cloudflare**: DNS → Add record → Tipo TXT
- Se usa **GoDaddy**: DNS Management → Add → TXT Record
- Se usa **Namecheap**: Advanced DNS → Add New Record → TXT
- Outros: Consulte a documentação do seu provedor de DNS

#### Passo 3: Aguardar Verificação

- A propagação DNS pode demorar até **48 horas**
- Normalmente leva **15-30 minutos**
- Na Resend, clique em **Verify Domain**
- Quando verificado, verá um ✅ verde

#### Passo 4: Atualizar o Código

Edite `supabase/functions/send-order-email/index.ts`:

**Linha 96** (email para a loja):
```typescript
from: "ReBoho Art <noreply@rebohoart.com>",
```

**Linha 189** (email para o cliente):
```typescript
from: "ReBoho Art <noreply@rebohoart.com>",
```

Pode usar outros endereços:
- `loja@rebohoart.com`
- `encomendas@rebohoart.com`
- `catarina@rebohoart.com`

**⚠️ Importante**: O domínio (`@rebohoart.com`) deve estar verificado na Resend.

#### Passo 5: Fazer Deploy

```bash
supabase functions deploy send-order-email
```

### Vantagens do Domínio Próprio

- ✅ Profissional
- ✅ Maior taxa de entrega (menos spam)
- ✅ Confiança do cliente
- ✅ Consistente com a marca

---

## ✅ Checklist de Configuração Completa

Use este checklist para garantir que todos os emails estão configurados:

### Resend API (Encomendas e Pedidos de Orçamento)

- [ ] Conta criada na Resend (https://resend.com)
- [ ] API Key gerada na Resend
- [ ] API Key adicionada aos secrets do Supabase (`RESEND_API_KEY`)
- [ ] Email da loja configurado (variável de ambiente ou código)
- [ ] Edge function `send-order-email` funcionando
- [ ] Testado: Encomenda do carrinho (email para loja + email para cliente)
- [ ] Testado: Pedido de orçamento (email para loja + email para cliente)

### Resend - Domínio Próprio (Opcional mas Recomendado)

- [ ] Domínio adicionado na Resend
- [ ] Registos DNS configurados (SPF, DKIM, DMARC)
- [ ] Domínio verificado na Resend (✅ verde)
- [ ] Código atualizado com novo sender (ex: `noreply@rebohoart.com`)
- [ ] Edge function com deploy feito após alterações

### Supabase Auth (Reset de Password)

- [ ] Template de "Reset Password" configurado no Supabase
- [ ] Assunto do email definido
- [ ] Template contém `{{ .ConfirmationURL }}`
- [ ] Template salvo
- [ ] Redirect URLs adicionadas em URL Configuration
- [ ] Site URL configurada
- [ ] Testado fluxo completo: solicitar → receber → clicar → redefinir → login

### Supabase Auth - Outros Templates (Opcional)

- [ ] Template de "Confirmation Email" (confirmar nova conta)
- [ ] Template de "Magic Link" (login sem password)
- [ ] Template de "Email Change" (mudança de email)

### Variáveis de Ambiente

- [ ] `.env` local contém `VITE_STORE_EMAIL` (se usado)
- [ ] `.env` local contém variáveis do Supabase
- [ ] Plataforma de produção tem `VITE_STORE_EMAIL` configurada
- [ ] Edge function tem `RESEND_API_KEY` nos secrets

### Testes Finais

- [ ] Email de encomenda chega à loja
- [ ] Email de confirmação chega ao cliente (encomenda)
- [ ] Email de pedido de orçamento chega à loja
- [ ] Email de confirmação chega ao cliente (orçamento)
- [ ] Email de reset de password chega
- [ ] Link de reset funciona e redireciona corretamente
- [ ] Consegue redefinir password com sucesso
- [ ] Emails não vão para spam (verifique caixa de entrada)

---

## 🔧 Troubleshooting

### Problema: Emails de Encomenda Não Chegam

**Possíveis causas**:

1. **RESEND_API_KEY não configurada**
   - Verifique: Supabase Dashboard → Edge Functions → Secrets
   - Deve existir `RESEND_API_KEY` com valor `re_...`

2. **API Key inválida**
   - Teste a API key na Resend
   - Gere uma nova se necessário

3. **Edge function não foi deployada**
   - Execute: `supabase functions deploy send-order-email`

4. **Email da loja incorreto**
   - Verifique o valor de `VITE_STORE_EMAIL` ou linha 30 do código
   - Confirme que o email existe e está acessível

**Solução**:
- Verifique os logs: Supabase Dashboard → Edge Functions → send-order-email → Logs
- Procure por erros relacionados com Resend ou API key

### Problema: Email de Reset de Password Não Chega

**Possíveis causas**:

1. **Email na pasta de spam**
   - Verifique a pasta de spam/lixo

2. **Template não configurado**
   - Verifique: Supabase Dashboard → Authentication → Email Templates → Reset Password
   - Confirme que `{{ .ConfirmationURL }}` está presente

3. **Rate limiting**
   - Supabase limita envios de email em desenvolvimento
   - Aguarde alguns minutos entre testes

**Solução**:
- Verifique os logs: Supabase Dashboard → Logs → Auth Logs
- Procure por erros relacionados com email

### Problema: Link de Reset Não Funciona

**Possíveis causas**:

1. **URL não está na whitelist**
   - Verifique: Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
   - Deve conter: `http://localhost:8080/auth` e/ou `https://seu-dominio.com/auth`

2. **Link expirado**
   - Links expiram em 60 minutos
   - Solicite um novo reset

3. **Site URL incorreta**
   - Verifique: Supabase Dashboard → Authentication → URL Configuration → Site URL
   - Deve corresponder ao seu domínio

**Solução**:
- Adicione a URL correcta nas Redirect URLs
- Solicite novo reset de password

### Problema: Emails Vão para Spam

**Causas comuns**:

1. **Usando `onboarding@resend.dev`**
   - Configure um domínio próprio na Resend

2. **DNS não configurado**
   - Configure SPF, DKIM e DMARC

3. **Conteúdo suspeito**
   - Evite palavras spam: "grátis", "clique aqui", "urgente"
   - Mantenha ratio texto/imagem equilibrado

**Solução**:
1. Configure domínio próprio na Resend
2. Configure registos DNS corretamente
3. Verifique domínio na Resend (✅)
4. Aguarde algumas horas para reputação melhorar

### Problema: Edge Function Retorna Erro 500

**Causas comuns**:

1. **RESEND_API_KEY em falta**
   - Adicione aos secrets do Supabase

2. **Formato de dados incorreto**
   - Verifique que `CheckoutForm.tsx` e `CustomOrderForm.tsx` enviam dados no formato correcto:
     ```typescript
     {
       type: "cart" | "custom",
       customerName: string,
       customerEmail: string,
       details: string
     }
     ```

3. **Limite de API excedido**
   - Verifique se excedeu o limite da Resend (plano gratuito: 100 emails/dia)

**Solução**:
- Verifique logs da edge function no Supabase
- Teste a API da Resend directamente
- Verifique o plano e limites da Resend

### Problema: Cliente Não Recebe Email de Confirmação

**Causas comuns**:

1. **Email do cliente incorreto**
   - Valide o formato do email no formulário

2. **Email na pasta de spam do cliente**
   - Instrua o cliente a verificar spam

3. **Provedor de email bloqueia**
   - Alguns provedores bloqueiam emails automáticos
   - Teste com Gmail, Outlook

**Solução**:
- Configure domínio próprio (aumenta deliverability)
- Verifique logs da Resend para confirmar envio
- Teste com diferentes provedores de email

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **Resend Docs**: https://resend.com/docs
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

### Arquivos Relacionados

- `CONFIGURAR_EMAIL_RESET.md` - Guia específico de reset de password
- `GUIA_RESET_PASSWORD.md` - Reset manual via SQL (emergência)
- `SECURITY.md` - Medidas de segurança implementadas
- `supabase/functions/send-order-email/index.ts` - Código da edge function
- `src/pages/Auth.tsx` - Interface de autenticação e reset de password
- `src/components/CheckoutForm.tsx` - Formulário de checkout
- `src/components/CustomOrderForm.tsx` - Formulário de pedido de orçamento

### Suporte

- **Resend Support**: https://resend.com/support
- **Supabase Support**: https://supabase.com/support
- **Issues do Projeto**: Consulte o repositório do código

---

## 🎉 Conclusão

Seguindo este guia completo, você terá todos os emails da loja ReBoho Art configurados e funcionando:

1. ✅ **Notificações de encomenda** para a loja
2. ✅ **Confirmações de encomenda** para os clientes
3. ✅ **Notificações de pedidos de orçamento** para a loja
4. ✅ **Confirmações de pedidos de orçamento** para os clientes
5. ✅ **Emails de reset de password** funcionais
6. ✅ **Domínio próprio** configurado (opcional)
7. ✅ **Entrega optimizada** (menos spam)

**Próximos passos recomendados**:
- Configure um domínio próprio na Resend para maior profissionalismo
- Teste todos os fluxos de email em produção
- Monitore os logs regularmente
- Configure alertas para falhas de envio

**Nota**: Guarde este documento para referência futura. Sempre que adicionar novos tipos de email, atualize este guia.

---

**Última atualização**: 2025-10-31
**Versão**: 1.0.0
**Projeto**: ReBoho Art E-commerce
