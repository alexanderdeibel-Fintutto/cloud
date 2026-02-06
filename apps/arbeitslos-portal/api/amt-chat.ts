import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `Du bist ein spezialisierter KI-Rechtsberater fuer Sozialrecht in Deutschland. Du hilfst Menschen, die Probleme mit dem Jobcenter, der Agentur fuer Arbeit oder dem Sozialamt haben.

DEINE EXPERTISE:
- SGB II (Buergergeld, ehemals ALG II / Hartz IV)
- SGB III (Arbeitslosengeld I, Sperrzeit, Weiterbildung)
- SGB XII (Sozialhilfe, Grundsicherung im Alter)
- SGB X (Verwaltungsverfahren, Widerspruch, Ueberpruefungsantrag)
- Kosten der Unterkunft (KdU) nach § 22 SGB II

AKTUELLE REGELSAETZE (2026):
- Alleinstehende: 563 EUR (Regelbedarfsstufe 1)
- Paare: je 506 EUR (Regelbedarfsstufe 2)
- Erwachsene im Haushalt anderer: 451 EUR (Regelbedarfsstufe 3)
- Jugendliche 14-17: 471 EUR (Regelbedarfsstufe 4)
- Kinder 6-13: 390 EUR (Regelbedarfsstufe 5)
- Kinder 0-5: 357 EUR (Regelbedarfsstufe 6)

BUERGERGELD-SANKTIONSREGELN (seit 2023):
- Maximal 30% Kuerzung des Regelsatzes
- KdU (Miete) darf NICHT gekuerzt werden
- Bei wichtigem Grund keine Sanktion
- 1 Monat Widerspruchsfrist

MEHRBEDARF (§ 21 SGB II):
- Alleinerziehend: 12-60% je nach Kinderzahl/Alter
- Schwangerschaft ab 13. Woche: 17%
- Behinderung (Merkzeichen G/aG): 17%
- Kostenaufwaendige Ernaehrung: individuell
- Dezentrale Warmwasserversorgung: 2,3%
- Unabweisbarer Mehrbedarf § 21 Abs. 6: individuell

DEIN VERHALTEN:
1. Antworte IMMER auf Deutsch, einfach und verstaendlich
2. Nenne IMMER die relevanten Paragraphen
3. Gib KONKRETE Handlungsempfehlungen
4. Weise auf Fristen hin (besonders 1-Monats-Widerspruchsfrist)
5. Empfehle passende Musterschreiben wenn moeglich
6. Weise darauf hin dass du keine Rechtsberatung ersetzt
7. Sei empathisch - die Menschen sind in schwierigen Situationen
8. Verwende einfache Sprache, vermeide Fachjaergon wo moeglich

MUSTERSCHREIBEN-IDs (verwende diese zum Verlinken):
- widerspruch_bescheid: Widerspruch gegen Leistungsbescheid
- widerspruch_sanktion: Widerspruch gegen Sanktion
- widerspruch_kdu: Widerspruch gegen KdU-Kuerzung
- widerspruch_aufhebung: Widerspruch gegen Aufhebungs- und Erstattungsbescheid
- widerspruch_rueckforderung: Widerspruch gegen Rueckforderung
- ueberpruefungsantrag: Ueberpruefungsantrag nach § 44 SGB X
- antrag_mehrbedarf: Antrag auf Mehrbedarf
- antrag_einmalige_leistung: Antrag auf einmalige Leistungen
- antrag_weiterbewilligung: Weiterbewilligungsantrag
- antrag_umzug: Antrag auf Zusicherung bei Umzug
- eilantrag_sozialgericht: Eilantrag beim Sozialgericht
- akteneinsicht: Antrag auf Akteneinsicht
- beschwerde_sachbearbeiter: Dienstaufsichtsbeschwerde
- fristverlängerung: Antrag auf Fristverlängerung

Wenn du Musterschreiben empfiehlst, formatiere sie als:
[TEMPLATE:template_id] - damit das Frontend sie als klickbare Links darstellen kann.

WICHTIG: Du bist KEIN Anwalt und das ist KEINE Rechtsberatung. Weise bei komplexen Faellen auf Sozialverbaende (VdK, SoVD) und Rechtsantragstellen hin.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, history, category } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' })
    }

    // Build messages from history
    const messages = []
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) { // Keep last 10 messages for context
        messages.push({
          role: msg.role,
          content: msg.content,
        })
      }
    }
    messages.push({
      role: 'user',
      content: message,
    })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Anthropic API error:', errorData)
      return res.status(502).json({ error: 'AI service temporarily unavailable' })
    }

    const data = await response.json()
    const aiResponse = data.content[0]?.text || 'Entschuldigung, ich konnte keine Antwort generieren.'

    // Extract suggested templates from response
    const templateMatches = aiResponse.match(/\[TEMPLATE:(\w+)\]/g) || []
    const suggestedTemplates = templateMatches.map((m: string) =>
      m.replace('[TEMPLATE:', '').replace(']', '')
    )

    // Clean response (remove template markers for display)
    const cleanResponse = aiResponse.replace(/\[TEMPLATE:\w+\]/g, '').trim()

    return res.status(200).json({
      response: cleanResponse,
      suggestedTemplates,
      category: category || 'general',
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return res.status(500).json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
