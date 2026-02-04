import { jsPDF } from 'jspdf'
import { MietvertragData } from '@/types/mietvertrag'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  VERTRAGSPARTEIEN_TEXTE,
  MIETGEGENSTAND_TEXTE,
  MIETZEIT_TEXTE,
  MIETE_TEXTE,
  KAUTION_TEXTE,
  NUTZUNG_TEXTE,
  INSTANDHALTUNG_TEXTE,
  BETRETUNGSRECHT_TEXTE,
  RUECKGABE_TEXTE,
  HAUSORDNUNG_TEXTE,
  HAFTUNG_TEXTE,
  SCHLUSS_TEXTE,
  fillTemplate
} from '@/lib/legal/mietvertrag-textbausteine'

// PDF-Konfiguration
const PDF_CONFIG = {
  margin: 20,
  lineHeight: 5.5,
  paragraphSpacing: 3,
  fontSize: {
    title: 16,
    subtitle: 12,
    heading: 11,
    subheading: 10,
    normal: 9.5,
    small: 8.5,
    tiny: 7.5,
  },
  colors: {
    primary: '#1e40af',
    black: '#000000',
    gray: '#6b7280',
    lightGray: '#e5e7eb',
  }
}

interface PDFContext {
  doc: jsPDF
  y: number
  pageHeight: number
  pageWidth: number
  margin: number
  contentWidth: number
}

// Hilfsfunktionen
function checkPageBreak(ctx: PDFContext, requiredSpace: number): void {
  if (ctx.y + requiredSpace > ctx.pageHeight - ctx.margin - 15) {
    ctx.doc.addPage()
    ctx.y = ctx.margin
  }
}

function addTitle(ctx: PDFContext, text: string): void {
  checkPageBreak(ctx, 20)
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.title)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.primary)
  ctx.doc.text(text, ctx.pageWidth / 2, ctx.y, { align: 'center' })
  ctx.y += 10
}

function addSubtitle(ctx: PDFContext, text: string): void {
  checkPageBreak(ctx, 12)
  ctx.y += 4
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.subtitle)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(text, ctx.margin, ctx.y)
  ctx.y += 7
}

function addHeading(ctx: PDFContext, text: string): void {
  checkPageBreak(ctx, 10)
  ctx.y += 3
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.heading)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(text, ctx.margin, ctx.y)
  ctx.y += 5
}

function addSubheading(ctx: PDFContext, text: string): void {
  checkPageBreak(ctx, 8)
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.subheading)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(text, ctx.margin, ctx.y)
  ctx.y += 5
}

function addParagraph(ctx: PDFContext, text: string, indent: number = 0): void {
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)

  const maxWidth = ctx.contentWidth - indent
  const lines = ctx.doc.splitTextToSize(text, maxWidth)

  for (const line of lines) {
    checkPageBreak(ctx, PDF_CONFIG.lineHeight)
    ctx.doc.text(line, ctx.margin + indent, ctx.y)
    ctx.y += PDF_CONFIG.lineHeight
  }
  ctx.y += PDF_CONFIG.paragraphSpacing
}

function addNumberedParagraph(ctx: PDFContext, number: string, text: string): void {
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)

  const numberWidth = 8
  const maxWidth = ctx.contentWidth - numberWidth
  const lines = ctx.doc.splitTextToSize(text, maxWidth)

  checkPageBreak(ctx, PDF_CONFIG.lineHeight * lines.length)

  // Nummer
  ctx.doc.text(number, ctx.margin, ctx.y)

  // Text
  for (let i = 0; i < lines.length; i++) {
    ctx.doc.text(lines[i], ctx.margin + numberWidth, ctx.y)
    if (i < lines.length - 1) {
      ctx.y += PDF_CONFIG.lineHeight
      checkPageBreak(ctx, PDF_CONFIG.lineHeight)
    }
  }
  ctx.y += PDF_CONFIG.lineHeight + PDF_CONFIG.paragraphSpacing
}

