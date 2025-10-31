# 📧 Configuração de Emails - ReBoho Art

Este documento fornece uma visão rápida da configuração de emails da loja.

---

## 🎯 Tipos de Emails

A aplicação ReBoho Art envia **3 categorias de emails**:

### 1. 📦 Emails de Encomendas
- Envia para a **loja** e para o **cliente**
- Tecnologia: **Resend API** (via Edge Function)
- Triggers: Checkout do carrinho

### 2. 💎 Emails de Pedidos de Orçamento (Peças Personalizadas)
- Envia para a **loja** e para o **cliente**
- Tecnologia: **Resend API** (via Edge Function)
- Triggers: Formulário de pedido personalizado

### 3. 🔐 Emails de Autenticação
- Reset de password
- Tecnologia: **Supabase Auth** (sistema integrado)
- Triggers: Solicitação de reset na página `/auth`

---

## ⚙️ Configuração Rápida

### Para Encomendas e Pedidos de Orçamento

**1. Configure a Resend API:**
```bash
# 1. Crie conta em: https://resend.com
# 2. Gere uma API Key
# 3. Adicione ao Supabase:
#    Dashboard → Edge Functions → Manage secrets
#    Name: RESEND_API_KEY
#    Value: re_sua-api-key
```

**2. Configure o email da loja (opcional):**
```bash
# Adicione ao Supabase Edge Function secrets:
# Name: STORE_EMAIL
# Value: seu-email@dominio.com

# Ou deixe o padrão: catarinarebocho30@gmail.com
```

### Para Reset de Password

**1. Configure o template no Supabase:**
```
Dashboard → Authentication → Email Templates → Reset Password
```

**2. Configure as URLs permitidas:**
```
Dashboard → Authentication → URL Configuration → Redirect URLs
Adicione: http://localhost:8080/auth e https://seu-dominio.com/auth
```

---

## 📖 Documentação Completa

Para instruções detalhadas, passo a passo, e troubleshooting:

👉 **[GUIA_COMPLETO_EMAILS.md](../GUIA_COMPLETO_EMAILS.md)**

Este guia completo inclui:
- ✅ Configuração detalhada de cada tipo de email
- ✅ Como configurar domínio próprio na Resend
- ✅ Templates HTML completos
- ✅ Configuração de variáveis de ambiente
- ✅ Checklist de configuração completa
- ✅ Troubleshooting detalhado
- ✅ Boas práticas para evitar spam

---

## 🔗 Links Rápidos

| Recurso | Link |
|---------|------|
| **Resend Dashboard** | https://resend.com/dashboard |
| **Supabase Dashboard** | https://supabase.com/dashboard |
| **Guia Completo** | [GUIA_COMPLETO_EMAILS.md](../GUIA_COMPLETO_EMAILS.md) |
| **Guia Reset Password** | [CONFIGURAR_EMAIL_RESET.md](../CONFIGURAR_EMAIL_RESET.md) |
| **Edge Function** | [supabase/functions/send-order-email/](../supabase/functions/send-order-email/) |

---

## ✅ Checklist Mínimo

Para ter os emails funcionando:

### Encomendas:
- [ ] Conta criada na Resend
- [ ] API Key adicionada aos secrets do Supabase (`RESEND_API_KEY`)
- [ ] Testado: Encomenda do carrinho

### Reset de Password:
- [ ] Template configurado no Supabase
- [ ] Redirect URLs configuradas
- [ ] Testado: Solicitar reset → Receber email → Redefinir password

---

## 🆘 Problemas Comuns

### Emails não chegam?
1. Verifique se `RESEND_API_KEY` está nos secrets do Supabase
2. Verifique a pasta de spam
3. Veja os logs: Supabase → Edge Functions → Logs

### Link de reset não funciona?
1. Verifique se a URL está nas Redirect URLs do Supabase
2. Verifique se o link ainda não expirou (60 minutos)
3. Limpe o cache do browser

### Mais ajuda?
👉 Consulte a seção **Troubleshooting** no [GUIA_COMPLETO_EMAILS.md](../GUIA_COMPLETO_EMAILS.md)

---

**Última atualização**: 2025-10-31
