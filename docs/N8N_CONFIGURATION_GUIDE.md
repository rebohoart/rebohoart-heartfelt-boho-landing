# Guia de Configuração do n8n para Imagens Base64

Este guia explica como configurar o n8n para suportar respostas grandes com imagens em base64.

## Problema

Quando o n8n retorna imagens em base64, a resposta pode ser truncada devido a limites de:
- Tamanho de resposta HTTP
- Timeout do workflow
- Memória do workflow
- Configurações do nó Webhook

## Solução: Aumentar Limites no n8n

### 1. Configurações do Servidor n8n

Se você tem acesso ao servidor n8n (self-hosted), adicione estas variáveis de ambiente:

```bash
# .env do n8n ou docker-compose.yml

# Aumentar timeout de execução (em segundos)
EXECUTIONS_TIMEOUT=300
EXECUTIONS_TIMEOUT_MAX=600

# Aumentar limite de payload
N8N_PAYLOAD_SIZE_MAX=50

# Aumentar memória disponível (Node.js)
NODE_OPTIONS=--max-old-space-size=4096
```

**Para Docker:**
```yaml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - EXECUTIONS_TIMEOUT=300
      - EXECUTIONS_TIMEOUT_MAX=600
      - N8N_PAYLOAD_SIZE_MAX=50
      - NODE_OPTIONS=--max-old-space-size=4096
    # ... resto da configuração
```

**Para n8n Cloud:**
- Não é possível ajustar estas configurações
- Use a **Solução 1** (retornar URL em vez de base64)

### 2. Configurações do Workflow

#### 2.1. Nó "Webhook" (Trigger)

1. Abra o workflow no n8n
2. Clique no nó "Webhook" (o primeiro nó)
3. Configure:
   - **Response Mode**: `When Last Node Finishes`
   - **Response Headers**: Deixe vazio ou adicione `Content-Type: application/json`

**Nota:** O código de resposta HTTP 200 é retornado automaticamente quando o workflow é bem-sucedido. Não há campo separado "Response Code" no nó Webhook.

#### 2.2. Nó "Respond to Webhook"

1. Localize o nó final "Respond to Webhook"
2. Configure:
   - **Respond With**: `JSON`
   - **Response Body**:
     ```json
     {
       "image_url": "={{ $json.image_url }}",
       "success": true,
       "size": "={{ $json.image_url.length }}",
       "timestamp": "={{ $now.toISO() }}"
     }
     ```

#### 2.3. Adicionar Timeout no Nó de IA

Se estiver usando ComfyUI, Stable Diffusion ou DALL-E:

1. Clique no nó de geração de imagem
2. Em "Settings" (ícone de engrenagem) → "Retry On Fail"
3. Configure:
   - **Max Tries**: `3`
   - **Wait Between Tries**: `5000` ms

4. Em "Settings" → "Continue On Fail": `false`

### 3. Configurações de Memória no Workflow

#### 3.1. Adicionar Nó "Code" para Validar Tamanho

Adicione um nó "Code" antes do "Respond to Webhook":

```javascript
// Validar tamanho da resposta
const imageUrl = items[0].json.image_url;

if (!imageUrl) {
  throw new Error('image_url não encontrado na resposta');
}

// Log do tamanho
console.log(`Tamanho da imagem base64: ${imageUrl.length} caracteres`);
console.log(`Tamanho aproximado: ${(imageUrl.length / 1024).toFixed(2)} KB`);

// Verificar se não está truncado
if (imageUrl.endsWith('=') || imageUrl.endsWith('==')) {
  console.log('✅ Imagem tem padding correto');
} else {
  console.warn('⚠️ Imagem pode estar truncada (sem padding base64)');
}

// Se muito grande, avisar
if (imageUrl.length > 10000000) { // 10MB
  console.warn('⚠️ Imagem muito grande! Considere usar URL pública em vez de base64.');
}

return items;
```

### 4. Estrutura Recomendada do Workflow

