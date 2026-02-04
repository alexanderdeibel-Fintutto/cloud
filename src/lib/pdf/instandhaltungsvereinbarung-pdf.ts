import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieterPflichten: string[]
  vermieterPflichten: string[]
  kleinreparaturgrenze: string
  jahreshoechstgrenze: string
  sondervereinbarungen: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const MIETER_PFLICHTEN_LABELS: Record<string, string> = {
  lampen: 'Lampenwechsel und Leuchtmittel',
  wasserhahn: 'Dichtungen an Wasserhähnen',
  tuerklinken: 'Türklinken und Türschlösser',
  jalousien: 'Bedienelemente von Jalousien und Rollläden',
  steckdosen: 'Steckdosen und Lichtschalter (nicht elektrisch)',
  duschbrause: 'Duschbrausen und Duschschläuche',
  heizkoerperventile: 'Heizkörperventile',
  silikonfugen: 'Silikonfugen in Bad und Küche',
}

const VERMIETER_PFLICHTEN_LABELS: Record<string, string> = {
  heizung: 'Wartung und Reparatur der Heizungsanlage',
  dach: 'Dachreparaturen',
  fassade: 'Fassade und Außenwände',
  fenster: 'Fenster und Außentüren (außer Kleinreparaturen)',
  elektrik: 'Elektrische Leitungen und Sicherungen',
  sanitaer: 'Sanitäre Leitungen',
  aufzug: 'Aufzugsanlage (falls vorhanden)',
  treppenhaus: 'Gemeinschaftsflächen und Treppenhaus',
}

export async function generateInstandhaltungsvereinbarungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(34, 197, 94) // Green
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Instandhaltungsvereinbarung', pageWidth / 2, y, { align: 'center' })
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
  doc.text(`${formatPerson(data.mieter)}, ${formatAddress(data.mieterAdresse)}`, margin, y)
  y += 5
  doc.text('- im Folgenden "Mieter" genannt -', margin, y)
  y += 10

  doc.text(`Betreffend: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 12

  // § 1 Grundsatz
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Grundsatz der Instandhaltung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const grundsatz = 'Die Parteien vereinbaren ergänzend zum Mietvertrag die folgende Aufteilung der Instandhaltungspflichten.'
  const grundsatzLines = doc.splitTextToSize(grundsatz, pageWidth - 2 * margin)
  for (const line of grundsatzLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // § 2 Pflichten des Mieters
  checkPageBreak(50)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Pflichten des Mieters (Kleinreparaturen)', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Der Mieter trägt die Kosten für Kleinreparaturen an folgenden Gegenständen:', margin, y)
  y += 6

  for (const pflicht of data.mieterPflichten) {
    if (MIETER_PFLICHTEN_LABELS[pflicht]) {
      checkPageBreak(6)
      doc.text(`• ${MIETER_PFLICHTEN_LABELS[pflicht]}`, margin + 5, y)
      y += 5
    }
  }

  if (data.kleinreparaturgrenze) {
    y += 3
    doc.text(`Obergrenze je Einzelreparatur: ${data.kleinreparaturgrenze} €`, margin, y)
    y += 5
  }
  if (data.jahreshoechstgrenze) {
    doc.text(`Jahreshöchstgrenze: ${data.jahreshoechstgrenze} € oder max. 8% der Jahresmiete`, margin, y)
    y += 5
  }
  y += 8

  // § 3 Pflichten des Vermieters
  checkPageBreak(50)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 3 Pflichten des Vermieters', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Der Vermieter ist verantwortlich für:', margin, y)
  y += 6

  for (const pflicht of data.vermieterPflichten) {
    if (VERMIETER_PFLICHTEN_LABELS[pflicht]) {
      checkPageBreak(6)
      doc.text(`• ${VERMIETER_PFLICHTEN_LABELS[pflicht]}`, margin + 5, y)
      y += 5
    }
  }
  y += 8

  // § 4 Meldepflicht
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 4 Meldepflicht', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const meldepflicht = 'Der Mieter ist verpflichtet, Mängel und Schäden unverzüglich dem Vermieter zu melden. Der Vermieter ist zur zeitnahen Instandsetzung verpflichtet.'
  const meldepflichtLines = doc.splitTextToSize(meldepflicht, pageWidth - 2 * margin)
  for (const line of meldepflichtLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Sondervereinbarungen
  if (data.sondervereinbarungen) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 5 Sondervereinbarungen', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const sonderLines = doc.splitTextToSize(data.sondervereinbarungen, pageWidth - 2 * margin)
    for (const line of sonderLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 8
  }

  // Ort und Datum
  checkPageBreak(45)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschriften
  const signatureWidth = (pageWidth - 2 * margin - 20) / 2

  doc.setDrawColor(0)
  doc.line(margin, y, margin + signatureWidth, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter', margin, y)

  doc.line(margin + signatureWidth + 20, y - 5, pageWidth - margin, y - 5)
  doc.text('Mieter', margin + signatureWidth + 20, y)

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
  doc.text('Instandhaltungsvereinbarung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Instandhaltungsvereinbarung_${formatAddress(data.mietobjektAdresse).replace(/[\s,]/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
