import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LinkCheckResult {
  url: string;
  status: "online" | "offline" | "redirect" | "error";
  http_code: number;
  response_time_ms: number;
  redirect_url: string | null;
}

async function checkLink(url: string): Promise<LinkCheckResult> {
  const start = Date.now();
  const result: LinkCheckResult = {
    url,
    status: "error",
    http_code: 0,
    response_time_ms: 0,
    redirect_url: null,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Fintutto-LinkChecker/1.0" },
    });

    clearTimeout(timeout);
    result.response_time_ms = Date.now() - start;
    result.http_code = response.status;

    if (response.redirected) {
      result.redirect_url = response.url;
    }

    if (response.status >= 200 && response.status < 300) {
      result.status = "online";
    } else if (response.status >= 300 && response.status < 400) {
      result.status = "redirect";
    } else {
      result.status = "offline";
    }
  } catch {
    result.response_time_ms = Date.now() - start;
    result.status = "error";
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { urls, linkIds } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let urlsToCheck: string[] = [];
    let linkIdMap: Record<string, string> = {};

    if (linkIds && linkIds.length > 0) {
      // Check existing page_links by ID
      const { data: links, error } = await supabase
        .from("page_links")
        .select("id, url")
        .in("id", linkIds);

      if (error) throw error;
      urlsToCheck = (links || []).map((l) => l.url);
      for (const l of links || []) {
        linkIdMap[l.url] = l.id;
      }
    } else if (urls && urls.length > 0) {
      // Check arbitrary URLs
      urlsToCheck = urls;
    } else {
      return new Response(
        JSON.stringify({ error: "Provide 'urls' or 'linkIds'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check in parallel batches of 10
    const results: LinkCheckResult[] = [];
    const batchSize = 10;
    for (let i = 0; i < urlsToCheck.length; i += batchSize) {
      const batch = urlsToCheck.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(checkLink));
      results.push(...batchResults);
    }

    // Update page_links if we have linkIds
    if (Object.keys(linkIdMap).length > 0) {
      for (const result of results) {
        const linkId = linkIdMap[result.url];
        if (linkId) {
          await supabase
            .from("page_links")
            .update({
              status: result.status,
              http_code: result.http_code,
              redirect_url: result.redirect_url,
              last_check_at: new Date().toISOString(),
            })
            .eq("id", linkId);
        }
      }
    }

    const summary = {
      checked: results.length,
      online: results.filter((r) => r.status === "online").length,
      offline: results.filter((r) => r.status === "offline").length,
      redirect: results.filter((r) => r.status === "redirect").length,
      error: results.filter((r) => r.status === "error").length,
      results,
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
