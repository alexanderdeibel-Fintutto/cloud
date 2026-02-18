import type { AppConfig } from '@fintutto/core'

/**
 * BescheidBoxer — Steuerbescheide analysieren und prüfen.
 * Spezialisiert auf Upload, OCR-Analyse und Auswertung von Steuerbescheiden.
 */
export const appConfig: AppConfig = {
  // Identität
  id: 'bescheid-boxer',
  name: 'BescheidBoxer',
  displayName: 'BescheidBoxer',
  version: '1.0.0',
  description: 'Steuerbescheide analysieren und prüfen',

  // Branding
  theme: {
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#f87171',
    logo: '/icons/logo.svg',
    favicon: '/icons/favicon.svg',
  },

  // Nur relevante Features aktiviert
  features: {
    dashboard: true,
    properties: false,
    tenants: false,
    meters: false,
    documents: true,
    payments: false,
    calculators: false,
    checkers: false,
    bescheide: true,
    tasks: false,
    aiChat: false,
    settings: true,
  },

  // Rollen
  defaultRole: 'owner',
  availableRoles: ['owner', 'admin'],

  // Stripe-Produkte
  stripe: {
    products: {
      starter: {
        monthly: 'price_bescheidboxer_starter_monthly',
        yearly: 'price_bescheidboxer_starter_yearly',
      },
      pro: {
        monthly: 'price_bescheidboxer_pro_monthly',
        yearly: 'price_bescheidboxer_pro_yearly',
      },
      unlimited: {
        monthly: 'price_bescheidboxer_unlimited_monthly',
        yearly: 'price_bescheidboxer_unlimited_yearly',
      },
    },
    features: {
      free: ['dashboard', 'documents:5', 'bescheide:3/month'],
      starter: ['dashboard', 'documents:50', 'bescheide:20/month'],
      pro: ['all', 'documents:unlimited', 'bescheide:unlimited'],
      unlimited: ['all', 'unlimited'],
    },
  },

  // PWA
  pwa: {
    name: 'BescheidBoxer',
    shortName: 'BescheidBoxer',
    startUrl: '/',
    display: 'standalone',
    orientation: 'any',
    backgroundColor: '#ffffff',
    themeColor: '#ef4444',
    categories: ['finance', 'business', 'utilities'],
  },

  // Supabase
  supabase: {
    url: 'https://aaefocdqgdgexkcrjhks.supabase.co',
  },

  // Navigation
  navigation: {
    sidebar: [
      { icon: 'LayoutDashboard', label: 'Dashboard', path: '/' },
      { icon: 'Upload', label: 'Bescheide hochladen', path: '/upload' },
      { icon: 'FileBox', label: 'Meine Bescheide', path: '/documents' },
      { icon: 'BarChart3', label: 'Analyse', path: '/analysis' },
      { icon: 'Settings', label: 'Einstellungen', path: '/settings' },
    ],
    bottomNav: [
      { icon: 'Home', label: 'Home', path: '/' },
      { icon: 'Upload', label: 'Upload', path: '/upload', primary: true },
      { icon: 'FileBox', label: 'Bescheide', path: '/documents' },
      { icon: 'BarChart3', label: 'Analyse', path: '/analysis' },
      { icon: 'User', label: 'Profil', path: '/settings' },
    ],
  },
}
