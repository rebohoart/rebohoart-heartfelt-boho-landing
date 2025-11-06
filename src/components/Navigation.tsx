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

  const { data: siteSettings, error: settingsError } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      console.log('🔄 Fetching site settings...');
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        console.error('❌ Error fetching site settings:', error);
        throw error;
      }
      console.log('✅ Site settings fetched:', data);
      return data;
    },
  });

  useEffect(() => {
    if (settingsError) {
      console.error('❌ Settings error:', settingsError);
    }
  }, [settingsError]);

  const customLogoUrl = siteSettings?.find(s => s.key === 'logo_url')?.value;
  const logoUrl = (!logoError && customLogoUrl) ? customLogoUrl : logo;

  useEffect(() => {
    if (customLogoUrl) {
      console.log('🖼️ Using custom logo:', customLogoUrl);
    } else {
      console.log('🖼️ Using default logo');
    }
  }, [customLogoUrl]);

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
                  console.error('❌ Error loading logo, falling back to default:', logoUrl);
                  setLogoError(true);
                  if (e.currentTarget.src !== logo) {
                    e.currentTarget.src = logo;
                  }
                }}
                onLoad={() => {
                  console.log('✅ Logo loaded successfully');
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
