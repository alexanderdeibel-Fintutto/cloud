import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  wohnflaeche?: string
  zimmer?: string
  mietbeginn: string
  mietende?: string
  unbefristet: boolean
  kaltmiete: number | null
  nebenkosten: number | null
  warmmiete: number | null
  verwendungszweck?: string
  unterschriftVermieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

export async function generateMietbescheinigungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Mietbescheinigung', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Verwendungszweck
  if (data.verwendungszweck) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Zur Vorlage bei: ${data.verwendungszweck}`, pageWidth / 2, y, { align: 'center' })
    y += 10
  }

  // Vermieter
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Vermieter / Hausverwaltung:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.vermieter), margin, y)
  y += 4
  doc.text(formatAddress(data.vermieterAdresse), margin, y)
  y += 12

  // Bestätigungstext
  doc.setFont('helvetica', 'normal')
  const bestaetigung = `Hiermit bestätige ich, dass`
  doc.text(bestaetigung, margin, y)
  y += 10

  // Mieter Box
  doc.setFillColor(239, 246, 255)
  doc.rect(margin, y, pageWidth - 2 * margin, 15, 'F')
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(formatPerson(data.mieter), pageWidth / 2, y, { align: 'center' })
  y += 15

  // Wohnungsdetails
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('folgende Wohnung gemietet hat:', margin, y)
  y += 10

  // Wohnungsinfo Box
  doc.setFillColor(249, 250, 251)
  doc.rect(margin, y, pageWidth - 2 * margin, 35, 'F')
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Mietobjekt:', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mietobjektAdresse), margin + 40, y)
  y += 7

  if (data.wohnflaeche || data.zimmer) {
    doc.setFont('helvetica', 'bold')
    doc.text('Wohnung:', margin + 5, y)
    doc.setFont('helvetica', 'normal')
    const details = []
    if (data.wohnflaeche) details.push(`${data.wohnflaeche} m²`)
    if (data.zimmer) details.push(`${data.zimmer} Zimmer`)
    doc.text(details.join(', '), margin + 40, y)
    y += 7
  }

  doc.setFont('helvetica', 'bold')
  doc.text('Mietbeginn:', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDateStr(data.mietbeginn), margin + 40, y)
  y += 7

  if (!data.unbefristet && data.mietende) {
    doc.setFont('helvetica', 'bold')
    doc.text('Mietende:', margin + 5, y)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDateStr(data.mietende), margin + 40, y)
  } else {
    doc.setFont('helvetica', 'bold')
    doc.text('Mietdauer:', margin + 5, y)
    doc.setFont('helvetica', 'normal')
    doc.text('unbefristet', margin + 40, y)
  }
  y += 15

  // Miethöhe
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Monatliche Miete:', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  if (data.kaltmiete) {
    doc.text('Kaltmiete (Nettomiete):', margin + 5, y)
    doc.text(formatCurrency(data.kaltmiete), margin + 80, y)
    y += 6
  }

  if (data.nebenkosten) {
    doc.text('Nebenkosten:', margin + 5, y)
    doc.text(formatCurrency(data.nebenkosten), margin + 80, y)
    y += 6
  }

  if (data.warmmiete) {
    doc.setDrawColor(0)
    doc.line(margin + 5, y, margin + 100, y)
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.text('Warmmiete (Gesamtmiete):', margin + 5, y)
    doc.text(formatCurrency(data.warmmiete), margin + 80, y)
    y += 12
  }

  // Bestätigung
  const schlusstext = 'Diese Bescheinigung wird nach bestem Wissen und Gewissen ausgestellt. ' +
    'Das Mietverhältnis besteht ordnungsgemäß.'
  const schlusstextLines = doc.splitTextToSize(schlusstext, pageWidth - 2 * margin)
  doc.setFont('helvetica', 'normal')
  for (const line of schlusstextLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 15

  // Datum und Unterschrift
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter / Hausverwaltung', margin, y)
  y += 4
  doc.text('(Unterschrift und ggf. Stempel)', margin, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 30, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Mietbescheinigung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Mietbescheinigung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
