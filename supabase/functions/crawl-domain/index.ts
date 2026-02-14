import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PageResult {
  url: string;
  path: string;
  status: "online" | "offline" | "redirect" | "error";
  http_code: number;
  response_time_ms: number;
  page_title: string | null;
  meta_description: string | null;
  h1: string | null;
  has_canonical: boolean;
  has_og_tags: boolean;
  word_count: number;
  internal_links: string[];
  external_links: string[];
}

function extractLinks(html: string, baseUrl: string): { internal: string[]; external: string[] } {
  const internal: Set<string> = new Set();
  const external: Set<string> = new Set();
  const base = new URL(baseUrl);

  const linkRegex = /href=["']([^"'#]+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const href = match[1].trim();
      if (!href || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;

      const resolved = new URL(href, baseUrl);

      if (resolved.hostname === base.hostname) {
        const path = resolved.pathname + resolved.search;
        internal.add(path);
      } else {
        external.add(resolved.href);
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return { internal: [...internal], external: [...external] };
}

async function crawlPage(url: string): Promise<PageResult> {
  const parsed = new URL(url);
  const start = Date.now();

  const result: PageResult = {
    url,
    path: parsed.pathname || "/",
    status: "error",
    http_code: 0,
    response_time_ms: 0,
    page_title: null,
    meta_description: null,
    h1: null,
    has_canonical: false,
    has_og_tags: false,
    word_count: 0,
    internal_links: [],
    external_links: [],
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Fintutto-Crawler/1.0" },
    });

    clearTimeout(timeout);
    result.response_time_ms = Date.now() - start;
    result.http_code = response.status;

    if (response.status >= 200 && response.status < 400) {
      result.status = "online";
    } else if (response.status >= 300 && response.status < 400) {
      result.status = "redirect";
    } else {
      result.status = "offline";
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html") && result.status === "online") {
      const html = await response.text();

      // Title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) result.page_title = titleMatch[1].trim().substring(0, 255);

      // Meta description
      const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      if (metaMatch) result.meta_description = metaMatch[1].trim().substring(0, 500);

      // H1
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (h1Match) result.h1 = h1Match[1].trim().substring(0, 255);

      // Canonical
      result.has_canonical = /<link[^>]+rel=["']canonical["']/i.test(html);

      // OG tags
      result.has_og_tags = /<meta[^>]+property=["']og:/i.test(html);

      // Word count (rough)
      const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      result.word_count = textContent.split(" ").filter(Boolean).length;

      // Links
      const links = extractLinks(html, url);
      result.internal_links = links.internal;
      result.external_links = links.external;
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
    const { domainId, maxDepth = 2 } = await req.json();
    if (!domainId) {
      return new Response(JSON.stringify({ error: "domainId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get domain
    const { data: domain, error: domainError } = await supabase
      .from("domains")
      .select("*")
      .eq("id", domainId)
      .single();

    if (domainError || !domain) {
      return new Response(JSON.stringify({ error: "Domain not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create crawl job
    const { data: job } = await supabase
      .from("crawl_jobs")
      .insert({
        domain_id: domainId,
        status: "running",
        max_depth: maxDepth,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const visited = new Set<string>();
    const toVisit: { url: string; depth: number }[] = [{ url: domain.url, depth: 0 }];
    let pagesFound = 0;
    let linksFound = 0;

    while (toVisit.length > 0) {
      const current = toVisit.shift()!;
      const normalizedPath = new URL(current.url).pathname;

      if (visited.has(normalizedPath)) continue;
      visited.add(normalizedPath);

      const pageResult = await crawlPage(current.url);
      pagesFound++;

      // Upsert page
      const { data: page } = await supabase
        .from("pages")
        .upsert(
          {
            domain_id: domainId,
            url: current.url,
            path: pageResult.path,
            status: pageResult.status,
            http_code: pageResult.http_code,
            response_time_ms: pageResult.response_time_ms,
            page_title: pageResult.page_title,
            meta_description: pageResult.meta_description,
            h1: pageResult.h1,
            has_canonical: pageResult.has_canonical,
            has_og_tags: pageResult.has_og_tags,
            word_count: pageResult.word_count,
            last_check_at: new Date().toISOString(),
            depth: current.depth,
          },
          { onConflict: "domain_id,path" }
        )
        .select()
        .single();

      if (page) {
        // Insert links
        const allLinks = [
          ...pageResult.internal_links.map((url) => ({
            page_id: page.id,
            domain_id: domainId,
            url: new URL(url, domain.url).href,
            link_type: "internal",
            status: "pending" as const,
          })),
          ...pageResult.external_links.map((url) => ({
            page_id: page.id,
            domain_id: domainId,
            url,
            link_type: "external",
            status: "pending" as const,
          })),
        ];

        if (allLinks.length > 0) {
          // Delete old links for this page first
          await supabase.from("page_links").delete().eq("page_id", page.id);
          await supabase.from("page_links").insert(allLinks);
          linksFound += allLinks.length;
        }

        // Add internal links to crawl queue
        if (current.depth < maxDepth) {
          for (const internalPath of pageResult.internal_links) {
            if (!visited.has(internalPath)) {
              toVisit.push({
                url: new URL(internalPath, domain.url).href,
                depth: current.depth + 1,
              });
            }
          }
        }
      }

      // Safety: max 100 pages per crawl
      if (pagesFound >= 100) break;
    }

    // Update crawl job
    if (job) {
      await supabase
        .from("crawl_jobs")
        .update({
          status: "completed",
          pages_found: pagesFound,
          links_found: linksFound,
          pages_checked: pagesFound,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }

    return new Response(
      JSON.stringify({
        domain: domain.label,
        pagesFound,
        linksFound,
        crawled: [...visited],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
