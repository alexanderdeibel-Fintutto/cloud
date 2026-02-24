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