function addBulletPoint(ctx: PDFContext, text: string, indent: number = 5): void {
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)

  const bulletIndent = indent + 3
  const maxWidth = ctx.contentWidth - bulletIndent - 5
  const lines = ctx.doc.splitTextToSize(text, maxWidth)

  checkPageBreak(ctx, PDF_CONFIG.lineHeight)
  ctx.doc.text('•', ctx.margin + indent, ctx.y)

  for (let i = 0; i < lines.length; i++) {
    ctx.doc.text(lines[i], ctx.margin + bulletIndent + 2, ctx.y)
    ctx.y += PDF_CONFIG.lineHeight
    if (i < lines.length - 1) {
      checkPageBreak(ctx, PDF_CONFIG.lineHeight)
    }
  }
}

function addLabelValue(ctx: PDFContext, label: string, value: string, indent: number = 0): void {
  checkPageBreak(ctx, PDF_CONFIG.lineHeight)
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(label + ':', ctx.margin + indent, ctx.y)

  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(value, ctx.margin + 55 + indent, ctx.y)
  ctx.y += PDF_CONFIG.lineHeight
}

function addSeparator(ctx: PDFContext): void {
  ctx.y += 3
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y)
  ctx.y += 5
}

function addSignatureLine(ctx: PDFContext, label: string, name: string, imageData?: string | null): void {
  checkPageBreak(ctx, 45)

  const signWidth = 70
  const lineY = ctx.y + 22

  // Unterschriftsbild wenn vorhanden
  if (imageData) {
    try {
      ctx.doc.addImage(imageData, 'PNG', ctx.margin, ctx.y, signWidth, 18)
    } catch (e) {
      // Fallback wenn Bild nicht geladen werden kann
    }
  }

  // Unterschriftslinie
  ctx.doc.setDrawColor(PDF_CONFIG.colors.black)
  ctx.doc.line(ctx.margin, lineY, ctx.margin + signWidth, lineY)

  // Label
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(label, ctx.margin, lineY + 4)

  // Name
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(name, ctx.margin, lineY + 8)

  ctx.y = lineY + 12
}

// Adresse formatieren
function formatAddress(address: { strasse: string; hausnummer: string; plz: string; ort: string; zusatz?: string }): string {
  const parts = []
  if (address.strasse && address.hausnummer) {
    parts.push(`${address.strasse} ${address.hausnummer}`)
  }
  if (address.zusatz) {
    parts.push(address.zusatz)
  }
  if (address.plz && address.ort) {
    parts.push(`${address.plz} ${address.ort}`)
  }
  return parts.join(', ')
}

// Personenname formatieren
function formatPerson(person: { anrede: string; titel?: string; vorname: string; nachname: string }): string {
  const parts = []
  if (person.anrede === 'firma') {
    parts.push(person.vorname) // Bei Firma ist vorname = Firmenname
  } else {
    if (person.titel) parts.push(person.titel)
    parts.push(person.vorname)
    parts.push(person.nachname)
  }
  return parts.filter(Boolean).join(' ')
}

// Etagen-Map
const ETAGE_MAP: Record<string, string> = {
  'eg': 'Erdgeschoss', 'hg': 'Hochparterre', 'dg': 'Dachgeschoss', 'ug': 'Untergeschoss',
  '1': '1. Obergeschoss', '2': '2. Obergeschoss', '3': '3. Obergeschoss',
  '4': '4. Obergeschoss', '5': '5. Obergeschoss', '6+': '6. Obergeschoss oder höher'
}

const LAGE_MAP: Record<string, string> = {
  'links': 'links', 'rechts': 'rechts', 'mitte': 'Mitte', 'vorne': 'vorne', 'hinten': 'hinten'
}

