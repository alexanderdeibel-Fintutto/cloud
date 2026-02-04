import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietvertragVom?: string
  bedarfsperson: string
  bedarfspersonVerhaeltnis: string
  bedarfsgrund: string
  detaillierteBegrundung: string
  kuendigungsfrist: string
  kuendigungZum: string
  unterschriftVermieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const VERHAELTNIS_LABELS: Record<string, string> = {
  selbst: 'mich selbst',
  ehepartner: 'meinen Ehepartner/Lebenspartner',
  kind: 'mein Kind',
  eltern: 'meine Eltern',
  geschwister: 'meine Geschwister',
  enkel: 'meine Enkel',
  grosseltern: 'meine Großeltern',
  sonstige: 'einen Familienangehörigen',
}

const BEDARFSGRUND_LABELS: Record<string, string> = {
  wohnbedarf: 'Eigener Wohnbedarf',
  familiengruendung: 'Familiengründung bzw. Nachwuchs',
  pflegebedarf: 'Pflegebedarf bzw. räumliche Nähe zu Pflegebedürftigen',
  arbeitsplatz: 'Arbeitsplatzwechsel bzw. Nähe zum Arbeitsplatz',
  trennung: 'Trennung bzw. Scheidung',
  rueckzug: 'Rückzug ins Eigentum im Alter',
  sonstige: 'sonstiger dringender Eigenbedarf',
}

export async function generateEigenbedarfskuendigungPDF(data: PDFData): Promise<void> {
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

  // Header - Rot für Kündigung
  doc.setFillColor(220, 38, 38)
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

  // Datum rechtsbündig
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, pageWidth - margin, y, { align: 'right' })
  y += 12

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Kündigung des Mietverhältnisses wegen Eigenbedarf', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`gemäß § 573 Abs. 2 Nr. 2 BGB`, margin, y)
  y += 5
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  if (data.mietvertragVom) {
    y += 5
    doc.text(`Mietvertrag vom: ${formatDateStr(data.mietvertragVom)}`, margin, y)
  }
  y += 12

  // Anrede
  doc.text(getAnrede(data.mieter) + ',', margin, y)
  y += 8

  // Kündigung
  const kuendigungText = `hiermit kündige ich das oben genannte Mietverhältnis ordentlich wegen Eigenbedarf ` +
    `zum ${formatDateStr(data.kuendigungZum)}, hilfsweise zum nächstmöglichen Zeitpunkt.`
  const kuendigungLines = doc.splitTextToSize(kuendigungText, pageWidth - 2 * margin)
  for (const line of kuendigungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Eigenbedarf Begründung
  checkPageBreak(60)
  doc.setFont('helvetica', 'bold')
  doc.text('Begründung des Eigenbedarfs:', margin, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  const verhaeltnisText = VERHAELTNIS_LABELS[data.bedarfspersonVerhaeltnis] || data.bedarfspersonVerhaeltnis
  const grundText = BEDARFSGRUND_LABELS[data.bedarfsgrund] || data.bedarfsgrund

  const begruendungEinleitung = `Ich benötige die Wohnung für ${verhaeltnisText}` +
    (data.bedarfsperson && data.bedarfspersonVerhaeltnis !== 'selbst' ? `, ${data.bedarfsperson},` : '') +
    ` aus folgendem Grund: ${grundText}.`

  const einleitungLines = doc.splitTextToSize(begruendungEinleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Detaillierte Begründung
  if (data.detaillierteBegrundung) {
    doc.text('Im Einzelnen:', margin, y)
    y += 6

    const detailLines = doc.splitTextToSize(data.detaillierteBegrundung, pageWidth - 2 * margin)
    for (const line of detailLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Ernstlichkeit
  checkPageBreak(25)
  const ernstlichkeitText = 'Der Eigenbedarf besteht ernsthaft und nachhaltig. Ich versichere, dass ' +
    'keine anderweitigen Wohnmöglichkeiten bestehen, die den Bedarf decken könnten.'
  const ernstlichkeitLines = doc.splitTextToSize(ernstlichkeitText, pageWidth - 2 * margin)
  for (const line of ernstlichkeitLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Widerspruchsbelehrung
  checkPageBreak(45)
  doc.setFont('helvetica', 'bold')
  doc.text('Widerspruchsrecht (§ 574 BGB):', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  const widerspruchText = 'Sie können dieser Kündigung widersprechen und die Fortsetzung des Mietverhältnisses ' +
    'verlangen, wenn die Beendigung des Mietverhältnisses für Sie, Ihre Familie oder einen anderen ' +
    'Angehörigen Ihres Haushalts eine Härte bedeuten würde, die auch unter Würdigung meiner berechtigten ' +
    'Interessen nicht zu rechtfertigen ist. Der Widerspruch ist in Textform zu erklären und muss mir ' +
    'spätestens zwei Monate vor Beendigung des Mietverhältnisses zugehen. Auf Verlangen sollen die ' +
    'Härtegründe glaubhaft gemacht werden.'
  const widerspruchLines = doc.splitTextToSize(widerspruchText, pageWidth - 2 * margin)
  for (const line of widerspruchLines) {
    checkPageBreak(6)
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Rückgabe
  checkPageBreak(25)
  doc.setFont('helvetica', 'bold')
  doc.text('Wohnungsrückgabe:', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  const rueckgabeText = `Ich bitte Sie, die Wohnung zum ${formatDateStr(data.kuendigungZum)} ` +
    'geräumt, gereinigt und mit allen Schlüsseln an mich zurückzugeben. ' +
    'Für die Übergabe werden wir rechtzeitig einen Termin vereinbaren.'
  const rueckgabeLines = doc.splitTextToSize(rueckgabeText, pageWidth - 2 * margin)
  for (const line of rueckgabeLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Hinweis
  checkPageBreak(20)
  doc.setFontSize(9)
  doc.setTextColor(100)
  const hinweisText = 'Hinweis: Ich versichere, dass der Eigenbedarf tatsächlich besteht. ' +
    'Mir ist bekannt, dass vorgetäuschter Eigenbedarf Schadensersatzansprüche begründen kann.'
  const hinweisLines = doc.splitTextToSize(hinweisText, pageWidth - 2 * margin)
  for (const line of hinweisLines) {
    doc.text(line, margin, y)
    y += 4
  }
  y += 8

  // Grußformel
  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 15

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.vermieter), margin, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, 60, 20)
  }

  // Empfangsbestätigung auf neuer Seite
  doc.addPage()
  y = margin

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Empfangsbestätigung', margin, y)
  y += 12

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const empfangText = `Ich bestätige hiermit, das Kündigungsschreiben vom ${formatDateStr(data.erstelltAm)} ` +
    `betreffend die Wohnung ${formatAddress(data.mietobjektAdresse)} erhalten zu haben.`
  const empfangLines = doc.splitTextToSize(empfangText, pageWidth - 2 * margin)
  for (const line of empfangLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 20

  doc.text('Ort, Datum: _________________________________', margin, y)
  y += 20

  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Unterschrift Mieter', margin, y)

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Eigenbedarfskündigung gemäß § 573 Abs. 2 Nr. 2 BGB', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Eigenbedarfskuendigung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
