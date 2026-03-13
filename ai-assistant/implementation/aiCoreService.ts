/**
 * Fintutto AI Core Service
 * Zentraler Service für alle KI-Anfragen in Lovable Apps
 *
 * Kopiere diese Datei in deine Lovable App unter: supabase/functions/aiCoreService/index.ts
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Claude Preise (Stand 2026)
const CLAUDE_PRICES = {
  "claude-sonnet-4-20250514": { input: 3.00, output: 15.00 },
  "claude-haiku-3-5-20241022": { input: 0.80, output: 4.00 },
};

// App-spezifische System-Prompts
const APP_PROMPTS: Record<string, string> = {
  vermietify: `{{BASE_PROMPT}}

{{VERMIETIFY_PROMPT}}`,

  mieterapp: `{{BASE_PROMPT}}

{{MIETERAPP_PROMPT}}`,

  formulare: `{{BASE_PROMPT}}

{{FORMULARE_PROMPT}}`,

  rechner: `{{BASE_PROMPT}}

{{RECHNER_PROMPT}}`,

  bescheidboxer: `{{BASE_PROMPT}}

{{BESCHEIDBOXER_PROMPT}}`,
};

// Rate Limits pro Tier
const RATE_LIMITS = {
  free: { perHour: 5, perDay: 20 },
  basic: { perHour: 20, perDay: 100 },
  pro: { perHour: 100, perDay: 500 },
  business: { perHour: 500, perDay: 2000 },
  premium: { perHour: 1000, perDay: 5000 }, // Praktisch unbegrenzt
};

// Modell-Auswahl pro Tier
const TIER_MODELS = {
  free: "claude-haiku-3-5-20241022",
  basic: "claude-sonnet-4-20250514",
  pro: "claude-sonnet-4-20250514",
  business: "claude-sonnet-4-20250514",
  premium: "claude-opus-4-5-20251101", // Voller Claude-Zugang!
};

// Max Tokens pro Tier
const TIER_MAX_TOKENS = {
  free: 500,
  basic: 1000,
  pro: 2000,
  business: 4000,
  premium: 8000, // Voller Zugang - keine Einschränkungen
};

interface AIRequest {
  appId: "vermietify" | "mieterapp" | "formulare" | "rechner" | "bescheidboxer";
  userTier: "free" | "basic" | "pro" | "business";
  prompt: string;
  context?: string;
  userId?: string;
  featureKey?: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

serve(async (req: Request) => {
  // CORS Headers
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
    const body: AIRequest = await req.json();
    const { appId, userTier, prompt, context, userId, featureKey, conversationHistory } = body;

    // 1. Validierung
    if (!appId || !prompt) {
      return jsonResponse({ error: "appId und prompt sind erforderlich" }, 400);
    }

    // 2. Rate Limit prüfen (optional - implementiere mit deiner DB)
    // const rateLimitOk = await checkRateLimit(userId, userTier);
    // if (!rateLimitOk) return jsonResponse({ error: "Rate limit erreicht" }, 429);

    // 3. System Prompt aufbauen
    const systemPrompt = buildSystemPrompt(appId, context);

    // 4. Messages aufbauen
    const messages = buildMessages(prompt, conversationHistory);

    // 5. Modell und Max Tokens basierend auf Tier
    const model = TIER_MODELS[userTier] || TIER_MODELS.free;
    const maxTokens = TIER_MAX_TOKENS[userTier] || TIER_MAX_TOKENS.free;

    // 6. Claude API aufrufen
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
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Claude API Fehler: ${response.status}`);
    }

    const result = await response.json();

    // 7. Kosten berechnen
    const costs = calculateCosts(result.usage, model);

    // 8. Usage loggen (optional - implementiere mit deiner DB)
    // await logUsage(userId, appId, featureKey, costs);

    // 9. Erfolgreiche Antwort
    return jsonResponse({
      success: true,
      content: result.content[0]?.text || "",
      usage: {
        inputTokens: result.usage.input_tokens,
        outputTokens: result.usage.output_tokens,
        costEur: costs.totalEur,
      },
      model,
      tier: userTier,
    });

  } catch (error) {
    console.error("AI Service Error:", error);
    return jsonResponse({
      success: false,
      error: error.message || "Interner Fehler"
    }, 500);
  }
});

// Helper Functions

function buildSystemPrompt(appId: string, context?: string): string {
  let prompt = APP_PROMPTS[appId] || APP_PROMPTS.vermietify;

  if (context) {
    prompt += `\n\nAKTUELLER KONTEXT:\n${context}`;
  }

  return prompt;
}

function buildMessages(prompt: string, history?: Array<{ role: "user" | "assistant"; content: string }>) {
  const messages = [];

  // Conversation History (letzte 6 Messages)
  if (history && history.length > 0) {
    const recentHistory = history.slice(-6);
    messages.push(...recentHistory);
  }

  // Aktuelle User-Nachricht
  messages.push({ role: "user", content: prompt });

  return messages;
}

function calculateCosts(usage: { input_tokens: number; output_tokens: number }, model: string) {
  const prices = CLAUDE_PRICES[model] || CLAUDE_PRICES["claude-sonnet-4-20250514"];

  const inputCostUsd = (usage.input_tokens / 1_000_000) * prices.input;
  const outputCostUsd = (usage.output_tokens / 1_000_000) * prices.output;
  const totalUsd = inputCostUsd + outputCostUsd;

  // EUR/USD ~0.92
  return {
    totalEur: Math.round(totalUsd * 0.92 * 10000) / 10000,
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
