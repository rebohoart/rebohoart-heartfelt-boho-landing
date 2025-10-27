import { Card, CardContent } from "@/components/ui/card";
import macrameImage from "@/assets/product-macrame-wall.jpg";
import planterImage from "@/assets/product-ceramic-planter.jpg";
import basketImage from "@/assets/product-woven-basket.jpg";
import canvasImage from "@/assets/product-canvas-art.jpg";

const products = [
  {
    title: "Macramé Wall Hangings",
    description: "Intricate knotwork patterns handwoven with natural cotton rope and wooden beads. Each piece brings warmth and texture, connecting your space to the art of slow, mindful creation.",
    image: macrameImage,
  },
  {
    title: "Hand-Painted Planters",
    description: "Artisanal ceramic planters featuring organic patterns in earthy tones. Made with sustainable materials and wrapped in natural jute—perfect homes for your green companions.",
    image: planterImage,
  },
  {
    title: "Woven Storage Baskets",
    description: "Beautiful jute and seagrass baskets crafted by hand. Functional art that organizes your space while celebrating natural fibers and traditional weaving techniques.",
    image: basketImage,
  },
  {
    title: "Abstract Canvas Art",
    description: "Nature-inspired watercolor designs in warm terracotta and olive hues. Each canvas tells a story of landscapes and organic forms, framed in sustainable wood to complete your boho gallery wall.",
    image: canvasImage,
  },
];

const ProductHighlights = () => {
  return (
    <section className="py-20 px-4 bg-gradient-natural">
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
              key={index}
              className="group overflow-hidden border-border/50 shadow-soft hover:shadow-warm transition-all duration-500 hover:-translate-y-2 bg-card/80 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden aspect-square">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">
                  {product.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductHighlights;
