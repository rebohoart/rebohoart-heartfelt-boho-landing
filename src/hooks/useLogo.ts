import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-reboho-transparent.png";

export const useLogo = () => {
  const [logoError, setLogoError] = useState(false);

  const { data: logos } = useQuery({
    queryKey: ["logos"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logos")
        .select("*")
        .eq("is_active", true)
        .limit(1);
      if (error) throw error;
      return data;
    },
  });

  const customLogoUrl = logos?.[0]?.url;
  const logoUrl = logoError || !customLogoUrl ? logo : customLogoUrl;

  return { logoUrl, logoError, setLogoError };
};
