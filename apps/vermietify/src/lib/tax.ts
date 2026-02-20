// Tax System for DE/AT/CH - Anlage V, KAP, SO
// Comprehensive rental property tax calculation engine

export type Country = 'DE' | 'AT' | 'CH'

export interface TaxConfig {
  country: Country
  year: number
  taxableIncome: number // Total taxable income (not just rental)
  filingStatus: 'single' | 'married_joint' | 'married_separate'
}

// German income tax brackets 2025
const DE_TAX_BRACKETS_2025 = [
  { limit: 11784, rate: 0 },
  { limit: 17005, rate: 0.14 },
  { limit: 66760, rate: 0.2397 },
  { limit: 277825, rate: 0.42 },
  { limit: Infinity, rate: 0.45 },
]

// Austrian income tax brackets 2025
const AT_TAX_BRACKETS_2025 = [
  { limit: 12816, rate: 0 },
  { limit: 20818, rate: 0.20 },
  { limit: 34513, rate: 0.30 },
  { limit: 66612, rate: 0.40 },
  { limit: 99266, rate: 0.48 },
  { limit: 1000000, rate: 0.50 },
  { limit: Infinity, rate: 0.55 },
]

// Swiss federal tax brackets 2025 (simplified)
const CH_TAX_BRACKETS_2025 = [
  { limit: 17800, rate: 0 },
  { limit: 31600, rate: 0.0077 },
  { limit: 41400, rate: 0.0088 },
  { limit: 55200, rate: 0.026 },
  { limit: 72500, rate: 0.0291 },
  { limit: 78100, rate: 0.0568 },
  { limit: 103600, rate: 0.0617 },
  { limit: 134600, rate: 0.0669 },
  { limit: 176000, rate: 0.0874 },
  { limit: 755200, rate: 0.1100 },
  { limit: Infinity, rate: 0.1150 },
]

export const TAX_BRACKETS: Record<Country, typeof DE_TAX_BRACKETS_2025> = {
  DE: DE_TAX_BRACKETS_2025,
  AT: AT_TAX_BRACKETS_2025,
  CH: CH_TAX_BRACKETS_2025,
}

// Anlage V - Einkünfte aus Vermietung und Verpachtung
export interface AnlageV {
  // Einnahmen
  mieteinnahmen: number          // Zeile 9: Mieteinnahmen
  nebenkostenVorauszahlungen: number // Zeile 13: NK-Vorauszahlungen
  sonstigeEinnahmen: number      // Zeile 21: Sonstige (z.B. Garagen)
  // Werbungskosten
  schuldzinsen: number           // Zeile 37: Kreditzinsen
  abschreibung: number           // Zeile 33: AfA
  erhaltungsaufwand: number      // Zeile 39: Reparaturen
  grundsteuer: number            // Zeile 46: Grundsteuer
  versicherungen: number         // Zeile 47: Gebäudeversicherung etc.
  hausverwaltung: number         // Zeile 48: Verwaltungskosten
  fahrtkosten: number            // Zeile 46: Fahrtkosten zum Objekt
  sonstigeWerbungskosten: number // Zeile 50: Sonstige
  // Umlagen (verrechnet)
  umlagenVereinnahmt: number     // NK die der Mieter zahlt
  umlagenBezahlt: number         // Tatsächlich gezahlte NK
}

export interface TaxResult {
  country: Country
  // Anlage V Zusammenfassung
  einnahmenGesamt: number
  werbungskostenGesamt: number
  einkuenfteVuV: number  // = Einnahmen - Werbungskosten
  // Steuerberechnung
  steuerOhneVuV: number
  steuerMitVuV: number
  steuerbelastungVuV: number
  grenzsteuersatz: number
  effektiverSteuersatz: number
  // Optimierung
  optimierungstipps: string[]
  // Soli + Kirchensteuer (DE only)
  solidaritaetszuschlag: number
  kirchensteuer: number
  gesamtbelastung: number
}

export function berechneAnlageV(daten: AnlageV): { einnahmen: number; werbungskosten: number; einkuenfte: number } {
  const einnahmen = daten.mieteinnahmen + daten.nebenkostenVorauszahlungen + daten.sonstigeEinnahmen

  const werbungskosten =
    daten.schuldzinsen +
    daten.abschreibung +
    daten.erhaltungsaufwand +
    daten.grundsteuer +
    daten.versicherungen +
    daten.hausverwaltung +
    daten.fahrtkosten +
    daten.sonstigeWerbungskosten +
    (daten.umlagenBezahlt - daten.umlagenVereinnahmt)

  return {
    einnahmen,
    werbungskosten: Math.max(0, werbungskosten),
    einkuenfte: einnahmen - Math.max(0, werbungskosten),
  }
}

