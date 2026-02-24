import { describe, it, expect } from 'vitest'
import { berechneAnlageV, berechneSteuer, berechneAfa, type AnlageV, type TaxConfig, type AfaInput } from './tax'

const emptyAnlageV: AnlageV = {
  mieteinnahmen: 0,
  nebenkostenVorauszahlungen: 0,
  sonstigeEinnahmen: 0,
  schuldzinsen: 0,
  abschreibung: 0,
  erhaltungsaufwand: 0,
  grundsteuer: 0,
  versicherungen: 0,
  hausverwaltung: 0,
  fahrtkosten: 0,
  sonstigeWerbungskosten: 0,
  umlagenVereinnahmt: 0,
  umlagenBezahlt: 0,
}

describe('berechneAnlageV', () => {
  it('calculates rental income correctly', () => {
    const daten: AnlageV = {
      ...emptyAnlageV,
      mieteinnahmen: 12000,
      nebenkostenVorauszahlungen: 2400,
      sonstigeEinnahmen: 600,
    }
    const result = berechneAnlageV(daten)
    expect(result.einnahmen).toBe(15000)
    expect(result.werbungskosten).toBe(0)
    expect(result.einkuenfte).toBe(15000)
  })

  it('calculates deductions correctly', () => {
    const daten: AnlageV = {
      ...emptyAnlageV,
      mieteinnahmen: 12000,
      schuldzinsen: 3000,
      abschreibung: 4000,
      erhaltungsaufwand: 1000,
      grundsteuer: 500,
    }
    const result = berechneAnlageV(daten)
    expect(result.einnahmen).toBe(12000)
    expect(result.werbungskosten).toBe(8500)
    expect(result.einkuenfte).toBe(3500)
  })

  it('handles negative rental income (loss)', () => {
    const daten: AnlageV = {
      ...emptyAnlageV,
      mieteinnahmen: 6000,
      schuldzinsen: 5000,
      abschreibung: 4000,
    }
    const result = berechneAnlageV(daten)
    expect(result.einkuenfte).toBeLessThan(0)
    expect(result.einkuenfte).toBe(6000 - 9000)
  })

  it('handles Umlagen correctly', () => {
    const daten: AnlageV = {
      ...emptyAnlageV,
      mieteinnahmen: 12000,
      umlagenVereinnahmt: 2400,
      umlagenBezahlt: 3000,
    }
    const result = berechneAnlageV(daten)
    // umlagenBezahlt - umlagenVereinnahmt = 600 Werbungskosten
    expect(result.werbungskosten).toBe(600)
    expect(result.einkuenfte).toBe(11400)
  })
})

describe('berechneSteuer', () => {
  it('calculates German tax for single filer', () => {
    const config: TaxConfig = {
      country: 'DE',
      year: 2025,
      taxableIncome: 50000,
      filingStatus: 'single',
    }
    const anlageV: AnlageV = {
      ...emptyAnlageV,
      mieteinnahmen: 12000,
      abschreibung: 4000,
    }
    const result = berechneSteuer(config, anlageV)
    expect(result.country).toBe('DE')
    expect(result.einnahmenGesamt).toBe(12000)
    expect(result.einkuenfteVuV).toBe(8000)
    expect(result.steuerMitVuV).toBeGreaterThan(result.steuerOhneVuV)
    expect(result.steuerbelastungVuV).toBeGreaterThan(0)
  })

  it('calculates zero tax for income below threshold', () => {
    const config: TaxConfig = {
      country: 'DE',
      year: 2025,
      taxableIncome: 0,
      filingStatus: 'single',
    }
    const result = berechneSteuer(config, {
      ...emptyAnlageV,
      mieteinnahmen: 10000,
    })
    // 10000 is below 11784 threshold
    expect(result.steuerMitVuV).toBe(0)
  })

  it('applies Ehegattensplitting for married joint filers', () => {
    const single: TaxConfig = {
      country: 'DE',
      year: 2025,
      taxableIncome: 80000,
      filingStatus: 'single',
    }
    const married: TaxConfig = {
      ...single,
      filingStatus: 'married_joint',
    }
    const anlageV: AnlageV = { ...emptyAnlageV, mieteinnahmen: 10000 }
    const singleResult = berechneSteuer(single, anlageV)
    const marriedResult = berechneSteuer(married, anlageV)
    // Splitting should result in lower tax
    expect(marriedResult.steuerMitVuV).toBeLessThan(singleResult.steuerMitVuV)
  })

  it('calculates Soli for higher incomes', () => {
    const config: TaxConfig = {
      country: 'DE',
      year: 2025,
      taxableIncome: 100000,
      filingStatus: 'single',
    }
    const result = berechneSteuer(config, { ...emptyAnlageV, mieteinnahmen: 20000 })
    expect(result.solidaritaetszuschlag).toBeGreaterThan(0)
    expect(result.kirchensteuer).toBeGreaterThan(0)
  })

  it('does not calculate Soli/Kirchensteuer for AT', () => {
    const config: TaxConfig = {
      country: 'AT',
      year: 2025,
      taxableIncome: 100000,
      filingStatus: 'single',
    }
    const result = berechneSteuer(config, { ...emptyAnlageV, mieteinnahmen: 20000 })
    expect(result.solidaritaetszuschlag).toBe(0)
    expect(result.kirchensteuer).toBe(0)
  })

  it('generates optimization tips', () => {
    const config: TaxConfig = {
      country: 'DE',
      year: 2025,
      taxableIncome: 50000,
      filingStatus: 'single',
    }
    const result = berechneSteuer(config, emptyAnlageV)
    expect(result.optimierungstipps.length).toBeGreaterThan(0)
  })
})

