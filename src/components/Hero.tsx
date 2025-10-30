import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-boho-minimal.jpg";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center animate-fade-in-up">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight">
            Arte Boho<br />
            <span className="text-primary">Feita à Mão</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto font-light">
            Peças únicas que trazem natureza e calma ao teu espaço. Cada criação é feita com amor e materiais sustentáveis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={scrollToProducts}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm transition-all hover:scale-105 px-8 py-6 text-lg rounded-full font-medium"
            >
              Ver Coleção
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-foreground/20 hover:border-primary hover:bg-primary/10 transition-all px-8 py-6 text-lg rounded-full font-medium"
              asChild
            >
              <Link to="/contacto" className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Contactar
              </Link>
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-muted-foreground italic">
            Feito em Portugal · Encomendas via Instagram DM
          </p>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
