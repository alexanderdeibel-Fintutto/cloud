/**
 * Vermietify — Vite Config
 *
 * manualChunks: Vendor- UND App-Chunks explizit aufteilen,
 * damit kein einzelner Chunk > 1MB wird (Vercel CDN-Limit).
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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // React-Kern — keine Abhängigkeiten auf andere Chunks
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) return "vendor-react";

          // React-Router separat
          if (id.includes("node_modules/react-router")) return "vendor-router";

          // Supabase
          if (id.includes("node_modules/@supabase/")) return "vendor-supabase";

          // UI-Bibliotheken (Radix UI, Lucide)
          if (
            id.includes("node_modules/@radix-ui/") ||
            id.includes("node_modules/lucide-react/") ||
            id.includes("node_modules/sonner/") ||
            id.includes("node_modules/class-variance-authority/") ||
            id.includes("node_modules/clsx/") ||
            id.includes("node_modules/tailwind-merge/") ||
            id.includes("node_modules/next-themes/")
          ) return "vendor-ui";

          // Schwere Vendor-Bibliotheken
          if (
            id.includes("node_modules/jspdf") ||
            id.includes("node_modules/html2canvas") ||
            id.includes("node_modules/pdfmake")
          ) return "vendor-pdf";

          if (
            id.includes("node_modules/xlsx/") ||
            id.includes("node_modules/papaparse/") ||
            id.includes("node_modules/file-saver/")
          ) return "vendor-files";

          // Zod und Form-Bibliotheken
          if (
            id.includes("node_modules/zod/") ||
            id.includes("node_modules/@hookform/") ||
            id.includes("node_modules/react-hook-form/")
          ) return "vendor-forms";

          // Date-Bibliotheken
          if (
            id.includes("node_modules/date-fns/") ||
            id.includes("node_modules/@fullcalendar/") ||
            id.includes("node_modules/react-big-calendar/")
          ) return "vendor-dates";

          // Tanstack Query
          if (id.includes("node_modules/@tanstack/")) return "vendor-query";

          // Recharts und Visualisierungen
          if (
            id.includes("node_modules/recharts/") ||
            id.includes("node_modules/d3") ||
            id.includes("node_modules/victory")
          ) return "vendor-charts";

          // Alle anderen node_modules in vendor-misc
          if (id.includes("node_modules/")) return "vendor-misc";

          // App-Seiten aufteilen
          if (id.includes("/src/pages/")) return "app-pages";

          // App-Hooks aufteilen
          if (id.includes("/src/hooks/")) return "app-hooks";

          // App-Komponenten aufteilen
          if (id.includes("/src/components/")) return "app-components";

          // Shared-Packages
          if (id.includes("/packages/shared/")) return "app-shared";
        },
      },
    },
  },
});
