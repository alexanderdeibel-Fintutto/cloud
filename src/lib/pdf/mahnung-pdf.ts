import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Rueckstand {
  zeitraum: string
  art: 'miete' | 'nebenkosten' | 'sonstige'
  betrag: number | null
}

interface MahnungPDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mahnungsstufe: 1 | 2 | 3
  rueckstaende: Rueckstand[]
  mahngebuehr?: number | null
  verzugszinsen?: number | null
  gesamtforderung: number
  zahlungsfrist: string
  androhungKuendigung: boolean
  androhungInkasso: boolean
  bankinhaber: string
  iban: string
  verwendungszweck: string
  unterschriftVermieter?: { imageData: string | null; signerName: string; signedAt: string | null }
  erstelltAm: string
}

const ART_LABELS: Record<string, string> = {
  miete: 'Miete',
  nebenkosten: 'Nebenkosten',
  sonstige: 'Sonstige Forderung',
}

export async function generateMahnungPDF(data: MahnungPDFData): Promise<void> {
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

  // Header mit roter Farbe für Mahnung
  const headerColors = {
    1: [255, 193, 7], // Gelb
    2: [255, 152, 0], // Orange
    3: [244, 67, 54], // Rot
  }
  const [r, g, b] = headerColors[data.mahnungsstufe]
  doc.setFillColor(r, g, b)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 20

  // Absender (klein)
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`${formatPerson(data.vermieter)} · ${formatAddress(data.vermieterAdresse)}`, margin, y)
  y += 10

  // Empfänger
  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.setFont('helvetica', 'bold')
  doc.text(formatPerson(data.mieter), margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.mieterAdresse.strasse} ${data.mieterAdresse.hausnummer}`, margin, y)
  y += 5
  doc.text(`${data.mieterAdresse.plz} ${data.mieterAdresse.ort}`, margin, y)
  y += 15

  // Datum
  doc.text(`${data.vermieterAdresse.ort}, den ${formatDateStr(data.erstelltAm)}`, pageWidth - margin, y, { align: 'right' })
  y += 10

  // Betreff
  const mahnungsText = data.mahnungsstufe === 1
    ? 'Zahlungserinnerung'
    : data.mahnungsstufe === 2
      ? '2. Mahnung'
      : 'Letzte Mahnung'

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(r, g, b)
  doc.text(mahnungsText, margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 10

  // Anrede
  const anrede = data.mieter.anrede === 'frau'
    ? `Sehr geehrte Frau ${data.mieter.nachname}`
    : data.mieter.anrede === 'herr'
      ? `Sehr geehrter Herr ${data.mieter.nachname}`
      : `Sehr geehrte/r ${formatPerson(data.mieter)}`

  doc.text(`${anrede},`, margin, y)
  y += 8

  // Einleitungstext
  let einleitungstext = ''
  if (data.mahnungsstufe === 1) {
    einleitungstext = 'bei der Durchsicht unserer Unterlagen haben wir festgestellt, dass folgende Zahlungen noch nicht bei uns eingegangen sind:'
  } else if (data.mahnungsstufe === 2) {
    einleitungstext = 'leider haben wir trotz unserer Zahlungserinnerung noch keinen Zahlungseingang verzeichnen können. Wir bitten Sie daher erneut, folgende Beträge umgehend zu begleichen:'
  } else {
    einleitungstext = 'trotz unserer bisherigen Mahnungen ist die nachstehende Forderung weiterhin offen. Wir fordern Sie hiermit letztmalig auf, die ausstehenden Beträge zu zahlen:'
  }

  const lines = doc.splitTextToSize(einleitungstext, pageWidth - 2 * margin)
  for (const line of lines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Tabelle der Rückstände
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y, pageWidth - 2 * margin, 7, 'F')
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Zeitraum', margin + 2, y)
  doc.text('Art', margin + 60, y)
  doc.text('Betrag', pageWidth - margin - 2, y, { align: 'right' })
  y += 5

  doc.setFont('helvetica', 'normal')
  for (const rueckstand of data.rueckstaende) {
    y += 5
    doc.text(rueckstand.zeitraum || '—', margin + 2, y)
    doc.text(ART_LABELS[rueckstand.art] || rueckstand.art, margin + 60, y)
    doc.text(formatCurrency(rueckstand.betrag || 0), pageWidth - margin - 2, y, { align: 'right' })
  }

  // Zusätzliche Kosten
  if (data.mahngebuehr && data.mahngebuehr > 0) {
    y += 5
    doc.text('Mahngebühr', margin + 2, y)
    doc.text(formatCurrency(data.mahngebuehr), pageWidth - margin - 2, y, { align: 'right' })
  }

  if (data.verzugszinsen && data.verzugszinsen > 0) {
    y += 5
    doc.text('Verzugszinsen', margin + 2, y)
    doc.text(formatCurrency(data.verzugszinsen), pageWidth - margin - 2, y, { align: 'right' })
  }

  // Summe
  y += 3
  doc.setDrawColor(0)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Gesamtforderung:', margin + 2, y)
  doc.setFontSize(12)
  doc.text(formatCurrency(data.gesamtforderung), pageWidth - margin - 2, y, { align: 'right' })
  y += 10

  // Zahlungsfrist
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Bitte überweisen Sie den Betrag bis spätestens ${formatDateStr(data.zahlungsfrist)} auf folgendes Konto:`, margin, y)
  y += 8

  // Bankverbindung
  doc.setFillColor(250, 250, 250)
  doc.rect(margin, y, pageWidth - 2 * margin, 18, 'F')
  y += 5

  doc.text(`Kontoinhaber: ${data.bankinhaber}`, margin + 3, y)
  y += 5
  doc.text(`IBAN: ${data.iban}`, margin + 3, y)
  y += 5
  doc.text(`Verwendungszweck: ${data.verwendungszweck}`, margin + 3, y)
  y += 10

  // Konsequenzen
  if (data.androhungKuendigung || data.androhungInkasso) {
    y += 3
    doc.setFont('helvetica', 'bold')
    doc.text('Wichtiger Hinweis:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')

    if (data.androhungKuendigung) {
      const kuendigungsText = 'Sollte die Zahlung nicht fristgerecht erfolgen, sehen wir uns gezwungen, das Mietverhältnis gemäß § 543 Abs. 2 Nr. 3 BGB fristlos zu kündigen.'
      const kuendigungsLines = doc.splitTextToSize(kuendigungsText, pageWidth - 2 * margin)
      for (const line of kuendigungsLines) {
        doc.text(line, margin, y)
        y += 5
      }
      y += 2
    }

    if (data.androhungInkasso) {
      const inkassoText = 'Bei weiterem Zahlungsverzug werden wir die Forderung an ein Inkassounternehmen übergeben bzw. gerichtlich geltend machen. Die dadurch entstehenden Kosten gehen zu Ihren Lasten.'
      const inkassoLines = doc.splitTextToSize(inkassoText, pageWidth - 2 * margin)
      for (const line of inkassoLines) {
        doc.text(line, margin, y)
        y += 5
      }
    }
    y += 5
  }

  // Schlusstext
  if (data.mahnungsstufe === 1) {
    doc.text('Sollte sich diese Mahnung mit Ihrer Zahlung gekreuzt haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.', margin, y)
    y += 8
  }

  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 15

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 60, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.vermieter), margin, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 20, 50, 15)
  }

  // Speichern
  const stufenText = data.mahnungsstufe === 1 ? '1_Mahnung' : data.mahnungsstufe === 2 ? '2_Mahnung' : '3_Mahnung'
  const filename = `${stufenText}_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
