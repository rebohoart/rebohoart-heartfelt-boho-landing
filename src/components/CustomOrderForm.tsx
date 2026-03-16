import { useState, useRef, useEffect } from "react";
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

interface CustomOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getMinDeliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};

interface FormErrors {
  customerName?: string;
  customerEmail?: string;
  title?: string;
  description?: string;
  deliveryDeadline?: string;
}

const CustomOrderForm = ({ open, onOpenChange }: CustomOrderFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    customerName: "",
    customerEmail: "",
    deliveryDeadline: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerNameRef = useRef<HTMLInputElement>(null);
  const customerEmailRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const deliveryDeadlineRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFormData({ title: "", description: "", customerName: "", customerEmail: "", deliveryDeadline: "" });
      setErrors({});
      setUploadedImages([]);
    }
  }, [open]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      newErrors.customerName = "Como te chamas?";
    } else if (!nameRegex.test(formData.customerName)) {
      newErrors.customerName = "Só letras, por favor";
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Precisamos do teu email para te contactar";
    } else if (!emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = "Este email não parece correto (ex: maria@gmail.com)";
    }

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = "Dá um nome à tua ideia";
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      newErrors.description = "Conta-nos um pouco mais sobre o que tens em mente";
    }

    if (!formData.deliveryDeadline) {
      newErrors.deliveryDeadline = "Quando precisas da peça?";
    } else if (new Date(formData.deliveryDeadline) < getMinDeliveryDate()) {
      newErrors.deliveryDeadline = "Precisamos de pelo menos 1 semana para criar a tua peça";
    }

    setErrors(newErrors);

    if (newErrors.customerName) { customerNameRef.current?.focus(); return false; }
    if (newErrors.customerEmail) { customerEmailRef.current?.focus(); return false; }
    if (newErrors.title) { titleRef.current?.focus(); return false; }
    if (newErrors.description) { descriptionRef.current?.focus(); return false; }
    if (newErrors.deliveryDeadline) { deliveryDeadlineRef.current?.focus(); return false; }

    return true;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          toast.error(validation.error || "Ficheiro inválido");
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('custom-orders')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('custom-orders')
          .getPublicUrl(fileName);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const customOrderData = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        title: formData.title,
        description: formData.description,
        delivery_deadline: formData.deliveryDeadline,
        images: uploadedImages.length > 0 ? uploadedImages : null
      };

      const { error: dbError } = await supabase
        .from('custom_orders')
        .insert([customOrderData]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      const safeTitle = escapeHtml(formData.title);
      const safeDescription = escapeHtml(formData.description).replace(/\n/g, '<br>');
      const safeName = escapeHtml(formData.customerName);
      const safeEmail = escapeHtml(formData.customerEmail);
      const safeImages = uploadedImages.map(url => escapeHtml(url));

      const formattedDeadline = new Date(formData.deliveryDeadline).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

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

      if (response.error) {
        console.error("Function invocation error:", response.error);
        throw response.error;
      }

      if (!response.data || response.data.success === false) {
        console.error("Email sending failed:", response.data);
        throw new Error(response.data?.error || "Failed to send email");
      }

      toast.success("Pedido enviado com sucesso! Entraremos em contacto em breve.");
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Custom order form error:", error);
      toast.error("Erro ao enviar pedido. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorClass = "border-destructive focus-visible:ring-destructive";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-full sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-none sm:rounded-2xl">
        <DialogTitle className="sr-only">Peça Personalizada</DialogTitle>

        {/* Área com scroll */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
          <DialogHeader className="mb-4">
            <h2 className="font-serif text-2xl font-bold">
              Peça Personalizada
            </h2>
            <DialogDescription>
              Descreve a tua ideia e recebe um orçamento personalizado.
            </DialogDescription>
          </DialogHeader>

          <form id="custom-order-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="text-xs text-muted-foreground">* campos obrigatórios</p>

            <div className="space-y-2">
              <Label htmlFor="customerName">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={customerNameRef}
                id="customerName"
                placeholder="Ex: Maria Silva"
                value={formData.customerName}
                onChange={(e) => {
                  setFormData({ ...formData, customerName: e.target.value });
                  if (errors.customerName) setErrors({ ...errors, customerName: undefined });
                }}
                disabled={isSubmitting}
                className={errors.customerName ? errorClass : ""}
              />
              {errors.customerName && <p className="text-xs text-destructive">{errors.customerName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={customerEmailRef}
                id="customerEmail"
                type="email"
                placeholder="Ex: maria@gmail.com"
                value={formData.customerEmail}
                onChange={(e) => {
                  setFormData({ ...formData, customerEmail: e.target.value });
                  if (errors.customerEmail) setErrors({ ...errors, customerEmail: undefined });
                }}
                disabled={isSubmitting}
                className={errors.customerEmail ? errorClass : ""}
              />
              {errors.customerEmail && <p className="text-xs text-destructive">{errors.customerEmail}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Título da peça <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={titleRef}
                id="title"
                placeholder="Ex: Macramé personalizado"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                disabled={isSubmitting}
                className={errors.title ? errorClass : ""}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição <span className="text-destructive">*</span>
              </Label>
              <Textarea
                ref={descriptionRef}
                id="description"
                placeholder="Descreve cores, tamanho, materiais..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: undefined });
                }}
                className={`min-h-[120px] ${errors.description ? errorClass : ""}`}
                disabled={isSubmitting}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDeadline">
                Data de entrega <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={deliveryDeadlineRef}
                id="deliveryDeadline"
                type="date"
                value={formData.deliveryDeadline}
                onChange={(e) => {
                  setFormData({ ...formData, deliveryDeadline: e.target.value });
                  if (errors.deliveryDeadline) setErrors({ ...errors, deliveryDeadline: undefined });
                }}
                min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                disabled={isSubmitting}
                className={errors.deliveryDeadline ? errorClass : ""}
              />
              <p className="text-xs text-muted-foreground">Mínimo de 1 semana a partir de hoje</p>
              {errors.deliveryDeadline && <p className="text-xs text-destructive">{errors.deliveryDeadline}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Imagens de referência (opcional)</Label>
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
                        alt={`Imagem de referência ${index + 1}`} loading="lazy"
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
          </form>
        </div>

        {/* Sticky footer */}
        <div className="px-6 py-4 border-t border-border bg-background">
          <Button
            type="submit"
            form="custom-order-form"
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full py-6 text-lg font-semibold"
            disabled={isSubmitting}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isSubmitting ? "A enviar..." : "Pedir Orçamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomOrderForm;