import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Configurações para garantir auto-reload em ambientes sem inotify
    watch: {
      usePolling: true, // Essencial para WSL, Docker, VMs, ambientes sem inotify
      interval: 300, // Intervalo de polling em ms (aumentado para mais estabilidade)
    },
    hmr: {
      overlay: true, // Mostra erros no browser
      protocol: 'ws', // Usa WebSocket (mais compatível)
      host: 'localhost',
    },
  },
  // Configuração de build otimizada para desenvolvimento
  build: {
    sourcemap: mode === 'development',
  },
  plugins: [
    react({
      // Força fast refresh mesmo com polling
      fastRefresh: true,
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
