import { useState, useRef } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import CheckoutForm from "./CheckoutForm";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const submitFnRef = useRef<() => void>(() => {});

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemoveItem = (productId: string, productTitle: string) => {
    removeItem(productId);
    toast.success(`${productTitle} removido do carrinho`);
  };

  const handleCheckoutSuccess = () => {
    clearCart();
    setStep(1);
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) setStep(1);
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">

        {/* Header — fixo no topo */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="font-serif text-2xl">
            {step === 1 ? "A minha encomenda" : "Finalizar encomenda"}
          </SheetTitle>
          {step === 1 && (
            <SheetDescription>
              {totalQuantity === 0
                ? "Nenhum item"
                : `${totalQuantity} ${totalQuantity === 1 ? "item" : "itens"}`}
            </SheetDescription>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-6">Ainda não adicionou nenhum produto à sua encomenda.</p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
            >
              Voltar à loja
            </Button>
          </div>
        ) : step === 1 ? (
          <>
            {/* Passo 1 — lista de itens com scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-4 p-4 bg-card rounded-lg border border-border">
                  <img
                    src={item.product.image || "/src/assets/logo-reboho-no-bg.png"}
                    alt={`Imagem de ${item.product.title}`}
                    className="w-20 h-20 object-cover rounded-md"
                    onError={e => { e.currentTarget.src = "/src/assets/logo-reboho-no-bg.png"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-foreground mb-1 truncate">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      €{item.product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        aria-label={`Diminuir quantidade de ${item.product.title}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium" aria-label="Quantidade">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        aria-label={`Aumentar quantidade de ${item.product.title}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveItem(item.product.id, item.product.title)}
                      aria-label={`Remover ${item.product.title} do carrinho`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <p className="font-semibold text-foreground">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky footer passo 1 */}
            <div className="px-6 py-4 border-t border-border bg-background space-y-3">
              <div className="flex justify-between items-center text-lg font-serif font-bold">
                <span>Total:</span>
                <span className="text-primary">€{totalPrice.toFixed(2)}</span>
              </div>
              <Button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg font-semibold shadow-warm"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continuar
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Passo 2 — campos de checkout */}
            <div className="px-6 py-6">
              <CheckoutForm
                items={items}
                totalPrice={totalPrice}
                onSuccess={handleCheckoutSuccess}
                onSubmitRef={(fn) => { submitFnRef.current = fn; }}
              />
            </div>

            {/* Sticky footer passo 2 */}
            <div className="mt-auto px-6 py-4 border-t border-border bg-background space-y-3">
              <div className="flex justify-between items-center text-lg font-serif font-bold">
                <span>Total:</span>
                <span className="text-primary">€{totalPrice.toFixed(2)}</span>
              </div>
              <Button
                type="button"
                onClick={() => submitFnRef.current()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg font-semibold shadow-warm"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Finalizar Encomenda
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;