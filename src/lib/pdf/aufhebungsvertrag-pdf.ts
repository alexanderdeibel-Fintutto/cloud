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
  mietvertragVom?: string
  aufhebungsdatum: string
  wohnungsuebergabe: string
  kautionRueckzahlung: boolean
  kautionHoehe?: number | null
  abfindungVereinbart: boolean
  abfindungshoehe?: number | null
  schoenheitsreparaturen: 'mieter' | 'vermieter' | 'keine'
  offeneForderungenVermieter: boolean
  offeneForderungenMieter: boolean
  offeneForderungenDetails?: string
  sonstigeVereinbarungen?: string
  erstelltAm: string
  erstelltOrt: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
}

export async function generateAufhebungsvertragPDF(data: PDFData): Promise<void> {
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
  doc.text('Mietaufhebungsvertrag', pageWidth / 2, y, { align: 'center' })
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
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Mietobjekt', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 5
  if (data.mietvertragVom) {
    doc.text(`Ursprünglicher Mietvertrag vom: ${formatDateStr(data.mietvertragVom)}`, margin, y)
    y += 5
  }
  y += 5

  // Aufhebung
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 3 Aufhebung des Mietverhältnisses', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const aufhebText = `Die Vertragsparteien vereinbaren einvernehmlich, das bestehende Mietverhältnis ` +
    `zum ${formatDateStr(data.aufhebungsdatum)} aufzuheben. Die Wohnungsübergabe erfolgt ` +
    `am ${formatDateStr(data.wohnungsuebergabe)}.`
  const aufhebLines = doc.splitTextToSize(aufhebText, pageWidth - 2 * margin)
  for (const line of aufhebLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Kaution
  if (data.kautionRueckzahlung && data.kautionHoehe) {
    checkPageBreak(20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 4 Kaution', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Die Mietkaution in Höhe von ${formatCurrency(data.kautionHoehe)} wird nach Wohnungsübergabe`, margin, y)
    y += 5
    doc.text('und Prüfung auf offene Forderungen an den Mieter zurückgezahlt.', margin, y)
    y += 10
  }

  // Abfindung
  if (data.abfindungVereinbart && data.abfindungshoehe) {
    checkPageBreak(20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 5 Abfindung', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Der Vermieter zahlt dem Mieter eine Abfindung in Höhe von ${formatCurrency(data.abfindungshoehe)}`, margin, y)
    y += 5
    doc.text('als Ausgleich für den vorzeitigen Auszug.', margin, y)
    y += 10
  }

  // Schönheitsreparaturen
  checkPageBreak(20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 6 Schönheitsreparaturen', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let schoenheitsText = ''
  switch (data.schoenheitsreparaturen) {
    case 'keine':
      schoenheitsText = 'Es werden keine Schönheitsreparaturen vom Mieter geschuldet.'
      break
    case 'mieter':
      schoenheitsText = 'Der Mieter verpflichtet sich, die Wohnung in fachgerecht renoviertem Zustand zu übergeben.'
      break
    case 'vermieter':
      schoenheitsText = 'Der Vermieter verzichtet auf die Durchführung von Schönheitsreparaturen durch den Mieter.'
      break
  }
  doc.text(schoenheitsText, margin, y)
  y += 10

  // Abgeltungsklausel
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 7 Abgeltung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  if (!data.offeneForderungenVermieter && !data.offeneForderungenMieter) {
    const abgeltungText = 'Mit Unterzeichnung dieses Vertrages und ordnungsgemäßer Durchführung der ' +
      'Wohnungsübergabe sind sämtliche gegenseitigen Ansprüche aus dem Mietverhältnis – mit Ausnahme ' +
      'der Kautionsrückzahlung und etwaiger Betriebskostenabrechnungen – abgegolten.'
    const abgeltungLines = doc.splitTextToSize(abgeltungText, pageWidth - 2 * margin)
    for (const line of abgeltungLines) {
      doc.text(line, margin, y)
      y += 5
    }
  } else {
    doc.text('Folgende Forderungen bestehen noch und werden gesondert abgewickelt:', margin, y)
    y += 6
    if (data.offeneForderungenDetails) {
      const forderungLines = doc.splitTextToSize(data.offeneForderungenDetails, pageWidth - 2 * margin)
      for (const line of forderungLines) {
        doc.text(line, margin, y)
        y += 5
      }
    }
  }
  y += 8

  // Sonstige Vereinbarungen
  if (data.sonstigeVereinbarungen) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 8 Sonstige Vereinbarungen', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const sonstigeLines = doc.splitTextToSize(data.sonstigeVereinbarungen, pageWidth - 2 * margin)
    for (const line of sonstigeLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 8
  }

  // Salvatorische Klausel
  checkPageBreak(20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 9 Salvatorische Klausel', margin, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const salvText = 'Sollten einzelne Bestimmungen dieses Vertrages unwirksam sein oder werden, ' +
    'bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.'
  const salvLines = doc.splitTextToSize(salvText, pageWidth - 2 * margin)
  for (const line of salvLines) {
    doc.text(line, margin, y)
    y += 4
  }
  y += 10

  // Unterschriften
  checkPageBreak(50)
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
  doc.text('Mietaufhebungsvertrag – Einvernehmliche Beendigung des Mietverhältnisses', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Mietaufhebungsvertrag_${formatPerson(data.mieter).replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
