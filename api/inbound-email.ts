import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

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
 */

export const config = {
  api: {
    bodyParser: false,
  },
}

interface ParsedEmail {
  from: string
  to: string
  subject: string
  text: string
  html: string
  envelope: string
  attachments: string
  [key: string]: string | Buffer
}

interface Attachment {
  filename: string
  type: string
  content: Buffer
}

// Parse multipart form data from SendGrid
async function parseMultipart(req: VercelRequest): Promise<{ fields: Record<string, string>; files: Attachment[] }> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const body = Buffer.concat(chunks)

  const contentType = req.headers['content-type'] || ''
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/)
  if (!boundaryMatch) {
    throw new Error('No boundary found in content-type')
  }
  const boundary = boundaryMatch[1] || boundaryMatch[2]

  const fields: Record<string, string> = {}
  const files: Attachment[] = []

  const bodyStr = body.toString('latin1')
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

  return { fields, files }
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { fields, files } = await parseMultipart(req)

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
        body_text: bodyText.substring(0, 10000), // limit text size
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
        continue // Only process PDFs
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

    // 5. If email is from a verified sender, try to auto-process
    if (emailStatus === 'pending' && pdfAttachments.length > 0) {
      await processEmailForBooking(storedEmail.id, inbox.user_id, subject, bodyText, pdfAttachments)
    } else if (emailStatus === 'pending' && pdfAttachments.length === 0) {
      // No PDFs attached - create a question
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

// Process email and try to auto-book or create questions
async function processEmailForBooking(
  emailId: string,
  userId: string,
  subject: string,
  bodyText: string,
  attachments: { id: string; filename: string; path: string }[]
) {
  // Try to extract invoice data from the email subject/body
  const extractedData = extractInvoiceData(subject, bodyText)

  if (extractedData.amount && extractedData.category) {
    // Auto-book: we have enough info
    await supabase.from('inbound_emails').update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      notes: `Automatisch zugeordnet: ${extractedData.category} - ${formatEuro(extractedData.amount)}`,
    }).eq('id', emailId)
  } else {
    // Create booking question for manual review
    await supabase.from('inbound_emails').update({ status: 'unclear' }).eq('id', emailId)

    const questionParts: string[] = []
    if (!extractedData.amount) {
      questionParts.push('Betrag konnte nicht ermittelt werden')
    }
    if (!extractedData.category) {
      questionParts.push('Kategorie konnte nicht zugeordnet werden')
    }

    await supabase.from('booking_questions').insert({
      user_id: userId,
      email_id: emailId,
      question: `Beleg "${subject || attachments[0]?.filename || '(Unbenannt)'}" erfordert manuelle Zuordnung: ${questionParts.join(', ')}.`,
      suggested_category: extractedData.category || null,
      suggested_amount: extractedData.amount || null,
    })
  }
}

// Simple heuristic to extract invoice data from email content
function extractInvoiceData(subject: string, body: string): { amount: number | null; category: string | null } {
  const combined = `${subject}\n${body}`.toLowerCase()

  // Extract amount (German format: 1.234,56 EUR or 1234,56 EUR or EUR 1.234,56)
  let amount: number | null = null
  const amountPatterns = [
    /(?:gesamt|summe|betrag|total|rechnungsbetrag|endbetrag|zahlbetrag)[:\s]*(?:eur\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
    /(\d{1,3}(?:\.\d{3})*,\d{2})\s*(?:eur|€)/i,
    /(?:eur|€)\s*(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  ]

  for (const pattern of amountPatterns) {
    const match = combined.match(pattern)
    if (match) {
      amount = parseGermanNumber(match[1])
      break
    }
  }

  // Categorize based on keywords
  let category: string | null = null
  const categoryMap: Record<string, string[]> = {
    'Nebenkosten': ['nebenkosten', 'betriebskosten', 'hausgeld', 'nebenkostenabrechnung'],
    'Versicherung': ['versicherung', 'police', 'haftpflicht', 'gebäudeversicherung', 'wohngebäude'],
    'Reparatur': ['reparatur', 'instandhaltung', 'handwerker', 'sanitär', 'heizung', 'wartung'],
    'Steuern': ['grundsteuer', 'steuer', 'finanzamt', 'steuerbescheid'],
    'Verwaltung': ['verwaltung', 'hausverwaltung', 'verwalter'],
    'Energie': ['strom', 'gas', 'energie', 'stadtwerke', 'energieversorger'],
    'Wasser': ['wasser', 'abwasser', 'wasserwerk'],
    'Müllentsorgung': ['müll', 'abfall', 'entsorgung', 'wertstoff'],
    'Grundstück': ['garten', 'winterdienst', 'reinigung', 'treppenhausreinigung'],
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

function parseGermanNumber(str: string): number {
  // "1.234,56" -> 1234.56
  return parseFloat(str.replace(/\./g, '').replace(',', '.'))
}

function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}
