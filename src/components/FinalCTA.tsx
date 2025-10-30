import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-24 px-4 bg-gradient-warm relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Transforma o Teu Espaço
          </h2>
          
          <p className="text-lg md:text-xl text-foreground/90 mb-10 leading-relaxed">
            Escolhe peças que contam a tua história e trazem natureza para dentro de casa.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              onClick={() => {
                const section = document.getElementById('products-section');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm transition-all hover:scale-105 px-10 py-7 text-lg rounded-full font-semibold"
            >
              Ver Coleção
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={() => {
                const message = encodeURIComponent("Olá! Gostaria de fazer uma encomenda personalizada.");
                window.open(`https://www.instagram.com/direct/t/rebohoart?text=${message}`, "_blank");
              }}
              className="border-2 border-foreground/30 text-foreground hover:bg-primary/10 hover:border-primary transition-all px-10 py-7 text-lg rounded-full font-semibold"
            >
              Encomendar Personalizada
            </Button>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center items-center pt-8 border-t border-primary-foreground/20">
            <a 
              href="https://www.instagram.com/rebohoart/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors group"
            >
              <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">@rebohoart</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
