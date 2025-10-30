import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

const SupabaseConfigWarning = () => {
  // Don't show warning if Supabase is properly configured
  if (isSupabaseConfigured) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div className="text-sm font-medium">
          <strong>Configuração em Falta:</strong> As variáveis de ambiente do Supabase não estão configuradas.
          O site não funcionará corretamente. Por favor, configura as variáveis no Lovable.
        </div>
      </div>
    </div>
  );
};

export default SupabaseConfigWarning;
