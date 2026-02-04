import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  bewerber: { anrede: string; titel?: string; vorname: string; nachname: string; telefon?: string; email?: string }
  bewerberAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  beruf: string
  arbeitgeber: string
  monatlichesNettoeinkommen: number | null
  personenanzahl: string
  einzugstermin: string
  mietdauer: string
  motivation: string
  haustiere: string
  raucher: boolean
  musikinstrumente: boolean
  anlagen: string[]
  unterschriftBewerber?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const ANLAGEN_LABELS: Record<string, string> = {
  selbstauskunft: 'Mieterselbstauskunft',
  schufa: 'SCHUFA-Bonitätsauskunft',
  einkommensnachweis: 'Einkommensnachweise (letzte 3 Gehaltabrechnungen)',
  arbeitgeberbestaetigung: 'Arbeitgeberbescheinigung',
  mietschuldenfreiheit: 'Mietschuldenfreiheitsbescheinigung',
  personalausweis: 'Kopie Personalausweis',
}

export async function generateBewerbungsschreibenPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(99, 102, 241) // Indigo
  doc.rect(0, 0, pageWidth, 10, 'F')

  // Absender
  y = 18
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`${formatPerson(data.bewerber)} • ${formatAddress(data.bewerberAdresse)}`, margin, y)
  y += 3
  if (data.bewerber.telefon) {
    doc.text(`Tel: ${data.bewerber.telefon}`, margin, y)
  }
  if (data.bewerber.email) {
    doc.text(`E-Mail: ${data.bewerber.email}`, margin + 50, y)
  }
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
  doc.text('Bewerbung um die Mietwohnung', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Objekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
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
  const einleitung = `hiermit bewerbe ich mich um die oben genannte Mietwohnung. Gerne möchte ich mich Ihnen als zuverlässiger und solventer Mietinteressent vorstellen.`
  const einleitungLines = doc.splitTextToSize(einleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 6

  // Info-Box
  checkPageBreak(45)
  doc.setFillColor(238, 242, 255)
  doc.rect(margin, y, pageWidth - 2 * margin, 40, 'F')
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Kurzprofil:', margin + 5, y)
  y += 7
  doc.setFont('helvetica', 'normal')

  if (data.beruf) {
    doc.text(`Beruf: ${data.beruf}`, margin + 5, y)
    y += 5
  }
  if (data.arbeitgeber) {
    doc.text(`Arbeitgeber: ${data.arbeitgeber}`, margin + 5, y)
    y += 5
  }
  if (data.monatlichesNettoeinkommen) {
    doc.text(`Monatliches Nettoeinkommen: ${formatCurrency(data.monatlichesNettoeinkommen)}`, margin + 5, y)
    y += 5
  }
  if (data.personenanzahl) {
    doc.text(`Personen im Haushalt: ${data.personenanzahl}`, margin + 5, y)
    y += 5
  }
  if (data.einzugstermin) {
    doc.text(`Gewünschter Einzugstermin: ${formatDateStr(data.einzugstermin)}`, margin + 5, y)
    y += 5
  }
  y += 8

  // Motivation
  if (data.motivation) {
    checkPageBreak(30)
    doc.setFont('helvetica', 'bold')
    doc.text('Warum diese Wohnung?', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const motivationLines = doc.splitTextToSize(data.motivation, pageWidth - 2 * margin)
    for (const line of motivationLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 6
  }

  // Weitere Angaben
  checkPageBreak(30)
  const angaben: string[] = []
  if (data.haustiere) {
    angaben.push(`Haustiere: ${data.haustiere}`)
  } else {
    angaben.push('Keine Haustiere')
  }
  angaben.push(data.raucher ? 'Raucher' : 'Nichtraucher')
  if (data.musikinstrumente) {
    angaben.push('Spielt Musikinstrument')
  }
  if (data.mietdauer) {
    angaben.push(`Geplante Mietdauer: ${data.mietdauer}`)
  }

  if (angaben.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('Weitere Angaben:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    for (const angabe of angaben) {
      doc.text(`• ${angabe}`, margin + 5, y)
      y += 5
    }
    y += 6
  }

  // Anlagen
  if (data.anlagen.length > 0) {
    checkPageBreak(30)
    doc.setFont('helvetica', 'bold')
    doc.text('Anlagen:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    for (const anlage of data.anlagen) {
      if (ANLAGEN_LABELS[anlage]) {
        doc.text(`• ${ANLAGEN_LABELS[anlage]}`, margin + 5, y)
        y += 5
      }
    }
    y += 6
  }

  // Schluss
  checkPageBreak(40)
  const schluss = 'Über eine positive Rückmeldung und die Möglichkeit zur Besichtigung würde ich mich sehr freuen. Für Rückfragen stehe ich Ihnen gerne zur Verfügung.'
  const schlussLines = doc.splitTextToSize(schluss, pageWidth - 2 * margin)
  for (const line of schlussLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 20

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.bewerber), margin, y)

  if (data.unterschriftBewerber?.imageData) {
    doc.addImage(data.unterschriftBewerber.imageData, 'PNG', margin, y - 25, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Mieterbewerbung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Bewerbung_${formatPerson(data.bewerber).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
