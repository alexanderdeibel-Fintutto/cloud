/**
 * Supabase Edge Function: analyze-and-suggest-links
 *
 * Analysiert den OCR-Text eines SecondBrain-Dokuments mit Claude (Anthropic) und erkennt
 * automatisch Entitäten aus dem Fintutto-Ökosystem:
 *   - Gebäude (buildings) — via Adresserkennung
 *   - Firmen (biz_clients) — via Firmennamenerkennung
 *   - Mieter (tenants) — via Namenserkennung
 *   - Zähler (meters) — via Zählernummererkennung
 *
 * Speichert Vorschläge in sb_document_suggestions mit Konfidenz-Score (0–1).
 *
 * Request Body:
 *   { document_id: string }
 *
 * Response:
 *   { success: boolean, suggestions: Suggestion[], skipped?: string }
 *
 * SETUP:
 *   supabase functions deploy analyze-and-suggest-links
 *   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS ─────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

// ── Typen ────────────────────────────────────────────────────────────────────

interface SbDocument {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  file_type: string | null;
  ocr_text: string | null;
  summary: string | null;
}

interface EntityCandidate {
  entity_type: "building" | "unit" | "tenant" | "business" | "meter";
  name: string;
  address?: string;
  meter_number?: string;
  confidence: number;
  reason: string;
}

interface Suggestion {
  entity_type: string;
  entity_id: string;
  confidence: number;
  reason: string;
}

// ── System-Prompt für Claude ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `Du bist ein Experte für die Analyse von deutschen Immobilien-, Finanz- und Versorgerdokumenten.
Deine Aufgabe: Extrahiere aus dem Dokumenttext alle Entitäten, die auf konkrete Objekte in einer Immobilienverwaltungssoftware hinweisen könnten.

Erkenne folgende Entitätstypen:
1. GEBÄUDE (building): Vollständige Adressen (Straße + Hausnummer + PLZ + Ort)
2. FIRMA (business): Firmenname, GmbH, AG, KG, Einzelunternehmen, Vermieter-Firmen
3. MIETER (tenant): Personennamen als Mieter, Pächter, Vertragspartner
4. ZÄHLER (meter): Zählernummern (typisch: 8-12 stellige Nummern), Zählertypen (Strom, Gas, Wasser)

Antworte AUSSCHLIESSLICH mit einem JSON-Array. Kein Text davor oder danach.
Format:
[
  {
    "entity_type": "building" | "business" | "tenant" | "meter",
    "name": "Hauptstraße 12, 10115 Berlin",
    "address": "Hauptstraße 12, 10115 Berlin",
    "confidence": 0.92,
    "reason": "Vollständige Lieferadresse im Briefkopf"
  },
  {
    "entity_type": "business",
    "name": "Mustermann Immobilien GmbH",
    "confidence": 0.85,
    "reason": "Absender im Briefkopf"
  },
  {
    "entity_type": "meter",
    "name": "Zähler 12345678",
    "meter_number": "12345678",
    "confidence": 0.95,
    "reason": "Zählernummer auf Versorger-Rechnung"
  }
]

Wenn keine Entitäten erkannt werden: []
Confidence-Werte: 0.9+ = sehr sicher, 0.7-0.9 = wahrscheinlich, 0.5-0.7 = möglich, <0.5 = weglassen`;

// ── Hauptfunktion ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    // ── Supabase-Client mit Service-Role (für DB-Zugriff ohne RLS) ────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY") || "";

    if (!serviceRoleKey) {
      return jsonError("SUPABASE_SERVICE_ROLE_KEY nicht konfiguriert", 500);
    }
    if (!anthropicKey) {
      return jsonError("ANTHROPIC_API_KEY nicht konfiguriert", 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ── Request parsen ────────────────────────────────────────────────────────
    const body = await req.json();
    const { document_id } = body;

    if (!document_id) {
      return jsonError("document_id ist erforderlich", 400);
    }

    // ── Dokument laden ────────────────────────────────────────────────────────
    const { data: doc, error: docErr } = await supabase
      .from("sb_documents")
      .select("id, user_id, title, file_name, file_type, ocr_text, summary")
      .eq("id", document_id)
      .single();

    if (docErr || !doc) {
      return jsonError(`Dokument nicht gefunden: ${docErr?.message}`, 404);
    }

    const document = doc as SbDocument;

    // ── Text für Analyse zusammenstellen ─────────────────────────────────────
    const analysisText = [
      document.title ? `Titel: ${document.title}` : "",
      document.file_name ? `Dateiname: ${document.file_name}` : "",
      document.ocr_text ? `OCR-Text:\n${document.ocr_text.substring(0, 6000)}` : "",
      document.summary ? `KI-Zusammenfassung: ${document.summary}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    // Leerer Text: überspringen (kein API-Aufruf)
    if (!analysisText.trim() || analysisText.trim().length < 20) {
      return jsonResponse({
        success: true,
        suggestions: [],
        skipped: "Kein analysierbarer Text im Dokument",
        candidates_found: 0,
        suggestions_matched: 0,
      });
    }

    // ── Claude Analyse (Anthropic Messages API) ───────────────────────────────
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        temperature: 0.1,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Analysiere dieses Dokument und erkenne alle Entitäten:\n\n${analysisText}`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      let errMsg = claudeResponse.status.toString();
      try {
        const errBody = await claudeResponse.json();
        errMsg = errBody.error?.message || errMsg;
      } catch { /* ignore */ }
      console.error("Anthropic API error:", errMsg);
      return jsonError(`KI-Analyse fehlgeschlagen: ${errMsg}`, 502);
    }

    const claudeResult = await claudeResponse.json();
    const rawContent = claudeResult.content?.[0]?.text || "[]";

    // ── Antwort parsen ────────────────────────────────────────────────────────
    let candidates: EntityCandidate[] = [];
    try {
      const cleaned = rawContent
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      candidates = JSON.parse(cleaned);
      if (!Array.isArray(candidates)) candidates = [];
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      return jsonError("KI-Antwort konnte nicht verarbeitet werden", 500);
    }

    // Nur Kandidaten mit Konfidenz >= 0.5
    candidates = candidates.filter((c) => c.confidence >= 0.5);

    if (candidates.length === 0) {
      return jsonResponse({
        success: true,
        suggestions: [],
        skipped: "Keine Entitäten mit ausreichender Konfidenz erkannt",
        candidates_found: 0,
        suggestions_matched: 0,
      });
    }

    // ── Entitäten in der DB suchen und Vorschläge erstellen ───────────────────
    const suggestions: Suggestion[] = [];

    for (const candidate of candidates) {
      try {
        let matchedIds: string[] = [];

        switch (candidate.entity_type) {
          case "building": {
            if (candidate.address) {
              const addressParts = candidate.address.split(",").map((p: string) => p.trim());
              const streetPart = addressParts[0] || "";
              const cityPart = addressParts[addressParts.length - 1] || "";
              const streetName = streetPart.replace(/\s+\d+.*$/, "").trim();

              const { data: buildings } = await supabase
                .from("buildings")
                .select("id, street, house_number, city")
                .eq("user_id", document.user_id)
                .ilike("street", `%${streetName}%`);

              if (buildings && buildings.length > 0) {
                const best = buildings.find((b: any) =>
                  cityPart.toLowerCase().includes((b.city || "").toLowerCase())
                ) || buildings[0];
                matchedIds = [best.id];
              }
            }
            break;
          }

          case "business": {
            const searchName = candidate.name.substring(0, 30);
            const { data: businesses } = await supabase
              .from("biz_clients")
              .select("id, name")
              .eq("user_id", document.user_id)
              .ilike("name", `%${searchName}%`);

            if (businesses && businesses.length > 0) {
              matchedIds = businesses.map((b: any) => b.id);
            }
            break;
          }

          case "tenant": {
            const nameParts = candidate.name.trim().split(/\s+/);
            const lastName = nameParts[nameParts.length - 1];

            const { data: tenants } = await supabase
              .from("tenants")
              .select("id, first_name, last_name")
              .eq("user_id", document.user_id)
              .ilike("last_name", `%${lastName}%`);

            if (tenants && tenants.length > 0) {
              matchedIds = tenants.map((t: any) => t.id);
            }
            break;
          }

          case "meter": {
            if (candidate.meter_number) {
              const { data: meters } = await supabase
                .from("meters")
                .select("id, meter_number")
                .ilike("meter_number", `%${candidate.meter_number}%`);

              if (meters && meters.length > 0) {
                matchedIds = meters.map((m: any) => m.id);
              }
            }
            break;
          }
        }

        for (const entityId of matchedIds) {
          suggestions.push({
            entity_type: candidate.entity_type,
            entity_id: entityId,
            confidence: candidate.confidence,
            reason: candidate.reason,
          });
        }
      } catch (matchErr) {
        console.error(`Fehler beim Matching für ${candidate.entity_type}:`, matchErr);
      }
    }

    // ── Vorschläge in DB speichern ────────────────────────────────────────────
    if (suggestions.length > 0) {
      await supabase
        .from("sb_document_suggestions")
        .delete()
        .eq("document_id", document_id)
        .eq("status", "pending");

      const rows = suggestions.map((s) => ({
        document_id,
        entity_type: s.entity_type,
        entity_id: s.entity_id,
        confidence: s.confidence,
        reason: s.reason,
        status: "pending",
      }));

      const { error: insertErr } = await supabase
        .from("sb_document_suggestions")
        .upsert(rows, {
          onConflict: "document_id,entity_type,entity_id",
          ignoreDuplicates: false,
        });

      if (insertErr) {
        console.error("Fehler beim Speichern der Vorschläge:", insertErr);
      }

      await supabase
        .from("sb_documents")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", document_id);
    }

    return jsonResponse({
      success: true,
      suggestions,
      candidates_found: candidates.length,
      suggestions_matched: suggestions.length,
    });

  } catch (error: any) {
    console.error("analyze-and-suggest-links error:", error);
    return jsonError(error.message || "Interner Serverfehler", 500);
  }
});

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function jsonError(message: string, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}
