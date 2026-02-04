import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Abzug {
  id: string
  bezeichnung: string
  betrag: number | null
}

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterNeueAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietvertragVom?: string
  mietende: string
  kautionsbetrag: number | null
  zinsen: number | null
  abzuege: Abzug[]
  sonstigeAnmerkungen?: string
  bankverbindungMieter?: string
  summeAbzuege: number
  kautionMitZinsen: number
  auszahlungsbetrag: number
  erstelltAm: string
}

export async function generateKautionsabrechnungPDF(data: PDFData): Promise<void> {
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
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Kautionsabrechnung', pageWidth / 2, y, { align: 'center' })
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
  doc.text('Mieter:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.mieter), margin, y)
  y += 4
  doc.text(`Neue Adresse: ${formatAddress(data.mieterNeueAdresse)}`, margin, y)
  y += 10

  // Mietobjekt
  doc.setFont('helvetica', 'bold')
  doc.text('Betreffendes Mietobjekt:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mietobjektAdresse), margin, y)
  y += 5
  if (data.mietvertragVom) {
    doc.text(`Mietvertrag vom: ${formatDateStr(data.mietvertragVom)}`, margin, y)
    y += 5
  }
  doc.text(`Mietende: ${formatDateStr(data.mietende)}`, margin, y)
  y += 12

  // Abrechnung Box
  doc.setFillColor(240, 253, 244)
  const boxHeight = 50 + (data.abzuege.length * 6)
  doc.rect(margin, y, pageWidth - 2 * margin, boxHeight, 'F')
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Abrechnung', margin + 5, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Kaution
  doc.text('Gezahlte Kaution:', margin + 5, y)
  doc.text(formatCurrency(data.kautionsbetrag || 0), margin + 120, y)
  y += 6

  // Zinsen
  if (data.zinsen) {
    doc.text('Zinsen:', margin + 5, y)
    doc.text(formatCurrency(data.zinsen), margin + 120, y)
    y += 6
  }

  // Zwischensumme
  doc.setFont('helvetica', 'bold')
  doc.text('Kaution inkl. Zinsen:', margin + 5, y)
  doc.text(formatCurrency(data.kautionMitZinsen), margin + 120, y)
  doc.setFont('helvetica', 'normal')
  y += 8

  // Abzüge
  if (data.abzuege.length > 0) {
    doc.text('Abzüge:', margin + 5, y)
    y += 6
    for (const abzug of data.abzuege) {
      if (abzug.bezeichnung && abzug.betrag) {
        doc.text(`  - ${abzug.bezeichnung}`, margin + 5, y)
        doc.text(`- ${formatCurrency(abzug.betrag)}`, margin + 120, y)
        y += 5
      }
    }
    y += 3
  }

  // Trennlinie
  doc.setDrawColor(0)
  doc.line(margin + 5, y, pageWidth - margin - 5, y)
  y += 6

  // Ergebnis
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  if (data.auszahlungsbetrag >= 0) {
    doc.text('Auszahlungsbetrag:', margin + 5, y)
    doc.text(formatCurrency(data.auszahlungsbetrag), margin + 120, y)
  } else {
    doc.setTextColor(200, 0, 0)
    doc.text('Nachforderung:', margin + 5, y)
    doc.text(formatCurrency(Math.abs(data.auszahlungsbetrag)), margin + 120, y)
    doc.setTextColor(0)
  }
  y += boxHeight - (y - margin - 12) + 15

  // Auszahlung/Nachforderung Text
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  if (data.auszahlungsbetrag > 0) {
    const auszahlungText = `Der Auszahlungsbetrag in Höhe von ${formatCurrency(data.auszahlungsbetrag)} wird auf das von Ihnen angegebene Konto überwiesen.`
    const auszahlungLines = doc.splitTextToSize(auszahlungText, pageWidth - 2 * margin)
    for (const line of auszahlungLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  } else if (data.auszahlungsbetrag < 0) {
    const nachforderungText = `Es ergibt sich eine Nachforderung in Höhe von ${formatCurrency(Math.abs(data.auszahlungsbetrag))}. Bitte überweisen Sie diesen Betrag innerhalb von 14 Tagen.`
    const nachforderungLines = doc.splitTextToSize(nachforderungText, pageWidth - 2 * margin)
    for (const line of nachforderungLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Bankverbindung
  if (data.bankverbindungMieter && data.auszahlungsbetrag > 0) {
    checkPageBreak(25)
    doc.setFont('helvetica', 'bold')
    doc.text('Bankverbindung für die Auszahlung:', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    const bankLines = data.bankverbindungMieter.split('\n')
    for (const line of bankLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Anmerkungen
  if (data.sonstigeAnmerkungen) {
    checkPageBreak(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Anmerkungen:', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    const anmerkungLines = doc.splitTextToSize(data.sonstigeAnmerkungen, pageWidth - 2 * margin)
    for (const line of anmerkungLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Hinweis
  checkPageBreak(25)
  doc.setFontSize(9)
  doc.setTextColor(100)
  const hinweisText = 'Hinweis: Der Vermieter ist berechtigt, einen angemessenen Teil der Kaution für noch ausstehende Nebenkostenabrechnungen einzubehalten, sofern ein entsprechender Vorbehalt erklärt wurde.'
  const hinweisLines = doc.splitTextToSize(hinweisText, pageWidth - 2 * margin)
  for (const line of hinweisLines) {
    doc.text(line, margin, y)
    y += 4
  }
  y += 8

  // Datum und Unterschrift
  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.text(`Erstellt am: ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 15

  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter', margin, y)

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Kautionsabrechnung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Kautionsabrechnung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.mietende).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
