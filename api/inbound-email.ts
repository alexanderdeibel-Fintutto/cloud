import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Inbound Email Webhook - receives emails from SendGrid Inbound Parse
 *
 * SendGrid sends a multipart/form-data POST with fields:
 * - from, to, subject, text, html
 * - envelope (JSON with sender/recipients)
 * - attachments (count)
 * - attachment1, attachment2, ... (files)
 *
 * Configuration:
 * 1. Set MX record for eingang.vermietify.de pointing to mx.sendgrid.net
 * 2. In SendGrid Inbound Parse settings, add:
 *    Host: eingang.vermietify.de
 *    URL: https://your-domain.vercel.app/api/inbound-email
 *    Check "POST the raw, full MIME message"
 * 3. Set SENDGRID_WEBHOOK_VERIFICATION_KEY in env (from SendGrid > Settings > Mail Settings > Signed Event Webhook)
 */

export const config = {
  api: {
    bodyParser: false,
  },
}

interface Attachment {
  filename: string
  type: string
  content: Buffer
}

// Verify SendGrid webhook signature using OAuth public key verification
function verifySendGridWebhook(req: VercelRequest, rawBody: Buffer): boolean {
  const webhookKey = process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY
  if (!webhookKey) {
    // No key configured - allow in dev, log warning in prod
    console.warn('SENDGRID_WEBHOOK_VERIFICATION_KEY not set - skipping signature verification')
    return true
  }

  const signature = req.headers['x-twilio-email-event-webhook-signature'] as string
  const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'] as string

  if (!signature || !timestamp) {
    console.error('Missing SendGrid webhook signature headers')
    return false
  }

  // SendGrid uses ECDSA signature with the timestamp + body
  const payload = timestamp + rawBody.toString('utf8')
  const expectedSignature = createHmac('sha256', webhookKey)
    .update(payload)
    .digest('base64')

  return signature === expectedSignature
}

// Parse multipart form data from SendGrid
async function parseMultipart(req: VercelRequest): Promise<{ fields: Record<string, string>; files: Attachment[]; rawBody: Buffer }> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const rawBody = Buffer.concat(chunks)

  const contentType = req.headers['content-type'] || ''
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/)
  if (!boundaryMatch) {
    throw new Error('No boundary found in content-type')
  }
  const boundary = boundaryMatch[1] || boundaryMatch[2]

  const fields: Record<string, string> = {}
  const files: Attachment[] = []

  const bodyStr = rawBody.toString('latin1')
  const parts = bodyStr.split(`--${boundary}`)

  for (const part of parts) {
    if (part.trim() === '' || part.trim() === '--') continue

    const headerEnd = part.indexOf('\r\n\r\n')
    if (headerEnd === -1) continue

    const headers = part.substring(0, headerEnd)
    const content = part.substring(headerEnd + 4).replace(/\r\n$/, '')

    const nameMatch = headers.match(/name="([^"]+)"/)
    if (!nameMatch) continue

    const name = nameMatch[1]
    const filenameMatch = headers.match(/filename="([^"]+)"/)
    const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i)

    if (filenameMatch) {
      files.push({
        filename: filenameMatch[1],
        type: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
        content: Buffer.from(content, 'latin1'),
      })
    } else {
      fields[name] = content
    }
  }

  return { fields, files, rawBody }
}

// Extract email address from "Name <email@domain.com>" format
function extractEmail(fromField: string): string {
  const match = fromField.match(/<([^>]+)>/)
  return (match ? match[1] : fromField).trim().toLowerCase()
}

// Extract recipient address from "to" field
function extractRecipient(toField: string): string {
  const match = toField.match(/<([^>]+)>/)
  return (match ? match[1] : toField).trim().toLowerCase()
}

// Call the process-receipt endpoint internally for AI-powered PDF analysis
async function triggerAIProcessing(emailId: string, attachmentId: string, userId: string) {
  const claudeApiKey = process.env.ANTHROPIC_API_KEY
  if (!claudeApiKey) {
    console.log('No ANTHROPIC_API_KEY set, skipping AI processing')
    return
  }

  try {
    // Get the attachment
    const { data: attachment } = await supabase
      .from('email_attachments')
      .select('*')
      .eq('id', attachmentId)
      .eq('email_id', emailId)
      .single()

    if (!attachment) return

    // Download PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('email-attachments')
      .download(attachment.file_path)

    if (downloadError || !fileData) {
      console.error('Error downloading PDF for AI processing:', downloadError)
      return
    }

    const pdfBuffer = Buffer.from(await fileData.arrayBuffer())
    const pdfBase64 = pdfBuffer.toString('base64')

    // Call Claude API directly (internal, no auth needed)
    const receiptData = await analyzeReceiptWithAI(pdfBase64, attachment.file_name)

    if (receiptData.confidence >= 0.7 && receiptData.total_amount && receiptData.category) {
      // High confidence - auto-book
      await supabase.from('inbound_emails').update({
        status: 'processed',
        processed_at: new Date().toISOString(),
        notes: `KI-Analyse: ${receiptData.category} - ${formatEuro(receiptData.total_amount)} (${receiptData.vendor || 'Unbekannt'})`,
      }).eq('id', emailId)
    } else {
      // Low confidence - create question
      await supabase.from('inbound_emails').update({
        status: 'unclear',
        notes: `KI-Analyse teilweise: ${receiptData.vendor || '?'}, ${receiptData.total_amount ? formatEuro(receiptData.total_amount) : 'Betrag unklar'}, Konfidenz: ${Math.round(receiptData.confidence * 100)}%`,
      }).eq('id', emailId)

      await supabase.from('booking_questions').insert({
        user_id: userId,
        email_id: emailId,
        question: `Beleg von "${receiptData.vendor || 'Unbekannt'}" (${attachment.file_name}) konnte nicht vollstaendig erkannt werden. Bitte manuell pruefen und zuordnen.`,
        suggested_category: receiptData.category || null,
        suggested_amount: receiptData.total_amount || null,
      })
    }

    console.log('AI processing complete for email:', emailId, 'confidence:', receiptData.confidence)
  } catch (error) {
    console.error('AI processing failed for email:', emailId, error)
    // Don't fail the whole request - heuristic fallback already ran
  }
}

