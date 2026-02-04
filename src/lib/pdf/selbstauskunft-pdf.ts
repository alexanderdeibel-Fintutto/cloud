import { jsPDF } from 'jspdf'
import { formatCurrency, formatDate } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

// Typen
export interface SelbstauskunftPDFData {
  person: {
    anrede: string
    titel?: string
    vorname: string
    nachname: string
    telefon?: string
    email?: string
  }
  geburtsdatum: string
  geburtsort: string
  staatsangehoerigkeit: string
  familienstand: string
  aktuelleAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  wohntSeit: string

  berufstaetig: boolean
  arbeitgeber: string
  arbeitgeberAdresse: string
  beschaeftigtSeit: string
  berufsbezeichnung: string
  befristet: boolean

  nettoeinkommenMonatlich: number | null
  weitereEinkuenfte: number | null
  einkunftsart: string

  anzahlPersonen: number
  personenDetails: string
  haustiere: boolean
  haustiereDetails: string
  raucher: boolean
  musikinstrumente: boolean
  musikinstrumenteDetails: string

  insolvenzverfahren: boolean
  eidesstattlicheVersicherung: boolean
  mietschulden: boolean
  raeumungsklage: boolean

  datenschutzEinwilligung: boolean
  schufaEinwilligung: boolean

  unterschrift?: {
    imageData: string | null
    signerName: string
    signedAt: string | null
    signedLocation?: string
  }
}

// PDF-Konfiguration
const PDF_CONFIG = {
  margin: 20,
  lineHeight: 5.5,
  fontSize: {
    title: 14,
    subtitle: 11,
    heading: 10,
    normal: 9.5,
    small: 8.5,
    tiny: 7.5,
  },
  colors: {
    primary: '#1e40af',
    black: '#000000',
    gray: '#6b7280',
    lightGray: '#e5e7eb',
    green: '#16a34a',
    red: '#dc2626',
  }
}

interface PDFContext {
  doc: jsPDF
  y: number
  pageHeight: number
  pageWidth: number
  margin: number
  contentWidth: number
}

// Hilfsfunktionen
function checkPageBreak(ctx: PDFContext, requiredSpace: number): void {
  if (ctx.y + requiredSpace > ctx.pageHeight - ctx.margin - 10) {
    ctx.doc.addPage()
    ctx.y = ctx.margin
  }
}

function addTitle(ctx: PDFContext, text: string): void {
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.title)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.primary)
  ctx.doc.text(text, ctx.pageWidth / 2, ctx.y, { align: 'center' })
  ctx.y += 8
}

function addSubtitle(ctx: PDFContext, text: string): void {
  checkPageBreak(ctx, 12)
  ctx.y += 4
  ctx.doc.setFillColor('#f1f5f9')
  ctx.doc.roundedRect(ctx.margin, ctx.y - 4, ctx.contentWidth, 8, 1, 1, 'F')
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.subtitle)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(text, ctx.margin + 3, ctx.y)
  ctx.y += 8
}

function addText(ctx: PDFContext, text: string, options: {
  fontSize?: number
  bold?: boolean
  indent?: number
  color?: string
} = {}): void {
  const {
    fontSize = PDF_CONFIG.fontSize.normal,
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
    ctx.doc.text(line, ctx.margin + indent, ctx.y)
    ctx.y += PDF_CONFIG.lineHeight
  }
}

function addLabelValue(ctx: PDFContext, label: string, value: string, labelWidth: number = 55): void {
  checkPageBreak(ctx, PDF_CONFIG.lineHeight)
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(label + ':', ctx.margin, ctx.y)

  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(value || '—', ctx.margin + labelWidth, ctx.y)
  ctx.y += PDF_CONFIG.lineHeight
}

function addCheckbox(ctx: PDFContext, label: string, checked: boolean): void {
  checkPageBreak(ctx, PDF_CONFIG.lineHeight)

  // Checkbox
  ctx.doc.setDrawColor(PDF_CONFIG.colors.gray)
  ctx.doc.rect(ctx.margin, ctx.y - 3.5, 4, 4)

  if (checked) {
    ctx.doc.setTextColor(PDF_CONFIG.colors.green)
    ctx.doc.setFont('helvetica', 'bold')
    ctx.doc.text('✓', ctx.margin + 0.5, ctx.y)
  }

  // Label
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.text(label, ctx.margin + 7, ctx.y)

  ctx.y += PDF_CONFIG.lineHeight
}

function addSeparator(ctx: PDFContext): void {
  ctx.y += 2
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y)
  ctx.y += 4
}

function formatPerson(person: { vorname: string; nachname: string; titel?: string }): string {
  return [person.titel, person.vorname, person.nachname].filter(Boolean).join(' ')
}

const FAMILIENSTAND_LABELS: Record<string, string> = {
  ledig: 'Ledig',
  verheiratet: 'Verheiratet',
  geschieden: 'Geschieden',
  verwitwet: 'Verwitwet',
  getrennt: 'Getrennt lebend',
}

