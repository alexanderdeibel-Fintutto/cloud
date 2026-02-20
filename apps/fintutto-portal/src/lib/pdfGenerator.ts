// PDF Generation Engine for Fintutto Portal
// Uses browser print API for PDF export (no external dependencies)

export interface PdfOptions {
  title: string
  subtitle?: string
  content: PdfSection[]
  footer?: string
  date?: string
}

export interface PdfSection {
  heading?: string
  type: 'text' | 'table' | 'keyvalue' | 'list' | 'divider'
  data: unknown
}

export interface KeyValuePair {
  key: string
  value: string
  highlight?: boolean
}

export interface TableData {
  headers: string[]
  rows: string[][]
}

export function generatePdfHtml(options: PdfOptions): string {
  const date = options.date || new Date().toLocaleDateString('de-DE')

  let html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>${options.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; padding: 40px; font-size: 12px; line-height: 1.6; }
    .header { border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; color: #7c3aed; margin-bottom: 4px; }
    .header .subtitle { color: #666; font-size: 13px; }
    .header .date { color: #999; font-size: 11px; margin-top: 4px; }
    .section { margin-bottom: 20px; }
    .section h2 { font-size: 15px; color: #333; margin-bottom: 10px; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; }
    .kv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .kv-item { display: flex; justify-content: space-between; padding: 6px 10px; background: #f8f8f8; border-radius: 4px; }
    .kv-item .key { color: #666; }
    .kv-item .value { font-weight: 600; }
    .kv-item.highlight { background: #f0e6ff; }
    .kv-item.highlight .value { color: #7c3aed; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e5e5; }
    td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
    tr:hover td { background: #fafafa; }
    .text { margin-bottom: 12px; }
    .list { padding-left: 20px; }
    .list li { margin-bottom: 4px; }
    .divider { border-top: 1px solid #e5e5e5; margin: 16px 0; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; color: #999; font-size: 10px; text-align: center; }
    .logo { font-size: 11px; color: #7c3aed; font-weight: 700; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${options.title}</h1>
    ${options.subtitle ? `<div class="subtitle">${options.subtitle}</div>` : ''}
    <div class="date">Erstellt am ${date}</div>
  </div>`

  for (const section of options.content) {
    html += '<div class="section">'
    if (section.heading) {
      html += `<h2>${section.heading}</h2>`
    }

    switch (section.type) {
      case 'text':
        html += `<div class="text">${section.data as string}</div>`
        break
      case 'keyvalue': {
        const pairs = section.data as KeyValuePair[]
        html += '<div class="kv-grid">'
        for (const pair of pairs) {
          html += `<div class="kv-item ${pair.highlight ? 'highlight' : ''}"><span class="key">${pair.key}</span><span class="value">${pair.value}</span></div>`
        }
        html += '</div>'
        break
      }
      case 'table': {
        const table = section.data as TableData
        html += '<table><thead><tr>'
        for (const h of table.headers) {
          html += `<th>${h}</th>`
        }
        html += '</tr></thead><tbody>'
        for (const row of table.rows) {
          html += '<tr>'
          for (const cell of row) {
            html += `<td>${cell}</td>`
          }
          html += '</tr>'
        }
        html += '</tbody></table>'
        break
      }
      case 'list': {
        const items = section.data as string[]
        html += '<ul class="list">'
        for (const item of items) {
          html += `<li>${item}</li>`
        }
        html += '</ul>'
        break
      }
      case 'divider':
        html += '<div class="divider"></div>'
        break
    }

    html += '</div>'
  }

  html += `
  <div class="footer">
    <span class="logo">Fintutto Portal</span> | ${options.footer || 'Dieses Dokument wurde automatisch erstellt. Keine Rechtsberatung.'} | ${date}
  </div>
  <div class="no-print" style="text-align: center; margin-top: 20px;">
    <button onclick="window.print()" style="padding: 10px 24px; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Als PDF drucken</button>
  </div>
</body>
</html>`

  return html
}

export function openPdfPreview(options: PdfOptions): void {
  const html = generatePdfHtml(options)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    win.onload = () => URL.revokeObjectURL(url)
  }
}

// Convenience: Generate PDF for a Rechner result
export function generateRechnerPdf(
  rechnerName: string,
  inputData: KeyValuePair[],
  resultData: KeyValuePair[],
  hinweise?: string[]
): void {
  const sections: PdfSection[] = [
    { heading: 'Eingaben', type: 'keyvalue', data: inputData },
    { type: 'divider', data: null },
    { heading: 'Ergebnis', type: 'keyvalue', data: resultData },
  ]

  if (hinweise && hinweise.length > 0) {
    sections.push({ type: 'divider', data: null })
    sections.push({ heading: 'Hinweise', type: 'list', data: hinweise })
  }

  openPdfPreview({
    title: rechnerName,
    subtitle: 'Berechnungsergebnis',
    content: sections,
    footer: 'Basierend auf deutschem Mietrecht. Keine Rechtsberatung.',
  })
}

// Convenience: Generate PDF for Betriebskostenabrechnung
export function generateBetriebskostenPdf(
  einheit: string,
  zeitraum: string,
  kostenpositionen: { name: string; betrag: string; schluessel: string }[],
  ergebnis: KeyValuePair[]
): void {
  const tableData: TableData = {
    headers: ['Kostenart', 'Betrag', 'Umlageschlüssel'],
    rows: kostenpositionen.map((k) => [k.name, k.betrag, k.schluessel]),
  }

  openPdfPreview({
    title: 'Betriebskostenabrechnung',
    subtitle: `${einheit} - Zeitraum: ${zeitraum}`,
    content: [
      { heading: 'Kostenpositionen', type: 'table', data: tableData },
      { type: 'divider', data: null },
      { heading: 'Abrechnung', type: 'keyvalue', data: ergebnis },
    ],
    footer: 'Betriebskostenabrechnung gemäß § 556 BGB.',
  })
}
