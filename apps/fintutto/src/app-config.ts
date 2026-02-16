import type { AppConfig } from '@fintutto/core'

/**
 * Fintutto Full — Die All-in-One Immobilien- & Finanz-App.
 * Alle Features aktiviert, für Vermieter und Power-User.
 */
export const appConfig: AppConfig = {
  // Identität
  id: 'fintutto',
  name: 'Fintutto',
  displayName: 'Fintutto',
  version: '1.0.0',
  description: 'Die All-in-One Immobilien- & Finanz-App',

  // Branding
  theme: {
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#f59e0b',
    logo: '/icons/logo.svg',
    favicon: '/icons/favicon.svg',
  },

  // Alle Features aktiv (Full Version)
  features: {
    dashboard: true,
    properties: true,
    tenants: true,
    meters: true,
    documents: true,
    payments: true,
    calculators: true,
    checkers: true,
    bescheide: true,
    tasks: true,
    aiChat: true,
    settings: true,
  },

  // Rollen
  defaultRole: 'owner',
  availableRoles: ['owner', 'tenant', 'caretaker', 'admin'],

  // Stripe-Produkte
  stripe: {
    products: {
      starter: {
        monthly: 'price_fintutto_starter_monthly',
        yearly: 'price_fintutto_starter_yearly',
      },
      pro: {
        monthly: 'price_fintutto_pro_monthly',
        yearly: 'price_fintutto_pro_yearly',
      },
      unlimited: {
        monthly: 'price_fintutto_unlimited_monthly',
        yearly: 'price_fintutto_unlimited_yearly',
      },
    },
    features: {
      free: ['dashboard', 'calculators:3/month', 'checkers:1/month'],
      starter: ['dashboard', 'properties:3', 'calculators:10/month', 'checkers:5/month', 'aiChat:basic'],
      pro: ['all', 'properties:20', 'aiChat:advanced', 'documents:export', 'bescheide'],
      unlimited: ['all', 'unlimited'],
    },
  },

  // PWA
  pwa: {
    name: 'Fintutto',
    shortName: 'Fintutto',
    startUrl: '/',
    display: 'standalone',
    orientation: 'any',
    backgroundColor: '#ffffff',
    themeColor: '#2563eb',
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
      { icon: 'Building2', label: 'Immobilien', path: '/properties' },
      { icon: 'Users', label: 'Mieter', path: '/tenants' },
      { icon: 'Gauge', label: 'Zähler', path: '/meters' },
      { icon: 'FileText', label: 'Dokumente', path: '/documents' },
      { icon: 'CreditCard', label: 'Zahlungen', path: '/payments' },
      { icon: 'Calculator', label: 'Rechner', path: '/calculators' },
      { icon: 'CheckCircle', label: 'Checker', path: '/checkers' },
      { icon: 'FileBox', label: 'Bescheide', path: '/bescheide' },
      { icon: 'ClipboardList', label: 'Aufgaben', path: '/tasks' },
      { icon: 'Settings', label: 'Einstellungen', path: '/settings' },
    ],
    bottomNav: [
      { icon: 'Home', label: 'Home', path: '/' },
      { icon: 'Building2', label: 'Objekte', path: '/properties' },
      { icon: 'Plus', label: 'Neu', path: '/new', primary: true },
      { icon: 'Bell', label: 'Alerts', path: '/notifications' },
      { icon: 'User', label: 'Profil', path: '/settings' },
    ],
  },
}
