/**
 * Supabase Edge Function: ocr-meter
 *
 * Liest einen Zählerstand aus einem Bild via GPT-4o Vision.
 * Genutzt von: Ablesung App (ReadMeter.tsx)
 *
 * Request Body:
 *   { image: string (base64), meterType?: string }
 *
 * Response:
 *   { value: number | null, unit: string, confidence: number, rawText: string }
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

    const { image, meterType = "Strom" } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "image (base64) is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Du bist ein Zählerstand-Erkennungssystem für ${meterType}-Zähler.
Analysiere das Bild und extrahiere den aktuellen Zählerstand.
Antworte AUSSCHLIESSLICH im JSON-Format:
{
  "value": Zahl (der abgelesene Wert, z.B. 12345.678) oder null wenn nicht erkennbar,
  "unit": "kWh" | "m³" | "m3" | "kW",
  "confidence": Zahl zwischen 0 und 1,
  "rawText": "Der erkannte Text auf dem Display"
}`;

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
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}`, detail: "high" } },
            ],
          },
        ],
        max_tokens: 256,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const openaiData = await openaiRes.json();
    const result = JSON.parse(openaiData.choices[0]?.message?.content || "{}");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("ocr-meter error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
