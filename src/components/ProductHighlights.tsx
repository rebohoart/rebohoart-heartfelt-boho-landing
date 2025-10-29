import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import macrameWall from "@/assets/product-macrame-wall.jpg";
import ceramicPlanter from "@/assets/product-ceramic-planter.jpg";
import wovenBasket from "@/assets/product-woven-basket.jpg";
import canvasArt from "@/assets/product-canvas-art.jpg";

// Map image filenames to actual imports
const imageMap: Record<string, string> = {
  'product-macrame-wall.jpg': macrameWall,
  'product-ceramic-planter.jpg': ceramicPlanter,
  'product-woven-basket.jpg': wovenBasket,
  'product-canvas-art.jpg': canvasArt,
};

const ProductHighlights = () => {
  const { addItem } = useCart();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Map image filenames to actual image imports
      return data.map(product => ({
        ...product,
        image: imageMap[product.image] || product.image,
      }));
    },
  });

  const handleAddToCart = (product: typeof products[0]) => {
    addItem(product);
    toast.success(`${product.title} adicionado ao carrinho!`, {
      duration: 2000,
    });
  };

  if (isLoading) {
    return (
      <section id="products-section" className="py-20 px-4 bg-gradient-natural">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">A carregar produtos...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="products-section" className="py-20 px-4 bg-gradient-natural">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Our Artisan Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each piece is handcrafted with sustainable materials and ethical practices, 
            carrying the story of slow artistry into your home
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <Card 
              key={product.id}
              className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-warm animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="font-bold text-primary text-lg whitespace-nowrap ml-2">
                    €{product.price.toFixed(2)}
                  </p>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {product.description}
                </p>

                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all hover:scale-105 shadow-soft"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductHighlights;
