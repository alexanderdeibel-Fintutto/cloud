/**
 * Supabase Edge Function: text-to-speech
 *
 * Konvertiert Text zu Sprache via ElevenLabs API mit Caching in Supabase Storage.
 * Häufig vorgelesene Texte (Onboarding, Standard-Erklärungen) werden gecacht,
 * um ElevenLabs-Kosten zu minimieren.
 *
 * Cache-Strategie:
 *   1. Hash aus (text + voice_id) berechnen
 *   2. In tts_cache Tabelle nachschlagen
 *   3. Bei Treffer: Audio-URL aus Storage zurückgeben
 *   4. Bei Miss: ElevenLabs API aufrufen, Audio in Storage speichern, Cache-Eintrag anlegen
 *
 * Request Body:
 *   { text: string, voice_id?: string, model_id?: string }
 *
 * Response:
 *   { audioUrl: string, cached: boolean, durationMs?: number }
 */

import { checkRateLimit, logApiCall } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY")!;

// Standard-Voice: "Rachel" (natürliche deutsche Stimme)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
// Günstiges Modell: eleven_turbo_v2 (5x günstiger als eleven_multilingual_v2)
const DEFAULT_MODEL = "eleven_turbo_v2";
// Storage Bucket für gecachte Audio-Dateien
const STORAGE_BUCKET = "tts-cache";

/**
 * Berechnet einen SHA-256-Hash für Cache-Key-Generierung.
 */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Lädt Audio-Datei in Supabase Storage hoch.
 */
async function uploadToStorage(
  audioData: ArrayBuffer,
  fileName: string
): Promise<string | null> {
  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${fileName}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "audio/mpeg",
        "x-upsert": "true",
      },
      body: audioData,
    }
  );

  if (!uploadRes.ok) {
    console.error("Storage upload failed:", await uploadRes.text());
    return null;
  }

  // Öffentliche URL zurückgeben
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
}

/**
 * Sucht Cache-Eintrag in tts_cache Tabelle.
 */
async function findCache(cacheKey: string): Promise<string | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/tts_cache?cache_key=eq.${cacheKey}&select=storage_url&limit=1`,
    {
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.length === 0) return null;

  // Cache-Hit: last_used aktualisieren
  await fetch(
    `${SUPABASE_URL}/rest/v1/tts_cache?cache_key=eq.${cacheKey}`,
    {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ last_used: new Date().toISOString(), hit_count: "hit_count + 1" }),
    }
  );

  return data[0].storage_url;
}

/**
 * Speichert Cache-Eintrag in tts_cache Tabelle.
 */
async function saveCache(
  cacheKey: string,
  textHash: string,
  voiceId: string,
  modelId: string,
  storageUrl: string,
  textLength: number
): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/tts_cache`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      cache_key: cacheKey,
      text_hash: textHash,
      voice_id: voiceId,
      model_id: modelId,
      storage_url: storageUrl,
      text_length: textLength,
      hit_count: 0,
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Rate-Limit prüfen
    const rl = await checkRateLimit(req, "text-to-speech");
    if (!rl.allowed) return rl.response!;

    const { text, voice_id, model_id } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "text ist erforderlich" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Text darf maximal 5000 Zeichen lang sein" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const voiceId = voice_id || DEFAULT_VOICE_ID;
    const modelId = model_id || DEFAULT_MODEL;

    // Cache-Key aus Text + Voice + Model generieren
    const cacheInput = `${text.trim()}|${voiceId}|${modelId}`;
    const cacheKey = await sha256(cacheInput);
    const textHash = await sha256(text.trim());

    // Cache-Lookup
    const cachedUrl = await findCache(cacheKey);
    if (cachedUrl) {
      await logApiCall(rl.userId, "text-to-speech", { cached: true });
      return new Response(
        JSON.stringify({
          audioUrl: cachedUrl,
          cached: true,
          durationMs: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ElevenLabs API aufrufen
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API-Key nicht konfiguriert" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      console.error("ElevenLabs error:", ttsRes.status, errText);
      return new Response(
        JSON.stringify({ error: "ElevenLabs API-Fehler", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioData = await ttsRes.arrayBuffer();

    // In Storage hochladen
    const fileName = `${cacheKey}.mp3`;
    const storageUrl = await uploadToStorage(audioData, fileName);

    if (storageUrl) {
      // Cache-Eintrag speichern
      await saveCache(cacheKey, textHash, voiceId, modelId, storageUrl, text.length);
      await logApiCall(rl.userId, "text-to-speech", {
        tokens: text.length, // ElevenLabs rechnet in Zeichen
        costUsd: (text.length / 1000) * 0.00024, // ~$0.24/1000 Zeichen für Turbo
        cached: false,
      });

      return new Response(
        JSON.stringify({
          audioUrl: storageUrl,
          cached: false,
          durationMs: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Storage-Upload fehlgeschlagen: Audio direkt zurückgeben
      await logApiCall(rl.userId, "text-to-speech", {
        tokens: text.length,
        costUsd: (text.length / 1000) * 0.00024,
        cached: false,
      });

      return new Response(audioData, {
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
          "X-Cached": "false",
        },
      });
    }
  } catch (err) {
    console.error("text-to-speech error:", err);
    return new Response(
      JSON.stringify({ error: "Interner Fehler", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
