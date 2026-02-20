// Capital Gains Management - Veräußerungsgewinne & Spekulationssteuer
// Handles German 10-year speculation period (§ 23 EStG)

export interface PropertySale {
  id: string
  propertyName: string
  purchaseDate: string
  purchasePrice: number
  purchaseIncidentalCosts: number // Grunderwerbsteuer, Notar, Makler
  improvements: PropertyImprovement[]
  saleDate: string
  salePrice: number
  saleIncidentalCosts: number // Makler, Notar bei Verkauf
  totalAfa: number // Accumulated depreciation
  country: 'DE' | 'AT' | 'CH'
  selfUsed: boolean // Eigennutzung
  selfUsedYears: number
}

export interface PropertyImprovement {
  id: string
  description: string
  date: string
  amount: number
  type: 'herstellung' | 'erhaltung' // Herstellungskosten vs. Erhaltungsaufwand
}

export interface CapitalGainsResult {
  // Grunddaten
  haltedauer: number // in Monaten
  haltedauerJahre: number
  // Berechnung
  anschaffungskosten: number // Kaufpreis + NK
  herstellungskosten: number // Improvements
  gesamtInvestition: number
  verkaufserloesNetto: number // Verkaufspreis - Verkaufs-NK
  abschreibungenGesamt: number
  bereinigteBasis: number // Gesamtinvestition - AfA
  veraeusserungsgewinn: number
  // Steuer
  spekulationsfristAbgelaufen: boolean
  steuerpflichtig: boolean
  steuerfreiGrund?: string
  geschaetztesteuer: number
  grenzsteuersatz: number
  // Timeline
  spekulationsfristEnde: string
  verbleibendeMonateBisFristende: number
}

export function berechneCapitalGains(
  sale: PropertySale,
  taxableIncome: number = 50000
): CapitalGainsResult {
  const purchase = new Date(sale.purchaseDate)
  const saleDate = new Date(sale.saleDate)
  const haltedauerMs = saleDate.getTime() - purchase.getTime()
  const haltedauerMonate = Math.floor(haltedauerMs / (1000 * 60 * 60 * 24 * 30))
  const haltedauerJahre = Math.floor(haltedauerMonate / 12)

  // Anschaffungskosten
  const anschaffungskosten = sale.purchasePrice + sale.purchaseIncidentalCosts
  const herstellungskosten = sale.improvements
    .filter((i) => i.type === 'herstellung')
    .reduce((sum, i) => sum + i.amount, 0)
  const gesamtInvestition = anschaffungskosten + herstellungskosten

  // Verkaufserlös
  const verkaufserloesNetto = sale.salePrice - sale.saleIncidentalCosts

  // Bereinigt um AfA
  const bereinigteBasis = gesamtInvestition - sale.totalAfa
  const veraeusserungsgewinn = verkaufserloesNetto - bereinigteBasis

  // Spekulationsfrist
  let spekulationsfristJahre = 10 // DE Standard
  if (sale.country === 'AT') spekulationsfristJahre = 0 // AT: ImmoESt seit 2012, kein Zeitlimit
  if (sale.country === 'CH') spekulationsfristJahre = 0 // CH: Grundstückgewinnsteuer, kein Zeitlimit

  const spekulationsfristAbgelaufen = sale.country === 'DE'
    ? haltedauerMonate >= spekulationsfristJahre * 12
    : false // AT/CH haben andere Regeln

  // Steuerfreiheit prüfen
  let steuerpflichtig = true
  let steuerfreiGrund: string | undefined

  if (sale.country === 'DE') {
    if (spekulationsfristAbgelaufen) {
      steuerpflichtig = false
      steuerfreiGrund = 'Spekulationsfrist von 10 Jahren ist abgelaufen (§ 23 Abs. 1 Nr. 1 EStG).'
    } else if (sale.selfUsed && sale.selfUsedYears >= 3) {
      steuerpflichtig = false
      steuerfreiGrund = 'Eigennutzung im Jahr des Verkaufs und den zwei vorangegangenen Jahren (§ 23 Abs. 1 Nr. 1 S. 3 EStG).'
    }
  }

  // Steuerberechnung
  let geschaetztesteuer = 0
  let grenzsteuersatz = 0

  if (steuerpflichtig && veraeusserungsgewinn > 0) {
    if (sale.country === 'AT') {
      // Österreich: 30% ImmoESt
      grenzsteuersatz = 30
      geschaetztesteuer = veraeusserungsgewinn * 0.30
    } else if (sale.country === 'CH') {
      // Schweiz: Grundstückgewinnsteuer (kantonal, vereinfacht ~20-40%)
      grenzsteuersatz = haltedauerJahre < 5 ? 35 : haltedauerJahre < 10 ? 25 : 15
      geschaetztesteuer = veraeusserungsgewinn * (grenzsteuersatz / 100)
    } else {
      // Deutschland: persönlicher Steuersatz
      const einkommenMitGewinn = taxableIncome + veraeusserungsgewinn
      if (einkommenMitGewinn > 277825) grenzsteuersatz = 45
      else if (einkommenMitGewinn > 66760) grenzsteuersatz = 42
      else if (einkommenMitGewinn > 17005) grenzsteuersatz = 30
      else grenzsteuersatz = 14

      geschaetztesteuer = veraeusserungsgewinn * (grenzsteuersatz / 100)
    }
  }

  // Spekulationsfrist-Ende berechnen
  const spekulationsfristEnde = new Date(purchase)
  spekulationsfristEnde.setFullYear(spekulationsfristEnde.getFullYear() + spekulationsfristJahre)
  const heute = new Date()
  const verbleibendeMonateBisFristende = Math.max(0,
    Math.floor((spekulationsfristEnde.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24 * 30))
  )

  return {
    haltedauer: haltedauerMonate,
    haltedauerJahre,
    anschaffungskosten: Math.round(anschaffungskosten * 100) / 100,
    herstellungskosten: Math.round(herstellungskosten * 100) / 100,
    gesamtInvestition: Math.round(gesamtInvestition * 100) / 100,
    verkaufserloesNetto: Math.round(verkaufserloesNetto * 100) / 100,
    abschreibungenGesamt: Math.round(sale.totalAfa * 100) / 100,
    bereinigteBasis: Math.round(bereinigteBasis * 100) / 100,
    veraeusserungsgewinn: Math.round(veraeusserungsgewinn * 100) / 100,
    spekulationsfristAbgelaufen,
    steuerpflichtig,
    steuerfreiGrund,
    geschaetztesteuer: Math.round(geschaetztesteuer * 100) / 100,
    grenzsteuersatz,
    spekulationsfristEnde: spekulationsfristEnde.toISOString().split('T')[0],
    verbleibendeMonateBisFristende,
  }
}
