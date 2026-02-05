/**
 * Fintutto AI Core Service - VOLLSTÄNDIG
 * Supabase Edge Function für alle KI-Anfragen
 *
 * 1. Erstelle Edge Function "aiCoreService" in Supabase
 * 2. Füge diesen Code ein
 * 3. Setze ANTHROPIC_API_KEY in Secrets
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============================================
// SYSTEM PROMPTS
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
  premium: "claude-opus-4-5-20251101", // Voller Claude-Zugang!
};

const TIER_MAX_TOKENS: Record<string, number> = {
  free: 500,
  basic: 1000,
  pro: 2000,
  business: 4000,
  premium: 8000,
};

const CLAUDE_PRICES: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-20250514": { input: 3.0, output: 15.0 },
  "claude-3-5-haiku-20241022": { input: 0.8, output: 4.0 },
  "claude-opus-4-5-20251101": { input: 15.0, output: 75.0 },
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
    const tier = userTier || "free";
    const model = TIER_MODELS[tier] || TIER_MODELS.free;
    const maxTokens = TIER_MAX_TOKENS[tier] || TIER_MAX_TOKENS.free;

    // Claude API aufrufen
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
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: fullPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API Fehler: ${response.status}`);
    }

    const result = await response.json();

    // Kosten berechnen
    const prices = CLAUDE_PRICES[model] || CLAUDE_PRICES["claude-sonnet-4-20250514"];
    const costEur = (
      (result.usage.input_tokens / 1_000_000) * prices.input +
      (result.usage.output_tokens / 1_000_000) * prices.output
    ) * 0.92;

    return jsonResponse({
      success: true,
      content: result.content[0]?.text || "",
      usage: {
        inputTokens: result.usage.input_tokens,
        outputTokens: result.usage.output_tokens,
        costEur: Math.round(costEur * 10000) / 10000,
      },
      model,
      tier,
    });

  } catch (error) {
    console.error("AI Error:", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
