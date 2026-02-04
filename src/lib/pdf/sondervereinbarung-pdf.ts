import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietvertragVom: string
  betreff: string
  vereinbarung: string
  gueltigAb: string
  befristet: boolean
  befristetBis: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

export async function generateSondervereinbarungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(139, 92, 246) // Purple
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Sondervereinbarung zum Mietvertrag', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Parteien
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Zwischen', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`${formatPerson(data.vermieter)}, ${formatAddress(data.vermieterAdresse)}`, margin, y)
  y += 5
  doc.text('- im Folgenden "Vermieter" genannt -', margin, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('und', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`${formatPerson(data.mieter)}, ${formatAddress(data.mieterAdresse)}`, margin, y)
  y += 5
  doc.text('- im Folgenden "Mieter" genannt -', margin, y)
  y += 10

  // Bezug
  doc.setFillColor(243, 232, 255)
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')
  y += 6
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin + 5, y)
  y += 5
  doc.text(`Bezug: Mietvertrag vom ${formatDateStr(data.mietvertragVom)}`, margin + 5, y)
  y += 15

  // Betreff
  if (data.betreff) {
    checkPageBreak(15)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`Betreff: ${data.betreff}`, margin, y)
    y += 10
  }

  // Vereinbarung
  checkPageBreak(50)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Vereinbarung', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const einleitung = 'Die Parteien vereinbaren in Ergänzung zum oben genannten Mietvertrag Folgendes:'
  doc.text(einleitung, margin, y)
  y += 10

  if (data.vereinbarung) {
    const vereinbarungLines = doc.splitTextToSize(data.vereinbarung, pageWidth - 2 * margin)
    for (const line of vereinbarungLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
  }
  y += 10

  // Gültigkeit
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Gültigkeit', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.gueltigAb) {
    doc.text(`Diese Vereinbarung tritt am ${formatDateStr(data.gueltigAb)} in Kraft.`, margin, y)
    y += 5
  }
  if (data.befristet && data.befristetBis) {
    doc.text(`Sie ist befristet bis zum ${formatDateStr(data.befristetBis)}.`, margin, y)
    y += 5
  } else {
    doc.text('Sie gilt für die Dauer des Mietverhältnisses.', margin, y)
    y += 5
  }
  y += 8

  // Schlussbestimmungen
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Schlussbestimmungen', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const schluss = 'Alle übrigen Bestimmungen des Mietvertrages bleiben unberührt. Diese Vereinbarung wird Bestandteil des Mietvertrages. Änderungen und Ergänzungen bedürfen der Schriftform.'
  const schlussLines = doc.splitTextToSize(schluss, pageWidth - 2 * margin)
  for (const line of schlussLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 10

  // Ort und Datum
  checkPageBreak(45)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschriften
  const signatureWidth = (pageWidth - 2 * margin - 20) / 2

  doc.setDrawColor(0)
  doc.line(margin, y, margin + signatureWidth, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter', margin, y)

  doc.line(margin + signatureWidth + 20, y - 5, pageWidth - margin, y - 5)
  doc.text('Mieter', margin + signatureWidth + 20, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, signatureWidth - 10, 20)
  }
  if (data.unterschriftMieter?.imageData) {
    doc.addImage(data.unterschriftMieter.imageData, 'PNG', margin + signatureWidth + 20, y - 25, signatureWidth - 10, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Sondervereinbarung zum Mietvertrag', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Sondervereinbarung_${formatAddress(data.mietobjektAdresse).replace(/[\s,]/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
