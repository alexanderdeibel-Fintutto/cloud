import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface ApiCheckResult {
  label: string;
  url: string;
  category: 'app' | 'supabase' | 'edge' | 'api' | 'stripe';
  status: 'ok' | 'error' | 'loading';
  statusCode?: number;
  responseTimeMs?: number;
  detail?: string;
  checkedAt: string;
}

export interface ApiStatusLogEntry {
  id: string;
  checked_at: string;
  results: ApiCheckResult[];
  overall_ok: boolean;
  issues_count: number;
  created_at: string;
}

export interface UptimeSummary {
  label: string;
  category: string;
  uptime_pct: number;
  total_checks: number;
  ok_checks: number;
  last_status: 'ok' | 'error';
  last_checked: string;
}

// ─── Endpunkte ────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://aaefocdqgdgexkcrjhks.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA0NzAsImV4cCI6MjA4NDMzNjQ3MH0.Vc9ztBDTHJhFHGJPnfxFv7lrJBgDCKEBfH5Hb2QKPAI';

export const API_ENDPOINTS: Array<{ label: string; url: string; category: ApiCheckResult['category'] }> = [
  { label: 'App – Vermietify',        url: 'https://vermietify.fintutto.cloud',                                      category: 'app' },
  { label: 'App – AMS',               url: 'https://ams.fintutto.cloud',                                             category: 'app' },
  { label: 'Supabase REST API',        url: `${SUPABASE_URL}/rest/v1/`,                                               category: 'supabase' },
  { label: 'Supabase Auth',            url: `${SUPABASE_URL}/auth/v1/health`,                                         category: 'supabase' },
  { label: 'Supabase Storage',         url: `${SUPABASE_URL}/storage/v1/bucket`,                                      category: 'supabase' },
  { label: 'Edge Fn – send-email',     url: `${SUPABASE_URL}/functions/v1/send-email`,                               category: 'edge' },
  { label: 'Edge Fn – brevo-core',     url: `${SUPABASE_URL}/functions/v1/brevo-core`,                               category: 'edge' },
  { label: 'Edge Fn – on-user-signup', url: `${SUPABASE_URL}/functions/v1/on-user-signup`,                           category: 'edge' },
  { label: 'Edge Fn – ki-service',     url: `${SUPABASE_URL}/functions/v1/fintutto-ki-service`,                      category: 'edge' },
  { label: 'Stripe API',               url: `${SUPABASE_URL}/functions/v1/get-stripe-prices`,                        category: 'stripe' },
  { label: 'Legacy Redirect /properties', url: 'https://vermietify.fintutto.cloud/properties',                      category: 'app' },
  { label: 'Legacy Redirect /tenants',    url: 'https://vermietify.fintutto.cloud/tenants',                         category: 'app' },
  { label: 'Legacy Redirect /finances',   url: 'https://vermietify.fintutto.cloud/finances',                        category: 'app' },
];

// ─── Live-Check ───────────────────────────────────────────────────────────────

async function checkEndpoint(ep: typeof API_ENDPOINTS[0]): Promise<ApiCheckResult> {
  const start = Date.now();
  try {
    const headers: Record<string, string> = {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    };
    const res = await fetch(ep.url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(8000),
    });
    const ms = Date.now() - start;
    const ok = res.status < 500;
    return {
      label: ep.label,
      url: ep.url,
      category: ep.category,
      status: ok ? 'ok' : 'error',
      statusCode: res.status,
      responseTimeMs: ms,
      detail: `HTTP ${res.status}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    return {
      label: ep.label,
      url: ep.url,
      category: ep.category,
      status: 'error',
      responseTimeMs: Date.now() - start,
      detail: err instanceof Error ? err.message : 'Timeout / Netzwerkfehler',
      checkedAt: new Date().toISOString(),
    };
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Führt einen Live-Check aller Endpunkte durch */
export function useLiveApiCheck() {
  return useQuery({
    queryKey: ['api-live-check'],
    queryFn: async (): Promise<ApiCheckResult[]> => {
      const results = await Promise.all(API_ENDPOINTS.map(checkEndpoint));
      // Ergebnis in Supabase persistieren (best-effort)
      try {
        const overallOk = results.every(r => r.status === 'ok');
        const issuesCount = results.filter(r => r.status === 'error').length;
        await supabase.from('api_status_log').insert({
          checked_at: new Date().toISOString(),
          results: results as unknown as Record<string, unknown>[],
          overall_ok: overallOk,
          issues_count: issuesCount,
        });
      } catch {
        // Tabelle existiert noch nicht — ignorieren
      }
      return results;
    },
    refetchInterval: 5 * 60 * 1000, // alle 5 Minuten
    staleTime: 4 * 60 * 1000,
  });
}

/** Lädt historische Check-Logs aus Supabase */
export function useApiStatusHistory(limit = 50) {
  return useQuery({
    queryKey: ['api-status-history', limit],
    queryFn: async (): Promise<ApiStatusLogEntry[]> => {
      const { data, error } = await supabase
        .from('api_status_log')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as ApiStatusLogEntry[];
    },
    staleTime: 60 * 1000,
  });
}

/** Berechnet Uptime-Zusammenfassung aus historischen Logs */
export function useUptimeSummary(history: ApiStatusLogEntry[]) {
  if (!history || history.length === 0) return [];

  const summary: Record<string, { ok: number; total: number; lastStatus: 'ok' | 'error'; lastChecked: string; category: string }> = {};

  for (const entry of history) {
    if (!Array.isArray(entry.results)) continue;
    for (const r of entry.results as unknown as ApiCheckResult[]) {
      if (!summary[r.label]) {
        summary[r.label] = { ok: 0, total: 0, lastStatus: 'ok', lastChecked: '', category: r.category };
      }
      summary[r.label].total++;
      if (r.status === 'ok') summary[r.label].ok++;
      if (!summary[r.label].lastChecked || r.checkedAt > summary[r.label].lastChecked) {
        summary[r.label].lastChecked = r.checkedAt;
        summary[r.label].lastStatus = r.status;
      }
    }
  }

  return Object.entries(summary)
    .map(([label, s]) => ({
      label,
      category: s.category,
      uptime_pct: Math.round((s.ok / s.total) * 1000) / 10,
      total_checks: s.total,
      ok_checks: s.ok,
      last_status: s.lastStatus,
      last_checked: s.lastChecked,
    }))
    .sort((a, b) => a.uptime_pct - b.uptime_pct) as UptimeSummary[];
}

/** Manueller Refresh-Trigger */
export function useRefreshApiCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await qc.invalidateQueries({ queryKey: ['api-live-check'] });
    },
  });
}
