/**
 * Fintutto Portal — Shared Vite Configuration
 *
 * Analog zur Translator-Architektur: Jede App importiert diese Funktion
 * und bekommt eine vollständig konfigurierte Vite-Config zurück.
 *
 * Verwendung in apps/financial-compass/vite.config.ts:
 *   import { createAppViteConfig } from '../../vite.shared'
 *   export default createAppViteConfig('financial-compass', __dirname)
 */
import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

const rootDir = path.resolve(__dirname)

export interface AppViteConfig {
  /** App-Name für Logging und Manifest */
  name: string
  /** Anzeigename für den Browser-Tab */
  displayName: string
  /** Dev-Server Port */
  devPort: number
  /** App-Beschreibung für Manifest */
  description?: string
}

const APP_CONFIGS: Record<string, AppViteConfig> = {
  'financial-compass': {
    name: 'financial-compass',
    displayName: 'Financial Compass',
    devPort: 5173,
    description: 'Buchhaltung, Rechnungen & Steuern für Freelancer und Unternehmen',
  },
  'vermietify': {
    name: 'vermietify',
    displayName: 'Vermietify',
    devPort: 5174,
    description: 'Professionelle Immobilienverwaltung für private Vermieter',
  },
  'fintutto-portal': {
    name: 'fintutto-portal',
    displayName: 'Fintutto Portal',
    devPort: 5175,
    description: 'Rechner, Checker & Formulare für Mieter und Vermieter',
  },
  'fintutto-biz': {
    name: 'fintutto-biz',
    displayName: 'Fintutto Biz',
    devPort: 5176,
    description: 'Freelancer Finance OS',
  },
  'landing': {
    name: 'landing',
    displayName: 'Fintutto Cloud',
    devPort: 5181,
    description: '14 smarte Apps für jeden Lebensbereich — Finanzen, Wohnen, Lernen und mehr',
  },
}

export function createAppViteConfig(appName: string, appDir: string): UserConfig {
  const config = APP_CONFIGS[appName] ?? {
    name: appName,
    displayName: appName,
    devPort: 5180,
  }

  return defineConfig({
    server: {
      host: '::',
      port: config.devPort,
      hmr: { overlay: false },
      // Erlaubt dem Dev-Server, Dateien aus dem Root-packages/-Verzeichnis zu lesen
      fs: {
        allow: [rootDir],
      },
    },

    plugins: [react()],

    resolve: {
      alias: {
        // App-lokale Imports (@/components/...)
        '@': path.resolve(appDir, './src'),
        // Shared Package — direkt auf Source-Dateien zeigen (kein Build-Schritt nötig)
        '@fintutto/shared': path.resolve(rootDir, 'packages/shared/src/index.ts'),
        // Banking-Package (für FinAPI, Transaktions-Matching)
        '@fintutto/banking': path.resolve(rootDir, 'packages/shared/src/hooks/useBanking.ts'),
        // Dokument-Package (für OCR, Upload)
        '@fintutto/documents': path.resolve(rootDir, 'packages/shared/src/components/documents/index.ts'),
      },
    },

    build: {
      outDir: path.resolve(appDir, 'dist'),
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/')
            ) {
              return 'vendor-react'
            }
            if (id.includes('node_modules/@supabase/')) {
              return 'vendor-supabase'
            }
            if (
              id.includes('node_modules/jspdf/') ||
              id.includes('node_modules/html2canvas/')
            ) {
              return 'vendor-pdf'
            }
            if (
              id.includes('node_modules/recharts/') ||
              id.includes('node_modules/@tanstack/') ||
              id.includes('node_modules/date-fns/')
            ) {
              return 'vendor-data'
            }
            if (
              id.includes('node_modules/@radix-ui/') ||
              id.includes('node_modules/lucide-react/') ||
              id.includes('node_modules/sonner/')
            ) {
              return 'vendor-ui'
            }
            if (id.includes('node_modules/')) {
              return 'vendor-misc'
            }
          },
        },
      },
    },

    // PostCSS aus dem Root (Tailwind-Konfiguration)
    css: {
      postcss: rootDir,
    },
  }) as UserConfig
}
