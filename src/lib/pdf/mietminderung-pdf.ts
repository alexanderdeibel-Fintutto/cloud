import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mangelKategorie: string
  mangelBeschreibung: string
  mangelSeit: string
  maengelanzeigeDatum?: string
  aktuelleMiete: number | null
  minderungsquote: string
  minderungsbetrag: number | null
  forderungAb: string
  fristsetzung: string
  erstelltAm: string
}

const MANGEL_LABELS: Record<string, string> = {
  heizung: 'Heizungsausfall / unzureichende Heizung',
  feuchtigkeit: 'Feuchtigkeit / Schimmelbefall',
  laerm: 'Lärmbelästigung',
  wasser: 'Wasserversorgung / Warmwasser',
  elektrik: 'Elektrische Anlagen',
  fenster: 'Fenster / Türen',
  sanitaer: 'Sanitäranlagen',
  ungeziefer: 'Ungeziefer / Schädlingsbefall',
  sonstige: 'Sonstige Mängel',
}

export async function generateMietminderungPDF(data: PDFData): Promise<void> {
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

  // Absender (Mieter)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(`${formatPerson(data.mieter)} • ${formatAddress(data.mieterAdresse)}`, margin, y)
  y += 8

  // Empfänger (Vermieter)
  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text(formatPerson(data.vermieter), margin, y)
  y += 5
  doc.text(data.vermieterAdresse.strasse + ' ' + data.vermieterAdresse.hausnummer, margin, y)
  y += 5
  doc.text(data.vermieterAdresse.plz + ' ' + data.vermieterAdresse.ort, margin, y)
  y += 15

  // Datum rechtsbündig
  doc.text(formatDateStr(data.erstelltAm), pageWidth - margin, y, { align: 'right' })
  y += 10

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.text('Mietminderung gemäß § 536 BGB', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 10

  // Anrede
  doc.text(getAnrede(data.vermieter) + ',', margin, y)
  y += 8

  // Einleitung
  const einleitung = `hiermit zeige ich Ihnen an, dass ich die Miete für die oben genannte Wohnung ab dem ${formatDateStr(data.forderungAb)} um ${data.minderungsquote}% mindere. Die Minderung beruht auf einem erheblichen Mangel der Mietsache gemäß § 536 BGB.`
  const einleitungLines = doc.splitTextToSize(einleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Mangelbeschreibung
  doc.setFont('helvetica', 'bold')
  doc.text('Mangelbeschreibung:', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`Art des Mangels: ${MANGEL_LABELS[data.mangelKategorie] || data.mangelKategorie}`, margin, y)
  y += 5
  doc.text(`Der Mangel besteht seit: ${formatDateStr(data.mangelSeit)}`, margin, y)
  y += 8

  const beschreibungLines = doc.splitTextToSize(data.mangelBeschreibung, pageWidth - 2 * margin)
  for (const line of beschreibungLines) {
    checkPageBreak(6)
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  if (data.maengelanzeigeDatum) {
    doc.text(`Der Mangel wurde Ihnen bereits am ${formatDateStr(data.maengelanzeigeDatum)} angezeigt.`, margin, y)
    y += 8
  }

  // Minderungsberechnung
  checkPageBreak(35)
  doc.setFont('helvetica', 'bold')
  doc.text('Minderungsberechnung:', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFillColor(250, 250, 250)
  doc.rect(margin, y, pageWidth - 2 * margin, 22, 'F')
  y += 6

  doc.text(`Bruttowarmmiete: ${formatCurrency(data.aktuelleMiete || 0)}`, margin + 5, y)
  y += 5
  doc.text(`Minderungsquote: ${data.minderungsquote}%`, margin + 5, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text(`Monatlicher Minderungsbetrag: ${formatCurrency(data.minderungsbetrag || 0)}`, margin + 5, y)
  y += 12

  // Geminderte Miete
  doc.setFont('helvetica', 'normal')
  const geminderterBetrag = (data.aktuelleMiete || 0) - (data.minderungsbetrag || 0)
  doc.text(`Die geminderte Miete beträgt somit monatlich ${formatCurrency(geminderterBetrag)}.`, margin, y)
  y += 8

  // Fristsetzung
  checkPageBreak(25)
  doc.setFont('helvetica', 'bold')
  doc.text('Aufforderung zur Mängelbeseitigung:', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  const fristDatum = data.erstelltAm
    ? format(addDays(new Date(data.erstelltAm), parseInt(data.fristsetzung)), 'dd.MM.yyyy', { locale: de })
    : '—'

  const aufforderungText = `Ich fordere Sie hiermit auf, den oben beschriebenen Mangel bis spätestens zum ${fristDatum} (${data.fristsetzung} Tage ab Zugang dieses Schreibens) zu beseitigen. Nach erfolgter Mängelbeseitigung werde ich die Miete wieder in voller Höhe entrichten.`
  const aufforderungLines = doc.splitTextToSize(aufforderungText, pageWidth - 2 * margin)
  for (const line of aufforderungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Rechtlicher Hinweis
  checkPageBreak(20)
  const hinweisText = 'Ich weise darauf hin, dass ich mir weitere rechtliche Schritte vorbehalte, sollte der Mangel nicht fristgerecht behoben werden.'
  const hinweisLines = doc.splitTextToSize(hinweisText, pageWidth - 2 * margin)
  for (const line of hinweisLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Grußformel
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 15

  // Unterschriftszeile
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 60, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.mieter), margin, y)

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Mietminderung gemäß § 536 BGB', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Mietminderung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
