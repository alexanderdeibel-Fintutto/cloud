import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SCAN_SYSTEM_PROMPT = `Du bist der BescheidBoxer BescheidScan-Analyst. Du analysierst Buergergeld-Bescheide (SGB II) auf Fehler.

DEINE AUFGABE:
Analysiere den folgenden Bescheid-Text und pruefe auf haeufige Fehler:

1. REGELSATZ: Stimmt die Regelbedarfsstufe? (2025: RS1=563, RS2=506, RS3=451, RS4=471, RS5=390, RS6=357)
2. MEHRBEDARF: Wurden alle Mehrbedarfe beruecksichtigt? (Schwangerschaft 17%, Alleinerziehend 12-60%, Behinderung 35%, Ernaehrung)
3. KDU: Sind die Kosten der Unterkunft vollstaendig anerkannt? Wurde unrechtmaessig gekuerzt?
4. HEIZKOSTEN: Werden Heizkosten separat und vollstaendig uebernommen?
5. EINKOMMENSANRECHNUNG: Wurden Freibetraege korrekt berechnet? (100 EUR Grundfreibetrag, Staffelung)
6. KINDERGELD: Wird Kindergeld korrekt angerechnet? (250 EUR ab 2025)
7. FRISTEN: Ist eine Frist angegeben? Wann laeuft sie ab?
8. BEWILLIGUNGSZEITRAUM: Ist er korrekt (max. 12 Monate)?

AUSGABEFORMAT (JSON):
{
  "zusammenfassung": "Kurze Zusammenfassung des Bescheids",
  "fehler": [
    {
      "kategorie": "regelsatz|mehrbedarf|kdu|heizkosten|einkommen|kindergeld|sonstiges",
      "schwere": "kritisch|warnung|hinweis",
      "beschreibung": "Was ist falsch",
      "paragraph": "Relevanter Paragraph",
      "potenziellerBetrag": 0,
      "empfehlung": "Was der Nutzer tun sollte"
    }
  ],
  "korrekt": ["Liste der korrekt berechneten Posten"],
  "gesamtPotenzial": 0,
  "dringlichkeit": "hoch|mittel|niedrig",
  "naechsteSchritte": ["Empfohlene naechste Schritte"],
  "fristende": "YYYY-MM-DD oder null"
}`

const OCR_SYSTEM_PROMPT = `Du bist ein OCR-Spezialist fuer deutsche Behoerdenbriefe, insbesondere Buergergeld-Bescheide (SGB II).

DEINE AUFGABE:
Lies den Text auf dem Bild/Dokument so genau wie moeglich ab. Gib den vollstaendigen Text wieder, einschliesslich:
- Aktenzeichen und Geschaeftszeichen
- Betraege und Berechnungen
- Paragraphen und Rechtsgrundlagen
- Bewilligungszeitraum
- Alle Posten (Regelbedarf, KdU, Mehrbedarfe etc.)
- Rechtsbehelfsbelehrung und Fristen

Gib NUR den erkannten Text zurueck, ohne Kommentare oder Interpretation. Behalte die Struktur bei (Absaetze, Aufzaehlungen etc.).`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const contentType = req.headers.get('content-type') || ''
    let action: string
    let bescheidText: string | undefined
    let imageData: string | undefined
    let mediaType: string | undefined

    // Support both JSON and FormData
    if (contentType.includes('application/json')) {
      const body = await req.json()
      action = body.action || 'analyze'
      bescheidText = body.bescheidText
      imageData = body.imageData
      mediaType = body.mediaType
    } else if (contentType.includes('multipart/form-data')) {
      // Legacy FormData support
      const formData = await req.formData()
      action = (formData.get('action') as string) || 'analyze'
      const file = formData.get('file') as File | null

      if (file) {
        const arrayBuffer = await file.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        imageData = `data:${file.type};base64,${base64}`
        mediaType = file.type
        action = 'ocr'
      }

      bescheidText = formData.get('bescheidText') as string | null || undefined
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported content type' }), {
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

    // ACTION: OCR - Extract text from image using Vision API
    if (action === 'ocr') {
      if (!imageData) {
        return new Response(JSON.stringify({ error: 'Image data is required for OCR' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Extract base64 data from data URL
      const base64Match = imageData.match(/^data:([^;]+);base64,(.+)$/)
      if (!base64Match) {
        return new Response(JSON.stringify({ error: 'Invalid image data format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const detectedMediaType = base64Match[1]
      const base64Data = base64Match[2]

      // Map media types to what Claude Vision API accepts
      let visionMediaType = detectedMediaType
      if (visionMediaType === 'image/heic' || visionMediaType === 'image/heif') {
        visionMediaType = 'image/jpeg' // HEIC not directly supported, would need conversion
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          system: OCR_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: visionMediaType,
                    data: base64Data,
                  },
                },
                {
                  type: 'text',
                  text: 'Lies den gesamten Text auf diesem Bescheid-Dokument ab. Gib den vollstaendigen Text strukturiert wieder.',
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error('Anthropic Vision API error:', response.status, errorBody)
        return new Response(JSON.stringify({ error: 'OCR service temporarily unavailable' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const data = await response.json()
      const extractedText = data.content?.[0]?.text || ''

      return new Response(JSON.stringify({ extractedText, usage: data.usage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ACTION: ANALYZE - Analyze Bescheid text for errors
    if (action === 'analyze') {
      if (!bescheidText) {
        return new Response(JSON.stringify({ error: 'Bescheid text is required for analysis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          system: SCAN_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Analysiere diesen Buergergeld-Bescheid auf Fehler:\n\n${bescheidText}`,
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error('Anthropic API error:', response.status, errorBody)
        return new Response(JSON.stringify({ error: 'AI analysis temporarily unavailable' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const data = await response.json()
      const rawReply = data.content?.[0]?.text || ''

      // Try to parse JSON from the response
      let analysis
      try {
        const jsonMatch = rawReply.match(/\{[\s\S]*\}/)
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { zusammenfassung: rawReply, fehler: [], korrekt: [], gesamtPotenzial: 0, dringlichkeit: 'niedrig', naechsteSchritte: [] }
      } catch {
        analysis = { zusammenfassung: rawReply, fehler: [], korrekt: [], gesamtPotenzial: 0, dringlichkeit: 'niedrig', naechsteSchritte: [] }
      }

      return new Response(JSON.stringify({ analysis, usage: data.usage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Scan function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
