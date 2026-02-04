import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Massnahme {
  id: string
  beschreibung: string
  verantwortlich: string
}

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  renovierungsanlass?: string
  massnahmen: Massnahme[]
  durchfuehrungBis?: string
  kostentraeger?: string
  qualitaetsstandard: string[]
  sonstigeVereinbarungen?: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const QUALITAET_LABELS: Record<string, string> = {
  fachgerecht: 'Fachgerechte Ausführung erforderlich',
  neutral: 'Neutrale/helle Farben verwenden',
  tapete: 'Tapeten entfernen und weiß streichen',
  boden: 'Bodenbeläge in ordnungsgemäßem Zustand',
  original: 'Rückbau in ursprünglichen Zustand',
}

export async function generateRenovierungsvereinbarungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(234, 179, 8) // Yellow
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Renovierungsvereinbarung', pageWidth / 2, y, { align: 'center' })
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
  y += 10

  // Mietobjekt
  doc.setFont('helvetica', 'bold')
  doc.text('Betreffend:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mietobjektAdresse), margin + 30, y)
  y += 5
  if (data.renovierungsanlass) {
    doc.text(`Anlass: ${data.renovierungsanlass}`, margin, y)
    y += 5
  }
  y += 8

  // Präambel
  const praeambel = 'Die Parteien vereinbaren einvernehmlich folgende Renovierungsarbeiten:'
  doc.text(praeambel, margin, y)
  y += 10

  // Maßnahmen
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Renovierungsmaßnahmen', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  let massnahmeNr = 1
  for (const massnahme of data.massnahmen) {
    if (massnahme.beschreibung) {
      checkPageBreak(20)
      doc.setFont('helvetica', 'bold')
      doc.text(`${massnahmeNr}.`, margin, y)
      doc.setFont('helvetica', 'normal')

      const beschreibungLines = doc.splitTextToSize(massnahme.beschreibung, pageWidth - 2 * margin - 10)
      for (const line of beschreibungLines) {
        doc.text(line, margin + 8, y)
        y += 5
      }

      if (massnahme.verantwortlich) {
        doc.setFont('helvetica', 'italic')
        doc.text(`Verantwortlich: ${massnahme.verantwortlich}`, margin + 8, y)
        doc.setFont('helvetica', 'normal')
        y += 5
      }
      massnahmeNr++
      y += 3
    }
  }
  y += 5

  // Durchführung
  if (data.durchfuehrungBis || data.kostentraeger) {
    checkPageBreak(20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 2 Durchführung', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    if (data.durchfuehrungBis) {
      doc.text(`Die Arbeiten sind bis zum ${formatDateStr(data.durchfuehrungBis)} abzuschließen.`, margin, y)
      y += 5
    }
    if (data.kostentraeger) {
      doc.text(`Kostenträger: ${data.kostentraeger}`, margin, y)
      y += 5
    }
    y += 5
  }

  // Qualitätsstandards
  if (data.qualitaetsstandard.length > 0) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 3 Qualitätsstandards', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    for (const standard of data.qualitaetsstandard) {
      if (QUALITAET_LABELS[standard]) {
        doc.text(`• ${QUALITAET_LABELS[standard]}`, margin, y)
        y += 5
      }
    }
    y += 5
  }

  // Sonstige Vereinbarungen
  if (data.sonstigeVereinbarungen) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 4 Sonstige Vereinbarungen', margin, y)
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
  checkPageBreak(30)
  doc.setFontSize(10)
  const schluss = 'Änderungen und Ergänzungen dieser Vereinbarung bedürfen der Schriftform. Beide Parteien haben je eine Ausfertigung erhalten.'
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
  doc.text('Renovierungsvereinbarung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Renovierungsvereinbarung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