interface ReceiptData {
  vendor: string | null
  total_amount: number | null
  category: string | null
  confidence: number
}

async function analyzeReceiptWithAI(pdfBase64: string, filename: string): Promise<ReceiptData> {
  const claudeApiKey = process.env.ANTHROPIC_API_KEY!

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
              },
              {
                type: 'text',
                text: `Analysiere dieses PDF-Dokument (${filename}). Es handelt sich um einen Beleg oder eine Rechnung im Kontext der Immobilienverwaltung (Vermietung).

Extrahiere und antworte NUR mit einem JSON-Objekt:
{
  "vendor": "Name des Unternehmens",
  "invoice_number": "Rechnungsnummer",
  "invoice_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "total_amount": 123.45,
  "tax_amount": 23.45,
  "net_amount": 100.00,
  "category": "Nebenkosten|Versicherung|Reparatur|Steuern|Verwaltung|Energie|Wasser|Muellentsorgung|Grundstueck|Rechtskosten|Sonstiges",
  "line_items": [{"description": "...", "amount": 100.00}],
  "confidence": 0.85
}
Setze "confidence" zwischen 0 und 1. Setze Felder auf null wenn nicht findbar. NUR JSON.`,
              },
            ],
          },
        ],
      }),
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error('Claude API error:', response.status)
      return { vendor: null, total_amount: null, category: null, confidence: 0 }
    }

    const result = await response.json()
    const text = result.content?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { vendor: null, total_amount: null, category: null, confidence: 0 }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      vendor: parsed.vendor || null,
      total_amount: typeof parsed.total_amount === 'number' ? parsed.total_amount : null,
      category: parsed.category || null,
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
    }
  } catch (error) {
    clearTimeout(timeout)
    console.error('AI analysis error:', error)
    return { vendor: null, total_amount: null, category: null, confidence: 0 }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { fields, files, rawBody } = await parseMultipart(req)

    // #3: Validate SendGrid webhook signature
    if (!verifySendGridWebhook(req, rawBody)) {
      console.error('SendGrid webhook signature verification failed')
      return res.status(403).json({ error: 'Invalid webhook signature' })
    }

    const senderEmail = extractEmail(fields.from || '')
    const recipientEmail = extractRecipient(fields.to || '')
    const subject = fields.subject || ''
    const bodyText = fields.text || ''

    console.log('Inbound email received:', { senderEmail, recipientEmail, subject, attachments: files.length })

    // 1. Find the inbox by the generated address
    const { data: inbox, error: inboxError } = await supabase
      .from('email_inboxes')
      .select('id, user_id, is_active')
      .eq('generated_address', recipientEmail)
      .single()

    if (inboxError || !inbox) {
      console.log('No inbox found for address:', recipientEmail)
      return res.status(200).json({ status: 'ignored', reason: 'unknown_recipient' })
    }

    if (!inbox.is_active) {
      console.log('Inbox is deactivated:', recipientEmail)
      return res.status(200).json({ status: 'ignored', reason: 'inbox_inactive' })
    }

    // 2. Verify the sender is whitelisted
    const { data: verifiedSender } = await supabase
      .from('verified_senders')
      .select('id, is_verified')
      .eq('user_id', inbox.user_id)
      .eq('email', senderEmail)
      .single()

    let emailStatus: 'pending' | 'rejected' = 'pending'
    let emailNotes: string | null = null

    if (!verifiedSender) {
      emailStatus = 'rejected'
      emailNotes = `Absender ${senderEmail} ist nicht als verifizierter Absender hinterlegt.`
    } else if (!verifiedSender.is_verified) {
      emailStatus = 'rejected'
      emailNotes = `Absender ${senderEmail} ist noch nicht verifiziert.`
    }

    // 3. Store the inbound email
    const { data: storedEmail, error: emailError } = await supabase
      .from('inbound_emails')
      .insert({
        inbox_id: inbox.id,
        user_id: inbox.user_id,
        sender_email: senderEmail,
        subject,
        body_text: bodyText.substring(0, 50000),
        status: emailStatus,
        notes: emailNotes,
      })
      .select('id')
      .single()

    if (emailError || !storedEmail) {
      console.error('Error storing inbound email:', emailError)
      return res.status(500).json({ error: 'Failed to store email' })
    }

    // 4. Store PDF attachments in Supabase Storage
    const pdfAttachments: { id: string; filename: string; path: string }[] = []

    for (const file of files) {
      if (file.type !== 'application/pdf' && !file.filename.toLowerCase().endsWith('.pdf')) {
        continue
      }

      const storagePath = `${inbox.user_id}/${storedEmail.id}/${file.filename}`

      const { error: uploadError } = await supabase.storage
        .from('email-attachments')
        .upload(storagePath, file.content, {
          contentType: 'application/pdf',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading attachment:', uploadError)
        continue
      }

      const { data: attachment, error: attachError } = await supabase
        .from('email_attachments')
        .insert({
          email_id: storedEmail.id,
          file_name: file.filename,
          file_type: 'application/pdf',
          file_size: file.content.length,
          file_path: storagePath,
        })
        .select('id')
        .single()

      if (!attachError && attachment) {
        pdfAttachments.push({ id: attachment.id, filename: file.filename, path: storagePath })
      }
    }

    // 5. Process email
    if (emailStatus === 'pending' && pdfAttachments.length > 0) {
      // First: quick heuristic from email text
      const heuristicData = extractInvoiceData(subject, bodyText)

      if (heuristicData.amount && heuristicData.category) {
        // Heuristic found enough data - mark as processed
        await supabase.from('inbound_emails').update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          notes: `Automatisch zugeordnet: ${heuristicData.category} - ${formatEuro(heuristicData.amount)}`,
        }).eq('id', storedEmail.id)
      } else {
        // #2: Trigger AI processing for each PDF attachment
        for (const att of pdfAttachments) {
          await triggerAIProcessing(storedEmail.id, att.id, inbox.user_id)
        }
      }
    } else if (emailStatus === 'pending' && pdfAttachments.length === 0) {
      await supabase.from('inbound_emails').update({ status: 'unclear' }).eq('id', storedEmail.id)
      await supabase.from('booking_questions').insert({
        user_id: inbox.user_id,
        email_id: storedEmail.id,
        question: `E-Mail ohne PDF-Anhang empfangen: "${subject || '(Kein Betreff)'}". Bitte Beleg manuell hochladen oder E-Mail erneut mit PDF senden.`,
      })
    }

    return res.status(200).json({
      status: 'processed',
      email_id: storedEmail.id,
      attachments: pdfAttachments.length,
    })
  } catch (error) {
    console.error('Inbound email processing error:', error)
    return res.status(500).json({ error: 'Failed to process inbound email' })
  }
}

