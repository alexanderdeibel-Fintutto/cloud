import jsPDF from 'jspdf'
import { formatDate } from '@/lib/utils'

interface GartennutzungsvereinbarungData {
  vermieter: { anrede?: string; titel?: string; vorname: string; nachname: string }
  vermieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mieter: { anrede?: string; titel?: string; vorname: string; nachname: string }
  mieterAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  mietobjektAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  gartenflaeche: string
  gartengroesse: string
  nutzungsbeginn: string
  monatlicheKosten: number | null
  inMieteEnthalten: boolean
  nutzungsrechte: string[]
  pflichten: string[]
  sonstigeVereinbarungen: string
  unterschriftVermieter?: { imageData: string | null; signerName?: string }
  unterschriftMieter?: { imageData: string | null; signerName?: string }
  erstelltAm: string
  erstelltOrt: string
}

const NUTZUNGSRECHTE_LABELS: Record<string, string> = {
  'bepflanzung': 'Bepflanzung mit Blumen und Sträuchern',
  'gemuese': 'Anlegen eines Gemüsegartens',
  'rasen': 'Rasenfläche nutzen',
  'gartenmoebel': 'Aufstellen von Gartenmöbeln',
  'grill': 'Grillen (unter Beachtung der Hausordnung)',
  'spielgeraete': 'Aufstellen von Spielgeräten',
  'pool': 'Aufstellen eines Pools (nach Absprache)',
  'gartenhaus': 'Nutzung des vorhandenen Gartenhauses',
  'kompost': 'Anlegen eines Komposts',
}

const PFLICHTEN_LABELS: Record<string, string> = {
  'rasenpflege': 'Regelmäßiges Rasenmähen',
  'unkraut': 'Unkrautentfernung',
  'hecke': 'Heckenschnitt',
  'laub': 'Laubentfernung im Herbst',
  'winterdienst': 'Winterdienst auf Gartenwegen',
  'bewaesserung': 'Bewässerung der Pflanzen',
  'baumschnitt': 'Obstbaumschnitt',
  'sauberkeit': 'Sauberhalten der Gartenfläche',
}