function berechneESt(einkommen: number, brackets: typeof DE_TAX_BRACKETS_2025): number {
  if (einkommen <= 0) return 0

  let steuer = 0
  let remaining = einkommen
  let previousLimit = 0

  for (const bracket of brackets) {
    const taxableInBracket = Math.min(remaining, bracket.limit - previousLimit)
    if (taxableInBracket <= 0) break
    steuer += taxableInBracket * bracket.rate
    remaining -= taxableInBracket
    previousLimit = bracket.limit
  }

  return Math.round(steuer * 100) / 100
}

export function berechneSteuer(config: TaxConfig, anlageV: AnlageV): TaxResult {
  const vuv = berechneAnlageV(anlageV)
  const brackets = TAX_BRACKETS[config.country]

  const einkommenOhneVuV = config.taxableIncome
  const einkommenMitVuV = config.taxableIncome + vuv.einkuenfte

  // Bei Ehegattensplitting: Einkommen halbieren, Steuer verdoppeln (DE only)
  const splittingFaktor = config.country === 'DE' && config.filingStatus === 'married_joint' ? 2 : 1

  const steuerOhneVuV = berechneESt(einkommenOhneVuV / splittingFaktor, brackets) * splittingFaktor
  const steuerMitVuV = berechneESt(Math.max(0, einkommenMitVuV) / splittingFaktor, brackets) * splittingFaktor

  const steuerbelastungVuV = steuerMitVuV - steuerOhneVuV
  const grenzsteuersatz = vuv.einkuenfte !== 0
    ? Math.abs(steuerbelastungVuV / vuv.einkuenfte)
    : 0
  const effektiverSteuersatz = einkommenMitVuV > 0
    ? steuerMitVuV / einkommenMitVuV
    : 0

  // Soli (DE only, ab 2021 nur noch bei höheren Einkommen)
  let solidaritaetszuschlag = 0
  if (config.country === 'DE' && steuerMitVuV > 18130) {
    solidaritaetszuschlag = Math.round(steuerMitVuV * 0.055 * 100) / 100
  }

  // Kirchensteuer (8% in Bayern/BW, 9% Rest)
  const kirchensteuer = config.country === 'DE'
    ? Math.round(steuerMitVuV * 0.09 * 100) / 100
    : 0

  const gesamtbelastung = steuerMitVuV + solidaritaetszuschlag + kirchensteuer

  // Optimierungstipps
  const tipps: string[] = []
  if (anlageV.erhaltungsaufwand > 0 && anlageV.erhaltungsaufwand > vuv.einnahmen * 0.15) {
    tipps.push('Erhaltungsaufwand kann auf 2-5 Jahre verteilt werden (§ 82b EStDV) zur Steueroptimierung.')
  }
  if (anlageV.schuldzinsen === 0) {
    tipps.push('Finanzierungskosten (Schuldzinsen) sind als Werbungskosten absetzbar.')
  }
  if (anlageV.fahrtkosten === 0) {
    tipps.push('Fahrtkosten zum Mietobjekt mit 0,30€/km absetzbar (Hin- und Rückfahrt).')
  }
  if (vuv.einkuenfte < 0) {
    tipps.push('Negatives Ergebnis aus V+V wird mit anderen Einkünften verrechnet (Verlustausgleich).')
  }
  if (config.country === 'DE' && config.filingStatus === 'single') {
    tipps.push('Bei Ehepartnern: Zusammenveranlagung prüfen für möglichen Splitting-Vorteil.')
  }
  if (anlageV.abschreibung === 0) {
    tipps.push('AfA (Abschreibung) für das Gebäude nicht vergessen - meist 2% oder 3% der Anschaffungskosten.')
  }

  return {
    country: config.country,
    einnahmenGesamt: vuv.einnahmen,
    werbungskostenGesamt: vuv.werbungskosten,
    einkuenfteVuV: vuv.einkuenfte,
    steuerOhneVuV: Math.round(steuerOhneVuV * 100) / 100,
    steuerMitVuV: Math.round(steuerMitVuV * 100) / 100,
    steuerbelastungVuV: Math.round(steuerbelastungVuV * 100) / 100,
    grenzsteuersatz: Math.round(grenzsteuersatz * 10000) / 100,
    effektiverSteuersatz: Math.round(effektiverSteuersatz * 10000) / 100,
    optimierungstipps: tipps,
    solidaritaetszuschlag,
    kirchensteuer,
    gesamtbelastung: Math.round(gesamtbelastung * 100) / 100,
  }
}

// AfA (Abschreibung für Abnutzung) Calculator
export interface AfaInput {
  anschaffungskosten: number  // Purchase price including incidental costs
  grundstuecksanteil: number  // Land portion (% not depreciable)
  baujahr: number
  kaufdatum: string
  country: Country
  denkmalschutz: boolean
  sanierungsgebiet: boolean
}

