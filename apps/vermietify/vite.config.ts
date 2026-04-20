/**
 * Vermietify — Vite Config
 *
 * WICHTIG: manualChunks wurde entfernt!
 * Die manualChunks-Konfiguration erzeugte zirkuläre Abhängigkeiten (TDZ-Fehler):
 * Vite lud vendor-react, vendor-ui-v3 etc. als dynamische Deps via __vite__mapDeps,
 * aber der Haupt-Bundle griff synchron auf ihre Exports zu (createRoot, ThemeProvider).
 * Das führte dazu dass z$ (createRoot) und jL (ThemeProvider) undefined waren.
 *
 * Rollup/Vite teilt den Code automatisch korrekt auf ohne TDZ-Probleme.
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
    chunkSizeWarningLimit: 3000,
    // Kein manualChunks — Rollup entscheidet automatisch
    // Das verhindert TDZ-Fehler durch zirkuläre Chunk-Abhängigkeiten
  },
});
