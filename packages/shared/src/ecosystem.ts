/**
 * Fintutto Ecosystem Registry
 * ============================
 * Zentrale Konfiguration aller Apps im Fintutto-Ökosystem.
 * Single Source of Truth für Repos, Domains, Kategorien und Cross-App-Navigation.
 *
 * Usage in jeder App:
 *   import { ecosystem, getAppByRepo, getAppsByCategory } from '@fintutto/shared/ecosystem'
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppCategory =
  | 'core'        // Infrastruktur & Verwaltung
  | 'immobilien'  // Immobilien & Mietverwaltung
  | 'finanzen'    // Finanzen & Steuern
  | 'utility'     // Tools & Hilfsmittel
  | 'lifestyle'   // Fitness, Pflanzen, etc.

export type AppStatus =
  | 'production'  // Live & stabil
  | 'beta'        // Live, aber noch in Entwicklung
  | 'development' // In Entwicklung, nicht öffentlich
  | 'planned'     // Geplant

export type AppSource =
  | 'monorepo'    // Code lebt in portal/apps/
  | 'standalone'  // Eigenes Repo

export interface EcosystemApp {
  /** Eindeutiger Schlüssel (kebab-case) */
  id: string
  /** Anzeigename */
  name: string
  /** Kurzbeschreibung */
  description: string
  /** Emoji-Icon */
  icon: string

  // --- GitHub ---
  /** GitHub Repo-Name (ohne Owner) */
  repo: string
  /** Volle GitHub-URL */
  repoUrl: string

  // --- Deployment ---
  /** Produktions-URL (Custom Domain oder Vercel) */
  domain: string
  /** Vercel-URL (falls anders als Custom Domain) */
  vercelUrl?: string
  /** Env-Variable Name für die URL (VITE_APP_URL_*) */
  envKey: string

  // --- Architektur ---
  /** Wo lebt der Code? */
  source: AppSource
  /** Pfad im Monorepo (nur bei source: 'monorepo') */
  monorepoPath?: string

  // --- Klassifizierung ---
  category: AppCategory
  status: AppStatus

  // --- Supabase ---
  /** Nutzt die gemeinsame Supabase-Instanz? */
  usesSharedSupabase: boolean
}

// ---------------------------------------------------------------------------
// GitHub Owner (zentral, einmal definiert)
// ---------------------------------------------------------------------------

const GITHUB_OWNER = 'alexanderdeibel-Fintutto'
const ghUrl = (repo: string) => `https://github.com/${GITHUB_OWNER}/${repo}`

// ---------------------------------------------------------------------------
// Shared Supabase Config
// ---------------------------------------------------------------------------

export const SUPABASE_CONFIG = {
  url: 'https://aaefocdqgdgexkcrjhks.supabase.co',
} as const

// ---------------------------------------------------------------------------
// Ecosystem Registry – alle 15 Repos
// ---------------------------------------------------------------------------

