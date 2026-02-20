import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Valid meter types for validation (match database enum)
const VALID_METER_TYPES = ['electricity', 'gas', 'water_cold', 'water_hot', 'heating'];

// Max image size: 10MB
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !userData?.user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Ungültige Anfrage' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { image, meterType } = body;
    
    // Validate image exists and is a string
    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Ungültige Bilddaten' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate base64 image format
    if (!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(image)) {
      return new Response(
        JSON.stringify({ error: 'Nur JPEG, PNG und WebP Bilder werden unterstützt' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check image size (base64 is ~4/3 of original size)
    const base64Data = image.split(',')[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > MAX_IMAGE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: 'Bild zu groß. Maximum 10MB.' }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate meterType if provided
    if (meterType && !VALID_METER_TYPES.includes(meterType)) {
      return new Response(
        JSON.stringify({ error: 'Ungültiger Zählertyp' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Get meter type context
    const meterTypeDescriptions: Record<string, string> = {
      electricity: "Stromzähler (kWh)",
      gas: "Gaszähler (m³)",
      water_cold: "Kaltwasserzähler (m³)",
      water_hot: "Warmwasserzähler (m³)",
      heating: "Heizungszähler (kWh)",
    };
    
    const meterContext = meterType && meterTypeDescriptions[meterType] 
      ? `Dies ist ein ${meterTypeDescriptions[meterType]}.` 
      : "Dies ist ein Verbrauchszähler.";

    const systemPrompt = `Du bist ein OCR-Spezialist für die Erkennung von Zählerständen. ${meterContext}

AUFGABE:
Analysiere das Bild und extrahiere den aktuellen Zählerstand.

REGELN:
1. Extrahiere NUR die Hauptanzeige des Zählers (die großen Zahlen)
2. Ignoriere Nachkommastellen in roter Farbe oder hinter einem Komma/Punkt (oft für Zehntel-Einheiten)
3. Gib den Wert als Ganzzahl zurück
4. Wenn du unsicher bist, schätze die Konfidenz niedriger ein
5. Bei unlesbaren Bildern, gib null zurück

WICHTIG: Antworte NUR mit einem JSON-Objekt im Format:
{"value": <zahl>, "confidence": <0-100>}

Beispiel für einen Zähler mit Anzeige "12345.6":
{"value": 12345, "confidence": 92}`;

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
                image_url: { url: image },
              },
              {
                type: "text",
                text: "Bitte lies den Zählerstand von diesem Bild ab.",
              },
            ],
          },
        ],
        max_tokens: 200,
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
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Guthaben aufgebraucht. Bitte laden Sie Ihr Konto auf." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Parse the JSON response
    let result;
    try {
      // Extract JSON from the response (in case there's extra text)
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

    if (result.value === null || result.value === undefined) {
      return new Response(
        JSON.stringify({ error: "Zählerstand konnte nicht erkannt werden" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        value: Number(result.value),
        confidence: Number(result.confidence) || 85,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Log detailed error server-side only
    console.error("OCR error:", error);
    // Return generic error to client
    return new Response(
      JSON.stringify({ error: "Die Verarbeitung ist fehlgeschlagen. Bitte versuchen Sie es erneut." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
