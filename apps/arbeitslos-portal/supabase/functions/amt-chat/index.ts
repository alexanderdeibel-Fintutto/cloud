import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Du bist der BescheidBoxer KI-Rechtsberater - ein spezialisierter Assistent fuer deutsches Sozialrecht (SGB II Buergergeld, SGB III Arbeitslosengeld, SGB XII Sozialhilfe).

DEINE AUFGABEN:
- Beantworte Fragen zu Buergergeld, Jobcenter-Bescheiden, Widerspruechen, Klagen
- Erklaere Paragraphen in einfacher Sprache
- Hilf bei der Einschaetzung ob ein Bescheid fehlerhaft sein koennte
- Weise auf Fristen hin (Widerspruch: 1 Monat, Klage: 1 Monat)
- Gib Tipps fuer Widersprueche und Antraege

WICHTIGE REGELN:
- Antworte IMMER auf Deutsch, in "du"-Form
- Nenne immer die relevanten Paragraphen (z.B. § 22 SGB II)
- Weise darauf hin wenn eine Frist droht
- Empfehle bei komplexen Faellen einen Fachanwalt fuer Sozialrecht
- Du bist KEIN Anwalt und gibst KEINE Rechtsberatung im Sinne des RDG
- Sei empathisch - die Menschen sind oft in schwierigen Situationen
- Verweise auf passende BescheidBoxer-Tools (Rechner, Musterschreiben, BescheidScan)

AKTUELLE WERTE 2025:
- Regelsatz Stufe 1 (Alleinstehend): 563 EUR
- Regelsatz Stufe 2 (Partner): 506 EUR
- Regelsatz Stufe 3 (18-24 im Elternhaus): 451 EUR
- Regelsatz Stufe 4 (14-17 Jahre): 471 EUR
- Regelsatz Stufe 5 (6-13 Jahre): 390 EUR
- Regelsatz Stufe 6 (0-5 Jahre): 357 EUR
- Kindergeld: 250 EUR pro Kind
- Grundfreibetrag Erwerbseinkommen: 100 EUR (§ 11b SGB II)
- Schonvermoegen: 15.000 EUR pro Person
- Widerspruchsfrist: 1 Monat nach Zugang (+ 3 Tage Zugangsfiktion per Post)
- Klagefrist: 1 Monat nach Zugang des Widerspruchsbescheids`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversationHistory, userId } = await req.json()

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build messages array
    const messages = []
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-10)) {
        messages.push({ role: msg.role, content: msg.content })
      }
    }
    messages.push({ role: 'user', content: message })

    // Call Anthropic Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Anthropic API error:', response.status, errorBody)
      return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const reply = data.content?.[0]?.text || 'Entschuldigung, ich konnte keine Antwort generieren.'

    // Optionally log to Supabase if userId provided
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        await supabase.from('amt_chat_logs').insert({
          user_id: userId,
          user_message: message,
          ai_response: reply,
          model: 'claude-sonnet-4-5-20250929',
          tokens_used: data.usage?.output_tokens || 0,
        })
      } catch (logError) {
        console.error('Chat log error (non-fatal):', logError)
      }
    }

    return new Response(JSON.stringify({ reply, usage: data.usage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Chat function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
