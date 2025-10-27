import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-boho-interior.jpg";
import { Instagram } from "lucide-react";

const Hero = () => {
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
            Handmade Boho Art <br />
            <span className="text-primary">Made with Heart</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto font-light">
            Bring nature-inspired art to your space. Each piece is crafted with love to fill your home with meaning and authentic boho spirit.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm transition-all hover:scale-105 px-8 py-6 text-lg rounded-full font-medium"
            >
              Explore Our Collection
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-foreground/20 hover:border-primary hover:bg-primary/10 transition-all px-8 py-6 text-lg rounded-full font-medium"
              asChild
            >
              <a href="https://instagram.com/rebohoart" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                Follow on Instagram
              </a>
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-muted-foreground italic">
            Handcrafted in Portugal · Custom orders via DM
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
