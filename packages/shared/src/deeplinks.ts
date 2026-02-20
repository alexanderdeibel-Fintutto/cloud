import { FINTUTTO_APPS } from './index'

/**
 * Cross-app deep link builder for the Fintutto ecosystem.
 * Generates URLs with query parameters so one app can link to another
 * with pre-filled form data.
 */

interface RentData {
  rent?: number
  address?: string
  tenant?: string
  unitId?: string
}

interface PropertyData {
  street?: string
  houseNumber?: string
  postalCode?: string
  city?: string
  area?: number
  rooms?: number
  floor?: string
  rent?: number
  deposit?: number
  tenantFirst?: string
  tenantLast?: string
  tenantEmail?: string
}

// Portal Rechner deep links
export function kautionsRechnerLink(data: RentData): string {
  const params = new URLSearchParams()
  if (data.rent) params.set('rent', String(data.rent))
  if (data.address) params.set('address', data.address)
  return `${FINTUTTO_APPS.portal.url}/rechner/kaution?${params}`
}

export function mieterhoehungRechnerLink(data: RentData): string {
  const params = new URLSearchParams()
  if (data.rent) params.set('rent', String(data.rent))
  if (data.address) params.set('address', data.address)
  return `${FINTUTTO_APPS.portal.url}/rechner/mieterhoehung?${params}`
}

export function renditeRechnerLink(data: RentData): string {
  const params = new URLSearchParams()
  if (data.rent) params.set('rent', String(data.rent))
  return `${FINTUTTO_APPS.portal.url}/rechner/rendite?${params}`
}

// Portal Formular deep links
export function mietvertragLink(data: PropertyData): string {
  const params = new URLSearchParams()
  if (data.street) params.set('street', data.street)
  if (data.houseNumber) params.set('houseNr', data.houseNumber)
  if (data.postalCode) params.set('plz', data.postalCode)
  if (data.city) params.set('city', data.city)
  if (data.area) params.set('area', String(data.area))
  if (data.rooms) params.set('rooms', String(data.rooms))
  if (data.rent) params.set('rent', String(data.rent))
  if (data.deposit) params.set('deposit', String(data.deposit))
  if (data.tenantFirst) params.set('tenantFirst', data.tenantFirst)
  if (data.tenantLast) params.set('tenantLast', data.tenantLast)
  if (data.tenantEmail) params.set('tenantEmail', data.tenantEmail)
  return `${FINTUTTO_APPS.portal.url}/formulare/mietvertrag?${params}`
}

/**
 * Parse deep link params from current URL.
 * Call in a portal page to read pre-filled values from the query string.
 */
export function parseDeepLinkParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}

// Convenience: all portal tool links for a given unit
export function getPortalLinks(data: RentData & PropertyData) {
  return {
    kautionsRechner: kautionsRechnerLink(data),
    mieterhoehungRechner: mieterhoehungRechnerLink(data),
    renditeRechner: renditeRechnerLink(data),
    mietvertrag: mietvertragLink(data),
  }
}
