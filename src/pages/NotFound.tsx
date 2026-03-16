import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-reboho-transparent.png";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);

  const { data: logos } = useQuery({
    queryKey: ["logos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("logos").select("*").eq("is_active", true).limit(1);
      if (error) throw error;
      return data;
    },
  });

  const customLogoUrl = logos?.[0]?.url;

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const logoUrl = !logoError && customLogoUrl ? customLogoUrl : logo;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <img
          src={logoUrl}
          alt="ReBoho"
          className="h-24 md:h-32 w-auto mx-auto mb-6"
          onError={() => setLogoError(true)}
        />
        <p className="font-serif text-8xl text-primary/20 mb-6">404</p>
        <p className="font-sans text-xl md:text-2xl text-foreground mb-3 leading-snug">
          Ainda estamos a dar os últimos nós nesta página.
        </p>
        <p className="font-sans text-sm text-muted-foreground mb-8">
          Enquanto isso, as nossas peças estão à tua espera.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-lg shadow-warm transition-all hover:scale-105"
        >
          Voltar à loja
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