// Hauptfunktion: PDF generieren
export async function generateSelbstauskunftPDF(data: SelbstauskunftPDFData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const ctx: PDFContext = {
    doc,
    y: PDF_CONFIG.margin,
    pageHeight: doc.internal.pageSize.getHeight(),
    pageWidth: doc.internal.pageSize.getWidth(),
    margin: PDF_CONFIG.margin,
    contentWidth: doc.internal.pageSize.getWidth() - (PDF_CONFIG.margin * 2)
  }

  const heute = new Date()
  const gesamtEinkommen = (data.nettoeinkommenMonatlich || 0) + (data.weitereEinkuenfte || 0)

  // === TITEL ===
  ctx.y = 25
  addTitle(ctx, 'MIETERSELBSTAUSKUNFT')

  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text('Freiwillige Angaben des Mietinteressenten', ctx.pageWidth / 2, ctx.y, { align: 'center' })
  ctx.y += 10

  // === PERSÖNLICHE DATEN ===
  addSubtitle(ctx, '1. Persönliche Daten')

  addLabelValue(ctx, 'Name', formatPerson(data.person))
  addLabelValue(ctx, 'Geburtsdatum', data.geburtsdatum ? format(new Date(data.geburtsdatum), 'dd.MM.yyyy', { locale: de }) : '—')
  addLabelValue(ctx, 'Geburtsort', data.geburtsort)
  addLabelValue(ctx, 'Staatsangehörigkeit', data.staatsangehoerigkeit)
  addLabelValue(ctx, 'Familienstand', FAMILIENSTAND_LABELS[data.familienstand] || data.familienstand || '—')

  ctx.y += 2
  addLabelValue(ctx, 'Aktuelle Adresse', `${data.aktuelleAdresse.strasse} ${data.aktuelleAdresse.hausnummer}`)
  addLabelValue(ctx, '', `${data.aktuelleAdresse.plz} ${data.aktuelleAdresse.ort}`)
  addLabelValue(ctx, 'Wohnhaft seit', data.wohntSeit ? format(new Date(data.wohntSeit), 'MM/yyyy', { locale: de }) : '—')

  ctx.y += 2
  if (data.person.telefon) addLabelValue(ctx, 'Telefon', data.person.telefon)
  if (data.person.email) addLabelValue(ctx, 'E-Mail', data.person.email)

  addSeparator(ctx)

  // === BERUFLICHE SITUATION ===
  addSubtitle(ctx, '2. Berufliche Situation')

  if (data.berufstaetig) {
    addLabelValue(ctx, 'Berufsstatus', 'Berufstätig')
    addLabelValue(ctx, 'Berufsbezeichnung', data.berufsbezeichnung)
    addLabelValue(ctx, 'Arbeitgeber', data.arbeitgeber)
    if (data.arbeitgeberAdresse) {
      addLabelValue(ctx, 'Arbeitgeber-Adresse', data.arbeitgeberAdresse)
    }
    addLabelValue(ctx, 'Beschäftigt seit', data.beschaeftigtSeit ? format(new Date(data.beschaeftigtSeit), 'MM/yyyy', { locale: de }) : '—')
    addLabelValue(ctx, 'Arbeitsverhältnis', data.befristet ? 'Befristet' : 'Unbefristet')
  } else {
    addLabelValue(ctx, 'Berufsstatus', 'Nicht berufstätig (Student, Rentner, o.ä.)')
  }

  addSeparator(ctx)

  // === EINKOMMEN ===
  addSubtitle(ctx, '3. Einkommensverhältnisse')

  addLabelValue(ctx, 'Nettoeinkommen (mtl.)', formatCurrency(data.nettoeinkommenMonatlich || 0))

  if (data.weitereEinkuenfte && data.weitereEinkuenfte > 0) {
    addLabelValue(ctx, 'Weitere Einkünfte', formatCurrency(data.weitereEinkuenfte))
    if (data.einkunftsart) {
      addLabelValue(ctx, 'Art der Einkünfte', data.einkunftsart)
    }
  }

  ctx.y += 2
  ctx.doc.setFillColor('#ecfdf5')
  ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 10, 2, 2, 'F')
  ctx.y += 6
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.heading)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.green)
  ctx.doc.text(`Gesamteinkommen: ${formatCurrency(gesamtEinkommen)} / Monat`, ctx.margin + 5, ctx.y)
  ctx.y += 8

  addSeparator(ctx)

  // === ANGABEN ZUM MIETVERHÄLTNIS ===
  addSubtitle(ctx, '4. Angaben zum geplanten Mietverhältnis')

  addLabelValue(ctx, 'Einziehende Personen', data.anzahlPersonen.toString())
  if (data.anzahlPersonen > 1 && data.personenDetails) {
    addLabelValue(ctx, 'Weitere Personen', data.personenDetails)
  }

  ctx.y += 2
  addCheckbox(ctx, data.haustiere ? `Haustierhaltung gewünscht: ${data.haustiereDetails || 'Ja'}` : 'Keine Haustiere', data.haustiere)
  addCheckbox(ctx, data.raucher ? 'Raucher' : 'Nichtraucher', data.raucher)
  if (data.musikinstrumente) {
    addCheckbox(ctx, `Musikinstrumente: ${data.musikinstrumenteDetails || 'Ja'}`, true)
  }

  addSeparator(ctx)

  // === BONITÄTSRELEVANTE ANGABEN ===
  addSubtitle(ctx, '5. Bonitätsrelevante Angaben')

  addText(ctx, 'Ich versichere, dass folgende Angaben der Wahrheit entsprechen:', { fontSize: PDF_CONFIG.fontSize.small, color: PDF_CONFIG.colors.gray })
  ctx.y += 3

  const hasNegative = data.insolvenzverfahren || data.eidesstattlicheVersicherung || data.mietschulden || data.raeumungsklage

  addCheckbox(ctx, 'Es läuft ein Insolvenzverfahren gegen mich', data.insolvenzverfahren)
  addCheckbox(ctx, 'Ich habe eine eidesstattliche Versicherung abgegeben', data.eidesstattlicheVersicherung)
  addCheckbox(ctx, 'Ich habe Mietschulden aus früherem Mietverhältnis', data.mietschulden)
  addCheckbox(ctx, 'Es wurde/wird Räumungsklage gegen mich erhoben', data.raeumungsklage)

  if (!hasNegative) {
    ctx.y += 2
    ctx.doc.setFillColor('#ecfdf5')
    ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 8, 2, 2, 'F')
    ctx.y += 5
    ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
    ctx.doc.setTextColor(PDF_CONFIG.colors.green)
    ctx.doc.text('✓ Keine negativen Bonitätsmerkmale angegeben', ctx.margin + 5, ctx.y)
    ctx.y += 6
  }

  addSeparator(ctx)

  // === EINWILLIGUNGEN ===
  addSubtitle(ctx, '6. Einwilligungen')

  addCheckbox(ctx, 'Datenschutz-Einwilligung: Einwilligung in die Verarbeitung meiner Daten zum Zweck der Prüfung meiner Eignung als Mieter', data.datenschutzEinwilligung)
  addCheckbox(ctx, 'SCHUFA-Einwilligung: Einwilligung zur Einholung einer SCHUFA-Auskunft (optional)', data.schufaEinwilligung)

  addSeparator(ctx)

  // === ERKLÄRUNG & UNTERSCHRIFT ===
  addSubtitle(ctx, '7. Erklärung und Unterschrift')

  addText(ctx, 'Ich versichere, dass alle vorstehenden Angaben vollständig und wahrheitsgemäß sind. Mir ist bekannt, dass falsche Angaben zur Anfechtung des Mietvertrages berechtigen können.', { fontSize: PDF_CONFIG.fontSize.small })

  ctx.y += 10

  // Ort, Datum
  const ort = data.unterschrift?.signedLocation || '_______________'
  const datum = format(heute, 'dd.MM.yyyy', { locale: de })
  addText(ctx, `${ort}, den ${datum}`)

  ctx.y += 10

  // Unterschrift
  const signatureY = ctx.y + 15

  if (data.unterschrift?.imageData) {
    try {
      ctx.doc.addImage(data.unterschrift.imageData, 'PNG', ctx.margin, ctx.y, 60, 15)
    } catch (e) {
      // Fallback
    }
  }

  ctx.doc.setDrawColor(PDF_CONFIG.colors.black)
  ctx.doc.line(ctx.margin, signatureY, ctx.margin + 60, signatureY)

  ctx.y = signatureY + 4
  addText(ctx, formatPerson(data.person), { fontSize: PDF_CONFIG.fontSize.small })

  // === DATENSCHUTZHINWEIS ===
  checkPageBreak(ctx, 25)
  ctx.y += 10
  ctx.doc.setFillColor('#eff6ff')
  ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 20, 2, 2, 'F')
  ctx.y += 5

  addText(ctx, 'Datenschutzhinweis:', { bold: true, fontSize: PDF_CONFIG.fontSize.small, indent: 5 })
  addText(ctx, 'Ihre Angaben werden ausschließlich zur Prüfung Ihrer Eignung als Mieter verwendet und nach Abschluss des Auswahlverfahrens gelöscht, sofern kein Mietverhältnis zustande kommt.', { fontSize: PDF_CONFIG.fontSize.tiny, indent: 5 })

  // === FUSSZEILE ===
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fontSize.tiny)
    doc.setTextColor(PDF_CONFIG.colors.gray)
    doc.text(
      `Seite ${i} von ${totalPages} | Mieterselbstauskunft | Erstellt: ${format(heute, 'dd.MM.yyyy', { locale: de })}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 8,
      { align: 'center' }
    )
  }

  // === PDF SPEICHERN ===
  const personName = `${data.person.nachname}_${data.person.vorname}`.replace(/\s/g, '_')
  const filename = `Selbstauskunft_${personName}_${format(heute, 'yyyy-MM-dd')}.pdf`
  doc.save(filename)
}
