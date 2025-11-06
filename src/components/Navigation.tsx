import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "./CartDrawer";
import logo from "@/assets/logo-reboho-transparent.png";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { totalItems } = useCart();

  const { data: logos } = useQuery({
    queryKey: ['logos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logos')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;
      return data;
    },
  });

  const customLogoUrl = logos?.[0]?.url;
  const logoUrl = (!logoError && customLogoUrl) ? customLogoUrl : logo;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-soft"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <img
                src={logoUrl}
                alt="Reboho"
                className="h-8 md:h-10 w-auto"
                onError={(e) => {
                  setLogoError(true);
                  if (e.currentTarget.src !== logo) {
                    e.currentTarget.src = logo;
                  }
                }}
              />
            </a>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                onClick={() => setCartOpen(true)}
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
};

export default Navigation;