export const ecosystem: Record<string, EcosystemApp> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE – Infrastruktur & Verwaltung
  // ═══════════════════════════════════════════════════════════════════════════

  portal: {
    id: 'portal',
    name: 'Fintutto Portal',
    description: 'Rechner, Checker & Formulare – 28+ Mietrecht-Tools',
    icon: '✨',
    repo: 'portal',
    repoUrl: ghUrl('portal'),
    domain: 'https://portal.fintutto.cloud',
    envKey: 'VITE_APP_URL_PORTAL',
    source: 'monorepo',
    monorepoPath: 'apps/fintutto-portal',
    category: 'core',
    status: 'production',
    usesSharedSupabase: true,
  },

  admin: {
    id: 'admin',
    name: 'Admin-Hub',
    description: 'Zentrale Verwaltung, Benutzer, Rollen & Organisationen',
    icon: '⚙️',
    repo: 'admin',
    repoUrl: ghUrl('admin'),
    domain: 'https://fintutto-admin-hub.vercel.app',
    envKey: 'VITE_APP_URL_ADMIN',
    source: 'standalone',
    category: 'core',
    status: 'production',
    usesSharedSupabase: true,
  },

  'command-center': {
    id: 'command-center',
    name: 'Command Center',
    description: 'Monitoring & Steuerung aller Fintutto-Apps',
    icon: '🖥️',
    repo: 'fintutto-command-center',
    repoUrl: ghUrl('fintutto-command-center'),
    domain: 'https://fintutto-command-center.vercel.app',
    envKey: 'VITE_APP_URL_COMMAND_CENTER',
    source: 'standalone',
    category: 'core',
    status: 'production',
    usesSharedSupabase: true,
  },

  cloud: {
    id: 'cloud',
    name: 'Fintutto Cloud',
    description: 'Landing Page & Marketing-Seite',
    icon: '☁️',
    repo: 'cloud',
    repoUrl: ghUrl('cloud'),
    domain: 'https://fintutto.cloud',
    envKey: 'VITE_APP_URL_CLOUD',
    source: 'standalone',
    category: 'core',
    status: 'production',
    usesSharedSupabase: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IMMOBILIEN – Verwaltung, Mieter, Zähler
  // ═══════════════════════════════════════════════════════════════════════════

  vermietify: {
    id: 'vermietify',
    name: 'Vermietify',
    description: 'Immobilienverwaltung – Gebäude, Mieter, Verträge, Zahlungen',
    icon: '🏠',
    repo: 'vermietify_final',
    repoUrl: ghUrl('vermietify_final'),
    domain: 'https://vermietify.vercel.app',
    envKey: 'VITE_APP_URL_VERMIETIFY',
    source: 'standalone',
    category: 'immobilien',
    status: 'production',
    usesSharedSupabase: true,
  },

  ablesung: {
    id: 'ablesung',
    name: 'Ablesung',
    description: 'Zählerablesung & Verbrauchserfassung (Strom, Gas, Wasser, Heizung)',
    icon: '📊',
    repo: 'ablesung',
    repoUrl: ghUrl('ablesung'),
    domain: 'https://zaehler.fintutto.cloud',
    vercelUrl: 'https://ablesung.vercel.app',
    envKey: 'VITE_APP_URL_ABLESUNG',
    source: 'standalone',
    category: 'immobilien',
    status: 'production',
    usesSharedSupabase: true,
  },

  mieter: {
    id: 'mieter',
    name: 'Mieter-App',
    description: 'Mieter-Portal – Mängel melden, Zähler, Dokumente, Chat',
    icon: '🔑',
    repo: 'mieter',
    repoUrl: ghUrl('mieter'),
    domain: 'https://mieter.fintutto.cloud',
    vercelUrl: 'https://mieter-kw8d.vercel.app',
    envKey: 'VITE_APP_URL_MIETER',
    source: 'standalone',
    category: 'immobilien',
    status: 'production',
    usesSharedSupabase: true,
  },

  hausmeister: {
    id: 'hausmeister',
    name: 'HausmeisterPro',
    description: 'Facility Management – Aufgaben, Belege, Kommunikation',
    icon: '🔧',
    repo: 'hausmeisterPro',
    repoUrl: ghUrl('hausmeisterPro'),
    domain: 'https://hausmeister-pro.vercel.app',
    envKey: 'VITE_APP_URL_HAUSMEISTER',
    source: 'standalone',
    category: 'immobilien',
    status: 'production',
    usesSharedSupabase: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANZEN – Buchhaltung, Steuern, Bescheide
  // ═══════════════════════════════════════════════════════════════════════════

  bescheidboxer: {
    id: 'bescheidboxer',
    name: 'BescheidBoxer',
    description: 'Bescheide analysieren & anfechten (Grundsteuer, Nebenkosten)',
    icon: '🥊',
    repo: 'bescheidboxer',
    repoUrl: ghUrl('bescheidboxer'),
    domain: 'https://bescheidboxer.vercel.app',
    envKey: 'VITE_APP_URL_BESCHEIDBOXER',
    source: 'standalone',
    category: 'finanzen',
    status: 'production',
    usesSharedSupabase: true,
  },

  'financial-compass': {
    id: 'financial-compass',
    name: 'Financial Compass',
    description: 'Finanzübersicht – Einnahmen, Ausgaben, Steuerreports',
    icon: '🧭',
    repo: 'fintutto-your-financial-compass',
    repoUrl: ghUrl('fintutto-your-financial-compass'),
    domain: 'https://fintutto-your-financial-compass.vercel.app',
    envKey: 'VITE_APP_URL_FINANCIAL_COMPASS',
    source: 'standalone',
    category: 'finanzen',
    status: 'production',
    usesSharedSupabase: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY – Übersetzer, Sales, Reise
  // ═══════════════════════════════════════════════════════════════════════════

  translator: {
    id: 'translator',
    name: 'Translator',
    description: 'Übersetzungs-Tool',
    icon: '🌐',
    repo: 'translator',
    repoUrl: ghUrl('translator'),
    domain: 'https://translator-fintutto.vercel.app',
    envKey: 'VITE_APP_URL_TRANSLATOR',
    source: 'standalone',
    category: 'utility',
    status: 'production',
    usesSharedSupabase: false,
  },

  'guidetranslator-sales': {
    id: 'guidetranslator-sales',
    name: 'GuideTranslator Sales',
    description: 'Sales-Seite für GuideTranslator',
    icon: '📈',
    repo: 'guidetranslator-sales',
    repoUrl: ghUrl('guidetranslator-sales'),
    domain: 'https://guidetranslator-sales.vercel.app',
    envKey: 'VITE_APP_URL_GUIDETRANSLATOR_SALES',
    source: 'standalone',
    category: 'utility',
    status: 'production',
    usesSharedSupabase: false,
  },

  luggagex: {
    id: 'luggagex',
    name: 'LuggageX',
    description: 'Gepäck-Management & Reise-Tool',
    icon: '🧳',
    repo: 'luggageX',
    repoUrl: ghUrl('luggageX'),
    domain: 'https://luggagex.vercel.app',
    envKey: 'VITE_APP_URL_LUGGAGEX',
    source: 'standalone',
    category: 'utility',
    status: 'production',
    usesSharedSupabase: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFESTYLE – Fitness, Pflanzen
  // ═══════════════════════════════════════════════════════════════════════════

  personaltrainer: {
    id: 'personaltrainer',
    name: 'FitTutto',
    description: 'KI-Personal Trainer – Trainingspläne, Ernährung, Fortschritt',
    icon: '💪',
    repo: 'Personaltrainer',
    repoUrl: ghUrl('Personaltrainer'),
    domain: 'https://fittutto.fintutto.cloud',
    envKey: 'VITE_APP_URL_FITTUTTO',
    source: 'standalone',
    category: 'lifestyle',
    status: 'production',
    usesSharedSupabase: true,
  },

  zimmerpflanze: {
    id: 'zimmerpflanze',
    name: 'Zimmerpflanze',
    description: 'Pflanzenpflege-Assistent',
    icon: '🪴',
    repo: 'zimmerpflanze',
    repoUrl: ghUrl('zimmerpflanze'),
    domain: 'https://zimmerpflanze.vercel.app',
    envKey: 'VITE_APP_URL_ZIMMERPFLANZE',
    source: 'standalone',
    category: 'lifestyle',
    status: 'production',
    usesSharedSupabase: false,
  },

} as const

// ---------------------------------------------------------------------------
// Type Helpers
// ---------------------------------------------------------------------------

export type EcosystemAppId = keyof typeof ecosystem
export type EcosystemAppEntry = (typeof ecosystem)[EcosystemAppId]

// ---------------------------------------------------------------------------
// Query Functions – für Cross-App-Zugriff
// ---------------------------------------------------------------------------

/** Alle Apps als Array */
export function getAllApps(): EcosystemApp[] {
  return Object.values(ecosystem)
}

/** App nach ID */
export function getApp(id: string): EcosystemApp | undefined {
  return ecosystem[id]
}

/** App nach GitHub Repo-Name finden */
export function getAppByRepo(repoName: string): EcosystemApp | undefined {
  return Object.values(ecosystem).find((app) => app.repo === repoName)
}

/** Alle Apps einer Kategorie */
export function getAppsByCategory(category: AppCategory): EcosystemApp[] {
  return Object.values(ecosystem).filter((app) => app.category === category)
}

/** Alle Apps mit einem bestimmten Status */
export function getAppsByStatus(status: AppStatus): EcosystemApp[] {
  return Object.values(ecosystem).filter((app) => app.status === status)
}

/** Alle Apps die Supabase nutzen */
export function getSupabaseApps(): EcosystemApp[] {
  return Object.values(ecosystem).filter((app) => app.usesSharedSupabase)
}

/** Alle Apps im Monorepo */
export function getMonorepoApps(): EcosystemApp[] {
  return Object.values(ecosystem).filter((app) => app.source === 'monorepo')
}

/** Alle Standalone-Apps */
export function getStandaloneApps(): EcosystemApp[] {
  return Object.values(ecosystem).filter((app) => app.source === 'standalone')
}

/** Alle Apps ausser der aktuellen (für Cross-App-Navigation) */
export function getOtherApps(currentAppId: string): EcosystemApp[] {
  return Object.values(ecosystem).filter((app) => app.id !== currentAppId)
}

/** Produktions-URL einer App holen (berücksichtigt env-Override) */
export function getAppUrl(id: string): string {
  const app = ecosystem[id]
  if (!app) throw new Error(`Unknown app: ${id}`)

  // Im Browser: env-Variable hat Priorität (für lokale Entwicklung)
  if (typeof import.meta !== 'undefined') {
    try {
      const envUrl = (import.meta as any).env?.[app.envKey]
      if (envUrl) return envUrl
    } catch {
      // SSR oder kein Vite – ignorieren
    }
  }

  return app.domain
}

/** URL-Map aller Apps (für schnellen Zugriff) */
export function getAppUrlMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const [id, app] of Object.entries(ecosystem)) {
    map[id] = app.domain
  }
  return map
}

/** GitHub-URL einer App */
export function getRepoUrl(id: string): string {
  const app = ecosystem[id]
  if (!app) throw new Error(`Unknown app: ${id}`)
  return app.repoUrl
}

// ---------------------------------------------------------------------------
// Ecosystem Stats (für Admin/Command Center)
// ---------------------------------------------------------------------------

export function getEcosystemStats() {
  const apps = getAllApps()
  return {
    total: apps.length,
    byCategory: {
      core: getAppsByCategory('core').length,
      immobilien: getAppsByCategory('immobilien').length,
      finanzen: getAppsByCategory('finanzen').length,
      utility: getAppsByCategory('utility').length,
      lifestyle: getAppsByCategory('lifestyle').length,
    },
    byStatus: {
      production: getAppsByStatus('production').length,
      beta: getAppsByStatus('beta').length,
      development: getAppsByStatus('development').length,
      planned: getAppsByStatus('planned').length,
    },
    bySource: {
      monorepo: getMonorepoApps().length,
      standalone: getStandaloneApps().length,
    },
    supabaseApps: getSupabaseApps().length,
  }
}
