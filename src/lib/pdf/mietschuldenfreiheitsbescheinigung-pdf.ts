import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietverhaeltnisVon: string
  mietverhaeltnisBis?: string
  mietverhaeltnisLaufend: boolean
  keineMietrueckstaende: boolean
  keineNebenkostenrueckstaende: boolean
  keineSchaeden: boolean
  bemerkungen?: string
  ausstellungsdatum: string
  ausstellungsort: string
  unterschriftVermieter?: { imageData: string | null; signerName: string; signedAt: string | null }
}

export async function generateMietschuldenfreiheitsbescheinigungPDF(data: PDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
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

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Mietschuldenfreiheitsbescheinigung', pageWidth / 2, y, { align: 'center' })
  y += 15

  // Vermieter-Daten (Absender)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.vermieter), margin, y)
  y += 5
  doc.text(formatAddress(data.vermieterAdresse), margin, y)
  y += 12

  // Mieter-Daten (Empfänger)
  doc.setFont('helvetica', 'bold')
  doc.text(formatPerson(data.mieter), margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mieterAdresse), margin, y)
  y += 15

  // Datum rechtsbündig
  doc.text(`${data.ausstellungsort}, den ${formatDateStr(data.ausstellungsdatum)}`, pageWidth - margin, y, { align: 'right' })
  y += 12

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.text('Mietschuldenfreiheitsbescheinigung', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 10

  // Text
  doc.setFontSize(10)
  const zeitraum = data.mietverhaeltnisLaufend
    ? `seit dem ${formatDateStr(data.mietverhaeltnisVon)} (laufend)`
    : `vom ${formatDateStr(data.mietverhaeltnisVon)} bis zum ${formatDateStr(data.mietverhaeltnisBis || '')}`

  const text1 = `Hiermit bestätige ich als Vermieter/in, dass ${formatPerson(data.mieter)} das oben genannte Mietobjekt ${zeitraum} bewohnt hat bzw. bewohnt.`

  const lines1 = doc.splitTextToSize(text1, pageWidth - 2 * margin)
  for (const line of lines1) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Bestätigungen
  doc.text('Es wird bestätigt, dass:', margin, y)
  y += 8

  const checkboxSize = 4

  // Keine Mietrückstände
  doc.rect(margin, y - 3, checkboxSize, checkboxSize)
  if (data.keineMietrueckstaende) {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.8, y)
    doc.setFont('helvetica', 'normal')
  }
  doc.text('Keine Mietrückstände bestehen.', margin + 8, y)
  y += 7

  // Keine Nebenkostenrückstände
  doc.rect(margin, y - 3, checkboxSize, checkboxSize)
  if (data.keineNebenkostenrueckstaende) {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.8, y)
    doc.setFont('helvetica', 'normal')
  }
  doc.text('Keine Rückstände aus Betriebskostenabrechnungen bestehen.', margin + 8, y)
  y += 7

  // Keine Schäden
  doc.rect(margin, y - 3, checkboxSize, checkboxSize)
  if (data.keineSchaeden) {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.8, y)
    doc.setFont('helvetica', 'normal')
  }
  doc.text('Keine offenen Schadensersatzforderungen bekannt sind.', margin + 8, y)
  y += 10

  // Bemerkungen
  if (data.bemerkungen) {
    doc.setFont('helvetica', 'bold')
    doc.text('Bemerkungen:', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    const bemLines = doc.splitTextToSize(data.bemerkungen, pageWidth - 2 * margin)
    for (const line of bemLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Schlusstext
  y += 5
  doc.text('Diese Bescheinigung wird auf Wunsch des/der Mieter/in ausgestellt und dient', margin, y)
  y += 5
  doc.text('der Vorlage bei einem neuen Vermieter.', margin, y)
  y += 15

  // Grußformel
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 20

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text('(Unterschrift Vermieter/in)', margin, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, 60, 20)
  }

  y += 3
  doc.text(formatPerson(data.vermieter), margin, y)

  // Hinweis unten
  y = doc.internal.pageSize.getHeight() - 20
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Hinweis: Diese Bescheinigung ist freiwillig. Ein gesetzlicher Anspruch auf Ausstellung besteht nicht.', margin, y)

  // Speichern
  const filename = `Mietschuldenfreiheitsbescheinigung_${formatPerson(data.mieter).replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
