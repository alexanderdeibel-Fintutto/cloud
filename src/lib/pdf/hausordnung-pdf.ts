import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  objektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  objektBezeichnung?: string
  ruhezeiten: {
    mittagsruhe: boolean
    mittagsruheVon: string
    mittagsruheBis: string
    nachtruheVon: string
    nachtruheBis: string
    sonntagsruhe: boolean
  }
  treppenhausreinigung: 'vermieter' | 'mieter_wechsel' | 'firma'
  muellRegelungen: string[]
  tierhaltung: 'erlaubt' | 'kleintiere' | 'verboten' | 'genehmigung'
  rauchen: 'erlaubt' | 'wohnung' | 'verboten'
  grillRegelung: string
  winterdienst: 'vermieter' | 'mieter'
  zusaetzlicheRegeln: string[]
  ansprechpartner?: string
  erstelltAm: string
}

const MUELL_LABELS: Record<string, string> = {
  trennung: 'Mülltrennung ist Pflicht (Restmüll, Papier, Gelber Sack, Bio, Glas)',
  tonnenZurueck: 'Mülltonnen sind nach der Leerung zurückzustellen',
  sperr: 'Sperrmüll nur nach Anmeldung beim Entsorger',
  keine_tueten: 'Keine Müllsäcke neben die Tonnen stellen',
}

const TIER_LABELS: Record<string, string> = {
  erlaubt: 'Tierhaltung ist gestattet.',
  kleintiere: 'Kleintiere (z.B. Hamster, Fische) sind ohne Genehmigung erlaubt. Für größere Tiere ist die schriftliche Zustimmung des Vermieters erforderlich.',
  genehmigung: 'Tierhaltung ist nur mit schriftlicher Genehmigung des Vermieters gestattet.',
  verboten: 'Tierhaltung ist nicht gestattet.',
}

const RAUCH_LABELS: Record<string, string> = {
  erlaubt: 'Rauchen ist gestattet.',
  wohnung: 'Rauchen ist nur in der eigenen Wohnung gestattet. In Gemeinschaftsräumen, Treppenhaus und Keller gilt Rauchverbot.',
  verboten: 'Dies ist ein rauchfreies Gebäude. Rauchen ist nicht gestattet.',
}

const REINIGUNG_LABELS: Record<string, string> = {
  vermieter: 'Die Reinigung wird vom Vermieter bzw. einer beauftragten Firma durchgeführt.',
  mieter_wechsel: 'Die Mieter reinigen das Treppenhaus im wöchentlichen Wechsel.',
  firma: 'Die Reinigung wird von einer beauftragten Reinigungsfirma durchgeführt.',
}

export async function generateHausordnungPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(249, 115, 22)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Hausordnung', pageWidth / 2, y, { align: 'center' })
  y += 8

  // Objekt
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  if (data.objektBezeichnung) {
    doc.text(data.objektBezeichnung, pageWidth / 2, y, { align: 'center' })
    y += 5
  }
  doc.text(formatAddress(data.objektAdresse), pageWidth / 2, y, { align: 'center' })
  y += 12

  // Präambel
  doc.setFontSize(10)
  const praeambelText = 'Diese Hausordnung dient dem friedlichen Zusammenleben aller Hausbewohner. ' +
    'Die Einhaltung ist für alle Mieter und deren Besucher verbindlich.'
  const praeambelLines = doc.splitTextToSize(praeambelText, pageWidth - 2 * margin)
  for (const line of praeambelLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  let paragraphNum = 1

  // § 1 Ruhezeiten
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`§ ${paragraphNum++} Ruhezeiten`, margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nachtruhe: ${data.ruhezeiten.nachtruheVon} Uhr bis ${data.ruhezeiten.nachtruheBis} Uhr`, margin, y)
  y += 5

  if (data.ruhezeiten.mittagsruhe) {
    doc.text(`Mittagsruhe: ${data.ruhezeiten.mittagsruheVon} Uhr bis ${data.ruhezeiten.mittagsruheBis} Uhr`, margin, y)
    y += 5
  }

  if (data.ruhezeiten.sonntagsruhe) {
    doc.text('An Sonn- und Feiertagen gilt ganztägige Ruhe.', margin, y)
    y += 5
  }

  doc.text('Während der Ruhezeiten sind Lärm und störende Tätigkeiten zu unterlassen.', margin, y)
  y += 10

  // § 2 Treppenhaus und Reinigung
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`§ ${paragraphNum++} Treppenhaus und Reinigung`, margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(REINIGUNG_LABELS[data.treppenhausreinigung], margin, y)
  y += 6

  doc.text('Das Treppenhaus ist von persönlichen Gegenständen freizuhalten.', margin, y)
  y += 5
  doc.text('Flucht- und Rettungswege dürfen nicht verstellt werden.', margin, y)
  y += 10

  // § 3 Müllentsorgung
  if (data.muellRegelungen.length > 0) {
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`§ ${paragraphNum++} Müllentsorgung`, margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    for (const regel of data.muellRegelungen) {
      if (MUELL_LABELS[regel]) {
        doc.text(`• ${MUELL_LABELS[regel]}`, margin, y)
        y += 5
      }
    }
    y += 5
  }

  // § 4 Tierhaltung
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`§ ${paragraphNum++} Tierhaltung`, margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const tierLines = doc.splitTextToSize(TIER_LABELS[data.tierhaltung], pageWidth - 2 * margin)
  for (const line of tierLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // § 5 Rauchen
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`§ ${paragraphNum++} Rauchen`, margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const rauchLines = doc.splitTextToSize(RAUCH_LABELS[data.rauchen], pageWidth - 2 * margin)
  for (const line of rauchLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // § 6 Grillen
  if (data.grillRegelung) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`§ ${paragraphNum++} Grillen`, margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const grillLines = doc.splitTextToSize(data.grillRegelung, pageWidth - 2 * margin)
    for (const line of grillLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // § Zusätzliche Regeln
  if (data.zusaetzlicheRegeln.length > 0) {
    checkPageBreak(20 + data.zusaetzlicheRegeln.length * 6)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`§ ${paragraphNum++} Weitere Regelungen`, margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    for (const regel of data.zusaetzlicheRegeln) {
      const regelLines = doc.splitTextToSize(`• ${regel}`, pageWidth - 2 * margin)
      for (const line of regelLines) {
        checkPageBreak(6)
        doc.text(line, margin, y)
        y += 5
      }
    }
    y += 5
  }

  // § Ansprechpartner
  if (data.ansprechpartner) {
    checkPageBreak(25)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`§ ${paragraphNum++} Ansprechpartner`, margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const ansprechLines = doc.splitTextToSize(data.ansprechpartner, pageWidth - 2 * margin)
    for (const line of ansprechLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Schlussbestimmung
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`§ ${paragraphNum} Schlussbestimmungen`, margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const schlussText = 'Die Hausordnung ist Bestandteil des Mietvertrages. Bei wiederholten oder schwerwiegenden ' +
    'Verstößen behält sich der Vermieter rechtliche Schritte vor.'
  const schlussLines = doc.splitTextToSize(schlussText, pageWidth - 2 * margin)
  for (const line of schlussLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 10

  // Datum und Vermieter
  checkPageBreak(20)
  doc.text(`Stand: ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('Vermieter / Hausverwaltung:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.vermieter), margin, y)

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text(`Hausordnung | ${formatAddress(data.objektAdresse)}`, pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Hausordnung_${formatAddress(data.objektAdresse).replace(/[\s,]/g, '_')}.pdf`
  doc.save(filename)
}
