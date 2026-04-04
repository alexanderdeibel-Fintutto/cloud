import { describe, it, expect } from 'vitest'
import { processOcrText, BILL_TYPE_LABELS, BILL_TYPE_UNITS } from './ocr'

describe('processOcrText', () => {
  it('detects Vattenfall as provider', () => {
    const text = 'Vattenfall Europe Sales GmbH\nStromrechnung 2025'
    const result = processOcrText(text)
    expect(result.provider).toBe('Vattenfall')
  })

  it('detects E.ON as provider', () => {
    const text = 'E.ON Energie Deutschland\nJahresabrechnung Strom'
    const result = processOcrText(text)
    expect(result.provider).toBe('E.ON')
  })

  it('returns unknown for unrecognized provider', () => {
    const text = 'Unbekannte Firma GmbH\nRechnung'
    const result = processOcrText(text)
    expect(result.provider).toBe('Unbekannter Versorger')
  })

  it('detects Strom bill type', () => {
    const text = 'Jahresabrechnung Strom\nVerbrauch: 3.200 kWh'
    const result = processOcrText(text)
    expect(result.billType).toBe('strom')
  })

  it('detects Gas bill type', () => {
    const text = 'Erdgas-Abrechnung\nVerbrauch: 15.000 kWh'
    const result = processOcrText(text)
    expect(result.billType).toBe('gas')
  })

  it('detects Wasser bill type', () => {
    const text = 'Trinkwasser-Abrechnung\nVerbrauch: 120 m³'
    const result = processOcrText(text)
    expect(result.billType).toBe('wasser')
  })

  it('detects Fernwärme bill type', () => {
    const text = 'Fernwärme Abrechnung\nVerbrauch: 8.500 kWh'
    const result = processOcrText(text)
    expect(result.billType).toBe('fernwaerme')
  })

  it('extracts bill number', () => {
    const text = 'Rechnungsnummer: R-2025-1234\nVattenfall Strom'
    const result = processOcrText(text)
    expect(result.billNumber).toBe('R-2025-1234')
  })

  it('extracts customer number', () => {
    const text = 'Vattenfall Strom\nKundennummer: KD-123456'
    const result = processOcrText(text)
    expect(result.customer.customerNumber).toBe('KD-123456')
  })

  it('extracts meter number', () => {
    const text = 'Vattenfall Strom\nZählernummer: Z-98765'
    const result = processOcrText(text)
    expect(result.meter.meterNumber).toBe('Z-98765')
  })

  it('extracts consumption', () => {
    const text = 'Vattenfall Strom\nVerbrauch: 3200 kWh'
    const result = processOcrText(text)
    expect(result.meter.consumption).toBe(3200)
  })

  it('extracts total amount', () => {
    const text = 'Vattenfall Strom\nGesamtbetrag: 1.234,56 EUR'
    const result = processOcrText(text)
    expect(result.costs.totalGross).toBe(1234.56)
  })

  it('extracts prepayments', () => {
    const text = 'Vattenfall Strom\nGeleistete Zahlungen: 1.200,00 EUR'
    const result = processOcrText(text)
    expect(result.costs.prepayments).toBe(1200)
  })

  it('calculates balance from total and prepayments', () => {
    const text = 'Vattenfall Strom\nGesamtbetrag: 1.300,00 EUR\nAbschlag: 1.200,00 EUR'
    const result = processOcrText(text)
    expect(result.costs.balance).toBe(100) // Nachzahlung
  })

  it('sets confidence based on extracted fields', () => {
    // With known provider + consumption + total + meter + customer
    const fullText = 'Vattenfall Strom\nKundennummer: KD-123\nZählernummer: Z-456\nVerbrauch: 3200 kWh\nGesamtbetrag: 1200,00 EUR'
    const fullResult = processOcrText(fullText)

    // With unknown provider and no data
    const emptyText = 'Irgendein Text ohne relevante Daten'
    const emptyResult = processOcrText(emptyText)

    expect(fullResult.confidence).toBeGreaterThan(emptyResult.confidence)
  })

  it('caps confidence at 98', () => {
    const text = 'Vattenfall Strom\nKundennummer: KD-123\nZählernummer: Z-456\nVerbrauch: 3200 kWh\nGesamtbetrag: 1200,00 EUR'
    const result = processOcrText(text)
    expect(result.confidence).toBeLessThanOrEqual(98)
  })

  it('returns completed status', () => {
    const result = processOcrText('test')
    expect(result.status).toBe('completed')
  })

  it('assigns correct unit per bill type', () => {
    expect(BILL_TYPE_UNITS.strom).toBe('kWh')
    expect(BILL_TYPE_UNITS.gas).toBe('kWh')
    expect(BILL_TYPE_UNITS.wasser).toBe('m³')
    expect(BILL_TYPE_UNITS.fernwaerme).toBe('kWh')
    expect(BILL_TYPE_UNITS.heizoel).toBe('Liter')
  })
})

describe('BILL_TYPE_LABELS', () => {
  it('has German labels for all types', () => {
    expect(BILL_TYPE_LABELS.strom).toBe('Strom')
    expect(BILL_TYPE_LABELS.gas).toBe('Gas')
    expect(BILL_TYPE_LABELS.wasser).toBe('Wasser')
    expect(BILL_TYPE_LABELS.fernwaerme).toBe('Fernwärme')
    expect(BILL_TYPE_LABELS.heizoel).toBe('Heizöl')
  })
})
