import { jsPDF } from 'jspdf'
import { formatCurrency, formatDate } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { de } from 'date-fns/locale'

// Typen
export interface MangelanzeigePDFData {
  mieter: {
    anrede: string
    titel?: string
    vorname: string
    nachname: string
    telefon?: string
    email?: string
  }
  mieterAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  vermieter: {
    anrede: string
    titel?: string
    vorname: string
    nachname: string
  }
  vermieterAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  objektAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  kategorie: string
  kategorieLabel?: string
  beschreibung: string
  entdecktAm: string
  raeume: string
  fristTage: number
  fristDatum: string
  mietminderungAngedroht: boolean
  mietminderungProzent: number | null
  ersatzvornahmeAngedroht: boolean
  unterschrift?: {
    imageData: string | null
    signerName: string
    signedAt: string | null
    signedLocation?: string
  }
}

// Kategorie Labels
const KATEGORIE_LABELS: Record<string, string> = {
  heizung: 'Heizung / Warmwasser',
  wasser: 'Wasserversorgung / Sanitär',
  elektrik: 'Elektrik / Strom',
  schimmel: 'Schimmel / Feuchtigkeit',
  fenster: 'Fenster / Türen',
  dach: 'Dach / Fassade',
  boden: 'Bodenbelag',
  geraeusche: 'Lärmbelästigung',
  ungeziefer: 'Ungeziefer / Schädlinge',
  gemeinschaft: 'Gemeinschaftsräume',
  sonstige: 'Sonstiges',
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
    red: '#dc2626',
    yellow: '#ca8a04',
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
} = {}): void {
  const {
    fontSize = PDF_CONFIG.fontSize.text,
    bold = false,
    indent = 0,
    color = PDF_CONFIG.colors.black
  } = options

  ctx.doc.setFontSize(fontSize)
  ctx.doc.setFont('helvetica', bold ? 'bold' : 'normal')
  ctx.doc.setTextColor(color)

  const maxWidth = ctx.contentWidth - indent
  const lines = ctx.doc.splitTextToSize(text, maxWidth)

  for (const line of lines) {
    checkPageBreak(ctx, PDF_CONFIG.lineHeight)
    ctx.doc.text(line, ctx.margin.left + indent, ctx.y)
    ctx.y += PDF_CONFIG.lineHeight
  }
}

function addParagraph(ctx: PDFContext, text: string, indent: number = 0): void {
  addText(ctx, text, { indent })
  ctx.y += PDF_CONFIG.lineHeight * 0.5
}

function formatPerson(person: { vorname: string; nachname: string; titel?: string }): string {
  return [person.titel, person.vorname, person.nachname].filter(Boolean).join(' ')
}

function formatAddress(address: { strasse: string; hausnummer: string; plz: string; ort: string }): string {
  return `${address.strasse} ${address.hausnummer}, ${address.plz} ${address.ort}`
}

