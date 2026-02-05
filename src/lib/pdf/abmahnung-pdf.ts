import jsPDF from 'jspdf'
import { formatDate } from '@/lib/utils'

interface AbmahnungData {
  vermieter: { anrede?: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede?: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  abmahnungsgruende: string[]
  sachverhalt: string
  aufforderung: string
  fristsetzung: string
  androhungKuendigung: boolean
  unterschriftVermieter?: { imageData: string | null; signerName?: string }
  erstelltAm: string
  erstelltOrt: string
}

const ABMAHNUNGSGRUENDE_LABELS: Record<string, string> = {
  'mietrueckstand': 'Mietrückstand / Zahlungsverzug',
  'laermbelaestigung': 'Lärmbelästigung / Ruhestörung',
  'unerlaubte-tierhaltung': 'Unerlaubte Tierhaltung',
  'unerlaubte-untervermietung': 'Unerlaubte Untervermietung',
  'beschaedigung': 'Beschädigung der Mietsache',
  'hausordnung': 'Verstoß gegen Hausordnung',
  'verwahrlosung': 'Verwahrlosung der Wohnung',
  'beleidigung': 'Beleidigung / Bedrohung',
  'gewerbliche-nutzung': 'Unerlaubte gewerbliche Nutzung',
  'sonstiges': 'Sonstiger Grund',
}

export async function generateAbmahnungPDF(data: AbmahnungData): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  // Header
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Absender
  const vermieterName = `${data.vermieter.anrede || ''} ${data.vermieter.titel || ''} ${data.vermieter.vorname} ${data.vermieter.nachname}`.trim()
  doc.text(vermieterName, margin, y)
  y += 5
  doc.text(`${data.vermieterAdresse.strasse} ${data.vermieterAdresse.hausnummer}`, margin, y)
  y += 5
  doc.text(`${data.vermieterAdresse.plz} ${data.vermieterAdresse.ort}`, margin, y)
  y += 15

  // Empfänger
  const mieterName = `${data.mieter.anrede || ''} ${data.mieter.titel || ''} ${data.mieter.vorname} ${data.mieter.nachname}`.trim()
  doc.text(mieterName, margin, y)
  y += 5
  doc.text(`${data.mieterAdresse.strasse} ${data.mieterAdresse.hausnummer}`, margin, y)
  y += 5
  doc.text(`${data.mieterAdresse.plz} ${data.mieterAdresse.ort}`, margin, y)
  y += 15

  // Datum
  doc.text(`${data.erstelltOrt}, den ${formatDate(data.erstelltAm)}`, pageWidth - margin - 60, y)
  y += 15

  // Betreff
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Abmahnung', margin, y)
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mietobjekt: ${data.mietobjektAdresse.strasse} ${data.mietobjektAdresse.hausnummer}, ${data.mietobjektAdresse.plz} ${data.mietobjektAdresse.ort}`, margin, y)
  y += 12

  // Anrede
  doc.text(`Sehr geehrte${data.mieter.anrede === 'Frau' ? '' : 'r'} ${data.mieter.anrede || ''} ${data.mieter.nachname},`, margin, y)
  y += 10

  // Einleitung
  const einleitung = `hiermit mahne ich Sie wegen folgender Vertragsverletzung(en) ab:`
  doc.text(einleitung, margin, y)
  y += 10

  // Abmahnungsgründe
  doc.setFont('helvetica', 'bold')
  doc.text('Grund der Abmahnung:', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  data.abmahnungsgruende.forEach(grund => {
    const label = ABMAHNUNGSGRUENDE_LABELS[grund] || grund
    doc.text(`• ${label}`, margin + 5, y)
    y += 5
  })
  y += 5

  // Sachverhalt
  if (data.sachverhalt) {
    doc.setFont('helvetica', 'bold')
    doc.text('Sachverhalt:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')

    const sachverhaltLines = doc.splitTextToSize(data.sachverhalt, pageWidth - 2 * margin)
    doc.text(sachverhaltLines, margin, y)
    y += sachverhaltLines.length * 5 + 5
  }

  // Aufforderung
  if (data.aufforderung) {
    doc.setFont('helvetica', 'bold')
    doc.text('Aufforderung:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')

    const aufforderungLines = doc.splitTextToSize(data.aufforderung, pageWidth - 2 * margin)
    doc.text(aufforderungLines, margin, y)
    y += aufforderungLines.length * 5 + 5
  }

  // Fristsetzung
  if (data.fristsetzung) {
    doc.text(`Ich setze Ihnen eine Frist bis zum ${formatDate(data.fristsetzung)}, um das beanstandete Verhalten abzustellen.`, margin, y)
    y += 10
  }

  // Androhung Kündigung
  if (data.androhungKuendigung) {
    doc.setFont('helvetica', 'bold')
    const androhung = 'Sollten Sie dieser Aufforderung nicht nachkommen, behalte ich mir vor, das Mietverhältnis fristlos, hilfsweise fristgerecht zu kündigen.'
    const androhungLines = doc.splitTextToSize(androhung, pageWidth - 2 * margin)
    doc.text(androhungLines, margin, y)
    y += androhungLines.length * 5 + 5
    doc.setFont('helvetica', 'normal')
  }

  // Rechtlicher Hinweis
  y += 5
  const hinweis = 'Diese Abmahnung ergeht gemäß § 541 BGB (Unterlassungsklage bei vertragswidrigem Gebrauch) bzw. § 543 BGB (außerordentliche fristlose Kündigung aus wichtigem Grund).'
  const hinweisLines = doc.splitTextToSize(hinweis, pageWidth - 2 * margin)
  doc.setFontSize(9)
  doc.text(hinweisLines, margin, y)
  y += hinweisLines.length * 4 + 10
  doc.setFontSize(10)

  // Grußformel
  doc.text('Mit freundlichen Grüßen', margin, y)
  y += 15

  // Unterschrift
  if (data.unterschriftVermieter?.imageData) {
    try {
      doc.addImage(data.unterschriftVermieter.imageData, 'PNG', margin, y, 50, 20)
      y += 22
    } catch (e) {
      y += 10
    }
  }

  doc.text(vermieterName, margin, y)

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15
  doc.setFontSize(8)
  doc.setTextColor(128)
  doc.text('Erstellt mit Mietrecht-Formulare | www.mietrecht-formulare.de', pageWidth / 2, footerY, { align: 'center' })

  // Download
  const filename = `Abmahnung_${data.mieter.nachname}_${data.erstelltAm}.pdf`
  doc.save(filename)
}
