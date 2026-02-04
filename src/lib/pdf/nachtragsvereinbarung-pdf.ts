import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Aenderung {
  id: string
  bisherig: string
  neu: string
}

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietvertragVom: string
  aenderungen: Aenderung[]
  gueltigAb: string
  sonstigeVereinbarungen?: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

export async function generateNachtragsvereinbarungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Nachtragsvereinbarung', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('zum Mietvertrag', pageWidth / 2, y, { align: 'center' })
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

  // Mietobjekt-Box
  doc.setFillColor(239, 246, 255)
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Betreffend:', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mietobjektAdresse), margin + 35, y)
  y += 6
  doc.text(`Ursprünglicher Mietvertrag vom: ${formatDateStr(data.mietvertragVom)}`, margin + 5, y)
  y += 15

  // Präambel
  const praeambel = 'Die Parteien vereinbaren einvernehmlich folgende Änderungen/Ergänzungen zum bestehenden Mietvertrag:'
  doc.text(praeambel, margin, y)
  y += 10

  // Änderungen
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Vertragsänderungen', margin, y)
  y += 8

  let aenderungNr = 1
  for (const aenderung of data.aenderungen) {
    if (aenderung.bisherig || aenderung.neu) {
      checkPageBreak(40)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`§ ${aenderungNr} - Änderung`, margin, y)
      y += 8

      doc.setFont('helvetica', 'normal')

      if (aenderung.bisherig) {
        doc.setFont('helvetica', 'bold')
        doc.text('Bisherige Regelung:', margin, y)
        y += 5
        doc.setFont('helvetica', 'normal')
        const bisherigLines = doc.splitTextToSize(aenderung.bisherig, pageWidth - 2 * margin - 5)
        for (const line of bisherigLines) {
          checkPageBreak(6)
          doc.text(line, margin + 5, y)
          y += 5
        }
        y += 3
      }

      if (aenderung.neu) {
        doc.setFont('helvetica', 'bold')
        doc.text('Neue Regelung:', margin, y)
        y += 5
        doc.setFont('helvetica', 'normal')
        const neuLines = doc.splitTextToSize(aenderung.neu, pageWidth - 2 * margin - 5)
        for (const line of neuLines) {
          checkPageBreak(6)
          doc.text(line, margin + 5, y)
          y += 5
        }
      }

      aenderungNr++
      y += 8
    }
  }

  // Gültigkeit
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Inkrafttreten', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Diese Nachtragsvereinbarung tritt am ${formatDateStr(data.gueltigAb)} in Kraft.`, margin, y)
  y += 10

  // Sonstige Vereinbarungen
  if (data.sonstigeVereinbarungen) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Sonstige Vereinbarungen', margin, y)
    y += 6

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
  checkPageBreak(25)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const schluss = 'Im Übrigen bleibt der ursprüngliche Mietvertrag unverändert bestehen. Beide Parteien haben je eine Ausfertigung dieser Vereinbarung erhalten.'
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
  doc.text('Nachtragsvereinbarung zum Mietvertrag', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Nachtragsvereinbarung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
