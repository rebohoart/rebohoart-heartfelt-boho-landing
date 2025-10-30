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
import { Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

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
      image: "",
      price: price,
      category: "Peça Personalizada",
    };

    addItem(customProduct);
    toast.success("Peça personalizada adicionada ao carrinho!");
    
    setFormData({ title: "", description: "", price: "" });
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
            />
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