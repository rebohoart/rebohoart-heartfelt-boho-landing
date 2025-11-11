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

    const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      toast.error("URL do webhook n8n não configurada. Configure VITE_N8N_WEBHOOK_URL no ficheiro .env");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      console.log("🎨 Enviando imagem para n8n...");

      // Converter imagem para base64
      const base64Image = await convertImageToBase64(selectedImage);

      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: {
            image: base64Image,
            filename: selectedImage.name,
            mimeType: selectedImage.type,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      console.log("📥 Resposta recebida:", {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
      });

      // Primeiro, pegar o texto da resposta
      const responseText = await response.text();
      console.log("📄 Response body (primeiros 500 caracteres):", responseText.substring(0, 500));

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
        throw new Error(
          `Webhook n8n não retornou JSON válido.\n\nStatus: ${response.status}\nContent-Type: ${response.headers.get("content-type")}\n\nResposta recebida:\n${responseText.substring(0, 300)}\n\nVerifique se o workflow n8n está:\n1. Ativo (toggle ligado)\n2. Configurado para retornar JSON\n3. Com o nó "Respond to Webhook" correto`
        );
      }

      console.log("✅ Resposta do n8n (JSON):", data);

      // Adapte conforme a estrutura de resposta do seu workflow n8n
      // Exemplo: data.image_url ou data.url ou data.image ou data.output
      const imageUrl = data.image_url || data.url || data.image || data.output;

      if (!imageUrl) {
        console.error("Estrutura de resposta inesperada:", data);
        throw new Error(
          `Imagem não encontrada na resposta do n8n.\n\nCampos esperados: image_url, url, image, output\nCampos recebidos: ${Object.keys(data).join(", ")}\n\nVerifique a estrutura do workflow n8n.`
        );
      }

      setGeneratedImage(imageUrl);
      toast.success("Imagem gerada com sucesso!");
    } catch (error: unknown) {
      console.error("❌ Erro ao gerar imagem:", error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao gerar imagem: ${message}`);
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
            💡 O seu workflow n8n processará a imagem com o prompt configurado
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
