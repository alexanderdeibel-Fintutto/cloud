/**
 * Supabase Edge Function: secondbrain-ocr
 *
 * Verarbeitet ein hochgeladenes SecondBrain-Dokument (PDF/Bild):
 *   1. Prüft das monatliche OCR-Kontingent des Nutzers (Tier-Gating)
 *   2. Lädt die Datei aus dem Supabase Storage
 *   3. Extrahiert Text via Anthropic Claude Vision
 *   4. Generiert eine kurze KI-Zusammenfassung
 *   5. Speichert ocr_text, summary, ocr_status='completed' in sb_documents
 *   6. Schreibt Nutzungseintrag in sb_ocr_usage (für Kontingent-Tracking)
 *
 * Request Body:
 *   { documentId: string, storagePath: string, fileType: string, mimeType: string, userId?: string }
 *
 * Tier-Limits:
 *   - Free: 0 Seiten/Monat (OCR gesperrt → 402)
 *   - secondbrain_pro: 100 Seiten/Monat
 *   - -1 = unbegrenzt
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

// OCR-Seitenlimit pro Tier (Seiten/Monat; 0 = gesperrt, -1 = unbegrenzt)
const TIER_OCR_LIMITS: Record<string, number> = {
  "free": 0,
  "personal_pro": 0,
  "secondbrain_pro": 100,
  "internal_admin": -1,
  "internal_tester": -1,
};

// Schätzt die Seitenanzahl eines PDFs anhand der Dateigröße
function estimatePdfPages(bytes: number): number {
  // Durchschnitt: ~100KB pro Seite bei typischen Dokumenten
  return Math.max(1, Math.ceil(bytes / (100 * 1024)));
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const { documentId, storagePath, fileType, mimeType, userId } = body;

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

    // ── Nutzer-ID ermitteln ──────────────────────────────────────────────
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const { data: doc } = await supabase
        .from("sb_documents")
        .select("user_id")
        .eq("id", documentId)
        .single();
      resolvedUserId = doc?.user_id;
    }

    // ── Tier des Nutzers ermitteln ───────────────────────────────────────
    let userTier = "free";
    if (resolvedUserId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tier_id")
        .eq("id", resolvedUserId)
        .single();
      userTier = profile?.tier_id || "free";
    }

    const tierLimit = TIER_OCR_LIMITS[userTier] ?? 0;

    // ── Kontingent-Prüfung ───────────────────────────────────────────────
    if (tierLimit === 0) {
      // Tier hat kein OCR-Kontingent
      await supabase
        .from("sb_documents")
        .update({ ocr_status: "error" })
        .eq("id", documentId);

      return new Response(
        JSON.stringify({
          error: "OCR_TIER_NOT_SUPPORTED",
          tier: userTier,
          message: "Ihr aktuelles Paket enthält keine OCR-Funktion. Bitte upgraden Sie auf SecondBrain Pro.",
          upgrade_url: "/pricing",
        }),
        { status: 402, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (tierLimit > 0 && resolvedUserId) {
      // Aktuellen Monatsverbrauch prüfen
      const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
      const { data: usageSummary } = await supabase
        .from("sb_ocr_usage_summary")
        .select("total_pages_used")
        .eq("user_id", resolvedUserId)
        .eq("month", currentMonth)
        .single();

      const usedPages = usageSummary?.total_pages_used ?? 0;

      if (usedPages >= tierLimit) {
        await supabase
          .from("sb_documents")
          .update({ ocr_status: "error" })
          .eq("id", documentId);

        return new Response(
          JSON.stringify({
            error: "OCR_LIMIT_EXCEEDED",
            used: usedPages,
            limit: tierLimit,
            month: currentMonth,
            message: `Ihr monatliches OCR-Kontingent (${tierLimit} Seiten) ist erschöpft. Nächste Erneuerung am 1. des Folgemonats.`,
          }),
          { status: 402, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Status auf 'processing' setzen ──────────────────────────────────
    await supabase
      .from("sb_documents")
      .update({ ocr_status: "processing" })
      .eq("id", documentId);

    // ── Datei aus Storage laden ──────────────────────────────────────────
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

    // ── Datei verarbeiten ────────────────────────────────────────────────
    return await processFile(
      supabase,
      documentId,
      resolvedUserId,
      fileData,
      fileType,
      mimeType,
      tierLimit
    );

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
  userId: string | undefined,
  fileData: Blob,
  fileType: string,
  mimeType: string,
  tierLimit: number
): Promise<Response> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const resolvedMime = mimeType || getMimeType(fileType);
  const isImage = resolvedMime.startsWith("image/");
  const isPdf = resolvedMime === "application/pdf";
  const isText = resolvedMime === "text/plain" || fileType === "text";

  const arrayBuffer = await fileData.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Größencheck: PDFs > 4MB auf erste ~15 Seiten kürzen
  const MAX_PDF_BYTES = 4 * 1024 * 1024;
  const isTruncated = isPdf && uint8Array.length > MAX_PDF_BYTES;
  const processedArray = isTruncated ? uint8Array.slice(0, MAX_PDF_BYTES) : uint8Array;

  if (isTruncated) {
    console.log(`PDF truncated: ${uint8Array.length} bytes → ${MAX_PDF_BYTES} bytes (~10-15 pages)`);
  }

  // Geschätzte Seitenanzahl für Usage-Tracking
  const estimatedPages = isPdf
    ? estimatePdfPages(processedArray.length)
    : 1; // Bilder zählen als 1 Seite

  // Kontingent-Restprüfung (nach Kürzung)
  if (tierLimit > 0 && userId) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usageSummary } = await supabase
      .from("sb_ocr_usage_summary")
      .select("total_pages_used")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .single();

    const usedPages = usageSummary?.total_pages_used ?? 0;
    const remainingPages = tierLimit - usedPages;

    if (estimatedPages > remainingPages && remainingPages > 0) {
      console.log(`Kontingent knapp: ${estimatedPages} Seiten geschätzt, ${remainingPages} verbleibend — verarbeite trotzdem`);
    }
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
    ocrText = new TextDecoder().decode(processedArray);
    confidence = 1.0;
  } else if (isImage || isPdf) {
    const mediaType = isPdf ? "application/pdf" : resolvedMime as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    let contentBlock: Record<string, unknown>;
    if (isPdf) {
      contentBlock = {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      };
    } else {
      contentBlock = {
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
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
        messages: [{
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
        }],
      }),
    });

    if (!ocrResponse.ok) {
      const errText = await ocrResponse.text();
      throw new Error(`Anthropic OCR error: ${errText}`);
    }

    const ocrResult = await ocrResponse.json();
    ocrText = ocrResult.content?.[0]?.text || "";
    confidence = ocrText.length > 50 ? 0.9 : 0.5;

    // KI-Zusammenfassung
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
          messages: [{
            role: "user",
            content: `Erstelle eine präzise Zusammenfassung (max. 3-4 Sätze) des folgenden Dokuments auf Deutsch. Nenne die wichtigsten Fakten (Datum, Parteien, Beträge, Zweck):\n\n${ocrText.substring(0, 4000)}`,
          }],
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

  // ── Ergebnis in sb_documents speichern ──────────────────────────────────
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

  // ── Usage-Eintrag in sb_ocr_usage schreiben ──────────────────────────────
  if (userId) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { error: usageError } = await supabase
      .from("sb_ocr_usage")
      .insert({
        user_id: userId,
        document_id: documentId,
        pages_used: estimatedPages,
        month: currentMonth,
      });

    if (usageError) {
      // Nicht kritisch — OCR war erfolgreich, nur Tracking schlug fehl
      console.error("Usage tracking error (non-critical):", usageError.message);
    } else {
      console.log(`Usage tracked: ${estimatedPages} pages for user ${userId} in ${currentMonth}`);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      documentId,
      ocrTextLength: ocrText.length,
      hasSummary: !!summary,
      confidence,
      truncated: isTruncated,
      pagesTracked: estimatedPages,
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

function estimatePdfPages(bytes: number): number {
  return Math.max(1, Math.ceil(bytes / (100 * 1024)));
}
