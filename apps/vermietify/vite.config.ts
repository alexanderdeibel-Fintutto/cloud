/**
 * Vermietify — Vite Config
 *
 * manualChunks: Nur stabile Vendor-Chunks.
 * App-Chunks werden von Vite/Rollup automatisch aufgeteilt um
 * zirkuläre Abhängigkeiten (TDZ-Fehler) zu vermeiden.
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
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: true,
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
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Nur die kritischen Vendor-Chunks explizit benennen.
        // React MUSS als erster Chunk ohne Abhängigkeiten stehen.
        // Alle anderen Chunks (App + restliche Vendor) werden von Rollup automatisch aufgeteilt.
        manualChunks: (id: string) => {
          // React-Kern — keine Abhängigkeiten auf andere Chunks
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) return "vendor-react";

          // React-Router separat
          if (id.includes("node_modules/react-router")) return "vendor-router-v2";

          // Supabase
          if (id.includes("node_modules/@supabase/")) return "vendor-supabase";

          // UI-Bibliotheken (Radix UI, Lucide) — separat damit sie nach vendor-react geladen werden
          if (
            id.includes("node_modules/@radix-ui/") ||
            id.includes("node_modules/lucide-react/") ||
            id.includes("node_modules/sonner/") ||
            id.includes("node_modules/class-variance-authority/") ||
            id.includes("node_modules/clsx/") ||
            id.includes("node_modules/tailwind-merge/") ||
            id.includes("node_modules/next-themes/")
          ) return "vendor-ui-v2";

          // Schwere Vendor-Bibliotheken für besseres Caching
          if (
            id.includes("node_modules/jspdf") ||
            id.includes("node_modules/html2canvas") ||
            id.includes("node_modules/pdfmake")
          ) return "vendor-pdf-v2";

          if (
            id.includes("node_modules/xlsx/") ||
            id.includes("node_modules/papaparse/") ||
            id.includes("node_modules/file-saver/")
          ) return "vendor-files";

          // Alle anderen node_modules und App-Chunks: Rollup entscheidet automatisch
          // (kein vendor-misc, keine App-Chunks — verhindert TDZ-Fehler durch Zirkel)
        },
      },
    },
  },
});