export async function generateGartennutzungsvereinbarungPDF(data: GartennutzungsvereinbarungData): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  // Titel
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Gartennutzungsvereinbarung', pageWidth / 2, y, { align: 'center' })
  y += 15

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Einleitung
  doc.text('Zwischen', margin, y)
  y += 8

  // Vermieter
  const vermieterName = `${data.vermieter.anrede || ''} ${data.vermieter.titel || ''} ${data.vermieter.vorname} ${data.vermieter.nachname}`.trim()
  doc.setFont('helvetica', 'bold')
  doc.text(vermieterName, margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.vermieterAdresse.strasse} ${data.vermieterAdresse.hausnummer}, ${data.vermieterAdresse.plz} ${data.vermieterAdresse.ort}`, margin, y)
  y += 5
  doc.text('- nachfolgend "Vermieter" genannt -', margin, y)
  y += 10

  doc.text('und', margin, y)
  y += 8

  // Mieter
  const mieterName = `${data.mieter.anrede || ''} ${data.mieter.titel || ''} ${data.mieter.vorname} ${data.mieter.nachname}`.trim()
  doc.setFont('helvetica', 'bold')
  doc.text(mieterName, margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.mieterAdresse.strasse} ${data.mieterAdresse.hausnummer}, ${data.mieterAdresse.plz} ${data.mieterAdresse.ort}`, margin, y)
  y += 5
  doc.text('- nachfolgend "Mieter" genannt -', margin, y)
  y += 10

  doc.text('wird folgende Vereinbarung geschlossen:', margin, y)
  y += 12

  // § 1 Gegenstand
  doc.setFont('helvetica', 'bold')
  doc.text('§ 1 Gegenstand der Vereinbarung', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  const gegenstand = `Der Vermieter überlässt dem Mieter zur Nutzung die Gartenfläche "${data.gartenflaeche || 'gemäß Mietvertrag'}" ${data.gartengroesse ? `mit einer Größe von ca. ${data.gartengroesse}` : ''} am Mietobjekt ${data.mietobjektAdresse.strasse} ${data.mietobjektAdresse.hausnummer}, ${data.mietobjektAdresse.plz} ${data.mietobjektAdresse.ort}.`
  const gegenstandLines = doc.splitTextToSize(gegenstand, pageWidth - 2 * margin)
  doc.text(gegenstandLines, margin, y)
  y += gegenstandLines.length * 5 + 8

  // § 2 Nutzungsbeginn
  doc.setFont('helvetica', 'bold')
  doc.text('§ 2 Nutzungsbeginn und Kosten', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  if (data.nutzungsbeginn) {
    doc.text(`Die Gartennutzung beginnt am ${formatDate(data.nutzungsbeginn)}.`, margin, y)
    y += 5
  }

  if (data.inMieteEnthalten) {
    doc.text('Die Gartennutzung ist in der monatlichen Miete enthalten.', margin, y)
  } else if (data.monatlicheKosten) {
    doc.text(`Für die Gartennutzung wird eine monatliche Pauschale von ${data.monatlicheKosten.toFixed(2)} € vereinbart.`, margin, y)
  }
  y += 10

  // § 3 Nutzungsrechte
  if (data.nutzungsrechte.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('§ 3 Nutzungsrechte', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.text('Dem Mieter ist gestattet:', margin, y)
    y += 5

    data.nutzungsrechte.forEach(recht => {
      const label = NUTZUNGSRECHTE_LABELS[recht] || recht
      doc.text(`• ${label}`, margin + 5, y)
      y += 5
    })
    y += 5
  }

  // § 4 Pflichten
  if (data.pflichten.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('§ 4 Pflichten des Mieters', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.text('Der Mieter verpflichtet sich zur:', margin, y)
    y += 5

    data.pflichten.forEach(pflicht => {
      const label = PFLICHTEN_LABELS[pflicht] || pflicht
      doc.text(`• ${label}`, margin + 5, y)
      y += 5
    })
    y += 5
  }

  // § 5 Sonstige Vereinbarungen
  if (data.sonstigeVereinbarungen) {
    doc.setFont('helvetica', 'bold')
    doc.text('§ 5 Sonstige Vereinbarungen', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')

    const sonstigeLines = doc.splitTextToSize(data.sonstigeVereinbarungen, pageWidth - 2 * margin)
    doc.text(sonstigeLines, margin, y)
    y += sonstigeLines.length * 5 + 5
  }

  // § 6 Rückgabe
  doc.setFont('helvetica', 'bold')
  doc.text(`§ ${data.sonstigeVereinbarungen ? '6' : '5'} Rückgabe`, margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  const rueckgabe = 'Bei Beendigung des Mietverhältnisses ist die Gartenfläche in einem ordnungsgemäßen Zustand zurückzugeben. Vom Mieter eingebrachte Pflanzen und Einrichtungen sind zu entfernen, sofern nichts anderes vereinbart wird.'
  const rueckgabeLines = doc.splitTextToSize(rueckgabe, pageWidth - 2 * margin)
  doc.text(rueckgabeLines, margin, y)
  y += rueckgabeLines.length * 5 + 15

  // Unterschriften
  doc.text(`${data.erstelltOrt}, den ${formatDate(data.erstelltAm)}`, margin, y)
  y += 15

  // Zwei Spalten für Unterschriften
  const col1X = margin
  const col2X = pageWidth / 2 + 10

  doc.line(col1X, y, col1X + 60, y)
  doc.line(col2X, y, col2X + 60, y)
  y += 3

  // Unterschrift Vermieter
  if (data.unterschriftVermieter?.imageData) {
    try {
      doc.addImage(data.unterschriftVermieter.imageData, 'PNG', col1X, y - 20, 50, 15)
    } catch (e) {
      // Ignore image errors
    }
  }

  // Unterschrift Mieter
  if (data.unterschriftMieter?.imageData) {
    try {
      doc.addImage(data.unterschriftMieter.imageData, 'PNG', col2X, y - 20, 50, 15)
    } catch (e) {
      // Ignore image errors
    }
  }

  doc.setFontSize(9)
  doc.text('Vermieter', col1X, y + 3)
  doc.text('Mieter', col2X, y + 3)

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15
  doc.setFontSize(8)
  doc.setTextColor(128)
  doc.text('Erstellt mit Mietrecht-Formulare | www.mietrecht-formulare.de', pageWidth / 2, footerY, { align: 'center' })

  // Download
  const filename = `Gartennutzungsvereinbarung_${data.mieter.nachname}_${data.erstelltAm}.pdf`
  doc.save(filename)
}
