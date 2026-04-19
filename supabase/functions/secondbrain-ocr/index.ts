/**
 * Supabase Edge Function: secondbrain-ocr
 *
 * Verarbeitet ein hochgeladenes SecondBrain-Dokument (PDF/Bild):
 *   1. Lädt die Datei aus dem Supabase Storage (secondbrain-documents)
 *   2. Extrahiert Text via OpenAI GPT-4o Vision (für Bilder/PDFs)
 *   3. Generiert eine kurze KI-Zusammenfassung
 *   4. Speichert ocr_text, summary, ocr_status='completed' in sb_documents
 *
 * Request Body:
 *   { documentId: string, storagePath: string, fileType: string, mimeType: string }
 *
 * SETUP:
 *   supabase functions deploy secondbrain-ocr
 *   supabase secrets set OPENAI_API_KEY=sk-...
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { documentId, storagePath, fileType, mimeType } = await req.json();

    if (!documentId || !storagePath) {
      return new Response(
        JSON.stringify({ error: "documentId and storagePath are required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Supabase Admin Client (Service Role)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Status auf 'processing' setzen
    await supabase
      .from("sb_documents")
      .update({ ocr_status: "processing" })
      .eq("id", documentId);

    // Datei aus Storage laden – versuche mehrere Buckets und Pfad-Formate
    const bucketsToTry = ["secondbrain-documents", "secondbrain-docs", "email-attachments", "my-docs"];
    
    // Pfad-Varianten: original, ohne user_id prefix, email/ prefix
    const pathVariants = [storagePath];
    // Wenn Pfad mit UUID/email/... beginnt, auch ohne UUID versuchen
    const emailMatch = storagePath.match(/^[0-9a-f-]{36}\/(.+)$/);
    if (emailMatch) pathVariants.push(emailMatch[1]);
    // Wenn Pfad 2026-04/filename enthält, auch email/ prefix versuchen
    const dateMatch = storagePath.match(/email\/\d{4}-\d{2}\/([0-9a-f]+)_(.+)$/);
    if (dateMatch) {
      const msgPrefix = dateMatch[1];
      const filename = dateMatch[2];
      // Suche nach email/{msg_prefix_folder}/{filename}
      pathVariants.push(`email/${msgPrefix}_${filename}`);
    }

    let fileData: Blob | null = null;
    let lastError = "";
    
    outerLoop:
    for (const bucket of bucketsToTry) {
      for (const path of pathVariants) {
        const { data, error } = await supabase.storage.from(bucket).download(path);
        if (!error && data) {
          fileData = data;
          break outerLoop;
        }
        lastError = error?.message || "unknown";
      }
    }

    if (!fileData) {
      throw new Error(`Storage error: Object not found in any bucket. Last error: ${lastError}. Tried paths: ${pathVariants.join(", ")}`);
    }

    return await processFile(supabase, documentId, fileData, fileType, mimeType);

  } catch (error) {
    console.error("secondbrain-ocr error:", error);

    // Fehler in DB speichern
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      // documentId aus dem Request extrahieren (best effort)
      const body = await req.json().catch(() => ({}));
      if (body.documentId) {
        await supabase
          .from("sb_documents")
          .update({ ocr_status: "error" })
          .eq("id", body.documentId);
      }
    } catch (_) { /* ignore */ }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});

async function processFile(
  supabase: ReturnType<typeof createClient>,
  documentId: string,
  fileData: Blob,
  fileType: string,
  mimeType: string
): Promise<Response> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  // Datei als Base64 kodieren
  const arrayBuffer = await fileData.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);

  // Bestimme den richtigen MIME-Type für OpenAI
  const resolvedMime = mimeType || getMimeType(fileType);
  const isImage = resolvedMime.startsWith("image/");
  const isPdf = resolvedMime === "application/pdf";
  const isText = resolvedMime === "text/plain" || fileType === "text";

  let ocrText = "";
  let summary = "";
  let confidence = 0.0;

  if (isText) {
    // Reiner Text – direkt dekodieren
    ocrText = new TextDecoder().decode(uint8Array);
    confidence = 1.0;
  } else if (isImage || isPdf) {
    // OpenAI Vision API für Bilder und PDFs
    const imageMediaType = isPdf ? "application/pdf" : resolvedMime;

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extrahiere den vollständigen Text aus diesem Dokument. 
Gib NUR den extrahierten Text zurück, ohne Erklärungen oder Formatierungen.
Falls es ein strukturiertes Dokument ist (Rechnung, Brief, Bescheid), behalte die Struktur bei.
Antworte auf Deutsch.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${imageMediaType};base64,${base64}`,
              detail: "high",
            },
          },
        ],
      },
    ];

    const ocrResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 4000,
        temperature: 0,
      }),
    });

    if (!ocrResponse.ok) {
      const errText = await ocrResponse.text();
      throw new Error(`OpenAI OCR error: ${errText}`);
    }

    const ocrResult = await ocrResponse.json();
    ocrText = ocrResult.choices?.[0]?.message?.content || "";
    confidence = ocrText.length > 50 ? 0.9 : 0.5;

    // KI-Zusammenfassung generieren
    if (ocrText.length > 100) {
      const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Erstelle eine kurze Zusammenfassung (max. 3 Sätze) des folgenden Dokuments auf Deutsch:\n\n${ocrText.substring(0, 3000)}`,
            },
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (summaryResponse.ok) {
        const summaryResult = await summaryResponse.json();
        summary = summaryResult.choices?.[0]?.message?.content || "";
      }
    }
  } else {
    // Unbekannter Typ – als Fehler markieren
    await supabase
      .from("sb_documents")
      .update({ ocr_status: "error" })
      .eq("id", documentId);

    return new Response(
      JSON.stringify({ success: false, error: `Unsupported file type: ${fileType}` }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // Ergebnis in DB speichern
  const { error: updateError } = await supabase
    .from("sb_documents")
    .update({
      ocr_text: ocrText,
      summary: summary || null,
      ocr_status: "completed",
      ocr_confidence: confidence,
    })
    .eq("id", documentId);

  if (updateError) {
    throw new Error(`DB update error: ${updateError.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      documentId,
      ocrTextLength: ocrText.length,
      hasSummary: !!summary,
      confidence,
    }),
    { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}

function getMimeType(fileType: string): string {
  const map: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    txt: "text/plain",
    text: "text/plain",
  };
  return map[fileType?.toLowerCase()] || "application/octet-stream";
}
