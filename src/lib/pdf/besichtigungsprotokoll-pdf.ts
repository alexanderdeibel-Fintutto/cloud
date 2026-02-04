import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Teilnehmer {
  id: string
  name: string
  rolle: string
}

interface PDFData {
  objektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  besichtigungsdatum: string
  besichtigungsuhrzeit?: string
  teilnehmer: Teilnehmer[]
  wohnungsgroesse?: string
  zimmeranzahl?: string
  etage?: string
  kaltmiete: number | null
  nebenkosten: number | null
  kaution: number | null
  verfuegbarAb?: string
  allgemeinesBild?: string
  zustandKueche?: string
  zustandBad?: string
  zustandBoeden?: string
  zustandWaende?: string
  zustandFenster?: string
  besonderheiten?: string
  interesse?: string
  fragen?: string
  erstelltAm: string
}

const ZUSTAND_LABELS: Record<string, string> = {
  sehr_gut: 'Sehr gut',
  gut: 'Gut',
  befriedigend: 'Befriedigend',
  ausreichend: 'Ausreichend',
  mangelhaft: 'Mangelhaft',
}

const INTERESSE_LABELS: Record<string, string> = {
  hoch: 'Hohes Interesse',
  mittel: 'Mittleres Interesse',
  gering: 'Geringes Interesse',
}

export async function generateBesichtigungsprotokollPDF(data: PDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let y = margin

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
  doc.setFillColor(20, 184, 166) // Teal
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Besichtigungsprotokoll', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Objekt-Box
  doc.setFillColor(240, 253, 250)
  doc.rect(margin, y, pageWidth - 2 * margin, 30, 'F')
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Objekt:', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.objektAdresse), margin + 30, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Termin:', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${formatDateStr(data.besichtigungsdatum)}${data.besichtigungsuhrzeit ? ' um ' + data.besichtigungsuhrzeit + ' Uhr' : ''}`, margin + 30, y)
  y += 6

  const details = []
  if (data.wohnungsgroesse) details.push(`${data.wohnungsgroesse} m²`)
  if (data.zimmeranzahl) details.push(`${data.zimmeranzahl} Zimmer`)
  if (data.etage) details.push(data.etage)
  if (details.length > 0) {
    doc.text(details.join(' | '), margin + 5, y)
  }
  y += 15

  // Teilnehmer
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Anwesende:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  for (const t of data.teilnehmer) {
    if (t.name) {
      doc.text(`• ${t.name}${t.rolle ? ` (${t.rolle})` : ''}`, margin + 5, y)
      y += 5
    }
  }
  y += 8

  // Konditionen
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Mietkonditionen', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const konditionenItems = []
  if (data.kaltmiete) konditionenItems.push(`Kaltmiete: ${formatCurrency(data.kaltmiete)}`)
  if (data.nebenkosten) konditionenItems.push(`Nebenkosten: ${formatCurrency(data.nebenkosten)}`)
  if (data.kaltmiete && data.nebenkosten) konditionenItems.push(`Warmmiete: ${formatCurrency(data.kaltmiete + data.nebenkosten)}`)
  if (data.kaution) konditionenItems.push(`Kaution: ${formatCurrency(data.kaution)}`)
  if (data.verfuegbarAb) konditionenItems.push(`Verfügbar ab: ${formatDateStr(data.verfuegbarAb)}`)

  for (const item of konditionenItems) {
    doc.text(item, margin, y)
    y += 5
  }
  y += 8

  // Allgemeiner Eindruck
  if (data.allgemeinesBild) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Allgemeiner Eindruck', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const impressionLines = doc.splitTextToSize(data.allgemeinesBild, pageWidth - 2 * margin)
    for (const line of impressionLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Zustandsbewertung
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Zustandsbewertung', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const bewertungen = [
    { label: 'Küche', value: data.zustandKueche },
    { label: 'Bad', value: data.zustandBad },
    { label: 'Böden', value: data.zustandBoeden },
    { label: 'Wände/Decken', value: data.zustandWaende },
    { label: 'Fenster', value: data.zustandFenster },
  ]

  for (const b of bewertungen) {
    if (b.value) {
      doc.text(`${b.label}:`, margin, y)
      doc.text(ZUSTAND_LABELS[b.value] || b.value, margin + 40, y)
      y += 5
    }
  }
  y += 5

  // Besonderheiten
  if (data.besonderheiten) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Besonderheiten / Mängel', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const besLines = doc.splitTextToSize(data.besonderheiten, pageWidth - 2 * margin)
    for (const line of besLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Fazit
  checkPageBreak(35)
  doc.setFillColor(240, 253, 250)
  doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F')
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Fazit', margin + 5, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.interesse) {
    doc.text(`Interesse: ${INTERESSE_LABELS[data.interesse] || data.interesse}`, margin + 5, y)
  }
  y += 15

  // Offene Fragen
  if (data.fragen) {
    checkPageBreak(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Offene Fragen:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const fragenLines = doc.splitTextToSize(data.fragen, pageWidth - 2 * margin)
    for (const line of fragenLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
  }

  // Erstellungsdatum
  y += 10
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Protokoll erstellt am: ${formatDateStr(data.erstelltAm)}`, margin, y)

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.text('Besichtigungsprotokoll', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const adresseKurz = data.objektAdresse.strasse.replace(/\s/g, '_')
  const filename = `Besichtigungsprotokoll_${adresseKurz}_${formatDateStr(data.besichtigungsdatum).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
