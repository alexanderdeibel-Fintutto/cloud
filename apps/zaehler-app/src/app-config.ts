import type { AppConfig } from '@fintutto/core'

/**
 * ZählerApp — Die fokussierte Zählerablesung-PWA.
 * Nur Zähler-relevante Features aktiviert.
 */
export const appConfig: AppConfig = {
  // Identität
  id: 'zaehler-app',
  name: 'ZählerApp',
  displayName: 'ZählerApp',
  version: '1.0.0',
  description: 'Die smarte Zählerablesung-App',

  // Branding
  theme: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    logo: '/icons/logo.svg',
    favicon: '/icons/favicon.svg',
  },

  // Nur Zähler-Features (fokussierte App)
  features: {
    dashboard: true,
    properties: false,
    tenants: false,
    meters: true,
    documents: false,
    payments: false,
    calculators: false,
    checkers: false,
    bescheide: false,
    tasks: false,
    aiChat: false,
    settings: true,
  },

  // Rollen
  defaultRole: 'owner',
  availableRoles: ['owner', 'tenant', 'caretaker'],

  // Stripe-Produkte
  stripe: {
    products: {
      starter: {
        monthly: 'price_zaehler_starter_monthly',
        yearly: 'price_zaehler_starter_yearly',
      },
      pro: {
        monthly: 'price_zaehler_pro_monthly',
        yearly: 'price_zaehler_pro_yearly',
      },
      unlimited: {
        monthly: 'price_zaehler_unlimited_monthly',
        yearly: 'price_zaehler_unlimited_yearly',
      },
    },
    features: {
      free: ['dashboard', 'meters:5'],
      starter: ['dashboard', 'meters:25'],
      pro: ['dashboard', 'meters:100'],
      unlimited: ['all', 'unlimited'],
    },
  },

  // PWA
  pwa: {
    name: 'ZählerApp',
    shortName: 'Zähler',
    startUrl: '/',
    display: 'standalone',
    orientation: 'any',
    backgroundColor: '#ffffff',
    themeColor: '#8b5cf6',
    categories: ['utilities', 'business'],
  },

  // Supabase
  supabase: {
    url: 'https://aaefocdqgdgexkcrjhks.supabase.co',
  },

  // Navigation
  navigation: {
    sidebar: [
      { icon: 'LayoutDashboard', label: 'Dashboard', path: '/' },
      { icon: 'Gauge', label: 'Alle Zähler', path: '/meters' },
      { icon: 'PenLine', label: 'Ablesung erfassen', path: '/capture' },
      { icon: 'History', label: 'Verlauf', path: '/history' },
      { icon: 'Settings', label: 'Einstellungen', path: '/settings' },
    ],
    bottomNav: [
      { icon: 'Home', label: 'Home', path: '/' },
      { icon: 'Gauge', label: 'Zähler', path: '/meters' },
      { icon: 'PenLine', label: 'Erfassen', path: '/capture', primary: true },
      { icon: 'History', label: 'Verlauf', path: '/history' },
      { icon: 'User', label: 'Profil', path: '/settings' },
    ],
  },
}
