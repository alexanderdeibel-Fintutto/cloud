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
  bisherigeBetriebskosten: number | null
  neueBetriebskosten: number | null
  aenderungAb: string
  begruendung?: string
  differenz: number | null
  erstelltAm: string
}

export async function generateBetriebskostenvorauszahlungPDF(data: PDFData): Promise<void> {
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

  // Header
  doc.setFillColor(6, 182, 212) // Cyan
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

  // Datum
  doc.text(formatDateStr(data.erstelltAm), pageWidth - margin, y, { align: 'right' })
  y += 10

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.text('Anpassung der Betriebskostenvorauszahlung gemäß § 560 Abs. 4 BGB', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  if (data.mietvertragVom) {
    y += 4
    doc.text(`Mietvertrag vom: ${formatDateStr(data.mietvertragVom)}`, margin, y)
  }
  y += 12

  // Anrede
  doc.text(getAnrede(data.mieter) + ',', margin, y)
  y += 8

  // Einleitung
  const einleitung = 'nach Durchführung der Betriebskostenabrechnung ergibt sich die Notwendigkeit einer Anpassung der monatlichen Betriebskostenvorauszahlung gemäß § 560 Abs. 4 BGB.'
  const einleitungLines = doc.splitTextToSize(einleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Anpassungs-Box
  doc.setFillColor(236, 254, 255)
  doc.rect(margin, y, pageWidth - 2 * margin, 30, 'F')
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Anpassung der Betriebskostenvorauszahlung', margin + 5, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Bisherige monatliche Vorauszahlung:', margin + 5, y)
  doc.text(formatCurrency(data.bisherigeBetriebskosten || 0), margin + 100, y)
  y += 6

  doc.text('Neue monatliche Vorauszahlung:', margin + 5, y)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(data.neueBetriebskosten || 0), margin + 100, y)
  y += 15

  // Differenz
  if (data.differenz !== null) {
    doc.setFont('helvetica', 'normal')
    const diffText = data.differenz >= 0 ? 'Erhöhung' : 'Reduzierung'
    doc.text(`${diffText}: ${formatCurrency(Math.abs(data.differenz))} monatlich`, margin, y)
    y += 8
  }

  // Wirksamkeitsdatum
  doc.text(`Die neue Vorauszahlung gilt ab dem ${formatDateStr(data.aenderungAb)}.`, margin, y)
  y += 10

  // Begründung
  if (data.begruendung) {
    doc.setFont('helvetica', 'bold')
    doc.text('Begründung:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const begruendungLines = doc.splitTextToSize(data.begruendung, pageWidth - 2 * margin)
    for (const line of begruendungLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Hinweis
  y += 5
  doc.setFontSize(9)
  doc.setTextColor(100)
  const hinweis = 'Hinweis: Gemäß § 560 Abs. 4 BGB kann jede Vertragspartei nach einer Abrechnung durch Erklärung in Textform eine Anpassung auf eine angemessene Höhe vornehmen.'
  const hinweisLines = doc.splitTextToSize(hinweis, pageWidth - 2 * margin)
  for (const line of hinweisLines) {
    doc.text(line, margin, y)
    y += 4
  }
  y += 8

  // Schluss
  doc.setFontSize(10)
  doc.setTextColor(0)
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
  doc.text('Anpassung der Betriebskostenvorauszahlung gemäß § 560 Abs. 4 BGB', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Betriebskostenvorauszahlung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
