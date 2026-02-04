import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  raeume: string[]
  arbeiten: string[]
  farbvorgaben: string
  qualitaetsanforderungen: string
  fristBis: string
  durchfuehrung: string
  abnahmetermin: string
  sondervereinbarungen: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const RAEUME_LABELS: Record<string, string> = {
  wohnzimmer: 'Wohnzimmer',
  schlafzimmer: 'Schlafzimmer',
  kinderzimmer: 'Kinderzimmer',
  kueche: 'Küche',
  bad: 'Bad/WC',
  flur: 'Flur/Diele',
  abstellraum: 'Abstellraum',
  balkon: 'Balkon/Terrasse',
  keller: 'Keller',
}

const ARBEITEN_LABELS: Record<string, string> = {
  streichen_waende: 'Streichen der Wände',
  streichen_decken: 'Streichen der Decken',
  streichen_tueren: 'Streichen der Türen und Türrahmen',
  streichen_fenster: 'Streichen der Fenster (Innenseite)',
  streichen_heizkoerper: 'Streichen der Heizkörper',
  tapezieren: 'Tapezieren',
  fliesen_reinigen: 'Reinigen der Fliesen und Fugen',
  bodenbelag: 'Grundreinigung/Aufarbeitung Bodenbelag',
}

export async function generateSchoenheitsreparaturenPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(234, 179, 8) // Yellow/Amber
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Vereinbarung über Schönheitsreparaturen', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Parteien
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Zwischen', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`${formatPerson(data.vermieter)}, ${formatAddress(data.vermieterAdresse)}`, margin, y)
  y += 5
  doc.text('- im Folgenden "Vermieter" genannt -', margin, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('und', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`${formatPerson(data.mieter)}, ${formatAddress(data.mieterAdresse)}`, margin, y)
  y += 5
  doc.text('- im Folgenden "Mieter" genannt -', margin, y)
  y += 10

  doc.text(`Betreffend: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 12

  // § 1 Gegenstand
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Gegenstand der Vereinbarung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const gegenstand = 'Die Parteien vereinbaren die Durchführung folgender Schönheitsreparaturen im oben genannten Mietobjekt:'
  const gegenstandLines = doc.splitTextToSize(gegenstand, pageWidth - 2 * margin)
  for (const line of gegenstandLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // § 2 Betroffene Räume
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Betroffene Räume', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  for (const raum of data.raeume) {
    if (RAEUME_LABELS[raum]) {
      checkPageBreak(6)
      doc.text(`• ${RAEUME_LABELS[raum]}`, margin + 5, y)
      y += 5
    }
  }
  y += 5

  // § 3 Durchzuführende Arbeiten
  checkPageBreak(50)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 3 Durchzuführende Arbeiten', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  for (const arbeit of data.arbeiten) {
    if (ARBEITEN_LABELS[arbeit]) {
      checkPageBreak(6)
      doc.text(`• ${ARBEITEN_LABELS[arbeit]}`, margin + 5, y)
      y += 5
    }
  }
  y += 5

  // § 4 Farbvorgaben
  if (data.farbvorgaben) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 4 Farbvorgaben', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const farbLines = doc.splitTextToSize(data.farbvorgaben, pageWidth - 2 * margin)
    for (const line of farbLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // § 5 Qualitätsanforderungen
  if (data.qualitaetsanforderungen) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 5 Qualitätsanforderungen', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const qualLines = doc.splitTextToSize(data.qualitaetsanforderungen, pageWidth - 2 * margin)
    for (const line of qualLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // § 6 Durchführung
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 6 Durchführung und Fristen', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.durchfuehrung) {
    doc.text(`Durchführung: ${data.durchfuehrung}`, margin, y)
    y += 5
  }
  if (data.fristBis) {
    doc.text(`Die Arbeiten sind bis zum ${formatDateStr(data.fristBis)} abzuschließen.`, margin, y)
    y += 5
  }
  if (data.abnahmetermin) {
    doc.text(`Abnahmetermin: ${formatDateStr(data.abnahmetermin)}`, margin, y)
    y += 5
  }
  y += 5

  // Sondervereinbarungen
  if (data.sondervereinbarungen) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 7 Sondervereinbarungen', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const sonderLines = doc.splitTextToSize(data.sondervereinbarungen, pageWidth - 2 * margin)
    for (const line of sonderLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Ort und Datum
  checkPageBreak(45)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschriften
  const signatureWidth = (pageWidth - 2 * margin - 20) / 2

  doc.setDrawColor(0)
  doc.line(margin, y, margin + signatureWidth, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter', margin, y)

  doc.line(margin + signatureWidth + 20, y - 5, pageWidth - margin, y - 5)
  doc.text('Mieter', margin + signatureWidth + 20, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, signatureWidth - 10, 20)
  }
  if (data.unterschriftMieter?.imageData) {
    doc.addImage(data.unterschriftMieter.imageData, 'PNG', margin + signatureWidth + 20, y - 25, signatureWidth - 10, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Vereinbarung über Schönheitsreparaturen', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Schoenheitsreparaturen_${formatAddress(data.mietobjektAdresse).replace(/[\s,]/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
