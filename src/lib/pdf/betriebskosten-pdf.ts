import { jsPDF } from 'jspdf'
import { formatCurrency, formatDate } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

// Typen
export interface BetriebskostenPDFData {
  abrechnungsjahrVon: string
  abrechnungsjahrBis: string

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

  mieter: {
    anrede: string
    titel?: string
    vorname: string
    nachname: string
  }
  mieterAdresse: {
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

  wohnflaecheMieter: number | null
  wohnflaecheGesamt: number | null
  personenMieter: number | null
  personenGesamt: number | null
  einheitenGesamt: number | null

  positionen: {
    id: string
    kostenartId: string
    kostenartName?: string
    paragraph?: string
    gesamtbetrag: number | null
    umlageschluessel: string
    mieteranteil: number | null
  }[]

  vorauszahlungenGesamt: number | null
}

// Betriebskostenarten nach § 2 BetrKV
const BETRIEBSKOSTENARTEN: Record<string, { name: string; paragraph: string }> = {
  grundsteuer: { name: 'Grundsteuer', paragraph: '§ 2 Nr. 1' },
  wasser: { name: 'Wasserversorgung', paragraph: '§ 2 Nr. 2' },
  abwasser: { name: 'Entwässerung', paragraph: '§ 2 Nr. 3' },
  heizung: { name: 'Heizung (inkl. Brennstoff)', paragraph: '§ 2 Nr. 4' },
  warmwasser: { name: 'Warmwasser', paragraph: '§ 2 Nr. 5' },
  aufzug: { name: 'Aufzug', paragraph: '§ 2 Nr. 7' },
  strassenreinigung: { name: 'Straßenreinigung', paragraph: '§ 2 Nr. 8' },
  muellabfuhr: { name: 'Müllbeseitigung', paragraph: '§ 2 Nr. 9' },
  hausreinigung: { name: 'Gebäudereinigung', paragraph: '§ 2 Nr. 10' },
  gartenpflege: { name: 'Gartenpflege', paragraph: '§ 2 Nr. 11' },
  beleuchtung: { name: 'Beleuchtung (Gemeinschaftsflächen)', paragraph: '§ 2 Nr. 12' },
  schornsteinfeger: { name: 'Schornsteinreinigung', paragraph: '§ 2 Nr. 13' },
  versicherung: { name: 'Sach- und Haftpflichtversicherung', paragraph: '§ 2 Nr. 14' },
  hauswart: { name: 'Hauswart', paragraph: '§ 2 Nr. 15' },
  kabel: { name: 'Gemeinschaftsantenne/Kabel', paragraph: '§ 2 Nr. 16' },
  waschraum: { name: 'Waschraum', paragraph: '§ 2 Nr. 17' },
  sonstige: { name: 'Sonstige Betriebskosten', paragraph: '§ 2 Nr. 18' },
}

const UMLAGESCHLUESSEL_LABELS: Record<string, string> = {
  wohnflaeche: 'Wohnfläche',
  personen: 'Personen',
  einheiten: 'Einheiten',
  verbrauch: 'Verbrauch',
}

// PDF-Konfiguration
const PDF_CONFIG = {
  margin: 20,
  lineHeight: 5,
  fontSize: {
    title: 14,
    subtitle: 11,
    heading: 10,
    normal: 9,
    small: 8,
    tiny: 7,
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
  ctx.y += 7
}

function addSubtitle(ctx: PDFContext, text: string): void {
  checkPageBreak(ctx, 12)
  ctx.y += 3
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.subtitle)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(text, ctx.margin, ctx.y)
  ctx.y += 6
}

function addText(ctx: PDFContext, text: string, options: {
  fontSize?: number
  bold?: boolean
  indent?: number
  color?: string
  align?: 'left' | 'center' | 'right'
} = {}): void {
  const {
    fontSize = PDF_CONFIG.fontSize.normal,
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

    let x = ctx.margin + indent
    if (align === 'center') x = ctx.pageWidth / 2
    else if (align === 'right') x = ctx.pageWidth - ctx.margin

    ctx.doc.text(line, x, ctx.y, { align })
    ctx.y += PDF_CONFIG.lineHeight
  }
}

function addLabelValue(ctx: PDFContext, label: string, value: string, labelWidth: number = 50): void {
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

function addTableRow(ctx: PDFContext, cells: { text: string; width: number; align?: 'left' | 'right' }[], isHeader: boolean = false, bgColor?: string): void {
  checkPageBreak(ctx, 8)

  const rowHeight = 7
  let x = ctx.margin

  // Hintergrund
  if (bgColor || isHeader) {
    ctx.doc.setFillColor(bgColor || '#f1f5f9')
    ctx.doc.rect(ctx.margin, ctx.y - 4, ctx.contentWidth, rowHeight, 'F')
  }

  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setFont('helvetica', isHeader ? 'bold' : 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)

  cells.forEach((cell) => {
    const truncatedText = ctx.doc.splitTextToSize(cell.text, cell.width - 4)[0] || ''
    const textX = cell.align === 'right' ? x + cell.width - 2 : x + 2
    ctx.doc.text(truncatedText, textX, ctx.y, { align: cell.align || 'left' })
    x += cell.width
  })

  // Trennlinie
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin, ctx.y + 2, ctx.pageWidth - ctx.margin, ctx.y + 2)

  ctx.y += rowHeight
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

function formatAddress(address: { strasse: string; hausnummer: string; plz: string; ort: string }): string {
  return `${address.strasse} ${address.hausnummer}, ${address.plz} ${address.ort}`
}

// Hauptfunktion: PDF generieren
export async function generateBetriebskostenPDF(data: BetriebskostenPDFData): Promise<void> {
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
  const vonDatum = data.abrechnungsjahrVon ? format(new Date(data.abrechnungsjahrVon), 'dd.MM.yyyy') : '—'
  const bisDatum = data.abrechnungsjahrBis ? format(new Date(data.abrechnungsjahrBis), 'dd.MM.yyyy') : '—'

  // Berechnungen
  const gesamtKosten = data.positionen.reduce((sum, p) => sum + (p.mieteranteil || 0), 0)
  const vorauszahlungen = data.vorauszahlungenGesamt || 0
  const differenz = gesamtKosten - vorauszahlungen
  const istNachzahlung = differenz > 0

  // === KOPFBEREICH ===
  ctx.y = 20
  addTitle(ctx, 'BETRIEBSKOSTENABRECHNUNG')

  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(`gemäß § 556 BGB und Betriebskostenverordnung (BetrKV)`, ctx.pageWidth / 2, ctx.y, { align: 'center' })
  ctx.y += 10

  // === ABSENDER / VERMIETER ===
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(
    `${formatPerson(data.vermieter)} · ${formatAddress(data.vermieterAdresse)}`,
    ctx.margin, ctx.y
  )
  ctx.y += 8

  // === EMPFÄNGER / MIETER ===
  addText(ctx, formatPerson(data.mieter), { bold: true, fontSize: PDF_CONFIG.fontSize.subtitle })
  addText(ctx, `${data.mieterAdresse.strasse} ${data.mieterAdresse.hausnummer}`)
  addText(ctx, `${data.mieterAdresse.plz} ${data.mieterAdresse.ort}`)
  ctx.y += 8

  // === DATUM ===
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.text(`${data.vermieterAdresse.ort}, den ${format(heute, 'dd.MM.yyyy')}`, ctx.pageWidth - ctx.margin, ctx.y, { align: 'right' })
  ctx.y += 10

  // === BETREFF ===
  addText(ctx, `Betriebskostenabrechnung für den Zeitraum ${vonDatum} bis ${bisDatum}`, { bold: true })
  addText(ctx, `Mietobjekt: ${formatAddress(data.objektAdresse)}`, { bold: true })
  ctx.y += 5

  // === ANREDE ===
  const anrede = data.mieter.anrede === 'frau' ? 'Sehr geehrte Frau' : data.mieter.anrede === 'herr' ? 'Sehr geehrter Herr' : 'Sehr geehrte/r'
  addText(ctx, `${anrede} ${data.mieter.nachname},`)
  ctx.y += 3

  addText(ctx, 'hiermit erhalten Sie die Abrechnung der Betriebskosten für den oben genannten Zeitraum.')
  ctx.y += 5

  // === VERTEILUNGSSCHLÜSSEL ===
  addSubtitle(ctx, '1. Berechnungsgrundlagen')

  ctx.doc.setFillColor('#f8fafc')
  ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 22, 2, 2, 'F')
  ctx.y += 4

  const flAnteil = data.wohnflaecheMieter && data.wohnflaecheGesamt
    ? ((data.wohnflaecheMieter / data.wohnflaecheGesamt) * 100).toFixed(2)
    : '—'

  const persAnteil = data.personenMieter && data.personenGesamt
    ? ((data.personenMieter / data.personenGesamt) * 100).toFixed(2)
    : '—'

  addLabelValue(ctx, 'Ihre Wohnfläche', `${data.wohnflaecheMieter || '—'} m² von ${data.wohnflaecheGesamt || '—'} m² (= ${flAnteil}%)`, 45)
  addLabelValue(ctx, 'Personenzahl', `${data.personenMieter || '—'} von ${data.personenGesamt || '—'} Personen (= ${persAnteil}%)`, 45)
  addLabelValue(ctx, 'Wohneinheiten', `${data.einheitenGesamt || '—'} Einheiten gesamt`, 45)

  ctx.y += 5
  addSeparator(ctx)

  // === KOSTENAUFSTELLUNG ===
  addSubtitle(ctx, '2. Aufstellung der Betriebskosten')

  // Tabellenkopf
  const colWidths = [70, 25, 35, 40]
  addTableRow(ctx, [
    { text: 'Kostenart', width: colWidths[0] },
    { text: 'Schlüssel', width: colWidths[1] },
    { text: 'Gesamtkosten', width: colWidths[2], align: 'right' },
    { text: 'Ihr Anteil', width: colWidths[3], align: 'right' },
  ], true)

  // Positionen
  data.positionen.forEach(position => {
    const kostenart = BETRIEBSKOSTENARTEN[position.kostenartId] || { name: position.kostenartName || position.kostenartId, paragraph: '' }
    const schluessel = UMLAGESCHLUESSEL_LABELS[position.umlageschluessel] || position.umlageschluessel

    addTableRow(ctx, [
      { text: `${kostenart.name} (${kostenart.paragraph})`, width: colWidths[0] },
      { text: schluessel, width: colWidths[1] },
      { text: formatCurrency(position.gesamtbetrag || 0), width: colWidths[2], align: 'right' },
      { text: formatCurrency(position.mieteranteil || 0), width: colWidths[3], align: 'right' },
    ])
  })

  // Summenzeile
  ctx.y += 2
  addTableRow(ctx, [
    { text: 'Summe Betriebskosten', width: colWidths[0] },
    { text: '', width: colWidths[1] },
    { text: formatCurrency(data.positionen.reduce((sum, p) => sum + (p.gesamtbetrag || 0), 0)), width: colWidths[2], align: 'right' },
    { text: formatCurrency(gesamtKosten), width: colWidths[3], align: 'right' },
  ], true, '#e0e7ff')

  ctx.y += 5
  addSeparator(ctx)

  // === ABRECHNUNG ===
  addSubtitle(ctx, '3. Abrechnungsergebnis')

  ctx.doc.setFillColor(istNachzahlung ? '#fef2f2' : '#f0fdf4')
  ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 35, 2, 2, 'F')
  ctx.y += 5

