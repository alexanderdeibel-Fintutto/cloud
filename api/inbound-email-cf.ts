import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'
import { simpleParser } from 'mailparser'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

/**
 * Inbound Email Webhook - receives raw MIME from Cloudflare Email Worker
 *
 * The Cloudflare Worker sends:
 * { from: string, to: string, raw_mime: string (base64) }
 *
 * This endpoint parses the MIME, extracts attachments, stores in Supabase,
 * and triggers AI processing for PDF invoices.
 */

interface CloudflarePayload {
  from: string
  to: string
  raw_mime: string // base64 encoded raw MIME
}

// Verify HMAC-SHA256 webhook signature
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.VERIFICATION_SECRET
  if (!secret) {
    console.warn('VERIFICATION_SECRET not set - skipping signature check')
    return true
  }

  try {
    const expected = createHmac('sha256', secret).update(payload).digest('base64')
    const sigBuffer = Buffer.from(signature, 'base64')
    const expectedBuffer = Buffer.from(expected, 'base64')

    if (sigBuffer.length !== expectedBuffer.length) return false
    return timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}

function extractEmail(field: string): string {
  const match = field.match(/<([^>]+)>/)
  return (match ? match[1] : field).trim().toLowerCase()
}

function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}

// Heuristic extraction from email text
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
    Nebenkosten: ['nebenkosten', 'betriebskosten', 'hausgeld', 'nebenkostenabrechnung'],
    Versicherung: ['versicherung', 'police', 'haftpflicht', 'gebäudeversicherung'],
    Reparatur: ['reparatur', 'instandhaltung', 'handwerker', 'sanitär', 'wartung'],
    Steuern: ['grundsteuer', 'steuer', 'finanzamt', 'steuerbescheid'],
    Verwaltung: ['verwaltung', 'hausverwaltung', 'verwalter'],
    Energie: ['strom', 'gas', 'energie', 'stadtwerke'],
    Wasser: ['wasser', 'abwasser', 'wasserwerk'],
    Muellentsorgung: ['müll', 'abfall', 'entsorgung', 'wertstoff'],
    Grundstueck: ['garten', 'winterdienst', 'reinigung', 'treppenhausreinigung'],
    Rechtskosten: ['anwalt', 'rechtsanwalt', 'gericht', 'mahnung', 'inkasso'],
  }

  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      category = cat
      break
    }
  }

  return { amount, category }
}

