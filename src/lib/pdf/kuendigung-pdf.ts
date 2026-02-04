import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format, addMonths, endOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  KUENDIGUNG_MIETER_TEXTE,
  KUENDIGUNG_VERMIETER_TEXTE,
  KUENDIGUNG_FRISTLOS_TEXTE,
  RECHTLICHE_HINWEISE,
  fillKuendigungTemplate
} from '@/lib/legal/kuendigung-textbausteine'

// Typen
export interface KuendigungData {
  kuendigender: 'mieter' | 'vermieter'
  kuendigungsart: 'ordentlich' | 'ausserordentlich'

  absender: {
    anrede: string
    titel?: string
    vorname: string
    nachname: string
    telefon?: string
    email?: string
  }
  absenderAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
    land?: string
  }

  empfaenger: {
    anrede: string
    titel?: string
    vorname: string
    nachname: string
  }
  empfaengerAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
    land?: string
  }

  mietobjektAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
    zusatz?: string
  }

  mietbeginn?: string | Date
  kuendigungsdatum?: string | Date
  kuendigungsgrund?: string

  // Optionale Felder für Mieter
  neueAdresse?: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  kautionIban?: string
  kautionKontoinhaber?: string
  kautionBetrag?: number

  // Optionale Felder für Vermieter
  eigenbedarfPerson?: string
  eigenbedarfBeziehung?: string
  eigenbedarfGrund?: string
  mietrueckstand?: number
  abmahnungDatum?: string

  unterschrift?: {
    imageData: string | null
    signerName: string
    signedAt: string | null
    signedLocation?: string
  }
}

// PDF-Konfiguration
const PDF_CONFIG = {
  margin: {
    left: 25,
    right: 20,
    top: 20,
    bottom: 20
  },
  lineHeight: 5.5,
  fontSize: {
    absender: 9,
    empfaenger: 11,
    betreff: 12,
    text: 10.5,
    small: 9,
    tiny: 8,
  },
  colors: {
    black: '#000000',
    gray: '#666666',
    lightGray: '#999999',
  }
}

interface PDFContext {
  doc: jsPDF
  y: number
  pageHeight: number
  pageWidth: number
  margin: typeof PDF_CONFIG.margin
  contentWidth: number
}

// Hilfsfunktionen
function checkPageBreak(ctx: PDFContext, requiredSpace: number): void {
  if (ctx.y + requiredSpace > ctx.pageHeight - ctx.margin.bottom - 15) {
    ctx.doc.addPage()
    ctx.y = ctx.margin.top
  }
}

function addText(ctx: PDFContext, text: string, options: {
  fontSize?: number
  bold?: boolean
  indent?: number
  color?: string
  align?: 'left' | 'center' | 'right'
} = {}): void {
  const {
    fontSize = PDF_CONFIG.fontSize.text,
    bold = false,
    indent = 0,
    color = PDF_CONFIG.colors.black,
    align = 'left'
  } = options

  ctx.doc.setFontSize(fontSize)
  ctx.doc.setFont('helvetica', bold ? 'bold' : 'normal')
  ctx.doc.setTextColor(color)

  const maxWidth = ctx.contentWidth - indent
  const lines = ctx.doc.splitTextToSize(text, maxWidth)

  for (const line of lines) {
    checkPageBreak(ctx, PDF_CONFIG.lineHeight)

    let x = ctx.margin.left + indent
    if (align === 'center') {
      x = ctx.pageWidth / 2
    } else if (align === 'right') {
      x = ctx.pageWidth - ctx.margin.right
    }

    ctx.doc.text(line, x, ctx.y, { align })
    ctx.y += PDF_CONFIG.lineHeight
  }
}

function addParagraph(ctx: PDFContext, text: string, indent: number = 0): void {
  addText(ctx, text, { indent })
  ctx.y += PDF_CONFIG.lineHeight * 0.5
}

function formatAddress(address: { strasse: string; hausnummer: string; plz: string; ort: string; zusatz?: string }): string[] {
  const lines = []
  if (address.strasse && address.hausnummer) {
    lines.push(`${address.strasse} ${address.hausnummer}`)
  }
  if (address.zusatz) {
    lines.push(address.zusatz)
  }
  if (address.plz && address.ort) {
    lines.push(`${address.plz} ${address.ort}`)
  }
  return lines
}

