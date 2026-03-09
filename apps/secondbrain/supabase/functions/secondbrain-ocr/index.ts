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
    const { documentId, storagePath, fileType, mimeType, fileName } = await req.json()

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
      extractedText = await fileData.text()
      confidence = 1.0
    } else if (fileType === 'pdf') {
      extractedText = await attemptPdfTextExtraction(fileData)
      confidence = extractedText ? 0.85 : 0.0
    } else if (fileType === 'image') {
      extractedText = await performOcr(fileData, mimeType)
      confidence = extractedText ? 0.75 : 0.0
    }

    // Generate summary if we have text
    if (extractedText.trim().length > 50) {
      summary = await generateSummary(extractedText)
    }

    // Auto-generate tags from content
    const tags = extractTags(extractedText, summary, fileName || '')

    // === SMART AUTO-CATEGORIZATION ===
    const analysis = analyzeDocument(extractedText, summary, fileName || '', tags)

    // Try to auto-assign company based on user's existing companies
    let autoCompanyId: string | null = null
    if (analysis.detectedCompanyHints.length > 0) {
      // Get user's document to find user_id
      const { data: docData } = await supabase
        .from('sb_documents')
        .select('user_id')
        .eq('id', documentId)
        .single()

      if (docData) {
        const { data: companies } = await supabase
          .from('sb_companies')
          .select('id, name, short_name')
          .eq('user_id', docData.user_id)

        if (companies) {
          for (const company of companies) {
            const companyNames = [company.name, company.short_name].filter(Boolean).map((n: string) => n.toLowerCase())
            for (const hint of analysis.detectedCompanyHints) {
              if (companyNames.some((cn: string) => cn.includes(hint) || hint.includes(cn))) {
                autoCompanyId = company.id
                break
              }
            }
            if (autoCompanyId) break
          }
        }
      }
    }

    // Auto-create deadlines if detected
    if (analysis.deadlines.length > 0) {
      const { data: docData } = await supabase
        .from('sb_documents')
        .select('user_id, title')
        .eq('id', documentId)
        .single()

      if (docData) {
        for (const deadline of analysis.deadlines) {
          await supabase.from('sb_deadlines').insert({
            user_id: docData.user_id,
            document_id: documentId,
            title: deadline.title,
            description: `Automatisch erkannt aus: ${docData.title}`,
            deadline_date: deadline.date,
            reminder_date: deadline.reminderDate,
            deadline_type: deadline.type,
            priority: deadline.priority,
          })
        }
      }
    }

    // Update document with results + smart categorization
    const updateData: Record<string, unknown> = {
      ocr_status: 'completed',
      ocr_text: extractedText || null,
      ocr_confidence: confidence,
      summary: summary || null,
      tags,
      document_type: analysis.documentType,
      priority: analysis.priority,
      status: analysis.suggestedStatus,
      ai_metadata: {
        processed_at: new Date().toISOString(),
        text_length: extractedText.length,
        has_summary: !!summary,
        detected_type: analysis.documentType,
        detected_sender: analysis.sender,
        detected_amount: analysis.amount,
        detected_reference: analysis.referenceNumber,
        detected_date: analysis.documentDate,
        detected_company_hints: analysis.detectedCompanyHints,
        deadline_count: analysis.deadlines.length,
        confidence_scores: analysis.confidenceScores,
      },
    }

    // Only set if detected
    if (analysis.sender) updateData.sender = analysis.sender
    if (analysis.amount) updateData.amount = analysis.amount
    if (analysis.referenceNumber) updateData.reference_number = analysis.referenceNumber
    if (analysis.documentDate) updateData.document_date = analysis.documentDate
    if (autoCompanyId) updateData.company_id = autoCompanyId

    // Auto-set workflow status based on document type
    if (analysis.documentType === 'rechnung') {
      updateData.workflow_status = 'pending_payment'
    } else if (analysis.documentType === 'brief' || analysis.documentType === 'bescheid') {
      updateData.workflow_status = 'pending_review'
    } else if (analysis.documentType === 'mahnung') {
      updateData.workflow_status = 'pending_payment'
      updateData.priority = 'urgent'
      updateData.status = 'action_required'
    }

    const { error: updateError } = await supabase
      .from('sb_documents')
      .update(updateData)
      .eq('id', documentId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        textLength: extractedText.length,
        hasSummary: !!summary,
        documentType: analysis.documentType,
        deadlinesCreated: analysis.deadlines.length,
        autoCompanyAssigned: !!autoCompanyId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('OCR processing error:', error)

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
      JSON.stringify({ error: (error as Error).message || 'OCR processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ============================================================
// SMART DOCUMENT ANALYSIS
// ============================================================

interface DetectedDeadline {
  title: string
  date: string
  reminderDate: string
  type: string
  priority: string
}

interface DocumentAnalysis {
  documentType: string
  priority: string
  suggestedStatus: string
  sender: string | null
  amount: number | null
  referenceNumber: string | null
  documentDate: string | null
  detectedCompanyHints: string[]
  deadlines: DetectedDeadline[]
  confidenceScores: Record<string, number>
}

function analyzeDocument(text: string, summary: string, fileName: string, tags: string[]): DocumentAnalysis {
  const combined = (text + ' ' + summary + ' ' + fileName).toLowerCase()
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // === DOCUMENT TYPE DETECTION ===
  const typeScores: Record<string, number> = {}

  const typeKeywords: Record<string, string[]> = {
    rechnung: ['rechnung', 'invoice', 'rechnungsnummer', 'rechnungsdatum', 'nettobetrag', 'bruttobetrag', 'zahlungsziel', 'rechnungsbetrag', 'ust', 'mwst', 'umsatzsteuer'],
    mahnung: ['mahnung', 'zahlungserinnerung', 'mahngebühr', 'verzug', 'letzte mahnung', 'inkasso', 'forderung'],
    brief: ['sehr geehrte', 'mit freundlichen grüßen', 'betreff', 'bezug', 'ihr schreiben', 'unser zeichen'],
    bescheid: ['bescheid', 'festsetzung', 'bewilligung', 'ablehn', 'widerspruch', 'rechtsbehelf', 'einspruch', 'klagefrist', 'rechtsmittelbelehrung'],
    vertrag: ['vertrag', 'vereinbarung', 'vertragspartner', 'laufzeit', 'kündigungsfrist', 'vertragsgegenstand', 'haftung'],
    beleg: ['beleg', 'quittung', 'kassenbon', 'bon', 'kassenbeleg', 'kartenzahlung'],
    quittung: ['quittung', 'erhalten von', 'dankend erhalten', 'empfangsbestätigung'],
    angebot: ['angebot', 'kostenvoranschlag', 'gültig bis', 'angebotsnummer', 'wir bieten ihnen'],
    kuendigung: ['kündigung', 'fristgerecht', 'sonderkündigung', 'kündigungsschreiben', 'hiermit kündige'],
    kontoauszug: ['kontoauszug', 'kontobewegung', 'saldo', 'haben', 'soll', 'buchungstag', 'wertstellung'],
    steuerbescheid: ['steuerbescheid', 'einkommensteuerbescheid', 'festsetzung', 'finanzamt', 'steuer-id', 'steuernummer'],
    versicherung: ['versicherung', 'police', 'versicherungsschein', 'prämie', 'deckung', 'versicherungsnummer'],
    lohnabrechnung: ['lohnabrechnung', 'gehaltsabrechnung', 'bruttolohn', 'nettolohn', 'sozialversicherung', 'lohnsteuer', 'arbeitgeber'],
    mietvertrag: ['mietvertrag', 'mieter', 'vermieter', 'mietobjekt', 'kaltmiete', 'warmmiete', 'nebenkosten', 'kaution'],
  }

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    let score = 0
    for (const kw of keywords) {
      if (combined.includes(kw)) score += 1
    }
    if (score > 0) typeScores[type] = score
  }

  // Also check filename patterns
  const fnLower = fileName.toLowerCase()
  if (fnLower.includes('rechnung') || fnLower.includes('invoice')) typeScores.rechnung = (typeScores.rechnung || 0) + 3
  if (fnLower.includes('mahnung')) typeScores.mahnung = (typeScores.mahnung || 0) + 3
  if (fnLower.includes('vertrag') || fnLower.includes('contract')) typeScores.vertrag = (typeScores.vertrag || 0) + 3
  if (fnLower.includes('bescheid')) typeScores.bescheid = (typeScores.bescheid || 0) + 3
  if (fnLower.includes('beleg') || fnLower.includes('quittung')) typeScores.beleg = (typeScores.beleg || 0) + 3
  if (fnLower.includes('kontoauszug')) typeScores.kontoauszug = (typeScores.kontoauszug || 0) + 3
  if (fnLower.includes('lohn') || fnLower.includes('gehalt')) typeScores.lohnabrechnung = (typeScores.lohnabrechnung || 0) + 3
  if (fnLower.includes('mietvertrag')) typeScores.mietvertrag = (typeScores.mietvertrag || 0) + 3
  if (fnLower.includes('versicherung') || fnLower.includes('police')) typeScores.versicherung = (typeScores.versicherung || 0) + 3
  if (fnLower.includes('steuer')) typeScores.steuerbescheid = (typeScores.steuerbescheid || 0) + 2
  if (fnLower.includes('angebot')) typeScores.angebot = (typeScores.angebot || 0) + 3
  if (fnLower.includes('kündigung') || fnLower.includes('kuendigung')) typeScores.kuendigung = (typeScores.kuendigung || 0) + 3

  const sortedTypes = Object.entries(typeScores).sort((a, b) => b[1] - a[1])
  const documentType = sortedTypes.length > 0 ? sortedTypes[0][0] : 'other'

  // === AMOUNT DETECTION ===
  let amount: number | null = null
  const amountPatterns = [
    /(?:gesamt|summe|betrag|total|brutto|netto|rechnungsbetrag)[:\s]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:€|eur)/i,
    /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:€|eur)/i,
    /(?:€|eur)\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
  ]
  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      const numStr = match[1].replace(/\./g, '').replace(',', '.')
      const parsed = parseFloat(numStr)
      if (!isNaN(parsed) && parsed > 0 && parsed < 10000000) {
        amount = parsed
        break
      }
    }
  }

  // === REFERENCE NUMBER DETECTION ===
  let referenceNumber: string | null = null
  const refPatterns = [
    /(?:rechnungs?(?:nummer|nr\.?))[:\s]*([A-Za-z0-9\-\/]+)/i,
    /(?:aktenzeichen|az\.?|geschäftszeichen|gz\.?)[:\s]*([A-Za-z0-9\-\/\s]+?)(?:\n|$)/i,
    /(?:bestellnummer|bestell-nr\.?)[:\s]*([A-Za-z0-9\-\/]+)/i,
    /(?:kundennummer|kunden-nr\.?)[:\s]*([A-Za-z0-9\-\/]+)/i,
    /(?:vertragsnummer|vertrags-nr\.?)[:\s]*([A-Za-z0-9\-\/]+)/i,
  ]
  for (const pattern of refPatterns) {
    const match = text.match(pattern)
    if (match) {
      referenceNumber = match[1].trim().slice(0, 50)
      break
    }
  }

  // === DATE DETECTION ===
  let documentDate: string | null = null
  const datePatterns = [
    /(?:datum|date|vom)[:\s]*(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/i,
    /(\d{1,2})[.\/-](\d{1,2})[.\/-](20\d{2})/,
  ]
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      const day = match[1].padStart(2, '0')
      const month = match[2].padStart(2, '0')
      let year = match[3]
      if (year.length === 2) year = '20' + year
      if (parseInt(month) <= 12 && parseInt(day) <= 31) {
        documentDate = `${year}-${month}-${day}`
        break
      }
    }
  }

  // === SENDER DETECTION ===
  let sender: string | null = null
  // Try first non-empty line (often the sender in German letters)
  if (lines.length > 0) {
    const firstLines = lines.slice(0, 5)
    for (const line of firstLines) {
      // Skip very short lines or lines that look like dates
      if (line.length > 3 && line.length < 100 && !/^\d{1,2}[.\/-]/.test(line)) {
        sender = line
        break
      }
    }
  }

  // === COMPANY HINTS (for auto-assignment) ===
  const detectedCompanyHints: string[] = []
  // Look for GmbH, AG, UG, etc. patterns
  const companyPatterns = [
    /([A-ZÄÖÜa-zäöü][\w\s&.-]+(?:GmbH|AG|UG|KG|OHG|e\.K\.|Ltd\.|Inc\.))/g,
    /(?:firma|unternehmen|arbeitgeber)[:\s]*([^\n,]+)/gi,
  ]
  for (const pattern of companyPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const hint = match[1].trim().toLowerCase()
      if (hint.length > 2 && hint.length < 80 && !detectedCompanyHints.includes(hint)) {
        detectedCompanyHints.push(hint)
      }
    }
  }

  // === DEADLINE DETECTION ===
  const deadlines: DetectedDeadline[] = []
  const deadlinePatterns = [
    { pattern: /(?:widerspruchsfrist|einspruchsfrist)[:\s]*(?:bis\s+)?(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/i, type: 'widerspruch', title: 'Widerspruchsfrist' },
    { pattern: /(?:zahlungsziel|zahlbar bis|fällig bis|fällig am)[:\s]*(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/i, type: 'zahlung', title: 'Zahlungsfrist' },
    { pattern: /(?:kündigungsfrist|kündbar bis|kündigung bis)[:\s]*(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/i, type: 'kuendigung', title: 'Kündigungsfrist' },
    { pattern: /(?:frist|termin|deadline)[:\s]*(?:bis\s+)?(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/i, type: 'frist', title: 'Frist' },
    { pattern: /(?:gültig bis|ablaufdatum|gültigkeit bis)[:\s]*(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/i, type: 'frist', title: 'Gültigkeit' },
  ]

  // Also detect "innerhalb von X Wochen/Tagen" patterns
  const relativeDeadlinePatterns = [
    { pattern: /(?:innerhalb von|binnen)\s+(\d+)\s+(?:wochen|woche)/i, unit: 'weeks', type: 'widerspruch', title: 'Frist' },
    { pattern: /(?:innerhalb von|binnen)\s+(\d+)\s+(?:tagen|tag|werktagen)/i, unit: 'days', type: 'widerspruch', title: 'Frist' },
    { pattern: /(?:innerhalb von|binnen)\s+(?:einem|1)\s+monat/i, unit: 'month', type: 'widerspruch', title: 'Monatsfrist' },
  ]

  for (const { pattern, type, title } of deadlinePatterns) {
    const match = text.match(pattern)
    if (match) {
      const day = match[1].padStart(2, '0')
      const month = match[2].padStart(2, '0')
      let year = match[3]
      if (year.length === 2) year = '20' + year
      if (parseInt(month) <= 12 && parseInt(day) <= 31) {
        const date = `${year}-${month}-${day}`
        // Reminder 3 days before
        const reminderDate = new Date(date)
        reminderDate.setDate(reminderDate.getDate() - 3)
        deadlines.push({
          title: `${title}: ${day}.${month}.${year}`,
          date,
          reminderDate: reminderDate.toISOString().split('T')[0],
          type,
          priority: type === 'widerspruch' ? 'urgent' : 'high',
        })
      }
    }
  }

  for (const { pattern, unit, type, title } of relativeDeadlinePatterns) {
    const match = text.match(pattern)
    if (match) {
      const deadlineDate = new Date()
      if (unit === 'weeks') {
        deadlineDate.setDate(deadlineDate.getDate() + parseInt(match[1]) * 7)
      } else if (unit === 'days') {
        deadlineDate.setDate(deadlineDate.getDate() + parseInt(match[1]))
      } else if (unit === 'month') {
        deadlineDate.setMonth(deadlineDate.getMonth() + 1)
      }
      const date = deadlineDate.toISOString().split('T')[0]
      const reminderDate = new Date(deadlineDate)
      reminderDate.setDate(reminderDate.getDate() - 3)
      deadlines.push({
        title: `${title} (${match[0].trim()})`,
        date,
        reminderDate: reminderDate.toISOString().split('T')[0],
        type,
        priority: 'urgent',
      })
    }
  }

  // === PRIORITY DETECTION ===
  let priority = 'normal'
  if (combined.includes('mahnung') || combined.includes('letzte mahnung') || combined.includes('inkasso')) {
    priority = 'urgent'
  } else if (combined.includes('widerspruch') || combined.includes('frist') || combined.includes('eilig') || combined.includes('dringend')) {
    priority = 'high'
  } else if (deadlines.length > 0) {
    priority = 'high'
  }

  // === SUGGESTED STATUS ===
  let suggestedStatus = 'inbox'
  if (documentType === 'mahnung' || priority === 'urgent') {
    suggestedStatus = 'action_required'
  } else if (documentType === 'rechnung') {
    suggestedStatus = 'processing'
  } else if (documentType === 'bescheid' && deadlines.length > 0) {
    suggestedStatus = 'action_required'
  }

  return {
    documentType,
    priority,
    suggestedStatus,
    sender,
    amount,
    referenceNumber,
    documentDate,
    detectedCompanyHints: detectedCompanyHints.slice(0, 5),
    deadlines: deadlines.slice(0, 3),
    confidenceScores: typeScores,
  }
}

// ============================================================
// TEXT EXTRACTION HELPERS
// ============================================================

async function attemptPdfTextExtraction(fileData: Blob): Promise<string> {
  const buffer = await fileData.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)

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

function extractTags(text: string, summary: string, fileName: string): string[] {
  const combined = (text + ' ' + summary + ' ' + fileName).toLowerCase()
  const tagMap: Record<string, string[]> = {
    'Mietvertrag': ['mietvertrag', 'mieter', 'vermieter', 'kaution'],
    'Rechnung': ['rechnung', 'invoice', 'rechnungsnummer', 'rechnungsbetrag'],
    'Steuer': ['steuer', 'finanzamt', 'steuererklärung', 'lohnsteuer', 'steuerbescheid'],
    'Versicherung': ['versicherung', 'police', 'versichert', 'prämie'],
    'Vertrag': ['vertrag', 'vereinbarung', 'laufzeit'],
    'Gehalt': ['gehalt', 'lohn', 'brutto', 'netto', 'lohnabrechnung', 'gehaltsabrechnung'],
    'Bank': ['bank', 'konto', 'iban', 'überweisung', 'kontoauszug'],
    'Gesundheit': ['arzt', 'krankenhaus', 'diagnose', 'rezept', 'gesundheit'],
    'Mahnung': ['mahnung', 'zahlungserinnerung', 'mahngebühr', 'inkasso'],
    'Bescheid': ['bescheid', 'bewilligung', 'festsetzung', 'ablehn'],
    'Kündigung': ['kündigung', 'kündigungsschreiben', 'fristgerecht'],
    'Angebot': ['angebot', 'kostenvoranschlag'],
  }

  const tags: string[] = []
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      tags.push(tag)
    }
  }

  return tags.slice(0, 8)
}