```
┌─────────────────┐
│   Webhook       │ ← POST request com imagem
│   (Trigger)     │
└────────┬────────┘
         │
┌────────▼────────┐
│  Extract Base64 │ ← Extrair base64 do body.image
└────────┬────────┘
         │
┌────────▼────────┐
│  ComfyUI / AI   │ ← Gerar nova imagem (TIMEOUT: 180s)
└────────┬────────┘
         │
┌────────▼────────┐
│  Convert to     │ ← Converter para base64 se necessário
│  Base64         │
└────────┬────────┘
         │
┌────────▼────────┐
│  Validate Size  │ ← Validar tamanho (nó Code acima)
└────────┬────────┘
         │
┌────────▼────────┐
│  Respond to     │ ← Retornar JSON com image_url
│  Webhook        │
└─────────────────┘
```

## 5. Testes

### 5.1. Teste de Tamanho Mínimo

Adicione um nó "Code" de teste que retorna base64 pequeno:

```javascript
return [{
  json: {
    image_url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    success: true,
    test: true
  }
}];
```

Este é um PNG 1x1 pixel. Se funcionar, o problema é tamanho.

### 5.2. Teste de Tamanho Realista

Gere uma imagem 512x512 e verifique o tamanho no log:
- PNG 512x512: ~150-500 KB base64 (~200k-700k caracteres)
- JPEG 512x512: ~50-150 KB base64 (~70k-200k caracteres)

### 5.3. Verificar Logs no n8n

1. Execute o workflow
2. Clique em "Executions" (histórico)
3. Verifique:
   - **Duration**: Tempo de execução
   - **Status**: Success ou Error
   - **Output**: Tamanho da resposta em cada nó

## 6. Monitoramento

### 6.1. Adicionar Alertas

No último nó antes do "Respond to Webhook", adicione:

```javascript
const startTime = $execution.startTime;
const duration = Date.now() - new Date(startTime).getTime();

console.log(`⏱️ Tempo total: ${duration}ms`);

if (duration > 120000) { // 2 minutos
  console.warn('⚠️ Workflow está lento! Considere otimizar.');
}

return items;
```

## 7. Troubleshooting

### Problema: "Resposta vazia ou truncada"

**Causa**: Timeout ou limite de memória

**Solução**:
1. Verificar logs do n8n (Executions)
2. Aumentar `EXECUTIONS_TIMEOUT`
3. Reduzir tamanho da imagem gerada

### Problema: "504 Gateway Timeout"

**Causa**: Servidor nginx/proxy com timeout menor que o n8n

**Solução**:
```nginx
# nginx.conf
proxy_read_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
```

### Problema: "Memory limit exceeded"

**Causa**: Workflow usa muita memória

**Solução**:
1. Aumentar `NODE_OPTIONS=--max-old-space-size=8192`
2. Processar imagens em lotes menores
3. Usar streaming em vez de carregar tudo em memória

## 8. Alternativas (Solução 1)

Se os limites não resolverem, considere:

### 8.1. Usar Cloudinary

```javascript
// No n8n, após gerar imagem
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'seu_cloud_name',
  api_key: 'sua_api_key',
  api_secret: 'seu_api_secret'
});

const result = await cloudinary.uploader.upload(imageBase64, {
  folder: 'ai-generated'
});

return [{
  json: {
    image_url: result.secure_url, // URL pública
    success: true
  }
}];
```

### 8.2. Usar Supabase Storage

```javascript
// No n8n
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://seu-projeto.supabase.co',
  'sua_service_role_key'
);

const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`ai-generated/${Date.now()}.jpg`, imageBuffer);

const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(data.path);

return [{
  json: {
    image_url: publicUrl,
    success: true
  }
}];
```

## Resumo

✅ **Para self-hosted n8n**: Aumentar limites de timeout e memória
✅ **Para n8n Cloud**: Usar Solução 1 (retornar URL pública)
✅ **Sempre**: Adicionar logging e validação de tamanho
✅ **Recomendado**: Processar imagens em jobs assíncronos para imagens grandes
