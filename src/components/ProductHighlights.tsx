import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductImageGallery from "@/components/ProductImageGallery";
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

  const { data: products = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('🔍 Fetching products from Supabase...');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching products:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Products fetched successfully:', data?.length || 0, 'products');

      // Map image filenames to actual image imports
      return data.map(product => {
        const imagesArray = product.images && product.images.length > 0
          ? product.images
          : [product.image];

        console.log('Product:', product.title, 'raw images:', product.images, 'processed images:', imagesArray);

        return {
          ...product,
          image: imageMap[product.image] || product.image,
          images: imagesArray.map(img => imageMap[img] || img),
        };
      });
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  if (isError) {
    return (
      <section id="products-section" className="py-20 px-4 bg-gradient-natural">
        <div className="container mx-auto text-center">
          <Card className="p-8 max-w-md mx-auto">
            <p className="text-destructive font-semibold mb-2">Erro ao carregar produtos</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Tentar novamente
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Se o problema persistir, por favor contacte o suporte.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section id="products-section" className="py-20 px-4 bg-gradient-natural">
        <div className="container mx-auto text-center">
          <Card className="p-8 max-w-md mx-auto">
            <p className="text-muted-foreground mb-2">Nenhum produto disponível no momento</p>
            <p className="text-xs text-muted-foreground">
              Por favor, volte mais tarde.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="products-section" className="py-20 px-4 bg-gradient-natural">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Peças Disponíveis
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <Card 
              key={product.id}
              className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-warm animate-fade-in bg-card flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductImageGallery 
                images={product.images && product.images.length > 0 ? product.images : [product.image]} 
                title={product.title} 
              />
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="font-bold text-primary text-lg whitespace-nowrap ml-2">
                    €{product.price.toFixed(2)}
                  </p>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                  {product.description}
                </p>

                <Button
                  onClick={() => handleAddToCart(product)}
                  variant="default"
                  size="default"
                  className="w-full rounded-full mt-auto"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adicionar
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
