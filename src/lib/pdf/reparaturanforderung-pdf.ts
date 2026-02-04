import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string; telefon?: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  bereich: string
  dringlichkeit: string
  beschreibung: string
  festgestelltAm: string
  erreichbarkeit: string[]
  telefonErreichbar?: string
  sonstigeHinweise?: string
  erstelltAm: string
}

const BEREICH_LABELS: Record<string, string> = {
  sanitaer: 'Sanitär (Bad, WC, Waschbecken)',
  heizung: 'Heizung / Warmwasser',
  elektrik: 'Elektrik / Steckdosen / Licht',
  fenster: 'Fenster / Türen / Schlösser',
  wasser: 'Wasserschaden / Rohrbruch',
  wand: 'Wände / Decken / Böden',
  kueche: 'Küche / Einbaugeräte',
  balkon: 'Balkon / Terrasse',
  keller: 'Keller / Abstellräume',
  sonstige: 'Sonstiges',
}

const DRINGLICHKEIT_LABELS: Record<string, string> = {
  notfall: 'NOTFALL - Sofortige Maßnahmen erforderlich',
  dringend: 'Dringend - Innerhalb weniger Tage',
  normal: 'Normal - Baldige Reparatur gewünscht',
  gering: 'Gering - Kann warten',
}

const ERREICHBARKEIT_LABELS: Record<string, string> = {
  vormittags: 'Vormittags (8-12 Uhr)',
  nachmittags: 'Nachmittags (12-17 Uhr)',
  abends: 'Abends (17-20 Uhr)',
  samstags: 'Samstags',
}

export async function generateReparaturanforderungPDF(data: PDFData): Promise<void> {
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

  // Header - Farbe je nach Dringlichkeit
  if (data.dringlichkeit === 'notfall') {
    doc.setFillColor(220, 38, 38) // Rot
  } else if (data.dringlichkeit === 'dringend') {
    doc.setFillColor(249, 115, 22) // Orange
  } else {
    doc.setFillColor(34, 197, 94) // Grün
  }
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
  doc.text('Reparaturanforderung / Schadensmeldung', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 10

  // Dringlichkeits-Box
  if (data.dringlichkeit === 'notfall' || data.dringlichkeit === 'dringend') {
    doc.setFillColor(data.dringlichkeit === 'notfall' ? 254 : 255, data.dringlichkeit === 'notfall' ? 226 : 247, data.dringlichkeit === 'notfall' ? 226 : 237)
    doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(data.dringlichkeit === 'notfall' ? 153 : 194, data.dringlichkeit === 'notfall' ? 27 : 65, data.dringlichkeit === 'notfall' ? 27 : 12)
    doc.text(DRINGLICHKEIT_LABELS[data.dringlichkeit], pageWidth / 2, y + 7, { align: 'center' })
    doc.setTextColor(0)
    y += 15
  }

  // Anrede
  doc.setFont('helvetica', 'normal')
  doc.text(getAnrede(data.vermieter) + ',', margin, y)
  y += 8

  // Einleitung
  const einleitung = `hiermit melde ich folgenden Reparaturbedarf in der von mir gemieteten Wohnung:`
  doc.text(einleitung, margin, y)
  y += 10

  // Schadensdetails Box
  doc.setFillColor(250, 250, 250)
  doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F')
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Bereich:', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(BEREICH_LABELS[data.bereich] || data.bereich, margin + 40, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Dringlichkeit:', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(DRINGLICHKEIT_LABELS[data.dringlichkeit] || data.dringlichkeit, margin + 40, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Festgestellt am:', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDateStr(data.festgestelltAm), margin + 40, y)
  y += 12

  // Beschreibung
  checkPageBreak(40)
  doc.setFont('helvetica', 'bold')
  doc.text('Problembeschreibung:', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  const beschreibungLines = doc.splitTextToSize(data.beschreibung, pageWidth - 2 * margin)
  for (const line of beschreibungLines) {
    checkPageBreak(6)
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Erreichbarkeit
  checkPageBreak(35)
  doc.setFont('helvetica', 'bold')
  doc.text('Erreichbarkeit für Handwerker:', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  const erreichbarkeitText = data.erreichbarkeit
    .map(e => ERREICHBARKEIT_LABELS[e] || e)
    .join(', ')
  doc.text(erreichbarkeitText, margin, y)
  y += 6

  if (data.telefonErreichbar) {
    doc.text(`Telefon: ${data.telefonErreichbar}`, margin, y)
    y += 6
  }

  if (data.sonstigeHinweise) {
    y += 3
    doc.setFont('helvetica', 'bold')
    doc.text('Hinweise:', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    const hinweisLines = doc.splitTextToSize(data.sonstigeHinweise, pageWidth - 2 * margin)
    for (const line of hinweisLines) {
      doc.text(line, margin, y)
      y += 5
    }
  }
  y += 8

  // Bitte um Rückmeldung
  checkPageBreak(25)
  const schlussText = 'Ich bitte Sie, den Schaden zeitnah zu beheben bzw. einen Handwerkertermin zu vereinbaren. ' +
    'Bitte teilen Sie mir den Termin rechtzeitig mit.'
  const schlussLines = doc.splitTextToSize(schlussText, pageWidth - 2 * margin)
  for (const line of schlussLines) {
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
  doc.text('Reparaturanforderung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Reparaturanforderung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
