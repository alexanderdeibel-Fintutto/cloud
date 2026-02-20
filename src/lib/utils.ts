import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function calculateMietpreisbremse(
  kaltmiete: number,
  wohnflaeche: number,
  ortsueblicheMiete: number,
  mietbeginn: Date
): {
  isViolation: boolean
  maxAllowedMiete: number
  currentMietePerQm: number
  potentialSavings: number
  monthsSinceMietbeginn: number
} {
  const currentMietePerQm = kaltmiete / wohnflaeche
  const maxAllowedMiete = ortsueblicheMiete * 1.1 // 10% über ortsüblicher Vergleichsmiete
  const isViolation = currentMietePerQm > maxAllowedMiete

  const now = new Date()
  const monthsSinceMietbeginn = Math.floor(
    (now.getTime() - mietbeginn.getTime()) / (1000 * 60 * 60 * 24 * 30)
  )

  const potentialSavings = isViolation
    ? (currentMietePerQm - maxAllowedMiete) * wohnflaeche * Math.min(monthsSinceMietbeginn, 30)
    : 0

  return {
    isViolation,
    maxAllowedMiete,
    currentMietePerQm,
    potentialSavings,
    monthsSinceMietbeginn,
  }
}

// Maps checker form types to internal formulare routes
const CHECKER_FORM_ROUTE_MAP: Record<string, string> = {
  'mietpreisbremse-ruege': '/formulare/mahnung',
  'mieterhoehung-widerspruch': '/formulare/mieterhoehung',
  'nebenkostenabrechnung-widerspruch': '/formulare/betriebskosten',
  'betriebskosten-pruefung': '/formulare/betriebskosten',
  'kuendigung-widerspruch': '/formulare/kuendigung',
  'kaution-rueckforderung': '/formulare/mahnung',
  'mietminderung-anzeige': '/formulare/mahnung',
  'eigenbedarf-widerspruch': '/formulare/kuendigung',
  'modernisierung-widerspruch': '/formulare/mahnung',
  'schoenheitsreparaturen-widerspruch': '/formulare/kuendigung',
}

export function getFormulareAppUrl(formType: string, prefillData?: Record<string, string>): string {
 claude/improve-app-integration-k7JF2
  const baseUrl = import.meta.env.VITE_FORMULARE_APP_URL || 'https://portal.fintutto.cloud'
  const url = new URL(`${baseUrl}/formulare/${formType}`)

  const route = CHECKER_FORM_ROUTE_MAP[formType] || '/formulare'
 main

  if (prefillData) {
    const params = new URLSearchParams(prefillData).toString()
    return `${route}?${params}`
  }

  return route
}

export function getRechnerAppUrl(rechnerType: string, prefillData?: Record<string, string>): string {
  const baseUrl = import.meta.env.VITE_FORMULARE_APP_URL || 'https://portal.fintutto.cloud'
  const url = new URL(`${baseUrl}/rechner/${rechnerType}`)

  if (prefillData) {
    Object.entries(prefillData).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  return url.toString()
}
