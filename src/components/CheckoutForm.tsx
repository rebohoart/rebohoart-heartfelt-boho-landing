import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { escapeHtml } from "@/lib/sanitize";

interface CheckoutFormProps {
  items: Array<{
    product: {
      id: string;
      title: string;
      price: number;
      image: string;
    };
    quantity: number;
  }>;
  totalPrice: number;
  onSuccess: () => void;
  onSubmitRef?: (fn: () => void) => void;
}

const CheckoutForm = ({ items, totalPrice, onSuccess, onSubmitRef }: CheckoutFormProps) => {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = "Como te chamas?";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Precisamos do teu email para te contactar";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Este email não parece correto (ex: maria@gmail.com)";
    }

    setErrors(newErrors);

    if (newErrors.name) { nameRef.current?.focus(); return false; }
    if (newErrors.email) { emailRef.current?.focus(); return false; }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const safeName = escapeHtml(formData.name);
      const safeEmail = escapeHtml(formData.email);

      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        total_amount: totalPrice,
        items: items.map(item => ({
          product_id: item.product.id,
          product_title: item.product.title,
          product_price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity
        }))
      };

      const { error: dbError } = await supabase
        .from('orders')
        .insert([orderData]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      const details = items
        .map((item) => {
          const safeTitle = escapeHtml(item.product.title);
          return `<tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${safeTitle}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${item.product.price.toFixed(2)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">€${(item.product.price * item.quantity).toFixed(2)}</td>
            </tr>`;
        })
        .join("");

      const emailDetails = `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Produto</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qtd</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Preço Unit.</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${details}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #D4A574;">€${totalPrice.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      `;

      const response = await supabase.functions.invoke("send-order-email", {
        body: {
          type: "cart",
          customerName: safeName,
          customerEmail: safeEmail,
          details: emailDetails,
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

      toast.success("Encomenda enviada com sucesso! Aguarda o nosso contacto.", {
        duration: 5000,
      });
      onSuccess();
    } catch (error: unknown) {
      console.error("Checkout form error:", error);
      toast.error("Erro ao enviar encomenda. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (onSubmitRef) onSubmitRef(handleSubmit);

  const errorClass = "border-destructive focus-visible:ring-destructive";

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">* campos obrigatórios</p>

      <div className="space-y-2">
        <Label htmlFor="checkout-name">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          ref={nameRef}
          id="checkout-name"
          placeholder="Ex: Maria Silva"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          disabled={isSubmitting}
          className={errors.name ? errorClass : ""}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkout-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          ref={emailRef}
          id="checkout-email"
          type="email"
          placeholder="Ex: maria@gmail.com"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          disabled={isSubmitting}
          className={errors.email ? errorClass : ""}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      {/* Informação de pagamento */}
      <div className="flex items-start gap-3 rounded-xl bg-muted/60 border border-border px-4 py-3 text-sm text-muted-foreground">
        <span className="mt-0.5 text-base">💳</span>
        <p>
          Após finalizar, entraremos em contacto por email para confirmar a sua encomenda e enviar os dados de pagamento{" "}
          <span className="font-medium text-foreground">(MB Way ou Transferência bancária)</span>.
        </p>
      </div>
    </div>
  );
};

export default CheckoutForm;