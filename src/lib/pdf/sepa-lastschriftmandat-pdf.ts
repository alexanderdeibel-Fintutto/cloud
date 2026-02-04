import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  zahlungsempfaenger: { anrede: string; titel?: string; vorname: string; nachname: string }
  zahlungsempfaengerAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  glaeubigerIdentifikationsnummer?: string
  mandatsreferenz: string
  zahlungspflichtiger: { anrede: string; titel?: string; vorname: string; nachname: string }
  zahlungspflichtigerAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  kontoinhaber: string
  iban: string
  bic?: string
  kreditinstitut?: string
  mandatArt: 'wiederkehrend' | 'einmalig'
  zahlungsart: string
  betrag?: number | null
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  erstelltAm: string
  erstelltOrt: string
  unterschriftZahlungspflichtiger?: { imageData: string | null; signerName: string; signedAt: string | null }
}

const ZAHLUNGSART_LABELS: Record<string, string> = {
  miete_und_nebenkosten: 'Miete und Nebenkosten',
  miete: 'Miete',
  nebenkosten: 'Nebenkosten',
}

export async function generateSEPALastschriftmandatPDF(data: PDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
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

  // Logo-Bereich (Platzhalter)
  doc.setFillColor(30, 64, 175) // Primary blue
  doc.rect(0, 0, pageWidth, 8, 'F')

  y = 20

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('SEPA-Lastschriftmandat', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(data.mandatArt === 'wiederkehrend' ? '(Wiederkehrende Zahlung)' : '(Einmalige Zahlung)', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Mandatsreferenz und Gläubiger-ID
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y, pageWidth - 2 * margin, 14, 'F')
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Mandatsreferenz:', margin + 3, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.mandatsreferenz, margin + 40, y)

  if (data.glaeubigerIdentifikationsnummer) {
    doc.setFont('helvetica', 'bold')
    doc.text('Gläubiger-ID:', margin + 90, y)
    doc.setFont('helvetica', 'normal')
    doc.text(data.glaeubigerIdentifikationsnummer, margin + 115, y)
  }
  y += 14

  // Zahlungsempfänger
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Zahlungsempfänger (Vermieter)', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Name: ${formatPerson(data.zahlungsempfaenger)}`, margin, y)
  y += 5
  doc.text(`Anschrift: ${formatAddress(data.zahlungsempfaengerAdresse)}`, margin, y)
  y += 10

  // Zahlungspflichtiger
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Zahlungspflichtiger (Mieter)', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Name: ${formatPerson(data.zahlungspflichtiger)}`, margin, y)
  y += 5
  doc.text(`Anschrift: ${formatAddress(data.zahlungspflichtigerAdresse)}`, margin, y)
  y += 10

  // Bankverbindung Box
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, y, pageWidth - 2 * margin, 28, 'S')
  y += 5

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Bankverbindung', margin + 3, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Kontoinhaber: ${data.kontoinhaber}`, margin + 3, y)
  y += 5

  // IBAN formatieren
  const ibanFormatted = data.iban.replace(/(.{4})/g, '$1 ').trim()
  doc.text(`IBAN: ${ibanFormatted}`, margin + 3, y)
  y += 5

  if (data.bic || data.kreditinstitut) {
    let bankText = ''
    if (data.bic) bankText += `BIC: ${data.bic}`
    if (data.kreditinstitut) bankText += (bankText ? '  |  ' : '') + `Bank: ${data.kreditinstitut}`
    doc.text(bankText, margin + 3, y)
  }
  y += 12

  // Zahlungsdetails
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Zahlungsdetails', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Verwendungszweck: ${ZAHLUNGSART_LABELS[data.zahlungsart] || data.zahlungsart}`, margin, y)
  y += 5
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 5
  if (data.betrag) {
    doc.text(`Monatlicher Betrag: ${formatCurrency(data.betrag)}`, margin, y)
    y += 5
  }
  y += 8

  // Mandatstext
  doc.setFillColor(250, 250, 250)
  doc.rect(margin, y, pageWidth - 2 * margin, 35, 'F')
  y += 5

  doc.setFontSize(9)
  const mandatText = `Ich ermächtige ${formatPerson(data.zahlungsempfaenger)}, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die von ${formatPerson(data.zahlungsempfaenger)} auf mein Konto gezogenen Lastschriften einzulösen.`

  const lines = doc.splitTextToSize(mandatText, pageWidth - 2 * margin - 6)
  for (const line of lines) {
    doc.text(line, margin + 3, y)
    y += 4
  }

  y += 3
  doc.setFont('helvetica', 'bold')
  doc.text('Hinweis:', margin + 3, y)
  doc.setFont('helvetica', 'normal')
  y += 4
  const hinweisText = 'Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrages verlangen. Es gelten dabei die mit meinem Kreditinstitut vereinbarten Bedingungen.'
  const hinweisLines = doc.splitTextToSize(hinweisText, pageWidth - 2 * margin - 6)
  for (const line of hinweisLines) {
    doc.text(line, margin + 3, y)
    y += 4
  }

  y += 15

  // Unterschrift
  doc.setFontSize(10)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  doc.setDrawColor(0)
  doc.line(margin, y, margin + 80, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Unterschrift Zahlungspflichtiger', margin, y)

  if (data.unterschriftZahlungspflichtiger?.imageData) {
    doc.addImage(data.unterschriftZahlungspflichtiger.imageData, 'PNG', margin, y - 25, 70, 20)
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 15
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('SEPA-Lastschriftmandat | Dieses Mandat kann jederzeit schriftlich widerrufen werden.', pageWidth / 2, y, { align: 'center' })

  // Speichern
  const filename = `SEPA_Lastschriftmandat_${formatPerson(data.zahlungspflichtiger).replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
