import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Process Receipt - AI-powered PDF invoice/receipt analysis
 *
 * Called after a PDF is uploaded via inbound email.
 * Uses Claude API to extract structured data from the PDF.
 *
 * Can also be triggered manually from the UI to re-process a receipt.
 */

interface ReceiptData {
  vendor: string | null
  invoice_number: string | null
  invoice_date: string | null
  due_date: string | null
  total_amount: number | null
  tax_amount: number | null
  net_amount: number | null
  category: string | null
  line_items: LineItem[]
  confidence: number
}

interface LineItem {
  description: string
  amount: number
  quantity?: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' })
  }

  try {
    const { email_id, attachment_id } = req.body

    if (!email_id || !attachment_id) {
      return res.status(400).json({ error: 'email_id and attachment_id are required' })
    }

    // Verify the user owns this email
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { data: email } = await supabase
      .from('inbound_emails')
      .select('id, user_id')
      .eq('id', email_id)
      .eq('user_id', user.id)
      .single()

    if (!email) {
      return res.status(404).json({ error: 'Email not found' })
    }

    // Get the attachment
    const { data: attachment } = await supabase
      .from('email_attachments')
      .select('*')
      .eq('id', attachment_id)
      .eq('email_id', email_id)
      .single()

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' })
    }

    // Download PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('email-attachments')
      .download(attachment.file_path)

    if (downloadError || !fileData) {
      console.error('Error downloading PDF:', downloadError)
      return res.status(500).json({ error: 'Failed to download PDF' })
    }

    // Convert to base64 for Claude API
    const pdfBuffer = Buffer.from(await fileData.arrayBuffer())
    const pdfBase64 = pdfBuffer.toString('base64')

    // Analyze with Claude API
    const receiptData = await analyzeReceiptWithAI(pdfBase64, attachment.file_name)

    if (receiptData.confidence >= 0.7 && receiptData.total_amount && receiptData.category) {
      // High confidence - auto-book
      await supabase.from('inbound_emails').update({
        status: 'processed',
        processed_at: new Date().toISOString(),
        notes: `KI-Analyse: ${receiptData.category} - ${formatEuro(receiptData.total_amount)} (${receiptData.vendor || 'Unbekannt'})`,
      }).eq('id', email_id)

      // Resolve any existing questions for this email
      await supabase.from('booking_questions')
        .update({ is_resolved: true, resolved_at: new Date().toISOString(), resolution_notes: 'Automatisch durch KI-Analyse geloest' })
        .eq('email_id', email_id)
    } else {
      // Low confidence - create question for manual review
      await supabase.from('inbound_emails').update({
        status: 'unclear',
        notes: `KI-Analyse teilweise: ${receiptData.vendor || '?'}, ${receiptData.total_amount ? formatEuro(receiptData.total_amount) : 'Betrag unklar'}, Konfidenz: ${Math.round(receiptData.confidence * 100)}%`,
      }).eq('id', email_id)

      // Check if question already exists
      const { data: existingQuestion } = await supabase
        .from('booking_questions')
        .select('id')
        .eq('email_id', email_id)
        .eq('is_resolved', false)
        .single()

      if (!existingQuestion) {
        await supabase.from('booking_questions').insert({
          user_id: user.id,
          email_id: email_id,
          question: `Beleg von "${receiptData.vendor || 'Unbekannt'}" (${attachment.file_name}) konnte nicht vollstaendig erkannt werden. Bitte manuell pruefen und zuordnen.`,
          suggested_category: receiptData.category,
          suggested_amount: receiptData.total_amount,
        })
      }
    }

    return res.status(200).json({
      status: 'analyzed',
      data: receiptData,
    })
  } catch (error) {
    console.error('Receipt processing error:', error)
    return res.status(500).json({ error: 'Failed to process receipt' })
  }
}

async function analyzeReceiptWithAI(pdfBase64: string, filename: string): Promise<ReceiptData> {
  const claudeApiKey = process.env.ANTHROPIC_API_KEY
  if (!claudeApiKey) {
    console.warn('ANTHROPIC_API_KEY not set, falling back to heuristic extraction')
    return { vendor: null, invoice_number: null, invoice_date: null, due_date: null, total_amount: null, tax_amount: null, net_amount: null, category: null, line_items: [], confidence: 0 }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: pdfBase64,
                },
              },
              {
                type: 'text',
                text: `Analysiere dieses PDF-Dokument (${filename}). Es handelt sich um einen Beleg oder eine Rechnung im Kontext der Immobilienverwaltung (Vermietung).

Extrahiere folgende Informationen und antworte ausschliesslich mit einem JSON-Objekt:

{
  "vendor": "Name des Absenders/Unternehmens",
  "invoice_number": "Rechnungsnummer",
  "invoice_date": "Rechnungsdatum (YYYY-MM-DD)",
  "due_date": "Faelligkeitsdatum (YYYY-MM-DD)",
  "total_amount": 123.45,
  "tax_amount": 23.45,
  "net_amount": 100.00,
  "category": "Eine der folgenden Kategorien: Nebenkosten, Versicherung, Reparatur, Steuern, Verwaltung, Energie, Wasser, Muellentsorgung, Grundstueck, Rechtskosten, Sonstiges",
  "line_items": [{"description": "Beschreibung", "amount": 100.00}],
  "confidence": 0.85
}

Setze "confidence" zwischen 0 und 1 basierend darauf, wie sicher du dir bei der Extraktion bist. Setze Felder auf null wenn du sie nicht finden kannst. Antworte NUR mit dem JSON.`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('Claude API error:', response.status, await response.text())
      return { vendor: null, invoice_number: null, invoice_date: null, due_date: null, total_amount: null, tax_amount: null, net_amount: null, category: null, line_items: [], confidence: 0 }
    }

    const result = await response.json()
    const text = result.content?.[0]?.text || ''

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Claude response:', text)
      return { vendor: null, invoice_number: null, invoice_date: null, due_date: null, total_amount: null, tax_amount: null, net_amount: null, category: null, line_items: [], confidence: 0 }
    }

    const parsed = JSON.parse(jsonMatch[0]) as ReceiptData
    return {
      vendor: parsed.vendor || null,
      invoice_number: parsed.invoice_number || null,
      invoice_date: parsed.invoice_date || null,
      due_date: parsed.due_date || null,
      total_amount: typeof parsed.total_amount === 'number' ? parsed.total_amount : null,
      tax_amount: typeof parsed.tax_amount === 'number' ? parsed.tax_amount : null,
      net_amount: typeof parsed.net_amount === 'number' ? parsed.net_amount : null,
      category: parsed.category || null,
      line_items: Array.isArray(parsed.line_items) ? parsed.line_items : [],
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    return { vendor: null, invoice_number: null, invoice_date: null, due_date: null, total_amount: null, tax_amount: null, net_amount: null, category: null, line_items: [], confidence: 0 }
  }
}

function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}
