/**
 * useGmailSync — AMS Hook für SecondBrain Gmail-Sync
 *
 * Kapselt alle Operationen rund um:
 * - OAuth-Token-Status prüfen (GitHub Secret vorhanden + gültig)
 * - Sync-Läufe aus Supabase lesen
 * - Manuellen Sync via GitHub Actions workflow_dispatch auslösen
 * - Statistiken aggregieren
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ─── Konstanten (aus Umgebungsvariablen) ───────────────────────────────────
// Secrets werden NICHT hardcodiert — via VITE_* Env-Vars konfigurieren:
// VITE_GITHUB_PAT, VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_CLIENT_SECRET
const GITHUB_PAT    = import.meta.env.VITE_GITHUB_PAT ?? '';
const REPO          = import.meta.env.VITE_GITHUB_REPO ?? 'alexanderdeibel-Fintutto/portal';
const WORKFLOW      = 'gmail-sync.yml';
const CLIENT_ID     = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET ?? '';
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL ?? 'https://aaefocdqgdgexkcrjhks.supabase.co';

// ─── Typen ──────────────────────────────────────────────────────────────────
export interface GmailSyncRun {
  id: string;
  user_id: string | null;
  triggered_by: 'cron' | 'manual' | 'webhook';
  status: 'running' | 'success' | 'error' | 'skipped';
  processed: number;
  skipped: number;
  errors: number;
  documents: string[];
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
}

export interface TokenStatus {
  exists: boolean;
  valid: boolean;
  email?: string;
  error?: string;
  checkedAt: string;
}

export interface SyncStats {
  totalRuns: number;
  totalProcessed: number;
  totalErrors: number;
  lastSyncAt: string | null;
  successfulRuns: number;
  failedRuns: number;
}

// ─── Sync-Läufe aus Supabase ────────────────────────────────────────────────
export function useGmailSyncRuns(limit = 20) {
  return useQuery<GmailSyncRun[]>({
    queryKey: ['gmail-sync-runs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gmail_sync_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as GmailSyncRun[];
    },
    refetchInterval: 30_000,
  });
}

// ─── Aggregat-Statistiken ───────────────────────────────────────────────────
export function useGmailSyncStats() {
  return useQuery<SyncStats>({
    queryKey: ['gmail-sync-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gmail_sync_stats')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      if (!data) return {
        totalRuns: 0, totalProcessed: 0, totalErrors: 0,
        lastSyncAt: null, successfulRuns: 0, failedRuns: 0,
      };
      return {
        totalRuns:      Number(data.total_runs ?? 0),
        totalProcessed: Number(data.total_processed ?? 0),
        totalErrors:    Number(data.total_errors ?? 0),
        lastSyncAt:     data.last_sync_at as string | null,
        successfulRuns: Number(data.successful_runs ?? 0),
        failedRuns:     Number(data.failed_runs ?? 0),
      };
    },
    refetchInterval: 60_000,
  });
}

// ─── Token-Status prüfen ────────────────────────────────────────────────────
export function useGmailTokenStatus() {
  return useQuery<TokenStatus>({
    queryKey: ['gmail-token-status'],
    queryFn: async () => {
      const checkedAt = new Date().toISOString();

      // 1. Prüfen ob Secret in GitHub existiert
      const secretRes = await fetch(
        `https://api.github.com/repos/${REPO}/actions/secrets/GMAIL_OAUTH_TOKEN`,
        { headers: { Authorization: `token ${GITHUB_PAT}`, Accept: 'application/vnd.github+json' } }
      );

      if (!secretRes.ok) {
        return { exists: false, valid: false, error: 'Secret nicht in GitHub gefunden', checkedAt };
      }

      // 2. Token-Gültigkeit via Google tokeninfo prüfen
      // Wir rufen die Supabase Edge Function auf — sie kennt den Token via Secret
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/gmail-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: 'check_token' }),
        });
        const body = await res.json().catch(() => ({}));

        if (res.ok && body.token_valid) {
          return { exists: true, valid: true, email: body.email, checkedAt };
        }
        if (body.token_expired || body.error?.includes('invalid_grant')) {
          return { exists: true, valid: false, error: 'Token abgelaufen — Neu-Authentifizierung erforderlich', checkedAt };
        }
        // Fallback: Secret existiert, Gültigkeit unbekannt
        return { exists: true, valid: true, checkedAt };
      } catch {
        // Edge Function nicht erreichbar — Secret existiert, Status unbekannt
        return { exists: true, valid: true, checkedAt };
      }
    },
    staleTime: 5 * 60_000, // 5 Minuten cachen
    retry: false,
  });
}

// ─── Manuellen Sync auslösen ────────────────────────────────────────────────
export function useTriggerGmailSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { query?: string; maxResults?: number }) => {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${GITHUB_PAT}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: 'main',
            inputs: {
              query: params?.query ?? 'has:attachment filename:pdf -in:spam -in:trash newer_than:30d',
              max_results: String(params?.maxResults ?? 50),
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `HTTP ${res.status}`);
      }

      return { triggeredAt: new Date().toISOString() };
    },
    onSuccess: () => {
      // Nach 5s neu laden (Workflow braucht etwas Anlaufzeit)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['gmail-sync-runs'] });
        queryClient.invalidateQueries({ queryKey: ['gmail-sync-stats'] });
      }, 5000);
    },
  });
}

// ─── OAuth-URL generieren ───────────────────────────────────────────────────
export function buildGmailAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// ─── Token-Austausch (für Callback) ────────────────────────────────────────
export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.refresh_token) {
    throw new Error(data.error_description ?? data.error ?? 'Token-Austausch fehlgeschlagen');
  }
  return data as { refresh_token: string; access_token: string; expires_in: number };
}

// ─── GitHub Secret setzen ───────────────────────────────────────────────────
export async function saveTokenAsGitHubSecret(refreshToken: string): Promise<void> {
  // Public Key holen
  const keyRes = await fetch(
    `https://api.github.com/repos/${REPO}/actions/secrets/public-key`,
    { headers: { Authorization: `token ${GITHUB_PAT}`, Accept: 'application/vnd.github+json' } }
  );
  const keyData = await keyRes.json();
  if (!keyRes.ok) throw new Error(`GitHub API: ${keyData.message}`);

  // libsodium dynamisch laden
  const sodium = await import(
    'https://cdn.jsdelivr.net/npm/libsodium-wrappers@0.7.13/dist/modules/libsodium-wrappers.mjs' as any
  );
  await sodium.ready;

  const keyBytes       = sodium.from_base64(keyData.key, sodium.base64_variants.ORIGINAL);
  const secretBytes    = sodium.from_string(refreshToken);
  const encryptedBytes = sodium.crypto_box_seal(secretBytes, keyBytes);
  const encryptedValue = sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);

  const putRes = await fetch(
    `https://api.github.com/repos/${REPO}/actions/secrets/GMAIL_OAUTH_TOKEN`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_PAT}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ encrypted_value: encryptedValue, key_id: keyData.key_id }),
    }
  );

  if (!putRes.ok && putRes.status !== 201 && putRes.status !== 204) {
    const err = await putRes.json().catch(() => ({}));
    throw new Error(`Secret konnte nicht gesetzt werden: ${err.message ?? putRes.status}`);
  }
}
