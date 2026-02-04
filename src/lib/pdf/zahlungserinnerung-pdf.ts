import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  faelligkeitsdatum: string
  offenerBetrag: number | null
  monat: string
  rechnungsnummer?: string
  zahlungsziel: string
  bankverbindung?: string
  zusaetzlicherHinweis?: string
  erstelltAm: string
}

export async function generateZahlungserinnerungPDF(data: PDFData): Promise<void> {
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

  const getAnrede = (p: { anrede: string; titel?: string; nachname: string }) => {
    if (p.anrede === 'Frau') return `Sehr geehrte Frau ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    if (p.anrede === 'Herr') return `Sehr geehrter Herr ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    return 'Sehr geehrte Damen und Herren'
  }

  // Header - Gelb für Erinnerung (freundlich)
  doc.setFillColor(250, 204, 21)
  doc.rect(0, 0, pageWidth, 10, 'F')

  // Absender
  y = 18
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`${formatPerson(data.vermieter)} • ${formatAddress(data.vermieterAdresse)}`, margin, y)
  y += 10

  // Empfänger
  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text(formatPerson(data.mieter), margin, y)
  y += 5
  doc.text(formatAddress(data.mietobjektAdresse), margin, y)
  y += 12

  // Datum rechtsbündig
  doc.text(`${formatDateStr(data.erstelltAm)}`, pageWidth - margin, y, { align: 'right' })
  y += 12

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Freundliche Zahlungserinnerung', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Miete ${data.monat} – ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  if (data.rechnungsnummer) {
    y += 5
    doc.text(`Rechnungsnummer: ${data.rechnungsnummer}`, margin, y)
  }
  y += 12

  // Anrede
  doc.text(getAnrede(data.mieter) + ',', margin, y)
  y += 8

  // Text
  const text1 = `bei der Prüfung unserer Unterlagen haben wir festgestellt, dass die Miete für ${data.monat} noch nicht auf unserem Konto eingegangen ist.`
  const text1Lines = doc.splitTextToSize(text1, pageWidth - 2 * margin)
  for (const line of text1Lines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Betrag-Box
  doc.setFillColor(254, 249, 195)
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Offener Betrag:', margin + 5, y)
  doc.text(formatCurrency(data.offenerBetrag || 0), margin + 100, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text('Fällig seit:', margin + 5, y)
  doc.text(formatDateStr(data.faelligkeitsdatum), margin + 100, y)
  y += 14

  // Bitte um Zahlung
  const zahlungszielDatum = data.erstelltAm
    ? format(addDays(new Date(data.erstelltAm), parseInt(data.zahlungsziel) || 7), 'dd.MM.yyyy', { locale: de })
    : '—'

  const text2 = `Wir bitten Sie höflich, den ausstehenden Betrag bis zum ${zahlungszielDatum} auf unser Konto zu überweisen.`
  const text2Lines = doc.splitTextToSize(text2, pageWidth - 2 * margin)
  for (const line of text2Lines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Falls bereits überwiesen
  const text3 = 'Sollte sich diese Erinnerung mit Ihrer Zahlung überschneiden, betrachten Sie dieses Schreiben bitte als gegenstandslos.'
  const text3Lines = doc.splitTextToSize(text3, pageWidth - 2 * margin)
  for (const line of text3Lines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Bankverbindung
  if (data.bankverbindung) {
    doc.setFont('helvetica', 'bold')
    doc.text('Bankverbindung:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const bankLines = data.bankverbindung.split('\n')
    for (const line of bankLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Zusätzlicher Hinweis
  if (data.zusaetzlicherHinweis) {
    const hinweisLines = doc.splitTextToSize(data.zusaetzlicherHinweis, pageWidth - 2 * margin)
    for (const line of hinweisLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Kontakt
  const kontaktText = 'Bei Fragen stehe ich Ihnen gerne zur Verfügung.'
  doc.text(kontaktText, margin, y)
  y += 10

  // Grußformel
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 15

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 60, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.vermieter), margin, y)

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Zahlungserinnerung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Zahlungserinnerung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${data.monat.replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
