#!/usr/bin/env node

/**
 * Script de Teste para Webhook n8n
 * Testa o webhook de geração de imagens com IA
 */

const WEBHOOK_URL = "https://vibecodingc1.app.n8n.cloud/webhook-test/generate-from-upload";

// Imagem de teste pequena (1x1 pixel vermelho em PNG)
const TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

async function testWebhook() {
  console.log("🧪 Testando webhook n8n...");
  console.log("📍 URL:", WEBHOOK_URL);
  console.log("");

  const payload = {
    image: TEST_IMAGE_BASE64,
    filename: "test-image.png",
    mimeType: "image/png",
    timestamp: new Date().toISOString(),
  };

  console.log("📤 Enviando payload:");
  console.log("   - Tamanho da imagem (base64):", TEST_IMAGE_BASE64.length, "caracteres");
  console.log("   - Filename:", payload.filename);
  console.log("   - MIME Type:", payload.mimeType);
  console.log("");

  try {
    const startTime = Date.now();

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const elapsedTime = Date.now() - startTime;

    console.log("📥 Resposta recebida:");
    console.log("   - Status:", response.status, response.statusText);
    console.log("   - Tempo de resposta:", elapsedTime, "ms");
    console.log("   - Headers:");
    response.headers.forEach((value, key) => {
      console.log(`     ${key}: ${value}`);
    });
    console.log("");

    if (!response.ok) {
      console.error("❌ Erro HTTP:", response.status, response.statusText);
      const text = await response.text();
      console.error("   Resposta:", text);
      process.exit(1);
    }

    const data = await response.json();
    console.log("✅ Resposta JSON:");
    console.log(JSON.stringify(data, null, 2));
    console.log("");

    // Validar estrutura da resposta
    console.log("🔍 Validando estrutura da resposta...");

    const possibleFields = ["image_url", "url", "image", "output"];
    let imageUrlFound = false;
    let imageUrlField = null;

    for (const field of possibleFields) {
      if (data[field]) {
        imageUrlFound = true;
        imageUrlField = field;
        console.log(`   ✓ Campo '${field}' encontrado:`, data[field]);
        break;
      }
    }

    if (!imageUrlFound) {
      console.warn("   ⚠️  Nenhum campo de URL de imagem encontrado!");
      console.warn("   Campos esperados:", possibleFields.join(", "));
      console.warn("   Campos recebidos:", Object.keys(data).join(", "));
    }

    console.log("");
    console.log("✅ Teste concluído com sucesso!");
    console.log("");
    console.log("📋 Resumo:");
    console.log("   - Webhook está respondendo: ✓");
    console.log("   - Status HTTP:", response.status);
    console.log("   - Tempo de resposta:", elapsedTime, "ms");
    console.log("   - Campo de URL:", imageUrlField || "não encontrado");

  } catch (error) {
    console.error("❌ Erro ao testar webhook:");
    console.error("   ", error.message);
    console.error("");
    console.error("Stack trace:");
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar teste
testWebhook();
