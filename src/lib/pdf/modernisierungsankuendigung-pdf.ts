import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format, addMonths } from 'date-fns'
import { de } from 'date-fns/locale'

interface Massnahme {
  id: string
  beschreibung: string
  dauer: string
  kosten: number | null
}

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  wohnungsNr?: string
  massnahmen: Massnahme[]
  gruende: string[]
  sonstigerGrund?: string
  geplanterBeginn: string
  voraussichtlicheDauer?: string
  gesamtkosten?: number | null
  mieterAnteil?: number | null
  voraussichtlicheErhoehung?: number | null
  haertefallHinweis: boolean
  ansprechpartner?: string
  erstelltAm: string
}

const GRUND_LABELS: Record<string, string> = {
  energie: 'Energetische Modernisierung (Verbesserung der Energieeffizienz)',
  wasser: 'Nachhaltiger Einsparung von Wasser',
  wohnwert: 'Nachhaltiger Erhöhung des Gebrauchswerts der Mietsache',
  wohnverhaeltnisse: 'Verbesserung der allgemeinen Wohnverhältnisse',
  klimaschutz: 'Umsetzung von Klimaschutzmaßnahmen',
  barrierefreiheit: 'Herstellung von Barrierefreiheit',
}

export async function generateModernisierungsankuendigungPDF(data: PDFData): Promise<void> {
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

  // Header
  doc.setFillColor(249, 115, 22)
  doc.rect(0, 0, pageWidth, 10, 'F')

  // Absender
  y = 18
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`${formatPerson(data.vermieter)} • ${formatAddress(data.vermieterAdresse)}`, margin, y)
  y += 10

  // Empfänger
  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text(formatPerson(data.mieter), margin, y)
  y += 5
  doc.text(formatAddress(data.mietobjektAdresse), margin, y)
  y += 12

  // Datum
  doc.text(formatDateStr(data.erstelltAm), pageWidth - margin, y, { align: 'right' })
  y += 10

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.text('Ankündigung von Modernisierungsmaßnahmen', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`gemäß § 555c BGB`, margin, y)
  y += 5
  const objektText = `Mietobjekt: ${formatAddress(data.mietobjektAdresse)}${data.wohnungsNr ? ', ' + data.wohnungsNr : ''}`
  doc.text(objektText, margin, y)
  y += 10

  // Anrede
  doc.text(getAnrede(data.mieter) + ',', margin, y)
  y += 8

  // Einleitung
  const einleitung = `hiermit kündige ich Ihnen gemäß § 555c BGB folgende Modernisierungsmaßnahmen an, die ich an der von Ihnen bewohnten Wohnung durchführen werde:`
  const einleitungLines = doc.splitTextToSize(einleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Maßnahmen
  checkPageBreak(40)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Art und Umfang der Modernisierungsmaßnahmen:', margin, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  for (let i = 0; i < data.massnahmen.length; i++) {
    const m = data.massnahmen[i]
    if (m.beschreibung) {
      checkPageBreak(20)
      doc.setFillColor(250, 250, 250)
      const boxHeight = m.dauer || m.kosten ? 18 : 12
      doc.rect(margin, y, pageWidth - 2 * margin, boxHeight, 'F')

      y += 5
      const beschreibungLines = doc.splitTextToSize(`${i + 1}. ${m.beschreibung}`, pageWidth - 2 * margin - 10)
      for (const line of beschreibungLines) {
        doc.text(line, margin + 5, y)
        y += 5
      }

      if (m.dauer || m.kosten) {
        let details = []
        if (m.dauer) details.push(`Dauer: ${m.dauer}`)
        if (m.kosten) details.push(`Geschätzte Kosten: ${formatCurrency(m.kosten)}`)
        doc.setFontSize(9)
        doc.text(details.join(' | '), margin + 5, y)
        doc.setFontSize(10)
        y += 5
      }
      y += 5
    }
  }
  y += 5

  // Gründe
  if (data.gruende.length > 0 || data.sonstigerGrund) {
    checkPageBreak(30)
    doc.setFont('helvetica', 'bold')
    doc.text('2. Gründe der Modernisierung (§ 555b BGB):', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.text('Die Maßnahmen dienen:', margin, y)
    y += 6

    for (const grund of data.gruende) {
      if (GRUND_LABELS[grund]) {
        doc.text(`• ${GRUND_LABELS[grund]}`, margin + 3, y)
        y += 5
      }
    }
    if (data.sonstigerGrund) {
      doc.text(`• ${data.sonstigerGrund}`, margin + 3, y)
      y += 5
    }
    y += 5
  }

  // Zeitplan
  checkPageBreak(25)
  doc.setFont('helvetica', 'bold')
  doc.text('3. Voraussichtlicher Beginn und Dauer:', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`Geplanter Beginn: ${formatDateStr(data.geplanterBeginn)}`, margin, y)
  y += 5
  if (data.voraussichtlicheDauer) {
    doc.text(`Voraussichtliche Dauer: ${data.voraussichtlicheDauer}`, margin, y)
    y += 5
  }
  y += 5

  // Mieterhöhung
  if (data.voraussichtlicheErhoehung || data.mieterAnteil) {
    checkPageBreak(35)
    doc.setFont('helvetica', 'bold')
    doc.text('4. Voraussichtliche Mieterhöhung (§ 559 BGB):', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    if (data.gesamtkosten) {
      doc.text(`Gesamtkosten der Maßnahmen: ${formatCurrency(data.gesamtkosten)}`, margin, y)
      y += 5
    }
    if (data.mieterAnteil) {
      doc.text(`Auf Ihre Wohnung entfallender Anteil: ${formatCurrency(data.mieterAnteil)}`, margin, y)
      y += 5
    }
    if (data.voraussichtlicheErhoehung) {
      doc.setFont('helvetica', 'bold')
      doc.text(`Voraussichtliche monatliche Mieterhöhung: ${formatCurrency(data.voraussichtlicheErhoehung)}`, margin, y)
      doc.setFont('helvetica', 'normal')
      y += 5
    }

    const hinweisText = 'Die endgültige Mieterhöhung wird Ihnen nach Abschluss der Maßnahmen gesondert mitgeteilt.'
    doc.text(hinweisText, margin, y)
    y += 8
  }

  // Härtefallhinweis
  if (data.haertefallHinweis) {
    checkPageBreak(40)
    doc.setFont('helvetica', 'bold')
    doc.text('5. Hinweis zu Ihren Rechten (§ 555d BGB):', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    const haertefallText = 'Sie können bis zum Ablauf des Monats, der auf den Zugang dieser Ankündigung folgt, ' +
      'in Textform Umstände mitteilen, die dazu führen, dass die Modernisierung für Sie, Ihre Familie oder ' +
      'einen Angehörigen Ihres Haushalts eine Härte bedeuten würde, die auch unter Würdigung der berechtigten ' +
      'Interessen des Vermieters nicht zu rechtfertigen ist. Dies gilt auch für die zu erwartende Mieterhöhung.'
    const haertefallLines = doc.splitTextToSize(haertefallText, pageWidth - 2 * margin)
    for (const line of haertefallLines) {
      doc.text(line, margin, y)
      y += 5
    }

    // Frist berechnen
    if (data.erstelltAm) {
      const fristDatum = format(addMonths(new Date(data.erstelltAm), 1), 'MMMM yyyy', { locale: de })
      doc.setFont('helvetica', 'bold')
      y += 3
      doc.text(`Frist für Einwände: Ende ${fristDatum}`, margin, y)
      doc.setFont('helvetica', 'normal')
    }
    y += 8
  }

  // Duldungspflicht
  checkPageBreak(25)
  doc.setFont('helvetica', 'bold')
  doc.text('Duldungspflicht:', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  const duldungText = 'Gemäß § 555d Abs. 1 BGB sind Sie verpflichtet, die angekündigten Modernisierungsmaßnahmen ' +
    'zu dulden. Wir werden uns bemühen, die Beeinträchtigungen so gering wie möglich zu halten.'
  const duldungLines = doc.splitTextToSize(duldungText, pageWidth - 2 * margin)
  for (const line of duldungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Ansprechpartner
  if (data.ansprechpartner) {
    checkPageBreak(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Ansprechpartner:', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    const ansprechLines = doc.splitTextToSize(data.ansprechpartner, pageWidth - 2 * margin)
    for (const line of ansprechLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Grußformel
  checkPageBreak(25)
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 15

  doc.setDrawColor(0)
  doc.line(margin, y, margin + 60, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.vermieter), margin, y)

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Modernisierungsankündigung gemäß § 555c BGB', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Modernisierungsankuendigung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