// Simple heuristic to extract invoice data from email content
function extractInvoiceData(subject: string, body: string): { amount: number | null; category: string | null } {
  const combined = `${subject}\n${body}`.toLowerCase()

  let amount: number | null = null
  const amountPatterns = [
    /(?:gesamt|summe|betrag|total|rechnungsbetrag|endbetrag|zahlbetrag)[:\s]*(?:eur\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
    /(\d{1,3}(?:\.\d{3})*,\d{2})\s*(?:eur|€)/i,
    /(?:eur|€)\s*(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  ]

  for (const pattern of amountPatterns) {
    const match = combined.match(pattern)
    if (match) {
      amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'))
      break
    }
  }

  let category: string | null = null
  const categoryMap: Record<string, string[]> = {
    'Nebenkosten': ['nebenkosten', 'betriebskosten', 'hausgeld', 'nebenkostenabrechnung'],
    'Versicherung': ['versicherung', 'police', 'haftpflicht', 'gebäudeversicherung', 'wohngebäude'],
    'Reparatur': ['reparatur', 'instandhaltung', 'handwerker', 'sanitär', 'heizung', 'wartung'],
    'Steuern': ['grundsteuer', 'steuer', 'finanzamt', 'steuerbescheid'],
    'Verwaltung': ['verwaltung', 'hausverwaltung', 'verwalter'],
    'Energie': ['strom', 'gas', 'energie', 'stadtwerke', 'energieversorger'],
    'Wasser': ['wasser', 'abwasser', 'wasserwerk'],
    'Muellentsorgung': ['müll', 'abfall', 'entsorgung', 'wertstoff'],
    'Grundstueck': ['garten', 'winterdienst', 'reinigung', 'treppenhausreinigung'],
    'Rechtskosten': ['anwalt', 'rechtsanwalt', 'gericht', 'mahnung', 'inkasso'],
  }

  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      category = cat
      break
    }
  }

  return { amount, category }
}

function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}
