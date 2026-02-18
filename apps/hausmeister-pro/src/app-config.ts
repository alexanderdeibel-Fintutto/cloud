import type { AppConfig } from '@fintutto/core'

/**
 * HausmeisterPro — Die Hausmeister-App fuer Auftraege, Rundgaenge & Zaehler.
 * Caretaker-fokussiert mit Tasks, Meters und Read-Only Properties.
 */
export const appConfig: AppConfig = {
  // Identitaet
  id: 'hausmeister-pro',
  name: 'HausmeisterPro',
  displayName: 'HausmeisterPro',
  version: '1.0.0',
  description: 'Auftraege, Rundgaenge & Zaehler fuer Hausmeister',

  // Branding
  theme: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    logo: '/icons/logo.svg',
    favicon: '/icons/favicon.svg',
  },

  // Features (caretaker-fokussiert)
  features: {
    dashboard: true,
    properties: true, // read-only view
    tenants: false,
    meters: true,
    documents: false,
    payments: false,
    calculators: false,
    checkers: false,
    bescheide: false,
    tasks: true,
    aiChat: false,
    settings: true,
  },

  // Rollen
  defaultRole: 'caretaker',
  availableRoles: ['caretaker', 'admin'],

  // Stripe-Produkte (nicht verwendet fuer Hausmeister-App)
  stripe: {
    products: {},
    features: {
      free: ['dashboard', 'tasks', 'meters'],
      starter: ['all'],
      pro: ['all'],
      unlimited: ['all'],
    },
  },

  // PWA
  pwa: {
    name: 'HausmeisterPro',
    shortName: 'HausmeisterPro',
    startUrl: '/',
    display: 'standalone',
    orientation: 'any',
    backgroundColor: '#ffffff',
    themeColor: '#f97316',
    categories: ['business', 'utilities'],
  },

  // Supabase
  supabase: {
    url: 'https://aaefocdqgdgexkcrjhks.supabase.co',
  },

  // Navigation
  navigation: {
    sidebar: [
      { icon: 'LayoutDashboard', label: 'Dashboard', path: '/' },
      { icon: 'ClipboardList', label: 'Auftraege', path: '/tasks' },
      { icon: 'Route', label: 'Rundgaenge', path: '/rounds' },
      { icon: 'Gauge', label: 'Zaehler', path: '/meters' },
      { icon: 'Building2', label: 'Gebaeude', path: '/buildings' },
      { icon: 'Settings', label: 'Einstellungen', path: '/settings' },
    ],
    bottomNav: [
      { icon: 'Home', label: 'Home', path: '/' },
      { icon: 'ClipboardList', label: 'Auftraege', path: '/tasks' },
      { icon: 'Gauge', label: 'Zaehler', path: '/meters' },
      { icon: 'Building2', label: 'Gebaeude', path: '/buildings' },
      { icon: 'User', label: 'Profil', path: '/settings' },
    ],
  },
}
