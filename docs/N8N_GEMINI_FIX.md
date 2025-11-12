# 🔧 Guia de Correção: Workflow n8n com Google Gemini

## Problema Identificado

### Erro no Google Gemini
```
Bad request - please check your parameters
Error: GenerateContentRequest.contents[0].parts[0].data: required oneof field 'data' must have one initialized field
Status: INVALID_ARGUMENT (400)
```

**Causa:** O nó Google Gemini não está recebendo a imagem base64 corretamente no campo `data`.

### Erro no Frontend
```
Resposta não é JSON válido
Unexpected end of JSON input
```

**Causa:** Quando o workflow falha no nó Google Gemini, ele não retorna uma resposta JSON válida, causando erro no frontend.

---

## 📦 Estrutura do Payload Enviado pelo Frontend

O frontend agora envia o seguinte payload:

```json
{
  "image": "iVBORw0KGgoAAAANSUhEUg...",
  "filename": "produto.jpg",
  "mimeType": "image/jpeg",
  "timestamp": "2025-11-12T19:30:00.000Z",
  "prompt": "Transform this into a beautiful boho-style product photo with natural lighting, warm earth tones, artistic composition, soft shadows, and an elegant aesthetic. Professional photography quality."
}
```

**Campos:**
- `image`: String base64 pura (sem prefixo `data:image/...;base64,`)
- `filename`: Nome do arquivo original
- `mimeType`: Tipo MIME da imagem (ex: `image/jpeg`, `image/png`)
- `timestamp`: Timestamp da requisição
- `prompt`: Prompt fixo para transformação da imagem

---

## 🛠️ Correção do Workflow n8n

### Estrutura Recomendada do Workflow

```
┌─────────────────┐
│   Webhook       │ ← Recebe POST com payload JSON
│   (Trigger)     │
└────────┬────────┘
         │
┌────────▼────────┐
│ Validate Input  │ ← Valida e prepara dados
│   (Code Node)   │
└────────┬────────┘
         │
┌────────▼────────┐
│ Google Gemini   │ ← Gera imagem transformada
│  (AI Model)     │
└────────┬────────┘
         │
┌────────▼────────┐
│ Extract Result  │ ← Extrai URL/base64 da imagem
│   (Code Node)   │
└────────┬────────┘
         │
┌────────▼────────┐
│ Respond to      │ ← Retorna JSON com image_url
│   Webhook       │
└─────────────────┘
```

---

## 1. Nó Webhook (Trigger)

**Configuração:**
- **HTTP Method:** `POST`
- **Path:** `generate-from-upload` (ou outro de sua escolha)
- **Authentication:** None (ou configure se necessário)
- **Response Mode:** `When Last Node Finishes`

---

## 2. Nó "Validate Input" (Code Node)

**Propósito:** Validar que a imagem foi enviada e preparar os dados para o Google Gemini.

### Código JavaScript:

```javascript
// Receber dados do webhook
const inputData = $input.item.json;

// Validar campos obrigatórios
if (!inputData.image) {
  throw new Error('Campo "image" é obrigatório no payload');
}

if (!inputData.prompt) {
  throw new Error('Campo "prompt" é obrigatório no payload');
}

// Preparar dados para o Google Gemini
// IMPORTANTE: O Gemini espera base64 SEM prefixo
const base64Image = inputData.image.includes(',')
  ? inputData.image.split(',')[1]  // Se vier com prefixo, remover
  : inputData.image;                // Já vem sem prefixo

// Extrair mimeType corretamente
const mimeType = inputData.mimeType || 'image/jpeg';

// Log para debug
console.log('✅ Validação OK');
console.log('📊 Tamanho da imagem base64:', base64Image.length, 'caracteres');
console.log('📝 Prompt:', inputData.prompt);
console.log('🖼️ MIME Type:', mimeType);

// Retornar dados preparados
return {
  json: {
    imageBase64: base64Image,
    prompt: inputData.prompt,
    mimeType: mimeType,
    filename: inputData.filename || 'image.jpg',
    timestamp: inputData.timestamp || new Date().toISOString()
  }
};
```