  addLabelValue(ctx, 'Betriebskosten gesamt', formatCurrency(gesamtKosten), 70)
  addLabelValue(ctx, 'Geleistete Vorauszahlungen', `- ${formatCurrency(vorauszahlungen)}`, 70)

  ctx.y += 3
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin + 5, ctx.y, ctx.pageWidth - ctx.margin - 5, ctx.y)
  ctx.y += 5

  ctx.doc.setFontSize(PDF_CONFIG.fontSize.subtitle)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(istNachzahlung ? PDF_CONFIG.colors.red : PDF_CONFIG.colors.green)
  ctx.doc.text(istNachzahlung ? 'Nachzahlung:' : 'Guthaben:', ctx.margin + 5, ctx.y)
  ctx.doc.text(formatCurrency(Math.abs(differenz)), ctx.margin + 75, ctx.y)
  ctx.y += 10

  // === ZAHLUNGSHINWEIS ===
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setFont('helvetica', 'normal')

  if (istNachzahlung) {
    addText(ctx, `Bitte überweisen Sie den Betrag von ${formatCurrency(Math.abs(differenz))} innerhalb von 30 Tagen auf folgendes Konto:`)
    ctx.y += 3
    addText(ctx, 'Kontoinhaber: ' + formatPerson(data.vermieter), { indent: 5 })
    addText(ctx, '[IBAN hier einfügen]', { indent: 5 })
  } else {
    addText(ctx, `Das Guthaben in Höhe von ${formatCurrency(Math.abs(differenz))} wird Ihnen in den nächsten 14 Tagen überwiesen oder mit der nächsten Mietzahlung verrechnet.`)
  }

  ctx.y += 5
  addSeparator(ctx)

  // === NEUE VORAUSZAHLUNG ===
  addSubtitle(ctx, '4. Anpassung der Vorauszahlung')

  const neueVorauszahlung = Math.ceil(gesamtKosten / 12)
  const alteVorauszahlung = Math.round(vorauszahlungen / 12)
  const anpassung = neueVorauszahlung - alteVorauszahlung

  addText(ctx, `Basierend auf den tatsächlichen Kosten schlagen wir folgende Anpassung der monatlichen Betriebskostenvorauszahlung vor:`)
  ctx.y += 3

  addLabelValue(ctx, 'Bisherige Vorauszahlung', `${formatCurrency(alteVorauszahlung)} / Monat`, 65)
  addLabelValue(ctx, 'Neue Vorauszahlung (Vorschlag)', `${formatCurrency(neueVorauszahlung)} / Monat`, 65)

  if (anpassung > 0) {
    addText(ctx, `Die neue Vorauszahlung ist ${formatCurrency(Math.abs(anpassung))} höher als bisher.`, { color: PDF_CONFIG.colors.red })
  } else if (anpassung < 0) {
    addText(ctx, `Die neue Vorauszahlung ist ${formatCurrency(Math.abs(anpassung))} niedriger als bisher.`, { color: PDF_CONFIG.colors.green })
  }

  ctx.y += 5
  addSeparator(ctx)

  // === RECHTLICHE HINWEISE ===
  checkPageBreak(ctx, 35)
  ctx.doc.setFillColor('#fef3c7')
  ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 30, 2, 2, 'F')
  ctx.y += 4

  addText(ctx, 'Hinweise:', { bold: true, fontSize: PDF_CONFIG.fontSize.small })
  addText(ctx, '• Sie haben das Recht, die Belege zu dieser Abrechnung einzusehen (§ 556 Abs. 3 BGB).', { fontSize: PDF_CONFIG.fontSize.tiny })
  addText(ctx, '• Einwendungen gegen die Abrechnung sind innerhalb von 12 Monaten nach Zugang schriftlich geltend zu machen.', { fontSize: PDF_CONFIG.fontSize.tiny })
  addText(ctx, '• Diese Abrechnung wurde nach den Bestimmungen der Betriebskostenverordnung (BetrKV) erstellt.', { fontSize: PDF_CONFIG.fontSize.tiny })

  ctx.y += 8

  // === GRUSS ===
  addText(ctx, 'Mit freundlichen Grüßen')
  ctx.y += 10
  addText(ctx, formatPerson(data.vermieter))

  // === FUSSZEILE ===
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fontSize.tiny)
    doc.setTextColor(PDF_CONFIG.colors.gray)

    doc.text(
      `Seite ${i} von ${totalPages}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 8,
      { align: 'center' }
    )

    doc.text(
      `Betriebskostenabrechnung ${vonDatum} - ${bisDatum} | ${formatAddress(data.objektAdresse)}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 5,
      { align: 'center' }
    )
  }

  // === PDF SPEICHERN ===
  const filename = `Betriebskostenabrechnung_${data.abrechnungsjahrVon?.substring(0, 4) || 'Jahr'}_${data.objektAdresse.strasse?.replace(/\s/g, '_') || 'Wohnung'}.pdf`
  doc.save(filename)
}
