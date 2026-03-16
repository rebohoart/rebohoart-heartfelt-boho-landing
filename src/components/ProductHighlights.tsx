import { useState } from "react";
import React from "react";
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
  stock: number;
  category: string;
  active: boolean;
}

const ProductHighlights = () => {
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOffset, setZoomOffset] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const pinchRef = React.useRef<{ dist: number; x: number; y: number } | null>(null);
  const dragRef = React.useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const closeDetail = () => {
    setSelectedProduct(null);
    setZoomImage(null);
    setCurrentImageIndex(0);
  };

  const openZoom = (img: string) => {
    setZoomImage(img);
    setZoomScale(1);
    setZoomOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomScale(s => Math.min(5, Math.max(1, s - e.deltaY * 0.005)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = {
        dist: Math.hypot(dx, dy),
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1) {
      dragRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        ox: zoomOffset.x,
        oy: zoomOffset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchRef.current.dist;
      setZoomScale(s => Math.min(5, Math.max(1, s * ratio)));
      pinchRef.current.dist = dist;
    } else if (e.touches.length === 1 && dragRef.current && zoomScale > 1) {
      const dx = e.touches[0].clientX - dragRef.current.startX;
      const dy = e.touches[0].clientY - dragRef.current.startY;
      setZoomOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy });
    }
  };

  const handleTouchEnd = () => {
    pinchRef.current = null;
    dragRef.current = null;
    if (zoomScale <= 1) setZoomOffset({ x: 0, y: 0 });
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(product => {
        const imagesArray = product.images && product.images.length > 0
          ? product.images
          : [product.image];
        return {
          ...product,
          image: imageMap[product.image] || product.image,
          images: imagesArray.map((img: string) => imageMap[img] || img),
        };
      });
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });

  const handleAddToCart = (product: typeof products[0]) => {
    addItem(product);
    toast.success(`${product.title} adicionado ao carrinho!`, { duration: 2000 });
  };

  const filteredProducts = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

  if (isLoading) {
    return (
      <section id="products-section" className="py-20 px-4 bg-gradient-natural">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="h-10 w-64 bg-muted rounded-full mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-border/50 bg-card animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-muted rounded-full w-3/4" />
                  <div className="h-5 bg-muted rounded-full w-1/4" />
                  <div className="h-10 bg-muted rounded-full mt-4" />
                </div>
              </div>
            ))}
          </div>
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
            <Button onClick={() => refetch()} variant="outline">Tentar novamente</Button>
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
          </Card>
        </div>
      </section>
    );
  }

  const detailImgs = selectedProduct
    ? (selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image])
    : [];
  const currentImg = detailImgs[currentImageIndex] ?? detailImgs[0];

  return (
    <>
      <section id="products-section" className="py-20 bg-[hsl(37,34%,75%)]">
        <div className="text-center mb-12 px-4 container mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Peças Disponíveis</h2>
          <p className="text-muted-foreground text-lg">Cada peça é única, feita com amor e dedicação</p>
        </div>
        {categories.length > 0 && (
          <div className="sticky top-16 md:top-20 z-10 py-4 mb-8 bg-[hsl(37,34%,75%)]">
            <div className="flex gap-2 overflow-x-auto justify-center px-4 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Button
                variant={activeCategory === null ? "default" : "outline"}
                onClick={() => setActiveCategory(null)}
                className="rounded-full flex-shrink-0"
                size="sm"
              >
                Todas ({products.filter(p => p.active !== false).length})
              </Button>
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat.name).length;
                return (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.name ? "default" : "outline"}
                    onClick={() => setActiveCategory(cat.name)}
                    className="rounded-full flex-shrink-0"
                    size="sm"
                  >
                    {cat.name} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden hover:shadow-warm transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
                onClick={() => openDetail(product)}
              >
                <div className="relative">
                  <ProductImageGallery
                    images={product.images && product.images.length > 0 ? product.images : [product.image]}
                    title={product.title}
                  />
                  {product.category && (
                    <span className="absolute top-2 left-2 bg-white/90 text-primary text-xs font-medium px-2 py-1 rounded-full border border-primary/20">
                      {product.category}
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <p className="font-bold text-primary text-lg whitespace-nowrap ml-2">
                      €{product.price.toFixed(2)}
                    </p>
                  </div>
                  {/* description removed from card — visible only in detail modal */}
                  <div className="flex flex-col gap-2 mt-auto">
                    {product.stock === 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-full w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block"></span>
                        Esgotado
                      </span>
                    ) : product.stock <= 2 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                        Última unidade
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary/10 text-secondary px-2.5 py-1 rounded-full w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
                        Disponível
                      </span>
                    )}
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      variant="default"
                      size="default"
                      className="w-full rounded-full"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetail(product); }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-2 py-1 bg-transparent border-none cursor-pointer"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de detalhe — fora da <section> para evitar conflitos de portal/z-index */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => { if (!open) closeDetail(); }}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden h-full sm:h-auto rounded-none sm:rounded-2xl">
          <DialogTitle className="sr-only">{selectedProduct?.title}</DialogTitle>
          {selectedProduct && (
            <div className="grid md:grid-cols-2">
              <div className="relative bg-muted aspect-square">
                <img loading="lazy"
                  src={currentImg}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => openZoom(currentImg)}
                />
                <button
                  onClick={() => openZoom(currentImg)}
                  className="absolute bottom-3 right-3 bg-background/80 rounded-full p-1.5"
                  aria-label="Ampliar imagem"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {detailImgs.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5"
                      aria-label="Seguinte"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <div className="p-6 flex flex-col">
                <h2 className="font-serif text-2xl font-bold mb-1">{selectedProduct.title}</h2>
                {selectedProduct.category && (
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    {selectedProduct.category}
                  </span>
                )}
                <p className="text-2xl font-bold text-primary mb-4">€{selectedProduct.price.toFixed(2)}</p>
                <p className="text-muted-foreground leading-relaxed flex-1">{selectedProduct.description}</p>
                <Button
                  onClick={() => { handleAddToCart(selectedProduct); closeDetail(); }}
                  className="w-full rounded-full mt-6"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Adicionar ao carrinho
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de zoom — full-width em mobile, max-w-4xl em desktop */}
      <Dialog open={!!zoomImage} onOpenChange={(open) => { if (!open) { setZoomImage(null); setZoomScale(1); setZoomOffset({ x: 0, y: 0 }); } }}>
        <DialogContent className="w-screen max-w-none sm:max-w-4xl p-0 overflow-hidden rounded-none sm:rounded-lg">
          <DialogTitle className="sr-only">Zoom</DialogTitle>
          {zoomImage && (
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{ height: '100dvh', cursor: zoomScale > 1 ? 'grab' : 'zoom-in', touchAction: 'none' }}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img loading="lazy"
                src={zoomImage}
                alt="Zoom"
                draggable={false}
                style={{
                  transform: `scale(${zoomScale}) translate(${zoomOffset.x / zoomScale}px, ${zoomOffset.y / zoomScale}px)`,
                  transition: pinchRef.current ? 'none' : 'transform 0.1s ease',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  userSelect: 'none',
                }}
              />
              {/* Zoom controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/40">
                <button
                  onClick={() => { setZoomScale(s => Math.max(1, s - 0.5)); if (zoomScale <= 1.5) setZoomOffset({ x: 0, y: 0 }); }}
                  className="w-8 h-8 flex items-center justify-center text-lg font-bold rounded-full hover:bg-muted transition-colors"
                  aria-label="Diminuir zoom"
                >−</button>
                <span className="text-sm font-medium min-w-[40px] text-center">{Math.round(zoomScale * 100)}%</span>
                <button
                  onClick={() => setZoomScale(s => Math.min(5, s + 0.5))}
                  className="w-8 h-8 flex items-center justify-center text-lg font-bold rounded-full hover:bg-muted transition-colors"
                  aria-label="Aumentar zoom"
                >+</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductHighlights;