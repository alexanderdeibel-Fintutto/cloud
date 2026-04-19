/**
 * Supabase Edge Function: analyze-receipt
 *
 * Analysiert einen Kassenbon/Quittung via GPT-4o Vision.
 * Genutzt von: Vermietify BulkUpload.tsx
 *
 * Request Body:
 *   { image: string (base64), mimeType?: string }
 *
 * Response:
 *   { date, amount, vendor, category, description, taxAmount }
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

    const { image, mimeType = "image/jpeg" } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "image (base64) is required" }), {
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
                text: `Analysiere diesen Kassenbon/diese Quittung für die Immobilienverwaltung.
Antworte AUSSCHLIESSLICH im JSON-Format:
{
  "date": "YYYY-MM-DD oder null",
  "amount": Gesamtbetrag in Cent als Zahl oder null,
  "taxAmount": MwSt-Betrag in Cent als Zahl oder null,
  "vendor": "Händler/Aussteller oder null",
  "category": "repair|insurance|utilities|administration|cleaning|other",
  "description": "Kurze Beschreibung der Ausgabe"
}`,
              },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}`, detail: "high" } },
            ],
          },
        ],
        max_tokens: 512,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiRes.ok) throw new Error(`OpenAI error: ${await openaiRes.text()}`);
    const data = await openaiRes.json();
    const result = JSON.parse(data.choices[0]?.message?.content || "{}");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("analyze-receipt error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