describe('berechneAfa', () => {
  it('calculates standard 2% AfA for buildings 1925-2022', () => {
    const input: AfaInput = {
      anschaffungskosten: 300000,
      grundstuecksanteil: 30,
      baujahr: 1990,
      kaufdatum: '2020-01-01',
      country: 'DE',
      denkmalschutz: false,
      sanierungsgebiet: false,
    }
    const result = berechneAfa(input)
    expect(result.bemessungsgrundlage).toBe(210000) // 300000 * 0.7
    expect(result.afaSatz).toBe(2)
    expect(result.jaehrlicheAfa).toBe(4200) // 210000 * 0.02
    expect(result.gesamtAfaDauer).toBe(50)
  })

  it('calculates 3% AfA for Neubau ab 2023', () => {
    const input: AfaInput = {
      anschaffungskosten: 500000,
      grundstuecksanteil: 25,
      baujahr: 2024,
      kaufdatum: '2024-06-01',
      country: 'DE',
      denkmalschutz: false,
      sanierungsgebiet: false,
    }
    const result = berechneAfa(input)
    expect(result.afaSatz).toBe(3)
    expect(result.bemessungsgrundlage).toBe(375000)
    expect(result.jaehrlicheAfa).toBe(11250) // 375000 * 0.03
  })

  it('calculates 2.5% AfA for Altbauten vor 1925', () => {
    const input: AfaInput = {
      anschaffungskosten: 400000,
      grundstuecksanteil: 40,
      baujahr: 1910,
      kaufdatum: '2015-01-01',
      country: 'DE',
      denkmalschutz: false,
      sanierungsgebiet: false,
    }
    const result = berechneAfa(input)
    expect(result.afaSatz).toBe(2.5)
    expect(result.gesamtAfaDauer).toBe(40)
  })

  it('calculates Denkmalschutz AfA', () => {
    const input: AfaInput = {
      anschaffungskosten: 600000,
      grundstuecksanteil: 30,
      baujahr: 1880,
      kaufdatum: '2023-01-01',
      country: 'DE',
      denkmalschutz: true,
      sanierungsgebiet: false,
    }
    const result = berechneAfa(input)
    expect(result.afaSatz).toBe(9)
    expect(result.gesamtAfaDauer).toBe(12)
    expect(result.hinweise.some(h => h.includes('Denkmalschutz'))).toBe(true)
  })

  it('calculates Austrian AfA at 1.5%', () => {
    const input: AfaInput = {
      anschaffungskosten: 300000,
      grundstuecksanteil: 30,
      baujahr: 2000,
      kaufdatum: '2020-01-01',
      country: 'AT',
      denkmalschutz: false,
      sanierungsgebiet: false,
    }
    const result = berechneAfa(input)
    expect(result.afaSatz).toBe(1.5)
  })

  it('calculates Swiss AfA at 2%', () => {
    const input: AfaInput = {
      anschaffungskosten: 500000,
      grundstuecksanteil: 35,
      baujahr: 2005,
      kaufdatum: '2022-01-01',
      country: 'CH',
      denkmalschutz: false,
      sanierungsgebiet: false,
    }
    const result = berechneAfa(input)
    expect(result.afaSatz).toBe(2)
  })

  it('calculates tax savings from AfA', () => {
    const input: AfaInput = {
      anschaffungskosten: 300000,
      grundstuecksanteil: 30,
      baujahr: 2000,
      kaufdatum: '2020-01-01',
      country: 'DE',
      denkmalschutz: false,
      sanierungsgebiet: false,
    }
    const result = berechneAfa(input, 0.42)
    expect(result.steuerersparnis).toBe(Math.round(result.jaehrlicheAfa * 0.42 * 100) / 100)
  })

  it('warns about low Grundstuecksanteil', () => {
    const input: AfaInput = {
      anschaffungskosten: 300000,
      grundstuecksanteil: 15,
      baujahr: 2000,
      kaufdatum: '2020-01-01',
      country: 'DE',
      denkmalschutz: false,
      sanierungsgebiet: false,
    }
    const result = berechneAfa(input)
    expect(result.hinweise.some(h => h.includes('unter 20%'))).toBe(true)
  })
})