// Call Claude API for PDF analysis
async function analyzeReceiptWithAI(
  pdfBase64: string,
  filename: string
): Promise<{ vendor: string | null; total_amount: number | null; category: string | null; confidence: number }> {
  const claudeApiKey = process.env.ANTHROPIC_API_KEY
  if (!claudeApiKey) return { vendor: null, total_amount: null, category: null, confidence: 0 }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

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
                text: `Analysiere dieses PDF-Dokument (${filename}). Es handelt sich um einen Beleg oder eine Rechnung im Kontext der Immobilienverwaltung.

Extrahiere und antworte NUR mit einem JSON-Objekt:
{
  "vendor": "Name des Unternehmens",
  "invoice_number": "Rechnungsnummer",
  "invoice_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "total_amount": 123.45,
  "tax_amount": 23.45,
  "category": "Nebenkosten|Versicherung|Reparatur|Steuern|Verwaltung|Energie|Wasser|Muellentsorgung|Grundstueck|Rechtskosten|Sonstiges",
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
    if (!response.ok) return { vendor: null, total_amount: null, category: null, confidence: 0 }

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
  } catch {
    clearTimeout(timeout)
    return { vendor: null, total_amount: null, category: null, confidence: 0 }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', endpoint: 'inbound-email-cf' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Read raw body for signature verification
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const signature = req.headers['x-webhook-signature'] as string

    if (!verifySignature(rawBody, signature || '')) {
      console.error('Webhook signature verification failed')
      return res.status(403).json({ error: 'Invalid signature' })
    }

    const payload: CloudflarePayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const senderEmail = extractEmail(payload.from)
    const recipientEmail = extractEmail(payload.to)

    console.log('Cloudflare inbound email:', { senderEmail, recipientEmail })

    // Parse the raw MIME message
    const mimeBuffer = Buffer.from(payload.raw_mime, 'base64')
    const parsed = await simpleParser(mimeBuffer)

    const subject = parsed.subject || ''
    const bodyText = parsed.text || ''

    // Extract attachments from parsed MIME
    const attachments = (parsed.attachments || []).map((att) => ({
      filename: att.filename || 'attachment',
      mimeType: att.contentType || 'application/octet-stream',
      size: att.size,
      content: att.content, // Buffer
    }))

    console.log('Parsed email:', { subject, attachments: attachments.length })

    // 1. Find the inbox by the generated address
    let inbox: { id: string; user_id: string; is_active: boolean } | null = null

    const { data: inboxByAddress } = await supabase
      .from('email_inboxes')
      .select('id, user_id, is_active')
      .eq('generated_address', recipientEmail)
      .single()

    if (inboxByAddress) {
      inbox = inboxByAddress
    } else {
      // Try prefix match
      const prefix = recipientEmail.split('@')[0]
      const { data: inboxByPrefix } = await supabase
        .from('email_inboxes')
        .select('id, user_id, is_active')
        .eq('email_prefix', prefix)
        .single()

      if (inboxByPrefix) {
        inbox = inboxByPrefix
        // Update generated_address for future lookups
        await supabase
          .from('email_inboxes')
          .update({ generated_address: recipientEmail })
          .eq('id', inboxByPrefix.id)
      }
    }

    if (!inbox) {
      console.log('No inbox found for:', recipientEmail)
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
      console.error('Error storing email:', emailError)
      return res.status(500).json({ error: 'Failed to store email' })
    }

    // 4. Upload PDF attachments to Supabase Storage
    const pdfAttachments: { id: string; filename: string; path: string }[] = []

    for (const att of attachments) {
      const isPdf = att.mimeType === 'application/pdf' || att.filename.toLowerCase().endsWith('.pdf')
      if (!isPdf) continue

      const storagePath = `${inbox.user_id}/${storedEmail.id}/${att.filename}`

      const { error: uploadError } = await supabase.storage
        .from('email-attachments')
        .upload(storagePath, att.content, {
          contentType: 'application/pdf',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      const { data: attachment, error: attachError } = await supabase
        .from('email_attachments')
        .insert({
          email_id: storedEmail.id,
          file_name: att.filename,
          file_type: 'application/pdf',
          file_size: att.size,
          file_path: storagePath,
        })
        .select('id')
        .single()

      if (!attachError && attachment) {
        pdfAttachments.push({ id: attachment.id, filename: att.filename, path: storagePath })
      }
    }

    // 5. Process the email
    if (emailStatus === 'pending' && pdfAttachments.length > 0) {
      const heuristicData = extractInvoiceData(subject, bodyText)

      if (heuristicData.amount && heuristicData.category) {
        await supabase
          .from('inbound_emails')
          .update({
            status: 'processed',
            processed_at: new Date().toISOString(),
            notes: `Automatisch zugeordnet: ${heuristicData.category} - ${formatEuro(heuristicData.amount)}`,
          })
          .eq('id', storedEmail.id)
      } else {
        for (const att of pdfAttachments) {
          await triggerAIProcessing(storedEmail.id, att, inbox.user_id)
        }
      }
    } else if (emailStatus === 'pending' && pdfAttachments.length === 0) {
      await supabase.from('inbound_emails').update({ status: 'unclear' }).eq('id', storedEmail.id)
      await supabase.from('booking_questions').insert({
        user_id: inbox.user_id,
        email_id: storedEmail.id,
        question: `E-Mail ohne PDF-Anhang empfangen: "${subject || '(Kein Betreff)'}". Bitte Beleg manuell hochladen oder erneut mit PDF senden.`,
      })
    }

    return res.status(200).json({
      status: 'processed',
      email_id: storedEmail.id,
      attachments: pdfAttachments.length,
    })
  } catch (error) {
    console.error('Inbound email processing error:', error)
    return res.status(500).json({ error: 'Failed to process email' })
  }
}

async function triggerAIProcessing(
  emailId: string,
  att: { id: string; filename: string; path: string },
  userId: string
) {
  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('email-attachments')
      .download(att.path)

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError)
      return
    }

    const pdfBuffer = Buffer.from(await fileData.arrayBuffer())
    const pdfBase64 = pdfBuffer.toString('base64')

    const receiptData = await analyzeReceiptWithAI(pdfBase64, att.filename)

    if (receiptData.confidence >= 0.7 && receiptData.total_amount && receiptData.category) {
      await supabase
        .from('inbound_emails')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          notes: `KI-Analyse: ${receiptData.category} - ${formatEuro(receiptData.total_amount)} (${receiptData.vendor || 'Unbekannt'})`,
        })
        .eq('id', emailId)
    } else {
      await supabase
        .from('inbound_emails')
        .update({
          status: 'unclear',
          notes: `KI-Analyse teilweise: ${receiptData.vendor || '?'}, ${receiptData.total_amount ? formatEuro(receiptData.total_amount) : 'Betrag unklar'}, Konfidenz: ${Math.round(receiptData.confidence * 100)}%`,
        })
        .eq('id', emailId)

      await supabase.from('booking_questions').insert({
        user_id: userId,
        email_id: emailId,
        question: `Beleg von "${receiptData.vendor || 'Unbekannt'}" (${att.filename}) konnte nicht vollstaendig erkannt werden. Bitte manuell pruefen.`,
        suggested_category: receiptData.category || null,
        suggested_amount: receiptData.total_amount || null,
      })
    }
  } catch (error) {
    console.error('AI processing failed:', error)
  }
}