**Saída deste nó:**
```json
{
  "imageBase64": "iVBORw0KGgoAAAANSUhEUg...",
  "prompt": "Transform this into...",
  "mimeType": "image/jpeg",
  "filename": "produto.jpg",
  "timestamp": "2025-11-12T19:30:00.000Z"
}
```

---

## 3. Nó "Google Gemini" (AI Model)

**Tipo:** `@n8n/n8n-nodes-langchain.googleGemini`

### Configuração do Nó:

1. **Credentials:** Configure suas credenciais do Google Gemini
   - API Key do Google AI Studio ou Vertex AI

2. **Model:** Escolha o modelo (recomendado: `gemini-1.5-pro` ou `gemini-1.5-flash`)

3. **Operation:** `Generate Content` (ou similar, dependendo da versão)

### ⚠️ IMPORTANTE: Configuração do Input

**O erro atual acontece porque o campo `data` está vazio.**

#### Solução 1: Usar Text Prompt com referência à imagem

No campo **Prompt** ou **Text**, use:

```
{{ $json.prompt }}
```

E no campo **Image** ou **Inline Data**, configure:

- **MIME Type:** `{{ $json.mimeType }}`
- **Data:** `{{ $json.imageBase64 }}`

#### Solução 2: Usar um nó Code para formatar o request

Se o nó Gemini não aceita diretamente, crie um nó **Code** antes do Gemini:

```javascript
const imageBase64 = $input.item.json.imageBase64;
const prompt = $input.item.json.prompt;
const mimeType = $input.item.json.mimeType;

// Formato esperado pelo Google Gemini API
return {
  json: {
    contents: [
      {
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048
    }
  }
};
```

E então use um nó **HTTP Request** para chamar a API do Gemini diretamente:

**HTTP Request Node:**
- **Method:** `POST`
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY`
- **Authentication:** None (API key na URL)
- **Body:** `{{ $json }}`

---

## 4. Nó "Extract Result" (Code Node)

**Propósito:** Extrair a URL da imagem gerada (ou base64) da resposta do Gemini.

### Código JavaScript:

```javascript
const geminiResponse = $input.item.json;

// O formato da resposta varia dependendo de como o Gemini foi chamado
// Exemplo genérico:

let imageUrl;

// Caso 1: Gemini retornou URL pública
if (geminiResponse.candidates?.[0]?.content?.parts?.[0]?.fileData?.fileUri) {
  imageUrl = geminiResponse.candidates[0].content.parts[0].fileData.fileUri;
}
// Caso 2: Gemini retornou base64
else if (geminiResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
  const base64 = geminiResponse.candidates[0].content.parts[0].inlineData.data;
  const mimeType = geminiResponse.candidates[0].content.parts[0].inlineData.mimeType;
  imageUrl = `data:${mimeType};base64,${base64}`;
}
// Caso 3: Gemini retornou texto (pode incluir URL)
else if (geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
  const text = geminiResponse.candidates[0].content.parts[0].text;
  // Tentar extrair URL do texto
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  imageUrl = urlMatch ? urlMatch[0] : null;
}

if (!imageUrl) {
  console.error('❌ Resposta do Gemini:', JSON.stringify(geminiResponse, null, 2));
  throw new Error('Não foi possível extrair a imagem da resposta do Gemini');
}

console.log('✅ Imagem gerada:', imageUrl.substring(0, 100) + '...');

