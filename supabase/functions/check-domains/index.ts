import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckResult {
  id: string;
  health: "healthy" | "warning" | "critical" | "unknown";
  http_code: number | null;
  response_time_ms: number | null;
  has_ssl: boolean;
  page_title: string | null;
  meta_description: string | null;
  last_check_at: string;
}

async function checkDomain(url: string): Promise<Omit<CheckResult, "id">> {
  const start = Date.now();
  const result: Omit<CheckResult, "id"> = {
    health: "unknown",
    http_code: null,
    response_time_ms: null,
    has_ssl: url.startsWith("https://"),
    page_title: null,
    meta_description: null,
    last_check_at: new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Fintutto-Domain-Checker/1.0",
      },
    });

    clearTimeout(timeout);
    result.response_time_ms = Date.now() - start;
    result.http_code = response.status;

    if (response.status >= 200 && response.status < 400) {
      result.health = result.response_time_ms > 5000 ? "warning" : "healthy";

      // Parse HTML for title and meta description
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const html = await response.text();

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          result.page_title = titleMatch[1].trim().substring(0, 255);
        }

        const metaMatch = html.match(
          /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
        );
        if (metaMatch) {
          result.meta_description = metaMatch[1].trim().substring(0, 500);
        }
      }
    } else if (response.status >= 400 && response.status < 500) {
      result.health = "warning";
    } else {
      result.health = "critical";
    }
  } catch (error: any) {
    result.response_time_ms = Date.now() - start;

    if (error.name === "AbortError") {
      result.health = "critical";
      result.http_code = 0;
    } else {
      result.health = "critical";
      result.http_code = 0;
    }
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Optional: check only specific domain
    const { domainId } = await req.json().catch(() => ({ domainId: null }));

    let query = supabase.from("domains").select("id, url");
    if (domainId) {
      query = query.eq("id", domainId);
    }

    const { data: domains, error: fetchError } = await query;
    if (fetchError) throw fetchError;
    if (!domains || domains.length === 0) {
      return new Response(JSON.stringify({ message: "No domains to check" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: CheckResult[] = [];

    // Check domains in parallel batches of 5
    const batchSize = 5;
    for (let i = 0; i < domains.length; i += batchSize) {
      const batch = domains.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (domain) => {
          const checkResult = await checkDomain(domain.url);
          return { id: domain.id, ...checkResult };
        })
      );
      results.push(...batchResults);
    }

    // Update all domains in database
    for (const result of results) {
      const { id, ...updates } = result;

      await supabase.from("domains").update(updates).eq("id", id);

      // Log to check_history
      await supabase.from("check_history").insert({
        domain_id: id,
        check_type: "domain",
        status: updates.health === "healthy" ? "online" : updates.health === "critical" ? "offline" : "error",
        http_code: updates.http_code,
        response_time_ms: updates.response_time_ms,
      });
    }

    const summary = {
      checked: results.length,
      healthy: results.filter((r) => r.health === "healthy").length,
      warning: results.filter((r) => r.health === "warning").length,
      critical: results.filter((r) => r.health === "critical").length,
      results: results.map((r) => ({
        id: r.id,
        health: r.health,
        http_code: r.http_code,
        response_time_ms: r.response_time_ms,
      })),
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
