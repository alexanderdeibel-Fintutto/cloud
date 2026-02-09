import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cn, formatCurrency, formatDate, calculateMietpreisbremse, getFormulareAppUrl } from './utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'hidden')).toBe('base active')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('formatCurrency', () => {
  it('formats positive amounts correctly', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1.234,56')
    expect(result).toContain('€')
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0,00')
  })

  it('formats negative amounts correctly', () => {
    const result = formatCurrency(-500)
    expect(result).toContain('500,00')
  })
})

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2024-03-15')
    expect(result).toBe('15.03.2024')
  })

  it('formats Date object correctly', () => {
    const result = formatDate(new Date(2024, 2, 15))
    expect(result).toBe('15.03.2024')
  })
})

describe('calculateMietpreisbremse', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 5, 1)) // June 1, 2024
  })

  it('detects violation when rent exceeds 10% above local average', () => {
    const result = calculateMietpreisbremse(
      1000, // kaltmiete
      50,   // wohnflaeche (20€/qm)
      15,   // ortsueblicheMiete (max allowed: 16.5€/qm)
      new Date(2024, 0, 1)
    )

    expect(result.isViolation).toBe(true)
    expect(result.currentMietePerQm).toBe(20)
    expect(result.maxAllowedMiete).toBe(16.5)
  })

  it('returns no violation when rent is within limit', () => {
    const result = calculateMietpreisbremse(
      800,  // kaltmiete
      50,   // wohnflaeche (16€/qm)
      15,   // ortsueblicheMiete (max allowed: 16.5€/qm)
      new Date(2024, 0, 1)
    )

    expect(result.isViolation).toBe(false)
    expect(result.potentialSavings).toBe(0)
  })

  it('calculates potential savings correctly', () => {
    const result = calculateMietpreisbremse(
      1100, // kaltmiete
      50,   // wohnflaeche (22€/qm)
      18,   // ortsueblicheMiete (max allowed: 19.8€/qm)
      new Date(2024, 0, 1) // 5 months ago
    )

    expect(result.isViolation).toBe(true)
    expect(result.potentialSavings).toBeGreaterThan(0)
  })
})

describe('getFormulareAppUrl', () => {
  it('generates correct URL for form type', () => {
    const url = getFormulareAppUrl('mietminderung')
    expect(url).toContain('/formulare/mietminderung')
  })

  it('includes prefill data as query params', () => {
    const url = getFormulareAppUrl('kuendigung', {
      name: 'Test User',
      email: 'test@example.com',
    })

    expect(url).toContain('name=Test+User')
    expect(url).toContain('email=test%40example.com')
  })
})
