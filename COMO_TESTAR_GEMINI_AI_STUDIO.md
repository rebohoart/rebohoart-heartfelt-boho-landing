# 🧪 Como Testar Gemini 2.5 Flash Image no Google AI Studio

## Objetivo

Confirmar se o **free tier** do modelo `gemini-2.5-flash-image` está disponível para sua conta antes de tentar usar via API no seu projeto.

---

## 📋 Passo a Passo Completo

### Passo 1: Acessar Google AI Studio

1. **Abra o navegador** (recomendo Chrome ou Edge)

2. **Acesse**: https://aistudio.google.com

3. **Faça login** com a mesma conta Google onde criou a API Key

4. Se aparecer popup de **Termos de Serviço**:
   - Leia e clique em **"Accept"** / **"Aceitar"**
   - Pode pedir para selecionar país → Selecione o seu

---

### Passo 2: Navegar para Geração de Imagens

Existem 2 formas de acessar:

#### Opção A: Via "New Prompt" (Recomendado)

1. No menu lateral esquerdo, clique em **"New prompt"** ou **"+ Create new"**

2. Na lista de templates/exemplos, procure:
   - **"Image generation"**
   - Ou **"Nano Banana"** 🍌 (nome popular)
   - Ou **"Generate image"**

3. Se encontrou, clique nele

#### Opção B: Via Chat

1. Clique em **"Chat"** no menu lateral esquerdo

2. Clique em **"+ New chat"** ou **"Nova conversa"**

3. No topo da página, procure o **seletor de modelo**:
   - Pode estar escrito "Gemini 1.5 Flash" ou outro modelo
   - Clique nele para abrir dropdown

4. Na lista de modelos, procure:
   - **"Gemini 2.5 Flash Image"**
   - Ou **"gemini-2.5-flash-image"**

---

### Passo 3: Testar Geração de Imagem

#### Teste 1: Geração Simples (Text-to-Image)

1. No campo de prompt, digite:
   ```
   Generate a simple drawing of a circle
   ```

2. Pressione **Enter** ou clique em **"Run"** / **"Executar"**

3. **Aguarde 10-30 segundos**

**✅ Se funcionar:**
- Vai aparecer uma imagem gerada
- Pode demorar um pouco na primeira vez
- **ISSO CONFIRMA que você tem acesso ao free tier!** 🎉

**❌ Se NÃO funcionar:**
- Erro: "Model not available" → Free tier não disponível
- Erro: "Quota exceeded" → Limite pode estar esgotado
- Erro: "429" → Rate limit ou quota
- Erro: "Billing required" → Requer billing ativado

#### Teste 2: Edição de Imagem (Image-to-Image)

Se o Teste 1 funcionou, tente também:

1. **Faça upload de uma imagem**:
   - Clique no ícone de **clipe** 📎 ou **imagem** 🖼️
   - Selecione uma foto do seu computador
   - Aguarde upload

2. **Digite o prompt**:
   ```
   Transform this into a simple line drawing
   ```

3. Clique em **"Run"** / **"Executar"**

4. **Aguarde a geração**

**✅ Se funcionar:**
- Vai gerar uma nova imagem baseada na sua
- **PERFEITO! É exatamente o que seu código faz!** 🎯

---

### Passo 4: Verificar Quotas e Limites

Enquanto estiver no AI Studio:

1. Procure por informações de quota:
   - Pode estar no canto superior direito
   - Ou em **"Settings"** / **"Configurações"**

2. Veja se mostra algo como:
   - **"500 requests remaining today"**
   - Ou **"Free tier: Active"**
   - Ou contador de uso

---

## 🔍 O Que Cada Resultado Significa

### ✅ Cenário 1: Funcionou Perfeitamente

**Sintomas:**
- Imagem foi gerada com sucesso
- Não pediu cartão de crédito
- Não deu erro de billing

**O que isso significa:**
- ✅ Free tier está disponível para você
- ✅ Sua API Key **DEVE** funcionar também
- ✅ O problema é configuração da API

**Próximos passos:**
1. Ativar "Generative Language API" no Google Cloud Console
2. Aguardar 10-15 minutos
3. Testar no seu app novamente

### ❌ Cenário 2: Erro "Model not available"

**Sintomas:**
- Modelo não aparece na lista
- Ou dá erro ao tentar usar

**O que isso significa:**
- ❌ Free tier pode não estar disponível na sua região
- ❌ Ou conta não tem acesso
- ❌ Ou modelo ainda em rollout

**Próximos passos:**
1. Tentar com VPN (EUA/Europa)
2. Ou usar API alternativa (Hugging Face)
3. Ou ativar billing ($0.039/imagem)

