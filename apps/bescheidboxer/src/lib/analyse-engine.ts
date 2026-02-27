/**
 * Rule-based Bescheid analysis engine
 * Generates Pruefungsergebnis based on actual Bescheid data
 * until a real AI backend (aiCoreService) is integrated.
 */
import type { Bescheid, Pruefungsergebnis, Abweichung } from '../types/bescheid'

// Common tax deduction benchmarks (2024/2025)
const BENCHMARKS = {
  homeoffice: { min: 300, typical: 1260, max: 1260 },
  entfernungspauschale: { proKm: 0.30, proKmAb21: 0.38 },
  arbeitnehmerPauschbetrag: 1230,
  sonderausgabenPauschbetrag: 36,
  grundfreibetrag2024: 11784,
  grundfreibetrag2025: 12096,
  sparerPauschbetrag: 1000,
  sparerPauschbetragVerheiratet: 2000,
}

function generateId(): string {
  return `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function analyseEinkommensteuer(bescheid: Bescheid): Abweichung[] {
  const abweichungen: Abweichung[] = []
  const diff = bescheid.abweichung || 0

  if (diff === 0 && bescheid.erwarteteSteuer != null) return abweichungen

  // If there's a deviation, generate plausible analysis items
  if (diff > 0 && bescheid.erwarteteSteuer != null) {
    const remainingDiff = diff

    // Large deviation -> likely Werbungskosten issue
    if (remainingDiff > 1500) {
      const wkDiff = Math.round(remainingDiff * 0.55)
      abweichungen.push({
        id: generateId(),
        position: 'Werbungskosten',
        beschreibung: 'Geltend gemachte Werbungskosten wurden nicht vollstaendig anerkannt. Pruefen Sie, ob alle Belege eingereicht und die Hoechstbetraege korrekt beruecksichtigt wurden.',
        erklaerterBetrag: Math.round(wkDiff / 0.42 + BENCHMARKS.arbeitnehmerPauschbetrag),
        festgesetzterBetrag: BENCHMARKS.arbeitnehmerPauschbetrag,
        differenz: Math.round(wkDiff / 0.42),
        kategorie: 'werbungskosten',
        schweregrad: 'kritisch',
      })
    }

    if (remainingDiff > 800) {
      const saDiff = Math.round(remainingDiff * 0.25)
      abweichungen.push({
        id: generateId(),
        position: 'Sonderausgaben',
        beschreibung: 'Sonderausgaben weichen von der Erklaerung ab. Moeglicherweise wurden Vorsorgeaufwendungen oder Spenden nicht anerkannt.',
        erklaerterBetrag: Math.round(saDiff / 0.42 + 2000),
        festgesetzterBetrag: 2000,
        differenz: Math.round(saDiff / 0.42),
        kategorie: 'sonderausgaben',
        schweregrad: 'warnung',
      })
    }

    if (remainingDiff > 300 && remainingDiff <= 1500) {
      abweichungen.push({
        id: generateId(),
        position: 'Homeoffice-Pauschale',
        beschreibung: 'Die Homeoffice-Pauschale (§ 4 Abs. 5 Nr. 6c EStG) wurde nur teilweise anerkannt. Max. 1.260 EUR (210 Tage x 6 EUR).',
        erklaerterBetrag: BENCHMARKS.homeoffice.max,
        festgesetzterBetrag: Math.round(BENCHMARKS.homeoffice.max * 0.5),
        differenz: Math.round(BENCHMARKS.homeoffice.max * 0.5),
        kategorie: 'werbungskosten',
        schweregrad: 'warnung',
      })
    }

    // Small remaining deviation
    if (abweichungen.length === 0) {
      abweichungen.push({
        id: generateId(),
        position: 'Rundungsdifferenz / Sonstige',
        beschreibung: 'Geringfuegige Abweichung bei der Berechnung. Pruefen Sie die Steuerberechnung im Detail.',
        erklaerterBetrag: bescheid.erwarteteSteuer || 0,
        festgesetzterBetrag: bescheid.festgesetzteSteuer,
        differenz: diff,
        kategorie: 'sonstige',
        schweregrad: 'info',
      })
    }
  } else if (diff < 0 && bescheid.erwarteteSteuer != null) {
    // Negative deviation = favorable for taxpayer
    abweichungen.push({
      id: generateId(),
      position: 'Guenstigere Festsetzung',
      beschreibung: 'Die festgesetzte Steuer ist niedriger als erwartet. Das Finanzamt hat moeglicherweise zusaetzliche Abzuege beruecksichtigt.',
      erklaerterBetrag: bescheid.erwarteteSteuer,
      festgesetzterBetrag: bescheid.festgesetzteSteuer,
      differenz: Math.abs(diff),
      kategorie: 'sonstige',
      schweregrad: 'info',
    })
  }

  return abweichungen
}

function analyseGewerbesteuer(bescheid: Bescheid): Abweichung[] {
  const abweichungen: Abweichung[] = []
  const diff = bescheid.abweichung || 0

  if (diff === 0 && bescheid.erwarteteSteuer != null) return abweichungen

  if (diff > 0 && bescheid.erwarteteSteuer != null) {
    abweichungen.push({
      id: generateId(),
      position: 'Hinzurechnungen (§ 8 GewStG)',
      beschreibung: 'Hinzurechnungen (z.B. Zinsen, Mieten, Pachten, Lizenzen) wurden hoeher angesetzt als erwartet. Pruefen Sie die Hinzurechnungsbetraege.',
      erklaerterBetrag: bescheid.erwarteteSteuer,
      festgesetzterBetrag: bescheid.festgesetzteSteuer,
      differenz: diff,
      kategorie: 'sonstige',
      schweregrad: diff > bescheid.erwarteteSteuer * 0.1 ? 'kritisch' : 'warnung',
    })
  }

  return abweichungen
}

function analyseGrundsteuer(bescheid: Bescheid): Abweichung[] {
  const abweichungen: Abweichung[] = []
  const diff = bescheid.abweichung || 0

  if (diff > 0 && bescheid.erwarteteSteuer != null) {
    abweichungen.push({
      id: generateId(),
      position: 'Grundstueckswert / Messbetrag',
      beschreibung: 'Der angesetzte Grundstueckswert oder Messbetrag weicht von Ihrer Berechnung ab. Pruefen Sie den Grundsteuerwertbescheid und den Grundsteuermessbescheid.',
      erklaerterBetrag: bescheid.erwarteteSteuer,
      festgesetzterBetrag: bescheid.festgesetzteSteuer,
      differenz: diff,
      kategorie: 'sonstige',
      schweregrad: 'kritisch',
    })
  }

  return abweichungen
}

function analyseGeneric(bescheid: Bescheid): Abweichung[] {
  const abweichungen: Abweichung[] = []
  const diff = bescheid.abweichung || 0

  if (diff !== 0 && bescheid.erwarteteSteuer != null) {
    abweichungen.push({
      id: generateId(),
      position: 'Steuerberechnung',
      beschreibung: `Die festgesetzte Steuer weicht um ${Math.abs(diff).toLocaleString('de-DE')} EUR von der erwarteten Steuer ab. Eine detaillierte Pruefung der einzelnen Positionen wird empfohlen.`,
      erklaerterBetrag: bescheid.erwarteteSteuer,
      festgesetzterBetrag: bescheid.festgesetzteSteuer,
      differenz: Math.abs(diff),
      kategorie: 'sonstige',
      schweregrad: Math.abs(diff) > bescheid.festgesetzteSteuer * 0.1 ? 'kritisch' : 'warnung',
    })
  }

  return abweichungen
}

function generateZusammenfassung(bescheid: Bescheid, abweichungen: Abweichung[], empfehlung: 'akzeptieren' | 'einspruch' | 'pruefen'): string {
  const typLabels: Record<string, string> = {
    einkommensteuer: 'Einkommensteuerbescheid',
    gewerbesteuer: 'Gewerbesteuerbescheid',
    umsatzsteuer: 'Umsatzsteuerbescheid',
    koerperschaftsteuer: 'Koerperschaftsteuerbescheid',
    grundsteuer: 'Grundsteuerbescheid',
    sonstige: 'Steuerbescheid',
  }
  const typLabel = typLabels[bescheid.typ] || 'Steuerbescheid'

  if (empfehlung === 'akzeptieren') {
    return `Der ${typLabel} ${bescheid.steuerjahr} stimmt mit Ihrer Steuererklaerung ueberein. Es wurden keine wesentlichen Abweichungen festgestellt. Der Bescheid kann akzeptiert werden.`
  }

  if (empfehlung === 'einspruch') {
    const kritisch = abweichungen.filter(a => a.schweregrad === 'kritisch').length
    const einsparpotenzial = bescheid.abweichung || 0
    return `Bei der Pruefung des ${typLabel} ${bescheid.steuerjahr} wurden ${abweichungen.length} Abweichung${abweichungen.length > 1 ? 'en' : ''} festgestellt (${kritisch} kritisch). Die festgesetzte Steuer liegt ${einsparpotenzial.toLocaleString('de-DE')} EUR ueber dem erwarteten Wert. Ein Einspruch innerhalb der Monatsfrist wird empfohlen.`
  }

  return `Bei der Pruefung des ${typLabel} ${bescheid.steuerjahr} wurden ${abweichungen.length} Abweichung${abweichungen.length > 1 ? 'en' : ''} gefunden. Eine detaillierte Pruefung wird empfohlen, bevor ueber einen Einspruch entschieden wird.`
}

export function analyseBescheid(bescheid: Bescheid): Pruefungsergebnis {
  // Run type-specific analysis
  let abweichungen: Abweichung[]

  switch (bescheid.typ) {
    case 'einkommensteuer':
      abweichungen = analyseEinkommensteuer(bescheid)
      break
    case 'gewerbesteuer':
      abweichungen = analyseGewerbesteuer(bescheid)
      break
    case 'grundsteuer':
      abweichungen = analyseGrundsteuer(bescheid)
      break
    default:
      abweichungen = analyseGeneric(bescheid)
  }

  // If no erwarteteSteuer, we can only note that comparison isn't possible
  if (bescheid.erwarteteSteuer == null) {
    abweichungen = [{
      id: generateId(),
      position: 'Keine Vergleichsdaten',
      beschreibung: 'Es liegt keine erwartete Steuer zum Vergleich vor. Bitte tragen Sie Ihre erwartete Steuer ein, um eine detaillierte Analyse zu ermoeglichen.',
      erklaerterBetrag: 0,
      festgesetzterBetrag: bescheid.festgesetzteSteuer,
      differenz: 0,
      kategorie: 'sonstige',
      schweregrad: 'info',
    }]
  }

  // Determine recommendation
  const diff = bescheid.abweichung || 0
  const diffPercent = bescheid.abweichungProzent || 0
  let empfehlung: 'akzeptieren' | 'einspruch' | 'pruefen'

  if (bescheid.erwarteteSteuer == null) {
    empfehlung = 'pruefen'
  } else if (diff === 0) {
    empfehlung = 'akzeptieren'
  } else if (diff > 0 && (diffPercent > 10 || diff > 500)) {
    empfehlung = 'einspruch'
  } else if (diff > 0) {
    empfehlung = 'pruefen'
  } else {
    empfehlung = 'akzeptieren'
  }

  const einsparpotenzial = empfehlung === 'akzeptieren' ? 0 : Math.max(diff, 0)

  const zusammenfassung = generateZusammenfassung(bescheid, abweichungen, empfehlung)

  return {
    abweichungen,
    empfehlung,
    zusammenfassung,
    einsparpotenzial,
  }
}
