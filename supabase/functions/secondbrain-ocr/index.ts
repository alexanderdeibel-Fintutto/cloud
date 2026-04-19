/**
 * Supabase Edge Function: secondbrain-ocr
 *
 * Verarbeitet ein hochgeladenes SecondBrain-Dokument (PDF/Bild):
 *   1. Lädt die Datei aus dem Supabase Storage
 *   2. Extrahiert Text via Anthropic Claude (claude-3-5-sonnet) Vision
 *   3. Generiert eine kurze KI-Zusammenfassung
 *   4. Speichert ocr_text, summary, ocr_status='completed' in sb_documents
 *
 * Request Body:
 *   { documentId: string, storagePath: string, fileType: string, mimeType: string }
 *
 * SETUP:
 *   supabase functions deploy secondbrain-ocr
 *   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
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
    
    const pathVariants = [storagePath];
    const emailMatch = storagePath.match(/^[0-9a-f-]{36}\/(.+)$/);
    if (emailMatch) pathVariants.push(emailMatch[1]);

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

    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
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
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  // MIME-Typ zuerst bestimmen (wird für Größencheck benötigt)
  const resolvedMime = mimeType || getMimeType(fileType);
  const isImage = resolvedMime.startsWith("image/");
  const isPdf = resolvedMime === "application/pdf";
  const isText = resolvedMime === "text/plain" || fileType === "text";

  // Datei als Base64 kodieren
  const arrayBuffer = await fileData.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Größencheck: Supabase Free Tier hat ~150MB RAM-Limit für Edge Functions.
  // PDFs über 4MB werden auf die ersten 4MB gekürzt um WORKER_RESOURCE_LIMIT zu vermeiden.
  // Das entspricht typischerweise ca. 10-15 Seiten.
  const MAX_PDF_BYTES = 4 * 1024 * 1024; // 4 MB
  const isTruncated = isPdf && uint8Array.length > MAX_PDF_BYTES;
  const processedArray = isTruncated ? uint8Array.slice(0, MAX_PDF_BYTES) : uint8Array;

  if (isTruncated) {
    console.log(`PDF truncated: ${uint8Array.length} bytes -> ${MAX_PDF_BYTES} bytes (first ~10-15 pages only)`);
  }

  let binary = "";
  for (let i = 0; i < processedArray.length; i++) {
    binary += String.fromCharCode(processedArray[i]);
  }
  const base64 = btoa(binary);

  let ocrText = "";
  let summary = "";
  let confidence = 0.0;

  if (isText) {
    // Reiner Text – direkt dekodieren
    ocrText = new TextDecoder().decode(processedArray);
    confidence = 1.0;
  } else if (isImage || isPdf) {
    // Anthropic Claude Vision API
    // Claude unterstützt PDFs direkt als document-type
    const mediaType = isPdf ? "application/pdf" : resolvedMime as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    // Für PDFs: Claude 3.5 Sonnet unterstützt PDF direkt
    // Für Bilder: Standard Vision
    let contentBlock: Record<string, unknown>;
    if (isPdf) {
      contentBlock = {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      };
    } else {
      contentBlock = {
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64,
        },
      };
    }

    const ocrResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              contentBlock,
              {
                type: "text",
                text: `Extrahiere den vollständigen Text aus diesem Dokument. 
Gib NUR den extrahierten Text zurück, ohne Erklärungen oder Formatierungen.
Falls es ein strukturiertes Dokument ist (Rechnung, Brief, Bescheid, Protokoll), behalte die Struktur bei.
Antworte auf Deutsch.`,
              },
            ],
          },
        ],
      }),
    });

    if (!ocrResponse.ok) {
      const errText = await ocrResponse.text();
      throw new Error(`Anthropic OCR error: ${errText}`);
    }

    const ocrResult = await ocrResponse.json();
    ocrText = ocrResult.content?.[0]?.text || "";
    confidence = ocrText.length > 50 ? 0.9 : 0.5;

    // KI-Zusammenfassung generieren
    if (ocrText.length > 100) {
      const summaryResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: `Erstelle eine präzise Zusammenfassung (max. 3-4 Sätze) des folgenden Dokuments auf Deutsch. Nenne die wichtigsten Fakten (Datum, Parteien, Beträge, Zweck):\n\n${ocrText.substring(0, 4000)}`,
            },
          ],
        }),
      });

      if (summaryResponse.ok) {
        const summaryResult = await summaryResponse.json();
        summary = summaryResult.content?.[0]?.text || "";
      }
    }
  } else {
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
      truncated: isTruncated,
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