### ⚠️ Cenário 3: Erro "Quota exceeded" ou 429

**Sintomas:**
- Erro 429 logo na primeira tentativa
- Mensagem sobre quota excedida

**O que isso significa:**
- ⚠️ Free tier existe, mas você já usou o limite diário
- ⚠️ Ou rate limiting (muito rápido)
- ⚠️ Ou API não ativada (mesmo no AI Studio)

**Próximos passos:**
1. Aguardar reset (meia-noite UTC)
2. Ou criar nova API Key em projeto diferente
3. Verificar uso em: https://aistudio.google.com/app/apikey

### 💳 Cenário 4: Pede Billing/Cartão

**Sintomas:**
- Pede para configurar billing
- Ou adicionar método de pagamento

**O que isso significa:**
- ❌ Free tier não está disponível para sua conta
- ❌ Ou região não suportada

**Próximos passos:**
1. Decidir se vale pagar ($0.039/imagem)
2. Ou usar alternativa gratuita

---

## 📊 Informações Importantes

### Limites Esperados (Free Tier)

Se funcionar, você terá:
- ✅ **500 a 1.500 imagens/dia** grátis (varia)
- ✅ **15-60 requisições/minuto**
- ✅ Reset diário à meia-noite UTC
- ✅ Sem necessidade de cartão de crédito

### Diferenças AI Studio vs API

**Google AI Studio (Interface Web):**
- ✅ Mais permissivo
- ✅ Quotas podem ser maiores
- ✅ Funciona mesmo sem billing

**API (Seu código):**
- ⚠️ Requer "Generative Language API" ativada
- ⚠️ Quotas podem ser mais restritivas
- ⚠️ Pode ter configurações adicionais

---

## 🎯 Depois de Testar no AI Studio

### Se Funcionou ✅

Você confirmou que o free tier existe! Agora precisa ativar a API:

1. **Acesse Google Cloud Console**:
   - URL: https://console.cloud.google.com/apis/library

2. **Selecione o MESMO projeto** da sua API Key:
   - Veja o nome do projeto no AI Studio → API Keys
   - No Cloud Console, selecione esse projeto no topo

3. **Busque "Generative Language API"**

4. **Clique em "ENABLE"**

5. **Aguarde 10-15 minutos**

6. **Teste no seu app**:
   - Vá para `/backoffice`
   - Aba "Geração de Imagens com IA"
   - Tente gerar uma imagem

### Se NÃO Funcionou ❌

Free tier pode não estar disponível. Opções:

**Opção 1: Usar Hugging Face (GRÁTIS)**
- Stable Diffusion via API grátis
- Posso implementar isso para você

**Opção 2: Ativar Billing (PAGO)**
- $0.039 por imagem
- Configurar no Google Cloud Console

**Opção 3: Desabilitar Funcionalidade**
- Adicionar aviso no backoffice
- Usar upload manual

---

## 🐛 Troubleshooting

### "Não encontro o modelo no AI Studio"

Possíveis razões:
1. Modelo ainda não disponível na sua região
2. Conta precisa de verificação
3. Precisa aceitar termos adicionais

**Solução:**
- Tente com VPN conectada a EUA
- Ou vá direto para a API (ativar billing)

### "AI Studio funciona mas API não"

Isso é comum! Significa que:
1. Free tier existe
2. Mas API precisa ser ativada separadamente

**Solução:**
1. Ativar "Generative Language API" no Cloud Console
2. Aguardar propagação (10-15 min)
3. Re-testar

### "Dá erro intermitente"

Possíveis causas:
1. Servidor sobrecarregado
2. Rate limiting
3. Fila de espera (free tier)

**Solução:**
- Aguardar e tentar novamente
- Testar em horário de menos uso (madrugada EUA)

---

## ✅ Checklist Final

Antes de sair do AI Studio:

- [ ] Testei geração de imagem (text-to-image)
- [ ] Testei edição de imagem (image-to-image)
- [ ] Anotei o nome do projeto da API Key
- [ ] Verifiquei se tem contador de quota
- [ ] Confirmei se free tier funciona
- [ ] Se funcionou → Vou ativar a API no Cloud Console
- [ ] Se não funcionou → Vou escolher alternativa

---

## 📞 Precisa de Ajuda?

Se após testar ainda tiver dúvidas:

1. **Tire screenshot** do que apareceu (sucesso ou erro)
2. **Anote a mensagem de erro** completa
3. **Verifique** qual projeto está usando
4. **Compartilhe** essas informações

---

**Última atualização**: 2025-11-19
**Tempo estimado**: 5-10 minutos
**Dificuldade**: ⭐⭐☆☆☆ (Fácil)