// Hauptfunktion: PDF generieren
export async function generateMietvertragPDF(data: MietvertragData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const ctx: PDFContext = {
    doc,
    y: PDF_CONFIG.margin,
    pageHeight: doc.internal.pageSize.getHeight(),
    pageWidth: doc.internal.pageSize.getWidth(),
    margin: PDF_CONFIG.margin,
    contentWidth: doc.internal.pageSize.getWidth() - (PDF_CONFIG.margin * 2)
  }

  const gesamtmiete = (data.kaltmiete || 0) + (data.nebenkostenVorauszahlung || 0) + (data.heizkostenVorauszahlung || 0)

  // === DECKBLATT ===
  ctx.y = 35
  addTitle(ctx, 'WOHNRAUMMIETVERTRAG')

  ctx.doc.setFontSize(PDF_CONFIG.fontSize.subtitle)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text('gemäß §§ 535 ff. BGB', ctx.pageWidth / 2, ctx.y, { align: 'center' })
  ctx.y += 15

  // Kurzübersicht Box
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.setFillColor('#f8fafc')
  ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 65, 3, 3, 'FD')
  ctx.y += 8

  addSubheading(ctx, 'MIETOBJEKT')
  addParagraph(ctx, formatAddress(data.objektAdresse), 5)
  if (data.wohnflaeche) {
    addParagraph(ctx, `Wohnfläche: ca. ${data.wohnflaeche} m² | Zimmer: ${data.zimmeranzahl || '—'}`, 5)
  }
  if (data.objektLage.etage) {
    const lage = data.objektLage.lage ? `, ${LAGE_MAP[data.objektLage.lage] || data.objektLage.lage}` : ''
    addParagraph(ctx, `Lage: ${ETAGE_MAP[data.objektLage.etage] || data.objektLage.etage}${lage}`, 5)
  }

  ctx.y += 3
  addSubheading(ctx, 'VERTRAGSPARTEIEN')
  addLabelValue(ctx, 'Vermieter', formatPerson(data.vermieter), 5)
  addLabelValue(ctx, 'Mieter', data.mieter.map(m => formatPerson(m)).join(', '), 5)

  ctx.y += 3
  addSubheading(ctx, 'MIETKONDITIONEN')
  addLabelValue(ctx, 'Gesamtmiete', `${formatCurrency(gesamtmiete)} monatlich`, 5)
  addLabelValue(ctx, 'Mietbeginn', data.mietdauer.startDate ? formatDate(data.mietdauer.startDate) : '—', 5)
  addLabelValue(ctx, 'Mietzeit', data.mietdauer.isUnbefristet ? 'unbefristet' : `befristet bis ${data.mietdauer.endDate ? formatDate(data.mietdauer.endDate) : '—'}`, 5)

  ctx.y += 10
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(`Erstellt am: ${formatDate(new Date())}`, ctx.pageWidth / 2, ctx.y, { align: 'center' })

  // === SEITE 2: VERTRAGSTEXT ===
  doc.addPage()
  ctx.y = PDF_CONFIG.margin

  // =============================================
  // § 1 VERTRAGSPARTEIEN
  // =============================================
  addSubtitle(ctx, '§ 1 Vertragsparteien')

  addParagraph(ctx, VERTRAGSPARTEIEN_TEXTE.praeambel)
  ctx.y += 2

  addHeading(ctx, 'Vermieter:')
  addParagraph(ctx, formatPerson(data.vermieter), 5)
  addParagraph(ctx, formatAddress(data.vermieterAdresse), 5)
  if (data.vermieter.telefon) addParagraph(ctx, `Telefon: ${data.vermieter.telefon}`, 5)
  if (data.vermieter.email) addParagraph(ctx, `E-Mail: ${data.vermieter.email}`, 5)
  addParagraph(ctx, '— nachfolgend „Vermieter" genannt —', 5)

  ctx.y += 2
  addHeading(ctx, 'Mieter:')
  data.mieter.forEach((mieter) => {
    addParagraph(ctx, formatPerson(mieter), 5)
    if (mieter.geburtsdatum) addParagraph(ctx, `geboren am: ${formatDate(mieter.geburtsdatum)}`, 5)
    if (mieter.telefon) addParagraph(ctx, `Telefon: ${mieter.telefon}`, 5)
    if (mieter.email) addParagraph(ctx, `E-Mail: ${mieter.email}`, 5)
  })
  addParagraph(ctx, '— nachfolgend „Mieter" genannt —', 5)

  if (data.mieter.length > 1) {
    ctx.y += 2
    addParagraph(ctx, VERTRAGSPARTEIEN_TEXTE.mehrere_mieter)
  }

  addSeparator(ctx)

  // =============================================
  // § 2 MIETGEGENSTAND
  // =============================================
  addSubtitle(ctx, '§ 2 Mietgegenstand')

  addNumberedParagraph(ctx, '(1)', `Der Vermieter vermietet dem Mieter zu Wohnzwecken die nachfolgend beschriebenen Räume:`)

  addParagraph(ctx, `Anschrift: ${formatAddress(data.objektAdresse)}`, 8)

  if (data.objektLage.etage) {
    const lage = data.objektLage.lage ? `, ${LAGE_MAP[data.objektLage.lage] || data.objektLage.lage}` : ''
    addParagraph(ctx, `Lage im Haus: ${ETAGE_MAP[data.objektLage.etage] || data.objektLage.etage}${lage}`, 8)
  }

  addNumberedParagraph(ctx, '(2)', `Die Wohnung hat eine Wohnfläche von ca. ${data.wohnflaeche || '___'} m² und besteht aus ${data.zimmeranzahl || '___'} Zimmern, Küche, Bad/WC und Flur.`)

  addParagraph(ctx, MIETGEGENSTAND_TEXTE.wohnflaeche_abweichung)

  // Zubehör und Ausstattung
  const zubehoer = []
  if (data.hatBalkon) zubehoer.push('Balkon')
  if (data.hatTerrasse) zubehoer.push('Terrasse')
  if (data.hatGarten) zubehoer.push('Gartennutzung')
  if (data.hatKeller) zubehoer.push(`Kellerraum${data.kellerNummer ? ` Nr. ${data.kellerNummer}` : ''}`)
  if (data.hatStellplatz) zubehoer.push(`PKW-Stellplatz${data.stellplatzNummer ? ` Nr. ${data.stellplatzNummer}` : ''}`)
  if (data.hatGarage) zubehoer.push(`Garage${data.garagenNummer ? ` Nr. ${data.garagenNummer}` : ''}`)
  if (data.hatEinbaukueche) zubehoer.push('Einbauküche (Inventarliste als Anlage)')

  if (zubehoer.length > 0) {
    addNumberedParagraph(ctx, '(3)', 'Mitvermietet werden:')
    zubehoer.forEach(item => addBulletPoint(ctx, item, 8))
  }

  if (data.ausstattungSonstige) {
    addNumberedParagraph(ctx, '(4)', `Sonstige Ausstattung: ${data.ausstattungSonstige}`)
  }

  addParagraph(ctx, MIETGEGENSTAND_TEXTE.keller_mitnutzung)
  addParagraph(ctx, MIETGEGENSTAND_TEXTE.energieausweis)

  addSeparator(ctx)

  // =============================================
  // § 3 MIETZEIT
  // =============================================
  addSubtitle(ctx, '§ 3 Mietzeit')

  const startDatumFormatiert = data.mietdauer.startDate ? formatDate(data.mietdauer.startDate) : '_______________'

  if (data.mietdauer.isUnbefristet) {
    addNumberedParagraph(ctx, '(1)', fillTemplate(MIETZEIT_TEXTE.unbefristet.standard, { startDatum: startDatumFormatiert }))
    addNumberedParagraph(ctx, '(2)', MIETZEIT_TEXTE.unbefristet.kuendigung_mieter)
    addNumberedParagraph(ctx, '(3)', MIETZEIT_TEXTE.unbefristet.kuendigung_vermieter)
  } else {
    const endDatumFormatiert = data.mietdauer.endDate ? formatDate(data.mietdauer.endDate) : '_______________'
    addNumberedParagraph(ctx, '(1)', fillTemplate(MIETZEIT_TEXTE.befristet.standard, { startDatum: startDatumFormatiert, endDatum: endDatumFormatiert }))

    if (data.befristungsgrund) {
      const befristungsText = data.befristungsgrund === 'eigenbedarf'
        ? MIETZEIT_TEXTE.befristet.befristungsgruende.eigenbedarf
        : data.befristungsgrund === 'abriss'
          ? MIETZEIT_TEXTE.befristet.befristungsgruende.abriss
          : data.befristungsgrund === 'werkswohnung'
            ? MIETZEIT_TEXTE.befristet.befristungsgruende.werkswohnung
            : `Befristungsgrund: ${data.befristungsgrund}`
      addNumberedParagraph(ctx, '(2)', befristungsText)
    }
    addParagraph(ctx, MIETZEIT_TEXTE.befristet.verlaengerung)
  }

  addParagraph(ctx, MIETZEIT_TEXTE.ausserordentliche_kuendigung)

  addSeparator(ctx)

  // =============================================
  // § 4 MIETE UND NEBENKOSTEN
  // =============================================
  addSubtitle(ctx, '§ 4 Miete und Nebenkosten')

  addNumberedParagraph(ctx, '(1)', 'Die monatliche Miete setzt sich wie folgt zusammen:')

  addLabelValue(ctx, 'Grundmiete (Nettokaltmiete)', formatCurrency(data.kaltmiete || 0), 8)
  addLabelValue(ctx, 'Betriebskostenvorauszahlung', formatCurrency(data.nebenkostenVorauszahlung || 0), 8)
  addLabelValue(ctx, 'Heizkostenvorauszahlung', formatCurrency(data.heizkostenVorauszahlung || 0), 8)
  ctx.doc.setFont('helvetica', 'bold')
  addLabelValue(ctx, 'Gesamtmiete monatlich', formatCurrency(gesamtmiete), 8)
  ctx.doc.setFont('helvetica', 'normal')

  const faelligkeitTag = data.zahlungsFaelligkeit || '3'
  addNumberedParagraph(ctx, '(2)', fillTemplate(MIETE_TEXTE.faelligkeit, { tag: faelligkeitTag }))

  if (data.vermieterIBAN) {
    addParagraph(ctx, fillTemplate(MIETE_TEXTE.zahlungsweise.ueberweisung, {
      inhaber: formatPerson(data.vermieter),
      iban: data.vermieterIBAN,
      bic: '—',
      bank: '—'
    }), 8)
  }

  addNumberedParagraph(ctx, '(3)', MIETE_TEXTE.betriebskosten.vorauszahlung)

  addParagraph(ctx, 'Umlagefähige Betriebskosten gemäß § 2 BetrKV:')
  const betriebskostenListe = [
    'Grundsteuer', 'Wasserversorgung', 'Entwässerung',
    'Heizung (verbrauchsabhängig nach HeizKV)', 'Warmwasser (verbrauchsabhängig nach HeizKV)',
    'Aufzug', 'Straßenreinigung und Müllabfuhr', 'Gebäudereinigung',
    'Gartenpflege', 'Beleuchtung Allgemeinflächen', 'Schornsteinreinigung',
    'Sach- und Haftpflichtversicherung', 'Hauswart', 'Kabelanschluss/Antenne'
  ]
  betriebskostenListe.forEach(item => addBulletPoint(ctx, item, 8))

  // Staffel-/Indexmiete
  if (data.staffelmiete?.enabled) {
    addNumberedParagraph(ctx, '(4)', 'Die Vertragsparteien vereinbaren eine Staffelmiete gemäß § 557a BGB:')
    if (data.staffelmiete.staffeln) {
      data.staffelmiete.staffeln.forEach((staffel, index) => {
        addParagraph(ctx, `${index + 1}. Staffel ab ${staffel.abDatum}: ${formatCurrency(staffel.betrag)} Kaltmiete`, 8)
      })
    }
    addParagraph(ctx, 'Während der Laufzeit der Staffelmiete ist eine Erhöhung nach §§ 558-559 BGB ausgeschlossen.')
  } else if (data.indexmiete?.enabled) {
    addNumberedParagraph(ctx, '(4)', fillTemplate(MIETE_TEXTE.mieterhoehung.indexmiete, {
      basismonat: data.indexmiete.basisjahr?.toString() || new Date().getFullYear().toString(),
      basiswert: '100'
    }))
  } else {
    addNumberedParagraph(ctx, '(4)', MIETE_TEXTE.mieterhoehung.vergleichsmiete)
  }

  addNumberedParagraph(ctx, '(5)', MIETE_TEXTE.verzug)

  addSeparator(ctx)

  // =============================================
  // § 5 KAUTION
  // =============================================
  addSubtitle(ctx, '§ 5 Mietsicherheit (Kaution)')

  const kautionBetrag = data.kaution || 0
  const kaltmiete = data.kaltmiete || 1
  const kautionMonate = kautionBetrag > 0 ? Math.round((kautionBetrag / kaltmiete) * 10) / 10 : 0

  addNumberedParagraph(ctx, '(1)', fillTemplate(KAUTION_TEXTE.hoehe, {
    betrag: formatCurrency(kautionBetrag),
    monate: kautionMonate.toString()
  }))

  const kautionsartTexte: Record<string, string> = {
    barkaution: KAUTION_TEXTE.arten.barkaution,
    sparbuch: KAUTION_TEXTE.arten.sparbuch,
    buergschaft: KAUTION_TEXTE.arten.buergschaft,
    kautionsversicherung: KAUTION_TEXTE.arten.kautionsversicherung
  }
  if (data.kautionsart && kautionsartTexte[data.kautionsart]) {
    addNumberedParagraph(ctx, '(2)', kautionsartTexte[data.kautionsart])
  }

  if (data.ratenzahlungKaution) {
    addNumberedParagraph(ctx, '(3)', KAUTION_TEXTE.ratenzahlung)
  }

  addNumberedParagraph(ctx, data.ratenzahlungKaution ? '(4)' : '(3)', KAUTION_TEXTE.anlage)
  addNumberedParagraph(ctx, data.ratenzahlungKaution ? '(5)' : '(4)', KAUTION_TEXTE.rueckgabe)

  addSeparator(ctx)

  // =============================================
  // § 6 NUTZUNG DER MIETRÄUME
  // =============================================
  addSubtitle(ctx, '§ 6 Nutzung der Mieträume')

  addNumberedParagraph(ctx, '(1)', NUTZUNG_TEXTE.wohnzwecke)
  addNumberedParagraph(ctx, '(2)', NUTZUNG_TEXTE.personenzahl)

  // Tierhaltung
  const tierhaltungTexte: Record<string, string> = {
    erlaubt: NUTZUNG_TEXTE.tierhaltung.erlaubt,
    verboten: NUTZUNG_TEXTE.tierhaltung.verboten,
    genehmigungspflichtig: NUTZUNG_TEXTE.tierhaltung.genehmigungspflichtig
  }
  addNumberedParagraph(ctx, '(3)', `Tierhaltung: ${tierhaltungTexte[data.tierhaltung] || tierhaltungTexte.genehmigungspflichtig}`)

  // Untervermietung
  const untervermietungTexte: Record<string, string> = {
    erlaubt: NUTZUNG_TEXTE.untervermietung.erlaubt,
    verboten: NUTZUNG_TEXTE.untervermietung.verboten,
    genehmigungspflichtig: NUTZUNG_TEXTE.untervermietung.genehmigungspflichtig
  }
  addNumberedParagraph(ctx, '(4)', `Untervermietung: ${untervermietungTexte[data.untervermietung] || untervermietungTexte.genehmigungspflichtig}`)

  addNumberedParagraph(ctx, '(5)', NUTZUNG_TEXTE.bauliche_veraenderungen)

  addSeparator(ctx)

  // =============================================
  // § 7 INSTANDHALTUNG UND SCHÖNHEITSREPARATUREN
  // =============================================
  addSubtitle(ctx, '§ 7 Instandhaltung und Schönheitsreparaturen')

  addNumberedParagraph(ctx, '(1)', INSTANDHALTUNG_TEXTE.vermieter)

  // Schönheitsreparaturen
  if (data.schoenheitsreparaturen === 'mieter') {
    addNumberedParagraph(ctx, '(2)', INSTANDHALTUNG_TEXTE.schoenheitsreparaturen.mieter_flexibel)
    addParagraph(ctx, INSTANDHALTUNG_TEXTE.schoenheitsreparaturen.mieter_bei_auszug, 8)
  } else {
    addNumberedParagraph(ctx, '(2)', INSTANDHALTUNG_TEXTE.schoenheitsreparaturen.vermieter)
  }

  // Kleinreparaturen
  if (data.kleinreparaturen?.enabled) {
    addNumberedParagraph(ctx, '(3)', fillTemplate(INSTANDHALTUNG_TEXTE.kleinreparaturen.wirksam, {
      einzelbetrag: formatCurrency(data.kleinreparaturen.einzelbetrag || 100),
      jahresbetrag: formatCurrency(data.kleinreparaturen.jahresbetrag || 300)
    }))
  }

  addNumberedParagraph(ctx, data.kleinreparaturen?.enabled ? '(4)' : '(3)', INSTANDHALTUNG_TEXTE.maengelanzeige)

  addSeparator(ctx)

  // =============================================
  // § 8 BETRETEN DER WOHNUNG
  // =============================================
  addSubtitle(ctx, '§ 8 Betreten der Wohnung')

  addParagraph(ctx, BETRETUNGSRECHT_TEXTE.standard)
  addParagraph(ctx, BETRETUNGSRECHT_TEXTE.kein_generalzutritt)

  addSeparator(ctx)

  // =============================================
  // § 9 HAFTUNG UND VERSICHERUNG
  // =============================================
  addSubtitle(ctx, '§ 9 Haftung und Versicherung')

  addNumberedParagraph(ctx, '(1)', HAFTUNG_TEXTE.mieter)
  addNumberedParagraph(ctx, '(2)', HAFTUNG_TEXTE.versicherung_empfehlung)
  addNumberedParagraph(ctx, '(3)', HAFTUNG_TEXTE.wohngebaeudeversicherung)
  addNumberedParagraph(ctx, '(4)', HAFTUNG_TEXTE.haftungsbeschraenkung)

  addSeparator(ctx)

  // =============================================
  // § 10 RÜCKGABE DER MIETSACHE
  // =============================================
  addSubtitle(ctx, '§ 10 Rückgabe der Mietsache')

  addNumberedParagraph(ctx, '(1)', RUECKGABE_TEXTE.standard)
  addNumberedParagraph(ctx, '(2)', RUECKGABE_TEXTE.protokoll)
  addNumberedParagraph(ctx, '(3)', RUECKGABE_TEXTE.einbauten)
  addNumberedParagraph(ctx, '(4)', RUECKGABE_TEXTE.vorzeitige_rueckgabe)

  addSeparator(ctx)

  // =============================================
  // § 11 HAUSORDNUNG
  // =============================================
  addSubtitle(ctx, '§ 11 Hausordnung')

  addNumberedParagraph(ctx, '(1)', HAUSORDNUNG_TEXTE.bestandteil)
  addNumberedParagraph(ctx, '(2)', HAUSORDNUNG_TEXTE.aenderungen)
  addParagraph(ctx, HAUSORDNUNG_TEXTE.ruhezeiten, 8)

  addSeparator(ctx)

  // =============================================
  // § 12 SONDERVEREINBARUNGEN
  // =============================================
  addSubtitle(ctx, '§ 12 Sondervereinbarungen')

  if (data.sonstigeVereinbarungen) {
    addParagraph(ctx, data.sonstigeVereinbarungen)
  } else {
    addParagraph(ctx, 'Keine weiteren Vereinbarungen.')
  }

  addSeparator(ctx)

  // =============================================
  // § 13 SCHLUSSBESTIMMUNGEN
  // =============================================
  addSubtitle(ctx, '§ 13 Schlussbestimmungen')

  addNumberedParagraph(ctx, '(1)', SCHLUSS_TEXTE.schriftform)
  addNumberedParagraph(ctx, '(2)', SCHLUSS_TEXTE.salvatorische_klausel)
  addNumberedParagraph(ctx, '(3)', SCHLUSS_TEXTE.mehrfertigung)

  addNumberedParagraph(ctx, '(4)', SCHLUSS_TEXTE.anlagen)

  ctx.y += 3
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  addParagraph(ctx, SCHLUSS_TEXTE.belehrung)

  // === UNTERSCHRIFTEN-SEITE ===
  doc.addPage()
  ctx.y = PDF_CONFIG.margin

  addSubtitle(ctx, 'Unterschriften')
  ctx.y += 5

  // Hinweis
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  addParagraph(ctx, 'Mit ihrer Unterschrift bestätigen die Vertragsparteien, dass sie den Mietvertrag vollständig gelesen haben, mit dem Inhalt einverstanden sind und jeweils eine Ausfertigung erhalten haben.')
  ctx.y += 10

  // Ort, Datum
  const signatureDate = data.unterschriftVermieter?.signedAt
    ? formatDate(data.unterschriftVermieter.signedAt)
    : formatDate(new Date())
  const signatureLocation = data.unterschriftVermieter?.signedLocation || '_______________'

  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  addParagraph(ctx, `${signatureLocation}, den ${signatureDate}`)
  ctx.y += 15

  // Vermieter Unterschrift
  addSignatureLine(
    ctx,
    'Vermieter',
    formatPerson(data.vermieter),
    data.unterschriftVermieter?.imageData
  )

  ctx.y += 20

  // Mieter Unterschriften
  data.mieter.forEach((mieter, index) => {
    addSignatureLine(
      ctx,
      data.mieter.length > 1 ? `Mieter ${index + 1}` : 'Mieter',
      formatPerson(mieter),
      data.unterschriftMieter?.[index]?.imageData
    )
    ctx.y += 15
  })

  // === FUSSZEILEN ===
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fontSize.tiny)
    doc.setTextColor(PDF_CONFIG.colors.gray)

    // Seitenzahl
    doc.text(
      `Seite ${i} von ${totalPages}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 8,
      { align: 'center' }
    )

    // Fußzeile
    doc.text(
      `Wohnraummietvertrag | ${formatAddress(data.objektAdresse)} | Erstellt: ${formatDate(new Date())}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 5,
      { align: 'center' }
    )
  }

  // PDF speichern
  const mieterNamen = data.mieter.map(m => m.nachname).join('_')
  const filename = `Mietvertrag_${data.objektAdresse.strasse?.replace(/\s/g, '_') || 'Wohnung'}_${mieterNamen}_${formatDate(new Date()).replace(/\./g, '-')}.pdf`
  doc.save(filename)
}
