import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  eigentuemer: { anrede: string; titel?: string; vorname: string; nachname: string }
  eigentuemerAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  verwalter: { anrede: string; titel?: string; vorname: string; nachname: string; firma?: string }
  verwalterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  objektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  vertragsbeginn: string
  vertragsende: string
  unbefristet: boolean
  verguetung: number | null
  zahlungsrhythmus: string
  aufgaben: string[]
  sonderaufgaben: string
  vollmacht: string[]
  kuendigungsfrist: string
  unterschriftEigentuemer?: { imageData: string | null }
  unterschriftVerwalter?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const AUFGABEN_LABELS: Record<string, string> = {
  mieterverwaltung: 'Mieterverwaltung und Kommunikation',
  mietinkasso: 'Mietinkasso und Mahnwesen',
  nebenkostenabrechnung: 'Erstellung der Nebenkostenabrechnung',
  instandhaltung: 'Organisation von Instandhaltungsmaßnahmen',
  handwerker: 'Beauftragung und Koordination von Handwerkern',
  neuvermietung: 'Neuvermietung bei Leerstand',
  buchhaltung: 'Buchführung und Abrechnung',
  begehungen: 'Regelmäßige Objektbegehungen',
  versicherungen: 'Verwaltung von Versicherungsangelegenheiten',
}

const VOLLMACHT_LABELS: Record<string, string> = {
  vertragsabschluss: 'Abschluss von Mietverträgen',
  kuendigung: 'Kündigungen aussprechen',
  handwerkerbeauftragung: 'Beauftragung von Handwerkern bis zu einer Summe',
  zahlungen: 'Zahlungen im Namen des Eigentümers leisten',
  gerichtliche_vertretung: 'Gerichtliche Vertretung in Mietangelegenheiten',
}

export async function generateVerwaltervertragPDF(data: PDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let y = margin

  const formatPerson = (p: { titel?: string; vorname: string; nachname: string; firma?: string }) => {
    const name = [p.titel, p.vorname, p.nachname].filter(Boolean).join(' ')
    return p.firma ? `${p.firma} (${name})` : name
  }

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
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Hausverwaltungsvertrag', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Parteien
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Zwischen', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`${formatPerson(data.eigentuemer)}, ${formatAddress(data.eigentuemerAdresse)}`, margin, y)
  y += 5
  doc.text('- im Folgenden "Eigentümer" genannt -', margin, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('und', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`${formatPerson(data.verwalter)}, ${formatAddress(data.verwalterAdresse)}`, margin, y)
  y += 5
  doc.text('- im Folgenden "Verwalter" genannt -', margin, y)
  y += 12

  // § 1 Vertragsgegenstand
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Vertragsgegenstand', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Der Verwalter übernimmt die Verwaltung des Objekts: ${formatAddress(data.objektAdresse)}`, margin, y)
  y += 10

  // § 2 Vertragsdauer
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Vertragsdauer', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.unbefristet) {
    doc.text(`Der Vertrag beginnt am ${formatDateStr(data.vertragsbeginn)} und wird auf unbestimmte Zeit geschlossen.`, margin, y)
    y += 5
  } else {
    doc.text(`Der Vertrag läuft vom ${formatDateStr(data.vertragsbeginn)} bis zum ${formatDateStr(data.vertragsende)}.`, margin, y)
    y += 5
  }
  doc.text(`Die Kündigungsfrist beträgt ${data.kuendigungsfrist || '3'} Monate zum Monatsende.`, margin, y)
  y += 10

  // § 3 Aufgaben
  checkPageBreak(60)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 3 Aufgaben des Verwalters', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Der Verwalter übernimmt folgende Aufgaben:', margin, y)
  y += 6

  for (const aufgabe of data.aufgaben) {
    if (AUFGABEN_LABELS[aufgabe]) {
      checkPageBreak(6)
      doc.text(`• ${AUFGABEN_LABELS[aufgabe]}`, margin + 5, y)
      y += 5
    }
  }

  if (data.sonderaufgaben) {
    y += 3
    const sonderLines = doc.splitTextToSize(`Weitere: ${data.sonderaufgaben}`, pageWidth - 2 * margin - 5)
    for (const line of sonderLines) {
      doc.text(line, margin + 5, y)
      y += 5
    }
  }
  y += 5

  // § 4 Vollmachten
  if (data.vollmacht.length > 0) {
    checkPageBreak(40)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 4 Vollmachten', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Der Verwalter ist bevollmächtigt zu:', margin, y)
    y += 6

    for (const v of data.vollmacht) {
      if (VOLLMACHT_LABELS[v]) {
        checkPageBreak(6)
        doc.text(`• ${VOLLMACHT_LABELS[v]}`, margin + 5, y)
        y += 5
      }
    }
    y += 5
  }

  // § 5 Vergütung
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 5 Vergütung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Der Eigentümer zahlt dem Verwalter eine Vergütung von ${formatCurrency(data.verguetung || 0)} ${data.zahlungsrhythmus || 'monatlich'}.`, margin, y)
  y += 5
  doc.text('Die Vergütung versteht sich zzgl. gesetzlicher MwSt.', margin, y)
  y += 10

  // § 6 Haftung
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 6 Haftung und Versicherung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const haftung = 'Der Verwalter haftet für Schäden, die er vorsätzlich oder grob fahrlässig verursacht. Er verfügt über eine Vermögensschadenhaftpflichtversicherung.'
  const haftungLines = doc.splitTextToSize(haftung, pageWidth - 2 * margin)
  for (const line of haftungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 10

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
  doc.text('Eigentümer', margin, y)

  doc.line(margin + signatureWidth + 20, y - 5, pageWidth - margin, y - 5)
  doc.text('Verwalter', margin + signatureWidth + 20, y)

  if (data.unterschriftEigentuemer?.imageData) {
    doc.addImage(data.unterschriftEigentuemer.imageData, 'PNG', margin, y - 25, signatureWidth - 10, 20)
  }
  if (data.unterschriftVerwalter?.imageData) {
    doc.addImage(data.unterschriftVerwalter.imageData, 'PNG', margin + signatureWidth + 20, y - 25, signatureWidth - 10, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Hausverwaltungsvertrag', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Verwaltervertrag_${formatAddress(data.objektAdresse).replace(/[\s,]/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
