/**
 * Vermietify — Vite Config
 * Nutzt die gemeinsame Monorepo-Konfiguration aus dem Root.
 * Code-Splitting: Vendor-Chunks + App-Chunks nach Bereichen
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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // ── Vendor-Chunks ──────────────────────────────────────────────
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/")
          ) return "vendor-react";

          if (id.includes("node_modules/@supabase/")) return "vendor-supabase";

          if (
            id.includes("node_modules/recharts/") ||
            id.includes("node_modules/@tanstack/") ||
            id.includes("node_modules/date-fns/")
          ) return "vendor-data";

          if (
            id.includes("node_modules/@radix-ui/") ||
            id.includes("node_modules/lucide-react/") ||
            id.includes("node_modules/sonner/") ||
            id.includes("node_modules/class-variance-authority/") ||
            id.includes("node_modules/clsx/")
          ) return "vendor-ui";

          if (
            id.includes("node_modules/jspdf") ||
            id.includes("node_modules/html2canvas") ||
            id.includes("node_modules/pdfmake")
          ) return "vendor-pdf";

          if (
            id.includes("node_modules/zod/") ||
            id.includes("node_modules/@hookform/") ||
            id.includes("node_modules/react-hook-form/")
          ) return "vendor-forms";

          if (
            id.includes("node_modules/framer-motion/") ||
            id.includes("node_modules/@dnd-kit/") ||
            id.includes("node_modules/react-beautiful-dnd/")
          ) return "vendor-animation";

          if (
            id.includes("node_modules/leaflet/") ||
            id.includes("node_modules/react-leaflet/") ||
            id.includes("node_modules/mapbox-gl/")
          ) return "vendor-maps";

          if (
            id.includes("node_modules/xlsx/") ||
            id.includes("node_modules/papaparse/") ||
            id.includes("node_modules/file-saver/")
          ) return "vendor-files";

          if (id.includes("node_modules/")) return "vendor-misc";

          // ── App-Chunks nach Funktionsbereich ───────────────────────────
          if (
            id.includes("/pages/banking/") ||
            id.includes("/pages/zahlungen") ||
            id.includes("/hooks/useBanking") ||
            id.includes("/hooks/usePayments")
          ) return "chunk-banking";

          if (
            id.includes("/pages/taxes/") ||
            id.includes("/pages/afa") ||
            id.includes("/pages/capital-gains") ||
            id.includes("/hooks/useTaxData")
          ) return "chunk-taxes";

          if (
            id.includes("/pages/betriebskosten") ||
            id.includes("/pages/zaehler") ||
            id.includes("/components/operating-costs") ||
            id.includes("/hooks/useOperatingCosts") ||
            id.includes("/hooks/useMeters")
          ) return "chunk-betriebskosten";

          if (
            id.includes("/pages/tenant-portal/") ||
            id.includes("/pages/tenants") ||
            id.includes("/pages/vertraege") ||
            id.includes("/pages/angebote") ||
            id.includes("/hooks/useTenants") ||
            id.includes("/hooks/useContracts")
          ) return "chunk-mieter";

          if (
            id.includes("/pages/kommunikation") ||
            id.includes("/pages/whatsapp") ||
            id.includes("/pages/briefe") ||
            id.includes("/hooks/useEmailTemplates") ||
            id.includes("/hooks/useLetters")
          ) return "chunk-kommunikation";

          if (
            id.includes("/pages/Analytics") ||
            id.includes("/components/charts") ||
            id.includes("/hooks/useAnalytics")
          ) return "chunk-analytics";

          if (
            id.includes("/pages/BulkUpload") ||
            id.includes("/pages/documents") ||
            id.includes("/components/documents") ||
            id.includes("/hooks/useDocuments")
          ) return "chunk-documents";

          if (
            id.includes("/pages/Settings") ||
            id.includes("/pages/hilfe") ||
            id.includes("/pages/pricing") ||
            id.includes("/pages/onboarding")
          ) return "chunk-settings";

          if (
            id.includes("/pages/co2") ||
            id.includes("/pages/AfaCalculator") ||
            id.includes("/pages/CapitalGains") ||
            id.includes("/pages/portal") ||
            id.includes("/pages/ecosystem")
          ) return "chunk-tools-extra";

          if (
            id.includes("/pages/listings") ||
            id.includes("/pages/offers") ||
            id.includes("/pages/rent") ||
            id.includes("/pages/mieter/") ||
            id.includes("/pages/einheiten/") ||
            id.includes("/pages/buildings/")
          ) return "chunk-immobilien";

          if (
            id.includes("/pages/handover") ||
            id.includes("/pages/inbound") ||
            id.includes("/pages/tasks") ||
            id.includes("/pages/automatisierung")
          ) return "chunk-tools";
        },
      },
    },
  },
});
