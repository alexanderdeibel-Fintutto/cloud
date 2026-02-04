import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  einzugsdatum: string
  mietvertragVom?: string
  schluesselUebergeben: boolean
  zaehlerstaendeAbgelesen: boolean
  wohnungInOrdnung: boolean
  bemerkungen?: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

export async function generateEinzugsbestaetigungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(34, 197, 94)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Einzugsbestätigung', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Vermieter
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Vermieter:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.vermieter), margin, y)
  y += 4
  doc.text(formatAddress(data.vermieterAdresse), margin, y)
  y += 10

  // Mieter
  doc.setFont('helvetica', 'bold')
  doc.text('Mieter:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.mieter), margin, y)
  y += 10

  // Mietobjekt
  doc.setFont('helvetica', 'bold')
  doc.text('Mietobjekt:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mietobjektAdresse), margin, y)
  y += 5
  if (data.mietvertragVom) {
    doc.text(`Mietvertrag vom: ${formatDateStr(data.mietvertragVom)}`, margin, y)
    y += 5
  }
  y += 8

  // Bestätigungstext
  const bestaetigung = `Hiermit wird bestätigt, dass der Mieter ${formatPerson(data.mieter)} am ${formatDateStr(data.einzugsdatum)} in die oben genannte Mietwohnung eingezogen ist.`
  const bestaetigungLines = doc.splitTextToSize(bestaetigung, pageWidth - 2 * margin)
  for (const line of bestaetigungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 10

  // Bestätigungs-Box
  doc.setFillColor(240, 253, 244)
  doc.rect(margin, y, pageWidth - 2 * margin, 35, 'F')
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Folgendes wird bestätigt:', margin + 5, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const checkmark = data.schluesselUebergeben ? '☑' : '☐'
  doc.text(`${checkmark} Alle Schlüssel wurden übergeben`, margin + 5, y)
  y += 6

  const checkmark2 = data.zaehlerstaendeAbgelesen ? '☑' : '☐'
  doc.text(`${checkmark2} Die Zählerstände wurden gemeinsam abgelesen`, margin + 5, y)
  y += 6

  const checkmark3 = data.wohnungInOrdnung ? '☑' : '☐'
  doc.text(`${checkmark3} Die Wohnung befindet sich in ordnungsgemäßem Zustand`, margin + 5, y)
  y += 15

  // Bemerkungen
  if (data.bemerkungen) {
    doc.setFont('helvetica', 'bold')
    doc.text('Bemerkungen:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const bemerkungLines = doc.splitTextToSize(data.bemerkungen, pageWidth - 2 * margin)
    for (const line of bemerkungLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 8
  }

  // Ort und Datum
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschriften
  const signatureWidth = (pageWidth - 2 * margin - 20) / 2

  // Vermieter
  doc.setDrawColor(0)
  doc.line(margin, y, margin + signatureWidth, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter', margin, y)

  // Mieter
  doc.line(margin + signatureWidth + 20, y - 5, pageWidth - margin, y - 5)
  doc.text('Mieter', margin + signatureWidth + 20, y)

  // Signaturen
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
  doc.text('Einzugsbestätigung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Einzugsbestaetigung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.einzugsdatum).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
