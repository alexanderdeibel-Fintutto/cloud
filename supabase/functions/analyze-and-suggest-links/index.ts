/**
 * Supabase Edge Function: analyze-and-suggest-links
 *
 * Analysiert den OCR-Text eines SecondBrain-Dokuments mit GPT-4.1 und erkennt
 * automatisch Entitäten aus dem Fintutto-Ökosystem:
 *   - Gebäude (buildings) — via Adresserkennung
 *   - Firmen (biz_clients) — via Firmennamenerkennung
 *   - Mieter (tenants) — via Namenserkennung
 *   - Zähler (meters) — via Zählernummererkennung
 *
 * Speichert Vorschläge in sb_document_suggestions mit Konfidenz-Score (0–1).
 *
 * Trigger: Wird nach OCR-Abschluss aufgerufen (manuell oder via Webhook).
 *
 * Request Body:
 *   { document_id: string }
 *
 * Response:
 *   { success: boolean, suggestions: Suggestion[], skipped?: string }
 *
 * SETUP:
 *   supabase functions deploy analyze-and-suggest-links
 *   supabase secrets set OPENAI_API_KEY=sk-...
 *   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
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
  document_type: string | null;
  ocr_text: string | null;
  ai_summary: string | null;
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

// ── System-Prompt für GPT-4.1 ────────────────────────────────────────────────

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
    const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";

    if (!serviceRoleKey) {
      return jsonError("SUPABASE_SERVICE_ROLE_KEY nicht konfiguriert", 500);
    }
    if (!openaiKey) {
      return jsonError("OPENAI_API_KEY nicht konfiguriert", 500);
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
      .select("id, user_id, title, file_name, document_type, ocr_text, ai_summary")
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
      document.ai_summary ? `KI-Zusammenfassung: ${document.ai_summary}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!analysisText.trim()) {
      return jsonResponse({
        success: true,
        suggestions: [],
        skipped: "Kein analysierbarer Text im Dokument",
      });
    }

    // ── GPT-4.1 Analyse ───────────────────────────────────────────────────────
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analysiere dieses Dokument und erkenne alle Entitäten:\n\n${analysisText}` },
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const err = await openaiResponse.json();
      console.error("OpenAI API error:", err);
      return jsonError(`KI-Analyse fehlgeschlagen: ${err.error?.message || openaiResponse.status}`, 502);
    }

    const openaiResult = await openaiResponse.json();
    const rawContent = openaiResult.choices?.[0]?.message?.content || "[]";

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
      });
    }

    // ── Entitäten in der DB suchen und Vorschläge erstellen ───────────────────
    const suggestions: Suggestion[] = [];

    for (const candidate of candidates) {
      try {
        let matchedIds: string[] = [];

        switch (candidate.entity_type) {
          case "building": {
            // Adresse in buildings-Tabelle suchen
            if (candidate.address) {
              const addressParts = candidate.address.split(",").map((p: string) => p.trim());
              const streetPart = addressParts[0] || "";
              const cityPart = addressParts[addressParts.length - 1] || "";

              const { data: buildings } = await supabase
                .from("buildings")
                .select("id, street, house_number, city")
                .eq("user_id", document.user_id)
                .ilike("street", `%${streetPart.replace(/\s+\d+$/, "").trim()}%`);

              if (buildings && buildings.length > 0) {
                // Beste Übereinstimmung finden
                const best = buildings.find((b: any) =>
                  cityPart.toLowerCase().includes(b.city?.toLowerCase() || "")
                ) || buildings[0];
                matchedIds = [best.id];
              }
            }
            break;
          }

          case "business": {
            // Firma in biz_clients suchen
            const { data: businesses } = await supabase
              .from("biz_clients")
              .select("id, name")
              .eq("user_id", document.user_id)
              .ilike("name", `%${candidate.name.substring(0, 20)}%`);

            if (businesses && businesses.length > 0) {
              matchedIds = businesses.map((b: any) => b.id);
            }
            break;
          }

          case "tenant": {
            // Mieter in tenants suchen
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
            // Zähler in meters suchen
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

        // Vorschläge für alle gefundenen Entitäten erstellen
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
      // Alte Pending-Vorschläge für dieses Dokument löschen
      await supabase
        .from("sb_document_suggestions")
        .delete()
        .eq("document_id", document_id)
        .eq("status", "pending");

      // Neue Vorschläge einfügen (Duplikate ignorieren)
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

      // Dokument als "analysiert" markieren
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
