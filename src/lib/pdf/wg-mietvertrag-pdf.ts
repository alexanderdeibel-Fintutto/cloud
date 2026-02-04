import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface WGMitglied {
  person: { anrede: string; titel?: string; vorname: string; nachname: string }
  zimmerNr: string
  zimmerGroesse: string
  mietanteil: number | null
  nebenkostenanteil: number | null
}

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  wgMitglieder: WGMitglied[]
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  gesamtflaeche: string
  gesamtzimmer?: string
  gemeinschaftsraeume: string
  mietbeginn: string
  gesamtmiete: number | null
  gesamtnebenkosten: number | null
  kaution: number | null
  kuendigungsfristMonate: string
  erstelltAm: string
  erstelltOrt: string
  unterschriftVermieter?: { imageData: string | null }
}

export async function generateWGMietvertragPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(236, 72, 153)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('WG-Mietvertrag', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(Wohnraummietvertrag für Wohngemeinschaften)', pageWidth / 2, y, { align: 'center' })
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

  doc.text('und den WG-Mitgliedern:', margin, y)
  y += 6

  for (let i = 0; i < data.wgMitglieder.length; i++) {
    const m = data.wgMitglieder[i]
    checkPageBreak(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${i + 1}. ${formatPerson(m.person)}`, margin + 5, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.text(`Zimmer ${m.zimmerNr}${m.zimmerGroesse ? ` (${m.zimmerGroesse} m²)` : ''}`, margin + 10, y)
    y += 5
  }

  doc.text('– nachfolgend gemeinsam „Mieter" genannt –', margin, y)
  y += 10

  // Mietobjekt
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Mietobjekt', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const objText = `Der Vermieter vermietet den Mietern die Wohnung: ${formatAddress(data.mietobjektAdresse)}`
  const objLines = doc.splitTextToSize(objText, pageWidth - 2 * margin)
  for (const line of objLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 3

  doc.text(`Gesamtwohnfläche: ca. ${data.gesamtflaeche} m²`, margin, y)
  if (data.gesamtzimmer) doc.text(`Zimmeranzahl: ${data.gesamtzimmer}`, margin + 80, y)
  y += 5
  doc.text(`Gemeinschaftsräume: ${data.gemeinschaftsraeume}`, margin, y)
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
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 4 Miete', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Die monatliche Gesamtmiete beträgt: ${data.gesamtmiete ? formatCurrency(data.gesamtmiete) : '—'} (Kaltmiete)`, margin, y)
  y += 5
  doc.text(`Die monatlichen Nebenkosten betragen: ${data.gesamtnebenkosten ? formatCurrency(data.gesamtnebenkosten) : '—'}`, margin, y)
  y += 8

  // Aufteilungstabelle
  doc.setFillColor(252, 231, 243)
  doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('WG-Mitglied', margin + 5, y + 5)
  doc.text('Zimmer', margin + 60, y + 5)
  doc.text('Mietanteil', margin + 90, y + 5)
  doc.text('NK-Anteil', margin + 125, y + 5)
  y += 10

  doc.setFont('helvetica', 'normal')
  for (const m of data.wgMitglieder) {
    doc.text(formatPerson(m.person), margin + 5, y)
    doc.text(`Nr. ${m.zimmerNr}`, margin + 60, y)
    doc.text(m.mietanteil ? formatCurrency(m.mietanteil) : '—', margin + 90, y)
    doc.text(m.nebenkostenanteil ? formatCurrency(m.nebenkostenanteil) : '—', margin + 125, y)
    y += 5
  }

  y += 3
  const sumMiet = data.wgMitglieder.reduce((s, m) => s + (m.mietanteil || 0), 0)
  const sumNk = data.wgMitglieder.reduce((s, m) => s + (m.nebenkostenanteil || 0), 0)
  doc.setFont('helvetica', 'bold')
  doc.text('Summe:', margin + 5, y)
  doc.text(formatCurrency(sumMiet), margin + 90, y)
  doc.text(formatCurrency(sumNk), margin + 125, y)
  y += 10

  // Gesamtschuldnerische Haftung
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 5 Gesamtschuldnerische Haftung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const haftungText = 'Die Mieter haften gesamtschuldnerisch für alle Verpflichtungen aus diesem Mietvertrag. ' +
    'Der Vermieter kann die gesamte Miete von jedem einzelnen Mieter verlangen.'
  const haftLines = doc.splitTextToSize(haftungText, pageWidth - 2 * margin)
  for (const line of haftLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Kaution
  checkPageBreak(15)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 6 Kaution', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.kaution) {
    doc.text(`Die Gesamtkaution beträgt ${formatCurrency(data.kaution)}.`, margin, y)
    y += 5
    const proKopf = data.kaution / data.wgMitglieder.length
    doc.text(`Pro WG-Mitglied: ${formatCurrency(proKopf)}`, margin, y)
  } else {
    doc.text('Auf eine Kaution wird verzichtet.', margin, y)
  }
  y += 10

  // Kündigung
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 7 Kündigung und Mieterwechsel', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Die Kündigungsfrist beträgt ${data.kuendigungsfristMonate} Monat(e) zum Monatsende.`, margin, y)
  y += 5
  const wechselText = 'Bei Auszug eines WG-Mitglieds sind die verbleibenden Mieter berechtigt, ' +
    'einen Nachmieter vorzuschlagen. Der Vermieter wird einen geeigneten Nachmieter ohne wichtigen ' +
    'Grund nicht ablehnen.'
  const wechselLines = doc.splitTextToSize(wechselText, pageWidth - 2 * margin)
  for (const line of wechselLines) {
    doc.text(line, margin, y)
    y += 4.5
  }
  y += 10

  // Unterschriften
  checkPageBreak(50)
  doc.setFontSize(10)
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Vermieter
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter', margin, y)

  if (data.unterschriftVermieter?.imageData) {
    doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y - 25, 60, 20)
  }

  // Neue Seite für Mieter-Unterschriften
  doc.addPage()
  y = margin

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Unterschriften der WG-Mitglieder', margin, y)
  y += 15

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  for (let i = 0; i < data.wgMitglieder.length; i++) {
    checkPageBreak(35)
    const m = data.wgMitglieder[i]
    doc.text(`${i + 1}. ${formatPerson(m.person)}`, margin, y)
    y += 15

    doc.line(margin, y, margin + 80, y)
    y += 5
    doc.setFontSize(8)
    doc.text('Unterschrift', margin, y)
    doc.setFontSize(10)
    y += 15
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('WG-Mietvertrag', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `WG_Mietvertrag_${formatAddress(data.mietobjektAdresse).replace(/[\s,]/g, '_')}.pdf`
  doc.save(filename)
}
