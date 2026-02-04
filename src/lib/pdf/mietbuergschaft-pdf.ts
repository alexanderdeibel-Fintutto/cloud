import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  buerge: { anrede: string; titel?: string; vorname: string; nachname: string }
  buergeAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietvertragVom?: string
  buergschaftsbetrag: number | null
  buergschaftsart: string[]
  selbstschuldnerisch: boolean
  verzichtEinredeVorausklage: boolean
  befristet: boolean
  befristetBis?: string
  sonstigeVereinbarungen?: string
  unterschriftBuerge?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const BUERGSCHAFT_LABELS: Record<string, string> = {
  miete: 'Mietzahlungen',
  nebenkosten: 'Nebenkosten / Betriebskosten',
  schaeden: 'Schäden am Mietobjekt',
  renovierung: 'Renovierungskosten bei Auszug',
  alle: 'Alle Verpflichtungen aus dem Mietvertrag',
}

export async function generateMietbuergschaftPDF(data: PDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let y = margin

  const formatPerson = (p: { titel?: string; vorname: string; nachname: string }) =>
    [p.titel, p.vorname, p.nachname].filter(Boolean).join(' ')

  const formatAddress = (a: { strasse: string; hausnummer: string; plz: string; ort: string }) =>
    `${a.strasse} ${a.hausnummer}, ${a.plz} ${a.ort}`

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return '—'
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de })
  }

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 25) {
      doc.addPage()
      y = margin
    }
  }

  // Header
  doc.setFillColor(99, 102, 241) // Indigo
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Bürgschaftserklärung', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(Mietbürgschaft)', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Bürge
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Bürge:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.buerge), margin, y)
  y += 4
  doc.text(formatAddress(data.buergeAdresse), margin, y)
  y += 10

  // Bürgschaftserklärung
  const erklaerung = `Ich, ${formatPerson(data.buerge)}, erkläre hiermit gegenüber`
  doc.text(erklaerung, margin, y)
  y += 8

  // Vermieter
  doc.setFont('helvetica', 'bold')
  doc.text('Vermieter (Bürgschaftsgläubiger):', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.vermieter), margin, y)
  y += 4
  doc.text(formatAddress(data.vermieterAdresse), margin, y)
  y += 10

  // Bürgschaftstext
  const buergschaftsText = `dass ich für sämtliche Verpflichtungen von ${formatPerson(data.mieter)} (nachfolgend "Mieter") aus dem Mietverhältnis über die Wohnung`
  const buergschaftsLines = doc.splitTextToSize(buergschaftsText, pageWidth - 2 * margin)
  for (const line of buergschaftsLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 3

  // Mietobjekt
  doc.setFont('helvetica', 'bold')
  doc.text(formatAddress(data.mietobjektAdresse), margin, y)
  doc.setFont('helvetica', 'normal')
  y += 5
  if (data.mietvertragVom) {
    doc.text(`(Mietvertrag vom ${formatDateStr(data.mietvertragVom)})`, margin, y)
    y += 5
  }
  y += 5

  doc.text('die Bürgschaft übernehme.', margin, y)
  y += 10

  // Bürgschaftsumfang
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Bürgschaftsumfang', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Die Bürgschaft ist auf einen Höchstbetrag von ${formatCurrency(data.buergschaftsbetrag || 0)} begrenzt.`, margin, y)
  y += 8

  if (data.buergschaftsart.length > 0) {
    doc.text('Die Bürgschaft erstreckt sich auf:', margin, y)
    y += 5
    for (const art of data.buergschaftsart) {
      if (BUERGSCHAFT_LABELS[art]) {
        doc.text(`• ${BUERGSCHAFT_LABELS[art]}`, margin + 5, y)
        y += 5
      }
    }
    y += 5
  }

  // Art der Bürgschaft
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Art der Bürgschaft', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  if (data.selbstschuldnerisch) {
    const selbstText = 'Es handelt sich um eine selbstschuldnerische Bürgschaft. Der Bürge haftet wie ein Hauptschuldner.'
    const selbstLines = doc.splitTextToSize(selbstText, pageWidth - 2 * margin)
    for (const line of selbstLines) {
      doc.text(line, margin, y)
      y += 5
    }
  } else {
    doc.text('Es handelt sich um eine gewöhnliche Bürgschaft.', margin, y)
    y += 5
  }

  if (data.verzichtEinredeVorausklage) {
    y += 3
    doc.text('Der Bürge verzichtet auf die Einrede der Vorausklage gemäß § 771 BGB.', margin, y)
    y += 5
  }
  y += 5

  // Befristung
  if (data.befristet && data.befristetBis) {
    checkPageBreak(20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 3 Befristung', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Diese Bürgschaft ist befristet bis zum ${formatDateStr(data.befristetBis)}.`, margin, y)
    y += 10
  }

  // Sonstige Vereinbarungen
  if (data.sonstigeVereinbarungen) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Sonstige Vereinbarungen', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const sonstigeLines = doc.splitTextToSize(data.sonstigeVereinbarungen, pageWidth - 2 * margin)
    for (const line of sonstigeLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Hinweis
  checkPageBreak(25)
  doc.setFontSize(9)
  doc.setTextColor(100)
  const hinweis = 'Hinweis: Diese Bürgschaftserklärung bedarf der Schriftform (§ 766 BGB). Dem Bürgen wird empfohlen, sich über die rechtlichen Konsequenzen einer Bürgschaft zu informieren.'
  const hinweisLines = doc.splitTextToSize(hinweis, pageWidth - 2 * margin)
  for (const line of hinweisLines) {
    doc.text(line, margin, y)
    y += 4
  }
  y += 10

  // Ort und Datum
  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 80, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Unterschrift des Bürgen', margin, y)
  y += 4
  doc.text(formatPerson(data.buerge), margin, y)

  if (data.unterschriftBuerge?.imageData) {
    doc.addImage(data.unterschriftBuerge.imageData, 'PNG', margin, y - 29, 70, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Bürgschaftserklärung (Mietbürgschaft)', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Mietbuergschaft_${formatPerson(data.buerge).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
