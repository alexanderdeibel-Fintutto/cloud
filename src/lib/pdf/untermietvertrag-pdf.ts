import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

// Typen
export interface UntermietvertragPDFData {
  hauptmieterName: string
  hauptmieterAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  hauptmieterTelefon: string
  hauptmieterEmail: string

  untermieterName: string
  untermieterGeburtsdatum: string
  untermieterBeruf: string
  untermieterAktuelleAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }

  vermieterName: string
  vermieterZustimmungVom: string
  zustimmungBefristet: boolean
  zustimmungBefristetBis: string

  mietobjektAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  untervermieteterTeil: 'ganz' | 'zimmer' | 'bereich'
  zimmerAnzahl: string
  zimmerBeschreibung: string
  wohnflaeche: number
  moebliertGrad: 'unmoebliert' | 'teilmoebliert' | 'vollmoebliert'
  inventarliste: string

  mietbeginn: string
  befristet: boolean
  mietende: string
  befristungsgrund: string

  untermiete: number
  moeblierungszuschlag: number
  nebenkostenPauschale: number
  nebenkostenVorauszahlung: number
  nebenkostenart: 'pauschale' | 'vorauszahlung'
  gesamtmiete: number

  kaution: number
  kautionZahlweise: 'einmalig' | 'raten'

  personenanzahl: number
  tierhaltung: boolean
  tierart: string
  rauchen: boolean
  gewerblicheNutzung: boolean

  schluesselAnzahl: {
    hausschluessel: number
    wohnungsschluessel: number
    zimmerschluessel: number
    briefkastenschluessel: number
    kellerschluessel: number
  }

  hausordnungAkzeptiert: boolean
  reinigungspflicht: string
  besuchsregelung: string
  kuendigungsfrist: string

  unterschriftHauptmieter: string
  unterschriftUntermieter: string
  unterschriftDatum: string
  unterschriftOrt: string
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
    primary: '#7c3aed',
    black: '#000000',
    gray: '#6b7280',
    lightGray: '#e5e7eb',
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
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.subtitle)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(text, ctx.margin, ctx.y)
  ctx.y += 7
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

function addNumberedParagraph(ctx: PDFContext, number: string, text: string): void {
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(number, ctx.margin, ctx.y)

  ctx.doc.setFont('helvetica', 'normal')
  const maxWidth = ctx.contentWidth - 8
  const lines = ctx.doc.splitTextToSize(text, maxWidth)

  for (let i = 0; i < lines.length; i++) {
    checkPageBreak(ctx, PDF_CONFIG.lineHeight)
    ctx.doc.text(lines[i], ctx.margin + 8, ctx.y)
    if (i < lines.length - 1) ctx.y += PDF_CONFIG.lineHeight
  }
  ctx.y += PDF_CONFIG.lineHeight + 2
}

function addSeparator(ctx: PDFContext): void {
  ctx.y += 2
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y)
  ctx.y += 5
}

function formatAddress(address: { strasse: string; hausnummer: string; plz: string; ort: string }): string {
  return `${address.strasse} ${address.hausnummer}, ${address.plz} ${address.ort}`
}

const MOEBLIERT_LABELS: Record<string, string> = {
  unmoebliert: 'unmöbliert',
  teilmoebliert: 'teilmöbliert',
  vollmoebliert: 'vollmöbliert',
}

const KUENDIGUNG_LABELS: Record<string, string> = {
  '14tage': '14 Tage zum Monatsende (möblierter Wohnraum)',
  '1monat': '1 Monat zum Monatsende',
  '3monate': '3 Monate zum Monatsende (gesetzliche Frist)',
}

