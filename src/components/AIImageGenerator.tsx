import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Sparkles, Download, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AIImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, insira uma descrição para a imagem");
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
      console.log("🎨 Enviando prompt para n8n:", prompt);

      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Resposta do n8n:", data);

      // Adapte conforme a estrutura de resposta do seu workflow n8n
      // Exemplo: data.image_url ou data.url ou data.image
      const imageUrl = data.image_url || data.url || data.image || data.output;

      if (!imageUrl) {
        console.error("Estrutura de resposta inesperada:", data);
        throw new Error("Imagem não encontrada na resposta do n8n. Verifique a estrutura do workflow.");
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
          Use inteligência artificial para criar imagens únicas para os seus produtos
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="prompt">Descrição da Imagem</Label>
            <Textarea
              id="prompt"
              placeholder="Ex: Uma tigela de cerâmica artesanal com padrões boho em tons terrosos, sobre uma mesa de madeira rústica com luz natural suave..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isGenerating}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Dica: Seja específico sobre cores, estilo, ambiente e iluminação para melhores resultados
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                A Gerar Imagem...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Imagem com IA
              </>
            )}
          </Button>
        </div>
      </Card>

      {generatedImage && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Imagem Gerada</Label>
              <div className="mt-2 rounded-lg overflow-hidden border border-border">
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
