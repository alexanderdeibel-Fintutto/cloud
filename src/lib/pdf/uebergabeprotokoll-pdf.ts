import { jsPDF } from 'jspdf'

import { format } from 'date-fns'

import {
  UebergabeprotokollData,
  ZUSTAND_LABELS,
} from '@/types/uebergabeprotokoll'

// PDF-Konfiguration
const PDF_CONFIG = {
  margin: 15,
  lineHeight: 5,
  fontSize: {
    title: 14,
    subtitle: 11,
    heading: 10,
    normal: 9,
    small: 8,
    tiny: 7,
  },
  colors: {
    primary: '#1e40af',
    black: '#000000',
    gray: '#6b7280',
    lightGray: '#e5e7eb',
    green: '#16a34a',
    yellow: '#ca8a04',
    red: '#dc2626',
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
    addHeader(ctx)
  }
}

function addHeader(ctx: PDFContext): void {
  // Leichte Header-Linie auf Folgeseiten
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y)
  ctx.y += 5
}

function addTitle(ctx: PDFContext, text: string): void {
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.title)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.primary)
  ctx.doc.text(text, ctx.pageWidth / 2, ctx.y, { align: 'center' })
  ctx.y += 7
}

function addSubtitle(ctx: PDFContext, text: string): void {
  checkPageBreak(ctx, 12)
  ctx.y += 4
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.subtitle)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(text, ctx.margin, ctx.y)
  ctx.y += 6
}

function addText(ctx: PDFContext, text: string, options: {
  fontSize?: number
  bold?: boolean
  indent?: number
  color?: string
} = {}): void {
  const {
    fontSize = PDF_CONFIG.fontSize.normal,
    bold = false,
    indent = 0,
    color = PDF_CONFIG.colors.black
  } = options

  ctx.doc.setFontSize(fontSize)
  ctx.doc.setFont('helvetica', bold ? 'bold' : 'normal')
  ctx.doc.setTextColor(color)

  const maxWidth = ctx.contentWidth - indent
  const lines = ctx.doc.splitTextToSize(text, maxWidth)

  for (const line of lines) {
    checkPageBreak(ctx, PDF_CONFIG.lineHeight)
    ctx.doc.text(line, ctx.margin + indent, ctx.y)
    ctx.y += PDF_CONFIG.lineHeight
  }
}

function addLabelValue(ctx: PDFContext, label: string, value: string, labelWidth: number = 50): void {
  checkPageBreak(ctx, PDF_CONFIG.lineHeight)
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(label + ':', ctx.margin, ctx.y)

  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(value || '—', ctx.margin + labelWidth, ctx.y)
  ctx.y += PDF_CONFIG.lineHeight
}

function addTableRow(ctx: PDFContext, cells: string[], widths: number[], isHeader: boolean = false): void {
  checkPageBreak(ctx, PDF_CONFIG.lineHeight + 4)

  const rowHeight = 7
  let x = ctx.margin

  // Hintergrund für Header
  if (isHeader) {
    ctx.doc.setFillColor('#f1f5f9')
    ctx.doc.rect(ctx.margin, ctx.y - 4, ctx.contentWidth, rowHeight, 'F')
  }

  ctx.doc.setFontSize(PDF_CONFIG.fontSize.small)
  ctx.doc.setFont('helvetica', isHeader ? 'bold' : 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)

  cells.forEach((cell, i) => {
    const cellWidth = widths[i] || 30
    const truncatedText = ctx.doc.splitTextToSize(cell, cellWidth - 2)[0] || ''
    ctx.doc.text(truncatedText, x + 2, ctx.y)
    x += cellWidth
  })

  // Trennlinie
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin, ctx.y + 2, ctx.pageWidth - ctx.margin, ctx.y + 2)

  ctx.y += rowHeight
}

function addSeparator(ctx: PDFContext): void {
  ctx.y += 2
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y)
  ctx.y += 4
}