function formatPerson(person: { anrede: string; titel?: string; vorname: string; nachname: string }): string {
  const parts = []
  if (person.anrede === 'firma') {
    parts.push(person.vorname)
  } else {
    if (person.anrede === 'herr') parts.push('Herrn')
    else if (person.anrede === 'frau') parts.push('Frau')
    if (person.titel) parts.push(person.titel)
    parts.push(person.vorname)
    parts.push(person.nachname)
  }
  return parts.filter(Boolean).join(' ')
}

function formatPersonName(person: { anrede?: string; titel?: string; vorname: string; nachname: string }): string {
  const parts = []
  if (person.titel) parts.push(person.titel)
  parts.push(person.vorname)
  parts.push(person.nachname)
  return parts.filter(Boolean).join(' ')
}

function calculateKuendigungsfrist(mietbeginn: Date, kuendigender: 'mieter' | 'vermieter'): {
  frist: number
  endeDatum: Date
  fristText: string
} {
  const heute = new Date()
  const wohndauerJahre = Math.floor((heute.getTime() - mietbeginn.getTime()) / (1000 * 60 * 60 * 24 * 365))

  let frist: number
  let fristText: string

  if (kuendigender === 'mieter') {
    frist = 3
    fristText = KUENDIGUNG_VERMIETER_TEXTE.kuendigungsfrist.unter_5_jahre.replace('gemäß § 573c Abs. 1 BGB drei', 'drei')
  } else {
    if (wohndauerJahre >= 8) {
      frist = 9
      fristText = KUENDIGUNG_VERMIETER_TEXTE.kuendigungsfrist.ueber_8_jahre
    } else if (wohndauerJahre >= 5) {
      frist = 6
      fristText = KUENDIGUNG_VERMIETER_TEXTE.kuendigungsfrist.ueber_5_jahre
    } else {
      frist = 3
      fristText = KUENDIGUNG_VERMIETER_TEXTE.kuendigungsfrist.unter_5_jahre
    }
  }

  // Berechne Endedatum
  const istVor3Werktag = heute.getDate() <= 3
  let wirksamerMonat = istVor3Werktag ? heute : addMonths(heute, 1)
  const endeDatum = endOfMonth(addMonths(wirksamerMonat, frist))

  return { frist, endeDatum, fristText }
}

