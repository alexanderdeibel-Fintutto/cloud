/**
 * Vermietify — Vite Config
 * Nutzt die gemeinsame Monorepo-Konfiguration aus dem Root.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const rootDir = path.resolve(__dirname, '../..')

export default defineConfig({
  server: {
    host: "::",
    port: 5174,
    hmr: { overlay: false },
    fs: { allow: [rootDir] },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@fintutto/shared": path.resolve(rootDir, "packages/shared/src/index.ts"),
      "@fintutto/banking": path.resolve(rootDir, "packages/shared/src/hooks/useBanking.ts"),
      "@fintutto/documents": path.resolve(rootDir, "packages/shared/src/components/documents/index.ts"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router-dom/")) return "vendor-react";
          if (id.includes("node_modules/@supabase/")) return "vendor-supabase";
          if (id.includes("node_modules/recharts/") || id.includes("node_modules/@tanstack/") || id.includes("node_modules/date-fns/")) return "vendor-data";
          if (id.includes("node_modules/@radix-ui/") || id.includes("node_modules/lucide-react/") || id.includes("node_modules/sonner/")) return "vendor-ui";
          if (id.includes("node_modules/")) return "vendor-misc";
        },
      },
    },
  },
});
