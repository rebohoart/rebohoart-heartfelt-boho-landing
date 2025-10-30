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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { escapeHtml, validateImageFile } from "@/lib/sanitize";
import { z } from "zod";

interface CustomOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getMinDeliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7); // Add 7 days
  return date;
};

const customOrderSchema = z.object({
  customerName: z.string()
    .trim()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome não pode ter mais de 100 caracteres" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Nome deve conter apenas letras" }),
  customerEmail: z.string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email não pode ter mais de 255 caracteres" }),
  title: z.string()
    .trim()
    .min(3, { message: "Título deve ter pelo menos 3 caracteres" })
    .max(200, { message: "Título não pode ter mais de 200 caracteres" }),
  description: z.string()
    .trim()
    .min(10, { message: "Descrição deve ter pelo menos 10 caracteres" })
    .max(2000, { message: "Descrição não pode ter mais de 2000 caracteres" }),
  deliveryDeadline: z.string()
    .min(1, { message: "Data limite de entrega é obrigatória" })
    .refine((date) => {
      const selectedDate = new Date(date);
      const minDate = getMinDeliveryDate();
      return selectedDate >= minDate;
    }, { message: "A data limite deve ser pelo menos 1 semana a partir de hoje" }),
});

const CustomOrderForm = ({ open, onOpenChange }: CustomOrderFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    customerName: "",
    customerEmail: "",
    deliveryDeadline: "",
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
        // Validate file before upload
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          toast.error(validation.error || "Ficheiro inválido");
          continue; // Skip this file and continue with others
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('custom-orders')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('custom-orders')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setUploadedImages([...uploadedImages, ...uploadedUrls]);
        toast.success("Imagens carregadas com sucesso!");
      }
    } catch (error: unknown) {
      toast.error("Erro ao carregar imagens. Por favor, tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data with Zod schema
    const validation = customOrderSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      // Escape user input to prevent XSS attacks
      const safeTitle = escapeHtml(formData.title);
      const safeDescription = escapeHtml(formData.description).replace(/\n/g, '<br>');
      const safeName = escapeHtml(formData.customerName);
      const safeEmail = escapeHtml(formData.customerEmail);
      const safeDeadline = escapeHtml(formData.deliveryDeadline);

      // Format the deadline date for display
      const formattedDeadline = new Date(formData.deliveryDeadline).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      // Sanitize URLs (already from our storage, but good practice)
      const safeImages = uploadedImages.map(url => escapeHtml(url));

      const details = `
        <strong>Título:</strong> ${safeTitle}<br><br>
        <strong>Descrição:</strong><br>${safeDescription}<br><br>
        <strong>Data Limite de Entrega:</strong> ${formattedDeadline}<br><br>
        ${safeImages.length > 0 ? `<strong>Imagens de Referência:</strong><br>${safeImages.map((url, i) => `<a href="${url}">Imagem ${i + 1}</a>`).join('<br>')}` : ''}
      `;

      const response = await supabase.functions.invoke('send-order-email', {
        body: {
          type: 'custom',
          customerName: safeName,
          customerEmail: safeEmail,
          details: details,
        },
      });

      if (response.error) throw response.error;

      toast.success("Pedido enviado com sucesso! Entraremos em contacto em breve.");
      setFormData({ title: "", description: "", customerName: "", customerEmail: "", deliveryDeadline: "" });
      setUploadedImages([]);
      onOpenChange(false);
    } catch (error: unknown) {
      // Don't expose detailed error messages to users
      toast.error("Erro ao enviar pedido. Por favor, tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Peça Personalizada
          </DialogTitle>
          <DialogDescription>
            Descreve a tua ideia e recebe um orçamento personalizado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">O Teu Nome</Label>
            <Input
              id="customerName"
              placeholder="Ex: Maria Silva"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">O Teu Email</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="Ex: maria@exemplo.com"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título da Peça</Label>
            <Input
              id="title"
              placeholder="Ex: Macramé personalizado"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              minLength={3}
              maxLength={200}
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
              minLength={10}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDeadline">Data Limite de Entrega</Label>
            <Input
              id="deliveryDeadline"
              type="date"
              value={formData.deliveryDeadline}
              onChange={(e) => setFormData({ ...formData, deliveryDeadline: e.target.value })}
              min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 1 semana a partir de hoje
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
              Pedir Orçamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomOrderForm;
