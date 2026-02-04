import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format, addMonths } from 'date-fns'
import { de } from 'date-fns/locale'

// Typen
export interface MieterhoehungPDFData {
  vermieterName: string
  vermieterAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }

  mieterName: string
  mieterAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }

  mietobjektAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  wohnflaeche: number
  zimmeranzahl: string
  baujahr: string

  aktuelleMiete: number
  letzteMieterhoehung: string
  mietbeginn: string

  neueMiete: number
  erhoehungAb: string

  begruendungsart: 'mietspiegel' | 'vergleichswohnungen' | 'gutachten'
  mietspiegelJahr: string
  mietspiegelGemeinde: string
  vergleichsmieteVon: number
  vergleichsmieteBis: number

  ausstattung: {
    bad: string
    heizung: string
    bodenbelag: string
    balkon: boolean
    aufzug: boolean
    einbaukueche: boolean
  }

  kappungsgrenzeInfo: {
    mieteVor3Jahren: number
    kappungsgrenzeProzent: number
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
    primary: '#ea580c',
    black: '#000000',
    gray: '#666666',
    lightGray: '#999999',
    green: '#16a34a',
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

function addLabelValue(ctx: PDFContext, label: string, value: string, labelWidth: number = 60): void {
  checkPageBreak(ctx, PDF_CONFIG.lineHeight)
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.text)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(label + ':', ctx.margin.left, ctx.y)

  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(value || '—', ctx.margin.left + labelWidth, ctx.y)
  ctx.y += PDF_CONFIG.lineHeight
}

function formatAddress(address: { strasse: string; hausnummer: string; plz: string; ort: string }): string {
  return `${address.strasse} ${address.hausnummer}, ${address.plz} ${address.ort}`
}

const AUSSTATTUNG_LABELS: Record<string, string> = {
  einfach: 'einfach',
  standard: 'Standard',
  gehoben: 'gehoben',
  luxus: 'Luxus',
  zentral: 'Zentralheizung',
  etage: 'Etagenheizung',
  ofen: 'Ofenheizung',
  fussboden: 'Fußbodenheizung',
  pvc: 'PVC/Linoleum',
  laminat: 'Laminat',
  parkett: 'Parkett',
  fliesen: 'Fliesen',
  teppich: 'Teppich',
}

