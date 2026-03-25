// OCR Processing Engine for Utility Bills (Versorger-Rechnungen)
// In production, this would call Tesseract.js, Google Vision API, or a custom OCR endpoint

export interface OcrBillResult {
  id: string
  scannedAt: string
  status: 'processing' | 'completed' | 'error'
  confidence: number // 0-100
  provider: string
  billType: BillType
  billNumber: string
  billDate: string
  billingPeriod: { from: string; to: string }
  customer: {
    name: string
    customerNumber: string
    address: string
  }
  meter: {
    meterNumber: string
    readingStart: number
    readingEnd: number
    consumption: number
    unit: 'kWh' | 'm³' | 'Liter'
  }
  costs: {
    basePrice: number
    consumptionPrice: number
    taxes: number
    totalGross: number
    prepayments: number
    balance: number // positive = Nachzahlung, negative = Guthaben
  }
  rawText?: string
}

export type BillType = 'strom' | 'gas' | 'wasser' | 'fernwaerme' | 'heizoel'

export const BILL_TYPE_LABELS: Record<BillType, string> = {
  strom: 'Strom',
  gas: 'Gas',
  wasser: 'Wasser',
  fernwaerme: 'Fernwärme',
  heizoel: 'Heizöl',
}

export const BILL_TYPE_UNITS: Record<BillType, 'kWh' | 'm³' | 'Liter'> = {
  strom: 'kWh',
  gas: 'kWh',
  wasser: 'm³',
  fernwaerme: 'kWh',
  heizoel: 'Liter',
}

// Known German utility providers with their patterns
const PROVIDER_PATTERNS: Record<string, { name: string; types: BillType[] }> = {
  'vattenfall': { name: 'Vattenfall', types: ['strom', 'gas', 'fernwaerme'] },
  'eon': { name: 'E.ON', types: ['strom', 'gas'] },
  'e.on': { name: 'E.ON', types: ['strom', 'gas'] },
  'rwe': { name: 'RWE', types: ['strom', 'gas'] },
  'enBW': { name: 'EnBW', types: ['strom', 'gas'] },
  'enbw': { name: 'EnBW', types: ['strom', 'gas'] },
  'stadtwerke': { name: 'Stadtwerke', types: ['strom', 'gas', 'wasser', 'fernwaerme'] },
  'eprimo': { name: 'eprimo', types: ['strom', 'gas'] },
  'lichtblick': { name: 'LichtBlick', types: ['strom', 'gas'] },
  'yello': { name: 'Yello', types: ['strom', 'gas'] },
  'naturstrom': { name: 'Naturstrom', types: ['strom', 'gas'] },
  'mainova': { name: 'Mainova', types: ['strom', 'gas', 'wasser'] },
  'swm': { name: 'SWM München', types: ['strom', 'gas', 'wasser', 'fernwaerme'] },
  'gasag': { name: 'GASAG', types: ['gas'] },
  'bwb': { name: 'BWB Berliner Wasserbetriebe', types: ['wasser'] },
}

