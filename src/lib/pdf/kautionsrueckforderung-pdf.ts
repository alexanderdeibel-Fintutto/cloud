import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterNeueAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietverhaeltnisEnde: string
  wohnungsuebergabe: string
  kautionHoehe: number | null
  kautionArt: 'barkaution' | 'sparbuch' | 'buergschaft'
  kautionEingezahltAm?: string
  bankinhaber: string
  iban: string
  bic?: string
  fristBis: string
  unterschriftMieter?: { imageData: string | null; signerName: string; signedAt: string | null }
  erstelltAm: string
}

const KAUTION_ART_LABELS: Record<string, string> = {
  barkaution: 'Barkaution',
  sparbuch: 'Sparbuch / Kautionskonto',
  buergschaft: 'Bankbürgschaft',
}

export async function generateKautionsrueckforderungPDF(data: PDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = margin

  const formatPerson = (p: { anrede?: string; titel?: string; vorname: string; nachname: string }) =>
    [p.titel, p.vorname, p.nachname].filter(Boolean).join(' ')

  const formatPersonFull = (p: { anrede?: string; titel?: string; vorname: string; nachname: string }) =>
    [p.anrede, p.titel, p.vorname, p.nachname].filter(Boolean).join(' ')

  const formatAddress = (a: { strasse: string; hausnummer: string; plz: string; ort: string }) =>
    `${a.strasse} ${a.hausnummer}, ${a.plz} ${a.ort}`

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return '—'
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de })
  }

  // Absender (Mieter mit neuer Adresse)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.mieter), margin, y)
  y += 4
  doc.text(`${data.mieterNeueAdresse.strasse} ${data.mieterNeueAdresse.hausnummer}`, margin, y)
  y += 4
  doc.text(`${data.mieterNeueAdresse.plz} ${data.mieterNeueAdresse.ort}`, margin, y)
  y += 15

  // Empfänger (Vermieter)
  doc.setFont('helvetica', 'bold')
  doc.text(formatPersonFull(data.vermieter), margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.vermieterAdresse.strasse} ${data.vermieterAdresse.hausnummer}`, margin, y)
  y += 4
  doc.text(`${data.vermieterAdresse.plz} ${data.vermieterAdresse.ort}`, margin, y)
  y += 15

  // Datum rechtsbündig
  doc.text(formatDateStr(data.erstelltAm), pageWidth - margin, y, { align: 'right' })
  y += 12

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Rückforderung der Mietkaution', margin, y)
  y += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 10

  // Anrede
  const anrede = data.vermieter.anrede === 'Frau' ? 'Sehr geehrte Frau' : 'Sehr geehrter Herr'
  doc.text(`${anrede} ${data.vermieter.nachname},`, margin, y)
  y += 10

  // Text
  const text1 = `das Mietverhältnis für die oben genannte Wohnung endete am ${formatDateStr(data.mietverhaeltnisEnde)}. Die Wohnungsübergabe erfolgte am ${formatDateStr(data.wohnungsuebergabe)}.`

  const lines1 = doc.splitTextToSize(text1, pageWidth - 2 * margin)
  for (const line of lines1) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Kaution Details
  doc.setFont('helvetica', 'bold')
  doc.text('Angaben zur Kaution:', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  doc.text(`• Art der Kaution: ${KAUTION_ART_LABELS[data.kautionArt] || data.kautionArt}`, margin + 3, y)
  y += 5

  if (data.kautionHoehe) {
    doc.text(`• Kautionshöhe: ${formatCurrency(data.kautionHoehe)}`, margin + 3, y)
    y += 5
  }

  if (data.kautionEingezahltAm) {
    doc.text(`• Eingezahlt am: ${formatDateStr(data.kautionEingezahltAm)}`, margin + 3, y)
    y += 5
  }
  y += 5

  // Forderung
  const text2 = `Hiermit fordere ich Sie auf, die Mietkaution ${data.kautionHoehe ? `in Höhe von ${formatCurrency(data.kautionHoehe)} ` : ''}zuzüglich der angefallenen Zinsen bis zum ${formatDateStr(data.fristBis)} auf folgendes Konto zu überweisen:`

  const lines2 = doc.splitTextToSize(text2, pageWidth - 2 * margin)
  for (const line of lines2) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Bankverbindung Box
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(250, 250, 250)
  doc.rect(margin, y, pageWidth - 2 * margin, 22, 'FD')
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Bankverbindung:', margin + 5, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`Kontoinhaber: ${data.bankinhaber}`, margin + 5, y)
  y += 5
  const ibanFormatted = data.iban.replace(/(.{4})/g, '$1 ').trim()
  doc.text(`IBAN: ${ibanFormatted}`, margin + 5, y)
  if (data.bic) {
    doc.text(`BIC: ${data.bic}`, margin + 100, y)
  }
  y += 12

  // Rechtshinweis
  doc.setFillColor(255, 250, 240)
  doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F')
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Hinweis:', margin + 3, y)
  doc.setFont('helvetica', 'normal')
  y += 4

  const hinweisText = 'Nach ständiger Rechtsprechung des BGH (Urteil vom 18.01.2006, Az. VIII ZR 71/05) hat der Vermieter die Kaution spätestens nach einer angemessenen Prüfungsfrist zurückzuzahlen. Diese beträgt in der Regel drei bis sechs Monate nach Beendigung des Mietverhältnisses.'

  const hinweisLines = doc.splitTextToSize(hinweisText, pageWidth - 2 * margin - 6)
  for (const line of hinweisLines) {
    doc.text(line, margin + 3, y)
    y += 4
  }
  y += 10

  // Schlussformel
  doc.setFontSize(10)
  const text3 = 'Sollte die Rückzahlung nicht fristgerecht erfolgen, behalte ich mir rechtliche Schritte vor.'

  const lines3 = doc.splitTextToSize(text3, pageWidth - 2 * margin)
  for (const line of lines3) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

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

  // Speichern
  const filename = `Kautionsrueckforderung_${formatPerson(data.mieter).replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
