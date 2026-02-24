import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Ungültige Anfrage' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { file } = body;

    if (!file || typeof file !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Ungültige Datei' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validFormats = /^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,/;
    if (!validFormats.test(file)) {
      return new Response(
        JSON.stringify({ error: 'Nur JPEG, PNG, WebP und PDF werden unterstützt' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const base64Data = file.split(',')[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: 'Datei zu groß. Maximum 10MB.' }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'Die Verarbeitung ist fehlgeschlagen. Bitte versuchen Sie es später erneut.' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isPdf = file.startsWith('data:application/pdf');

    const systemPrompt = `Du bist ein OCR-Spezialist für die Analyse von Zähler-Dokumenten und Fotos.

AUFGABE:
Analysiere das ${isPdf ? 'Dokument' : 'Bild'} und extrahiere:
1. Die Zählernummer (falls vorhanden)
2. Alle Zählerstände/Ablesungen (falls vorhanden)
3. Erkenne ZÄHLERWECHSEL anhand von plötzlichen Wert-Sprüngen nach unten

ZÄHLERNUMMER finden:
- Auf dem Zähler selbst (Typenschild, Barcode-Bereich)
- In Verträgen ("Zählernummer", "Zähler-Nr.", "Meter ID", "Gerätenummer")
- Auf Ablesebelegen und Rechnungen
- Typische Formate: 12345678, DE-12345678, E-1234567, 1-234-567-890

ZÄHLERSTÄNDE finden:
- Tabellarische Auflistungen mit Datum und Wert
- Historische Verbrauchsdaten
- Ableseprotokolle mit Ständen

ZÄHLERWECHSEL erkennen:
- Wenn in einer chronologisch sortierten Liste der Zählerstand plötzlich DEUTLICH SINKT (z.B. von 4100 auf 238, oder von 6842 auf 108), deutet das auf einen Zählerwechsel hin
- Der neue Zähler startet bei einem niedrigeren Wert
- Manchmal gibt es Hinweise wie "Getauscht", "Wechsel", "Austausch", "neu" in einer Notiz-Spalte
- Gruppiere die Ablesungen nach Zähler-Ären (jede Ära = ein physischer Zähler)

REGELN:
1. Unterscheide klar zwischen Zählernummer (Geräte-ID) und Zählerstand (Verbrauchswert)
2. Ignoriere Kundennummern und Vertragsnummern
3. Gib die Zählernummer exakt wie gefunden zurück
4. Zählerstände: Datum im Format YYYY-MM-DD, Wert als Zahl
5. Sortiere Ablesungen chronologisch innerhalb jeder Ära (älteste zuerst)

WICHTIG: Antworte NUR mit einem JSON-Objekt im Format:
{
  "meterNumber": "<nummer>" oder null,
  "confidence": <0-100>,
  "meterName": "<bezeichnung des zählers falls erkennbar>" oder null,
  "meterSwapDetected": true/false,
  "eras": [
    {
      "label": "<auto-generierter Name, z.B. 'Zähler 1 (2018-2019)'>",
      "readings": [{"date": "YYYY-MM-DD", "value": 12345.67}],
      "swapNote": "<Hinweis falls vorhanden, z.B. 'Getauscht'>" oder null
    }
  ]
}

Wenn KEIN Zählerwechsel erkannt wird, setze meterSwapDetected=false und erstelle nur eine einzige Ära mit allen Ablesungen.
Wenn ein Zählerwechsel erkannt wird, erstelle mehrere Ären. Die LETZTE Ära ist der aktuelle Zähler.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: file },
              },
              {
                type: "text",
                text: "Analysiere dieses Dokument/Bild. Extrahiere Zählernummer, Zählerstände UND erkenne Zählerwechsel.",
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit erreicht. Bitte versuchen Sie es später erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Die Verarbeitung ist fehlgeschlagen. Bitte versuchen Sie es erneut." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No response content from AI");
      return new Response(
        JSON.stringify({ error: "Die Verarbeitung ist fehlgeschlagen. Bitte versuchen Sie es erneut." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse OCR response:", content);
      return new Response(
        JSON.stringify({ error: "Die Verarbeitung ist fehlgeschlagen. Bitte versuchen Sie es erneut." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize eras
    const eras = Array.isArray(result.eras)
      ? result.eras.map((era: { label?: string; readings?: Array<{ date?: string; value?: number }>; swapNote?: string }) => ({
          label: era.label ? String(era.label) : 'Unbekannter Zeitraum',
          readings: Array.isArray(era.readings)
            ? era.readings
                .filter((r) => r.date && r.value !== undefined)
                .map((r) => ({
                  date: String(r.date),
                  value: Number(r.value),
                }))
            : [],
          swapNote: era.swapNote ? String(era.swapNote) : null,
        }))
      : [];

    // Build flat readings list for backward compatibility
    const allReadings = eras.flatMap((era: { readings: Array<{ date: string; value: number }> }) => era.readings);

    return new Response(
      JSON.stringify({
        meterNumber: result.meterNumber ? String(result.meterNumber).trim() : null,
        confidence: Number(result.confidence) || 0,
        readings: allReadings,
        meterName: result.meterName ? String(result.meterName).trim() : null,
        meterSwapDetected: Boolean(result.meterSwapDetected),
        eras,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("OCR meter number error:", error);
    return new Response(
      JSON.stringify({ error: "Die Verarbeitung ist fehlgeschlagen. Bitte versuchen Sie es erneut." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
