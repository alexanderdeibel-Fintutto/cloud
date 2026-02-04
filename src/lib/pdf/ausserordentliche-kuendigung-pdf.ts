import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  absenderRolle: 'vermieter' | 'mieter'
  absender: { anrede: string; titel?: string; vorname: string; nachname: string }
  absenderAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  empfaenger: { anrede: string; titel?: string; vorname: string; nachname: string }
  empfaengerAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  kuendigungsgrund: string
  kuendigungsgrundDetails: string
  abmahnungErfolgt: boolean
  abmahnungDatum?: string
  kuendigungZum?: string
  fristlos: boolean
  erstelltAm: string
  unterschriftAbsender?: { imageData: string | null }
}

const KUENDIGUNGSGRUND_LABELS: Record<string, string> = {
  zahlungsverzug: 'Zahlungsverzug (§ 543 Abs. 2 Nr. 3 BGB)',
  stoerung: 'Nachhaltige Störung des Hausfriedens',
  vertragsbruch: 'Erhebliche Vertragsverletzung',
  gesundheit: 'Gesundheitsgefährdung (§ 569 Abs. 1 BGB)',
  sonstige: 'Sonstiger wichtiger Grund',
}

export async function generateAusserordentlicheKuendigungPDF(data: PDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let y = margin

  const formatPerson = (p: { titel?: string; vorname: string; nachname: string }) =>
    [p.titel, p.vorname, p.nachname].filter(Boolean).join(' ')

  const formatPersonFull = (p: { anrede?: string; titel?: string; vorname: string; nachname: string }) =>
    [p.anrede, p.titel, p.vorname, p.nachname].filter(Boolean).join(' ')

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

  // Header - rot für Dringlichkeit
  doc.setFillColor(220, 38, 38)
  doc.rect(0, 0, pageWidth, 10, 'F')

  // Absender
  y = 20
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0)
  doc.text(formatPerson(data.absender), margin, y)
  y += 4
  doc.text(`${data.absenderAdresse.strasse} ${data.absenderAdresse.hausnummer}`, margin, y)
  y += 4
  doc.text(`${data.absenderAdresse.plz} ${data.absenderAdresse.ort}`, margin, y)
  y += 15

  // Empfänger
  doc.setFont('helvetica', 'bold')
  doc.text(formatPersonFull(data.empfaenger), margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.empfaengerAdresse.strasse} ${data.empfaengerAdresse.hausnummer}`, margin, y)
  y += 4
  doc.text(`${data.empfaengerAdresse.plz} ${data.empfaengerAdresse.ort}`, margin, y)
  y += 15

  // Datum rechtsbündig
  doc.text(formatDateStr(data.erstelltAm), pageWidth - margin, y, { align: 'right' })
  y += 12

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(220, 38, 38)
  doc.text(data.fristlos ? 'Außerordentliche fristlose Kündigung' : 'Außerordentliche Kündigung', margin, y)
  y += 5
  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 10

  // Anrede
  const anrede = data.empfaenger.anrede === 'Frau' ? 'Sehr geehrte Frau' : 'Sehr geehrter Herr'
  doc.text(`${anrede} ${data.empfaenger.nachname},`, margin, y)
  y += 10

  // Kündigungserklärung
  const kuendigungText = data.fristlos
    ? `hiermit kündige ich das zwischen uns bestehende Mietverhältnis über die oben genannte Wohnung außerordentlich und fristlos mit sofortiger Wirkung.`
    : `hiermit kündige ich das zwischen uns bestehende Mietverhältnis über die oben genannte Wohnung außerordentlich zum ${formatDateStr(data.kuendigungZum || '')}.`

  const kuendLines = doc.splitTextToSize(kuendigungText, pageWidth - 2 * margin)
  for (const line of kuendLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Kündigungsgrund
  checkPageBreak(50)
  doc.setFont('helvetica', 'bold')
  doc.text('Kündigungsgrund:', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(KUENDIGUNGSGRUND_LABELS[data.kuendigungsgrund] || data.kuendigungsgrund, margin, y)
  y += 8

  if (data.kuendigungsgrundDetails) {
    const grundLines = doc.splitTextToSize(data.kuendigungsgrundDetails, pageWidth - 2 * margin)
    for (const line of grundLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Abmahnung
  if (data.abmahnungErfolgt && data.abmahnungDatum) {
    checkPageBreak(15)
    doc.text(`Ich weise darauf hin, dass bereits eine Abmahnung am ${formatDateStr(data.abmahnungDatum)} erfolgte,`, margin, y)
    y += 5
    doc.text('die zu keiner Verhaltensänderung geführt hat.', margin, y)
    y += 10
  }

  // Rechtliche Hinweise
  checkPageBreak(40)
  doc.setFillColor(254, 242, 242)
  doc.rect(margin, y, pageWidth - 2 * margin, 30, 'F')
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Rechtliche Grundlage:', margin + 3, y)
  y += 5
  doc.setFont('helvetica', 'normal')

  const rechtsText = 'Die außerordentliche Kündigung erfolgt gemäß § 543 BGB. Danach kann jede Vertragspartei ' +
    'das Mietverhältnis aus wichtigem Grund ohne Einhaltung einer Kündigungsfrist kündigen, wenn dem ' +
    'Kündigenden unter Berücksichtigung aller Umstände des Einzelfalls und unter Abwägung der beiderseitigen ' +
    'Interessen die Fortsetzung des Mietverhältnisses nicht zugemutet werden kann.'

  const rechtsLines = doc.splitTextToSize(rechtsText, pageWidth - 2 * margin - 6)
  for (const line of rechtsLines) {
    doc.text(line, margin + 3, y)
    y += 4
  }
  y += 12

  // Aufforderung
  checkPageBreak(25)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  if (data.absenderRolle === 'vermieter') {
    const auffText = 'Ich fordere Sie auf, die Wohnung unverzüglich zu räumen und in einem ordnungsgemäßen ' +
      'Zustand an mich zurückzugeben. Die Schlüssel sind bei Auszug zu übergeben.'
    const auffLines = doc.splitTextToSize(auffText, pageWidth - 2 * margin)
    for (const line of auffLines) {
      doc.text(line, margin, y)
      y += 5
    }
  } else {
    doc.text('Ich bitte um Bestätigung des Zugangs dieser Kündigung.', margin, y)
  }
  y += 10

  // Vorsorglich ordentliche Kündigung
  checkPageBreak(20)
  const vorsorgText = 'Vorsorglich kündige ich das Mietverhältnis hiermit auch ordentlich zum nächstmöglichen Termin.'
  const vorsorgLines = doc.splitTextToSize(vorsorgText, pageWidth - 2 * margin)
  for (const line of vorsorgLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 10

  // Grußformel
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 20

  // Unterschrift
  checkPageBreak(30)
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.absender), margin, y)

  if (data.unterschriftAbsender?.imageData) {
    doc.addImage(data.unterschriftAbsender.imageData, 'PNG', margin, y - 25, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Außerordentliche Kündigung gemäß § 543 BGB – Zustellung per Einschreiben empfohlen', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Ausserordentliche_Kuendigung_${formatPerson(data.empfaenger).replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
