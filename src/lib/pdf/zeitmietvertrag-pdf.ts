import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  wohnflaeche: string
  zimmer?: string
  mietbeginn: string
  mietende: string
  befristungsgrund: 'eigenbedarf' | 'bauarbeiten' | 'mitarbeiter' | 'sonstige'
  befristungsgrundDetails: string
  kaltmiete: number | null
  nebenkosten: number | null
  kaution: number | null
  erstelltAm: string
  erstelltOrt: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
}

const BEFRISTUNGSGRUENDE: Record<string, string> = {
  eigenbedarf: 'Eigennutzung durch Vermieter oder Angehörige',
  bauarbeiten: 'Geplante Baumaßnahmen / Sanierung',
  mitarbeiter: 'Vermietung an Mitarbeiter',
  sonstige: 'Sonstiger berechtigter Grund',
}

export async function generateZeitmietvertragPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(245, 158, 11)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Zeitmietvertrag', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(Befristeter Wohnraummietvertrag gemäß § 575 BGB)', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Vertragsparteien
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Vertragsparteien', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Zwischen', margin, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text(formatPerson(data.vermieter), margin + 5, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.vermieterAdresse), margin + 5, y)
  y += 5
  doc.text('– nachfolgend „Vermieter" genannt –', margin, y)
  y += 8

  doc.text('und', margin, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text(formatPerson(data.mieter), margin + 5, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mieterAdresse), margin + 5, y)
  y += 5
  doc.text('– nachfolgend „Mieter" genannt –', margin, y)
  y += 10

  // Mietobjekt
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Mietobjekt', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const objText = `Der Vermieter vermietet dem Mieter folgende Wohnung: ${formatAddress(data.mietobjektAdresse)}`
  const objLines = doc.splitTextToSize(objText, pageWidth - 2 * margin)
  for (const line of objLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 3
  doc.text(`Wohnfläche: ca. ${data.wohnflaeche} m²`, margin, y)
  if (data.zimmer) doc.text(`Zimmer: ${data.zimmer}`, margin + 80, y)
  y += 10

  // Mietzeit & Befristung
  checkPageBreak(50)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 3 Mietzeit und Befristung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`(1) Das Mietverhältnis beginnt am ${formatDateStr(data.mietbeginn)} und endet am ${formatDateStr(data.mietende)},`, margin, y)
  y += 5
  doc.text('ohne dass es einer Kündigung bedarf.', margin + 5, y)
  y += 8

  // Befristungsgrund Box
  doc.setFillColor(255, 251, 235)
  const grundBoxHeight = 35
  doc.rect(margin, y, pageWidth - 2 * margin, grundBoxHeight, 'F')
  doc.setDrawColor(245, 158, 11)
  doc.rect(margin, y, pageWidth - 2 * margin, grundBoxHeight, 'S')
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('(2) Befristungsgrund gemäß § 575 Abs. 1 BGB:', margin + 3, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(BEFRISTUNGSGRUENDE[data.befristungsgrund] || data.befristungsgrund, margin + 3, y)
  y += 6

  if (data.befristungsgrundDetails) {
    const detailLines = doc.splitTextToSize(data.befristungsgrundDetails, pageWidth - 2 * margin - 6)
    for (let i = 0; i < Math.min(detailLines.length, 3); i++) {
      doc.text(detailLines[i], margin + 3, y)
      y += 4
    }
    if (detailLines.length > 3) {
      doc.text('[...]', margin + 3, y)
    }
  }
  y += 10

  // Rechtsbelehrung
  checkPageBreak(40)
  const rechtsText = '(3) Der Mieter kann vom Vermieter frühestens vier Monate vor Ablauf der Befristung ' +
    'Auskunft darüber verlangen, ob der Befristungsgrund noch besteht. Besteht der Grund nicht mehr, ' +
    'kann der Mieter eine Verlängerung des Mietverhältnisses auf unbestimmte Zeit verlangen (§ 575 Abs. 3 BGB). ' +
    'Das Verlangen muss spätestens zwei Monate vor Ablauf der Befristung erklärt werden.'

  const rechtsLines = doc.splitTextToSize(rechtsText, pageWidth - 2 * margin)
  for (const line of rechtsLines) {
    doc.text(line, margin, y)
    y += 4.5
  }
  y += 8

  // Miete
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 4 Miete', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Die monatliche Kaltmiete beträgt: ${data.kaltmiete ? formatCurrency(data.kaltmiete) : '—'}`, margin, y)
  y += 5
  doc.text(`Die monatliche Nebenkostenvorauszahlung beträgt: ${data.nebenkosten ? formatCurrency(data.nebenkosten) : '—'}`, margin, y)
  y += 5
  const gesamtmiete = (data.kaltmiete || 0) + (data.nebenkosten || 0)
  doc.setFont('helvetica', 'bold')
  doc.text(`Gesamtmiete: ${formatCurrency(gesamtmiete)}`, margin, y)
  doc.setFont('helvetica', 'normal')
  y += 10

  // Kaution
  checkPageBreak(15)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 5 Kaution', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.kaution) {
    doc.text(`Der Mieter zahlt eine Kaution in Höhe von ${formatCurrency(data.kaution)}.`, margin, y)
  } else {
    doc.text('Auf eine Kaution wird verzichtet.', margin, y)
  }
  y += 10

  // Kündigung
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 6 Vorzeitige Kündigung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const kuendText = 'Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt für beide Parteien ' +
    'unberührt. Eine ordentliche Kündigung ist während der Befristung ausgeschlossen.'
  const kuendLines = doc.splitTextToSize(kuendText, pageWidth - 2 * margin)
  for (const line of kuendLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 10

  // Unterschriften
  checkPageBreak(45)
  doc.setFontSize(10)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter', margin, y)
  doc.text('Mieter', pageWidth - margin - 70, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, 60, 20)
  }
  if (data.unterschriftMieter?.imageData) {
    doc.addImage(data.unterschriftMieter.imageData, 'PNG', pageWidth - margin - 70, y - 25, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Zeitmietvertrag (Qualifizierte Befristung) gemäß § 575 BGB', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Zeitmietvertrag_${formatPerson(data.mieter).replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
