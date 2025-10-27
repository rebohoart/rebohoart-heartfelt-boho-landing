import { Button } from "@/components/ui/button";
import { Instagram, Mail } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-24 px-4 bg-gradient-warm relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-primary-foreground">
            Bring Meaning Back to Your Home
          </h2>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 leading-relaxed">
            Join the boho art movement. Select pieces that speak your story, connect with nature, 
            and transform your space into a sanctuary of intentional beauty.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 shadow-warm transition-all hover:scale-105 px-10 py-7 text-lg rounded-full font-semibold"
            >
              Shop the Collection
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground transition-all px-10 py-7 text-lg rounded-full font-semibold"
            >
              Customize Your Piece
            </Button>
          </div>
          
          {/* Social Links */}
          <div className="flex gap-6 justify-center items-center pt-8 border-t border-primary-foreground/20">
            <a 
              href="https://instagram.com/rebohoart" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors group"
            >
              <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">@rebohoart</span>
            </a>
            
            <span className="text-primary-foreground/40">·</span>
            
            <a 
              href="mailto:hello@rebohoart.com"
              className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors group"
            >
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Get in Touch</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
