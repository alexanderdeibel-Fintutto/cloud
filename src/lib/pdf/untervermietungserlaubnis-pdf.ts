import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  untermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  untermietflaeche?: string
  untermietbeginn: string
  untermietende?: string
  unbefristet: boolean
  untermiete?: number | null
  aufschlag?: number | null
  bedingungen: string[]
  sonstigeBedingungen?: string
  unterschriftVermieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const BEDINGUNG_LABELS: Record<string, string> = {
  anmeldung: 'Der Untermieter muss sich ordnungsgemäß beim Einwohnermeldeamt anmelden.',
  hausordnung: 'Der Untermieter muss die Hausordnung einhalten.',
  haftung: 'Der Hauptmieter haftet weiterhin für alle Verpflichtungen aus dem Hauptmietvertrag sowie für das Verhalten des Untermieters.',
  kuendigung: 'Bei Beendigung des Hauptmietverhältnisses endet auch die Erlaubnis zur Untervermietung.',
  meldepflicht: 'Änderungen in der Person des Untermieters sind dem Vermieter unverzüglich anzuzeigen.',
}

export async function generateUntervermietungserlaubnisPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(20, 184, 166)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Untervermietungserlaubnis', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(Genehmigung zur Untervermietung gemäß § 540 BGB)', pageWidth / 2, y, { align: 'center' })
  y += 15

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

  // Hauptmieter
  doc.setFont('helvetica', 'bold')
  doc.text('Hauptmieter:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.mieter), margin, y)
  y += 6

  // Mietobjekt
  doc.setFont('helvetica', 'bold')
  doc.text('Mietobjekt:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mietobjektAdresse), margin, y)
  y += 12

  // Genehmigungstext
  doc.setFont('helvetica', 'normal')
  const genehmigungText = `Hiermit erteile ich, ${formatPerson(data.vermieter)}, dem oben genannten Hauptmieter die Erlaubnis, einen Teil der Mietsache an folgende Person unterzuvermieten:`
  const genLines = doc.splitTextToSize(genehmigungText, pageWidth - 2 * margin)
  for (const line of genLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Untermieter Box
  doc.setFillColor(240, 253, 250)
  doc.rect(margin, y, pageWidth - 2 * margin, 18, 'F')
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Untermieter:', margin + 5, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.untermieter), margin + 5, y)
  y += 14

  // Details
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Details der Untervermietung:', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  if (data.untermietflaeche) {
    doc.text(`Untervermietete Fläche/Räume: ${data.untermietflaeche}`, margin, y)
    y += 6
  }

  doc.text(`Untervermietung ab: ${formatDateStr(data.untermietbeginn)}`, margin, y)
  y += 6

  if (data.unbefristet) {
    doc.text('Dauer: Unbefristet', margin, y)
  } else if (data.untermietende) {
    doc.text(`Untervermietung bis: ${formatDateStr(data.untermietende)}`, margin, y)
  }
  y += 8

  if (data.untermiete) {
    doc.text(`Vereinbarte Untermiete: ${formatCurrency(data.untermiete)}`, margin, y)
    y += 6
  }

  if (data.aufschlag) {
    doc.text(`Untervermietungszuschlag zur Hauptmiete: ${formatCurrency(data.aufschlag)}`, margin, y)
    y += 6
  }
  y += 5

  // Bedingungen
  if (data.bedingungen.length > 0 || data.sonstigeBedingungen) {
    checkPageBreak(40)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Bedingungen und Auflagen:', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    let bedingungNr = 1
    for (const bedingung of data.bedingungen) {
      if (BEDINGUNG_LABELS[bedingung]) {
        const text = `${bedingungNr}. ${BEDINGUNG_LABELS[bedingung]}`
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - 5)
        for (const line of lines) {
          checkPageBreak(6)
          doc.text(line, margin, y)
          y += 5
        }
        bedingungNr++
        y += 2
      }
    }

    if (data.sonstigeBedingungen) {
      const text = `${bedingungNr}. ${data.sonstigeBedingungen}`
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
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Widerrufsvorbehalt:', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const widerrufText = 'Der Vermieter behält sich vor, diese Erlaubnis aus wichtigem Grund zu widerrufen, ' +
    'insbesondere wenn der Untermieter wiederholt gegen die Hausordnung verstößt oder das Mietverhältnis ' +
    'zwischen Hauptmieter und Vermieter beendet wird.'
  const widerrufLines = doc.splitTextToSize(widerrufText, pageWidth - 2 * margin)
  for (const line of widerrufLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 10

  // Unterschrift
  checkPageBreak(40)
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
  doc.text('Untervermietungserlaubnis gemäß § 540 BGB', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Untervermietungserlaubnis_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
