import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import CheckoutForm from "./CheckoutForm";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  const handleRemoveItem = (productId: string, productTitle: string) => {
    removeItem(productId);
    toast.success(`${productTitle} removido do carrinho`);
  };

  const handleCheckoutSuccess = () => {
    clearCart();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">A minha encomenda</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "O seu carrinho está vazio"
              : `${items.length} ${items.length === 1 ? "item" : "itens"} no carrinho`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-6">
              Ainda não adicionou nenhum produto ao carrinho.
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
            >
              Continuar a Comprar
            </Button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-4 bg-card rounded-lg border border-border"
                >
                  <img
                    src={item.product.image || "/src/assets/logo-reboho-no-bg.png"}
                    alt={`Imagem de ${item.product.title}`}
                    className="w-20 h-20 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = "/src/assets/logo-reboho-no-bg.png";
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-foreground mb-1 truncate">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      €{item.product.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
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
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        aria-label={`Aumentar quantidade de ${item.product.title}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Remove and Subtotal */}
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        handleRemoveItem(item.product.id, item.product.title)
                      }
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

            {/* Footer */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-serif font-bold">
                <span>Total:</span>
                <span className="text-primary">€{totalPrice.toFixed(2)}</span>
              </div>

              <CheckoutForm 
                items={items}
                totalPrice={totalPrice}
                onSuccess={handleCheckoutSuccess}
              />

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full rounded-full"
              >
                Continuar a Comprar
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