function addSignatureLine(ctx: PDFContext, label: string, name: string, imageData?: string | null, x?: number): void {
  const startX = x || ctx.margin
  const signWidth = 55
  const lineY = ctx.y + 18

  // Unterschriftsbild wenn vorhanden
  if (imageData) {
    try {
      ctx.doc.addImage(imageData, 'PNG', startX, ctx.y, signWidth, 15)
    } catch (e) {
      // Fallback
    }
  }

  // Unterschriftslinie
  ctx.doc.setDrawColor(PDF_CONFIG.colors.black)
  ctx.doc.line(startX, lineY, startX + signWidth, lineY)

  // Label
  ctx.doc.setFontSize(PDF_CONFIG.fontSize.tiny)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text(label, startX, lineY + 4)

  // Name
  ctx.doc.setTextColor(PDF_CONFIG.colors.black)
  ctx.doc.text(name, startX, lineY + 8)
}

// Adresse formatieren
function formatAddress(address: { strasse: string; hausnummer: string; plz: string; ort: string }): string {
  return `${address.strasse} ${address.hausnummer}, ${address.plz} ${address.ort}`
}

// Person formatieren
function formatPerson(person: { vorname: string; nachname: string; titel?: string }): string {
  return [person.titel, person.vorname, person.nachname].filter(Boolean).join(' ')
}

