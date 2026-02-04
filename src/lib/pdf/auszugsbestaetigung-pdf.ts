import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterNeueAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  auszugsdatum: string
  mietvertragVom?: string
  schluesselZurueckgegeben: boolean
  zaehlerstaendeAbgelesen: boolean
  wohnungGereinigt: boolean
  wohnungGeraumt: boolean
  kautionAbgerechnet: boolean
  maengel?: string
  bemerkungen?: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

export async function generateAuszugsbestaetigungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(249, 115, 22) // Orange
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Auszugsbestätigung', pageWidth / 2, y, { align: 'center' })
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
  y += 4
  doc.text(`Neue Adresse: ${formatAddress(data.mieterNeueAdresse)}`, margin, y)
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
  const bestaetigung = `Hiermit wird bestätigt, dass der Mieter ${formatPerson(data.mieter)} am ${formatDateStr(data.auszugsdatum)} aus der oben genannten Mietwohnung ausgezogen ist und das Mietverhältnis damit beendet wurde.`
  const bestaetigungLines = doc.splitTextToSize(bestaetigung, pageWidth - 2 * margin)
  for (const line of bestaetigungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Bestätigungs-Box
  checkPageBreak(50)
  doc.setFillColor(255, 247, 237) // Orange light
  doc.rect(margin, y, pageWidth - 2 * margin, 45, 'F')
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Folgendes wird bestätigt:', margin + 5, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const items = [
    { checked: data.schluesselZurueckgegeben, text: 'Alle Schlüssel wurden zurückgegeben' },
    { checked: data.zaehlerstaendeAbgelesen, text: 'Die Zählerstände wurden gemeinsam abgelesen' },
    { checked: data.wohnungGereinigt, text: 'Die Wohnung wurde besenrein übergeben' },
    { checked: data.wohnungGeraumt, text: 'Die Wohnung wurde vollständig geräumt' },
    { checked: data.kautionAbgerechnet, text: 'Die Kautionsabrechnung erfolgt separat' },
  ]

  for (const item of items) {
    const checkmark = item.checked ? '☑' : '☐'
    doc.text(`${checkmark} ${item.text}`, margin + 5, y)
    y += 6
  }
  y += 10

  // Mängel
  if (data.maengel) {
    checkPageBreak(25)
    doc.setFont('helvetica', 'bold')
    doc.text('Festgestellte Mängel:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const maengelLines = doc.splitTextToSize(data.maengel, pageWidth - 2 * margin)
    for (const line of maengelLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Bemerkungen
  if (data.bemerkungen) {
    checkPageBreak(25)
    doc.setFont('helvetica', 'bold')
    doc.text('Sonstige Bemerkungen:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const bemerkungLines = doc.splitTextToSize(data.bemerkungen, pageWidth - 2 * margin)
    for (const line of bemerkungLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Ort und Datum
  checkPageBreak(35)
  y += 5
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
  doc.text('Auszugsbestätigung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Auszugsbestaetigung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.auszugsdatum).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
