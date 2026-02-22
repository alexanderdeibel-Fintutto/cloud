// Shared utilities and components for Fintutto apps
export const FINTUTTO_VERSION = '1.0.0'

// Re-export central ecosystem registry (Single Source of Truth)
export * from './ecosystem'
export { ecosystem as ECOSYSTEM } from './ecosystem'

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

// Cent to Euro conversion
export function centToEuro(cents: number): number {
  return cents / 100
}

export function euroToCent(euros: number): number {
  return Math.round(euros * 100)
}

export function formatCent(cents: number): string {
  return formatEuro(centToEuro(cents))
}

// Date formatting
export function formatDateDE(date: Date | string): string {
  return new Intl.DateTimeFormat('de-DE').format(new Date(date))
}

// Building type labels (German) - matches real vermietify schema
export const BUILDING_TYPE_LABELS: Record<string, string> = {
  apartment: 'Mehrfamilienhaus',
  house: 'Einfamilienhaus',
  commercial: 'Gewerbeimmobilie',
  mixed: 'Gemischt',
}

export const UNIT_STATUS_LABELS: Record<string, string> = {
  vacant: 'Leer',
  rented: 'Vermietet',
  renovating: 'Renovierung',
}

export const METER_TYPE_LABELS: Record<string, string> = {
  electricity: 'Strom',
  gas: 'Gas',
  water: 'Wasser',
  heating: 'Heizung',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Ausstehend',
  paid: 'Bezahlt',
  overdue: 'Überfällig',
  partial: 'Teilweise',
}

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  low: 'Niedrig',
  normal: 'Normal',
  high: 'Hoch',
  urgent: 'Dringend',
}

export const TASK_STATUS_LABELS: Record<string, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  completed: 'Erledigt',
  cancelled: 'Abgebrochen',
}

// Legacy FINTUTTO_APPS – kept for backwards compatibility.
// Prefer importing from './ecosystem' directly.
// This derives from the ecosystem registry so URLs stay in sync.
import { ecosystem } from './ecosystem'

export const FINTUTTO_APPS = {
  vermietify: { name: ecosystem.vermietify.name, slug: 'vermietify', description: ecosystem.vermietify.description, icon: ecosystem.vermietify.icon, url: ecosystem.vermietify.domain },
  ablesung: { name: ecosystem.ablesung.name, slug: 'ablesung', description: ecosystem.ablesung.description, icon: ecosystem.ablesung.icon, url: ecosystem.ablesung.domain },
  hausmeisterPro: { name: ecosystem.hausmeister.name, slug: 'hausmeister-pro', description: ecosystem.hausmeister.description, icon: ecosystem.hausmeister.icon, url: ecosystem.hausmeister.domain },
  mieter: { name: ecosystem.mieter.name, slug: 'mieter', description: ecosystem.mieter.description, icon: ecosystem.mieter.icon, url: ecosystem.mieter.domain },
  bescheidboxer: { name: ecosystem.bescheidboxer.name, slug: 'bescheidboxer', description: ecosystem.bescheidboxer.description, icon: ecosystem.bescheidboxer.icon, url: ecosystem.bescheidboxer.domain },
  portal: { name: ecosystem.portal.name, slug: 'portal', description: ecosystem.portal.description, icon: ecosystem.portal.icon, url: ecosystem.portal.domain },
  adminHub: { name: ecosystem.admin.name, slug: 'admin-hub', description: ecosystem.admin.description, icon: ecosystem.admin.icon, url: ecosystem.admin.domain },
  financialCompass: { name: ecosystem['financial-compass'].name, slug: 'financial-compass', description: ecosystem['financial-compass'].description, icon: ecosystem['financial-compass'].icon, url: ecosystem['financial-compass'].domain },
} as const

export type FintuttoAppKey = keyof typeof FINTUTTO_APPS

// Re-export all database types
export * from './types/database'

// Re-export shared hooks
export * from './hooks'
