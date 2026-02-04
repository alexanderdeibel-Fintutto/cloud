import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Einwand {
  id: string
  kostenposition: string
  beanstandung: string
  betrag: number | null
}

interface PDFData {
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  abrechnungszeitraum: string
  abrechnungsdatum: string
  einwaende: Einwand[]
  allgemeineBegruendung?: string
  erstelltAm: string
}

export async function generateWiderspruchBetriebskostenPDF(data: PDFData): Promise<void> {
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

  const getAnrede = (p: { anrede: string; titel?: string; nachname: string }) => {
    if (p.anrede === 'Frau') return `Sehr geehrte Frau ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    if (p.anrede === 'Herr') return `Sehr geehrter Herr ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    return 'Sehr geehrte Damen und Herren'
  }

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 25) {
      doc.addPage()
      y = margin
    }
  }

  // Absender
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
  doc.text('Widerspruch gegen die Betriebskostenabrechnung', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 5
  doc.text(`Abrechnungszeitraum: ${data.abrechnungszeitraum}`, margin, y)
  y += 5
  doc.text(`Abrechnungsdatum: ${formatDateStr(data.abrechnungsdatum)}`, margin, y)
  y += 10

  // Anrede
  doc.text(getAnrede(data.vermieter) + ',', margin, y)
  y += 8

  // Einleitung
  const einleitung = `hiermit erhebe ich fristgerecht Einwände gegen die oben genannte Betriebskostenabrechnung gemäß § 556 Abs. 3 BGB. Die Abrechnung ist aus den folgenden Gründen zu korrigieren:`
  const einleitungLines = doc.splitTextToSize(einleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Einwände
  checkPageBreak(40)
  doc.setFont('helvetica', 'bold')
  doc.text('Beanstandete Positionen:', margin, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  let einwandNr = 1
  for (const einwand of data.einwaende) {
    if (einwand.kostenposition || einwand.beanstandung) {
      checkPageBreak(25)

      doc.setFillColor(250, 250, 250)
      doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')

      y += 5
      doc.setFont('helvetica', 'bold')
      doc.text(`${einwandNr}. ${einwand.kostenposition || 'Position'}`, margin + 3, y)
      if (einwand.betrag) {
        doc.text(`Strittiger Betrag: ${formatCurrency(einwand.betrag)}`, pageWidth - margin - 50, y)
      }
      y += 6

      doc.setFont('helvetica', 'normal')
      if (einwand.beanstandung) {
        const beanstandungLines = doc.splitTextToSize(einwand.beanstandung, pageWidth - 2 * margin - 10)
        for (const line of beanstandungLines) {
          doc.text(line, margin + 3, y)
          y += 4.5
        }
      }
      y += 8
      einwandNr++
    }
  }

  // Allgemeine Begründung
  if (data.allgemeineBegruendung) {
    checkPageBreak(25)
    doc.setFont('helvetica', 'bold')
    doc.text('Zusätzliche Anmerkungen:', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    const begruendungLines = doc.splitTextToSize(data.allgemeineBegruendung, pageWidth - 2 * margin)
    for (const line of begruendungLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Forderung
  checkPageBreak(30)
  doc.setFont('helvetica', 'bold')
  doc.text('Forderung:', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  const forderungText = 'Ich fordere Sie hiermit auf, die Betriebskostenabrechnung unter Berücksichtigung ' +
    'meiner Einwände zu korrigieren und mir eine berichtigte Abrechnung zuzusenden. ' +
    'Sollte sich daraus eine Änderung des Saldos ergeben, bitte ich um entsprechende Anpassung ' +
    'einer etwaigen Nachforderung oder Erstattung des Guthabens.'
  const forderungLines = doc.splitTextToSize(forderungText, pageWidth - 2 * margin)
  for (const line of forderungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Belegeinsicht
  const belegeText = 'Vorsorglich mache ich von meinem Recht auf Belegeinsicht Gebrauch und bitte um ' +
    'Mitteilung eines Termins zur Einsichtnahme in die der Abrechnung zugrunde liegenden Belege.'
  const belegeLines = doc.splitTextToSize(belegeText, pageWidth - 2 * margin)
  for (const line of belegeLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Grußformel
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 15

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 60, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.mieter), margin, y)

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Widerspruch Betriebskostenabrechnung gemäß § 556 Abs. 3 BGB', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Widerspruch_Betriebskosten_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
