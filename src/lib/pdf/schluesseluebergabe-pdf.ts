import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Schluessel {
  id: string
  bezeichnung: string
  anzahl: string
  nummer: string
}

interface PDFData {
  uebergebender: { anrede: string; titel?: string; vorname: string; nachname: string }
  empfaenger: { anrede: string; titel?: string; vorname: string; nachname: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  uebergabeArt: 'einzug' | 'auszug' | 'sonstige'
  schluessel: Schluessel[]
  bemerkungen?: string
  unterschriftUebergebender?: { imageData: string | null }
  unterschriftEmpfaenger?: { imageData: string | null }
  erstelltAm: string
  erstelltOrt: string
}

const UEBERGABE_LABELS: Record<string, string> = {
  einzug: 'Schlüsselübergabe bei Einzug',
  auszug: 'Schlüsselrückgabe bei Auszug',
  sonstige: 'Schlüsselübergabe',
}

export async function generateSchluesseluebergabePDF(data: PDFData): Promise<void> {
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

  // Header
  doc.setFillColor(245, 158, 11)
  doc.rect(0, 0, pageWidth, 10, 'F')

  y = 22

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Schlüsselübergabeprotokoll', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(UEBERGABE_LABELS[data.uebergabeArt], pageWidth / 2, y, { align: 'center' })
  y += 12

  // Mietobjekt
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Mietobjekt:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(formatAddress(data.mietobjektAdresse), margin, y)
  y += 10

  // Parteien
  doc.setFillColor(254, 249, 195)
  doc.rect(margin, y, (pageWidth - 2 * margin) / 2 - 5, 25, 'F')
  doc.rect(margin + (pageWidth - 2 * margin) / 2 + 5, y, (pageWidth - 2 * margin) / 2 - 5, 25, 'F')

  doc.setFont('helvetica', 'bold')
  doc.text('Übergebender:', margin + 5, y + 6)
  doc.text('Empfänger:', margin + (pageWidth - 2 * margin) / 2 + 10, y + 6)

  doc.setFont('helvetica', 'normal')
  doc.text(formatPerson(data.uebergebender), margin + 5, y + 14)
  doc.text(formatPerson(data.empfaenger), margin + (pageWidth - 2 * margin) / 2 + 10, y + 14)

  y += 35

  // Schlüsselliste
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Übergebene Schlüssel:', margin, y)
  y += 8

  // Tabellenkopf
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F')
  doc.setFontSize(9)
  doc.text('Bezeichnung', margin + 5, y + 5.5)
  doc.text('Anzahl', margin + 90, y + 5.5)
  doc.text('Schlüsselnummer', margin + 120, y + 5.5)
  y += 10

  doc.setFont('helvetica', 'normal')
  let gesamtAnzahl = 0

  for (const schluessel of data.schluessel) {
    if (schluessel.bezeichnung || schluessel.anzahl) {
      doc.text(schluessel.bezeichnung || '—', margin + 5, y)
      doc.text(schluessel.anzahl || '—', margin + 90, y)
      doc.text(schluessel.nummer || '—', margin + 120, y)
      y += 6
      gesamtAnzahl += parseInt(schluessel.anzahl) || 0
    }
  }

  // Summe
  y += 2
  doc.setDrawColor(0)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Gesamtanzahl Schlüssel:', margin + 5, y)
  doc.text(gesamtAnzahl.toString(), margin + 90, y)
  y += 12

  // Bemerkungen
  if (data.bemerkungen) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Bemerkungen:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const bemerkungLines = doc.splitTextToSize(data.bemerkungen, pageWidth - 2 * margin)
    for (const line of bemerkungLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Bestätigungstext
  y += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  if (data.uebergabeArt === 'einzug') {
    const bestaetigung = `Der Empfänger bestätigt hiermit, die oben aufgeführten Schlüssel vollständig und in ordnungsgemäßem Zustand erhalten zu haben.`
    const bestaetigungLines = doc.splitTextToSize(bestaetigung, pageWidth - 2 * margin)
    for (const line of bestaetigungLines) {
      doc.text(line, margin, y)
      y += 5
    }
  } else if (data.uebergabeArt === 'auszug') {
    const bestaetigung = `Der Empfänger bestätigt hiermit, alle zum Mietobjekt gehörenden Schlüssel vollständig zurückerhalten zu haben.`
    const bestaetigungLines = doc.splitTextToSize(bestaetigung, pageWidth - 2 * margin)
    for (const line of bestaetigungLines) {
      doc.text(line, margin, y)
      y += 5
    }
  }
  y += 10

  // Datum und Ort
  doc.text(`${data.erstelltOrt}, den ${formatDateStr(data.erstelltAm)}`, margin, y)
  y += 20

  // Unterschriften
  doc.setDrawColor(0)
  doc.line(margin, y, margin + 70, y)
  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Übergebender', margin, y)
  doc.text('Empfänger', pageWidth - margin - 70, y)

  if (data.unterschriftUebergebender?.imageData) {
    doc.addImage(data.unterschriftUebergebender.imageData, 'PNG', margin, y - 25, 60, 20)
  }
  if (data.unterschriftEmpfaenger?.imageData) {
    doc.addImage(data.unterschriftEmpfaenger.imageData, 'PNG', pageWidth - margin - 70, y - 25, 60, 20)
  }

  // Footer
  const footerY = pageHeight - 10
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Schlüsselübergabeprotokoll', pageWidth / 2, footerY, { align: 'center' })

  // Speichern
  const filename = `Schluesseluebergabe_${formatAddress(data.mietobjektAdresse).replace(/[\s,]/g, '_')}_${formatDateStr(data.erstelltAm).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
