/**
 * Fintutto AI Core Service v2 - MIT PROMPT CACHING
 * Supabase Edge Function für alle KI-Anfragen
 *
 * FEATURES:
 * - Prompt Caching: Spart bis zu 90% der Kosten für System-Prompts!
 * - Usage Tracking: Alle Anfragen werden in Supabase geloggt
 * - Rate Limiting: Pro Tier unterschiedliche Limits
 *
 * SETUP:
 * 1. Erstelle Edge Function "aiCoreService" in Supabase
 * 2. Füge diesen Code ein
 * 3. Setze ANTHROPIC_API_KEY in Secrets
 * 4. Erstelle Tabelle "ai_usage_logs" (SQL unten)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================
// SYSTEM PROMPTS (werden gecacht!)
// ============================================

const BASE_PROMPT = `Du bist ein freundlicher und kompetenter KI-Assistent im Fintutto-Universum - dem führenden digitalen Ökosystem für Immobilienverwaltung in Deutschland.

WISSENSBASIS - DEUTSCHES MIETRECHT:
- BGB Mietrecht (§§ 535-580a)
- Betriebskostenverordnung (BetrKV) - 17 umlagefähige Kostenarten
- Heizkostenverordnung (HeizKV)
- Mietpreisbremse (max 10% über Vergleichsmiete bei Neuvermietung)
- Kappungsgrenze: Max 20% Mieterhöhung in 3 Jahren (15% in angespannten Märkten)
- Kündigungsfristen: 3/6/9 Monate je nach Mietdauer
- Kaution: Max 3 Monatsmieten, verzinslich anzulegen
- Schönheitsreparaturen: Starre Fristen unwirksam!
- Kleinreparaturklausel: Max ~100€/Fall, ~300€/Jahr

FINTUTTO APPS:
- Vermietify: Komplette Immobilienverwaltung für Vermieter
- MieterApp: Portal für Mieter (Reparaturen, Dokumente, Community)
- Formulare: Rechtssichere Mietverträge und Dokumente
- Betriebskosten-Helfer: NK-Abrechnung leicht gemacht
- Rent-Wizard: Rendite- und Mieterhöhungs-Rechner
- Hausmeister-App: Facility Management
- Zählerablesung: Verbrauchserfassung per Foto
- Financial Compass: Buchhaltung für Vermieter
- MietCheck Pro: Mietvertrags-Prüfer
- Mieterhöhungs-Checker: Erhöhungen prüfen

KOMMUNIKATIONSSTIL:
- Freundlich und professionell
- Deutsch, klare Sprache ohne unnötigen Fachjargon
- Kurze, prägnante Antworten (2-4 Sätze)
- Bei komplexen Rechtsfragen: Anwalt/Mieterverein empfehlen

WICHTIG:
- KEINE Rechtsberatung - nur allgemeine Informationen
- Bei Notfällen (Wasserschaden, Gas, Brand): Sofort Notruf empfehlen!
- Datenschutz beachten - keine persönlichen Daten speichern`;

const APP_PROMPTS: Record<string, string> = {
  vermietify: `${BASE_PROMPT}

APP-KONTEXT: VERMIETIFY (Vermieter-App)
Du hilfst Vermietern bei der Immobilienverwaltung.

FEATURES:
- Dashboard: Übersicht Objekte, Einnahmen, Aufgaben
- Objekte: Immobilien anlegen/verwalten
- Mieter: Mieterdaten, Verträge, Kommunikation
- Finanzen: Mieteingänge, Ausgaben
- Betriebskosten: NK-Abrechnungen erstellen
- Steuern: Anlage V Export für ELSTER
- Dokumente: Verträge, Schriftverkehr

Verwende "Sie"-Form.`,

  mieterapp: `${BASE_PROMPT}

APP-KONTEXT: MIETERAPP (Mieter-Portal)
Du bist der freundliche Wohnassistent für Mieter.

FEATURES:
- Reparaturen: Schäden melden und verfolgen
- Dokumente: Mietvertrag, Abrechnungen einsehen
- Finanzen: Miete, Nebenkosten
- Nachrichten: Chat mit Verwaltung
- Schwarzes Brett: Community-Angebote
- Events: Nachbarschafts-Veranstaltungen

Verwende "Du"-Form, sei freundlich und unterstützend.`,

  formulare: `${BASE_PROMPT}

APP-KONTEXT: FINTUTTO FORMULARE
Du hilfst bei rechtssicheren Mietverträgen und Dokumenten.

VERFÜGBARE FORMULARE:
- Mietvertrag (Standard, Möbliert, WG, Gewerbe)
- Staffel-/Indexmietvertrag
- Wohnungsübergabeprotokoll
- Kündigung (Mieter/Vermieter)
- Mieterhöhungsverlangen
- Nebenkostenabrechnung
- Mietschuldenfreiheitsbescheinigung
- SEPA-Lastschriftmandat
- Hausordnung

HINWEIS: Formulare sind Muster - bei komplexen Fällen Anwalt hinzuziehen!`,

  rechner: `${BASE_PROMPT}

APP-KONTEXT: FINTUTTO RECHNER
Du hilfst bei Immobilien-Kalkulationen.

VERFÜGBARE RECHNER:
- Renditerechner (Brutto/Netto, Cashflow, ROI)
- Mieterhöhungsrechner (Kappungsgrenze prüfen)
- Nebenkostenrechner (Umlage, Verteilung)
- Kaufpreisrechner (Nebenkosten, Finanzierung)
- AfA-Rechner (Abschreibung)
- Indexmiet-Rechner

FORMELN:
- Bruttomietrendite = (Jahreskaltmiete × 100) / Kaufpreis
- Nettomietrendite = ((Miete - NK - Rücklagen) × 100) / Gesamtkosten
- Kappungsgrenze: Max 20% in 3 Jahren`,

  betriebskosten: `${BASE_PROMPT}

APP-KONTEXT: BETRIEBSKOSTEN-HELFER
Du hilfst bei der Nebenkostenabrechnung.

UMLAGEFÄHIGE KOSTEN (BetrKV):
1. Grundsteuer
2. Wasserversorgung
3. Entwässerung
4. Heizung
5. Warmwasser
6. Aufzug
7. Straßenreinigung
8. Müllabfuhr
9. Gebäudereinigung
10. Gartenpflege
11. Beleuchtung
12. Schornsteinfeger
13. Versicherungen
14. Hauswart
15. Gemeinschaftsantenne/Kabel
16. Wäschepflege
17. Sonstige

NICHT UMLAGEFÄHIG: Verwaltungskosten, Instandhaltung, Reparaturen!

ABRECHNUNGSFRIST: 12 Monate nach Abrechnungszeitraum!`,

  hausmeister: `${BASE_PROMPT}

APP-KONTEXT: HAUSMEISTER-APP
Du hilfst bei Facility Management und Objektbetreuung.

AUFGABEN:
- Wartung & Instandhaltung
- Reparaturaufträge verwalten
- Kontrollgänge dokumentieren
- Winterdienst planen
- Grünanlagenpflege
- Notfälle koordinieren

Bei Notfällen: Sofort handeln, dann dokumentieren!`,

  mietrecht: `${BASE_PROMPT}

APP-KONTEXT: MIETRECHT-ASSISTENT
Du erklärst deutsches Mietrecht verständlich.

WICHTIGE PARAGRAPHEN:
- § 535 BGB: Mietvertrag Grundlagen
- § 536 BGB: Mietminderung bei Mängeln
- § 558 BGB: Mieterhöhung bis Vergleichsmiete
- § 573 BGB: Ordentliche Kündigung (Vermieter braucht Grund!)
- § 574 BGB: Sozialklausel/Härtefall
- § 556 BGB: Betriebskosten

HINWEIS: Dies ist KEINE Rechtsberatung! Bei konkreten Fällen Anwalt konsultieren.`,

  checker: `${BASE_PROMPT}

APP-KONTEXT: MIETERHÖHUNGS-CHECKER
Du prüfst ob Mieterhöhungen rechtmäßig sind.

PRÜFSCHEMA:
1. Formelle Prüfung (Schriftform, Begründung?)
2. Sperrfrist eingehalten? (>15 Monate seit letzter Erhöhung)
3. Kappungsgrenze (20%/15% in 3 Jahren)
4. Ortsübliche Vergleichsmiete als Obergrenze
5. Mietpreisbremse bei Neuvermietung?

FRISTEN:
- Zustimmungsfrist: Bis Ende 2. Monat nach Zugang
- Überlegungsfrist für Mieter: 2 Monate`,

  admin: `${BASE_PROMPT}

APP-KONTEXT: ADMIN HUB
Du hilfst bei der zentralen Verwaltung aller Fintutto Apps.

FUNKTIONEN:
- Benutzerverwaltung (Rollen, Rechte)
- App-Konfiguration
- Billing & Subscriptions
- API-Keys & Integrationen
- Audit-Logs
- Multi-Mandanten

BERECHTIGUNGEN:
- Super-Admin: Alle Rechte
- Admin: App-Verwaltung
- Manager: Team-Verwaltung
- User: Standard-Zugang`,
};

// ============================================
// TIER KONFIGURATION
// ============================================

const TIER_MODELS: Record<string, string> = {
  free: "claude-3-5-haiku-20241022",
  basic: "claude-sonnet-4-20250514",
  pro: "claude-sonnet-4-20250514",
  business: "claude-sonnet-4-20250514",
  premium: "claude-opus-4-5-20251101",
};

const TIER_MAX_TOKENS: Record<string, number> = {
  free: 500,
  basic: 1000,
  pro: 2000,
  business: 4000,
  premium: 8000,
};

const RATE_LIMITS: Record<string, { perHour: number; perDay: number }> = {
  free: { perHour: 5, perDay: 20 },
  basic: { perHour: 20, perDay: 100 },
  pro: { perHour: 100, perDay: 500 },
  business: { perHour: 500, perDay: 2000 },
  premium: { perHour: 1000, perDay: 5000 },
};

// Preise pro 1M Tokens (USD)
const CLAUDE_PRICES: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  "claude-sonnet-4-20250514": { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.30 },
  "claude-3-5-haiku-20241022": { input: 0.8, output: 4.0, cacheWrite: 1.0, cacheRead: 0.08 },
  "claude-opus-4-5-20251101": { input: 15.0, output: 75.0, cacheWrite: 18.75, cacheRead: 1.50 },
};

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { appId, userTier, prompt, context, userId, conversationHistory } = await req.json();

    if (!prompt) {
      return jsonResponse({ error: "prompt ist erforderlich" }, 400);
    }

    // Supabase Client für Usage Tracking
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = supabaseUrl && supabaseKey
      ? createClient(supabaseUrl, supabaseKey)
      : null;

    // Rate Limit prüfen
    const tier = userTier || "free";
    if (supabase && userId) {
      const rateLimitOk = await checkRateLimit(supabase, userId, tier);
      if (!rateLimitOk) {
        return jsonResponse({
          error: "Rate limit erreicht. Bitte später erneut versuchen.",
          rateLimitExceeded: true
        }, 429);
      }
    }

    // System Prompt aufbauen
    const systemPrompt = APP_PROMPTS[appId] || APP_PROMPTS.vermietify;
    const fullPrompt = context ? `${systemPrompt}\n\nKONTEXT: ${context}` : systemPrompt;

    // Messages aufbauen
    const messages: Array<{ role: string; content: string }> = [];
    if (conversationHistory?.length > 0) {
      messages.push(...conversationHistory.slice(-6));
    }
    messages.push({ role: "user", content: prompt });

    // Tier-Konfiguration
    const model = TIER_MODELS[tier] || TIER_MODELS.free;
    const maxTokens = TIER_MAX_TOKENS[tier] || TIER_MAX_TOKENS.free;

    // Claude API aufrufen MIT PROMPT CACHING
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY nicht konfiguriert");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        // PROMPT CACHING aktivieren!
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        // System Prompt MIT cache_control für Caching
        system: [
          {
            type: "text",
            text: fullPrompt,
            cache_control: { type: "ephemeral" }
          }
        ],
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API Fehler: ${response.status}`);
    }

    const result = await response.json();

    // Kosten berechnen (inkl. Cache-Kosten)
    const costs = calculateCosts(result.usage, model);

    // Usage loggen
    if (supabase && userId) {
      await logUsage(supabase, {
        userId,
        appId: appId || "unknown",
        tier,
        model,
        inputTokens: result.usage.input_tokens,
        outputTokens: result.usage.output_tokens,
        cacheCreationTokens: result.usage.cache_creation_input_tokens || 0,
        cacheReadTokens: result.usage.cache_read_input_tokens || 0,
        costEur: costs.totalEur,
        prompt: prompt.substring(0, 200), // Ersten 200 Zeichen
      });
    }

    // Cache-Info für Debugging
    const cacheInfo = {
      cacheCreationTokens: result.usage.cache_creation_input_tokens || 0,
      cacheReadTokens: result.usage.cache_read_input_tokens || 0,
      cacheHit: (result.usage.cache_read_input_tokens || 0) > 0,
    };

    return jsonResponse({
      success: true,
      content: result.content[0]?.text || "",
      usage: {
        inputTokens: result.usage.input_tokens,
        outputTokens: result.usage.output_tokens,
        costEur: costs.totalEur,
        ...cacheInfo,
        // Zeige Ersparnis wenn Cache-Hit
        savingsPercent: cacheInfo.cacheHit
          ? Math.round((1 - costs.totalEur / costs.withoutCacheEur) * 100)
          : 0,
      },
      model,
      tier,
    });

  } catch (error) {
    console.error("AI Error:", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  tier: string
): Promise<boolean> {
  const limits = RATE_LIMITS[tier] || RATE_LIMITS.free;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Anfragen der letzten Stunde
  const { count: hourlyCount } = await supabase
    .from("ai_usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  if ((hourlyCount || 0) >= limits.perHour) {
    return false;
  }

  // Anfragen der letzten 24 Stunden
  const { count: dailyCount } = await supabase
    .from("ai_usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneDayAgo);

  if ((dailyCount || 0) >= limits.perDay) {
    return false;
  }

  return true;
}

async function logUsage(
  supabase: ReturnType<typeof createClient>,
  data: {
    userId: string;
    appId: string;
    tier: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    costEur: number;
    prompt: string;
  }
) {
  try {
    await supabase.from("ai_usage_logs").insert({
      user_id: data.userId,
      app_id: data.appId,
      tier: data.tier,
      model: data.model,
      input_tokens: data.inputTokens,
      output_tokens: data.outputTokens,
      cache_creation_tokens: data.cacheCreationTokens,
      cache_read_tokens: data.cacheReadTokens,
      cost_eur: data.costEur,
      prompt_preview: data.prompt,
    });
  } catch (error) {
    console.error("Usage logging failed:", error);
    // Nicht fehlschlagen wenn Logging nicht klappt
  }
}

function calculateCosts(
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  },
  model: string
) {
  const prices = CLAUDE_PRICES[model] || CLAUDE_PRICES["claude-sonnet-4-20250514"];

  const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
  const cacheReadTokens = usage.cache_read_input_tokens || 0;
  const regularInputTokens = usage.input_tokens - cacheCreationTokens - cacheReadTokens;

  // Kosten MIT Cache
  const inputCostUsd = (regularInputTokens / 1_000_000) * prices.input;
  const cacheWriteCostUsd = (cacheCreationTokens / 1_000_000) * prices.cacheWrite;
  const cacheReadCostUsd = (cacheReadTokens / 1_000_000) * prices.cacheRead;
  const outputCostUsd = (usage.output_tokens / 1_000_000) * prices.output;

  const totalUsd = inputCostUsd + cacheWriteCostUsd + cacheReadCostUsd + outputCostUsd;

  // Kosten OHNE Cache (zum Vergleich)
  const withoutCacheUsd = (usage.input_tokens / 1_000_000) * prices.input +
                          (usage.output_tokens / 1_000_000) * prices.output;

  // EUR/USD ~0.92
  return {
    totalEur: Math.round(totalUsd * 0.92 * 10000) / 10000,
    withoutCacheEur: Math.round(withoutCacheUsd * 0.92 * 10000) / 10000,
  };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ============================================
// SQL FÜR USAGE TRACKING TABELLE
// ============================================
/*
-- Führe dieses SQL in deiner Supabase SQL Console aus:

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  tier TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cache_creation_tokens INTEGER DEFAULT 0,
  cache_read_tokens INTEGER DEFAULT 0,
  cost_eur DECIMAL(10, 6) NOT NULL,
  prompt_preview TEXT
);

-- Index für schnelle Rate-Limit Abfragen
CREATE INDEX idx_ai_usage_user_created ON ai_usage_logs(user_id, created_at DESC);

-- Index für App-Statistiken
CREATE INDEX idx_ai_usage_app ON ai_usage_logs(app_id, created_at DESC);

-- RLS aktivieren
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Nur Service Role kann schreiben
CREATE POLICY "Service role can insert" ON ai_usage_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Policy: Service Role kann alles lesen
CREATE POLICY "Service role can read" ON ai_usage_logs
  FOR SELECT TO service_role
  USING (true);

-- View für tägliche Statistiken
CREATE OR REPLACE VIEW ai_daily_stats AS
SELECT
  DATE(created_at) as date,
  app_id,
  tier,
  model,
  COUNT(*) as requests,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(cache_read_tokens) as total_cache_hits,
  SUM(cost_eur) as total_cost_eur,
  ROUND(AVG(cost_eur)::numeric, 6) as avg_cost_per_request
FROM ai_usage_logs
GROUP BY DATE(created_at), app_id, tier, model
ORDER BY date DESC;

-- View für User-Statistiken
CREATE OR REPLACE VIEW ai_user_stats AS
SELECT
  user_id,
  tier,
  COUNT(*) as total_requests,
  SUM(cost_eur) as total_cost_eur,
  MAX(created_at) as last_request,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as requests_last_hour,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as requests_last_day
FROM ai_usage_logs
GROUP BY user_id, tier;

*/
