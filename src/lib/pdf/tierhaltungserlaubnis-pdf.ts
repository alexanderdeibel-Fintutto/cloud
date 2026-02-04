import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  tierart: string
  tierrasse?: string
  tiername?: string
  anzahl: string
  auflagen: string[]
  sonstigeAuflagen?: string
  widerrufsvorbehalt: boolean
  unterschriftVermieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const TIERART_LABELS: Record<string, string> = {
  hund: 'Hund',
  katze: 'Katze',
  vogel: 'Vogel',
  nagetier: 'Nagetier',
  fische: 'Fische / Aquarium',
  reptil: 'Reptil',
  sonstige: 'Sonstiges Tier',
}

const AUFLAGEN_LABELS: Record<string, string> = {
  haftpflicht: 'Der Mieter verpflichtet sich, eine Tierhalterhaftpflichtversicherung abzuschließen und auf Verlangen nachzuweisen.',
  reinigung: 'Bei Beendigung des Mietverhältnisses ist für eine gründliche Reinigung zu sorgen, um Tiergerüche und -haare zu beseitigen.',
  laerm: 'Übermäßige Lärmbelästigung durch das Tier ist zu vermeiden.',
  leine: 'In Gemeinschaftsräumen und Treppenhäusern ist das Tier an der Leine zu führen.',
  kot: 'Tierkot ist unverzüglich zu entfernen.',
  melden: 'Änderungen bezüglich des Tieres sind dem Vermieter unverzüglich mitzuteilen.',
}

export async function generateTierhaltungserlaubnisPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(147, 51, 234)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Tierhaltungserlaubnis', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Vermieter
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Vermieter:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.vermieter), margin, y)
  y += 4
  doc.text(formatAddress(data.vermieterAdresse), margin, y)
  y += 10

  // Mieter
  doc.setFont('helvetica', 'bold')
  doc.text('Mieter (Tierhalter):', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.mieter), margin, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Mietobjekt:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mietobjektAdresse), margin, y)
  y += 12

  // Genehmigungstext
  const genehmigungText = `Hiermit erteile ich, ${formatPerson(data.vermieter)}, dem oben genannten Mieter die Erlaubnis, in der Mietwohnung folgendes Tier zu halten:`
  const genLines = doc.splitTextToSize(genehmigungText, pageWidth - 2 * margin)
  for (const line of genLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Tier-Box
  doc.setFillColor(243, 232, 255)
  doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F')
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Tierart:', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(TIERART_LABELS[data.tierart] || data.tierart, margin + 40, y)
  y += 6

  if (data.tierrasse) {
    doc.setFont('helvetica', 'bold')
    doc.text('Rasse:', margin + 5, y)
    doc.setFont('helvetica', 'normal')
    doc.text(data.tierrasse, margin + 40, y)
    y += 6
  }

  const tierDetails = []
  if (data.tiername) tierDetails.push(`Name: ${data.tiername}`)
  tierDetails.push(`Anzahl: ${data.anzahl}`)
  doc.text(tierDetails.join(' | '), margin + 5, y)
  y += 15

  // Auflagen
  if (data.auflagen.length > 0 || data.sonstigeAuflagen) {
    checkPageBreak(40)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Auflagen:', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    let auflagenNr = 1
    for (const auflage of data.auflagen) {
      if (AUFLAGEN_LABELS[auflage]) {
        const text = `${auflagenNr}. ${AUFLAGEN_LABELS[auflage]}`
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - 5)
        for (const line of lines) {
          checkPageBreak(6)
          doc.text(line, margin, y)
          y += 5
        }
        auflagenNr++
        y += 2
      }
    }

    if (data.sonstigeAuflagen) {
      const text = `${auflagenNr}. ${data.sonstigeAuflagen}`
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - 5)
      for (const line of lines) {
        checkPageBreak(6)
        doc.text(line, margin, y)
        y += 5
      }
    }
    y += 5
  }

  // Widerrufsvorbehalt
  if (data.widerrufsvorbehalt) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Widerrufsvorbehalt:', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const widerrufText = 'Diese Erlaubnis kann widerrufen werden, wenn das Tier Mitmieter belästigt, ' +
      'die Hausordnung verletzt wird oder andere wichtige Gründe vorliegen.'
    const widerrufLines = doc.splitTextToSize(widerrufText, pageWidth - 2 * margin)
    for (const line of widerrufLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 8
  }

  // Unterschrift
  checkPageBreak(35)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter', margin, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Tierhaltungserlaubnis', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Tierhaltungserlaubnis_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
