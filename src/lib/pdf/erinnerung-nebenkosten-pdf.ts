import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  abrechnungsjahr: string
  abrechnungsfrist: string
  hinweis556: boolean
  fristsetzung: boolean
  fristBis: string
  unterschriftMieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

export async function generateErinnerungNebenkostenPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(234, 88, 12) // Orange
  doc.rect(0, 0, pageWidth, 10, 'F')

  // Absender
  y = 18
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`${formatPerson(data.mieter)} • ${formatAddress(data.mieterAdresse)}`, margin, y)
  y += 10

  // Empfänger
  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text(formatPerson(data.vermieter), margin, y)
  y += 5
  doc.text(formatAddress(data.vermieterAdresse), margin, y)
  y += 12

  // Datum
  doc.text(formatDateStr(data.erstelltAm), pageWidth - margin, y, { align: 'right' })
  y += 10

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.text('Erinnerung: Ausstehende Nebenkostenabrechnung', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 4
  doc.text(`Abrechnungszeitraum: ${data.abrechnungsjahr}`, margin, y)
  y += 12

  // Anrede
  const getAnrede = (p: { anrede: string; titel?: string; nachname: string }) => {
    if (p.anrede === 'Frau') return `Sehr geehrte Frau ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    if (p.anrede === 'Herr') return `Sehr geehrter Herr ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    return 'Sehr geehrte Damen und Herren'
  }
  doc.text(getAnrede(data.vermieter) + ',', margin, y)
  y += 8

  // Einleitung
  let einleitung = `ich möchte Sie daran erinnern, dass ich bisher noch keine Nebenkostenabrechnung für das Jahr ${data.abrechnungsjahr} erhalten habe.`
  const einleitungLines = doc.splitTextToSize(einleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Hinweis § 556
  if (data.hinweis556) {
    doc.setFillColor(254, 243, 199)
    doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F')
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.text('Hinweis gemäß § 556 Abs. 3 BGB:', margin + 5, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const hinweis = 'Die Abrechnung muss dem Mieter spätestens bis zum Ablauf des zwölften Monats nach Ende des Abrechnungszeitraums mitgeteilt werden. Nach Ablauf dieser Frist ist eine Nachforderung ausgeschlossen.'
    const hinweisLines = doc.splitTextToSize(hinweis, pageWidth - 2 * margin - 10)
    for (const line of hinweisLines) {
      doc.text(line, margin + 5, y)
      y += 5
    }
    y += 8
  }

  // Abrechnungsfrist
  if (data.abrechnungsfrist) {
    y += 3
    doc.text(`Die Abrechnungsfrist endet am: ${formatDateStr(data.abrechnungsfrist)}`, margin, y)
    y += 8
  }

  // Fristsetzung
  if (data.fristsetzung && data.fristBis) {
    const frist = `Ich bitte Sie daher, mir die Nebenkostenabrechnung bis spätestens zum ${formatDateStr(data.fristBis)} zukommen zu lassen.`
    const fristLines = doc.splitTextToSize(frist, pageWidth - 2 * margin)
    for (const line of fristLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Schluss
  const schluss = 'Sollte ich bis zu diesem Zeitpunkt keine Abrechnung erhalten haben, gehe ich davon aus, dass keine Nachforderung besteht und eventuell geleistete Vorauszahlungen mit der Miete verrechnet werden können.'
  const schlussLines = doc.splitTextToSize(schluss, pageWidth - 2 * margin)
  for (const line of schlussLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Abschlussformel
  doc.text('Für Rückfragen stehe ich Ihnen gerne zur Verfügung.', margin, y)
  y += 10

  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 20

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.mieter), margin, y)

  if (data.unterschriftMieter?.imageData) {
    doc.addImage(data.unterschriftMieter.imageData, 'PNG', margin, y - 25, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Erinnerung Nebenkostenabrechnung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Erinnerung_Nebenkosten_${data.abrechnungsjahr}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
