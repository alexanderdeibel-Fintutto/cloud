import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Kostenposition {
  id: string
  bezeichnung: string
  gesamtbetrag: number | null
  mieteranteil: number | null
  umlageschluessel: string
}

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  wohnungsNr?: string
  abrechnungszeitraumVon: string
  abrechnungszeitraumBis: string
  wohnflaeche: string
  gesamtflaeche: string
  personenzahl?: string
  gesamtpersonenzahl?: string
  kostenpositionen: Kostenposition[]
  vorauszahlungen: number | null
  gesamtMieteranteil: number
  saldo: number
  erstelltAm: string
}

export async function generateNebenkostenabrechnungPDF(data: PDFData): Promise<void> {
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
  doc.text('Nebenkostenabrechnung', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(Betriebskostenabrechnung gemäß § 556 BGB)', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Abrechnungszeitraum Box
  doc.setFillColor(236, 253, 245)
  doc.rect(margin, y, pageWidth - 2 * margin, 12, 'F')
  y += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Abrechnungszeitraum: ${formatDateStr(data.abrechnungszeitraumVon)} bis ${formatDateStr(data.abrechnungszeitraumBis)}`, pageWidth / 2, y, { align: 'center' })
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
  y += 8

  // Mieter & Mietobjekt
  doc.setFont('helvetica', 'bold')
  doc.text('Mieter:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.mieter), margin, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Mietobjekt:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mietobjektAdresse) + (data.wohnungsNr ? `, ${data.wohnungsNr}` : ''), margin, y)
  y += 10

  // Verteilerschlüssel
  doc.setFont('helvetica', 'bold')
  doc.text('Verteilerschlüssel:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  const flaechenanteil = data.wohnflaeche && data.gesamtflaeche
    ? ((parseFloat(data.wohnflaeche) / parseFloat(data.gesamtflaeche)) * 100).toFixed(2)
    : '—'
  doc.text(`Wohnfläche: ${data.wohnflaeche || '—'} m² von ${data.gesamtflaeche || '—'} m² (${flaechenanteil}%)`, margin, y)
  y += 5
  if (data.personenzahl && data.gesamtpersonenzahl) {
    const personenanteil = ((parseFloat(data.personenzahl) / parseFloat(data.gesamtpersonenzahl)) * 100).toFixed(2)
    doc.text(`Personen: ${data.personenzahl} von ${data.gesamtpersonenzahl} (${personenanteil}%)`, margin, y)
    y += 5
  }
  y += 8

  // Kostenpositionen Tabelle
  checkPageBreak(50)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Kostenaufstellung', margin, y)
  y += 6

  // Tabellenkopf
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Kostenart', margin + 3, y + 5.5)
  doc.text('Gesamtkosten', margin + 85, y + 5.5)
  doc.text('Ihr Anteil', margin + 125, y + 5.5)
  y += 10

  doc.setFont('helvetica', 'normal')
  for (const position of data.kostenpositionen) {
    if (position.bezeichnung || position.gesamtbetrag || position.mieteranteil) {
      checkPageBreak(7)
      doc.text(position.bezeichnung || '—', margin + 3, y)
      doc.text(position.gesamtbetrag ? formatCurrency(position.gesamtbetrag) : '—', margin + 85, y)
      doc.text(position.mieteranteil ? formatCurrency(position.mieteranteil) : '—', margin + 125, y)
      y += 6
    }
  }

  // Summenzeile
  y += 2
  doc.setDrawColor(0)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Summe Betriebskosten', margin + 3, y)
  doc.text(formatCurrency(data.gesamtMieteranteil), margin + 125, y)
  y += 10

  // Abrechnung
  checkPageBreak(40)
  doc.setFillColor(249, 250, 251)
  doc.rect(margin, y, pageWidth - 2 * margin, 35, 'F')
  y += 8

  doc.setFontSize(10)
  doc.text('Abrechnung:', margin + 5, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.text('Summe Betriebskosten:', margin + 5, y)
  doc.text(formatCurrency(data.gesamtMieteranteil), margin + 120, y)
  y += 6

  doc.text('Geleistete Vorauszahlungen:', margin + 5, y)
  doc.text(`- ${formatCurrency(data.vorauszahlungen || 0)}`, margin + 120, y)
  y += 6

  doc.line(margin + 100, y, margin + 150, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  const saldoLabel = data.saldo >= 0 ? 'Nachzahlung:' : 'Guthaben:'
  doc.text(saldoLabel, margin + 5, y)
  doc.text(formatCurrency(Math.abs(data.saldo)), margin + 120, y)
  y += 15

  // Zahlungshinweis
  checkPageBreak(30)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.saldo > 0) {
    const hinweisText = `Wir bitten Sie, den Nachzahlungsbetrag von ${formatCurrency(data.saldo)} innerhalb von 30 Tagen nach Zugang dieser Abrechnung auf das Ihnen bekannte Konto zu überweisen.`
    const hinweisLines = doc.splitTextToSize(hinweisText, pageWidth - 2 * margin)
    for (const line of hinweisLines) {
      doc.text(line, margin, y)
      y += 5
    }
  } else if (data.saldo < 0) {
    const hinweisText = `Das Guthaben von ${formatCurrency(Math.abs(data.saldo))} wird mit der nächsten Mietzahlung verrechnet oder auf Ihr Konto überwiesen.`
    const hinweisLines = doc.splitTextToSize(hinweisText, pageWidth - 2 * margin)
    for (const line of hinweisLines) {
      doc.text(line, margin, y)
      y += 5
    }
  }
  y += 8

  // Rechtlicher Hinweis
  doc.setFontSize(8)
  doc.setTextColor(100)
  const rechtlichText = 'Einwendungen gegen diese Abrechnung müssen gemäß § 556 Abs. 3 BGB innerhalb von zwölf Monaten nach Zugang der Abrechnung geltend gemacht werden.'
  const rechtlichLines = doc.splitTextToSize(rechtlichText, pageWidth - 2 * margin)
  for (const line of rechtlichLines) {
    doc.text(line, margin, y)
    y += 4
  }
  y += 10

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
  doc.text('Nebenkostenabrechnung gemäß § 556 BGB', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Nebenkostenabrechnung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.abrechnungszeitraumBis).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
