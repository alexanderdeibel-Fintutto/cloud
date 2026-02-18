import type { AppConfig } from '@fintutto/core'

/**
 * Mieter-Portal — Das Mieterportal von Fintutto.
 * Eingeschraenkte Features fuer Mieter: Dashboard, Zaehler, Dokumente, Zahlungen, Aufgaben, Einstellungen.
 */
export const appConfig: AppConfig = {
  // Identitaet
  id: 'mieter-portal',
  name: 'Mieter-Portal',
  displayName: 'Mieter-Portal',
  version: '1.0.0',
  description: 'Das Mieterportal von Fintutto',

  // Branding
  theme: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    logo: '/icons/logo.svg',
    favicon: '/icons/favicon.svg',
  },

  // Nur Mieter-relevante Features aktiv
  features: {
    dashboard: true,
    properties: false,
    tenants: false,
    meters: true,
    documents: true,
    payments: true,
    calculators: false,
    checkers: false,
    bescheide: false,
    tasks: true,
    aiChat: false,
    settings: true,
  },

  // Rollen
  defaultRole: 'tenant',
  availableRoles: ['tenant'],

  // Stripe-Produkte (leer fuer Mieter-Portal)
  stripe: {
    products: {},
    features: {
      free: ['dashboard', 'meters', 'documents', 'tasks'],
      starter: ['dashboard', 'meters', 'documents', 'tasks'],
      pro: ['dashboard', 'meters', 'documents', 'tasks'],
      unlimited: ['dashboard', 'meters', 'documents', 'tasks'],
    },
  },

  // PWA
  pwa: {
    name: 'Mieter-Portal',
    shortName: 'Mieter',
    startUrl: '/',
    display: 'standalone',
    orientation: 'any',
    backgroundColor: '#ffffff',
    themeColor: '#10b981',
    categories: ['utilities', 'lifestyle'],
  },

  // Supabase
  supabase: {
    url: 'https://aaefocdqgdgexkcrjhks.supabase.co',
  },

  // Navigation
  navigation: {
    sidebar: [
      { icon: 'LayoutDashboard', label: 'Dashboard', path: '/' },
      { icon: 'Home', label: 'Meine Wohnung', path: '/apartment' },
      { icon: 'Gauge', label: 'Zaehler', path: '/meters' },
      { icon: 'FileText', label: 'Dokumente', path: '/documents' },
      { icon: 'AlertTriangle', label: 'Maengel melden', path: '/defects' },
      { icon: 'Settings', label: 'Einstellungen', path: '/settings' },
    ],
    bottomNav: [
      { icon: 'Home', label: 'Home', path: '/' },
      { icon: 'Building2', label: 'Wohnung', path: '/apartment' },
      { icon: 'Gauge', label: 'Zaehler', path: '/meters' },
      { icon: 'AlertTriangle', label: 'Maengel', path: '/defects' },
      { icon: 'User', label: 'Profil', path: '/settings' },
    ],
  },
}
