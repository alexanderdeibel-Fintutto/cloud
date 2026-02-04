import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface GewerbemietvertragPDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  vermieterSteuerNr?: string
  vermieterUstId?: string
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieterFirma: string
  mieterHandelsregister?: string
  mieterUstId?: string
  objektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  objektArt: string
  objektArtSonstige?: string
  nutzflaeche: number | null
  nebenflaeche?: number | null
  stellplaetze?: number | null
  nutzungszweck: string
  nutzungsaenderungErlaubt: boolean
  mietbeginn: string
  mietende?: string
  befristet: boolean
  mindestlaufzeit?: number | null
  verlaengerungsoption?: string
  kuendigungsfrist: number | null
  nettokaltmiete: number | null
  nebenkostenvorauszahlung: number | null
  nebenkostenPauschal: boolean
  umsatzsteuerPflichtig: boolean
  umsatzsteuerSatz: number
  kautionHoehe: number | null
  kautionArt: string
  betriebskostenUmfang: string[]
  schoenheitsreparaturenMieter: boolean
  konkurrenzschutz: boolean
  konkurrenzschutzDetails?: string
  werbungErlaubt: boolean
  untervermietungErlaubt: boolean
  unterschriftVermieter?: { imageData: string | null; signerName: string; signedAt: string | null }
  unterschriftMieter?: { imageData: string | null; signerName: string; signedAt: string | null }
}

const PDF_CONFIG = {
  margin: 20,
  lineHeight: 5,
  fontSize: { title: 16, subtitle: 12, heading: 11, normal: 10, small: 9 },
}

const OBJEKT_ARTEN: Record<string, string> = {
  buero: 'Büroräume',
  laden: 'Ladenlokal / Einzelhandelsfläche',
  lager: 'Lager- / Hallenräume',
  werkstatt: 'Werkstatt',
  praxis: 'Praxisräume',
  gastro: 'Gastronomie',
  sonstige: 'Sonstige Gewerbefläche',
}

const BETRIEBSKOSTEN_LABELS: Record<string, string> = {
  grundsteuer: 'Grundsteuer',
  wasser: 'Wasserversorgung',
  abwasser: 'Abwasser',
  heizung: 'Heizkosten',
  warmwasser: 'Warmwasser',
  strom_gemein: 'Allgemeinstrom',
  muell: 'Müllabfuhr',
  reinigung: 'Gebäudereinigung',
  hausmeister: 'Hausmeister',
  versicherung: 'Gebäudeversicherung',
  aufzug: 'Aufzug',
  garten: 'Gartenpflege',
  winterdienst: 'Winterdienst',
  verwaltung: 'Verwaltungskosten',
}

interface PDFContext {
  doc: jsPDF
  y: number
  pageHeight: number
  pageWidth: number
  margin: number
  contentWidth: number
}

function checkPageBreak(ctx: PDFContext, space: number = 20): void {
  if (ctx.y + space > ctx.pageHeight - ctx.margin) {
    ctx.doc.addPage()
    ctx.y = ctx.margin
  }
}

function addTitle(ctx: PDFContext, text: string): void {
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.title)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.text(text, ctx.pageWidth / 2, ctx.y, { align: 'center' })
  ctx.y += 10
}

function addSubtitle(ctx: PDFContext, text: string): void {
  checkPageBreak(ctx, 15)
  ctx.y += 5
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.subtitle)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.text(text, ctx.margin, ctx.y)
  ctx.y += 7
}

function addParagraph(ctx: PDFContext, text: string, indent: number = 0): void {
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setFont('helvetica', 'normal')
  const lines = ctx.doc.splitTextToSize(text, ctx.contentWidth - indent)
  for (const line of lines) {
    checkPageBreak(ctx)
    ctx.doc.text(line, ctx.margin + indent, ctx.y)
    ctx.y += PDF_CONFIG.lineHeight
  }
  ctx.y += 2
}

function formatPerson(p: { titel?: string; vorname: string; nachname: string }): string {
  return [p.titel, p.vorname, p.nachname].filter(Boolean).join(' ')
}

function formatAddress(a: { strasse: string; hausnummer: string; plz: string; ort: string }): string {
  return `${a.strasse} ${a.hausnummer}, ${a.plz} ${a.ort}`
}

