# 🔧 Guia: Como Ativar o Gemini 2.5 Flash Image API (Free Tier)

## Problema Identificado

O erro mostra métricas de **free_tier** com **limit: 0**:
```
generativelanguage.googleapis.com/generate_content_free_tier_input_token_count, limit: 0
generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0
```

Isso significa que a **API não está ativada** no projeto, não que você excedeu a quota.

## ✅ Solução: Ativar a API Corretamente

### Método 1: Via Google AI Studio (RECOMENDADO - Mais Rápido)

1. **Acesse Google AI Studio**:
   - URL: https://aistudio.google.com

2. **Faça login** com sua conta Google

3. **Aceite os Termos de Serviço** se solicitado

4. **No menu lateral esquerdo**, clique em:
   - **"Get API key"** OU **"API keys"**

5. **Verifique se sua API Key existe**:
   - Se já tem uma API Key → continue para passo 6
   - Se não tem → clique em **"Create API key in new project"**

6. **IMPORTANTE: Teste a API Key no Playground**:
   - No menu lateral, clique em **"Chat"** ou **"Prompt"**
   - No canto superior direito, selecione o modelo: **"Gemini 2.5 Flash Image"**
   - Se o modelo aparecer → API está ativada! ✅
   - Se NÃO aparecer → siga Método 2

7. **Teste com imagem**:
   - Faça upload de uma imagem no chat
   - Digite: "Generate a simple line drawing based on this image"
   - Se funcionar → API está ativa e funcional! ✅

### Método 2: Via Google Cloud Console (Mais Controle)

Se o Método 1 não funcionou, ative a API manualmente:

1. **Acesse Google Cloud Console**:
   - URL: https://console.cloud.google.com

2. **Selecione o projeto** (mesmo projeto da sua API Key):
   - No topo da página, clique no seletor de projetos
   - Escolha o projeto onde criou a API Key

3. **Vá para API Library**:
   - Menu lateral → **"APIs & Services"** → **"Library"**
   - OU acesse direto: https://console.cloud.google.com/apis/library

4. **Procure por "Generative Language API"**:
   - Digite na busca: `Generative Language API`
   - Clique no resultado que aparecer

5. **Ative a API**:
   - Clique no botão azul **"ENABLE"** ou **"ATIVAR"**
   - Aguarde alguns segundos

6. **Verifique se está ativa**:
   - Vá para **"APIs & Services"** → **"Enabled APIs & services"**
   - Procure por **"Generative Language API"**
   - Deve aparecer na lista ✅

7. **Configure Quotas (Opcional mas recomendado)**:
   - Vá para **"APIs & Services"** → **"Quotas"**
   - Procure por: `generativelanguage.googleapis.com`
   - Verifique se as quotas do free tier estão ativas:
     - `generate_content_free_tier_requests`
     - `generate_content_free_tier_input_token_count`

### Método 3: Via gcloud CLI (Para Usuários Avançados)

```bash
# 1. Fazer login
gcloud auth login

# 2. Listar projetos
gcloud projects list

# 3. Definir projeto ativo (substitua PROJECT_ID)
gcloud config set project PROJECT_ID

# 4. Ativar a Generative Language API
gcloud services enable generativelanguage.googleapis.com

# 5. Verificar se está ativa
gcloud services list --enabled | grep generativelanguage

# Deve retornar:
# generativelanguage.googleapis.com  Generative Language API
```

## 🔍 Como Verificar Se Funcionou

### Teste 1: Via Curl

```bash
# Substitua YOUR_API_KEY pela sua chave
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Generate a simple circle"
      }]
    }],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }'
```

**Resposta esperada se funcionou:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "inlineData": {
              "mimeType": "image/png",
              "data": "iVBORw0KGgoAAAANS..."
            }
          }
        ]
      }
    }
  ]
}
```

**Resposta se ainda não está ativa:**
```json
{
  "error": {
    "code": 429,
    "message": "...limit: 0..."
  }
}
```

### Teste 2: No Seu Backoffice

1. Aguarde **5-10 minutos** após ativar a API (propagação)
2. Acesse `/backoffice` no seu site
3. Vá para aba **"Geração de Imagens com IA"**
4. Faça upload de uma imagem
5. Clique em **"Gerar Nova Versão com IA"**
6. Se funcionar → API está ativa! ✅

## ❓ Perguntas Frequentes

### P: Por que o erro diz "limit: 0"?

**R:** Porque a API não está ativada no projeto. Quando você ativa, os limites mudam para:
- **2.000 imagens/dia** grátis
- **15 requisições/minuto** grátis

### P: Preciso de cartão de crédito?

**R:** **NÃO!** O free tier não requer billing. Você só precisa:
- ✅ Conta Google
- ✅ Ativar a API no projeto
- ✅ Criar API Key

### P: Quanto tempo demora para ativar?

**R:** Normalmente **1-5 minutos**, mas pode demorar até 10 minutos para propagar.

### P: Minha API Key antiga vai funcionar?

**R:** Sim, se você ativar a API no mesmo projeto onde criou a chave.

### P: Posso ter múltiplos projetos com free tier?

**R:** Sim! Cada projeto tem sua própria quota de 2.000 imagens/dia.

### P: O que é "Generative Language API"?

**R:** É a API que engloba todos os modelos Gemini, incluindo:
- Gemini 2.5 Flash (texto)
- Gemini 2.5 Flash Image (geração de imagens)
- Gemini 1.5 Pro (texto)
- E outros

## 🚨 Problemas Comuns

### Problema 1: "API not found"

**Solução:**
- Verifique se está no projeto correto
- API pode ter nome diferente por região
- Use a busca no API Library

### Problema 2: "Permission denied"

**Solução:**
- Você precisa ser **Owner** ou **Editor** do projeto
- Se for **Viewer**, peça ao dono para ativar a API

### Problema 3: "This API is not available in your region"

**Solução:**
- O Gemini pode não estar disponível em todos os países
- Use VPN conectada a EUA ou Europa
- Ou crie projeto no Vertex AI (Google Cloud - disponível em mais regiões)

### Problema 4: Ainda dá erro 429 após ativar

**Solução:**
1. Aguarde 10-15 minutos (propagação)
2. Verifique se ativou no projeto correto:
   ```bash
   # Ver qual projeto sua API Key pertence
   # No Google AI Studio → API Keys → clique na key → veja o projeto
   ```
3. Force refresh do Supabase Edge Function:
   ```bash
   supabase functions deploy generate-image-gemini
   ```

## 📊 Limites do Free Tier (Após Ativação)

| Métrica | Limite Grátis | Reset |
|---------|---------------|-------|
| **Imagens/dia** | 2.000 | Diário (00:00 UTC) |
| **Requisições/minuto** | 15 | A cada minuto |
| **Input tokens/minuto** | ~32.000 | A cada minuto |
| **Output tokens/minuto** | ~2.580.000 (2.000 imagens) | A cada minuto |

Fonte: https://ai.google.dev/pricing

## ✅ Checklist Final

Antes de testar novamente, verifique:

- [ ] API "Generative Language API" está ativada no projeto correto
- [ ] Aguardou 5-10 minutos após ativar
- [ ] API Key foi criada no mesmo projeto
- [ ] Testou no Google AI Studio e funcionou
- [ ] Re-deploy da Edge Function (opcional mas recomendado)

## 🎯 Próximo Passo

Depois de ativar a API:

1. **Aguarde 5-10 minutos**
2. **Teste no seu backoffice**
3. **Se funcionar** → Tudo certo! ✅
4. **Se ainda der erro** → Envie os logs para debug

---

**Última atualização**: 2025-11-19
**Autor**: Claude Code
