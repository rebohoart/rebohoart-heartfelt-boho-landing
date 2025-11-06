import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag } from "lucide-react";
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
}

const CheckoutForm = ({ items, totalPrice, onSuccess }: CheckoutFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    setIsSubmitting(true);

    try {
      // Escape user input to prevent XSS attacks
      const safeName = escapeHtml(formData.name);
      const safeEmail = escapeHtml(formData.email);

      // Save order to database
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
        .map(
          (item) => {
            // Escape product title (even though it comes from DB, good practice)
            const safeTitle = escapeHtml(item.product.title);
            return `<tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${safeTitle}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${item.product.price.toFixed(2)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">€${(item.product.price * item.quantity).toFixed(2)}</td>
            </tr>`;
          }
        )
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

      // Check for errors in response
      if (response.error) {
        console.error("Function invocation error:", response.error);
        throw response.error;
      }

      // Check HTTP status
      if (!response.data || response.data.success === false) {
        console.error("Email sending failed:", response.data);
        throw new Error(response.data?.error || "Failed to send email");
      }

      console.log("Order email sent successfully:", response.data);

      toast.success("Encomenda enviada com sucesso! Aguarda o nosso contacto.", {
        duration: 5000,
      });
      onSuccess();
    } catch (error: unknown) {
      console.error("Checkout form error:", error);
      // Don't expose detailed error messages to users
      toast.error("Erro ao enviar encomenda. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="checkout-name">O Teu Nome</Label>
        <Input
          id="checkout-name"
          placeholder="Ex: Maria Silva"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkout-email">O Teu Email</Label>
        <Input
          id="checkout-email"
          type="email"
          placeholder="Ex: maria@exemplo.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg font-semibold shadow-warm"
      >
        <ShoppingBag className="w-5 h-5 mr-2" />
        {isSubmitting ? "A enviar..." : "Finalizar Encomenda"}
      </Button>
    </form>
  );
};

export default CheckoutForm;
