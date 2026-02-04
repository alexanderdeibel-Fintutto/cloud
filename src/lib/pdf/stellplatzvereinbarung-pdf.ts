import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  stellplatzAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  stellplatzNr?: string
  stellplatzArt: string
  kfzKennzeichen?: string
  mietbeginn: string
  mietdauer: string
  befristetBis?: string
  monatlicheMiete: number | null
  zahlungsweise: string
  kaution: number | null
  nutzungsbedingungen: string[]
  sonstigeVereinbarungen?: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const STELLPLATZ_LABELS: Record<string, string> = {
  aussen: 'Außenstellplatz',
  tiefgarage: 'Tiefgaragenstellplatz',
  garage: 'Einzelgarage',
  carport: 'Carport',
  duplex: 'Duplex-/Stapelparker',
}

const BEDINGUNGEN_LABELS: Record<string, string> = {
  keinwaschen: 'Fahrzeugwäsche auf dem Stellplatz ist nicht gestattet.',
  keinereparatur: 'Reparaturarbeiten am Fahrzeug sind nicht gestattet.',
  keinlagern: 'Die Lagerung von Gegenständen ist nicht gestattet.',
  reinigung: 'Der Stellplatz ist sauber zu halten.',
  oelspur: 'Ölspuren sind unverzüglich zu beseitigen.',
}

const ZAHLUNGSWEISE_LABELS: Record<string, string> = {
  monatlich: 'monatlich im Voraus',
  vierteljaehrlich: 'vierteljährlich im Voraus',
  jaehrlich: 'jährlich im Voraus',
}

export async function generateStellplatzvereinbarungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(100, 116, 139) // Slate
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Stellplatzmietvertrag', pageWidth / 2, y, { align: 'center' })
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
  doc.text(formatPerson(data.mieter), margin, y)
  y += 5
  doc.text('- im Folgenden "Mieter" genannt -', margin, y)
  y += 12

  // § 1 Mietgegenstand
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Mietgegenstand', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Stellplatzart: ${STELLPLATZ_LABELS[data.stellplatzArt] || data.stellplatzArt}`, margin, y)
  y += 5
  doc.text(`Standort: ${formatAddress(data.stellplatzAdresse)}`, margin, y)
  y += 5
  if (data.stellplatzNr) {
    doc.text(`Stellplatznummer: ${data.stellplatzNr}`, margin, y)
    y += 5
  }
  if (data.kfzKennzeichen) {
    doc.text(`KFZ-Kennzeichen: ${data.kfzKennzeichen}`, margin, y)
    y += 5
  }
  y += 8

  // § 2 Mietzeit
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Mietzeit', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Das Mietverhältnis beginnt am ${formatDateStr(data.mietbeginn)}.`, margin, y)
  y += 5

  if (data.mietdauer === 'unbefristet') {
    doc.text('Das Mietverhältnis wird auf unbestimmte Zeit geschlossen.', margin, y)
    y += 5
    doc.text('Es kann von beiden Parteien mit einer Frist von 3 Monaten zum Monatsende gekündigt werden.', margin, y)
  } else if (data.befristetBis) {
    doc.text(`Das Mietverhältnis ist befristet bis zum ${formatDateStr(data.befristetBis)}.`, margin, y)
  }
  y += 10

  // § 3 Miete
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 3 Miete', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Die monatliche Miete beträgt ${formatCurrency(data.monatlicheMiete || 0)}.`, margin, y)
  y += 5
  doc.text(`Die Miete ist ${ZAHLUNGSWEISE_LABELS[data.zahlungsweise] || 'monatlich'} zu zahlen.`, margin, y)
  y += 5

  if (data.kaution) {
    doc.text(`Der Mieter zahlt eine Kaution in Höhe von ${formatCurrency(data.kaution)}.`, margin, y)
    y += 5
  }
  y += 8

  // § 4 Nutzungsbedingungen
  if (data.nutzungsbedingungen.length > 0) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 4 Nutzungsbedingungen', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    for (const bedingung of data.nutzungsbedingungen) {
      if (BEDINGUNGEN_LABELS[bedingung]) {
        checkPageBreak(6)
        doc.text(`• ${BEDINGUNGEN_LABELS[bedingung]}`, margin, y)
        y += 5
      }
    }
    y += 5
  }

  // § 5 Sonstige Vereinbarungen
  if (data.sonstigeVereinbarungen) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 5 Sonstige Vereinbarungen', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const sonstigeLines = doc.splitTextToSize(data.sonstigeVereinbarungen, pageWidth - 2 * margin)
    for (const line of sonstigeLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Schlussbestimmung
  checkPageBreak(35)
  doc.setFontSize(10)
  const schluss = 'Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Beide Parteien haben je eine Ausfertigung dieses Vertrages erhalten.'
  const schlussLines = doc.splitTextToSize(schluss, pageWidth - 2 * margin)
  for (const line of schlussLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 10

  // Ort und Datum
  checkPageBreak(40)
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
  doc.text('Stellplatzmietvertrag', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Stellplatzvertrag_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
