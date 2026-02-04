import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vollmachtgeber: { anrede: string; titel?: string; vorname: string; nachname: string }
  vollmachtgeberAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  bevollmaechtigter: { anrede: string; titel?: string; vorname: string; nachname: string }
  bevollmaechtigterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  befugnisse: string[]
  sonstigeBefugnisse?: string
  befristet: boolean
  gueltigBis?: string
  unterschrift?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const BEFUGNISSE_LABELS: Record<string, string> = {
  vertretung: 'Vertretung gegenüber dem Vermieter in allen Mietangelegenheiten',
  kuendigung: 'Empfang und Ausspruch von Kündigungen',
  vertragsaenderung: 'Abschluss von Vertragsänderungen und Nachträgen',
  uebergabe: 'Durchführung von Wohnungsübergaben und -abnahmen',
  maengelanzeige: 'Mängelanzeigen und Reparaturanforderungen',
  zahlungen: 'Empfang von Zahlungen (z.B. Kautionsrückzahlung)',
  schriftverkehr: 'Entgegennahme und Versand von Schriftverkehr',
  besichtigungen: 'Teilnahme an Wohnungsbesichtigungen',
}

export async function generateVollmachtPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(147, 51, 234) // Purple
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('VOLLMACHT', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('für Mietangelegenheiten', pageWidth / 2, y, { align: 'center' })
  y += 15

  // Vollmachtgeber
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Vollmachtgeber:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.vollmachtgeber), margin, y)
  y += 4
  doc.text(formatAddress(data.vollmachtgeberAdresse), margin, y)
  y += 10

  // Bevollmächtigter
  doc.setFont('helvetica', 'bold')
  doc.text('Bevollmächtigter:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.bevollmaechtigter), margin, y)
  y += 4
  doc.text(formatAddress(data.bevollmaechtigterAdresse), margin, y)
  y += 10

  // Vollmachtserklärung
  const erklaerung = `Ich, ${formatPerson(data.vollmachtgeber)}, bevollmächtige hiermit ${formatPerson(data.bevollmaechtigter)}, mich in allen Angelegenheiten betreffend das Mietverhältnis über die Wohnung`
  const erklaerungLines = doc.splitTextToSize(erklaerung, pageWidth - 2 * margin)
  for (const line of erklaerungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 3

  // Mietobjekt
  doc.setFont('helvetica', 'bold')
  doc.text(formatAddress(data.mietobjektAdresse), margin, y)
  doc.setFont('helvetica', 'normal')
  y += 8

  doc.text('zu vertreten.', margin, y)
  y += 12

  // Befugnisse
  checkPageBreak(50)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Der/Die Bevollmächtigte ist insbesondere berechtigt:', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  for (const befugnis of data.befugnisse) {
    if (BEFUGNISSE_LABELS[befugnis]) {
      checkPageBreak(6)
      doc.text(`• ${BEFUGNISSE_LABELS[befugnis]}`, margin, y)
      y += 6
    }
  }

  if (data.sonstigeBefugnisse) {
    checkPageBreak(15)
    doc.text(`• ${data.sonstigeBefugnisse}`, margin, y)
    y += 6
  }
  y += 8

  // Gültigkeit
  checkPageBreak(20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Gültigkeit:', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.befristet && data.gueltigBis) {
    doc.text(`Diese Vollmacht ist befristet bis zum ${formatDateStr(data.gueltigBis)}.`, margin, y)
  } else {
    doc.text('Diese Vollmacht ist unbefristet und gilt bis auf Widerruf.', margin, y)
  }
  y += 5
  doc.text('Sie kann jederzeit widerrufen werden.', margin, y)
  y += 12

  // Hinweis
  checkPageBreak(20)
  doc.setFontSize(9)
  doc.setTextColor(100)
  const hinweis = 'Hinweis: Diese Vollmacht berechtigt nicht zur Vertretung vor Gericht. Für gerichtliche Angelegenheiten ist ggf. eine separate Prozessvollmacht erforderlich.'
  const hinweisLines = doc.splitTextToSize(hinweis, pageWidth - 2 * margin)
  for (const line of hinweisLines) {
    doc.text(line, margin, y)
    y += 4
  }
  y += 10

  // Ort und Datum
  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 80, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Unterschrift des Vollmachtgebers', margin, y)
  y += 4
  doc.text(formatPerson(data.vollmachtgeber), margin, y)

  if (data.unterschrift?.imageData) {
    doc.addImage(data.unterschrift.imageData, 'PNG', margin, y - 29, 70, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Vollmacht für Mietangelegenheiten', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Vollmacht_${formatPerson(data.vollmachtgeber).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
