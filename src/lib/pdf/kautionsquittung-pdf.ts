import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietvertragVom?: string
  kautionsbetrag: number | null
  zahlungsart: string
  bankverbindung?: string
  verwendungszweck?: string
  bemerkungen?: string
  unterschriftVermieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const ZAHLUNGSART_LABELS: Record<string, string> = {
  ueberweisung: 'Banküberweisung',
  bar: 'Barzahlung',
  scheck: 'Scheck',
  buergschaft: 'Bankbürgschaft / Kautionsversicherung',
}

export async function generateKautionsquittungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(139, 92, 246) // Violet
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('QUITTUNG', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('über den Erhalt der Mietkaution', pageWidth / 2, y, { align: 'center' })
  y += 15

  // Betrag-Box
  doc.setFillColor(245, 243, 255)
  doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F')
  y += 10

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Erhaltener Betrag:', margin + 5, y)
  doc.setFontSize(18)
  doc.text(formatCurrency(data.kautionsbetrag || 0), pageWidth - margin - 5, y, { align: 'right' })
  y += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Zahlungsart: ${ZAHLUNGSART_LABELS[data.zahlungsart] || data.zahlungsart}`, margin + 5, y)
  y += 15

  // Vermieter (Empfänger)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Kautionsempfänger (Vermieter):', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.vermieter), margin, y)
  y += 4
  doc.text(formatAddress(data.vermieterAdresse), margin, y)
  y += 10

  // Mieter (Zahler)
  doc.setFont('helvetica', 'bold')
  doc.text('Kautionszahler (Mieter):', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.mieter), margin, y)
  y += 10

  // Mietobjekt
  doc.setFont('helvetica', 'bold')
  doc.text('Betreffendes Mietobjekt:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mietobjektAdresse), margin, y)
  y += 5
  if (data.mietvertragVom) {
    doc.text(`Mietvertrag vom: ${formatDateStr(data.mietvertragVom)}`, margin, y)
    y += 5
  }
  y += 10

  // Bestätigungstext
  const bestaetigung = `Hiermit bestätige ich, ${formatPerson(data.vermieter)}, den Erhalt der Mietkaution in Höhe von ${formatCurrency(data.kautionsbetrag || 0)} von ${formatPerson(data.mieter)}.`
  const bestaetigungLines = doc.splitTextToSize(bestaetigung, pageWidth - 2 * margin)
  for (const line of bestaetigungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Details
  if (data.bankverbindung || data.verwendungszweck) {
    doc.setFont('helvetica', 'bold')
    doc.text('Zahlungsdetails:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')

    if (data.verwendungszweck) {
      doc.text(`Verwendungszweck: ${data.verwendungszweck}`, margin, y)
      y += 5
    }

    if (data.bankverbindung) {
      doc.text('Kautionskonto:', margin, y)
      y += 5
      const bankLines = data.bankverbindung.split('\n')
      for (const line of bankLines) {
        doc.text(line, margin + 5, y)
        y += 4
      }
    }
    y += 5
  }

  // Hinweis zur Anlage
  doc.setFontSize(9)
  doc.setTextColor(100)
  const anlageHinweis = 'Hinweis: Die Kaution wird gemäß § 551 BGB getrennt vom Vermögen des Vermieters bei einem Kreditinstitut zu dem für Spareinlagen mit dreimonatiger Kündigungsfrist üblichen Zinssatz angelegt. Die Zinsen stehen dem Mieter zu.'
  const anlageLines = doc.splitTextToSize(anlageHinweis, pageWidth - 2 * margin)
  for (const line of anlageLines) {
    doc.text(line, margin, y)
    y += 4
  }
  y += 8

  // Bemerkungen
  if (data.bemerkungen) {
    doc.setFontSize(10)
    doc.setTextColor(0)
    doc.setFont('helvetica', 'bold')
    doc.text('Bemerkungen:', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    const bemerkungLines = doc.splitTextToSize(data.bemerkungen, pageWidth - 2 * margin)
    for (const line of bemerkungLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Ort und Datum
  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Unterschrift Vermieter / Kautionsempfänger', margin, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Kautionsquittung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Kautionsquittung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