export interface AfaResult {
  bemessungsgrundlage: number   // = Anschaffungskosten - Grundstücksanteil
  afaSatz: number               // Annual depreciation rate (%)
  jaehrlicheAfa: number         // Annual depreciation amount
  monatlicheAfa: number
  gesamtAfaDauer: number        // Total depreciation period (years)
  restlaufzeit: number          // Remaining years
  bisherAbgeschrieben: number   // Already depreciated
  restbuchwert: number          // Remaining book value
  steuerersparnis: number       // Tax savings per year (at marginal rate)
  hinweise: string[]
}

export function berechneAfa(input: AfaInput, grenzsteuersatz: number = 0.42): AfaResult {
  const grundstueckswert = input.anschaffungskosten * (input.grundstuecksanteil / 100)
  const bemessungsgrundlage = input.anschaffungskosten - grundstueckswert

  // AfA-Satz bestimmen
  let afaSatz: number
  let gesamtDauer: number
  const hinweise: string[] = []

  if (input.denkmalschutz) {
    // Denkmal-AfA nach § 7i EStG
    afaSatz = input.country === 'DE' ? 9 : 3  // 9% in ersten 8 Jahren (DE), dann 7%
    gesamtDauer = 12
    hinweise.push('Denkmalschutz-AfA: Erhöhte Abschreibung nach § 7i EStG.')
    hinweise.push('Erste 8 Jahre: 9% p.a., danach 4 Jahre: 7% p.a.')
  } else if (input.sanierungsgebiet) {
    // Sanierungsgebiet § 7h EStG
    afaSatz = 9
    gesamtDauer = 12
    hinweise.push('Sanierungsgebiet-AfA nach § 7h EStG.')
  } else if (input.country === 'DE') {
    if (input.baujahr >= 2023) {
      // Neubau-AfA ab 2023: 3% nach § 7 Abs. 4 EStG
      afaSatz = 3
      gesamtDauer = Math.ceil(100 / afaSatz)
      hinweise.push('Neubau ab 2023: Erhöhter AfA-Satz von 3% (§ 7 Abs. 4 EStG).')
    } else if (input.baujahr >= 1925) {
      // Standard: 2%
      afaSatz = 2
      gesamtDauer = 50
      hinweise.push('Standard-AfA: 2% über 50 Jahre (§ 7 Abs. 4 EStG).')
    } else {
      // Altbauten vor 1925: 2,5%
      afaSatz = 2.5
      gesamtDauer = 40
      hinweise.push('Altbau vor 1925: AfA-Satz 2,5% über 40 Jahre.')
    }
  } else if (input.country === 'AT') {
    // Österreich: 1,5% AfA (seit 2016)
    afaSatz = 1.5
    gesamtDauer = Math.ceil(100 / afaSatz)
    hinweise.push('Österreich: Standard-AfA 1,5% p.a. (§ 16 Abs. 1 Z 8 EStG).')
  } else {
    // Schweiz: Kanton-abhängig, typisch 2-3%
    afaSatz = 2
    gesamtDauer = 50
    hinweise.push('Schweiz: AfA-Satz variiert je nach Kanton (typisch 1,5-3%).')
  }

  const jaehrlicheAfa = Math.round(bemessungsgrundlage * (afaSatz / 100) * 100) / 100
  const monatlicheAfa = Math.round(jaehrlicheAfa / 12 * 100) / 100

  // Bisherige Abschreibung berechnen
  const kaufJahr = new Date(input.kaufdatum).getFullYear()
  const aktuellesJahr = new Date().getFullYear()
  const vergangeneJahre = Math.max(0, aktuellesJahr - kaufJahr)
  const bisherAbgeschrieben = Math.min(vergangeneJahre * jaehrlicheAfa, bemessungsgrundlage)
  const restbuchwert = bemessungsgrundlage - bisherAbgeschrieben
  const restlaufzeit = Math.max(0, gesamtDauer - vergangeneJahre)

  const steuerersparnis = Math.round(jaehrlicheAfa * grenzsteuersatz * 100) / 100

  if (input.grundstuecksanteil < 20) {
    hinweise.push('Grundstücksanteil unter 20%: Finanzamt könnte höheren Anteil ansetzen. Gutachten empfohlen.')
  }
  if (input.grundstuecksanteil > 50) {
    hinweise.push('Hoher Grundstücksanteil reduziert die AfA-Bemessungsgrundlage erheblich.')
  }

  return {
    bemessungsgrundlage,
    afaSatz,
    jaehrlicheAfa,
    monatlicheAfa,
    gesamtAfaDauer: gesamtDauer,
    restlaufzeit,
    bisherAbgeschrieben,
    restbuchwert,
    steuerersparnis,
    hinweise,
  }
}

export const COUNTRY_LABELS: Record<Country, string> = {
  DE: 'Deutschland',
  AT: 'Österreich',
  CH: 'Schweiz',
}
