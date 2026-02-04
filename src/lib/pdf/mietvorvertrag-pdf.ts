import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  wohnungsgroesse: string
  zimmeranzahl: string
  geplanterMietbeginn: string
  kaltmiete: number | null
  nebenkosten: number | null
  kaution: number | null
  reservierungsgebuehr: number | null
  bindungsfrist: string
  ruecktrittsrecht: boolean
  bedingungen: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

export async function generateMietvorvertragPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Mietvorvertrag / Reservierungsvereinbarung', pageWidth / 2, y, { align: 'center' })
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
  doc.text('- im Folgenden "Mietinteressent" genannt -', margin, y)
  y += 12

  // § 1 Mietobjekt
  checkPageBreak(35)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Mietobjekt', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Adresse: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 5
  if (data.wohnungsgroesse) {
    doc.text(`Wohnfläche: ca. ${data.wohnungsgroesse} m²`, margin, y)
    y += 5
  }
  if (data.zimmeranzahl) {
    doc.text(`Zimmer: ${data.zimmeranzahl}`, margin, y)
    y += 5
  }
  y += 5

  // § 2 Vereinbarung
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Gegenstand der Vereinbarung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const vereinbarung = `Der Vermieter reserviert das oben genannte Mietobjekt für den Mietinteressenten. Beide Parteien verpflichten sich, zum geplanten Mietbeginn (${formatDateStr(data.geplanterMietbeginn)}) einen Mietvertrag abzuschließen.`
  const vereinbarungLines = doc.splitTextToSize(vereinbarung, pageWidth - 2 * margin)
  for (const line of vereinbarungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // § 3 Konditionen
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 3 Geplante Mietkonditionen', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  doc.setFillColor(239, 246, 255)
  doc.rect(margin, y, pageWidth - 2 * margin, 30, 'F')
  y += 6

  doc.text('Kaltmiete:', margin + 5, y)
  doc.text(formatCurrency(data.kaltmiete || 0), margin + 60, y)
  y += 6

  doc.text('Nebenkosten:', margin + 5, y)
  doc.text(formatCurrency(data.nebenkosten || 0), margin + 60, y)
  y += 6

  doc.text('Gesamtmiete:', margin + 5, y)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency((data.kaltmiete || 0) + (data.nebenkosten || 0)), margin + 60, y)
  doc.setFont('helvetica', 'normal')
  y += 6

  doc.text('Kaution:', margin + 5, y)
  doc.text(formatCurrency(data.kaution || 0), margin + 60, y)
  y += 12

  // § 4 Reservierungsgebühr
  if (data.reservierungsgebuehr && data.reservierungsgebuehr > 0) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 4 Reservierungsgebühr', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const gebuehr = `Der Mietinteressent zahlt eine Reservierungsgebühr von ${formatCurrency(data.reservierungsgebuehr)}. Diese wird bei Abschluss des Mietvertrags auf die Kaution angerechnet.`
    const gebuehrLines = doc.splitTextToSize(gebuehr, pageWidth - 2 * margin)
    for (const line of gebuehrLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 8
  }

  // § 5 Bindungsfrist
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 5 Bindungsfrist', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Diese Vereinbarung ist für beide Parteien bindend bis: ${data.bindungsfrist || '—'}`, margin, y)
  y += 8

  // Rücktrittsrecht
  if (data.ruecktrittsrecht) {
    checkPageBreak(20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 6 Rücktrittsrecht', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const ruecktritt = 'Beide Parteien können bis zum Ende der Bindungsfrist ohne Angabe von Gründen zurücktreten. Bei Rücktritt durch den Mietinteressenten verfällt eine etwaige Reservierungsgebühr.'
    const ruecktrittLines = doc.splitTextToSize(ruecktritt, pageWidth - 2 * margin)
    for (const line of ruecktrittLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 8
  }

  // Bedingungen
  if (data.bedingungen) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Weitere Bedingungen', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const bedingungLines = doc.splitTextToSize(data.bedingungen, pageWidth - 2 * margin)
    for (const line of bedingungLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Hinweis
  checkPageBreak(20)
  doc.setFillColor(254, 243, 199)
  doc.rect(margin, y, pageWidth - 2 * margin, 15, 'F')
  y += 8
  doc.setFontSize(9)
  const hinweis = 'Hinweis: Diese Vereinbarung ersetzt nicht den eigentlichen Mietvertrag. Der Mietvertrag ist gesondert abzuschließen.'
  doc.text(hinweis, margin + 5, y)
  y += 15

  // Ort und Datum
  checkPageBreak(45)
  doc.setFontSize(10)
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
  doc.text('Mietinteressent', margin + signatureWidth + 20, y)

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
  doc.text('Mietvorvertrag / Reservierungsvereinbarung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Mietvorvertrag_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
