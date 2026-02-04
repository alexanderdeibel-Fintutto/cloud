import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface WohnungsgeberbestaetigungPDFData {
  wohnungsgeber: { anrede: string; titel?: string; vorname: string; nachname: string }
  wohnungsgeberAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  wohnungsgeberIstEigentuemer: boolean
  meldepflichtiger: { anrede: string; titel?: string; vorname: string; nachname: string }
  meldepflichtigerGeburtsdatum: string
  meldepflichtigerGeburtsort?: string
  meldepflichtigerStaatsangehoerigkeit?: string
  meldepflichtigerFamilienstand?: string
  wohnungAdresse: { strasse: string; hausnummer: string; plz: string; ort: string }
  einzugsdatum: string
  meldeart: 'einzug' | 'auszug'
  auszugsdatum?: string
  ausstellungsdatum: string
  ausstellungsort: string
  unterschriftWohnungsgeber?: { imageData: string | null; signerName: string; signedAt: string | null }
}

export async function generateWohnungsgeberbestaetigungPDF(data: WohnungsgeberbestaetigungPDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = margin

  // Formatierungshilfen
  const formatPerson = (p: { titel?: string; vorname: string; nachname: string }) =>
    [p.titel, p.vorname, p.nachname].filter(Boolean).join(' ')

  const formatAddress = (a: { strasse: string; hausnummer: string; plz: string; ort: string }) =>
    `${a.strasse} ${a.hausnummer}, ${a.plz} ${a.ort}`

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return '—'
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de })
  }

  // Titel
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Wohnungsgeberbestätigung', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('nach § 19 Bundesmeldegesetz (BMG)', pageWidth / 2, y, { align: 'center' })
  y += 10

  // Hinweis
  doc.setFontSize(8)
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, y, pageWidth - 2 * margin, 12, 'F')
  y += 4
  doc.text('Hinweis: Der Wohnungsgeber ist verpflichtet, der meldepflichtigen Person den Einzug oder Auszug', margin + 2, y)
  y += 4
  doc.text('innerhalb von zwei Wochen schriftlich zu bestätigen (§ 19 Abs. 1 BMG).', margin + 2, y)
  y += 10

  // Art der Meldung
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Art der Meldung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Checkboxen für Meldeart
  const checkboxSize = 4
  const einzugChecked = data.meldeart === 'einzug'
  const auszugChecked = data.meldeart === 'auszug'

  // Einzug
  doc.rect(margin, y - 3, checkboxSize, checkboxSize)
  if (einzugChecked) {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.8, y)
    doc.setFont('helvetica', 'normal')
  }
  doc.text('Einzug am: ' + formatDateStr(data.einzugsdatum), margin + 7, y)
  y += 6

  // Auszug
  doc.rect(margin, y - 3, checkboxSize, checkboxSize)
  if (auszugChecked) {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.8, y)
    doc.setFont('helvetica', 'normal')
  }
  doc.text('Auszug am: ' + formatDateStr(data.auszugsdatum || ''), margin + 7, y)
  y += 10

  // Wohnung
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Anschrift der Wohnung', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.wohnungAdresse.strasse} ${data.wohnungAdresse.hausnummer}`, margin, y)
  y += 5
  doc.text(`${data.wohnungAdresse.plz} ${data.wohnungAdresse.ort}`, margin, y)
  y += 10

  // Meldepflichtige Person
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Angaben zur meldepflichtigen Person', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Tabelle für Personendaten
  const col1 = margin
  const col2 = margin + 45

  doc.text('Name:', col1, y)
  doc.text(formatPerson(data.meldepflichtiger), col2, y)
  y += 5

  if (data.meldepflichtigerGeburtsdatum) {
    doc.text('Geburtsdatum:', col1, y)
    doc.text(formatDateStr(data.meldepflichtigerGeburtsdatum), col2, y)
    y += 5
  }

  if (data.meldepflichtigerGeburtsort) {
    doc.text('Geburtsort:', col1, y)
    doc.text(data.meldepflichtigerGeburtsort, col2, y)
    y += 5
  }

  if (data.meldepflichtigerStaatsangehoerigkeit) {
    doc.text('Staatsangehörigkeit:', col1, y)
    doc.text(data.meldepflichtigerStaatsangehoerigkeit, col2, y)
    y += 5
  }

  if (data.meldepflichtigerFamilienstand) {
    doc.text('Familienstand:', col1, y)
    doc.text(data.meldepflichtigerFamilienstand, col2, y)
    y += 5
  }

  y += 8

  // Wohnungsgeber
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Angaben zum Wohnungsgeber', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  doc.text('Name:', col1, y)
  doc.text(formatPerson(data.wohnungsgeber), col2, y)
  y += 5

  doc.text('Anschrift:', col1, y)
  doc.text(formatAddress(data.wohnungsgeberAdresse), col2, y)
  y += 5

  // Eigentümer-Status
  doc.rect(margin, y - 3, checkboxSize, checkboxSize)
  if (data.wohnungsgeberIstEigentuemer) {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.8, y)
    doc.setFont('helvetica', 'normal')
  }
  doc.text('Der Wohnungsgeber ist Eigentümer der Wohnung', margin + 7, y)
  y += 5

  doc.rect(margin, y - 3, checkboxSize, checkboxSize)
  if (!data.wohnungsgeberIstEigentuemer) {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.8, y)
    doc.setFont('helvetica', 'normal')
  }
  doc.text('Der Wohnungsgeber ist Beauftragter des Eigentümers', margin + 7, y)
  y += 15

  // Bestätigungstext
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')
  y += 6

  doc.setFontSize(9)
  const confirmText = data.meldeart === 'einzug'
    ? `Hiermit wird bestätigt, dass die oben genannte Person am ${formatDateStr(data.einzugsdatum)} in die genannte Wohnung eingezogen ist.`
    : `Hiermit wird bestätigt, dass die oben genannte Person am ${formatDateStr(data.auszugsdatum || '')} aus der genannten Wohnung ausgezogen ist.`

  const lines = doc.splitTextToSize(confirmText, pageWidth - 2 * margin - 4)
  for (const line of lines) {
    doc.text(line, margin + 2, y)
    y += 4
  }
  y += 12

  // Unterschrift
  doc.setFontSize(10)
  doc.text(`${data.ausstellungsort}, den ${formatDateStr(data.ausstellungsdatum)}`, margin, y)
  y += 20

  doc.setDrawColor(0)
  doc.line(margin, y, margin + 80, y)
  y += 5
  doc.setFontSize(9)
  doc.text('Unterschrift des Wohnungsgebers', margin, y)

  // Signatur-Bild
  if (data.unterschriftWohnungsgeber?.imageData) {
    doc.addImage(data.unterschriftWohnungsgeber.imageData, 'PNG', margin, y - 25, 70, 20)
  }

  // Hinweis unten
  y = doc.internal.pageSize.getHeight() - 25
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Hinweise:', margin, y)
  y += 4
  doc.text('• Die Wohnungsgeberbestätigung ist der meldepflichtigen Person auszuhändigen.', margin, y)
  y += 4
  doc.text('• Wer eine Bestätigung nicht, nicht richtig oder nicht rechtzeitig ausstellt, handelt ordnungswidrig (§ 54 BMG).', margin, y)
  y += 4
  doc.text('• Diese Bestätigung dient nicht als Mietvertrag.', margin, y)

  // Speichern
  const filename = `Wohnungsgeberbestaetigung_${formatPerson(data.meldepflichtiger).replace(/\s/g, '_')}_${formatDateStr(data.einzugsdatum).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
