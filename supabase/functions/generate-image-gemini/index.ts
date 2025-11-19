import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  image: string;
  prompt: string;
  filename?: string;
  mimeType?: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('⚠️ CORS preflight request received');
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`\n🆔 [${requestId}] Nova requisição recebida`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`🔗 URL: ${req.url}`);
  console.log(`📝 Method: ${req.method}`);

  try {
    console.log(`⏳ [${requestId}] Lendo body da requisição...`);
    const { image, prompt, filename, mimeType } = await req.json() as RequestBody;

    // Validate input
    if (!image || !prompt) {
      console.error(`❌ [${requestId}] Campos obrigatórios faltando`);
      throw new Error('Missing required fields: image and prompt');
    }

    console.log(`✅ [${requestId}] Body lido com sucesso`);
    console.log(`📊 Dados recebidos:`, {
      imageSize: `${image.length} caracteres (${(image.length / 1024).toFixed(2)} KB)`,
      prompt: prompt,
      filename: filename || 'não fornecido',
      mimeType: mimeType || 'não fornecido'
    });

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error(`❌ [${requestId}] GEMINI_API_KEY não configurada`);
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log(`🔑 [${requestId}] API Key encontrada: ${geminiApiKey.substring(0, 10)}...`);
    console.log(`🤖 [${requestId}] Gerando imagem com Gemini 2.5 Flash Image...`);
    console.log(`💬 Prompt: "${prompt}"`);

    // Prepare the request to Gemini API
    // Using Gemini 2.5 Flash Image - modelo que GERA imagens
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiApiKey}`;

    const geminiPayload = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: mimeType || 'image/jpeg',
              data: image
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        // IMPORTANTE: Especificar que queremos TEXT e IMAGE na resposta
        responseModalities: ["TEXT", "IMAGE"]
      }
    };

    console.log(`📋 [${requestId}] Configuração:`, {
      model: 'gemini-2.5-flash-image',
      responseModalities: ['TEXT', 'IMAGE'],
      hasInputImage: true,
    });

    console.log(`📤 [${requestId}] Enviando requisição para Gemini API...`);
    console.log(`🌐 URL: ${geminiUrl.substring(0, 100)}...`);

    const geminiStartTime = Date.now();
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });

    const geminiDuration = Date.now() - geminiStartTime;
    console.log(`📥 [${requestId}] Resposta do Gemini recebida em ${geminiDuration}ms`);
    console.log(`📊 Status: ${geminiResponse.status} ${geminiResponse.statusText}`);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`❌ [${requestId}] Erro da API do Gemini:`, errorText);

      // Tratamento específico para erro de quota (429)
      if (geminiResponse.status === 429) {
        console.error(`🚫 [${requestId}] ERRO DE QUOTA: A chave API do Gemini atingiu o limite`);

        // Tentar parsear a resposta de erro para extrair informações detalhadas
        let errorDetails: any = {};
        let retryDelay = null;
        let isQuotaExhausted = false;

        try {
          errorDetails = JSON.parse(errorText);

          // Extrair retry delay se disponível
          const retryInfo = errorDetails?.error?.details?.find(
            (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
          );
          if (retryInfo?.retryDelay) {
            retryDelay = retryInfo.retryDelay;
            console.log(`⏱️ [${requestId}] Retry sugerido após: ${retryDelay}`);
          }

          // Verificar se é quota totalmente esgotada (limit: 0) ou apenas rate limiting
          const quotaFailure = errorDetails?.error?.details?.find(
            (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
          );

          if (quotaFailure?.violations) {
            const hasZeroLimit = quotaFailure.violations.some((v: any) => {
              const message = errorDetails?.error?.message || '';
              return message.includes('limit: 0');
            });

            isQuotaExhausted = hasZeroLimit;
            console.log(`📊 [${requestId}] Quota completamente esgotada: ${isQuotaExhausted}`);
          }
        } catch (parseError) {
          console.warn(`⚠️ [${requestId}] Não foi possível parsear detalhes do erro`);
        }

        // Mensagem específica baseada no tipo de erro
        if (isQuotaExhausted) {
          throw new Error(
            `🚫 QUOTA DIÁRIA ESGOTADA\n\n` +
            `A API Key do Gemini atingiu o limite diário de requisições (2.000 imagens/dia grátis).\n\n` +
            `📋 O QUE FAZER:\n\n` +
            `1. ⏰ Aguarde o reset da quota:\n` +
            `   • A quota reseta diariamente às 00:00 UTC (21:00 horário de Brasília)\n` +
            `   • Verifique seu uso em: https://ai.dev/usage?tab=rate-limit\n\n` +
            `2. 💳 Ou faça upgrade para plano pago:\n` +
            `   • Acesse: https://ai.google.dev/pricing\n` +
            `   • Custo após limite grátis: ~$0.039 por imagem\n\n` +
            `3. 🔑 Ou use outra API Key:\n` +
            `   • Crie uma nova em: https://aistudio.google.com/app/apikey\n` +
            `   • Configure no Supabase Dashboard → Edge Functions → Secrets\n\n` +
            `💡 DICA: Planeje o uso para não exceder 2.000 gerações por dia no tier gratuito.\n\n` +
            `Detalhes técnicos: ${errorText.substring(0, 500)}`
          );
        } else {
          // Rate limiting temporário
          const waitTime = retryDelay || '60 segundos';
          throw new Error(
            `⏱️ RATE LIMIT TEMPORÁRIO\n\n` +
            `Muitas requisições em curto período. A API do Gemini tem limite de 15 requisições por minuto no tier gratuito.\n\n` +
            `📋 O QUE FAZER:\n\n` +
            `1. ⏰ Aguarde ${waitTime} e tente novamente\n` +
            `2. 📊 Evite múltiplas gerações simultâneas\n` +
            `3. 💳 Considere upgrade para limites maiores: https://ai.google.dev/pricing\n\n` +
            `💡 A requisição será bem-sucedida se você aguardar o tempo indicado.\n\n` +
            `Detalhes técnicos: ${errorText.substring(0, 500)}`
          );
        }
      }

      // Tratamento para outros erros
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json() as GeminiResponse;
    console.log(`✅ [${requestId}] Resposta do Gemini parseada com sucesso`);
    console.log(`📋 Estrutura da resposta:`, {
      hasCandidates: !!geminiData.candidates,
      candidatesCount: geminiData.candidates?.length || 0,
    });

    // Extract the generated content
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      console.error(`❌ [${requestId}] Nenhum candidato retornado pelo Gemini`);
      throw new Error('No candidates returned from Gemini API');
    }

    const candidate = geminiData.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error(`❌ [${requestId}] Nenhuma parte de conteúdo na resposta`);
      throw new Error('No content parts in Gemini response');
    }

    console.log(`🔍 [${requestId}] Analisando partes da resposta (${candidate.content.parts.length} partes)...`);

    // Look for inline image data in the response
    let generatedImage = null;
    let generatedText = null;

    for (let i = 0; i < candidate.content.parts.length; i++) {
      const part = candidate.content.parts[i];
      console.log(`  📦 Parte ${i + 1}:`, {
        hasInlineData: !!part.inlineData,
        hasText: !!part.text,
        textPreview: part.text ? part.text.substring(0, 100) + '...' : null,
      });

      if (part.inlineData && part.inlineData.data) {
        generatedImage = {
          mimeType: part.inlineData.mimeType,
          data: part.inlineData.data
        };
        console.log(`🖼️ [${requestId}] Imagem encontrada! MIME: ${part.inlineData.mimeType}, Tamanho: ${part.inlineData.data.length} caracteres`);
      }
      if (part.text) {
        generatedText = part.text;
        console.log(`📝 [${requestId}] Texto encontrado (${part.text.length} caracteres)`);
      }
    }

    // Return the result
    const result: any = {
      success: true,
      timestamp: new Date().toISOString(),
    };

    if (generatedImage) {
      // Return as base64 data URI
      result.image_url = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
      result.mimeType = generatedImage.mimeType;
      console.log(`✅ [${requestId}] Imagem gerada com sucesso!`);
      console.log(`📊 Tamanho final: ${result.image_url.length} caracteres`);
    } else if (generatedText) {
      // If Gemini returns text instead of image, include it in response
      result.text = generatedText;
      result.success = false;
      result.message = '⚠️ AVISO: O modelo Gemini 2.0 Flash retornou TEXTO ao invés de IMAGEM. Este modelo NÃO gera imagens - ele apenas analisa imagens e retorna descrições em texto. Para gerar imagens, é necessário usar um modelo de geração de imagens como Imagen 3 ou outra API de geração de imagens.';
      console.warn(`⚠️ [${requestId}] Gemini retornou texto ao invés de imagem!`);
      console.warn(`📝 Texto retornado: ${generatedText.substring(0, 200)}...`);
      console.warn(`💡 O modelo gemini-2.0-flash-exp NÃO gera imagens! Use Imagen 3 ou outro modelo de geração.`);
    } else {
      console.error(`❌ [${requestId}] Nenhum conteúdo (imagem ou texto) encontrado na resposta`);
      throw new Error('No image or text content in Gemini response');
    }

    console.log(`✅ [${requestId}] Requisição finalizada com sucesso`);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error(`❌ [${requestId}] Erro na Edge Function:`, error);
    console.error(`🔴 Stack trace:`, error instanceof Error ? error.stack : 'N/A');

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        requestId: requestId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
