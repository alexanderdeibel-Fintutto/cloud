/**
 * Supabase Edge Function: amt-scan
 *
 * Verarbeitet Behördenbescheide via OCR und KI-Analyse.
 * Genutzt von: Arbeitslos-Portal (BescheidScanPage.tsx)
 *
 * Request Body (action=ocr):
 *   { action: "ocr", imageData: string (base64), mediaType: string, pageNumber: number, totalPages: number }
 *
 * Request Body (action=analyze):
 *   { action: "analyze", text: string, bescheidType?: string }
 *
 * Response (ocr):
 *   { text: string }
 *
 * Response (analyze):
 *   { type, deadline, amount, summary, recommendations, riskLevel }
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY is not configured");

    const body = await req.json();
    const { action } = body;

    if (action === "ocr") {
      // OCR: Text aus Bild extrahieren
      const { imageData, mediaType, pageNumber, totalPages } = body;
      if (!imageData) {
        return new Response(JSON.stringify({ error: "imageData is required for ocr action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extrahiere den vollständigen Text aus diesem Behördendokument (Seite ${pageNumber} von ${totalPages}). 
Gib den Text exakt so wieder, wie er auf dem Dokument steht, inklusive aller Zahlen, Daten und Beträge.
Antworte NUR mit dem extrahierten Text, ohne Kommentare.`,
                },
                { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageData}`, detail: "high" } },
              ],
            },
          ],
          max_tokens: 2048,
        }),
      });

      if (!openaiRes.ok) throw new Error(`OpenAI OCR error: ${await openaiRes.text()}`);
      const data = await openaiRes.json();
      const text = data.choices[0]?.message?.content || "";

      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "analyze") {
      // Analyse: Bescheid-Typ, Fristen und Empfehlungen ermitteln
      const { text, bescheidType } = body;
      if (!text) {
        return new Response(JSON.stringify({ error: "text is required for analyze action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Du bist ein Experte für deutsche Behördenbescheide, insbesondere SGB II (Bürgergeld/ALG II).
Analysiere den Bescheid und gib eine strukturierte Einschätzung.
Antworte AUSSCHLIESSLICH im JSON-Format:
{
  "type": "Bescheid-Typ (z.B. Bewilligungsbescheid, Ablehnungsbescheid, Aufhebungsbescheid)",
  "deadline": "Widerspruchsfrist als YYYY-MM-DD oder null",
  "amount": "Bewilligter Betrag als String oder null",
  "summary": "Kurze Zusammenfassung in 2-3 Sätzen",
  "recommendations": ["Empfehlung 1", "Empfehlung 2"],
  "riskLevel": "low" | "medium" | "high"
}`,
            },
            { role: "user", content: text },
          ],
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      });

      if (!openaiRes.ok) throw new Error(`OpenAI analyze error: ${await openaiRes.text()}`);
      const data = await openaiRes.json();
      const result = JSON.parse(data.choices[0]?.message?.content || "{}");

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use 'ocr' or 'analyze'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    console.error("amt-scan error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
