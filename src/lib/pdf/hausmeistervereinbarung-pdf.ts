import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  auftraggeber: { anrede: string; titel?: string; vorname: string; nachname: string }
  auftraggeberAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  hausmeister: { anrede: string; titel?: string; vorname: string; nachname: string }
  hausmeisterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  objektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  vertragsbeginn: string
  verguetung: number | null
  zahlungsrhythmus?: string
  aufgaben: string[]
  sonstigeAufgaben?: string
  arbeitszeiten?: string
  kuendigungsfrist?: string
  unterschriftAuftraggeber?: { imageData: string | null }
  unterschriftHausmeister?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const AUFGABEN_LABELS: Record<string, string> = {
  reinigung: 'Reinigung von Treppenhaus und Gemeinschaftsflächen',
  muell: 'Mülltonnenbereitstellung und -rückholung',
  winterdienst: 'Winterdienst (Schneeräumen, Streuen)',
  garten: 'Gartenpflege und Grünschnitt',
  licht: 'Kontrolle und Wechsel von Leuchtmitteln',
  kleinreparaturen: 'Kleinreparaturen (Türklinken, Schlösser etc.)',
  kontrolle: 'Regelmäßige Kontrollgänge',
  handwerker: 'Koordination von Handwerkern',
  heizung: 'Kontrolle der Heizungsanlage',
}

export async function generateHausmeistervereinbarungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(217, 119, 6) // Amber
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Hausmeistervertrag', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Parteien
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Zwischen', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`${formatPerson(data.auftraggeber)}, ${formatAddress(data.auftraggeberAdresse)}`, margin, y)
  y += 5
  doc.text('- im Folgenden "Auftraggeber" genannt -', margin, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('und', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`${formatPerson(data.hausmeister)}, ${formatAddress(data.hausmeisterAdresse)}`, margin, y)
  y += 5
  doc.text('- im Folgenden "Hausmeister" genannt -', margin, y)
  y += 10

  doc.text('wird folgende Vereinbarung geschlossen:', margin, y)
  y += 12

  // § 1 Objekt
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Objekt', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Der Hausmeister übernimmt die Betreuung des Objekts: ${formatAddress(data.objektAdresse)}`, margin, y)
  y += 10

  // § 2 Leistungsumfang
  checkPageBreak(50)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Leistungsumfang', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Der Hausmeister erbringt folgende Leistungen:', margin, y)
  y += 6

  for (const aufgabe of data.aufgaben) {
    if (AUFGABEN_LABELS[aufgabe]) {
      checkPageBreak(6)
      doc.text(`• ${AUFGABEN_LABELS[aufgabe]}`, margin + 5, y)
      y += 5
    }
  }

  if (data.sonstigeAufgaben) {
    checkPageBreak(15)
    y += 3
    const sonstigeLines = doc.splitTextToSize(`Weitere Aufgaben: ${data.sonstigeAufgaben}`, pageWidth - 2 * margin - 5)
    for (const line of sonstigeLines) {
      doc.text(line, margin + 5, y)
      y += 5
    }
  }
  y += 8

  // § 3 Arbeitszeiten
  if (data.arbeitszeiten) {
    checkPageBreak(20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 3 Arbeitszeiten', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(data.arbeitszeiten, margin, y)
    y += 10
  }

  // § 4 Vergütung
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 4 Vergütung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Der Auftraggeber zahlt dem Hausmeister eine Vergütung von ${formatCurrency(data.verguetung || 0)} ${data.zahlungsrhythmus || 'monatlich'}.`, margin, y)
  y += 10

  // § 5 Vertragsdauer
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 5 Vertragsdauer und Kündigung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Der Vertrag beginnt am ${formatDateStr(data.vertragsbeginn)} und wird auf unbestimmte Zeit geschlossen.`, margin, y)
  y += 5
  doc.text(`Er kann von beiden Parteien mit einer Frist von ${data.kuendigungsfrist || '3'} Monaten zum Monatsende gekündigt werden.`, margin, y)
  y += 12

  // Schlussbestimmung
  checkPageBreak(30)
  const schluss = 'Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Beide Parteien haben je eine Ausfertigung erhalten.'
  const schlussLines = doc.splitTextToSize(schluss, pageWidth - 2 * margin)
  for (const line of schlussLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 10

  // Ort und Datum
  checkPageBreak(40)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschriften
  const signatureWidth = (pageWidth - 2 * margin - 20) / 2

  // Auftraggeber
  doc.setDrawColor(0)
  doc.line(margin, y, margin + signatureWidth, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Auftraggeber', margin, y)

  // Hausmeister
  doc.line(margin + signatureWidth + 20, y - 5, pageWidth - margin, y - 5)
  doc.text('Hausmeister', margin + signatureWidth + 20, y)

  // Signaturen
  if (data.unterschriftAuftraggeber?.imageData) {
    doc.addImage(data.unterschriftAuftraggeber.imageData, 'PNG', margin, y - 25, signatureWidth - 10, 20)
  }
  if (data.unterschriftHausmeister?.imageData) {
    doc.addImage(data.unterschriftHausmeister.imageData, 'PNG', margin + signatureWidth + 20, y - 25, signatureWidth - 10, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Hausmeistervertrag', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Hausmeistervertrag_${formatPerson(data.hausmeister).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
