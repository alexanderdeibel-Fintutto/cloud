import { jsPDF } from 'jspdf'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Rueckstand {
  id: string
  monat: string
  betrag: number | null
}

interface PDFData {
  vermieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  rueckstaende: Rueckstand[]
  gesamtrueckstand: number
  zahlungsfrist: string
  mahnungStufe: string
  bankverbindung?: string
  kuendigungsandrohung: boolean
  erstelltAm: string
}

export async function generateMietrueckstandPDF(data: PDFData): Promise<void> {
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

  const formatMonthStr = (monthStr: string) => {
    if (!monthStr) return '—'
    return format(new Date(monthStr + '-01'), 'MMMM yyyy', { locale: de })
  }

  const getAnrede = (p: { anrede: string; titel?: string; nachname: string }) => {
    if (p.anrede === 'Frau') return `Sehr geehrte Frau ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    if (p.anrede === 'Herr') return `Sehr geehrter Herr ${p.titel ? p.titel + ' ' : ''}${p.nachname}`
    return 'Sehr geehrte Damen und Herren'
  }

  const mahnungTitles: Record<string, string> = {
    '1': '1. Mahnung - Zahlungserinnerung',
    '2': '2. Mahnung - Nachdrückliche Zahlungsaufforderung',
    '3': 'Letzte Mahnung vor Kündigung',
  }

  // Header - je nach Stufe andere Farbe
  if (data.mahnungStufe === '3') {
    doc.setFillColor(220, 38, 38) // Rot
  } else if (data.mahnungStufe === '2') {
    doc.setFillColor(249, 115, 22) // Orange
  } else {
    doc.setFillColor(245, 158, 11) // Gelb/Amber
  }
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
  if (data.mahnungStufe === '3') {
    doc.setTextColor(200, 0, 0)
  }
  doc.text(mahnungTitles[data.mahnungStufe] || 'Zahlungsaufforderung', margin, y)
  doc.setTextColor(0)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Mietobjekt: ${formatAddress(data.mietobjektAdresse)}`, margin, y)
  y += 12

  // Anrede
  doc.text(getAnrede(data.mieter) + ',', margin, y)
  y += 8

  // Text je nach Stufe
  let einleitung: string
  if (data.mahnungStufe === '1') {
    einleitung = 'bei der Überprüfung der Zahlungseingänge mussten wir leider feststellen, dass folgende Mietzahlungen noch ausstehen:'
  } else if (data.mahnungStufe === '2') {
    einleitung = 'trotz unserer vorherigen Zahlungserinnerung sind die nachfolgend aufgeführten Mietzahlungen nach wie vor offen:'
  } else {
    einleitung = 'trotz unserer bisherigen Mahnungen sind die nachfolgenden Mietzahlungen immer noch nicht eingegangen. Dies ist die letzte Mahnung vor einer fristlosen Kündigung des Mietverhältnisses:'
  }

  const einleitungLines = doc.splitTextToSize(einleitung, pageWidth - 2 * margin)
  for (const line of einleitungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 8

  // Rückstands-Tabelle
  doc.setFillColor(254, 242, 242)
  const tableHeight = 8 + (data.rueckstaende.filter(r => r.monat && r.betrag).length * 6) + 10
  doc.rect(margin, y, pageWidth - 2 * margin, tableHeight, 'F')
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Ausstehende Mietzahlungen:', margin + 5, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  for (const rueckstand of data.rueckstaende) {
    if (rueckstand.monat && rueckstand.betrag) {
      doc.text(formatMonthStr(rueckstand.monat), margin + 5, y)
      doc.text(formatCurrency(rueckstand.betrag), margin + 100, y)
      y += 5
    }
  }
  y += 3

  // Summe
  doc.setDrawColor(200, 0, 0)
  doc.line(margin + 5, y, pageWidth - margin - 5, y)
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(200, 0, 0)
  doc.text('Gesamtbetrag:', margin + 5, y)
  doc.text(formatCurrency(data.gesamtrueckstand), margin + 100, y)
  doc.setTextColor(0)
  y += 12

  // Zahlungsaufforderung
  doc.setFont('helvetica', 'normal')
  const zahlungsfristDatum = new Date(data.erstelltAm)
  zahlungsfristDatum.setDate(zahlungsfristDatum.getDate() + parseInt(data.zahlungsfrist))

  const zahlungText = `Wir fordern Sie hiermit auf, den ausstehenden Gesamtbetrag von ${formatCurrency(data.gesamtrueckstand)} bis spätestens zum ${formatDateStr(zahlungsfristDatum.toISOString().split('T')[0])} auf unser Konto zu überweisen.`
  const zahlungLines = doc.splitTextToSize(zahlungText, pageWidth - 2 * margin)
  for (const line of zahlungLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Bankverbindung
  if (data.bankverbindung) {
    doc.setFont('helvetica', 'bold')
    doc.text('Bankverbindung:', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    const bankLines = data.bankverbindung.split('\n')
    for (const line of bankLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Kündigungsandrohung bei Stufe 3
  if (data.mahnungStufe === '3' || data.kuendigungsandrohung) {
    y += 3
    doc.setFillColor(254, 226, 226)
    doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F')
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(153, 27, 27)
    doc.text('WICHTIGER HINWEIS:', margin + 5, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const kuendigungText = 'Sollte der ausstehende Betrag nicht fristgerecht eingehen, sehen wir uns gezwungen, das Mietverhältnis fristlos zu kündigen (§ 543 Abs. 2 Nr. 3 BGB).'
    const kuendigungLines = doc.splitTextToSize(kuendigungText, pageWidth - 2 * margin - 10)
    for (const line of kuendigungLines) {
      doc.text(line, margin + 5, y)
      y += 5
    }
    doc.setTextColor(0)
    y += 8
  }

  // Kontakt
  y += 5
  const kontaktText = 'Sollten Sie Fragen haben oder sich in einer finanziellen Notlage befinden, bitten wir Sie, umgehend Kontakt mit uns aufzunehmen, um eine Lösung zu finden.'
  const kontaktLines = doc.splitTextToSize(kontaktText, pageWidth - 2 * margin)
  for (const line of kontaktLines) {
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
  doc.text(`${mahnungTitles[data.mahnungStufe] || 'Zahlungsaufforderung'} - Mietrückstand`, pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Mietrueckstand_${data.mahnungStufe}_Mahnung_${formatPerson(data.mieter).replace(/\s/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