export async function generateGewerbemietvertragPDF(data: GewerbemietvertragPDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const ctx: PDFContext = {
    doc,
    y: PDF_CONFIG.margin,
    pageHeight: doc.internal.pageSize.getHeight(),
    pageWidth: doc.internal.pageSize.getWidth(),
    margin: PDF_CONFIG.margin,
    contentWidth: doc.internal.pageSize.getWidth() - PDF_CONFIG.margin * 2,
  }

  // Titel
  addTitle(ctx, 'GEWERBEMIETVERTRAG')
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.text('(Mietvertrag für Gewerberäume)', ctx.pageWidth / 2, ctx.y, { align: 'center' })
  ctx.y += 10

  // § 1 Vertragsparteien
  addSubtitle(ctx, '§ 1 Vertragsparteien')
  addParagraph(ctx, `Vermieter:`)
  addParagraph(ctx, `${formatPerson(data.vermieter)}`, 5)
  addParagraph(ctx, `${formatAddress(data.vermieterAdresse)}`, 5)
  if (data.vermieterUstId) addParagraph(ctx, `USt-IdNr.: ${data.vermieterUstId}`, 5)

  ctx.y += 3
  addParagraph(ctx, `Mieter:`)
  addParagraph(ctx, `${data.mieterFirma}`, 5)
  if (data.mieterHandelsregister) addParagraph(ctx, `${data.mieterHandelsregister}`, 5)
  addParagraph(ctx, `vertreten durch: ${formatPerson(data.mieter)}`, 5)
  addParagraph(ctx, `${formatAddress(data.mieterAdresse)}`, 5)
  if (data.mieterUstId) addParagraph(ctx, `USt-IdNr.: ${data.mieterUstId}`, 5)

  // § 2 Mietobjekt
  addSubtitle(ctx, '§ 2 Mietobjekt')
  const objektArtText = data.objektArt === 'sonstige' ? data.objektArtSonstige : OBJEKT_ARTEN[data.objektArt]
  addParagraph(ctx, `Der Vermieter vermietet dem Mieter folgende Gewerbefläche:`)
  addParagraph(ctx, `Art: ${objektArtText}`, 5)
  addParagraph(ctx, `Adresse: ${formatAddress(data.objektAdresse)}`, 5)
  addParagraph(ctx, `Nutzfläche: ca. ${data.nutzflaeche || '—'} m²`, 5)
  if (data.nebenflaeche) addParagraph(ctx, `Nebenfläche: ca. ${data.nebenflaeche} m²`, 5)
  if (data.stellplaetze) addParagraph(ctx, `Stellplätze: ${data.stellplaetze}`, 5)

  // § 3 Nutzungszweck
  addSubtitle(ctx, '§ 3 Nutzungszweck')
  addParagraph(ctx, `Die Mieträume dürfen ausschließlich zu folgendem Zweck genutzt werden:`)
  addParagraph(ctx, data.nutzungszweck, 5)
  if (data.nutzungsaenderungErlaubt) {
    addParagraph(ctx, `Eine Änderung des Nutzungszwecks bedarf der vorherigen schriftlichen Zustimmung des Vermieters.`)
  } else {
    addParagraph(ctx, `Eine Änderung des Nutzungszwecks ist nicht gestattet.`)
  }

  // § 4 Mietzeit
  addSubtitle(ctx, '§ 4 Mietzeit')
  const mietbeginnFormatiert = format(new Date(data.mietbeginn), 'dd.MM.yyyy', { locale: de })
  addParagraph(ctx, `Das Mietverhältnis beginnt am ${mietbeginnFormatiert}.`)
  if (data.befristet && data.mietende) {
    const mietendeFormatiert = format(new Date(data.mietende), 'dd.MM.yyyy', { locale: de })
    addParagraph(ctx, `Das Mietverhältnis ist befristet und endet am ${mietendeFormatiert}, ohne dass es einer Kündigung bedarf.`)
  } else {
    addParagraph(ctx, `Das Mietverhältnis wird auf unbestimmte Zeit geschlossen.`)
  }
  if (data.kuendigungsfrist) {
    addParagraph(ctx, `Die Kündigungsfrist beträgt ${data.kuendigungsfrist} Monate zum Monatsende.`)
  }
  if (data.verlaengerungsoption) {
    addParagraph(ctx, `Verlängerungsoption: ${data.verlaengerungsoption}`)
  }

  // § 5 Miete
  addSubtitle(ctx, '§ 5 Miete und Nebenkosten')
  const nettomiete = data.nettokaltmiete || 0
  addParagraph(ctx, `Die monatliche Nettokaltmiete beträgt: ${formatCurrency(nettomiete)}`)

  if (data.umsatzsteuerPflichtig) {
    const ust = nettomiete * (data.umsatzsteuerSatz / 100)
    const brutto = nettomiete + ust
    addParagraph(ctx, `Zzgl. ${data.umsatzsteuerSatz}% Umsatzsteuer: ${formatCurrency(ust)}`)
    addParagraph(ctx, `Bruttomiete: ${formatCurrency(brutto)}`)
    addParagraph(ctx, `Der Vermieter optiert zur Umsatzsteuerpflicht gemäß § 9 UStG.`)
  }

  ctx.y += 3
  const nebenkostenText = data.nebenkostenPauschal ? 'Nebenkostenpauschale' : 'Nebenkostenvorauszahlung'
  addParagraph(ctx, `${nebenkostenText}: ${formatCurrency(data.nebenkostenvorauszahlung || 0)} monatlich`)
  if (!data.nebenkostenPauschal) {
    addParagraph(ctx, `Über die Nebenkosten wird jährlich abgerechnet.`)
  }

  // § 6 Betriebskosten
  addSubtitle(ctx, '§ 6 Betriebskosten')
  addParagraph(ctx, `Folgende Betriebskosten werden auf den Mieter umgelegt:`)
  const bkList = data.betriebskostenUmfang.map(id => BETRIEBSKOSTEN_LABELS[id] || id).join(', ')
  addParagraph(ctx, bkList, 5)

  // § 7 Kaution
  if (data.kautionHoehe && data.kautionArt !== 'keine') {
    addSubtitle(ctx, '§ 7 Kaution')
    const kautionArtText = data.kautionArt === 'buergschaft' ? 'Bankbürgschaft' : 'Barkaution'
    addParagraph(ctx, `Der Mieter leistet eine ${kautionArtText} in Höhe von ${formatCurrency(data.kautionHoehe)}.`)
  }

  // § 8 Instandhaltung
  addSubtitle(ctx, '§ 8 Instandhaltung und Schönheitsreparaturen')
  if (data.schoenheitsreparaturenMieter) {
    addParagraph(ctx, `Der Mieter übernimmt die Schönheitsreparaturen im Inneren der Mieträume.`)
  } else {
    addParagraph(ctx, `Die Schönheitsreparaturen werden vom Vermieter durchgeführt.`)
  }

  // § 9 Besondere Vereinbarungen
  addSubtitle(ctx, '§ 9 Besondere Vereinbarungen')
  if (data.konkurrenzschutz) {
    addParagraph(ctx, `Konkurrenzschutz: ${data.konkurrenzschutzDetails || 'wurde vereinbart'}`)
  }
  addParagraph(ctx, `Außenwerbung: ${data.werbungErlaubt ? 'Nach Zustimmung des Vermieters gestattet' : 'Nicht gestattet'}`)
  addParagraph(ctx, `Untervermietung: ${data.untervermietungErlaubt ? 'Mit Zustimmung des Vermieters gestattet' : 'Nicht gestattet'}`)

  // § 10 Schlussbestimmungen
  addSubtitle(ctx, '§ 10 Schlussbestimmungen')
  addParagraph(ctx, `Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.`)
  addParagraph(ctx, `Sollten einzelne Bestimmungen dieses Vertrages unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.`)
  addParagraph(ctx, `Gerichtsstand ist ${data.objektAdresse.ort}.`)

  // Unterschriften
  checkPageBreak(ctx, 50)
  ctx.y += 10
  const heute = format(new Date(), 'dd.MM.yyyy', { locale: de })
  ctx.doc.text(`${data.objektAdresse.ort}, den ${heute}`, ctx.margin, ctx.y)
  ctx.y += 20

  ctx.doc.setDrawColor(0)
  ctx.doc.line(ctx.margin, ctx.y, ctx.margin + 70, ctx.y)
  ctx.doc.line(ctx.pageWidth - ctx.margin - 70, ctx.y, ctx.pageWidth - ctx.margin, ctx.y)
  ctx.y += 5
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.text('Vermieter', ctx.margin, ctx.y)
  ctx.doc.text('Mieter', ctx.pageWidth - ctx.margin - 70, ctx.y)

  // Signatur-Bilder
  if (data.unterschriftVermieter?.imageData) {
    ctx.doc.addImage(data.unterschriftVermieter.imageData, 'PNG', ctx.margin, ctx.y - 25, 60, 20)
  }
  if (data.unterschriftMieter?.imageData) {
    ctx.doc.addImage(data.unterschriftMieter.imageData, 'PNG', ctx.pageWidth - ctx.margin - 70, ctx.y - 25, 60, 20)
  }

  // Fußzeile
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128)
    doc.text(`Seite ${i} von ${totalPages}`, ctx.pageWidth / 2, ctx.pageHeight - 10, { align: 'center' })
    doc.text(`Gewerbemietvertrag - ${formatAddress(data.objektAdresse)}`, ctx.pageWidth / 2, ctx.pageHeight - 6, { align: 'center' })
  }

  // Speichern
  const filename = `Gewerbemietvertrag_${data.mieterFirma.replace(/\s/g, '_')}_${data.objektAdresse.strasse.replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