return {
  json: {
    image_url: imageUrl,
    success: true
  }
};
```

---

## 5. Nó "Respond to Webhook"

**Tipo:** `Respond to Webhook`

**Configuração:**
- **Respond With:** `Using Fields Below`
- **Response Headers:**
  - `Content-Type`: `application/json`

**Response Body:**
```json
{
  "image_url": "={{ $json.image_url }}",
  "success": true
}
```

**Nota:** O código de resposta HTTP 200 é retornado automaticamente quando o workflow é bem-sucedido. Não há campo separado para configurar o status code no nó "Respond to Webhook".

---

## 🔍 Debugging: Como Verificar os Dados

### 1. Adicionar nós de Debug

Após cada nó importante, adicione um **Code** node temporário:

```javascript
console.log('=== DEBUG ===');
console.log('Dados recebidos:', JSON.stringify($input.item.json, null, 2));
return $input.all();
```

### 2. Verificar Executions

1. Execute o workflow manualmente com o teste HTML
2. Vá em **Executions** no n8n
3. Clique na execução mais recente
4. Verifique:
   - ✅ Todos os nós executaram com sucesso?
   - ❌ Onde está falhando?
   - 📊 Que dados cada nó está recebendo/retornando?

### 3. Testar com Payload Mínimo

Use o `test-webhook.html` para enviar uma imagem pequena (1x1 pixel):

```javascript
// Imagem base64 mínima para teste (PNG 1x1 pixel vermelho)
const TEST_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
```

---

## ⚠️ Problemas Comuns e Soluções

### Problema 1: "required oneof field 'data' must have one initialized field"

**Causa:** O campo `data` no request do Gemini está vazio.

**Solução:**
1. Verificar se `$json.imageBase64` contém dados
2. Adicionar log antes do nó Gemini:
   ```javascript
   console.log('Base64 length:', $json.imageBase64?.length);
   ```
3. Garantir que o nó "Validate Input" está retornando `imageBase64` corretamente

### Problema 2: "Unexpected end of JSON input" no frontend

**Causa:** Workflow n8n falhou e não retornou JSON.

**Solução:**
1. Adicionar **Error Trigger** no workflow
2. Conectar a um nó "Respond to Webhook" com erro:
   ```json
   {
     "success": false,
     "error": "Workflow falhou",
     "message": "={{ $json.error?.message }}"
   }
   ```

### Problema 3: Imagem muito grande (timeout)

**Solução:**
1. Redimensionar imagem antes de enviar (frontend)
2. Aumentar timeout no Gemini node
3. Usar Gemini Flash (mais rápido que Pro)

---

## 📊 Estrutura Completa do Payload (Referência)

### Request (Frontend → n8n):
```json
{
  "image": "iVBORw0KGgoAAAANSUhEUg...",
  "filename": "produto.jpg",
  "mimeType": "image/jpeg",
  "timestamp": "2025-11-12T19:30:00.000Z",
  "prompt": "Transform this into a beautiful boho-style product photo..."
}
```

### Response (n8n → Frontend):
```json
{
  "image_url": "data:image/jpeg;base64,/9j/4AAQSkZJRg..." ,
  "success": true
}
```

ou

```json
{
  "image_url": "https://storage.googleapis.com/generativelanguage/.../image.jpg",
  "success": true
}
```

---

## 🧪 Testes Recomendados

### 1. Teste com `test-webhook.html`
```bash
# Abrir no navegador
open test-webhook.html
```

### 2. Teste com `diagnostico-webhook.html`
```bash
# Testar diferentes formatos de payload
open diagnostico-webhook.html
```

### 3. Teste com curl

```bash
curl -X POST https://vibecodingc1.app.n8n.cloud/webhook-test/generate-from-upload \
  -H "Content-Type: application/json" \
  -d '{
    "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
    "filename": "test.png",
    "mimeType": "image/png",
    "timestamp": "2025-11-12T19:30:00.000Z",
    "prompt": "Transform this into a beautiful boho-style product photo"
  }'
```

---

## ✅ Checklist de Verificação

- [ ] Webhook está **ATIVO** (toggle verde no n8n)
- [ ] Nó "Validate Input" retorna `imageBase64`, `prompt`, `mimeType`
- [ ] Nó Google Gemini recebe os campos corretamente
- [ ] Campo `data` no Gemini NÃO está vazio
- [ ] Nó "Extract Result" extrai `image_url` da resposta
- [ ] Nó "Respond to Webhook" retorna JSON válido
- [ ] Error Trigger configurado para retornar erro em JSON
- [ ] Teste com imagem pequena funciona
- [ ] Teste com imagem real funciona
- [ ] Frontend exibe a imagem gerada

---

## 📚 Referências

- [Google Gemini API - Generate Content](https://ai.google.dev/api/generate-content)
- [Google Gemini API - Image Input](https://ai.google.dev/gemini-api/docs/vision)
- [n8n Documentation](https://docs.n8n.io/)
- [n8n Google Gemini Node](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatgooglegemini/)

---

**Desenvolvido para Rebohoart** 🌿
Guia de correção do workflow n8n com Google Gemini
