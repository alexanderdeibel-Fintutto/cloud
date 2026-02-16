import type { AppConfig } from '@fintutto/core'

/**
 * Vermietify — Die professionelle Immobilien-Verwaltung.
 * Voller Feature-Umfang für Vermieter und Hausverwaltungen.
 */
export const vermietifyConfig: AppConfig = {
  id: 'vermietify',
  name: 'Vermietify',
  displayName: 'Vermietify',
  version: '1.0.0',
  description: 'Professionelle Immobilienverwaltung',

  theme: {
    primary: '#0ea5e9',
    secondary: '#0284c7',
    accent: '#38bdf8',
    logo: '/logo.svg',
  },

  features: {
    dashboard: true,
    properties: true,
    tenants: true,
    meters: true,
    documents: true,
    payments: true,
    calculators: false,
    checkers: false,
    bescheide: false,
    tasks: true,
    aiChat: true,
    settings: true,
    banking: true,
    whatsapp: true,
    elster: true,
    tenantPortal: true,
  },

  defaultRole: 'owner',
  availableRoles: ['owner', 'tenant', 'caretaker', 'admin', 'employee'],

  stripe: {
    products: {
      starter: { monthly: 'price_1Sr55p52lqSgjCzeX6tlI5tv', yearly: '' },
      basic: { monthly: 'price_1Sr56K52lqSgjCzeqfCfOudX', yearly: '' },
      pro: { monthly: 'price_1Sr56o52lqSgjCzeRuGrant2', yearly: '' },
      enterprise: { monthly: 'price_1Sr57E52lqSgjCzeX6tlI5tv', yearly: '' },
    },
    features: {
      starter: ['1 property', '5 units', '3 portal credits/month'],
      basic: ['3 properties', '25 units', '10 portal credits/month'],
      pro: ['10 properties', '100 units', '30 portal credits/month'],
      enterprise: ['unlimited', 'API access', 'custom branding'],
    },
  },

  pwa: {
    name: 'Vermietify',
    shortName: 'Vermietify',
    startUrl: '/',
    display: 'standalone',
    orientation: 'any',
    backgroundColor: '#ffffff',
    themeColor: '#0ea5e9',
    categories: ['business', 'finance'],
  },

  supabase: {
    url: 'https://aaefocdqgdgexkcrjhks.supabase.co',
  },

  navigation: {
    sidebar: [
      { icon: 'LayoutDashboard', label: 'Dashboard', path: '/dashboard' },
      { icon: 'Building2', label: 'Gebäude', path: '/gebaeude' },
      { icon: 'Home', label: 'Einheiten', path: '/einheiten' },
      { icon: 'Users', label: 'Mieter', path: '/mieter' },
      { icon: 'FileText', label: 'Verträge', path: '/vertraege' },
      { icon: 'CreditCard', label: 'Zahlungen', path: '/zahlungen' },
      { icon: 'Gauge', label: 'Zähler', path: '/zaehler' },
      { icon: 'ClipboardList', label: 'Aufgaben', path: '/aufgaben' },
      { icon: 'Settings', label: 'Einstellungen', path: '/einstellungen' },
    ],
    bottomNav: [
      { icon: 'Home', label: 'Home', path: '/dashboard' },
      { icon: 'Building2', label: 'Gebäude', path: '/gebaeude' },
      { icon: 'Users', label: 'Mieter', path: '/mieter' },
      { icon: 'Bell', label: 'Alerts', path: '/benachrichtigungen' },
      { icon: 'User', label: 'Profil', path: '/einstellungen' },
    ],
  },
}
