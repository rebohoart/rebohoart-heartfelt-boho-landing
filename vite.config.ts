import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Configurações para garantir auto-reload
    watch: {
      usePolling: true, // Essencial para WSL, Docker, VMs
      interval: 100, // Intervalo de polling em ms
    },
    hmr: {
      overlay: true, // Mostra erros no browser
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
