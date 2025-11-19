import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles, Download, Save, Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { validateImageFile } from "@/lib/sanitize";

const AIImageGenerator = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar ficheiro
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || "Ficheiro inválido");
      e.target.value = '';
      return;
    }

    setSelectedImage(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    toast.success("Imagem carregada! Pode agora gerar a nova versão.");
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setGeneratedImage(null);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remover o prefixo "data:image/...;base64,"
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast.error("Por favor, faça upload de uma imagem primeiro");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      console.log("🎨 Enviando imagem para Gemini API...");
      console.log("📍 Timestamp:", new Date().toISOString());
      const startTime = Date.now();

      // Converter imagem para base64
      const base64Image = await convertImageToBase64(selectedImage);
      console.log(`📊 Tamanho da imagem original em base64: ${base64Image.length} caracteres (${(base64Image.length / 1024).toFixed(2)} KB)`);

      // Criar AbortController para timeout mais curto (60 segundos)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error("⏱️ Timeout atingido após 60 segundos");
        controller.abort();
      }, 60000); // 60 segundos ao invés de 5 minutos

      // Prompt fixo para transformação de imagens em single-line art
      const FIXED_PROMPT = "Faz um desenho em single-line art com base nesta foto";

      // Chamar Supabase Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image-gemini`;
      console.log("🌐 Chamando Edge Function:", functionUrl);
      console.log("🔑 Usando token:", accessToken ? "Token de sessão" : "Publishable key");
      console.log("📦 Payload:", {
        imageLength: base64Image.length,
        filename: selectedImage.name,
        mimeType: selectedImage.type,
        prompt: FIXED_PROMPT,
      });

      let response;
      try {
        response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            image: base64Image,
            filename: selectedImage.name,
            mimeType: selectedImage.type,
            prompt: FIXED_PROMPT,
          }),
          signal: controller.signal,
        });
      } catch (fetchError: unknown) {
        console.error("❌ Erro no fetch da Edge Function:", fetchError);
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            throw new Error("Timeout: A geração demorou mais de 60 segundos. Tente com uma imagem menor.");
          }
          throw new Error(`Erro de rede: ${fetchError.message}`);
        }
        throw fetchError;
      }

      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;

      console.log("📥 Resposta recebida:", {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
        duration: `${duration}ms`,
      });

      // Primeiro, pegar o texto da resposta
      const responseText = await response.text();
      console.log("📄 Tamanho da resposta:", {
        bytes: responseText.length,
        kb: (responseText.length / 1024).toFixed(2),
        preview: responseText.substring(0, 500),
      });

      if (!response.ok) {
        throw new Error(
          `Erro HTTP: ${response.status} ${response.statusText}\n\nResposta: ${responseText.substring(0, 200)}`
        );
      }

      // Tentar fazer parse do JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("❌ Erro ao fazer parse do JSON:", jsonError);

        // Verificar se a resposta contém mensagens de erro
        let errorDetails = '';
        if (responseText.length === 0) {
          errorDetails = '\n\n⚠️ A Edge Function retornou resposta vazia.';
        } else if (responseText.startsWith('{') && !responseText.endsWith('}')) {
          errorDetails = '\n\n⚠️ Resposta JSON está truncada ou incompleta. Pode ser timeout ou limite de payload.';
        }

        throw new Error(
          `Edge Function não retornou JSON válido.\n\nStatus: ${response.status}\nContent-Type: ${response.headers.get("content-type")}\nResposta (primeiros 500 caracteres):\n${responseText.substring(0, 500)}${errorDetails}\n\nVerifique:\n1. A variável GEMINI_API_KEY está configurada no Supabase\n2. A Edge Function está deployed\n3. Os logs da função no Supabase Dashboard`
        );
      }

      console.log("✅ Resposta da Edge Function (JSON):", data);

      // Verificar se houve erro na resposta
      if (!data.success) {
        const errorMessage = data.error || data.message || 'Erro desconhecido ao gerar imagem';
        console.error("❌ Edge Function retornou erro:", errorMessage);

        // Detectar tipo de erro de quota
        const isApiNotEnabled = errorMessage.includes('API GEMINI NÃO ATIVADA');
        const isQuotaExhausted = errorMessage.includes('QUOTA DIÁRIA ESGOTADA');
        const isRateLimited = errorMessage.includes('RATE LIMIT TEMPORÁRIO');

        // Tratamento específico para API não ativada
        if (isApiNotEnabled) {
          console.error("🚫 API GEMINI NÃO ATIVADA");
          toast.error(
            "API Gemini não está ativada no Google Cloud. " +
            "Acesse https://console.cloud.google.com/apis/library e ative a 'Generative Language API'. " +
            "Veja detalhes no console (F12).",
            { duration: 20000 }
          );
          throw new Error(errorMessage);
        }

        // Tratamento específico para quota esgotada (não pode retry)
        if (isQuotaExhausted) {
          console.error("🚫 QUOTA DIÁRIA ESGOTADA");
          toast.error(
            "Quota diária do Gemini esgotada (2.000 imagens/dia grátis). " +
            "Aguarde o reset às 00:00 UTC ou configure nova API Key.",
            { duration: 15000 }
          );
          throw new Error(errorMessage);
        }

        // Tratamento específico para rate limiting temporário
        if (isRateLimited) {
          console.warn("⏱️ RATE LIMIT TEMPORÁRIO DETECTADO");

          // Extrair tempo de espera sugerido
          const waitTimeMatch = errorMessage.match(/Aguarde (\d+s|\d+ segundos)/);
          const waitTimeStr = waitTimeMatch ? waitTimeMatch[1] : '60 segundos';

          toast.warning(
            `Rate limit atingido. Aguarde ${waitTimeStr} e tente novamente. ` +
            `Limite: 15 requisições/minuto no tier gratuito.`,
            { duration: 10000 }
          );
          throw new Error(errorMessage);
        }

        // Tratamento genérico para erro de quota (fallback)
        if (errorMessage.includes('QUOTA EXCEDIDA') || errorMessage.includes('exceeded your current quota')) {
          console.error("🚫 ERRO DE QUOTA DETECTADO (genérico)");
          toast.error(
            "Quota da API Gemini excedida. Verifique seu uso em https://ai.dev/usage",
            { duration: 10000 }
          );
          throw new Error(errorMessage);
        }

        // Se retornou texto, mostrar mensagem específica
        if (data.text) {
          console.warn("⚠️ Gemini retornou texto ao invés de imagem:", data.text.substring(0, 200));
          throw new Error(
            `⚠️ PROBLEMA: O modelo Gemini 2.0 Flash NÃO gera imagens!\n\n` +
            `Ele retornou texto: "${data.text.substring(0, 150)}${data.text.length > 150 ? '...' : ''}"\n\n` +
            `SOLUÇÃO: Este modelo apenas analisa imagens. Para gerar imagens, é necessário:\n` +
            `1. Usar API Imagen 3 da Google (paga)\n` +
            `2. Ou integrar com outra API de geração de imagens (DALL-E, Stable Diffusion, etc.)\n\n` +
            `Consulte a documentação para mais detalhes.`
          );
        }

        throw new Error(errorMessage);
      }

      // Se retornou texto ao invés de imagem (quando success=true mas sem imagem)
      if (data.text && !data.image_url) {
        console.warn("⚠️ Gemini retornou texto ao invés de imagem:", data.text);
        throw new Error(
          `⚠️ O Gemini retornou uma descrição em texto ao invés de gerar uma imagem.\n\n` +
          `Resposta: "${data.text.substring(0, 200)}${data.text.length > 200 ? '...' : ''}"\n\n` +
          `Isto acontece porque o modelo gemini-2.0-flash-exp é um modelo de ANÁLISE de imagens, não de GERAÇÃO.`
        );
      }

      const imageUrl = data.image_url || data.url || data.image || data.output;

      if (!imageUrl) {
        console.error("Estrutura de resposta inesperada:", data);
        throw new Error(
          `Imagem não encontrada na resposta.\n\nCampos esperados: image_url, url, image, output\nCampos recebidos: ${Object.keys(data).join(", ")}`
        );
      }

      // Validar se é base64 e não está truncado
      if (imageUrl.startsWith('data:image')) {
        const base64Part = imageUrl.split(',')[1];
        console.log("🖼️ Imagem em base64 recebida:", {
          totalLength: imageUrl.length,
          base64Length: base64Part?.length || 0,
          sizeKB: (imageUrl.length / 1024).toFixed(2),
          hasPadding: base64Part?.endsWith('=') || base64Part?.endsWith('=='),
        });

        // Verificar se está truncado (muito pequeno ou sem padding)
        if (base64Part && base64Part.length < 100) {
          console.warn("⚠️ AVISO: Imagem base64 parece estar truncada!");
          console.warn("Tamanho recebido:", base64Part.length, "caracteres");
          console.warn("Esperado: milhares de caracteres para uma imagem real");
          toast.error(
            "⚠️ Imagem pode estar truncada. Verifique os logs da Edge Function no Supabase."
          );
        } else if (base64Part && !base64Part.endsWith('=') && !base64Part.endsWith('==')) {
          console.warn("⚠️ Base64 sem padding correto - pode estar truncado");
        }
      } else {
        console.log("🌐 URL pública recebida:", imageUrl);
      }

      setGeneratedImage(imageUrl);
      toast.success(`Imagem gerada com sucesso em ${(duration / 1000).toFixed(1)}s!`);
    } catch (error: unknown) {
      console.error("❌ Erro ao gerar imagem:", error);

      // Melhorar mensagens de erro
      let message = "Erro desconhecido";
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          message = "Timeout: A geração demorou mais de 60 segundos. Tente com uma imagem menor.";
        } else {
          message = error.message;
        }
      }

      // Toast com mensagem de erro
      toast.error(`Erro ao gerar imagem: ${message}`, {
        duration: 10000, // Mostrar por 10 segundos
      });

      // Log adicional para debugging
      console.error("💡 Dicas de troubleshooting:");
      console.error("1. Verifique se a GEMINI_API_KEY está configurada no Supabase");
      console.error("2. Verifique a quota da API em https://aistudio.google.com/app/apikey");
      console.error("3. Verifique se a Edge Function está deployed");
      console.error("4. Veja os logs no Supabase Dashboard → Edge Functions → generate-image-gemini → Logs");
      console.error("5. Tente com uma imagem menor (< 1MB)");
      console.error("6. Se erro 429: aguarde reset da quota (00:00 UTC) ou faça upgrade do plano");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToStorage = async () => {
    if (!generatedImage) return;

    setIsSaving(true);

    try {
      // Baixar a imagem
      const response = await fetch(generatedImage);
      const blob = await response.blob();

      // Criar nome do arquivo
      const fileName = `ai-generated-${Date.now()}.png`;
      const filePath = `${fileName}`;

      console.log("💾 Salvando imagem no Supabase Storage:", fileName);

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Erro ao fazer upload:", uploadError);
        throw uploadError;
      }

      console.log("✅ Upload bem-sucedido:", uploadData);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      console.log("🔗 URL pública:", publicUrl);

      // Atualizar a imagem exibida com a URL do Supabase
      setGeneratedImage(publicUrl);

      toast.success("Imagem salva no armazenamento! Pode agora usar esta URL nos produtos.");
    } catch (error: unknown) {
      console.error("❌ Erro ao salvar imagem:", error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao salvar imagem: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download iniciado!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-2">Geração de Imagens com IA</h2>
        <p className="text-muted-foreground">
          Faça upload de uma imagem e transforme-a usando inteligência artificial
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="image-upload">Imagem Inicial</Label>
            {!previewUrl ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mt-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isGenerating}
                  aria-label="Upload de imagem"
                />
                <label htmlFor="image-upload" className="cursor-pointer block">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Clique para selecionar uma imagem
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG ou WEBP (máx. 5MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="mt-2 relative">
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={previewUrl}
                    alt="Imagem para processar"
                    className="w-full h-auto max-h-96 object-contain bg-muted"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleRemoveImage}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  disabled={isGenerating}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remover
                </Button>
              </div>
            )}
          </div>

          {selectedImage && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{selectedImage.name}</span>
                <span className="text-muted-foreground">
                  ({(selectedImage.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedImage}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                A Processar Imagem...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Nova Versão com IA
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            💡 A API do Gemini processará a imagem e criará uma versão em single-line art
          </p>
        </div>
      </Card>

      {generatedImage && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Imagem Gerada pela IA</Label>
              <div className="mt-2 rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={generatedImage}
                  alt="Imagem gerada por IA"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveToStorage}
                disabled={isSaving}
                variant="default"
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    A Guardar...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar no Armazenamento
                  </>
                )}
              </Button>

              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Imagem
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm font-semibold">URL da Imagem</Label>
              <Input
                value={generatedImage}
                readOnly
                className="mt-2 font-mono text-xs"
                onClick={(e) => e.currentTarget.select()}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Clique para selecionar e copiar a URL
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIImageGenerator;
