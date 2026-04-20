/**
 * Shared Rate-Limiting Middleware für Supabase Edge Functions
 *
 * Verwendung:
 *   import { checkRateLimit, logApiCall } from "../_shared/rateLimiter.ts";
 *
 *   const rl = await checkRateLimit(req, "ocr-meter");
 *   if (!rl.allowed) return rl.response!;
 *   // ... API-Call durchführen ...
 *   await logApiCall(rl.userId, "ocr-meter", { tokens: 256, costUsd: 0.00025 });
 */

export interface RateLimitResult {
  allowed: boolean;
  userId: string;
  tier: string;
  used: number;
  limit: number;
  response?: Response;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Prüft ob der Nutzer das Rate-Limit für eine Funktion erreicht hat.
 * Authentifiziert den Nutzer via JWT und ruft check_rate_limit() auf.
 */
export async function checkRateLimit(
  req: Request,
  functionName: string
): Promise<RateLimitResult> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // JWT aus Authorization-Header extrahieren
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      allowed: false,
      userId: "",
      tier: "anon",
      used: 0,
      limit: 0,
      response: new Response(
        JSON.stringify({ error: "Unauthorized — JWT required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ),
    };
  }

  const jwt = authHeader.replace("Bearer ", "");

  // Nutzer-ID aus JWT ermitteln
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "apikey": supabaseServiceKey,
    },
  });

  if (!userRes.ok) {
    return {
      allowed: false,
      userId: "",
      tier: "anon",
      used: 0,
      limit: 0,
      response: new Response(
        JSON.stringify({ error: "Unauthorized — invalid JWT" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ),
    };
  }

  const userData = await userRes.json();
  const userId = userData.id as string;

  // Rate-Limit via RPC prüfen
  const rlRes = await fetch(
    `${supabaseUrl}/rest/v1/rpc/check_rate_limit`,
    {
      method: "POST",
      headers: {
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_user_id: userId, p_function: functionName }),
    }
  );

  if (!rlRes.ok) {
    // Bei Fehler: Im Zweifel erlauben (fail-open)
    console.error("Rate-Limit-Check fehlgeschlagen:", await rlRes.text());
    return { allowed: true, userId, tier: "unknown", used: 0, limit: -1 };
  }

  const rl = await rlRes.json();

  if (!rl.allowed) {
    return {
      allowed: false,
      userId,
      tier: rl.tier,
      used: rl.used,
      limit: rl.limit,
      response: new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `Du hast das monatliche Limit von ${rl.limit} Aufrufen für diese Funktion erreicht. Upgrade auf Pro für unbegrenzte Nutzung.`,
          used: rl.used,
          limit: rl.limit,
          tier: rl.tier,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ),
    };
  }

  return { allowed: true, userId, tier: rl.tier, used: rl.used, limit: rl.limit };
}

/**
 * Loggt einen API-Aufruf in api_usage_log.
 * Immer nach einem erfolgreichen API-Call aufrufen.
 */
export async function logApiCall(
  userId: string,
  functionName: string,
  options: { tokens?: number; costUsd?: number; cached?: boolean } = {}
): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/api_usage_log`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        user_id: userId,
        function_name: functionName,
        tokens_used: options.tokens ?? 0,
        cost_usd: options.costUsd ?? 0,
        cached: options.cached ?? false,
      }),
    });
  } catch (err) {
    // Logging-Fehler nicht weiterwerfen — nie den Hauptaufruf blockieren
    console.error("logApiCall error:", err);
  }
}

/**
 * Berechnet die ungefähren Kosten für einen Claude-Haiku-Aufruf.
 * Preise: Input $0.80/1M, Output $4.00/1M Tokens (Stand April 2026)
 */
export function estimateClaudeHaikuCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * 0.80 + (outputTokens / 1_000_000) * 4.00;
}

/**
 * Berechnet die ungefähren Kosten für einen Claude-Sonnet-Aufruf.
 * Preise: Input $3.00/1M, Output $15.00/1M Tokens (Stand April 2026)
 */
export function estimateClaudeSonnetCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * 3.00 + (outputTokens / 1_000_000) * 15.00;
}
