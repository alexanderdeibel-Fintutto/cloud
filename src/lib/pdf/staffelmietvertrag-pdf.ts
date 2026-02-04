import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Staffelung {
  id: string
  abDatum: string
  kaltmiete: number | null
}

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  wohnflaeche: string
  zimmer?: string
  mietbeginn: string
  anfangsmiete: number | null
  staffelungen: Staffelung[]
  nebenkosten: number | null
  kaution: number | null
  erstelltAm: string
  erstelltOrt: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
}

export async function generateStaffelmietvertragPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(16, 185, 129)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Staffelmietvertrag', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(Wohnraummietvertrag mit vereinbarter Staffelmiete gemäß § 557a BGB)', pageWidth / 2, y, { align: 'center' })
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
  checkPageBreak(35)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Mietobjekt', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const mietObjektText = `Der Vermieter vermietet dem Mieter folgende Wohnung: ${formatAddress(data.mietobjektAdresse)}`
  const moLines = doc.splitTextToSize(mietObjektText, pageWidth - 2 * margin)
  for (const line of moLines) {
    doc.text(line, margin, y)
    y += 5
  }

  y += 3
  doc.text(`Wohnfläche: ca. ${data.wohnflaeche} m²`, margin, y)
  if (data.zimmer) {
    doc.text(`Zimmer: ${data.zimmer}`, margin + 80, y)
  }
  y += 10

  // Mietzeit
  checkPageBreak(20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 3 Mietzeit', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Das Mietverhältnis beginnt am ${formatDateStr(data.mietbeginn)} und wird auf unbestimmte Zeit geschlossen.`, margin, y)
  y += 10

  // Staffelmiete
  checkPageBreak(60)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 4 Staffelmiete', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Die Parteien vereinbaren folgende Staffelmiete gemäß § 557a BGB:', margin, y)
  y += 8

  // Staffelungs-Tabelle
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('Zeitraum', margin + 5, y + 5)
  doc.text('Kaltmiete', margin + 100, y + 5)
  y += 10

  doc.setFont('helvetica', 'normal')
  // Anfangsmiete
  doc.text(`Ab ${formatDateStr(data.mietbeginn)} (Mietbeginn)`, margin + 5, y)
  doc.text(data.anfangsmiete ? formatCurrency(data.anfangsmiete) : '—', margin + 100, y)
  y += 6

  // Staffelungen
  for (const staffelung of data.staffelungen) {
    if (staffelung.abDatum && staffelung.kaltmiete) {
      doc.text(`Ab ${formatDateStr(staffelung.abDatum)}`, margin + 5, y)
      doc.text(formatCurrency(staffelung.kaltmiete), margin + 100, y)
      y += 6
    }
  }

  y += 5
  const hinweisText = 'Hinweis: Die Mietstaffelungen treten automatisch zu den genannten Zeitpunkten in Kraft. ' +
    'Während der Staffelmietzeit ist eine Mieterhöhung nach § 558 BGB (Anpassung an die ortsübliche ' +
    'Vergleichsmiete) ausgeschlossen. Mieterhöhungen wegen Modernisierung (§ 559 BGB) oder ' +
    'gestiegener Betriebskosten bleiben unberührt.'
  const hinweisLines = doc.splitTextToSize(hinweisText, pageWidth - 2 * margin)
  for (const line of hinweisLines) {
    doc.text(line, margin, y)
    y += 4
  }
  y += 8

  // Nebenkosten
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 5 Nebenkosten', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const nebenkostenText = `Zusätzlich zur Kaltmiete zahlt der Mieter eine monatliche Nebenkostenvorauszahlung ` +
    `in Höhe von ${data.nebenkosten ? formatCurrency(data.nebenkosten) : '—'}. ` +
    `Über die Nebenkosten wird jährlich abgerechnet.`
  const nkLines = doc.splitTextToSize(nebenkostenText, pageWidth - 2 * margin)
  for (const line of nkLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Kaution
  checkPageBreak(20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 6 Kaution', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.kaution) {
    doc.text(`Der Mieter zahlt eine Kaution in Höhe von ${formatCurrency(data.kaution)}.`, margin, y)
    y += 5
    doc.text('Die Kaution ist auf einem separaten Konto anzulegen und bei Beendigung des', margin, y)
    y += 5
    doc.text('Mietverhältnisses verzinst zurückzuzahlen (§ 551 BGB).', margin, y)
  } else {
    doc.text('Auf eine Kaution wird verzichtet.', margin, y)
  }
  y += 10

  // Gesamtmiete Übersicht
  checkPageBreak(30)
  doc.setFillColor(240, 253, 244)
  doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F')
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Monatliche Zahlungen (bei Mietbeginn):', margin + 5, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(`Kaltmiete: ${data.anfangsmiete ? formatCurrency(data.anfangsmiete) : '—'}`, margin + 5, y)
  y += 5
  doc.text(`Nebenkosten: ${data.nebenkosten ? formatCurrency(data.nebenkosten) : '—'}`, margin + 5, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  const gesamtmiete = (data.anfangsmiete || 0) + (data.nebenkosten || 0)
  doc.text(`Gesamtmiete: ${formatCurrency(gesamtmiete)}`, margin + 5, y)
  y += 15

  // Unterschriften
  checkPageBreak(50)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschriftslinien
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
  doc.text('Staffelmietvertrag gemäß § 557a BGB', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Staffelmietvertrag_${formatPerson(data.mieter).replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
