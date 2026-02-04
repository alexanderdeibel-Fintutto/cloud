import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  kuendigungVom: string
  raeumungBis: string
  gruende: string[]
  rueckstaende: number | null
  fristsetzung: boolean
  fristBis: string
  androhungRaeumungsklage: boolean
  sonstigeForderungen: string
  unterschriftVermieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const GRUENDE_LABELS: Record<string, string> = {
  kuendigung: 'Wirksame Kündigung des Mietverhältnisses',
  mietrueckstand: 'Erhebliche Mietrückstände',
  vertragsverletzung: 'Schwerwiegende Vertragsverletzungen',
  eigenbedarf: 'Angemeldeter Eigenbedarf',
  fristablauf: 'Ablauf eines befristeten Mietvertrags',
}

export async function generateRaeumungsaufforderungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(220, 38, 38) // Red
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
  doc.text(formatAddress(data.mieterAdresse), margin, y)
  y += 12

  // Datum
  doc.text(formatDateStr(data.erstelltAm), pageWidth - margin, y, { align: 'right' })
  y += 10

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(220, 38, 38)
  doc.text('Räumungsaufforderung', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 12

  // Anrede
  const getAnrede = (p: { anrede: string; titel?: string; nachname: string }) => {
    if (p.anrede === 'Frau') return `Sehr geehrte Frau ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    if (p.anrede === 'Herr') return `Sehr geehrter Herr ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    return 'Sehr geehrte Damen und Herren'
  }
  doc.text(getAnrede(data.mieter) + ',', margin, y)
  y += 8

  // Einleitung
  let einleitung = `hiermit fordere ich Sie auf, das oben genannte Mietobjekt bis spätestens zum ${formatDateStr(data.raeumungBis)} zu räumen und an mich herauszugeben.`
  const einleitungLines = doc.splitTextToSize(einleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Gründe
  checkPageBreak(40)
  doc.setFont('helvetica', 'bold')
  doc.text('Begründung:', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  for (const grund of data.gruende) {
    if (GRUENDE_LABELS[grund]) {
      checkPageBreak(6)
      doc.text(`• ${GRUENDE_LABELS[grund]}`, margin + 5, y)
      y += 5
    }
  }

  if (data.kuendigungVom) {
    y += 3
    doc.text(`Das Mietverhältnis wurde mit Schreiben vom ${formatDateStr(data.kuendigungVom)} gekündigt.`, margin, y)
    y += 8
  }

  // Rückstände
  if (data.rueckstaende && data.rueckstaende > 0) {
    checkPageBreak(25)
    doc.setFillColor(254, 226, 226)
    doc.rect(margin, y, pageWidth - 2 * margin, 15, 'F')
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.text('Offene Mietrückstände:', margin + 5, y)
    doc.text(formatCurrency(data.rueckstaende), margin + 80, y)
    doc.setFont('helvetica', 'normal')
    y += 15
  }

  // Fristsetzung
  if (data.fristsetzung && data.fristBis) {
    checkPageBreak(15)
    const frist = `Ich setze Ihnen eine letzte Frist bis zum ${formatDateStr(data.fristBis)}, um die Wohnung freiwillig zu räumen.`
    const fristLines = doc.splitTextToSize(frist, pageWidth - 2 * margin)
    for (const line of fristLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Androhung Räumungsklage
  if (data.androhungRaeumungsklage) {
    checkPageBreak(25)
    doc.setFillColor(254, 243, 199)
    doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.text('Wichtiger Hinweis:', margin + 5, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const warnung = 'Sollten Sie dieser Aufforderung nicht fristgerecht nachkommen, behalte ich mir vor, eine Räumungsklage zu erheben.'
    const warnungLines = doc.splitTextToSize(warnung, pageWidth - 2 * margin - 10)
    for (const line of warnungLines) {
      doc.text(line, margin + 5, y)
      y += 5
    }
    y += 10
  }

  // Sonstige Forderungen
  if (data.sonstigeForderungen) {
    checkPageBreak(20)
    doc.text('Weitere Forderungen:', margin, y)
    y += 5
    const sonstigeLines = doc.splitTextToSize(data.sonstigeForderungen, pageWidth - 2 * margin)
    for (const line of sonstigeLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Schluss
  checkPageBreak(40)
  y += 5
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 20

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.vermieter), margin, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Räumungsaufforderung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Raeumungsaufforderung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
