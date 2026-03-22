// OCR Processing for Bescheide (multi-page document scanning)
// Uses Tesseract.js for real client-side OCR text extraction
// Supports multiple pages since a Bescheid typically has 4-8 pages (front+back)

import Tesseract from 'tesseract.js'

export interface BescheidPage {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'processing' | 'done' | 'error'
  extractedText: string
  confidence: number
  pageNumber: number
}

/** Create a new page entry from a file */
export function createPage(file: File, pageNumber: number): BescheidPage {
  return {
    id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    status: 'pending',
    extractedText: '',
    confidence: 0,
    pageNumber,
  }
}

/** Clean up object URLs when pages are removed */
export function releasePage(page: BescheidPage): void {
  if (page.previewUrl) {
    URL.revokeObjectURL(page.previewUrl)
  }
}

/**
 * Extract text from a single image file using Tesseract.js (client-side OCR).
 * Uses German language model for best results with Bescheide.
 */
export async function ocrExtractText(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{ text: string; confidence: number }> {
  const result = await Tesseract.recognize(file, 'deu', {
    logger: (info) => {
      if (info.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(info.progress * 100))
      }
    },
  })

  return {
    text: result.data.text.trim(),
    confidence: Math.round(result.data.confidence),
  }
}

/**
 * Process all pages with Tesseract.js OCR.
 * Calls onPageUpdate for each page so the UI can show real-time progress.
 */
export async function processAllPages(
  pages: BescheidPage[],
  onPageUpdate: (pageId: string, update: Partial<BescheidPage>) => void,
): Promise<string> {
  const texts: string[] = []

  for (const page of pages) {
    onPageUpdate(page.id, { status: 'processing' })

    try {
      const { text, confidence } = await ocrExtractText(page.file, (progress) => {
        // Could add a progress field to BescheidPage if needed
        onPageUpdate(page.id, { status: 'processing', extractedText: `OCR ${progress}%...` })
      })

      if (text) {
        texts.push(`[Seite ${page.pageNumber}]\n${text}`)
      }

      onPageUpdate(page.id, {
        status: 'done',
        extractedText: text || '(Kein Text erkannt)',
        confidence,
      })
    } catch (err) {
      console.error(`OCR error on page ${page.pageNumber}:`, err)
      onPageUpdate(page.id, {
        status: 'error',
        extractedText: '',
        confidence: 0,
      })
    }
  }

  return texts.filter(Boolean).join('\n\n')
}

/**
 * Send combined bescheid text to the Supabase Edge Function for AI analysis.
 * Falls back to the VITE_AI_API_ENDPOINT if configured.
 */
