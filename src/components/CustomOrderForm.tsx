import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Upload, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CustomOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomOrderForm = ({ open, onOpenChange }: CustomOrderFormProps) => {
  const { addItem } = useCart();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('custom-orders')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('custom-orders')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setUploadedImages([...uploadedImages, ...uploadedUrls]);
      toast.success("Imagens carregadas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao carregar imagens: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Por favor, insira um preço válido");
      return;
    }

    const customProduct = {
      id: `custom-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      image: uploadedImages[0] || "/src/assets/logo-reboho.png",
      images: uploadedImages,
      price: price,
      category: "Peça Personalizada",
    };

    addItem(customProduct);
    toast.success("Peça personalizada adicionada ao carrinho!");
    
    setFormData({ title: "", description: "", price: "" });
    setUploadedImages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Peça Personalizada
          </DialogTitle>
          <DialogDescription>
            Descreve a tua ideia e adiciona ao carrinho. Confirmamos os detalhes por Instagram DM.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Peça</Label>
            <Input
              id="title"
              placeholder="Ex: Macramé personalizado"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreve a tua ideia em detalhe: cores, tamanhos, materiais..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Orçamento Estimado (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 50.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              aria-describedby="price-description"
            />
            <p id="price-description" className="text-xs text-muted-foreground">
              Indique o orçamento aproximado para a sua peça personalizada
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Imagens de Referência (opcional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
                aria-label="Upload de imagens de referência"
              />
              <label htmlFor="images" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {uploading ? "A carregar..." : "Clique para adicionar imagens"}
                </p>
              </label>
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Imagem de referência ${index + 1}`}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remover imagem ${index + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomOrderForm;