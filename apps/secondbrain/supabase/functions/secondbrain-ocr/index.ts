import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documentId, storagePath, fileType, mimeType } = await req.json()

    if (!documentId || !storagePath) {
      return new Response(JSON.stringify({ error: 'Missing documentId or storagePath' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Mark as processing
    await supabase
      .from('sb_documents')
      .update({ ocr_status: 'processing' })
      .eq('id', documentId)

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('secondbrain-docs')
      .download(storagePath)

    if (downloadError) throw downloadError

    let extractedText = ''
    let confidence = 0.0
    let summary = ''

    if (fileType === 'text' || mimeType?.startsWith('text/')) {
      // Plain text files: read directly
      extractedText = await fileData.text()
      confidence = 1.0
    } else if (fileType === 'pdf') {
      // For PDFs: extract text content
      // In production, use a PDF parsing library or external OCR API
      // For now, we store the file and mark it for processing
      extractedText = await attemptPdfTextExtraction(fileData)
      confidence = extractedText ? 0.85 : 0.0
    } else if (fileType === 'image') {
      // For images: use OCR API
      extractedText = await performOcr(fileData, mimeType)
      confidence = extractedText ? 0.75 : 0.0
    }

    // Generate summary if we have text
    if (extractedText.trim().length > 50) {
      summary = await generateSummary(extractedText)
    }

    // Auto-generate tags from content
    const tags = extractTags(extractedText, summary)

    // Update document with results
    const { error: updateError } = await supabase
      .from('sb_documents')
      .update({
        ocr_status: 'completed',
        ocr_text: extractedText || null,
        ocr_confidence: confidence,
        summary: summary || null,
        tags,
        ai_metadata: {
          processed_at: new Date().toISOString(),
          text_length: extractedText.length,
          has_summary: !!summary,
        },
      })
      .eq('id', documentId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        textLength: extractedText.length,
        hasSummary: !!summary,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('OCR processing error:', error)

    // Try to mark document as failed
    try {
      const { documentId } = await req.clone().json()
      if (documentId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )
        await supabase
          .from('sb_documents')
          .update({ ocr_status: 'failed' })
          .eq('id', documentId)
      }
    } catch (_) {
      // ignore cleanup errors
    }

    return new Response(
      JSON.stringify({ error: error.message || 'OCR processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function attemptPdfTextExtraction(fileData: Blob): Promise<string> {
  // Basic PDF text extraction by looking for text streams
  // In production, use pdf-parse or an external service
  const buffer = await fileData.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)

  // Extract text between BT and ET markers (PDF text objects)
  const textParts: string[] = []
  const regex = /\(([^)]+)\)/g
  let match
  while ((match = regex.exec(text)) !== null) {
    const part = match[1]
    if (part.length > 2 && /[a-zA-ZäöüÄÖÜß]/.test(part)) {
      textParts.push(part)
    }
  }

  return textParts.join(' ').trim()
}

async function performOcr(fileData: Blob, _mimeType: string): Promise<string> {
  // In production, integrate with:
  // - Google Cloud Vision API
  // - AWS Textract
  // - Azure Computer Vision
  // - Tesseract.js (self-hosted)
  //
  // For now, return empty – the infrastructure is ready for integration
  const aiEndpoint = Deno.env.get('AI_API_ENDPOINT')
  if (!aiEndpoint) return ''

  try {
    const base64 = btoa(
      String.fromCharCode(...new Uint8Array(await fileData.arrayBuffer()))
    )

    const response = await fetch(`${aiEndpoint}/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mimeType: _mimeType }),
    })

    if (!response.ok) return ''
    const result = await response.json()
    return result.text || ''
  } catch {
    return ''
  }
}

async function generateSummary(text: string): Promise<string> {
  const aiEndpoint = Deno.env.get('AI_API_ENDPOINT')
  if (!aiEndpoint) {
    // Fallback: simple extractive summary (first 3 sentences)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20)
    return sentences.slice(0, 3).join('. ').trim() + '.'
  }

  try {
    const response = await fetch(`${aiEndpoint}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 10000) }),
    })

    if (!response.ok) return ''
    const result = await response.json()
    return result.summary || ''
  } catch {
    return ''
  }
}

function extractTags(text: string, summary: string): string[] {
  const combined = (text + ' ' + summary).toLowerCase()
  const tagMap: Record<string, string[]> = {
    'Mietvertrag': ['mietvertrag', 'mieter', 'vermieter', 'kündigung', 'kaution'],
    'Rechnung': ['rechnung', 'invoice', 'betrag', 'zahlung', 'fällig'],
    'Steuer': ['steuer', 'finanzamt', 'steuererklärung', 'lohnsteuer'],
    'Versicherung': ['versicherung', 'police', 'versichert', 'prämie'],
    'Vertrag': ['vertrag', 'vereinbarung', 'laufzeit', 'kündigung'],
    'Gehalt': ['gehalt', 'lohn', 'brutto', 'netto', 'abrechnung'],
    'Bank': ['bank', 'konto', 'iban', 'überweisung', 'kontoauszug'],
    'Gesundheit': ['arzt', 'krankenhaus', 'diagnose', 'rezept', 'gesundheit'],
  }

  const tags: string[] = []
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      tags.push(tag)
    }
  }

  return tags.slice(0, 5)
}
