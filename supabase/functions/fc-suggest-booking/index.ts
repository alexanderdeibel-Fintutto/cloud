/**
 * fc-suggest-booking — Financial Compass KI-Buchungsvorschlag
 *
 * Wird aufgerufen wenn:
 *   a) OCR abgeschlossen (ocr_status='completed') und Nutzer hat Buchungsvorschläge aktiviert
 *   b) Nutzer klickt manuell auf "Buchungsvorschlag erstellen"
 *
 * Ablauf:
 *   1. OCR-Text aus sb_documents laden
 *   2. Claude Haiku analysiert Text → extrahiert Betrag, Datum, Lieferant, MwSt, Konto
 *   3. Vorschlag in fc_booking_suggestions speichern
 *   4. Response mit Vorschlag zurückgeben
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// SKR03 Konten für häufige Ausgaben-Kategorien
const SKR03_HINTS = `
Häufige SKR03-Konten für Ausgaben:
- 4920: Büromaterial
- 4930: Zeitschriften, Bücher
- 4940: Postgebühren, Telefon
- 4950: Reisekosten
- 4960: Bewirtungskosten (70% abzugsfähig)
- 4970: Werbekosten
- 4980: Reparatur, Instandhaltung
- 4200: Miete
- 4530: Kfz-Kosten
- 4100: Löhne und Gehälter
- 1200: Bank (Gegenkonto für Ausgaben)
- 1600: Verbindlichkeiten aus Lieferungen
`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Nutzer aus JWT ermitteln
    const { data: { user }, error: authError } = await createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    ).auth.getUser(authHeader.replace('Bearer ', ''))

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { documentId } = await req.json()

    if (!documentId) {
      return new Response(JSON.stringify({ error: 'documentId fehlt' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Dokument laden
    const { data: doc, error: docError } = await supabase
      .from('sb_documents')
      .select('id, title, ocr_text, summary, source_app, user_id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !doc) {
      return new Response(JSON.stringify({ error: 'Dokument nicht gefunden' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!doc.ocr_text && !doc.summary) {
      return new Response(JSON.stringify({ error: 'Kein OCR-Text vorhanden. Bitte zuerst OCR durchführen.' }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Prüfen ob bereits ein offener Vorschlag existiert
    const { data: existing } = await supabase
      .from('fc_booking_suggestions')
      .select('id, status')
      .eq('document_id', documentId)
      .eq('status', 'pending')
      .single()

    if (existing) {
      return new Response(JSON.stringify({
        message: 'Vorschlag bereits vorhanden',
        suggestion_id: existing.id
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const textToAnalyze = doc.ocr_text || doc.summary || ''

    // Claude Haiku: Buchungsvorschlag generieren
    const prompt = `Du bist ein deutschsprachiger Buchhalter und analysierst Belege für die Buchhaltungssoftware Fintutto.

Analysiere den folgenden Belegtext und extrahiere die Buchungsinformationen:

BELEGTEXT:
${textToAnalyze.slice(0, 3000)}

${SKR03_HINTS}

Antworte NUR mit einem JSON-Objekt (kein Markdown, keine Erklärungen):
{
  "vendor": "Name des Lieferanten/Kreditors",
  "amount_gross": 0.00,
  "amount_net": 0.00,
  "vat_rate": 19.0,
  "vat_amount": 0.00,
  "document_date": "YYYY-MM-DD",
  "account_number": "4920",
  "account_name": "Büromaterial",
  "booking_type": "expense",
  "confidence": 0.85,
  "notes": "Kurze Begründung der Kontozuordnung"
}

Regeln:
- booking_type: "expense" für Ausgaben, "income" für Einnahmen
- confidence: 0.0-1.0 (wie sicher bist du?)
- Falls ein Wert nicht erkennbar ist, verwende null
- document_date im Format YYYY-MM-DD
- Beträge als Dezimalzahl mit 2 Nachkommastellen`

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text()
      console.error('Anthropic error:', errText)
      return new Response(JSON.stringify({ error: 'KI-Analyse fehlgeschlagen' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const anthropicData = await anthropicResponse.json()
    const rawText = anthropicData.content?.[0]?.text ?? '{}'

    // JSON parsen
    let suggestion: Record<string, unknown> = {}
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        suggestion = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('JSON parse error:', e, rawText)
      suggestion = { notes: 'KI-Antwort konnte nicht geparst werden', confidence: 0 }
    }

    // Vorschlag in DB speichern
    const { data: savedSuggestion, error: insertError } = await supabase
      .from('fc_booking_suggestions')
      .insert({
        document_id: documentId,
        user_id: user.id,
        vendor: suggestion.vendor ?? null,
        amount_gross: suggestion.amount_gross ?? null,
        amount_net: suggestion.amount_net ?? null,
        vat_rate: suggestion.vat_rate ?? null,
        vat_amount: suggestion.vat_amount ?? null,
        document_date: suggestion.document_date ?? null,
        account_number: suggestion.account_number ?? null,
        account_name: suggestion.account_name ?? null,
        booking_type: suggestion.booking_type ?? 'expense',
        confidence: suggestion.confidence ?? 0,
        raw_suggestion: suggestion,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('DB insert error:', insertError)
      return new Response(JSON.stringify({ error: 'Vorschlag konnte nicht gespeichert werden' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      suggestion: savedSuggestion,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Interner Fehler' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