// Hauptfunktion: PDF generieren
export async function generateUntermietvertragPDF(data: UntermietvertragPDFData): Promise<void> {
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

  // === DECKBLATT ===
  ctx.y = 30
  addTitle(ctx, 'UNTERMIETVERTRAG')

  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text('gemäß § 540 BGB', ctx.pageWidth / 2, ctx.y, { align: 'center' })
  ctx.y += 15

  // Kurzübersicht
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.setFillColor('#f8fafc')
  ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 45, 2, 2, 'FD')
  ctx.y += 6

  addLabelValue(ctx, 'Hauptmieter', data.hauptmieterName)
  addLabelValue(ctx, 'Untermieter', data.untermieterName)
  addLabelValue(ctx, 'Mietobjekt', formatAddress(data.mietobjektAdresse))
  addLabelValue(ctx, 'Mietbeginn', data.mietbeginn ? format(new Date(data.mietbeginn), 'dd.MM.yyyy', { locale: de }) : '—')
  addLabelValue(ctx, 'Gesamtmiete', `${formatCurrency(data.gesamtmiete)} monatlich`)

  ctx.y += 10

  // === § 1 VERTRAGSPARTEIEN ===
  addSubtitle(ctx, '§ 1 Vertragsparteien')

  addText(ctx, 'Zwischen', { bold: true })
  addText(ctx, data.hauptmieterName, { indent: 5 })
  addText(ctx, formatAddress(data.hauptmieterAdresse), { indent: 5 })
  addText(ctx, '— nachfolgend „Hauptmieter" genannt —', { indent: 5 })
  ctx.y += 3

  addText(ctx, 'und', { bold: true })
  addText(ctx, data.untermieterName, { indent: 5 })
  if (data.untermieterGeburtsdatum) {
    addText(ctx, `geboren am: ${format(new Date(data.untermieterGeburtsdatum), 'dd.MM.yyyy', { locale: de })}`, { indent: 5 })
  }
  if (data.untermieterBeruf) {
    addText(ctx, `Beruf: ${data.untermieterBeruf}`, { indent: 5 })
  }
  addText(ctx, '— nachfolgend „Untermieter" genannt —', { indent: 5 })
  ctx.y += 3

  addText(ctx, 'wird folgender Untermietvertrag geschlossen:')

  addSeparator(ctx)

  // === § 2 ERLAUBNIS DES VERMIETERS ===
  addSubtitle(ctx, '§ 2 Erlaubnis des Vermieters')

  addNumberedParagraph(ctx, '(1)', `Der Vermieter der Hauptmietwohnung, ${data.vermieterName || '_______________'}, hat der Untervermietung ${data.vermieterZustimmungVom ? `mit Schreiben vom ${format(new Date(data.vermieterZustimmungVom), 'dd.MM.yyyy', { locale: de })}` : ''} zugestimmt.`)

  if (data.zustimmungBefristet && data.zustimmungBefristetBis) {
    addNumberedParagraph(ctx, '(2)', `Die Zustimmung ist befristet bis zum ${format(new Date(data.zustimmungBefristetBis), 'dd.MM.yyyy', { locale: de })}.`)
  }

  addSeparator(ctx)

  // === § 3 MIETGEGENSTAND ===
  addSubtitle(ctx, '§ 3 Mietgegenstand')

  const teilBeschreibung = data.untervermieteterTeil === 'ganz'
    ? 'die gesamte Wohnung'
    : data.untervermieteterTeil === 'zimmer'
      ? `${data.zimmerAnzahl} Zimmer`
      : 'den folgenden Wohnbereich'

  addNumberedParagraph(ctx, '(1)', `Der Hauptmieter vermietet an den Untermieter ${teilBeschreibung} in der Wohnung ${formatAddress(data.mietobjektAdresse)}.`)

  if (data.wohnflaeche > 0) {
    addNumberedParagraph(ctx, '(2)', `Die untervermietete Fläche beträgt ca. ${data.wohnflaeche} m².`)
  }

  if (data.zimmerBeschreibung) {
    addNumberedParagraph(ctx, '(3)', `Beschreibung: ${data.zimmerBeschreibung}`)
  }

  addNumberedParagraph(ctx, '(4)', `Die Räume werden ${MOEBLIERT_LABELS[data.moebliertGrad] || data.moebliertGrad} vermietet.`)

  if (data.inventarliste && data.moebliertGrad !== 'unmoebliert') {
    addNumberedParagraph(ctx, '(5)', `Folgende Einrichtungsgegenstände sind Teil des Mietverhältnisses: ${data.inventarliste}`)
  }

  addSeparator(ctx)

  // === § 4 MIETZEIT ===
  addSubtitle(ctx, '§ 4 Mietzeit')

  if (data.befristet && data.mietende) {
    addNumberedParagraph(ctx, '(1)', `Das Untermietverhältnis beginnt am ${data.mietbeginn ? format(new Date(data.mietbeginn), 'dd.MM.yyyy', { locale: de }) : '_______________'} und ist befristet bis zum ${format(new Date(data.mietende), 'dd.MM.yyyy', { locale: de })}.`)
    if (data.befristungsgrund) {
      addNumberedParagraph(ctx, '(2)', `Befristungsgrund gemäß § 575 BGB: ${data.befristungsgrund}`)
    }
  } else {
    addNumberedParagraph(ctx, '(1)', `Das Untermietverhältnis beginnt am ${data.mietbeginn ? format(new Date(data.mietbeginn), 'dd.MM.yyyy', { locale: de }) : '_______________'} und wird auf unbestimmte Zeit geschlossen.`)
  }

  addSeparator(ctx)

  // === § 5 MIETE ===
  addSubtitle(ctx, '§ 5 Miete und Nebenkosten')

  addNumberedParagraph(ctx, '(1)', 'Die monatliche Miete setzt sich wie folgt zusammen:')

  addLabelValue(ctx, 'Grundmiete (Kaltmiete)', formatCurrency(data.untermiete), 60)
  if (data.moeblierungszuschlag > 0) {
    addLabelValue(ctx, 'Möblierungszuschlag', formatCurrency(data.moeblierungszuschlag), 60)
  }

  if (data.nebenkostenart === 'pauschale') {
    addLabelValue(ctx, 'Nebenkostenpauschale', formatCurrency(data.nebenkostenPauschale), 60)
  } else {
    addLabelValue(ctx, 'Nebenkostenvorauszahlung', formatCurrency(data.nebenkostenVorauszahlung), 60)
  }

  ctx.doc.setFont('helvetica', 'bold')
  addLabelValue(ctx, 'Gesamtmiete monatlich', formatCurrency(data.gesamtmiete), 60)
  ctx.doc.setFont('helvetica', 'normal')

  addNumberedParagraph(ctx, '(2)', 'Die Miete ist monatlich im Voraus, spätestens bis zum 3. Werktag eines Monats, zu entrichten.')

  addSeparator(ctx)

  // === § 6 KAUTION ===
  addSubtitle(ctx, '§ 6 Kaution')

  const kautionText = data.kautionZahlweise === 'raten'
    ? `Der Untermieter leistet eine Kaution in Höhe von ${formatCurrency(data.kaution)}, zahlbar in 3 gleichen Raten.`
    : `Der Untermieter leistet bei Mietbeginn eine Kaution in Höhe von ${formatCurrency(data.kaution)}.`

  addNumberedParagraph(ctx, '(1)', kautionText)
  addNumberedParagraph(ctx, '(2)', 'Die Kaution wird nach Beendigung des Untermietverhältnisses und ordnungsgemäßer Rückgabe der Räumlichkeiten zurückerstattet.')

  addSeparator(ctx)

  // === § 7 NUTZUNG ===
  addSubtitle(ctx, '§ 7 Nutzung')

  addNumberedParagraph(ctx, '(1)', `Die Räume dürfen von ${data.personenanzahl} Person(en) bewohnt werden.`)
  addNumberedParagraph(ctx, '(2)', data.tierhaltung ? `Tierhaltung ist gestattet: ${data.tierart || 'Ja'}` : 'Tierhaltung ist nicht gestattet.')
  addNumberedParagraph(ctx, '(3)', data.rauchen ? 'Rauchen in den Räumen ist gestattet.' : 'Rauchen in den Räumen ist nicht gestattet.')
  addNumberedParagraph(ctx, '(4)', data.gewerblicheNutzung ? 'Gewerbliche Nutzung ist gestattet.' : 'Die Räume dürfen nur zu Wohnzwecken genutzt werden.')

  addSeparator(ctx)

  // === § 8 SCHLÜSSEL ===
  addSubtitle(ctx, '§ 8 Schlüsselübergabe')

  const schluessel = data.schluesselAnzahl
  const schluesselListe = []
  if (schluessel.hausschluessel > 0) schluesselListe.push(`${schluessel.hausschluessel}x Hausschlüssel`)
  if (schluessel.wohnungsschluessel > 0) schluesselListe.push(`${schluessel.wohnungsschluessel}x Wohnungsschlüssel`)
  if (schluessel.zimmerschluessel > 0) schluesselListe.push(`${schluessel.zimmerschluessel}x Zimmerschlüssel`)
  if (schluessel.briefkastenschluessel > 0) schluesselListe.push(`${schluessel.briefkastenschluessel}x Briefkastenschlüssel`)
  if (schluessel.kellerschluessel > 0) schluesselListe.push(`${schluessel.kellerschluessel}x Kellerschlüssel`)

  addNumberedParagraph(ctx, '(1)', `Der Untermieter erhält bei Einzug folgende Schlüssel: ${schluesselListe.join(', ') || 'nach Vereinbarung'}.`)

  addSeparator(ctx)

  // === § 9 KÜNDIGUNG ===
  addSubtitle(ctx, '§ 9 Kündigung')

  addNumberedParagraph(ctx, '(1)', `Die Kündigungsfrist beträgt ${KUENDIGUNG_LABELS[data.kuendigungsfrist] || data.kuendigungsfrist}.`)
  addNumberedParagraph(ctx, '(2)', 'Die Kündigung bedarf der Schriftform.')
  addNumberedParagraph(ctx, '(3)', 'Das Recht zur außerordentlichen fristlosen Kündigung aus wichtigem Grund bleibt unberührt.')

  addSeparator(ctx)

  // === § 10 SONSTIGES ===
  addSubtitle(ctx, '§ 10 Sonstige Vereinbarungen')

  if (data.hausordnungAkzeptiert) {
    addNumberedParagraph(ctx, '(1)', 'Der Untermieter erkennt die Hausordnung des Gebäudes an.')
  }
  if (data.reinigungspflicht) {
    addNumberedParagraph(ctx, '(2)', `Reinigungspflichten: ${data.reinigungspflicht}`)
  }
  if (data.besuchsregelung) {
    addNumberedParagraph(ctx, '(3)', `Besuchsregelung: ${data.besuchsregelung}`)
  }

  addSeparator(ctx)

  // === § 11 SCHLUSSBESTIMMUNGEN ===
  addSubtitle(ctx, '§ 11 Schlussbestimmungen')

  addNumberedParagraph(ctx, '(1)', 'Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.')
  addNumberedParagraph(ctx, '(2)', 'Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit des Vertrages im Übrigen unberührt.')
  addNumberedParagraph(ctx, '(3)', 'Der Vertrag wird in zweifacher Ausfertigung erstellt. Jede Partei erhält eine Ausfertigung.')

  // === UNTERSCHRIFTEN ===
  checkPageBreak(ctx, 60)
  ctx.doc.addPage()
  ctx.y = ctx.margin

  addSubtitle(ctx, 'Unterschriften')

  ctx.y += 5
  addText(ctx, 'Mit ihrer Unterschrift bestätigen die Parteien ihr Einverständnis mit allen Vertragsbestimmungen.', { fontSize: PDF_CONFIG.fontSize.small, color: PDF_CONFIG.colors.gray })

  ctx.y += 10
  addText(ctx, `${data.unterschriftOrt || '_______________'}, den ${data.unterschriftDatum ? format(new Date(data.unterschriftDatum), 'dd.MM.yyyy', { locale: de }) : format(heute, 'dd.MM.yyyy', { locale: de })}`)

  ctx.y += 20

  // Hauptmieter
  ctx.doc.setDrawColor(PDF_CONFIG.colors.black)
  ctx.doc.line(ctx.margin, ctx.y, ctx.margin + 60, ctx.y)
  ctx.y += 4
  addText(ctx, 'Hauptmieter', { fontSize: PDF_CONFIG.fontSize.small, color: PDF_CONFIG.colors.gray })
  addText(ctx, data.hauptmieterName)

  ctx.y += 15

  // Untermieter
  ctx.doc.line(ctx.margin, ctx.y, ctx.margin + 60, ctx.y)
  ctx.y += 4
  addText(ctx, 'Untermieter', { fontSize: PDF_CONFIG.fontSize.small, color: PDF_CONFIG.colors.gray })
  addText(ctx, data.untermieterName)

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
      `Untermietvertrag | ${formatAddress(data.mietobjektAdresse)}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 5,
      { align: 'center' }
    )
  }

  // === PDF SPEICHERN ===
  const filename = `Untermietvertrag_${data.untermieterName.replace(/\s/g, '_')}_${format(heute, 'yyyy-MM-dd')}.pdf`
  doc.save(filename)
}
