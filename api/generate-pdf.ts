import type { VercelRequest, VercelResponse } from '@vercel/node'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

interface FormData {
  [key: string]: string | number | boolean | undefined
}

function generateHTMLContent(data: FormData, templateName: string): string {
  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null || value === '') return '-'
    if (typeof value === 'boolean') return value ? 'Ja' : 'Nein'
    return String(value)
  }

  const formatLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, c => c.toUpperCase())
      .trim()
  }

  const fields = Object.entries(data)
    .filter(([key]) => !key.startsWith('_') && key !== 'signature' && key !== 'signedAt')
    .map(([key, value]) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; width: 40%;">${formatLabel(key)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${formatValue(value)}</td>
      </tr>
    `)
    .join('')

  const signatureSection = data.signature ? `
    <div style="margin-top: 40px; border-top: 2px solid #0073e6; padding-top: 20px;">
      <h3 style="color: #374151; margin-bottom: 10px;">Unterschrift</h3>
      <img src="${data.signature}" alt="Unterschrift" style="max-width: 300px; max-height: 100px;" />
      ${data.signedAt ? `<p style="color: #6b7280; font-size: 12px; margin-top: 5px;">Unterzeichnet am: ${new Date(String(data.signedAt)).toLocaleDateString('de-DE')}</p>` : ''}
    </div>
  ` : ''

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #1f2937;
          padding: 40px;
        }
        .header {
          background: linear-gradient(135deg, #0073e6 0%, #0056b3 100%);
          color: white;
          padding: 30px;
          margin: -40px -40px 30px -40px;
          text-align: center;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          background: white;
        }
        .section-title {
          font-size: 18px;
          color: #0073e6;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #0073e6;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #6b7280;
        }
        .footer a {
          color: #0073e6;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Fintutto</h1>
        <p>${templateName}</p>
      </div>

      <div class="content">
        <h2 class="section-title">Dokumentinformationen</h2>
        <table>
          ${fields}
        </table>

        ${signatureSection}
      </div>

      <div class="footer">
        <p>Dieses Dokument wurde mit Fintutto erstellt.</p>
        <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}</p>
        <p style="margin-top: 10px;"><a href="https://fintutto.de">www.fintutto.de</a></p>
      </div>
    </body>
    </html>
  `
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { documentId, versionId, data, templateName } = req.method === 'GET'
      ? req.query
      : req.body

    if (!documentId) {
      return res.status(400).json({ error: 'Missing documentId' })
    }

    // Parse data if it's a string (from query params)
    const formData: FormData = typeof data === 'string' ? JSON.parse(data) : (data || {})
    const docTemplateName = typeof templateName === 'string' ? templateName : 'Rechtsdokument'

    // Generate HTML content
    const htmlContent = generateHTMLContent(formData, docTemplateName)

    // Launch browser
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    })

    await browser.close()

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="fintutto-dokument-${documentId}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length)

    return res.send(pdfBuffer)
  } catch (error) {
    console.error('PDF generation error:', error)
    return res.status(500).json({
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
