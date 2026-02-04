import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  beschreibung: string
  begruendung: string
  rueckbau: boolean
  rueckbauDetails: string
  auflagen: string
  genehmigt: boolean
  unterschriftVermieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

export async function generateBaulicheAenderungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(34, 197, 94) // Green
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Genehmigung baulicher Änderungen', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Vermieter
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Vermieter: ${formatPerson(data.vermieter)}, ${formatAddress(data.vermieterAdresse)}`, margin, y)
  y += 6
  doc.text(`Mieter: ${formatPerson(data.mieter)}, ${formatAddress(data.mieterAdresse)}`, margin, y)
  y += 6
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 12

  // Beschreibung
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Geplante bauliche Änderung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.beschreibung) {
    const beschreibungLines = doc.splitTextToSize(data.beschreibung, pageWidth - 2 * margin)
    for (const line of beschreibungLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
  }
  y += 8

  // Begründung
  if (data.begruendung) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Begründung des Mieters', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const begruendungLines = doc.splitTextToSize(data.begruendung, pageWidth - 2 * margin)
    for (const line of begruendungLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 8
  }

  // Genehmigung Box
  checkPageBreak(30)
  if (data.genehmigt) {
    doc.setFillColor(220, 252, 231)
    doc.rect(margin, y, pageWidth - 2 * margin, 15, 'F')
    y += 10
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text('✓ Die bauliche Änderung wird hiermit GENEHMIGT', margin + 5, y)
  } else {
    doc.setFillColor(254, 226, 226)
    doc.rect(margin, y, pageWidth - 2 * margin, 15, 'F')
    y += 10
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text('✗ Die bauliche Änderung wird NICHT genehmigt', margin + 5, y)
  }
  doc.setTextColor(0)
  y += 15

  // Rückbau
  if (data.rueckbau) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Rückbauverpflichtung', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const rueckbauText = data.rueckbauDetails || 'Der Mieter verpflichtet sich, die bauliche Änderung bei Beendigung des Mietverhältnisses auf eigene Kosten zurückzubauen und den ursprünglichen Zustand wiederherzustellen.'
    const rueckbauLines = doc.splitTextToSize(rueckbauText, pageWidth - 2 * margin)
    for (const line of rueckbauLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 8
  }

  // Auflagen
  if (data.auflagen) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Auflagen und Bedingungen', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const auflagenLines = doc.splitTextToSize(data.auflagen, pageWidth - 2 * margin)
    for (const line of auflagenLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 8
  }

  // Hinweis
  checkPageBreak(25)
  doc.setFillColor(254, 243, 199)
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')
  y += 8
  doc.setFontSize(9)
  const hinweis = 'Hinweis: Diese Genehmigung bezieht sich ausschließlich auf das Mietverhältnis. Erforderliche behördliche Genehmigungen (z.B. Baugenehmigung) sind gesondert einzuholen.'
  const hinweisLines = doc.splitTextToSize(hinweis, pageWidth - 2 * margin - 10)
  for (const line of hinweisLines) {
    doc.text(line, margin + 5, y)
    y += 4
  }
  y += 15

  // Ort und Datum
  checkPageBreak(40)
  doc.setFontSize(10)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 80, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Unterschrift Vermieter', margin, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, 70, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Genehmigung baulicher Änderungen', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Bauliche_Aenderung_${formatAddress(data.mietobjektAdresse).replace(/[\s,]/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
