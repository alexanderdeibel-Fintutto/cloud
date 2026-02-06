// Shared utilities and components for Fintutto apps
export const FINTUTTO_VERSION = '1.0.0'

export const SUPABASE_CONFIG = {
  url: 'https://aaefocdqgdgexkcrjhks.supabase.co',
}

// Shared constants
export const COUNTRIES = ['Deutschland', 'Österreich', 'Schweiz'] as const
export type Country = (typeof COUNTRIES)[number]

// Currency formatting
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

// Date formatting
export function formatDateDE(date: Date | string): string {
  return new Intl.DateTimeFormat('de-DE').format(new Date(date))
}
