import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietvertragVom?: string
  anpassungsgrund: string
  sonstigerGrund?: string
  bisherigeMiete: number | null
  neueMiete: number | null
  anpassungAb: string
  begruendung?: string
  frist: string
  differenz: number | null
  prozent: string | null
  erstelltAm: string
}

const ANPASSUNGSGRUND_LABELS: Record<string, string> = {
  mietspiegel: 'Anpassung an die ortsübliche Vergleichsmiete gemäß Mietspiegel',
  modernisierung: 'Umlage von Modernisierungskosten gemäß § 559 BGB',
  betriebskosten: 'Anpassung der Betriebskostenvorauszahlung',
  vereinbarung: 'Vertraglich vereinbarte Mietanpassung',
  sonstige: 'Sonstige Mietanpassung',
}

export async function generateMietanpassungPDF(data: PDFData): Promise<void> {
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

  // Header
  doc.setFillColor(16, 185, 129) // Emerald
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

  // Datum
  doc.text(formatDateStr(data.erstelltAm), pageWidth - margin, y, { align: 'right' })
  y += 10

  // Betreff
  doc.setFont('helvetica', 'bold')
  doc.text('Mietanpassung', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  if (data.mietvertragVom) {
    y += 4
    doc.text(`Mietvertrag vom: ${formatDateStr(data.mietvertragVom)}`, margin, y)
  }
  y += 12

  // Anrede
  doc.text(getAnrede(data.mieter) + ',', margin, y)
  y += 8

  // Einleitung
  const grund = data.anpassungsgrund === 'sonstige' && data.sonstigerGrund
    ? data.sonstigerGrund
    : ANPASSUNGSGRUND_LABELS[data.anpassungsgrund] || 'Mietanpassung'

  const einleitung = `hiermit teile ich Ihnen eine Anpassung der Miete für die oben genannte Wohnung mit. Die Anpassung erfolgt aufgrund: ${grund}.`
  const einleitungLines = doc.splitTextToSize(einleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Anpassungs-Box
  doc.setFillColor(236, 253, 245)
  doc.rect(margin, y, pageWidth - 2 * margin, 35, 'F')
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Mietanpassung im Überblick', margin + 5, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Bisherige Kaltmiete:`, margin + 5, y)
  doc.text(formatCurrency(data.bisherigeMiete || 0), margin + 80, y)
  y += 6

  doc.text(`Neue Kaltmiete:`, margin + 5, y)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(data.neueMiete || 0), margin + 80, y)
  doc.setFont('helvetica', 'normal')
  y += 6

  if (data.differenz !== null) {
    doc.text(`Erhöhung:`, margin + 5, y)
    doc.text(`${formatCurrency(data.differenz)} (${data.prozent}%)`, margin + 80, y)
  }
  y += 15

  // Wirksamkeitsdatum
  doc.setFontSize(10)
  doc.text(`Die neue Miete gilt ab dem ${formatDateStr(data.anpassungAb)}.`, margin, y)
  y += 10

  // Begründung
  if (data.begruendung) {
    checkPageBreak(30)
    doc.setFont('helvetica', 'bold')
    doc.text('Begründung:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const begruendungLines = doc.splitTextToSize(data.begruendung, pageWidth - 2 * margin)
    for (const line of begruendungLines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Zustimmungshinweis
  checkPageBreak(25)
  const zustimmung = `Ich bitte Sie, der Mietanpassung innerhalb von ${data.frist} Tagen nach Zugang dieses Schreibens zuzustimmen. Nach Ablauf dieser Frist gehe ich von Ihrer Zustimmung aus, sofern Sie nicht widersprechen.`
  const zustimmungLines = doc.splitTextToSize(zustimmung, pageWidth - 2 * margin)
  for (const line of zustimmungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Schluss
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 15

  // Unterschrift
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 60, y)
  y += 5
  doc.setFontSize(9)
  doc.text(formatPerson(data.vermieter), margin, y)

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Mietanpassung', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Mietanpassung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
