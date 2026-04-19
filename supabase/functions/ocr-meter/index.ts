/**
 * Supabase Edge Function: ocr-meter
 *
 * Liest den Zählerstand aus einem Bild via Claude Haiku Vision.
 * Modell: claude-haiku-3-5-20241022 (günstigstes Claude-Modell mit Vision)
 * Kosten: ~$0.00025/Aufruf vs. $0.007 mit gpt-4o → 96% Einsparung
 *
 * Genutzt von: Ablesung App (ReadMeter.tsx)
 *
 * Request Body:
 *   { image: string (base64), meterType?: string, imageHash?: string }
 *
 * Response:
 *   { value: number|null, unit: string, confidence: number, rawText: string, cached?: boolean }
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
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY is not configured");

    const { image, meterType = "Strom", imageHash } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "image (base64) is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Cache-Check ──────────────────────────────────────────────────────
    if (imageHash) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        const cacheRes = await fetch(
          `${supabaseUrl}/rest/v1/ocr_cache?image_hash=eq.${imageHash}&function_name=eq.ocr-meter&select=result&limit=1`,
          { headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` } }
        );
        if (cacheRes.ok) {
          const cached = await cacheRes.json();
          if (cached.length > 0) {
            console.log("Cache-Hit für imageHash:", imageHash);
            return new Response(JSON.stringify({ ...cached[0].result, cached: true }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
    }

    // ── Claude Haiku Vision ──────────────────────────────────────────────
    const prompt = `Du bist ein Zählerstand-Erkennungssystem für ${meterType}-Zähler.
Analysiere das Bild und extrahiere den aktuellen Zählerstand.
Antworte AUSSCHLIESSLICH im JSON-Format ohne Markdown-Blöcke:
{
  "value": Zahl (der abgelesene Wert, z.B. 12345.678) oder null wenn nicht erkennbar,
  "unit": "kWh" | "m³" | "m3" | "kW",
  "confidence": Zahl zwischen 0 und 1,
  "rawText": "Der erkannte Text auf dem Display"
}`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-3-5-20241022",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: image },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      throw new Error(`Anthropic error: ${err}`);
    }

    const anthropicData = await anthropicRes.json();
    const rawContent = anthropicData.content?.[0]?.text || "{}";
    const jsonStr = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const result = JSON.parse(jsonStr);

    // ── Ergebnis cachen ──────────────────────────────────────────────────
    if (imageHash) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        await fetch(`${supabaseUrl}/rest/v1/ocr_cache`, {
          method: "POST",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates",
          },
          body: JSON.stringify({
            image_hash: imageHash,
            function_name: "ocr-meter",
            result,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        });
      }
    }

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
