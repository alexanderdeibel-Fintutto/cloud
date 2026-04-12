/**
 * Supabase Edge Function: analyzeDocument
 * Analyzes uploaded tax documents (PDF/images) using Claude's vision capabilities.
 *
 * SETUP:
 * 1. Deploy: supabase functions deploy analyzeDocument
 * 2. Set secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const SYSTEM_PROMPT = `Du bist ein Experte fuer deutsche Steuerbescheide. Analysiere das hochgeladene Dokument und extrahiere alle relevanten Daten.

WICHTIG: Antworte NUR mit validem JSON im folgenden Format, ohne Markdown-Codeblocks oder zusaetzlichen Text:

{
  "success": true,
  "typ": "einkommensteuer|gewerbesteuer|umsatzsteuer|koerperschaftsteuer|grundsteuer|sonstige",
  "steuerjahr": "2024",
  "finanzamt": "Name des Finanzamts",
  "aktenzeichen": "XX/XXX/XXXXX",
  "festgesetzteSteuer": "1234.56",
  "erwarteteSteuer": null,
  "confidence": 85,
  "details": {
    "steuerpflichtiger": "Name falls erkennbar",
    "bescheiddatum": "TT.MM.JJJJ falls erkennbar",
    "zuVersteuerndEinkommen": null,
    "vorauszahlungen": null,
    "nachzahlung": null,
    "erstattung": null
  },
  "hinweise": ["Kurze Hinweise zum Bescheid"]
}

REGELN:
- Wenn du Felder nicht erkennen kannst, setze sie auf null
- "festgesetzteSteuer" als Zahl ohne Waehrungszeichen (Punkt als Dezimaltrenner)
- "confidence" ist ein Wert von 0-100, wie sicher du dir bei der Erkennung bist
- "typ" muss einer der vorgegebenen Werte sein
- Wenn das Dokument KEIN Steuerbescheid ist, setze "success" auf false und fuege ein "error" Feld hinzu
- Achte besonders auf: Festgesetzte Steuer, Finanzamt, Aktenzeichen, Steuerjahr`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { fileBase64, mimeType, fileName } = await req.json();

    if (!fileBase64 || !mimeType) {
      return jsonResponse({ success: false, error: "fileBase64 und mimeType sind erforderlich" }, 400);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return jsonResponse({ success: false, error: "ANTHROPIC_API_KEY nicht konfiguriert" }, 500);
    }

    // Build content blocks based on file type
    const userContent: Array<Record<string, unknown>> = [];

    if (mimeType === "application/pdf") {
      userContent.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: fileBase64,
        },
      });
    } else if (mimeType.startsWith("image/")) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType,
          data: fileBase64,
        },
      });
    } else {
      return jsonResponse({ success: false, error: `Nicht unterstuetzter Dateityp: ${mimeType}` }, 400);
    }

    userContent.push({
      type: "text",
      text: `Analysiere dieses Dokument${fileName ? ` (${fileName})` : ""}. Extrahiere alle steuerlich relevanten Daten.`,
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Anthropic API error:", error);
      return jsonResponse({
        success: false,
        error: `AI-Analyse fehlgeschlagen: ${error.error?.message || response.status}`,
      }, 502);
    }

    const result = await response.json();
    const textContent = result.content?.[0]?.text || "";

    // Parse the JSON response from Claude
    try {
      // Strip markdown code blocks if present
      const jsonStr = textContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      return jsonResponse(parsed);
    } catch {
      console.error("Failed to parse AI response:", textContent);
      return jsonResponse({
        success: false,
        error: "KI-Antwort konnte nicht verarbeitet werden",
        rawResponse: textContent.substring(0, 500),
      }, 500);
    }
  } catch (error) {
    console.error("analyzeDocument error:", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}
