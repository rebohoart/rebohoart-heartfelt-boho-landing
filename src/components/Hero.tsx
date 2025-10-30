import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-reboho-transparent.png";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
const Hero = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-accent/5">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center animate-fade-in-up">
        <div className="max-w-4xl mx-auto">
          <img 
            src={logo} 
            alt="Reboho" 
            className="h-32 md:h-40 w-auto mx-auto mb-6"
          />
          
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto font-light">Peças artesanais feitas com o coração para decorar com significado.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={scrollToProducts} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm transition-all hover:scale-105 px-8 py-6 text-lg rounded-full font-medium">
              Explorar Coleção
            </Button>
            
            <Button size="lg" variant="outline" className="border-2 border-foreground/20 hover:border-primary hover:bg-primary/10 transition-all px-8 py-6 text-lg rounded-full font-medium" asChild>
              <Link to="/contacto" className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Contacto
              </Link>
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-muted-foreground italic">
            Feito à mão em Portugal · Encomendas por Instagram DM
          </p>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full" />
        </div>
      </div>
    </section>;
};
export default Hero;