// Simulated OCR text extraction patterns
const FIELD_PATTERNS = {
  billNumber: /(?:Rechnungsnummer|Rechnung Nr\.?|Beleg-Nr\.?)\s*[:.]?\s*(\S+)/i,
  customerNumber: /(?:Kundennummer|Kunden-Nr\.?|Vertragskontonummer)\s*[:.]?\s*(\S+)/i,
  meterNumber: /(?:Zählernummer|Zähler-Nr\.?|Zähler)\s*[:.]?\s*(\S+)/i,
  billingFrom: /(?:Abrechnungszeitraum|Zeitraum).*?(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i,
  billingTo: /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s*(?:bis|[-–])\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i,
  readingStart: /(?:Alter Stand|Anfangsstand|Vorjahresstand)\s*[:.]?\s*([\d.,]+)/i,
  readingEnd: /(?:Neuer Stand|Endstand|Aktueller Stand)\s*[:.]?\s*([\d.,]+)/i,
  consumption: /(?:Verbrauch|Gesamtverbrauch)\s*[:.]?\s*([\d.,]+)\s*(kWh|m³|Liter)?/i,
  totalGross: /(?:Gesamtbetrag|Rechnungsbetrag|Bruttobetrag)\s*[:.]?\s*([\d.,]+)\s*(?:EUR|€)?/i,
  prepayments: /(?:Abschlag|Vorauszahlung|Geleistete Zahlungen)\s*[:.]?\s*-?\s*([\d.,]+)\s*(?:EUR|€)?/i,
}

function parseGermanNumber(str: string): number {
  return parseFloat(str.replace(/\./g, '').replace(',', '.'))
}

function detectProvider(text: string): string {
  const lower = text.toLowerCase()
  for (const [key, val] of Object.entries(PROVIDER_PATTERNS)) {
    if (lower.includes(key.toLowerCase())) {
      return val.name
    }
  }
  return 'Unbekannter Versorger'
}

function detectBillType(text: string): BillType {
  const lower = text.toLowerCase()
  if (lower.includes('strom') || lower.includes('elektr')) return 'strom'
  if (lower.includes('gas') || lower.includes('erdgas')) return 'gas'
  if (lower.includes('wasser') || lower.includes('trinkwasser') || lower.includes('abwasser')) return 'wasser'
  if (lower.includes('fernwärme') || lower.includes('fernwaerme')) return 'fernwaerme'
  if (lower.includes('heizöl') || lower.includes('heizoel')) return 'heizoel'
  return 'strom'
}

export function processOcrText(rawText: string): OcrBillResult {
  const provider = detectProvider(rawText)
  const billType = detectBillType(rawText)
  const unit = BILL_TYPE_UNITS[billType]

  const billNumber = rawText.match(FIELD_PATTERNS.billNumber)?.[1] || `R-${Date.now()}`
  const customerNumber = rawText.match(FIELD_PATTERNS.customerNumber)?.[1] || ''
  const meterNumber = rawText.match(FIELD_PATTERNS.meterNumber)?.[1] || ''

  const consumptionMatch = rawText.match(FIELD_PATTERNS.consumption)
  const consumption = consumptionMatch ? parseGermanNumber(consumptionMatch[1]) : 0

  const readingStartMatch = rawText.match(FIELD_PATTERNS.readingStart)
  const readingStart = readingStartMatch ? parseGermanNumber(readingStartMatch[1]) : 0

  const readingEndMatch = rawText.match(FIELD_PATTERNS.readingEnd)
  const readingEnd = readingEndMatch ? parseGermanNumber(readingEndMatch[1]) : readingStart + consumption

  const totalMatch = rawText.match(FIELD_PATTERNS.totalGross)
  const totalGross = totalMatch ? parseGermanNumber(totalMatch[1]) : 0

  const prepayMatch = rawText.match(FIELD_PATTERNS.prepayments)
  const prepayments = prepayMatch ? parseGermanNumber(prepayMatch[1]) : 0

  const basePrice = totalGross * 0.25
  const taxes = totalGross * 0.16
  const consumptionPrice = totalGross - basePrice - taxes

  let confidence = 40
  if (provider !== 'Unbekannter Versorger') confidence += 15
  if (consumption > 0) confidence += 15
  if (totalGross > 0) confidence += 15
  if (meterNumber) confidence += 10
  if (customerNumber) confidence += 5

  return {
    id: `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    scannedAt: new Date().toISOString(),
    status: 'completed',
    confidence: Math.min(confidence, 98),
    provider,
    billType,
    billNumber,
    billDate: new Date().toISOString().split('T')[0],
    billingPeriod: {
      from: '2025-01-01',
      to: '2025-12-31',
    },
    customer: {
      name: '',
      customerNumber,
      address: '',
    },
    meter: {
      meterNumber,
      readingStart,
      readingEnd,
      consumption: consumption || readingEnd - readingStart,
      unit,
    },
    costs: {
      basePrice: Math.round(basePrice * 100) / 100,
      consumptionPrice: Math.round(consumptionPrice * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      totalGross: Math.round(totalGross * 100) / 100,
      prepayments: Math.round(prepayments * 100) / 100,
      balance: Math.round((totalGross - prepayments) * 100) / 100,
    },
    rawText,
  }
}

// Simulate OCR from image file - in production this calls a real OCR API
export async function processImageFile(file: File): Promise<OcrBillResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

  // Generate realistic demo data based on file name hints
  const fileName = file.name.toLowerCase()
  let billType: BillType = 'strom'
  if (fileName.includes('gas')) billType = 'gas'
  else if (fileName.includes('wasser')) billType = 'wasser'
  else if (fileName.includes('waerme') || fileName.includes('wärme')) billType = 'fernwaerme'

  const unit = BILL_TYPE_UNITS[billType]
  const isStrom = billType === 'strom'
  const consumption = isStrom
    ? 2800 + Math.round(Math.random() * 1200)
    : billType === 'gas'
    ? 12000 + Math.round(Math.random() * 6000)
    : billType === 'wasser'
    ? 80 + Math.round(Math.random() * 60)
    : 8000 + Math.round(Math.random() * 4000)

  const pricePerUnit = isStrom
    ? 0.32 + Math.random() * 0.08
    : billType === 'gas'
    ? 0.12 + Math.random() * 0.04
    : billType === 'wasser'
    ? 4.5 + Math.random() * 2
    : 0.1 + Math.random() * 0.04

  const basePrice = isStrom ? 120 + Math.random() * 40 : 80 + Math.random() * 60
  const consumptionPrice = consumption * pricePerUnit
  const taxes = (basePrice + consumptionPrice) * 0.19
  const totalGross = basePrice + consumptionPrice + taxes
  const monthlyPrepayment = totalGross / 12
  const prepayments = Math.round(monthlyPrepayment * 12 * 100) / 100

  const providers = ['Vattenfall', 'E.ON', 'EnBW', 'Stadtwerke Berlin', 'SWM München', 'RWE']
  const provider = providers[Math.floor(Math.random() * providers.length)]

  const readingStart = Math.round(10000 + Math.random() * 50000)

  return {
    id: `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    scannedAt: new Date().toISOString(),
    status: 'completed',
    confidence: 75 + Math.round(Math.random() * 20),
    provider,
    billType,
    billNumber: `R-${2025}-${Math.floor(1000 + Math.random() * 9000)}`,
    billDate: '2025-12-15',
    billingPeriod: { from: '2025-01-01', to: '2025-12-31' },
    customer: {
      name: 'Max Mustermann',
      customerNumber: `KD-${Math.floor(100000 + Math.random() * 900000)}`,
      address: 'Musterstraße 42, 10115 Berlin',
    },
    meter: {
      meterNumber: `Z-${Math.floor(10000 + Math.random() * 90000)}`,
      readingStart,
      readingEnd: readingStart + consumption,
      consumption,
      unit,
    },
    costs: {
      basePrice: Math.round(basePrice * 100) / 100,
      consumptionPrice: Math.round(consumptionPrice * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      totalGross: Math.round(totalGross * 100) / 100,
      prepayments: Math.round(prepayments * 100) / 100,
      balance: Math.round((totalGross - prepayments) * 100) / 100,
    },
  }
}