export async function analyzeBescheidText(
  bescheidText: string,
  supabaseUrl?: string,
  supabaseAnonKey?: string,
): Promise<AnalysisResult | null> {
  // Try Supabase Edge Function first
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/amt-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ action: 'analyze', bescheidText }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.analysis) return data.analysis
      }
    } catch {
      // Fall through to API endpoint
    }
  }

  // Try VITE_AI_API_ENDPOINT as fallback
  const apiEndpoint = import.meta.env.VITE_AI_API_ENDPOINT
  if (apiEndpoint) {
    try {
      const response = await fetch(`${apiEndpoint}/amt-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', bescheidText }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.analysis) return data.analysis
      }
    } catch {
      // No backend available
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Offline / client-side rule-based analysis (no backend needed)
// ---------------------------------------------------------------------------

/** Parse a German currency string like "563,00" or "1.336,08" to a number */
function parseEur(s: string): number {
  return parseFloat(s.replace(/\./g, '').replace(',', '.'))
}

// Regelsaetze 2025/2026
const REGELSAETZE: Record<number, number> = {
  1: 563, // Alleinstehend
  2: 506, // Partner
  3: 451, // 18-24 im Haushalt
  4: 471, // 14-17 Jahre
  5: 390, // 6-13 Jahre
  6: 357, // 0-5 Jahre
}

/**
 * Analyze Bescheid text locally using pattern matching.
 * This runs entirely in the browser when no backend is available.
 * It finds real issues based on the actual OCR text.
 */
export function analyzeOffline(bescheidText: string): AnalysisResult {
  const text = bescheidText.toLowerCase()
  const fehler: AnalysisResult['fehler'] = []
  const korrekt: string[] = []
  let gesamtPotenzial = 0

  // --- Regelsatz pruefen ---
  const regelsatzMatch = bescheidText.match(/(?:Regel(?:bedarf|satz)|Regelbedarf(?:sstufe)?)\s*(?:\d)?[:\s]*(\d{2,3}(?:[.,]\d{2})?)\s*(?:EUR|€)/i)
  if (regelsatzMatch) {
    const betrag = parseEur(regelsatzMatch[1])
    const validValues = Object.values(REGELSAETZE)
    if (validValues.includes(betrag)) {
      korrekt.push(`Regelsatz ${betrag.toFixed(2).replace('.', ',')} EUR erkannt und korrekt fuer 2025/2026.`)
    } else if (betrag > 0 && betrag < 300) {
      fehler.push({
        kategorie: 'regelsatz',
        schwere: 'kritisch',
        beschreibung: `Regelsatz von ${betrag.toFixed(2).replace('.', ',')} EUR erscheint zu niedrig. Der Mindestsatz (Stufe 6) betraegt 357 EUR.`,
        paragraph: '\u00a7 20 SGB II',
        potenziellerBetrag: 357 - betrag,
        empfehlung: 'Pruefe welche Regelbedarfsstufe angewandt wurde und ob diese korrekt ist.',
      })
      gesamtPotenzial += 357 - betrag
    } else if (betrag > 0 && !validValues.includes(betrag)) {
      fehler.push({
        kategorie: 'regelsatz',
        schwere: 'warnung',
        beschreibung: `Regelsatz von ${betrag.toFixed(2).replace('.', ',')} EUR erkannt. Dieser Betrag entspricht keiner der gueltigen Regelbedarfsstufen fuer 2025/2026 (563, 506, 451, 471, 390, 357 EUR).`,
        paragraph: '\u00a7 20 SGB II',
        empfehlung: 'Pruefe ob der korrekte Regelsatz angewandt wurde.',
      })
    }
  }

  // --- KdU (Kosten der Unterkunft) pruefen ---
  const kduMatch = bescheidText.match(/(?:Kosten der Unterkunft|KdU|Unterkunftskosten|Miete)[:\s]*(\d{2,4}(?:[.,]\d{2})?)\s*(?:EUR|€)/i)
  const tatsaechlicheMieteMatch = bescheidText.match(/(?:tatsaechliche|tatsächliche|Kaltmiete|Grundmiete)[:\s]*(\d{2,4}(?:[.,]\d{2})?)\s*(?:EUR|€)/i)

  if (kduMatch) {
    const kdu = parseEur(kduMatch[1])
    if (tatsaechlicheMieteMatch) {
      const miete = parseEur(tatsaechlicheMieteMatch[1])
      if (kdu < miete) {
        const diff = miete - kdu
        fehler.push({
          kategorie: 'kdu',
          schwere: 'kritisch',
          beschreibung: `KdU von ${kdu.toFixed(2).replace('.', ',')} EUR anerkannt, aber tatsaechliche Miete ${miete.toFixed(2).replace('.', ',')} EUR. Differenz: ${diff.toFixed(2).replace('.', ',')} EUR. Das Jobcenter muss ein schluessiges Konzept zur Angemessenheit vorlegen.`,
          paragraph: '\u00a7 22 Abs. 1 SGB II',
          potenziellerBetrag: diff,
          empfehlung: 'Widerspruch einlegen und schluessiges Konzept anfordern.',
        })
        gesamtPotenzial += diff
      } else {
        korrekt.push(`KdU: ${kdu.toFixed(2).replace('.', ',')} EUR anerkannt.`)
      }
    } else {
      korrekt.push(`KdU: ${kdu.toFixed(2).replace('.', ',')} EUR erkannt.`)
    }
  }

  // --- Heizkosten pruefen ---
  const heizkostenMatch = bescheidText.match(/(?:Heizkosten|Heizung)[:\s]*(\d{2,4}(?:[.,]\d{2})?)\s*(?:EUR|€)/i)
  if (heizkostenMatch) {
    const heizkosten = parseEur(heizkostenMatch[1])
    korrekt.push(`Heizkosten: ${heizkosten.toFixed(2).replace('.', ',')} EUR erkannt.`)
  } else if (text.includes('heiz') || text.includes('heizung')) {
    fehler.push({
      kategorie: 'heizkosten',
      schwere: 'warnung',
      beschreibung: 'Heizkosten werden erwaehnt, aber der Betrag konnte nicht eindeutig erkannt werden. Pruefe ob die tatsaechlichen Heizkosten vollstaendig uebernommen werden.',
      paragraph: '\u00a7 22 Abs. 1 SGB II',
      empfehlung: 'Vergleiche die anerkannten Heizkosten mit deinen tatsaechlichen Kosten.',
    })
  }

  // --- Mehrbedarf pruefen ---
  if (text.includes('alleinerziehend') || text.includes('allein erziehend')) {
    const mehrbedarfMatch = bescheidText.match(/(?:Mehrbedarf)[:\s]*(\d{2,4}(?:[.,]\d{2})?)\s*(?:EUR|€)/i)
    if (!mehrbedarfMatch && !text.includes('mehrbedarf')) {
      fehler.push({
        kategorie: 'mehrbedarf',
        schwere: 'kritisch',
        beschreibung: 'Im Bescheid wird "alleinerziehend" erwaehnt, aber kein Mehrbedarf fuer Alleinerziehende beruecksichtigt. Dir steht ein Mehrbedarf von 12-60% des Regelsatzes zu.',
        paragraph: '\u00a7 21 Abs. 3 SGB II',
        potenziellerBetrag: 563 * 0.36, // 36% ist haeufig (2 Kinder unter 16)
        empfehlung: 'Antrag auf Mehrbedarf Alleinerziehend stellen.',
      })
      gesamtPotenzial += 563 * 0.36
    } else if (mehrbedarfMatch) {
      korrekt.push(`Mehrbedarf: ${parseEur(mehrbedarfMatch[1]).toFixed(2).replace('.', ',')} EUR erkannt.`)
    }
  }

  if (text.includes('schwanger')) {
    if (!text.includes('mehrbedarf')) {
      fehler.push({
        kategorie: 'mehrbedarf',
        schwere: 'kritisch',
        beschreibung: 'Schwangerschaft erwaehnt, aber kein Mehrbedarf beruecksichtigt. Ab der 13. Schwangerschaftswoche steht ein Mehrbedarf von 17% des Regelsatzes zu.',
        paragraph: '\u00a7 21 Abs. 2 SGB II',
        potenziellerBetrag: 563 * 0.17,
        empfehlung: 'Antrag auf Mehrbedarf wegen Schwangerschaft stellen.',
      })
      gesamtPotenzial += 563 * 0.17
    }
  }

  // --- Kindergeld pruefen ---
  const kindergeldMatch = bescheidText.match(/Kindergeld[:\s]*(\d{2,3}(?:[.,]\d{2})?)\s*(?:EUR|€)/i)
  if (kindergeldMatch) {
    const kg = parseEur(kindergeldMatch[1])
    if (kg !== 250) {
      fehler.push({
        kategorie: 'kindergeld',
        schwere: 'warnung',
        beschreibung: `Kindergeld mit ${kg.toFixed(2).replace('.', ',')} EUR angerechnet. Der korrekte Betrag ab 2025 ist 250 EUR pro Kind.`,
        paragraph: '\u00a7 11 Abs. 1 SGB II',
        empfehlung: 'Pruefe ob der Kindergeldbetrag korrekt angerechnet wurde.',
      })
    } else {
      korrekt.push('Kindergeld: 250 EUR korrekt angerechnet.')
    }
  }

  // --- Kindersofortzuschlag pruefen ---
  if (text.includes('kind') && !text.includes('kindersofortzuschlag') && !text.includes('sofortzuschlag')) {
    fehler.push({
      kategorie: 'sonstiges',
      schwere: 'warnung',
      beschreibung: 'Im Bescheid werden Kinder erwaehnt, aber kein Kindersofortzuschlag von 20 EUR je Kind gefunden. Dieser steht jedem Kind im SGB-II-Bezug zu.',
      paragraph: '\u00a7 72 SGB II',
      potenziellerBetrag: 20,
      empfehlung: 'Pruefe ob der Kindersofortzuschlag im Bescheid enthalten ist.',
    })
  }

  // --- Bewilligungszeitraum pruefen ---
  const bzrMatch = bescheidText.match(/(?:Bewilligungszeitraum|bewilligt)[:\s]*(?:vom?\s*)?(\d{1,2}[./]\d{1,2}[./]\d{2,4})\s*(?:bis|-|–)\s*(\d{1,2}[./]\d{1,2}[./]\d{2,4})/i)
  if (bzrMatch) {
    korrekt.push(`Bewilligungszeitraum erkannt: ${bzrMatch[1]} bis ${bzrMatch[2]}.`)
  }

  // --- Widerspruchsfrist pruefen ---
  let fristende: string | null = null
  const fristMatch = bescheidText.match(/(?:Widerspruch|Rechtsbehelf|Frist)[^.]*?(\d{1,2}[./]\d{1,2}[./]\d{2,4})/i)
  if (fristMatch) {
    const parts = fristMatch[1].split(/[./]/)
    if (parts.length === 3) {
      const year = parts[2].length === 2 ? '20' + parts[2] : parts[2]
      fristende = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }
  }
  // Standard: 1 Monat Widerspruchsfrist wenn Rechtsbehelfsbelehrung vorhanden
  if (!fristMatch && (text.includes('rechtsbehelfsbelehrung') || text.includes('widerspruch'))) {
    fehler.push({
      kategorie: 'sonstiges',
      schwere: 'hinweis',
      beschreibung: 'Eine Rechtsbehelfsbelehrung wurde erkannt. Die Widerspruchsfrist betraegt in der Regel 1 Monat ab Zustellung des Bescheids.',
      paragraph: '\u00a7 84 SGG',
      empfehlung: 'Notiere dir das Zustelldatum und lege rechtzeitig Widerspruch ein.',
    })
  }

  // --- Einkommen pruefen ---
  const einkommenMatch = bescheidText.match(/(?:Einkommen|Erwerbseinkommen|Einkuenfte)[:\s]*(\d{2,4}(?:[.,]\d{2})?)\s*(?:EUR|€)/i)
  const freibetragMatch = bescheidText.match(/(?:Freibetrag|Grundfreibetrag)[:\s]*(\d{2,3}(?:[.,]\d{2})?)\s*(?:EUR|€)/i)
  if (einkommenMatch) {
    const einkommen = parseEur(einkommenMatch[1])
    if (freibetragMatch) {
      const freibetrag = parseEur(freibetragMatch[1])
      if (freibetrag < 100 && einkommen > 100) {
        fehler.push({
          kategorie: 'einkommen',
          schwere: 'kritisch',
          beschreibung: `Grundfreibetrag von nur ${freibetrag.toFixed(2).replace('.', ',')} EUR erkannt. Der Grundfreibetrag betraegt mindestens 100 EUR.`,
          paragraph: '\u00a7 11b Abs. 2 SGB II',
          potenziellerBetrag: 100 - freibetrag,
          empfehlung: 'Pruefe die Einkommensanrechnung und lege ggf. Widerspruch ein.',
        })
        gesamtPotenzial += 100 - freibetrag
      }
    }
  }

  // --- Sanktion pruefen ---
  if (text.includes('sanktion') || text.includes('minderung') || text.includes('kuerzung')) {
    fehler.push({
      kategorie: 'sonstiges',
      schwere: 'warnung',
      beschreibung: 'Der Bescheid enthaelt Hinweise auf eine Sanktion/Leistungsminderung. Seit dem Buergergeld-Gesetz sind Sanktionen auf maximal 30% begrenzt und KdU duerfen nicht gekuerzt werden.',
      paragraph: '\u00a7 31a SGB II',
      empfehlung: 'Pruefe ob die Sanktion rechtmaessig ist und ob KdU-Schutz beachtet wurde.',
    })
  }

  // Fallback wenn nichts erkannt wurde
  if (fehler.length === 0 && korrekt.length === 0) {
    return {
      zusammenfassung: 'Der OCR-Text konnte ausgelesen werden, aber es wurden keine typischen Bescheid-Bestandteile (Regelsatz, KdU, Mehrbedarfe etc.) eindeutig erkannt. Dies kann an der Bildqualitaet liegen.',
      fehler: [{
        kategorie: 'sonstiges',
        schwere: 'hinweis',
        beschreibung: 'Die automatische Analyse konnte keine konkreten Betraege oder Posten identifizieren. Fuer eine vollstaendige Pruefung empfehlen wir, den Text manuell zu ergaenzen oder im Chat mit unserem KI-Berater zu besprechen.',
        empfehlung: 'Text im Chat besprechen oder manuell die relevanten Betraege eingeben.',
      }],
      korrekt: [],
      gesamtPotenzial: 0,
      dringlichkeit: 'niedrig',
      naechsteSchritte: [
        'Text im Chat mit dem KI-Berater besprechen',
        'Fotos in besserer Qualitaet/Beleuchtung erneut aufnehmen',
        'Relevante Betraege manuell ergaenzen',
      ],
      fristende: null,
    }
  }

  const dringlichkeit: 'hoch' | 'mittel' | 'niedrig' =
    fehler.some(f => f.schwere === 'kritisch') ? 'hoch'
    : fehler.some(f => f.schwere === 'warnung') ? 'mittel'
    : 'niedrig'

  const naechsteSchritte: string[] = []
  if (fehler.some(f => f.schwere === 'kritisch')) {
    naechsteSchritte.push('Widerspruch gegen den Bescheid einlegen')
  }
  if (fristende) {
    naechsteSchritte.push(`Widerspruchsfrist beachten (${fristende})`)
  }
  naechsteSchritte.push('Ergebnisse im Chat mit dem KI-Berater besprechen')

  return {
    zusammenfassung: `Analyse des Bescheids: ${fehler.filter(f => f.schwere === 'kritisch').length} Fehler, ${fehler.filter(f => f.schwere === 'warnung').length} Warnungen, ${korrekt.length} korrekte Posten gefunden.`,
    fehler,
    korrekt,
    gesamtPotenzial: Math.round(gesamtPotenzial * 100) / 100,
    dringlichkeit,
    naechsteSchritte,
    fristende,
  }
}

export interface AnalysisResult {
  zusammenfassung: string
  fehler: Array<{
    kategorie: string
    schwere: string
    beschreibung: string
    paragraph?: string
    potenziellerBetrag?: number
    empfehlung?: string
  }>
  korrekt: string[]
  gesamtPotenzial: number
  dringlichkeit: 'hoch' | 'mittel' | 'niedrig'
  naechsteSchritte: string[]
  fristende?: string | null
}

/** Validate file type and size */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 20 * 1024 * 1024 // 20 MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf',
  ]

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Dateityp "${file.type}" wird nicht unterstuetzt. Erlaubt: JPG, PNG, WebP, HEIC, PDF` }
  }

  if (file.size > maxSize) {
    return { valid: false, error: `Datei zu gross (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: 20 MB` }
  }

  return { valid: true }
}
