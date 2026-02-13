import { formatDate } from './utils'

interface EinspruchPdfData {
  absenderName: string
  absenderAdresse: string
  absenderSteuerNr: string
  finanzamt: string
  aktenzeichen: string
  bescheidTitel: string
  bescheidDatum: string
  begruendung: string
  abweichung: number
}

/**
 * Generate a printable Einspruch HTML document and trigger print/save as PDF
 */
export function exportEinspruchAsPdf(data: EinspruchPdfData) {
  const today = formatDate(new Date().toISOString())

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Einspruch - ${data.bescheidTitel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { margin: 2.5cm 2cm; size: A4; }
    body {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 2.5cm 2cm;
    }
    .absender {
      margin-bottom: 1.5cm;
    }
    .empfaenger {
      margin-bottom: 2cm;
    }
    .datum {
      text-align: right;
      margin-bottom: 1cm;
    }
    .betreff {
      font-weight: bold;
      margin-bottom: 0.8cm;
      font-size: 13pt;
    }
    .aktenzeichen {
      margin-bottom: 1cm;
      font-size: 11pt;
      color: #555;
    }
    .body {
      white-space: pre-wrap;
      margin-bottom: 2cm;
    }
    .unterschrift {
      margin-top: 2cm;
    }
    .footer {
      margin-top: 3cm;
      padding-top: 0.5cm;
      border-top: 1px solid #ccc;
      font-size: 9pt;
      color: #888;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #f0f9ff; padding: 12px 20px; margin: -2.5cm -2cm 2cm -2cm; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2869ad;">
    <span style="font-family: sans-serif; font-size: 14px; color: #1a416b; font-weight: 600;">
      Bescheidboxer by Fintutto - Einspruch-Vorschau
    </span>
    <button onclick="window.print()" style="background: #2869ad; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-family: sans-serif;">
      Als PDF speichern / Drucken
    </button>
  </div>

  <div class="absender">
    ${data.absenderName}<br>
    ${data.absenderAdresse.replace(/\n/g, '<br>')}
    ${data.absenderSteuerNr ? `<br>Steuernummer: ${data.absenderSteuerNr}` : ''}
  </div>

  <div class="empfaenger">
    ${data.finanzamt}
  </div>

  <div class="datum">${today}</div>

  <div class="aktenzeichen">
    Aktenzeichen: ${data.aktenzeichen}
  </div>

  <div class="betreff">
    Einspruch gegen ${data.bescheidTitel}
  </div>

  <div class="body">${escapeHtml(data.begruendung)}</div>

  <div class="unterschrift">
    ${data.absenderName || '____________________________'}
  </div>

  <div class="footer">
    Erstellt mit Bescheidboxer by Fintutto | www.fintutto.cloud
  </div>
</body>
</html>`

  // Open in new window for print/save
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
