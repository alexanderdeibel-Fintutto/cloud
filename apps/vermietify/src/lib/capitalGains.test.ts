import { describe, it, expect } from 'vitest'
import { berechneCapitalGains, type PropertySale } from './capitalGains'

function makeSale(overrides: Partial<PropertySale> = {}): PropertySale {
  return {
    id: '1',
    propertyName: 'Test Property',
    purchaseDate: '2015-01-01',
    purchasePrice: 200000,
    purchaseIncidentalCosts: 20000,
    improvements: [],
    saleDate: '2026-01-01',
    salePrice: 300000,
    saleIncidentalCosts: 10000,
    totalAfa: 20000,
    country: 'DE',
    selfUsed: false,
    selfUsedYears: 0,
    ...overrides,
  }
}

describe('berechneCapitalGains', () => {
  it('calculates holding period correctly', () => {
    const sale = makeSale({
      purchaseDate: '2020-06-01',
      saleDate: '2025-06-01',
    })
    const result = berechneCapitalGains(sale)
    expect(result.haltedauerJahre).toBe(5)
  })

  it('calculates acquisition costs including incidentals', () => {
    const sale = makeSale({
      purchasePrice: 200000,
      purchaseIncidentalCosts: 20000,
    })
    const result = berechneCapitalGains(sale)
    expect(result.anschaffungskosten).toBe(220000)
  })

  it('includes Herstellungskosten in investment', () => {
    const sale = makeSale({
      improvements: [
        { id: '1', description: 'Dach', date: '2016-01-01', amount: 30000, type: 'herstellung' },
        { id: '2', description: 'Reparatur', date: '2017-01-01', amount: 5000, type: 'erhaltung' },
      ],
    })
    const result = berechneCapitalGains(sale)
    // Only herstellung counts
    expect(result.herstellungskosten).toBe(30000)
    expect(result.gesamtInvestition).toBe(220000 + 30000)
  })

  it('deducts AfA from basis', () => {
    const sale = makeSale({ totalAfa: 25000 })
    const result = berechneCapitalGains(sale)
    expect(result.bereinigteBasis).toBe(result.gesamtInvestition - 25000)
  })

  it('marks as steuerfrei after 10 year speculation period (DE)', () => {
    const sale = makeSale({
      purchaseDate: '2015-01-01',
      saleDate: '2026-02-01', // > 10 years
      country: 'DE',
    })
    const result = berechneCapitalGains(sale)
    expect(result.spekulationsfristAbgelaufen).toBe(true)
    expect(result.steuerpflichtig).toBe(false)
    expect(result.geschaetztesteuer).toBe(0)
  })

  it('marks as steuerpflichtig within 10 year period (DE)', () => {
    const sale = makeSale({
      purchaseDate: '2020-01-01',
      saleDate: '2025-06-01',
      country: 'DE',
    })
    const result = berechneCapitalGains(sale)
    expect(result.spekulationsfristAbgelaufen).toBe(false)
    expect(result.steuerpflichtig).toBe(true)
    expect(result.geschaetztesteuer).toBeGreaterThan(0)
  })

  it('exempts self-used property with 3+ years (DE)', () => {
    const sale = makeSale({
      purchaseDate: '2022-01-01',
      saleDate: '2025-06-01',
      country: 'DE',
      selfUsed: true,
      selfUsedYears: 3,
    })
    const result = berechneCapitalGains(sale)
    expect(result.steuerpflichtig).toBe(false)
    expect(result.steuerfreiGrund).toContain('Eigennutzung')
  })

  it('applies 30% ImmoESt for Austria', () => {
    const sale = makeSale({
      purchaseDate: '2020-01-01',
      saleDate: '2025-01-01',
      country: 'AT',
    })
    const result = berechneCapitalGains(sale)
    expect(result.steuerpflichtig).toBe(true)
    expect(result.grenzsteuersatz).toBe(30)
  })

  it('applies degressive Grundstückgewinnsteuer for Switzerland', () => {
    // Short holding period = higher rate
    const shortHold = makeSale({
      purchaseDate: '2023-01-01',
      saleDate: '2025-06-01',
      country: 'CH',
    })
    const shortResult = berechneCapitalGains(shortHold)
    expect(shortResult.grenzsteuersatz).toBe(35) // < 5 years

    // Longer period = lower rate
    const longHold = makeSale({
      purchaseDate: '2018-01-01',
      saleDate: '2025-06-01',
      country: 'CH',
    })
    const longResult = berechneCapitalGains(longHold)
    expect(longResult.grenzsteuersatz).toBe(25) // 5-10 years
  })

  it('handles sale at a loss', () => {
    const sale = makeSale({
      purchasePrice: 300000,
      purchaseIncidentalCosts: 30000,
      salePrice: 250000,
      saleIncidentalCosts: 10000,
      totalAfa: 0,
      purchaseDate: '2022-01-01',
      saleDate: '2025-01-01',
      country: 'DE',
    })
    const result = berechneCapitalGains(sale)
    expect(result.veraeusserungsgewinn).toBeLessThan(0)
    expect(result.geschaetztesteuer).toBe(0) // No tax on loss
  })
})