// Hauptfunktion: PDF generieren
export async function generateKuendigungPDF(data: KuendigungData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const ctx: PDFContext = {
    doc,
    y: PDF_CONFIG.margin.top,
    pageHeight: doc.internal.pageSize.getHeight(),
    pageWidth: doc.internal.pageSize.getWidth(),
    margin: PDF_CONFIG.margin,
    contentWidth: doc.internal.pageSize.getWidth() - PDF_CONFIG.margin.left - PDF_CONFIG.margin.right
  }

  const heute = new Date()

  // === ABSENDERZEILE (oben) ===
  ctx.y = 40
  const absenderZeile = `${formatPersonName(data.absender)} · ${data.absenderAdresse.strasse} ${data.absenderAdresse.hausnummer} · ${data.absenderAdresse.plz} ${data.absenderAdresse.ort}`
  addText(ctx, absenderZeile, { fontSize: PDF_CONFIG.fontSize.small, color: PDF_CONFIG.colors.gray })

  ctx.y += 2
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin.left, ctx.y, ctx.margin.left + 80, ctx.y)
  ctx.y += 5

  // === EMPFÄNGER (Anschriftenfeld) ===
  addText(ctx, formatPerson(data.empfaenger), { fontSize: PDF_CONFIG.fontSize.empfaenger, bold: true })
  formatAddress(data.empfaengerAdresse).forEach(line => {
    addText(ctx, line, { fontSize: PDF_CONFIG.fontSize.empfaenger })
  })

  // === DATUM (rechts) ===
  ctx.y += 15
  const datumText = `${data.absenderAdresse.ort}, den ${format(heute, 'dd.MM.yyyy', { locale: de })}`
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.text)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.text(datumText, ctx.pageWidth - ctx.margin.right, ctx.y, { align: 'right' })
  ctx.y += 15

  // === BETREFF ===
  const betreff = data.kuendigungsart === 'ordentlich'
    ? KUENDIGUNG_MIETER_TEXTE.betreff
    : KUENDIGUNG_FRISTLOS_TEXTE.betreff

  addText(ctx, betreff, { fontSize: PDF_CONFIG.fontSize.betreff, bold: true })

  // Mietobjekt als Unterzeile
  const mietobjekt = `${data.mietobjektAdresse.strasse} ${data.mietobjektAdresse.hausnummer}, ${data.mietobjektAdresse.plz} ${data.mietobjektAdresse.ort}`
  addText(ctx, `Mietobjekt: ${mietobjekt}`, { fontSize: PDF_CONFIG.fontSize.text, bold: true })
  ctx.y += 8

  // === ANREDE ===
  const anrede = data.empfaenger.anrede === 'frau'
    ? 'Sehr geehrte Frau'
    : data.empfaenger.anrede === 'herr'
      ? 'Sehr geehrter Herr'
      : 'Sehr geehrte Damen und Herren'
  const anredeZeile = data.empfaenger.nachname
    ? `${anrede} ${data.empfaenger.titel ? data.empfaenger.titel + ' ' : ''}${data.empfaenger.nachname},`
    : 'Sehr geehrte Damen und Herren,'
  addParagraph(ctx, anredeZeile)
  ctx.y += 3

  // === HAUPTTEXT ===
  if (data.kuendigungsart === 'ordentlich') {
    // Ordentliche Kündigung
    if (data.kuendigender === 'mieter') {
      // MIETER kündigt
      addParagraph(ctx, KUENDIGUNG_MIETER_TEXTE.einleitung)

      // Kündigungsfrist berechnen
      if (data.mietbeginn) {
        const mietbeginnDate = new Date(data.mietbeginn)
        const { frist: _frist, endeDatum, fristText: _fristText } = calculateKuendigungsfrist(mietbeginnDate, 'mieter')

        const monatName = format(endeDatum, 'MMMM yyyy', { locale: de })
        addParagraph(ctx, fillKuendigungTemplate(KUENDIGUNG_MIETER_TEXTE.kuendigungsfrist_hinweis, { monat: monatName }))

        addParagraph(ctx, `Das Mietverhältnis endet somit zum ${format(endeDatum, 'dd.MM.yyyy', { locale: de })}.`)
      }

      ctx.y += 3

      // Wohnungsübergabe
      addParagraph(ctx, 'Ich bitte Sie, mir rechtzeitig einen Termin zur Wohnungsübergabe und Schlüsselrückgabe mitzuteilen.')

      // Kautionsrückgabe
      if (data.kautionBetrag && data.kautionIban) {
        ctx.y += 3
        addParagraph(ctx, fillKuendigungTemplate(KUENDIGUNG_MIETER_TEXTE.kautionsrueckgabe, {
          betrag: formatCurrency(data.kautionBetrag),
          iban: data.kautionIban,
          inhaber: data.kautionKontoinhaber || formatPersonName(data.absender)
        }))
      }

      // Neue Adresse
      if (data.neueAdresse && data.neueAdresse.strasse) {
        ctx.y += 3
        const neueAdresseFormatiert = `${data.neueAdresse.strasse} ${data.neueAdresse.hausnummer}, ${data.neueAdresse.plz} ${data.neueAdresse.ort}`
        addParagraph(ctx, `Meine neue Anschrift lautet:\n${neueAdresseFormatiert}`)
      }

      // Betriebskostenabrechnung
      ctx.y += 3
      addParagraph(ctx, KUENDIGUNG_MIETER_TEXTE.betriebskostenabrechnung)

      // Besichtigungen
      ctx.y += 3
      addParagraph(ctx, KUENDIGUNG_MIETER_TEXTE.besichtigungen)

      // Bestätigung
      ctx.y += 3
      addParagraph(ctx, KUENDIGUNG_MIETER_TEXTE.bestaetigung)

    } else {
      // VERMIETER kündigt
      const mietbeginnText = data.mietbeginn
        ? format(new Date(data.mietbeginn), 'dd.MM.yyyy', { locale: de })
        : '____________'

      if (data.mietbeginn) {
        const mietbeginnDate = new Date(data.mietbeginn)
        const { frist: _frist2, endeDatum, fristText } = calculateKuendigungsfrist(mietbeginnDate, 'vermieter')

        addParagraph(ctx, fillKuendigungTemplate(KUENDIGUNG_VERMIETER_TEXTE.einleitung_mit_datum, {
          datum: format(endeDatum, 'dd.MM.yyyy', { locale: de }),
          mietbeginn: mietbeginnText
        }))

        ctx.y += 3
        addParagraph(ctx, fristText)
      } else {
        addParagraph(ctx, KUENDIGUNG_VERMIETER_TEXTE.einleitung)
      }

      // Berechtigtes Interesse
      ctx.y += 3
      addParagraph(ctx, KUENDIGUNG_VERMIETER_TEXTE.berechtigtes_interesse)

      // Kündigungsgrund
      if (data.kuendigungsgrund) {
        ctx.y += 3

        // Eigenbedarf
        if (data.eigenbedarfPerson) {
          addParagraph(ctx, KUENDIGUNG_VERMIETER_TEXTE.gruende.eigenbedarf.standard)
          ctx.y += 2
          addParagraph(ctx, fillKuendigungTemplate(KUENDIGUNG_VERMIETER_TEXTE.gruende.eigenbedarf.begruendung, {
            person: data.eigenbedarfPerson,
            beziehung: data.eigenbedarfBeziehung || 'ein naher Angehöriger',
            grund: data.eigenbedarfGrund || 'Der Eigenbedarf ist dringend.',
            details: data.kuendigungsgrund
          }))
        } else {
          addParagraph(ctx, data.kuendigungsgrund)
        }
      }

      // Widerspruchsbelehrung
      ctx.y += 5
      ctx.doc.setFillColor('#f5f5f5')
      ctx.doc.roundedRect(ctx.margin.left, ctx.y, ctx.contentWidth, 45, 2, 2, 'F')
      ctx.y += 5
      addText(ctx, 'WIDERSPRUCHSRECHT NACH § 574 BGB', { bold: true, indent: 5 })
      ctx.y += 2
      addText(ctx, KUENDIGUNG_VERMIETER_TEXTE.widerspruchsrecht, { fontSize: PDF_CONFIG.fontSize.small, indent: 5 })
      ctx.y += 8

      // Räumungsaufforderung
      if (data.mietbeginn) {
        const { endeDatum } = calculateKuendigungsfrist(new Date(data.mietbeginn), 'vermieter')
        ctx.y += 5
        addParagraph(ctx, fillKuendigungTemplate(KUENDIGUNG_VERMIETER_TEXTE.raeumung, {
          datum: format(endeDatum, 'dd.MM.yyyy', { locale: de })
        }))
      }

      // Kaution
      ctx.y += 3
      addParagraph(ctx, KUENDIGUNG_VERMIETER_TEXTE.kaution)
    }
  } else {
    // === AUSSERORDENTLICHE KÜNDIGUNG ===
    addParagraph(ctx, KUENDIGUNG_FRISTLOS_TEXTE.einleitung)

    ctx.y += 3
    if (data.kuendigungsgrund) {
      addParagraph(ctx, `Begründung:`)
      addParagraph(ctx, data.kuendigungsgrund, 5)
    }

    if (data.kuendigender === 'vermieter' && data.mietrueckstand) {
      ctx.y += 3
      addParagraph(ctx, fillKuendigungTemplate(KUENDIGUNG_FRISTLOS_TEXTE.gruende_vermieter.zahlungsverzug.begruendung, {
        monate: '_______________',
        betrag: formatCurrency(data.mietrueckstand),
        anzahl: (data.mietrueckstand / 1000).toFixed(1), // Annahme
        mahndatum: data.abmahnungDatum || '_______________'
      }))
    }

    // Hilfsweise ordentliche Kündigung
    ctx.y += 5
    addParagraph(ctx, KUENDIGUNG_FRISTLOS_TEXTE.hilfsweise_ordentlich)

    // Räumungsaufforderung
    ctx.y += 3
    addParagraph(ctx, KUENDIGUNG_FRISTLOS_TEXTE.raeumung_sofort)

    // Rechtliche Schritte
    ctx.y += 3
    addParagraph(ctx, KUENDIGUNG_FRISTLOS_TEXTE.rechtliche_schritte)

    // Widerspruchsrecht bei Vermieter-Kündigung
    if (data.kuendigender === 'vermieter') {
      ctx.y += 5
      ctx.doc.setFillColor('#f5f5f5')
      ctx.doc.roundedRect(ctx.margin.left, ctx.y, ctx.contentWidth, 25, 2, 2, 'F')
      ctx.y += 5
      addText(ctx, KUENDIGUNG_FRISTLOS_TEXTE.widerspruchsrecht_vermieter, { fontSize: PDF_CONFIG.fontSize.small, indent: 5 })
      ctx.y += 8
    }
  }

  // === GRUSSFORMEL ===
  ctx.y += 8
  addParagraph(ctx, 'Mit freundlichen Grüßen')

  // === UNTERSCHRIFT ===
  ctx.y += 5
  const signatureY = ctx.y + 15

  // Unterschriftsbild wenn vorhanden
  if (data.unterschrift?.imageData) {
    try {
      ctx.doc.addImage(data.unterschrift.imageData, 'PNG', ctx.margin.left, ctx.y, 60, 15)
    } catch (e) {
      // Fallback
    }
  }

  // Unterschriftslinie
  ctx.doc.setDrawColor(PDF_CONFIG.colors.black)
  ctx.doc.line(ctx.margin.left, signatureY, ctx.margin.left + 60, signatureY)

  // Name unter Unterschrift
  ctx.y = signatureY + 4
  addText(ctx, formatPersonName(data.absender), { fontSize: PDF_CONFIG.fontSize.small })

  // === ANLAGEN (falls vorhanden) ===
  ctx.y += 10
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin.left, ctx.y, ctx.margin.left + 40, ctx.y)
  ctx.y += 5

  addText(ctx, 'Anlagen:', { fontSize: PDF_CONFIG.fontSize.small, bold: true })
  addText(ctx, '- Kopie für eigene Unterlagen', { fontSize: PDF_CONFIG.fontSize.small })
  if (data.kuendigender === 'vermieter') {
    addText(ctx, '- ggf. Vollmacht', { fontSize: PDF_CONFIG.fontSize.small })
  }

  // === RECHTLICHER HINWEIS (am Ende) ===
  checkPageBreak(ctx, 40)
  ctx.y += 10
  ctx.doc.setFillColor('#fffbeb')
  ctx.doc.roundedRect(ctx.margin.left, ctx.y, ctx.contentWidth, 30, 2, 2, 'F')
  ctx.y += 5
  addText(ctx, 'Wichtiger Hinweis:', { fontSize: PDF_CONFIG.fontSize.small, bold: true, indent: 5 })
  ctx.y += 1
  addText(ctx, RECHTLICHE_HINWEISE.schriftform, { fontSize: PDF_CONFIG.fontSize.tiny, indent: 5 })
  ctx.y += 1
  addText(ctx, RECHTLICHE_HINWEISE.zugang, { fontSize: PDF_CONFIG.fontSize.tiny, indent: 5 })

  // === FUSSZEILE ===
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fontSize.tiny)
    doc.setTextColor(PDF_CONFIG.colors.lightGray)
    doc.text(
      `Seite ${i} von ${totalPages} | Erstellt: ${format(heute, 'dd.MM.yyyy', { locale: de })}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 8,
      { align: 'center' }
    )
  }

  // === PDF SPEICHERN ===
  const artText = data.kuendigungsart === 'ordentlich' ? 'Kuendigung' : 'Fristlose_Kuendigung'
  const filename = `${artText}_${data.mietobjektAdresse.strasse?.replace(/\s/g, '_') || 'Mietwohnung'}_${format(heute, 'yyyy-MM-dd')}.pdf`
  doc.save(filename)
}