// Hauptfunktion: PDF generieren
export async function generateMangelanzeigePDF(data: MangelanzeigePDFData): Promise<void> {
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
  const kategorieLabel = data.kategorieLabel || KATEGORIE_LABELS[data.kategorie] || data.kategorie

  // === ABSENDERZEILE ===
  ctx.y = 40
  const absenderZeile = `${formatPerson(data.mieter)} · ${data.mieterAdresse.strasse} ${data.mieterAdresse.hausnummer} · ${data.mieterAdresse.plz} ${data.mieterAdresse.ort}`
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(absenderZeile, ctx.margin.left, ctx.y)

  ctx.y += 2
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin.left, ctx.y, ctx.margin.left + 80, ctx.y)
  ctx.y += 5

  // === EMPFÄNGER ===
  const anrede = data.vermieter.anrede === 'frau' ? 'Frau' : data.vermieter.anrede === 'herr' ? 'Herrn' : ''
  addText(ctx, `${anrede} ${formatPerson(data.vermieter)}`.trim(), { fontSize: PDF_CONFIG.fontSize.empfaenger, bold: true })
  addText(ctx, `${data.vermieterAdresse.strasse} ${data.vermieterAdresse.hausnummer}`, { fontSize: PDF_CONFIG.fontSize.empfaenger })
  addText(ctx, `${data.vermieterAdresse.plz} ${data.vermieterAdresse.ort}`, { fontSize: PDF_CONFIG.fontSize.empfaenger })

  // === DATUM ===
  ctx.y += 15
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.text)
  ctx.doc.text(`${data.mieterAdresse.ort}, den ${format(heute, 'dd.MM.yyyy', { locale: de })}`, ctx.pageWidth - ctx.margin.right, ctx.y, { align: 'right' })
  ctx.y += 15

  // === BETREFF ===
  addText(ctx, 'Mängelanzeige gemäß § 536c BGB', { fontSize: PDF_CONFIG.fontSize.betreff, bold: true })
  addText(ctx, `Mietobjekt: ${formatAddress(data.objektAdresse)}`, { fontSize: PDF_CONFIG.fontSize.text, bold: true })
  addText(ctx, `Mangelkategorie: ${kategorieLabel}`, { fontSize: PDF_CONFIG.fontSize.text, bold: true, color: PDF_CONFIG.colors.red })
  ctx.y += 8

  // === ANREDE ===
  const empfAnrede = data.vermieter.anrede === 'frau' ? 'Sehr geehrte Frau' : data.vermieter.anrede === 'herr' ? 'Sehr geehrter Herr' : 'Sehr geehrte Damen und Herren'
  addParagraph(ctx, `${empfAnrede} ${data.vermieter.nachname},`)
  ctx.y += 3

  // === EINLEITUNG ===
  addParagraph(ctx, `hiermit zeige ich Ihnen gemäß § 536c BGB folgenden Mangel in der von mir gemieteten Wohnung an:`)

  // === MANGELBESCHREIBUNG ===
  ctx.y += 3
  ctx.doc.setFillColor('#fef3c7')
  ctx.doc.roundedRect(ctx.margin.left, ctx.y, ctx.contentWidth, 35, 2, 2, 'F')
  ctx.y += 5

  addText(ctx, 'Beschreibung des Mangels:', { bold: true, indent: 5 })
  ctx.y += 2
  addText(ctx, data.beschreibung || 'Keine Beschreibung angegeben.', { indent: 5 })

  ctx.y += 10

  // === DETAILS ===
  addText(ctx, `Entdeckt am: ${data.entdecktAm ? format(new Date(data.entdecktAm), 'dd.MM.yyyy', { locale: de }) : '—'}`, { bold: true })
  if (data.raeume) {
    addText(ctx, `Betroffene Räume: ${data.raeume}`)
  }

  // === AUFFORDERUNG ===
  ctx.y += 5
  addParagraph(ctx, `Ich fordere Sie hiermit auf, den oben beschriebenen Mangel innerhalb von ${data.fristTage} Tagen, d.h. bis spätestens zum ${format(new Date(data.fristDatum), 'dd.MM.yyyy', { locale: de })}, zu beseitigen.`)

  // === RECHTLICHE HINWEISE ===
  addParagraph(ctx, 'Ich weise Sie darauf hin, dass ich gemäß § 536c Abs. 2 BGB verpflichtet bin, Mängel unverzüglich anzuzeigen, um Schadensersatzansprüche zu vermeiden.')

  // === MIETMINDERUNG ===
  if (data.mietminderungAngedroht) {
    ctx.y += 3
    ctx.doc.setFillColor('#fef2f2')
    ctx.doc.roundedRect(ctx.margin.left, ctx.y, ctx.contentWidth, 20, 2, 2, 'F')
    ctx.y += 5

    addText(ctx, 'Ankündigung Mietminderung:', { bold: true, color: PDF_CONFIG.colors.red, indent: 5 })
    const minderungText = data.mietminderungProzent
      ? `Sollte der Mangel nicht fristgerecht behoben werden, werde ich ab dem ${format(new Date(data.fristDatum), 'dd.MM.yyyy', { locale: de })} die Miete um ca. ${data.mietminderungProzent}% mindern (§ 536 BGB).`
      : `Sollte der Mangel nicht fristgerecht behoben werden, werde ich die Miete entsprechend mindern (§ 536 BGB).`
    addText(ctx, minderungText, { fontSize: PDF_CONFIG.fontSize.small, indent: 5 })

    ctx.y += 5
  }

  // === ERSATZVORNAHME ===
  if (data.ersatzvornahmeAngedroht) {
    ctx.y += 3
    ctx.doc.setFillColor('#fef2f2')
    ctx.doc.roundedRect(ctx.margin.left, ctx.y, ctx.contentWidth, 15, 2, 2, 'F')
    ctx.y += 5

    addText(ctx, 'Ankündigung Ersatzvornahme:', { bold: true, color: PDF_CONFIG.colors.red, indent: 5 })
    addText(ctx, 'Bei Nichtbeseitigung behalte ich mir vor, den Mangel auf Ihre Kosten beheben zu lassen (§ 536a Abs. 2 BGB).', { fontSize: PDF_CONFIG.fontSize.small, indent: 5 })

    ctx.y += 5
  }

  // === KONTAKT ===
  ctx.y += 5
  addParagraph(ctx, 'Für Rückfragen und zur Terminvereinbarung stehe ich Ihnen zur Verfügung:')
  if (data.mieter.telefon) addText(ctx, `Telefon: ${data.mieter.telefon}`, { indent: 5 })
  if (data.mieter.email) addText(ctx, `E-Mail: ${data.mieter.email}`, { indent: 5 })

  // === BESTÄTIGUNG ===
  ctx.y += 5
  addParagraph(ctx, 'Bitte bestätigen Sie mir den Erhalt dieser Mängelanzeige schriftlich.')

  // === GRUSS ===
  ctx.y += 8
  addParagraph(ctx, 'Mit freundlichen Grüßen')

  // === UNTERSCHRIFT ===
  ctx.y += 5
  const signatureY = ctx.y + 15

  if (data.unterschrift?.imageData) {
    try {
      ctx.doc.addImage(data.unterschrift.imageData, 'PNG', ctx.margin.left, ctx.y, 60, 15)
    } catch (e) {
      // Fallback
    }
  }

  ctx.doc.setDrawColor(PDF_CONFIG.colors.black)
  ctx.doc.line(ctx.margin.left, signatureY, ctx.margin.left + 60, signatureY)

  ctx.y = signatureY + 4
  addText(ctx, formatPerson(data.mieter), { fontSize: PDF_CONFIG.fontSize.small })

  // === RECHTLICHER HINWEIS ===
  checkPageBreak(ctx, 30)
  ctx.y += 10
  ctx.doc.setFillColor('#eff6ff')
  ctx.doc.roundedRect(ctx.margin.left, ctx.y, ctx.contentWidth, 25, 2, 2, 'F')
  ctx.y += 5

  addText(ctx, 'Wichtige Rechtshinweise:', { bold: true, fontSize: PDF_CONFIG.fontSize.small, indent: 5 })
  addText(ctx, '• Die Mängelanzeige sollte per Einschreiben mit Rückschein versendet werden.', { fontSize: PDF_CONFIG.fontSize.tiny, indent: 5 })
  addText(ctx, '• Dokumentieren Sie den Mangel mit Fotos und Datum.', { fontSize: PDF_CONFIG.fontSize.tiny, indent: 5 })
  addText(ctx, '• Setzen Sie eine angemessene Frist (je nach Dringlichkeit 3-30 Tage).', { fontSize: PDF_CONFIG.fontSize.tiny, indent: 5 })

  // === FUSSZEILE ===
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fontSize.tiny)
    doc.setTextColor(PDF_CONFIG.colors.lightGray)
    doc.text(
      `Seite ${i} von ${totalPages} | Mängelanzeige vom ${format(heute, 'dd.MM.yyyy', { locale: de })}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 8,
      { align: 'center' }
    )
  }

  // === PDF SPEICHERN ===
  const filename = `Maengelanzeige_${kategorieLabel.replace(/\s/g, '_')}_${format(heute, 'yyyy-MM-dd')}.pdf`
  doc.save(filename)
}
