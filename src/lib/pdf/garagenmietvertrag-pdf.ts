import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  objektTyp: 'garage' | 'tiefgarage' | 'stellplatz' | 'carport'
  objektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  stellplatzNr: string
  groesse?: string
  zugang?: string
  mietbeginn: string
  miete: number | null
  nebenkostenPauschale?: number | null
  kaution?: number | null
  kuendigungsfrist: string
  nutzungErlaubt: string[]
  erstelltAm: string
  erstelltOrt: string
  unterschriftVermieter?: { imageData: string | null }
  unterschriftMieter?: { imageData: string | null }
}

const OBJEKT_TYPEN: Record<string, string> = {
  garage: 'Einzelgarage',
  tiefgarage: 'Tiefgaragenstellplatz',
  stellplatz: 'Außenstellplatz',
  carport: 'Carport',
}

const NUTZUNG_LABELS: Record<string, string> = {
  pkw: 'PKW',
  motorrad: 'Motorrad / Roller',
  fahrrad: 'Fahrräder',
  lagerung: 'Lagerung (z.B. Reifen, Werkzeug)',
  anhaenger: 'Anhänger',
}

export async function generateGaragenmietvertragPDF(data: PDFData): Promise<void> {
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
  doc.setFillColor(71, 85, 105)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Garagenmietvertrag', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`(Mietvertrag für ${OBJEKT_TYPEN[data.objektTyp] || data.objektTyp})`, pageWidth / 2, y, { align: 'center' })
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
  checkPageBreak(35)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Mietobjekt', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Der Vermieter vermietet dem Mieter folgendes Objekt:`, margin, y)
  y += 6

  doc.setFillColor(241, 245, 249)
  doc.rect(margin, y, pageWidth - 2 * margin, 22, 'F')
  y += 5

  doc.text(`Objekttyp: ${OBJEKT_TYPEN[data.objektTyp]}`, margin + 5, y)
  y += 5
  if (data.stellplatzNr) {
    doc.text(`Bezeichnung / Nr.: ${data.stellplatzNr}`, margin + 5, y)
    y += 5
  }
  doc.text(`Standort: ${formatAddress(data.objektAdresse)}`, margin + 5, y)
  y += 5
  if (data.groesse) {
    doc.text(`Größe: ca. ${data.groesse} m²`, margin + 5, y)
  }
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
  y += 5
  doc.text(`Die Kündigungsfrist beträgt ${data.kuendigungsfrist} Monat(e) zum Monatsende.`, margin, y)
  y += 10

  // Miete
  checkPageBreak(25)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 4 Miete', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Die monatliche Miete beträgt: ${data.miete ? formatCurrency(data.miete) : '—'}`, margin, y)
  y += 5

  if (data.nebenkostenPauschale) {
    doc.text(`Nebenkostenpauschale: ${formatCurrency(data.nebenkostenPauschale)}`, margin, y)
    y += 5
  }

  const gesamtmiete = (data.miete || 0) + (data.nebenkostenPauschale || 0)
  doc.setFont('helvetica', 'bold')
  doc.text(`Gesamtmiete: ${formatCurrency(gesamtmiete)}`, margin, y)
  doc.setFont('helvetica', 'normal')
  y += 5
  doc.text('Die Miete ist monatlich im Voraus, spätestens am 3. Werktag, zu zahlen.', margin, y)
  y += 10

  // Kaution
  if (data.kaution) {
    checkPageBreak(15)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 5 Kaution', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Der Mieter zahlt eine Kaution in Höhe von ${formatCurrency(data.kaution)}.`, margin, y)
    y += 10
  }

  // Nutzung
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('§ 6 Nutzung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Das Mietobjekt darf ausschließlich zu folgenden Zwecken genutzt werden:', margin, y)
  y += 6

  for (const nutzung of data.nutzungErlaubt) {
    doc.text(`• ${NUTZUNG_LABELS[nutzung] || nutzung}`, margin + 5, y)
    y += 5
  }
  y += 3

  doc.text('Die Lagerung von brennbaren, explosiven oder umweltschädlichen Stoffen ist untersagt.', margin, y)
  y += 10

  // Zugang
  if (data.zugang) {
    checkPageBreak(15)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('§ 7 Zugang / Schlüssel', margin, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Zugang: ${data.zugang}`, margin, y)
    y += 5
    doc.text('Bei Verlust ist der Vermieter unverzüglich zu informieren.', margin, y)
    y += 10
  }

  // Unterschriften
  checkPageBreak(45)
  doc.setFontSize(10)
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
  doc.text('Garagenmietvertrag', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Garagenmietvertrag_${data.stellplatzNr || 'Stellplatz'}_${formatPerson(data.mieter).replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
