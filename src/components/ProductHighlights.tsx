import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  category: string;
  active: boolean;
}

const ProductHighlights = () => {
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const closeDetail = () => {
    setSelectedProduct(null);
    setZoomImage(null);
    setCurrentImageIndex(0);
  };

  const prevImage = () => {
    if (!selectedProduct) return;
    const imgs = selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image];
    setCurrentImageIndex((i) => (i - 1 + imgs.length) % imgs.length);
  };

  const nextImage = () => {
    if (!selectedProduct) return;
    const imgs = selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image];
    setCurrentImageIndex((i) => (i + 1) % imgs.length);
  };

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
              className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-warm animate-fade-in bg-card flex flex-col cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => openDetail(product)}
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

                <div className="flex gap-2 mt-auto">
                  <Button
                    onClick={(e) => { e.stopPropagation(); openDetail(product); }}
                    variant="outline"
                    size="default"
                    className="flex-1 rounded-full"
                  >
                    <ZoomIn className="w-4 h-4 mr-2" />
                    Ver detalhes
                  </Button>
                  <Button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                    variant="default"
                    size="default"
                    className="flex-1 rounded-full"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {selectedProduct && (() => {
        const imgs = (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images : [selectedProduct.image];
        const currentImg = imgs[currentImageIndex];
        return (
          <>
            <Dialog open={true} onOpenChange={(open) => { if (!open) closeDetail(); }}>
              <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <DialogTitle className="sr-only">{selectedProduct.title}</DialogTitle>
                <div className="grid md:grid-cols-2">
                  <div className="relative bg-muted aspect-square">
                    <img src={currentImg} alt={selectedProduct.title} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setZoomImage(currentImg)} />
                    <button onClick={() => setZoomImage(currentImg)} className="absolute top-3 right-3 bg-background/80 rounded-full p-1.5" aria-label="Ampliar imagem"><ZoomIn className="w-4 h-4" /></button>
                    {imgs.length > 1 && (<><button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5" aria-label="Anterior"><ChevronLeft className="w-4 h-4" /></button><button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5" aria-label="Seguinte"><ChevronRight className="w-4 h-4" /></button></>)}
                  </div>
                  <div className="p-6 flex flex-col">
                    <h2 className="font-serif text-2xl font-bold mb-1">{selectedProduct.title}</h2>
                    {selectedProduct.category && <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{selectedProduct.category}</span>}
                    <p className="text-2xl font-bold text-primary mb-4">€{selectedProduct.price.toFixed(2)}</p>
                    <p className="text-muted-foreground leading-relaxed flex-1">{selectedProduct.description}</p>
                    <Button onClick={() => { handleAddToCart(selectedProduct); closeDetail(); }} className="w-full rounded-full mt-6" size="lg"><ShoppingCart className="w-5 h-5 mr-2" />Adicionar ao carrinho</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={!!zoomImage} onOpenChange={(open) => { if (!open) setZoomImage(null); }}>
              <DialogContent className="max-w-4xl p-2">
                <DialogTitle className="sr-only">Zoom</DialogTitle>
                {zoomImage && <img src={zoomImage} alt="Zoom" className="w-full h-auto rounded-lg max-h-[85vh] object-contain" />}
              </DialogContent>
            </Dialog>
          </>
        );
      })()}
    </section>
  );
};

export default ProductHighlights;
