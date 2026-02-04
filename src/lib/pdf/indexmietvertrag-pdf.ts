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
  wohnflaeche: string
  zimmer?: string
  mietbeginn: string
  kaltmiete: number | null
  nebenkosten: number | null
  basisindex: string
  basisjahr: string
  anpassungsintervall: '12' | '24'
  mindestanpassung: string
  kaution: number | null
  erstelltAm: string
  erstelltOrt: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
}

export async function generateIndexmietvertragPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(139, 92, 246)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Indexmietvertrag', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(Wohnraummietvertrag mit Indexklausel gemäß § 557b BGB)', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Vertragsparteien
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Vertragsparteien', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Zwischen', margin, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text(formatPerson(data.vermieter), margin + 5, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.vermieterAdresse), margin + 5, y)
  y += 5
  doc.text('– nachfolgend „Vermieter" genannt –', margin, y)
  y += 8

  doc.text('und', margin, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text(formatPerson(data.mieter), margin + 5, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mieterAdresse), margin + 5, y)
  y += 5
  doc.text('– nachfolgend „Mieter" genannt –', margin, y)
  y += 10

  // Mietobjekt
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Mietobjekt', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const objText = `Der Vermieter vermietet dem Mieter folgende Wohnung: ${formatAddress(data.mietobjektAdresse)}`
  const objLines = doc.splitTextToSize(objText, pageWidth - 2 * margin)
  for (const line of objLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 3
  doc.text(`Wohnfläche: ca. ${data.wohnflaeche} m²`, margin, y)
  if (data.zimmer) doc.text(`Zimmer: ${data.zimmer}`, margin + 80, y)
  y += 10

  // Mietzeit
  checkPageBreak(15)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 3 Mietzeit', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Das Mietverhältnis beginnt am ${formatDateStr(data.mietbeginn)} und wird auf unbestimmte Zeit geschlossen.`, margin, y)
  y += 10

  // Miete
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 4 Miete', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Die monatliche Kaltmiete beträgt: ${data.kaltmiete ? formatCurrency(data.kaltmiete) : '—'}`, margin, y)
  y += 5
  doc.text(`Die monatliche Nebenkostenvorauszahlung beträgt: ${data.nebenkosten ? formatCurrency(data.nebenkosten) : '—'}`, margin, y)
  y += 5
  const gesamtmiete = (data.kaltmiete || 0) + (data.nebenkosten || 0)
  doc.setFont('helvetica', 'bold')
  doc.text(`Gesamtmiete bei Mietbeginn: ${formatCurrency(gesamtmiete)}`, margin, y)
  y += 10

  // Indexklausel
  checkPageBreak(60)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 5 Indexklausel', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const indexText1 = '(1) Die Vertragsparteien vereinbaren, dass die Miete entsprechend der Entwicklung des ' +
    `vom Statistischen Bundesamt ermittelten Verbraucherpreisindex für Deutschland (Basis ${data.basisjahr} = 100) ` +
    'angepasst wird (Indexmiete gemäß § 557b BGB).'
  const idx1Lines = doc.splitTextToSize(indexText1, pageWidth - 2 * margin)
  for (const line of idx1Lines) {
    doc.text(line, margin, y)
    y += 4.5
  }
  y += 3

  doc.text(`(2) Basisindex bei Vertragsabschluss: ${data.basisindex || '—'} Punkte`, margin, y)
  y += 6

  const intervallText = data.anpassungsintervall === '12' ? 'jährlich' : 'alle zwei Jahre'
  const indexText3 = `(3) Die Mietanpassung kann ${intervallText} erfolgen, frühestens ein Jahr nach Mietbeginn ` +
    'oder der letzten Anpassung. Die Anpassung muss schriftlich mitgeteilt werden und wird mit ' +
    'Beginn des übernächsten Monats nach Zugang der Erklärung wirksam.'
  const idx3Lines = doc.splitTextToSize(indexText3, pageWidth - 2 * margin)
  for (const line of idx3Lines) {
    doc.text(line, margin, y)
    y += 4.5
  }
  y += 3

  if (data.mindestanpassung && data.mindestanpassung !== '0') {
    doc.text(`(4) Eine Anpassung erfolgt erst bei einer Indexänderung von mindestens ${data.mindestanpassung}%.`, margin, y)
    y += 6
  }

  const indexText5 = '(5) Die Berechnung erfolgt nach der Formel: Neue Miete = Ausgangsmiete × (Neuer Index / Basisindex)'
  doc.text(indexText5, margin, y)
  y += 8

  // Berechnungsbeispiel Box
  checkPageBreak(30)
  doc.setFillColor(245, 243, 255)
  doc.rect(margin, y, pageWidth - 2 * margin, 28, 'F')
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Berechnungsbeispiel:', margin + 5, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const beispielText = `Bei einer Steigerung des Verbraucherpreisindex von ${data.basisindex || '117,4'} auf 120,0 Punkte ` +
    `(+2,2%) erhöht sich die Kaltmiete von ${data.kaltmiete ? formatCurrency(data.kaltmiete) : '1.000 €'} um ca. ` +
    `${data.kaltmiete ? formatCurrency(data.kaltmiete * 0.022) : '22 €'} auf ` +
    `${data.kaltmiete ? formatCurrency(data.kaltmiete * 1.022) : '1.022 €'}.`
  const bspLines = doc.splitTextToSize(beispielText, pageWidth - 2 * margin - 10)
  for (const line of bspLines) {
    doc.text(line, margin + 5, y)
    y += 4
  }
  y += 12

  // Kaution
  checkPageBreak(20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 6 Kaution', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.kaution) {
    doc.text(`Der Mieter zahlt eine Kaution in Höhe von ${formatCurrency(data.kaution)}.`, margin, y)
  } else {
    doc.text('Auf eine Kaution wird verzichtet.', margin, y)
  }
  y += 12

  // Hinweis
  checkPageBreak(25)
  doc.setFillColor(254, 249, 195)
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Wichtiger Hinweis:', margin + 5, y)
  doc.setFont('helvetica', 'normal')
  y += 4
  const hinweis = 'Während der Laufzeit einer Indexmietvereinbarung ist eine Mieterhöhung nach § 558 BGB ' +
    '(Anpassung an die ortsübliche Vergleichsmiete) ausgeschlossen. Mieterhöhungen wegen Modernisierung ' +
    '(§ 559 BGB) bleiben jedoch möglich.'
  const hinweisLines = doc.splitTextToSize(hinweis, pageWidth - 2 * margin - 10)
  for (const line of hinweisLines) {
    doc.text(line, margin + 5, y)
    y += 3.5
  }
  y += 12

  // Unterschriften
  checkPageBreak(45)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter', margin, y)
  doc.text('Mieter', pageWidth - margin - 70, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, 60, 20)
  }
  if (data.unterschriftMieter?.imageData) {
    doc.addImage(data.unterschriftMieter.imageData, 'PNG', pageWidth - margin - 70, y - 25, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Indexmietvertrag gemäß § 557b BGB', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Indexmietvertrag_${formatPerson(data.mieter).replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
