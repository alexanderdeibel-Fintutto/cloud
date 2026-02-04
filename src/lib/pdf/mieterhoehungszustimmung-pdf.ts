import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieterhoehungVom: string
  bisherigeMiete: number | null
  neueMiete: number | null
  gueltigAb: string
  zustimmungErteilt: boolean
  unterschriftMieter?: { imageData: string | null }
  differenz: number | null
  erstelltAm: string
  erstelltOrt: string
}

export async function generateMieterhoehungszustimmungPDF(data: PDFData): Promise<void> {
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

  // Header
  doc.setFillColor(34, 197, 94) // Green
  doc.rect(0, 0, pageWidth, 10, 'F')

  // Absender
  y = 18
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`${formatPerson(data.mieter)} • ${formatAddress(data.mieterAdresse)}`, margin, y)
  y += 10

  // Empfänger
  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text(formatPerson(data.vermieter), margin, y)
  y += 5
  doc.text(formatAddress(data.vermieterAdresse), margin, y)
  y += 12

  // Datum
  doc.text(formatDateStr(data.erstelltAm), pageWidth - margin, y, { align: 'right' })
  y += 10

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.text('Zustimmung zur Mieterhöhung', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 4
  doc.text(`Bezug: Ihr Schreiben vom ${formatDateStr(data.mieterhoehungVom)}`, margin, y)
  y += 12

  // Anrede
  const getAnrede = (p: { anrede: string; titel?: string; nachname: string }) => {
    if (p.anrede === 'Frau') return `Sehr geehrte Frau ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    if (p.anrede === 'Herr') return `Sehr geehrter Herr ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    return 'Sehr geehrte Damen und Herren'
  }
  doc.text(getAnrede(data.vermieter) + ',', margin, y)
  y += 8

  // Einleitung
  const einleitung = `hiermit erkläre ich meine Zustimmung zu der von Ihnen mit Schreiben vom ${formatDateStr(data.mieterhoehungVom)} verlangten Mieterhöhung.`
  const einleitungLines = doc.splitTextToSize(einleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Zustimmungs-Box
  doc.setFillColor(240, 253, 244)
  doc.rect(margin, y, pageWidth - 2 * margin, 35, 'F')
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Bestätigung der Mieterhöhung:', margin + 5, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Bisherige Kaltmiete:`, margin + 5, y)
  doc.text(formatCurrency(data.bisherigeMiete || 0), margin + 80, y)
  y += 6

  doc.text(`Neue Kaltmiete:`, margin + 5, y)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(data.neueMiete || 0), margin + 80, y)
  doc.setFont('helvetica', 'normal')
  y += 6

  if (data.differenz !== null) {
    doc.text(`Erhöhung:`, margin + 5, y)
    doc.text(formatCurrency(data.differenz), margin + 80, y)
  }
  y += 15

  // Gültigkeitsdatum
  doc.text(`Die neue Miete werde ich ab dem ${formatDateStr(data.gueltigAb)} zahlen.`, margin, y)
  y += 15

  // Zustimmungserklärung
  doc.setFillColor(254, 252, 232)
  doc.rect(margin, y, pageWidth - 2 * margin, 12, 'F')
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('☑ Ich stimme der Mieterhöhung ausdrücklich zu.', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  y += 15

  // Schlussformel
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 20

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Unterschrift des Mieters', margin, y)
  y += 4
  doc.text(formatPerson(data.mieter), margin, y)

  if (data.unterschriftMieter?.imageData) {
    doc.addImage(data.unterschriftMieter.imageData, 'PNG', margin, y - 29, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Zustimmungserklärung zur Mieterhöhung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Mieterhoehungszustimmung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
