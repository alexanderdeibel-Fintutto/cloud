import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Gast {
  name: string
  geburtsdatum: string
}

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string; telefon?: string; email?: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string; telefon?: string; email?: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  weitereGaeste: Gast[]
  objektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  objektBezeichnung: string
  wohnflaeche?: string
  zimmer?: string
  maxPersonen?: string
  anreiseDatum: string
  anreiseUhrzeit: string
  abreiseDatum: string
  abreiseUhrzeit: string
  mietpreis: number | null
  endreinigung?: number | null
  kaution?: number | null
  inklusivleistungen: string[]
  hausordnungHinweise?: string
  aufenthaltNaechte: number
  gesamtpreis: number
  erstelltAm: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
}

const INKLUSIV_LABELS: Record<string, string> = {
  bettwaesche: 'Bettwäsche',
  handtuecher: 'Handtücher',
  wlan: 'WLAN',
  parkplatz: 'Parkplatz',
  heizung: 'Heizung',
  strom: 'Strom',
  wasser: 'Wasser',
  tvgebuehren: 'TV-Gebühren',
}

export async function generateFerienwohnungsmietvertragPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(6, 182, 212)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Ferienwohnungsmietvertrag', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(Kurzzeitvermietung / Ferienvermietung)', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Buchungsübersicht Box
  doc.setFillColor(236, 254, 255)
  doc.rect(margin, y, pageWidth - 2 * margin, 28, 'F')
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Buchungsübersicht', margin + 5, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`Anreise: ${formatDateStr(data.anreiseDatum)} ab ${data.anreiseUhrzeit} Uhr`, margin + 5, y)
  doc.text(`Abreise: ${formatDateStr(data.abreiseDatum)} bis ${data.abreiseUhrzeit} Uhr`, margin + 90, y)
  y += 5
  doc.text(`Aufenthalt: ${data.aufenthaltNaechte} Nächte`, margin + 5, y)
  doc.setFont('helvetica', 'bold')
  doc.text(`Gesamtpreis: ${formatCurrency(data.gesamtpreis)}`, margin + 90, y)
  y += 18

  // Vertragsparteien
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Vertragsparteien', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Vermieter (Gastgeber):', margin, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text(formatPerson(data.vermieter), margin + 5, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.vermieterAdresse), margin + 5, y)
  y += 4
  if (data.vermieter.telefon) doc.text(`Tel: ${data.vermieter.telefon}`, margin + 5, y)
  if (data.vermieter.email) doc.text(`E-Mail: ${data.vermieter.email}`, margin + 60, y)
  y += 8

  doc.text('Mieter (Hauptgast):', margin, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text(formatPerson(data.mieter), margin + 5, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mieterAdresse), margin + 5, y)
  y += 4
  if (data.mieter.telefon) doc.text(`Tel: ${data.mieter.telefon}`, margin + 5, y)
  if (data.mieter.email) doc.text(`E-Mail: ${data.mieter.email}`, margin + 60, y)
  y += 8

  // Weitere Gäste
  if (data.weitereGaeste.length > 0) {
    doc.text('Weitere Gäste:', margin, y)
    y += 5
    for (const gast of data.weitereGaeste) {
      if (gast.name) {
        doc.text(`• ${gast.name}${gast.geburtsdatum ? ` (geb. ${formatDateStr(gast.geburtsdatum)})` : ''}`, margin + 5, y)
        y += 4
      }
    }
  }
  y += 5

  // Mietobjekt
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Mietobjekt', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.objektBezeichnung) {
    doc.setFont('helvetica', 'bold')
    doc.text(data.objektBezeichnung, margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
  }
  doc.text(formatAddress(data.objektAdresse), margin, y)
  y += 5

  let details = []
  if (data.wohnflaeche) details.push(`${data.wohnflaeche} m²`)
  if (data.zimmer) details.push(`${data.zimmer} Zimmer`)
  if (data.maxPersonen) details.push(`max. ${data.maxPersonen} Personen`)
  if (details.length > 0) {
    doc.text(details.join(' | '), margin, y)
    y += 10
  } else {
    y += 5
  }

  // Kosten
  checkPageBreak(35)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 3 Kosten', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mietpreis (${data.aufenthaltNaechte} Nächte): ${data.mietpreis ? formatCurrency(data.mietpreis) : '—'}`, margin, y)
  y += 5
  if (data.endreinigung) {
    doc.text(`Endreinigung: ${formatCurrency(data.endreinigung)}`, margin, y)
    y += 5
  }
  doc.setFont('helvetica', 'bold')
  doc.text(`Gesamtbetrag: ${formatCurrency(data.gesamtpreis)}`, margin, y)
  doc.setFont('helvetica', 'normal')
  y += 6

  if (data.kaution) {
    doc.text(`Kaution: ${formatCurrency(data.kaution)} (wird bei Abreise zurückerstattet)`, margin, y)
    y += 6
  }
  y += 5

  // Inklusivleistungen
  if (data.inklusivleistungen.length > 0) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 4 Im Mietpreis enthalten', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const inklLabels = data.inklusivleistungen.map(i => INKLUSIV_LABELS[i] || i)
    doc.text(inklLabels.join(', '), margin, y)
    y += 10
  }

  // An- und Abreise
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 5 An- und Abreise', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Check-in: ab ${data.anreiseUhrzeit} Uhr am ${formatDateStr(data.anreiseDatum)}`, margin, y)
  y += 5
  doc.text(`Check-out: bis ${data.abreiseUhrzeit} Uhr am ${formatDateStr(data.abreiseDatum)}`, margin, y)
  y += 5
  doc.text('Bei verspäteter Abreise kann eine zusätzliche Tagespauschale berechnet werden.', margin, y)
  y += 10

  // Hausordnung
  if (data.hausordnungHinweise) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 6 Besondere Hinweise / Hausordnung', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const hinweisLines = doc.splitTextToSize(data.hausordnungHinweise, pageWidth - 2 * margin)
    for (const line of hinweisLines) {
      doc.text(line, margin, y)
      y += 4.5
    }
    y += 8
  }

  // Haftung
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 7 Haftung und Meldepflicht', margin, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const haftungText = 'Der Mieter haftet für Schäden, die durch ihn oder seine Mitreisenden verursacht werden. ' +
    'Schäden sind dem Vermieter unverzüglich mitzuteilen. Der Mieter ist verpflichtet, sich gemäß ' +
    'Bundesmeldegesetz beim zuständigen Einwohnermeldeamt anzumelden, sofern der Aufenthalt ' +
    'länger als drei Monate dauert.'
  const haftLines = doc.splitTextToSize(haftungText, pageWidth - 2 * margin)
  for (const line of haftLines) {
    doc.text(line, margin, y)
    y += 4
  }
  y += 10

  // Unterschriften
  checkPageBreak(45)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Datum: ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Vermieter / Gastgeber', margin, y)
  doc.text('Mieter / Hauptgast', pageWidth - margin - 70, y)

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
  doc.text('Ferienwohnungsmietvertrag', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Ferienwohnungsmietvertrag_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.anreiseDatum).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
