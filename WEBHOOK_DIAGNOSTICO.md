# 🔍 Guia de Diagnóstico do Webhook n8n

## Problema Atual

O webhook n8n está respondendo com o seguinte erro:
```
Problem in node 'Validate Input'
Nenhuma imagem foi enviada [line 7]
```

Isso significa que o workflow n8n está recebendo a requisição, mas **o formato dos dados não está correto**.

## 🛠️ Como Diagnosticar

### Passo 1: Abrir a Ferramenta de Diagnóstico

1. Abra o arquivo `diagnostico-webhook.html` no navegador
2. Selecione uma imagem pequena de teste (ex: screenshot, foto de produto)
3. Teste cada formato até encontrar o que funciona

### Passo 2: Testar Formatos

A ferramenta irá testar **6 formatos diferentes** de payload:

#### Formato 1: Base64 sem prefixo (atual)
```json
{
  "image": "iVBORw0KGgo...",
  "filename": "test.jpg",
  "mimeType": "image/jpeg",
  "timestamp": "2025-01-10T..."
}
```

#### Formato 2: Data URI completo
```json
{
  "image": "data:image/jpeg;base64,iVBORw0KGgo...",
  "filename": "test.jpg",
  "mimeType": "image/jpeg"
}
```

#### Formato 3: Campo "file"
```json
{
  "file": "iVBORw0KGgo...",
  "filename": "test.jpg",
  "mimeType": "image/jpeg"
}
```

#### Formato 4: Data URI no campo "file"
```json
{
  "file": "data:image/jpeg;base64,iVBORw0KGgo...",
  "filename": "test.jpg",
  "mimeType": "image/jpeg"
}
```

#### Formato 5: Estrutura aninhada
```json
{
  "body": {
    "image": "iVBORw0KGgo...",
    "filename": "test.jpg",
    "mimeType": "image/jpeg"
  }
}
```

#### Formato 6: Campo "imageData"
```json
{
  "imageData": "data:image/jpeg;base64,iVBORw0KGgo...",
  "filename": "test.jpg",
  "mimeType": "image/jpeg"
}
```

### Passo 3: Identificar o Formato Correto

Quando um formato funcionar, você verá:
- ✅ Status 200
- Imagem gerada exibida
- Mensagem "Este é o formato correto!"

### Passo 4: Atualizar o Código

Depois de identificar o formato correto, atualize o arquivo `src/components/AIImageGenerator.tsx`:

#### Exemplo: Se o Formato 2 funcionar

```typescript
// Linha ~89, substituir:
body: JSON.stringify({
  image: base64Image,  // ❌ Formato antigo
  filename: selectedImage.name,
  mimeType: selectedImage.type,
  timestamp: new Date().toISOString(),
}),

// Por:
body: JSON.stringify({
  image: `data:${selectedImage.type};base64,${base64Image}`,  // ✅ Data URI
  filename: selectedImage.name,
  mimeType: selectedImage.type,
}),
```

#### Exemplo: Se o Formato 3 funcionar

```typescript
body: JSON.stringify({
  file: base64Image,  // ✅ Campo "file" em vez de "image"
  filename: selectedImage.name,
  mimeType: selectedImage.type,
}),
```

## 🔧 Alternativa: Verificar o Workflow n8n

Se nenhum formato funcionar, o problema pode estar no workflow n8n:

### Checklist do Workflow n8n:

1. **Webhook está ativo?**
   - ✅ Toggle no canto superior direito deve estar VERDE
   - 📍 Clique em "Save" e depois ative o workflow

2. **Nó "Validate Input" - O que ele verifica?**
   - Abra o nó "Validate Input"
   - Verifique qual campo ele está tentando acessar
   - Exemplo comum: `{{ $json.image }}` ou `{{ $json.body.image }}`

3. **Estrutura esperada**
   - Adicione um nó "Code" logo depois do Webhook para logar:
   ```javascript
   console.log('Dados recebidos:', JSON.stringify($input.all()));
   return $input.all();
   ```
   - Execute o workflow e veja nos logs o que está chegando

4. **Content-Type**
   - Verifique se o nó Webhook aceita `application/json`
   - Vá em: Webhook → Headers → Verificar configurações

## 📝 Exemplo de Nó "Validate Input" no n8n

Se você tiver acesso ao workflow n8n, o nó "Validate Input" provavelmente tem algo assim:

```javascript
// Código do nó "Validate Input"
const image = $json.image || $json.file || $json.body?.image;

if (!image) {
  throw new Error('Nenhuma imagem foi enviada');
}

return { json: { image } };
```

Isso significa que ele está procurando por:
1. `$json.image` (Formato 1 ou 2)
2. `$json.file` (Formato 3 ou 4)
3. `$json.body.image` (Formato 5)

## 🎯 Próximos Passos

1. ✅ Abrir `diagnostico-webhook.html`
2. ✅ Testar cada formato
3. ✅ Identificar qual funciona
4. ✅ Atualizar `AIImageGenerator.tsx` com o formato correto
5. ✅ Testar no backoffice
6. ✅ Commit das alterações

## 💡 Dica Adicional

Se você tem acesso ao n8n, pode **exportar o workflow** e compartilhar para análise. Ou pode **compartilhar um screenshot** do nó "Validate Input" para eu ajudar a ajustar o código corretamente.

---

**Desenvolvido para Rebohoart** 🌿
Ferramenta de diagnóstico de integração n8n