// Hauptfunktion: PDF generieren
export async function generateUebergabeprotokollPDF(data: UebergabeprotokollData): Promise<void> {
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

  const istEinzug = data.protokollart === 'einzug'

  // === TITEL ===
  ctx.y = 20
  addTitle(ctx, istEinzug ? 'EINZUGSPROTOKOLL' : 'AUSZUGSPROTOKOLL')

  ctx.doc.setFontSize(PDF_CONFIG.fontSize.normal)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(PDF_CONFIG.colors.gray)
  ctx.doc.text('Wohnungsübergabeprotokoll gemäß § 546 BGB', ctx.pageWidth / 2, ctx.y, { align: 'center' })
  ctx.y += 10

  // === GRUNDDATEN-BOX ===
  ctx.doc.setDrawColor(PDF_CONFIG.colors.lightGray)
  ctx.doc.setFillColor('#f8fafc')
  ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 28, 2, 2, 'FD')
  ctx.y += 5

  // Links: Objekt
  addLabelValue(ctx, 'Mietobjekt', formatAddress(data.objektAdresse))
  addLabelValue(ctx, 'Wohnfläche', data.wohnflaeche ? `ca. ${data.wohnflaeche} m²` : '—')
  addLabelValue(ctx, 'Übergabedatum', `${data.uebergabedatum} um ${data.uebergabeuhrzeit} Uhr`)

  ctx.y += 8

  // === BETEILIGTE ===
  addSubtitle(ctx, '1. Beteiligte Parteien')

  // Vermieter
  addText(ctx, 'Vermieter:', { bold: true })
  addText(ctx, formatPerson(data.vermieter), { indent: 5 })
  ctx.y += 2

  // Mieter
  const mieter = istEinzug ? data.mieterNeu : data.mieterAlt
  if (mieter) {
    addText(ctx, istEinzug ? 'Neuer Mieter:' : 'Bisheriger Mieter:', { bold: true })
    addText(ctx, formatPerson(mieter), { indent: 5 })
  }

  // Zeuge
  if (data.zeuge && data.zeuge.nachname) {
    ctx.y += 2
    addText(ctx, 'Zeuge:', { bold: true })
    addText(ctx, formatPerson(data.zeuge), { indent: 5 })
  }

  addSeparator(ctx)

  // === ZÄHLERSTÄNDE ===
  addSubtitle(ctx, '2. Zählerstände')

  const zaehlerWidths = [35, 45, 35, 30, 35]
  addTableRow(ctx, ['Zählerart', 'Zählernummer', 'Stand', 'Einheit', 'Ablesedatum'], zaehlerWidths, true)

  data.zaehlerstaende.forEach(zaehler => {
    if (zaehler.zaehlernummer || zaehler.stand) {
      const artLabels: Record<string, string> = {
        strom: 'Strom',
        gas: 'Gas',
        wasser: 'Wasser (kalt)',
        warmwasser: 'Warmwasser',
        heizung: 'Heizung'
      }
      addTableRow(ctx, [
        artLabels[zaehler.zaehlerart] || zaehler.zaehlerart,
        zaehler.zaehlernummer || '—',
        zaehler.stand?.toString() || '—',
        zaehler.einheit || '',
        zaehler.ablesedatum || '—'
      ], zaehlerWidths)
    }
  })

  ctx.y += 3
  addText(ctx, 'Die Zählerstände wurden gemeinsam abgelesen und werden von beiden Parteien anerkannt.', {
    fontSize: PDF_CONFIG.fontSize.small,
    color: PDF_CONFIG.colors.gray
  })

  addSeparator(ctx)

  // === SCHLÜSSELÜBERGABE ===
  addSubtitle(ctx, '3. Schlüsselübergabe')

  const schluesselWidths = [60, 40, 40, 40]
  addTableRow(ctx, ['Schlüsselart', 'Vorhanden', 'Übergeben', 'Bemerkung'], schluesselWidths, true)

  data.schluessel.forEach(schluessel => {
    if (schluessel.art) {
      addTableRow(ctx, [
        schluessel.art,
        schluessel.anzahlVorhanden.toString(),
        schluessel.anzahlUebergeben.toString(),
        schluessel.bemerkung || '—'
      ], schluesselWidths)
    }
  })

  // Summe
  const schluesselGesamt = data.schluessel.reduce((sum, s) => sum + s.anzahlUebergeben, 0)
  ctx.y += 2
  addText(ctx, `Insgesamt wurden ${schluesselGesamt} Schlüssel übergeben.`, { bold: true })

  addSeparator(ctx)

  // === ZUSTANDSERFASSUNG ===
  addSubtitle(ctx, '4. Zustandserfassung der Räume')

  data.raeume.forEach(raum => {
    checkPageBreak(ctx, 45)

    // Raumname als Überschrift
    ctx.doc.setFillColor('#f1f5f9')
    ctx.doc.roundedRect(ctx.margin, ctx.y - 2, ctx.contentWidth, 8, 1, 1, 'F')
    addText(ctx, raum.raumname, { bold: true, fontSize: PDF_CONFIG.fontSize.heading })
    ctx.y += 2

    // Zustandstabelle für den Raum
    const zustandWidths = [40, 35, 105]
    const zustandItems = [
      { element: 'Wände', zustand: raum.waende, bemerkung: raum.waendeBemerkung },
      { element: 'Decke', zustand: raum.decke, bemerkung: raum.deckeBemerkung },
      { element: 'Boden', zustand: raum.boden, bemerkung: raum.bodenBemerkung },
      { element: 'Fenster', zustand: raum.fenster, bemerkung: raum.fensterBemerkung },
      { element: 'Türen', zustand: raum.tueren, bemerkung: raum.tuerenBemerkung },
      { element: 'Heizkörper', zustand: raum.heizkoerper, bemerkung: raum.heizkoerperBemerkung },
      { element: 'Steckdosen', zustand: raum.steckdosen, bemerkung: raum.steckdosenBemerkung },
      { element: 'Beleuchtung', zustand: raum.beleuchtung, bemerkung: raum.beleuchtungBemerkung },
    ]

    zustandItems.forEach(item => {
      if (item.zustand !== 'nicht_vorhanden') {
        addTableRow(ctx, [
          item.element,
          ZUSTAND_LABELS[item.zustand] || item.zustand,
          item.bemerkung || '—'
        ], zustandWidths)
      }
    })

    // Sonstige Mängel
    if (raum.sonstigesMaengel) {
      ctx.y += 2
      addText(ctx, `Sonstige Mängel: ${raum.sonstigesMaengel}`, {
        fontSize: PDF_CONFIG.fontSize.small,
        color: PDF_CONFIG.colors.red
      })
    }

    ctx.y += 4
  })

  addSeparator(ctx)

  // === ALLGEMEINER ZUSTAND ===
  addSubtitle(ctx, '5. Allgemeiner Zustand')

  const zustandLabels: Record<string, string> = {
    sehr_gut: 'Sehr gut',
    gut: 'Gut',
    normal: 'Normal / altersgemäße Gebrauchsspuren',
    maengel: 'Mängel vorhanden'
  }
  addLabelValue(ctx, 'Allgemeiner Zustand', zustandLabels[data.allgemeinerZustand] || data.allgemeinerZustand, 55)

  const reinigungsLabels: Record<string, string> = {
    gereinigt: 'Vollständig gereinigt',
    besenrein: 'Besenrein',
    nicht_gereinigt: 'Nicht gereinigt'
  }
  addLabelValue(ctx, 'Reinigungszustand', reinigungsLabels[data.reinigungszustand] || data.reinigungszustand, 55)

  addSeparator(ctx)

  // === VEREINBARUNGEN ===
  if (data.maengelbeseitigung || data.vereinbarungen || data.kostenuebernahme) {
    addSubtitle(ctx, '6. Vereinbarungen und Feststellungen')

    if (data.maengelbeseitigung) {
      addText(ctx, 'Mängelbeseitigung:', { bold: true })
      addText(ctx, data.maengelbeseitigung, { indent: 5 })
      ctx.y += 2
    }

    if (data.vereinbarungen) {
      addText(ctx, 'Sonstige Vereinbarungen:', { bold: true })
      addText(ctx, data.vereinbarungen, { indent: 5 })
      ctx.y += 2
    }

    if (data.kostenuebernahme) {
      addText(ctx, 'Kostenübernahme:', { bold: true })
      addText(ctx, data.kostenuebernahme, { indent: 5 })
    }

    addSeparator(ctx)
  }

  // === RECHTLICHE HINWEISE ===
  checkPageBreak(ctx, 25)
  ctx.doc.setFillColor('#fef3c7')
  ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 20, 2, 2, 'F')
  ctx.y += 4

  addText(ctx, 'Rechtlicher Hinweis:', { bold: true, fontSize: PDF_CONFIG.fontSize.small })
  addText(ctx, 'Dieses Protokoll dokumentiert den Zustand der Wohnung zum Zeitpunkt der Übergabe. ' +
    'Es dient als Nachweis für beide Parteien und sollte sorgfältig aufbewahrt werden. ' +
    'Mängel, die im Protokoll nicht aufgeführt sind, gelten als nicht vorhanden (§ 546 BGB).',
    { fontSize: PDF_CONFIG.fontSize.tiny, color: PDF_CONFIG.colors.gray })

  ctx.y += 6

  // === UNTERSCHRIFTEN ===
  checkPageBreak(ctx, 50)
  addSubtitle(ctx, 'Unterschriften')

  ctx.y += 3
  addText(ctx, 'Mit ihrer Unterschrift bestätigen die Parteien die Richtigkeit und Vollständigkeit dieses Protokolls.', {
    fontSize: PDF_CONFIG.fontSize.small,
    color: PDF_CONFIG.colors.gray
  })
  ctx.y += 8

  // Ort und Datum
  const ort = data.objektAdresse.ort || '_______________'
  const datum = data.uebergabedatum || format(new Date(), 'dd.MM.yyyy')
  addText(ctx, `${ort}, den ${datum}`)
  ctx.y += 10

  // Zwei Unterschriften nebeneinander
  const signatureStartY = ctx.y

  // Vermieter (links)
  addSignatureLine(
    ctx,
    'Vermieter',
    formatPerson(data.vermieter),
    data.unterschriftVermieter?.imageData,
    ctx.margin
  )

  // Mieter (rechts)
  ctx.y = signatureStartY
  const mieterPerson = istEinzug ? data.mieterNeu : data.mieterAlt
  if (mieterPerson) {
    addSignatureLine(
      ctx,
      istEinzug ? 'Neuer Mieter' : 'Bisheriger Mieter',
      formatPerson(mieterPerson),
      istEinzug ? data.unterschriftMieterNeu?.imageData : data.unterschriftMieterAlt?.imageData,
      ctx.margin + 95
    )
  }

  ctx.y += 30

  // Zeuge falls vorhanden
  if (data.zeuge && data.zeuge.nachname && data.unterschriftZeuge) {
    addSignatureLine(
      ctx,
      'Zeuge',
      formatPerson(data.zeuge),
      data.unterschriftZeuge?.imageData,
      ctx.margin
    )
  }

  // === FUSSZEILE ===
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fontSize.tiny)
    doc.setTextColor(PDF_CONFIG.colors.gray)

    doc.text(
      `Seite ${i} von ${totalPages}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 8,
      { align: 'center' }
    )

    doc.text(
      `${istEinzug ? 'Einzugs' : 'Auszugs'}protokoll | ${formatAddress(data.objektAdresse)} | ${datum}`,
      ctx.pageWidth / 2,
      ctx.pageHeight - 5,
      { align: 'center' }
    )
  }

  // === PDF SPEICHERN ===
  const artText = istEinzug ? 'Einzugsprotokoll' : 'Auszugsprotokoll'
  const filename = `${artText}_${data.objektAdresse.strasse?.replace(/\s/g, '_') || 'Wohnung'}_${data.uebergabedatum?.replace(/-/g, '')}.pdf`
  doc.save(filename)
}
