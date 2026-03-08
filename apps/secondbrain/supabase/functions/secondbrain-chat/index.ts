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
    const { sessionId, message, userId } = await req.json()

    if (!message || !userId) {
      return new Response(JSON.stringify({ error: 'Missing message or userId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Search for relevant documents using full-text search
    const searchTerms = extractSearchTerms(message)
    const { data: relevantDocs } = await supabase
      .from('sb_documents')
      .select('id, title, ocr_text, summary, file_type, tags')
      .eq('user_id', userId)
      .eq('ocr_status', 'completed')
      .or(
        searchTerms
          .map((term) => `title.ilike.%${term}%,ocr_text.ilike.%${term}%,summary.ilike.%${term}%`)
          .join(',')
      )
      .limit(5)

    const sources = (relevantDocs || []).map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.file_type,
      snippet: doc.summary || doc.ocr_text?.slice(0, 200) || '',
    }))

    // 2. Build context from relevant documents
    const documentContext = (relevantDocs || [])
      .map((doc) => {
        const text = doc.ocr_text || doc.summary || ''
        return `--- Dokument: "${doc.title}" ---\n${text.slice(0, 3000)}`
      })
      .join('\n\n')

    // 3. Get conversation history
    let conversationHistory: Array<{ role: string; content: string }> = []
    if (sessionId) {
      const { data: previousMessages } = await supabase
        .from('sb_chat_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(20)

      conversationHistory = previousMessages || []
    }

    // 4. Generate AI response
    const response = await generateResponse(message, documentContext, conversationHistory, sources)

    // 5. Log activity
    await supabase.from('sb_activity_log').insert({
      user_id: userId,
      action: 'chat',
      entity_type: 'chat',
      entity_id: sessionId || null,
      metadata: {
        query: message.slice(0, 200),
        sources_found: sources.length,
      },
    })

    return new Response(
      JSON.stringify({
        response: response.text,
        sources,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Chat processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function extractSearchTerms(message: string): string[] {
  const stopWords = new Set([
    'der', 'die', 'das', 'ein', 'eine', 'ist', 'sind', 'war', 'hat', 'haben',
    'wird', 'werden', 'kann', 'können', 'mein', 'meine', 'meinen', 'meinem',
    'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'und', 'oder', 'aber',
    'in', 'an', 'auf', 'für', 'mit', 'von', 'zu', 'nach', 'bei', 'über',
    'was', 'wie', 'wo', 'wer', 'welche', 'welcher', 'welches',
    'the', 'a', 'an', 'is', 'are', 'was', 'has', 'have', 'will', 'can',
    'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'and', 'or', 'but', 'in', 'on', 'at', 'for', 'with', 'from', 'to',
    'what', 'how', 'where', 'who', 'which',
  ])

  return message
    .toLowerCase()
    .replace(/[?!.,;:'"()]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 8)
}

interface GenerateResult {
  text: string
}

async function generateResponse(
  message: string,
  documentContext: string,
  history: Array<{ role: string; content: string }>,
  sources: Array<{ id: string; title: string; snippet: string }>
): Promise<GenerateResult> {
  const aiEndpoint = Deno.env.get('AI_API_ENDPOINT')

  if (aiEndpoint) {
    try {
      const systemPrompt = buildSystemPrompt(documentContext)
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ]

      const response = await fetch(`${aiEndpoint}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, max_tokens: 2000 }),
      })

      if (response.ok) {
        const result = await response.json()
        return { text: result.response || result.content || '' }
      }
    } catch (error) {
      console.error('AI API error:', error)
    }
  }

  // Fallback: rule-based response using document context
  return generateFallbackResponse(message, documentContext, sources)
}

function buildSystemPrompt(documentContext: string): string {
  return `Du bist SecondBrain, ein intelligenter Assistent für persönliches Dokumentenmanagement.
Du hilfst Nutzern, ihre Dokumente zu verstehen, Informationen zu finden und Zusammenhänge zu erkennen.

Antworte immer auf Deutsch, es sei denn der Nutzer schreibt auf Englisch.
Sei präzise, hilfreich und beziehe dich auf die bereitgestellten Dokumente.
Wenn du eine Information aus einem Dokument zitierst, nenne den Dokumenttitel.
Wenn du keine passenden Informationen findest, sage das ehrlich.

${documentContext ? `\n--- VERFÜGBARE DOKUMENTE ---\n${documentContext}\n--- ENDE DOKUMENTE ---` : '\nEs wurden keine relevanten Dokumente gefunden.'}`
}

function generateFallbackResponse(
  message: string,
  documentContext: string,
  sources: Array<{ id: string; title: string; snippet: string }>
): GenerateResult {
  if (!documentContext.trim()) {
    return {
      text: 'Ich konnte leider keine relevanten Dokumente zu deiner Anfrage finden. Versuche es mit anderen Suchbegriffen oder lade zunächst Dokumente hoch, die ich durchsuchen kann.',
    }
  }

  // Build a contextual response based on found documents
  const docTitles = sources.map((s) => `"${s.title}"`).join(', ')

  if (message.toLowerCase().includes('zusammenfass')) {
    const snippets = sources
      .filter((s) => s.snippet)
      .map((s) => `**${s.title}:** ${s.snippet}`)
      .join('\n\n')

    return {
      text: `Hier ist eine Zusammenfassung der relevanten Dokumente:\n\n${snippets}\n\n_Basierend auf ${sources.length} gefundenen Dokumenten._`,
    }
  }

  if (message.toLowerCase().includes('welche dokument')) {
    return {
      text: `Ich habe folgende relevante Dokumente gefunden: ${docTitles}.\n\nKlicke auf die Quellen unten, um die Details einzusehen.`,
    }
  }

  // Generic response with context
  const mainSnippet = sources[0]?.snippet || ''
  return {
    text: `Basierend auf deinen Dokumenten (${docTitles}) habe ich folgende Informationen gefunden:\n\n${mainSnippet}\n\n_Für eine genauere Analyse empfehle ich, die verlinkten Dokumente direkt einzusehen._`,
  }
}
