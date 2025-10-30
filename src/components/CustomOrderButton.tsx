import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import CustomOrderForm from "./CustomOrderForm";

const CustomOrderButton = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <div className="py-12 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Peça Personalizada
            </h3>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground mb-6">
            Tens uma ideia especial? Crio peças únicas personalizadas só para ti.
          </p>
          <Button
            size="lg"
            onClick={() => setFormOpen(true)}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-warm transition-all hover:scale-105 px-8 py-6 text-lg rounded-full font-medium"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Encomendar Peça Personalizada
          </Button>
        </div>
      </div>

      <CustomOrderForm open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
};

export default CustomOrderButton;