// Hauptfunktion: PDF generieren
export async function generateMieterhoehungPDF(data: MieterhoehungPDFData): Promise<void> {
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
  const erhoehungBetrag = data.neueMiete - data.aktuelleMiete
  const erhoehungProzent = data.aktuelleMiete > 0 ? ((erhoehungBetrag / data.aktuelleMiete) * 100) : 0

  // Berechne Zustimmungsfrist (Ende übernächster Monat)
  const zustimmungsfrist = addMonths(heute, 2)
  const zustimmungsfristText = format(zustimmungsfrist, 'dd.MM.yyyy', { locale: de })

  // === ABSENDERZEILE ===
  ctx.y = 40
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(
    `${data.vermieterName} · ${data.vermieterAdresse.strasse} ${data.vermieterAdresse.hausnummer} · ${data.vermieterAdresse.plz} ${data.vermieterAdresse.ort}`,
    ctx.margin.left, ctx.y
  )

  ctx.y += 2
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin.left, ctx.y, ctx.margin.left + 80, ctx.y)
  ctx.y += 5

  // === EMPFÄNGER ===
  addText(ctx, data.mieterName, { fontSize: PDF_CONFIG.fontSize.empfaenger, bold: true })
  addText(ctx, `${data.mieterAdresse.strasse || data.mietobjektAdresse.strasse} ${data.mieterAdresse.hausnummer || data.mietobjektAdresse.hausnummer}`, { fontSize: PDF_CONFIG.fontSize.empfaenger })
  addText(ctx, `${data.mieterAdresse.plz || data.mietobjektAdresse.plz} ${data.mieterAdresse.ort || data.mietobjektAdresse.ort}`, { fontSize: PDF_CONFIG.fontSize.empfaenger })

  // === DATUM ===
  ctx.y += 15
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.text)
  ctx.doc.text(`${data.vermieterAdresse.ort}, den ${format(heute, 'dd.MM.yyyy', { locale: de })}`, ctx.pageWidth - ctx.margin.right, ctx.y, { align: 'right' })
  ctx.y += 15

  // === BETREFF ===
  addText(ctx, 'Mieterhöhungsverlangen gemäß § 558 BGB', { fontSize: PDF_CONFIG.fontSize.betreff, bold: true })
  addText(ctx, `Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, { fontSize: PDF_CONFIG.fontSize.text, bold: true })
  ctx.y += 8

  // === ANREDE ===
  addParagraph(ctx, `Sehr geehrte/r ${data.mieterName},`)
  ctx.y += 3

  // === EINLEITUNG ===
  addParagraph(ctx, `ich bitte Sie um Zustimmung zu einer Mieterhöhung für die oben genannte Wohnung auf die ortsübliche Vergleichsmiete gemäß § 558 BGB.`)

  // === AKTUELLE SITUATION ===
  ctx.y += 3
  addText(ctx, 'Aktuelle Mietsituation:', { bold: true })
  ctx.y += 2

  addLabelValue(ctx, 'Aktuelle Nettokaltmiete', formatCurrency(data.aktuelleMiete))
  if (data.wohnflaeche > 0) {
    addLabelValue(ctx, 'Miete pro m²', formatCurrency(data.aktuelleMiete / data.wohnflaeche))
  }
  addLabelValue(ctx, 'Wohnfläche', `ca. ${data.wohnflaeche} m²`)
  if (data.mietbeginn) {
    addLabelValue(ctx, 'Mietbeginn', format(new Date(data.mietbeginn), 'dd.MM.yyyy', { locale: de }))
  }
  if (data.letzteMieterhoehung) {
    addLabelValue(ctx, 'Letzte Mieterhöhung', format(new Date(data.letzteMieterhoehung), 'dd.MM.yyyy', { locale: de }))
  }

  // === MIETERHÖHUNG ===
  ctx.y += 5
  ctx.doc.setFillColor('#fff7ed')
  ctx.doc.roundedRect(ctx.margin.left, ctx.y, ctx.contentWidth, 30, 2, 2, 'F')
  ctx.y += 5

  addText(ctx, 'Mieterhöhung:', { bold: true, color: PDF_CONFIG.colors.primary, indent: 5 })
  ctx.y += 2

  ctx.doc.setFontSize(PDF_CONFIG.fontSize.text)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.text(`Neue Nettokaltmiete:`, ctx.margin.left + 5, ctx.y)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.primary)
  ctx.doc.text(formatCurrency(data.neueMiete), ctx.margin.left + 55, ctx.y)
  ctx.y += PDF_CONFIG.lineHeight

  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(`Erhöhung:`, ctx.margin.left + 5, ctx.y)
  ctx.doc.text(`${formatCurrency(erhoehungBetrag)} (+${erhoehungProzent.toFixed(1)}%)`, ctx.margin.left + 55, ctx.y)
  ctx.y += PDF_CONFIG.lineHeight

  ctx.doc.text(`Wirksam ab:`, ctx.margin.left + 5, ctx.y)
  ctx.doc.text(data.erhoehungAb ? format(new Date(data.erhoehungAb), 'dd.MM.yyyy', { locale: de }) : '—', ctx.margin.left + 55, ctx.y)

  ctx.y += 10

  // === BEGRÜNDUNG ===
  addText(ctx, 'Begründung der Mieterhöhung:', { bold: true })
  ctx.y += 2

  if (data.begruendungsart === 'mietspiegel') {
    addParagraph(ctx, `Die Erhöhung begründe ich mit dem aktuellen Mietspiegel der ${data.mietspiegelGemeinde || 'Gemeinde'} (Stand: ${data.mietspiegelJahr || '—'}).`)

    if (data.vergleichsmieteVon > 0 && data.vergleichsmieteBis > 0) {
      addParagraph(ctx, `Laut Mietspiegel beträgt die ortsübliche Vergleichsmiete für vergleichbare Wohnungen zwischen ${formatCurrency(data.vergleichsmieteVon)}/m² und ${formatCurrency(data.vergleichsmieteBis)}/m².`)

      if (data.wohnflaeche > 0) {
        const minMiete = data.vergleichsmieteVon * data.wohnflaeche
        const maxMiete = data.vergleichsmieteBis * data.wohnflaeche
        addParagraph(ctx, `Dies entspricht bei Ihrer Wohnung (${data.wohnflaeche} m²) einer Miete zwischen ${formatCurrency(minMiete)} und ${formatCurrency(maxMiete)}.`)
      }
    }
  } else if (data.begruendungsart === 'vergleichswohnungen') {
    addParagraph(ctx, `Die Erhöhung begründe ich durch Benennung von mindestens drei Vergleichswohnungen (§ 558a Abs. 2 Nr. 4 BGB). Die Angaben zu den Vergleichswohnungen sind diesem Schreiben als Anlage beigefügt.`)
  } else if (data.begruendungsart === 'gutachten') {
    addParagraph(ctx, `Die Erhöhung begründe ich durch ein Sachverständigengutachten (§ 558a Abs. 2 Nr. 3 BGB). Das Gutachten ist diesem Schreiben als Anlage beigefügt.`)
  }

  // === AUSSTATTUNG ===
  if (data.ausstattung) {
    ctx.y += 3
    addText(ctx, 'Berücksichtigte Ausstattungsmerkmale:', { bold: true })
    ctx.y += 2

    const ausstattungListe = []
    if (data.ausstattung.bad) ausstattungListe.push(`Bad: ${AUSSTATTUNG_LABELS[data.ausstattung.bad] || data.ausstattung.bad}`)
    if (data.ausstattung.heizung) ausstattungListe.push(`Heizung: ${AUSSTATTUNG_LABELS[data.ausstattung.heizung] || data.ausstattung.heizung}`)
    if (data.ausstattung.bodenbelag) ausstattungListe.push(`Bodenbelag: ${AUSSTATTUNG_LABELS[data.ausstattung.bodenbelag] || data.ausstattung.bodenbelag}`)
    if (data.ausstattung.balkon) ausstattungListe.push('Balkon/Terrasse vorhanden')
    if (data.ausstattung.aufzug) ausstattungListe.push('Aufzug vorhanden')
    if (data.ausstattung.einbaukueche) ausstattungListe.push('Einbauküche vorhanden')

    ausstattungListe.forEach(item => {
      addText(ctx, `• ${item}`, { indent: 5 })
    })
  }

  // === KAPPUNGSGRENZE ===
  ctx.y += 5
  ctx.doc.setFillColor('#ecfdf5')
  ctx.doc.roundedRect(ctx.margin.left, ctx.y, ctx.contentWidth, 18, 2, 2, 'F')
  ctx.y += 5

  addText(ctx, 'Prüfung der Kappungsgrenze (§ 558 Abs. 3 BGB):', { bold: true, color: PDF_CONFIG.colors.green, indent: 5 })

  const kappungsProzent = data.kappungsgrenzeInfo?.kappungsgrenzeProzent || 20
  addText(ctx, `Die Miete darf innerhalb von 3 Jahren um maximal ${kappungsProzent}% steigen. Diese Grenze wird eingehalten.`, { fontSize: PDF_CONFIG.fontSize.small, indent: 5 })

  ctx.y += 5

  // === ZUSTIMMUNGSFRIST ===
  ctx.y += 3
  addText(ctx, 'Zustimmungsfrist:', { bold: true })
  ctx.y += 2

  addParagraph(ctx, `Gemäß § 558b Abs. 2 BGB haben Sie bis zum Ablauf des übernächsten Monats nach Zugang dieses Schreibens Zeit, der Mieterhöhung zuzustimmen. Die Zustimmungsfrist endet am ${zustimmungsfristText}.`)

  addParagraph(ctx, `Erteilen Sie innerhalb dieser Frist keine Zustimmung, kann ich auf Zustimmung klagen (§ 558b Abs. 2 BGB).`)

  // === HINWEISE ===
  checkPageBreak(ctx, 30)
  ctx.y += 5
  ctx.doc.setFillColor('#eff6ff')
  ctx.doc.roundedRect(ctx.margin.left, ctx.y, ctx.contentWidth, 25, 2, 2, 'F')
  ctx.y += 5

  addText(ctx, 'Hinweise für den Mieter:', { bold: true, fontSize: PDF_CONFIG.fontSize.small, indent: 5 })
  addText(ctx, '• Sie können die Mieterhöhung anhand des Mietspiegels selbst überprüfen.', { fontSize: PDF_CONFIG.fontSize.tiny, indent: 5 })
  addText(ctx, '• Bei Fragen können Sie sich an einen Mieterverein wenden.', { fontSize: PDF_CONFIG.fontSize.tiny, indent: 5 })
  addText(ctx, '• Sie haben das Recht, der Erhöhung zu widersprechen, wenn Sie sie für unberechtigt halten.', { fontSize: PDF_CONFIG.fontSize.tiny, indent: 5 })

  ctx.y += 5

  // === GRUSS ===
  ctx.y += 8
  addParagraph(ctx, 'Für Rückfragen stehe ich Ihnen gerne zur Verfügung.')
  ctx.y += 3
  addParagraph(ctx, 'Mit freundlichen Grüßen')

  ctx.y += 15

  // Unterschrift
  ctx.doc.setDrawColor(PDF_CONFIG.colors.black)
  ctx.doc.line(ctx.margin.left, ctx.y, ctx.margin.left + 60, ctx.y)
  ctx.y += 4
  addText(ctx, data.vermieterName, { fontSize: PDF_CONFIG.fontSize.small })
  addText(ctx, '(Vermieter)', { fontSize: PDF_CONFIG.fontSize.tiny, color: PDF_CONFIG.colors.gray })

  // === ZUSTIMMUNGSERKLÄRUNG ===
  checkPageBreak(ctx, 50)
  ctx.y += 15
  ctx.doc.setDrawColor(PDF_CONFIG.colors.black)
  ctx.doc.setLineDashPattern([2, 2], 0)
  ctx.doc.line(ctx.margin.left, ctx.y, ctx.pageWidth - ctx.margin.right, ctx.y)
  ctx.doc.setLineDashPattern([], 0)
  ctx.y += 3

  addText(ctx, '✂ Bitte ausschneiden und unterschrieben zurücksenden', { fontSize: PDF_CONFIG.fontSize.tiny, color: PDF_CONFIG.colors.gray })

  ctx.y += 8
  addText(ctx, 'ZUSTIMMUNGSERKLÄRUNG', { bold: true, fontSize: PDF_CONFIG.fontSize.betreff })
  ctx.y += 5

  addText(ctx, `Hiermit stimme ich der oben genannten Mieterhöhung von ${formatCurrency(data.aktuelleMiete)} auf ${formatCurrency(data.neueMiete)} ab dem ${data.erhoehungAb ? format(new Date(data.erhoehungAb), 'dd.MM.yyyy', { locale: de }) : '_______________'} zu.`)

  ctx.y += 15
  addText(ctx, 'Ort, Datum: _______________________________')
  ctx.y += 15
  ctx.doc.line(ctx.margin.left, ctx.y, ctx.margin.left + 80, ctx.y)
  ctx.y += 4
  addText(ctx, 'Unterschrift Mieter', { fontSize: PDF_CONFIG.fontSize.small, color: PDF_CONFIG.colors.gray })

  // === FUSSZEILE ===
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fontSize.tiny)
    doc.setTextColor(PDF_CONFIG.colors.lightGray)
    doc.text(
      `Seite ${i} von ${totalPages} | Mieterhöhungsverlangen vom ${format(heute, 'dd.MM.yyyy', { locale: de })}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 8,
      { align: 'center' }
    )
  }

  // === PDF SPEICHERN ===
  const filename = `Mieterhoehungsverlangen_${data.mieterName.replace(/\s/g, '_')}_${format(heute, 'yyyy-MM-dd')}.pdf`
  doc.save(filename)
}
