/**
 * GmailSync — AMS-Seite für SecondBrain Gmail-Integration
 *
 * Tabs:
 * 1. Status      — Letzter Sync, Statistiken, Dokument-Zähler
 * 2. Sync        — Manuellen Sync auslösen + Verlauf
 * 3. Token       — OAuth-Token-Status prüfen + Neu-Authentifizierung
 * 4. OAuth-Setup — Google-Konto verbinden (OAuth-Flow)
 */
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Mail, RefreshCw, ShieldCheck, ShieldAlert, Play,
  CheckCircle2, XCircle, Clock, FileText, Activity,
  ExternalLink, AlertTriangle, Loader2, BarChart3,
} from 'lucide-react';
import {
  useGmailSyncRuns,
  useGmailSyncStats,
  useGmailTokenStatus,
  useTriggerGmailSync,
  buildGmailAuthUrl,
  type GmailSyncRun,
} from '@/hooks/useGmailSync';

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────
function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function formatDuration(ms: number | null) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StatusBadge({ status }: { status: GmailSyncRun['status'] }) {
  const map = {
    success: { label: 'Erfolgreich', variant: 'default' as const, icon: CheckCircle2, cls: 'bg-green-500/10 text-green-600 border-green-500/20' },
    error:   { label: 'Fehler',      variant: 'destructive' as const, icon: XCircle, cls: 'bg-red-500/10 text-red-600 border-red-500/20' },
    running: { label: 'Läuft...',    variant: 'secondary' as const, icon: Loader2, cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    skipped: { label: 'Übersprungen', variant: 'outline' as const, icon: Clock, cls: 'bg-muted text-muted-foreground' },
  };
  const { label, icon: Icon, cls } = map[status] ?? map.skipped;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─── Tab 1: Status-Übersicht ────────────────────────────────────────────────
function StatusTab() {
  const { data: stats, isLoading: statsLoading } = useGmailSyncStats();
  const { data: runs, isLoading: runsLoading } = useGmailSyncRuns(5);
  const lastRun = runs?.[0];

  return (
    <div className="space-y-6">
      {/* KPI-Karten */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Sync-Läufe gesamt', value: stats?.totalRuns, icon: Activity },
          { label: 'Dokumente importiert', value: stats?.totalProcessed, icon: FileText },
          { label: 'Erfolgreiche Läufe', value: stats?.successfulRuns, icon: CheckCircle2 },
          { label: 'Fehler gesamt', value: stats?.totalErrors, icon: XCircle },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading
                ? <Skeleton className="h-8 w-16" />
                : <div className="text-2xl font-bold">{value ?? 0}</div>
              }
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Letzter Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Letzter Sync</CardTitle>
          <CardDescription>
            {stats?.lastSyncAt ? `Zuletzt: ${formatDate(stats.lastSyncAt)}` : 'Noch kein Sync durchgeführt'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {runsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : lastRun ? (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <StatusBadge status={lastRun.status} />
                <span className="text-xs text-muted-foreground">{formatDate(lastRun.started_at)}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-green-600">{lastRun.processed}</div>
                  <div className="text-xs text-muted-foreground">Verarbeitet</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-yellow-600">{lastRun.skipped}</div>
                  <div className="text-xs text-muted-foreground">Übersprungen</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-red-600">{lastRun.errors}</div>
                  <div className="text-xs text-muted-foreground">Fehler</div>
                </div>
              </div>
              {lastRun.error_message && (
                <div className="rounded bg-destructive/10 p-2 text-xs text-destructive font-mono">
                  {lastRun.error_message}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Mail className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">Noch keine Sync-Läufe vorhanden.</p>
              <p className="text-xs mt-1">Verbinde zuerst dein Gmail-Konto im Tab "OAuth-Setup".</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zeitplan-Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Automatischer Zeitplan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <div>
              <p className="text-sm font-medium">Täglich um 06:00 MEZ</p>
              <p className="text-xs text-muted-foreground">
                GitHub Actions Cron-Job — <code className="font-mono">0 5 * * *</code> (UTC)
              </p>
            </div>
            <a
              href={`https://github.com/${`alexanderdeibel-Fintutto/portal`}/actions/workflows/gmail-sync.yml`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto"
            >
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-3 w-3" />
                GitHub Actions
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab 2: Sync auslösen + Verlauf ────────────────────────────────────────
function SyncTab() {
  const { data: runs, isLoading } = useGmailSyncRuns(20);
  const trigger = useTriggerGmailSync();
  const [query, setQuery] = useState('has:attachment filename:pdf -in:spam -in:trash newer_than:30d');
  const [maxResults, setMaxResults] = useState(50);

  const handleTrigger = async () => {
    try {
      await trigger.mutateAsync({ query, maxResults });
      toast.success('Sync gestartet! GitHub Actions läuft jetzt...');
    } catch (err: any) {
      toast.error(`Sync konnte nicht gestartet werden: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sync auslösen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="h-4 w-4" />
            Sync jetzt auslösen
          </CardTitle>
          <CardDescription>
            Startet den Gmail-Sync-Workflow manuell via GitHub Actions workflow_dispatch.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Gmail-Suchanfrage</label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max. Ergebnisse</label>
            <input
              type="number"
              value={maxResults}
              onChange={e => setMaxResults(Number(e.target.value))}
              min={1}
              max={500}
              className="w-32 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button
            onClick={handleTrigger}
            disabled={trigger.isPending}
            className="gap-2"
          >
            {trigger.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Wird gestartet...</>
            ) : (
              <><Play className="h-4 w-4" /> Sync starten</>
            )}
          </Button>
          {trigger.isSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Workflow gestartet — Ergebnis erscheint in ~30 Sekunden im Verlauf.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync-Verlauf */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Sync-Verlauf (letzte 20)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !runs?.length ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Noch keine Sync-Läufe vorhanden.
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Gestartet</th>
                    <th className="p-3 text-right font-medium">Verarbeitet</th>
                    <th className="p-3 text-right font-medium">Übersprungen</th>
                    <th className="p-3 text-right font-medium">Fehler</th>
                    <th className="p-3 text-right font-medium">Dauer</th>
                    <th className="p-3 text-left font-medium">Auslöser</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map(run => (
                    <tr key={run.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3"><StatusBadge status={run.status} /></td>
                      <td className="p-3 text-muted-foreground">{formatDate(run.started_at)}</td>
                      <td className="p-3 text-right font-mono text-green-600">{run.processed}</td>
                      <td className="p-3 text-right font-mono text-yellow-600">{run.skipped}</td>
                      <td className="p-3 text-right font-mono text-red-600">{run.errors}</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{formatDuration(run.duration_ms)}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">{run.triggered_by}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab 3: Token-Status ────────────────────────────────────────────────────
function TokenTab() {
  const { data: status, isLoading, refetch, isFetching } = useGmailTokenStatus();

  const redirectUri = `${window.location.origin}/gmail-sync/callback`;
  const authUrl = buildGmailAuthUrl(redirectUri);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            OAuth-Token-Status
          </CardTitle>
          <CardDescription>
            Prüft ob das GitHub Secret GMAIL_OAUTH_TOKEN vorhanden und gültig ist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : status ? (
            <>
              {/* Status-Anzeige */}
              <div className={`flex items-start gap-3 rounded-lg border p-4 ${
                status.valid
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              }`}>
                {status.valid
                  ? <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  : <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                }
                <div>
                  <p className={`font-semibold ${status.valid ? 'text-green-700' : 'text-red-700'}`}>
                    {status.valid ? 'Token gültig' : 'Token ungültig oder abgelaufen'}
                  </p>
                  {status.email && (
                    <p className="text-sm text-muted-foreground mt-0.5">Verbunden: {status.email}</p>
                  )}
                  {status.error && (
                    <p className="text-sm text-red-600 mt-0.5">{status.error}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Geprüft: {formatDate(status.checkedAt)}
                  </p>
                </div>
              </div>

              {/* Secret-Existenz */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground mb-1">GitHub Secret</div>
                  <div className="flex items-center gap-2">
                    {status.exists
                      ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                      : <XCircle className="h-4 w-4 text-red-600" />
                    }
                    <span className="text-sm font-medium">
                      {status.exists ? 'GMAIL_OAUTH_TOKEN vorhanden' : 'Secret fehlt'}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground mb-1">Token-Gültigkeit</div>
                  <div className="flex items-center gap-2">
                    {status.valid
                      ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                      : <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    }
                    <span className="text-sm font-medium">
                      {status.valid ? 'Gültig' : 'Abgelaufen'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Aktionen */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="gap-2"
                >
                  {isFetching
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <RefreshCw className="h-3 w-3" />
                  }
                  Erneut prüfen
                </Button>
                {!status.valid && (
                  <a href={authUrl}>
                    <Button size="sm" className="gap-2">
                      <Mail className="h-3 w-3" />
                      Neu authentifizieren
                    </Button>
                  </a>
                )}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Info-Box */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Wie funktioniert die Token-Prüfung?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            1. Die AMS prüft via GitHub API ob das Secret <code className="font-mono bg-muted px-1 rounded text-xs">GMAIL_OAUTH_TOKEN</code> im Repository existiert.
          </p>
          <p>
            2. Anschließend wird die Supabase Edge Function aufgerufen, die den Token gegen die Google API validiert.
          </p>
          <p>
            3. Bei abgelaufenem Token erscheint ein "Neu authentifizieren"-Button, der den OAuth-Flow neu startet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab 4: OAuth-Setup ─────────────────────────────────────────────────────
function OAuthSetupTab() {
  const redirectUri = `${window.location.origin}/gmail-sync/callback`;
  const authUrl = buildGmailAuthUrl(redirectUri);

  const steps = [
    {
      num: '01',
      title: 'Autorisierung',
      desc: 'Klicke auf "Mit Google anmelden" und melde dich mit deinem Google-Konto an.',
    },
    {
      num: '02',
      title: 'Token-Generierung',
      desc: 'Google sendet einen Authorization Code zurück. Die App tauscht ihn automatisch gegen einen dauerhaften Refresh Token.',
    },
    {
      num: '03',
      title: 'GitHub Secret',
      desc: 'Der Refresh Token wird direkt als GitHub Secret GMAIL_OAUTH_TOKEN gesetzt. Der tägliche Gmail-Sync startet automatisch.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Scope-Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 rounded-lg bg-blue-500/5 border border-blue-500/20 p-4">
            <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-700">Nur Lesezugriff</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Scope: <code className="font-mono bg-muted px-1 rounded text-xs">gmail.readonly</code> — Keine E-Mails werden gelöscht, verschoben oder versendet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schritte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">So funktioniert der Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{step.num}</span>
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-sm">{step.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Redirect URI für diesen Setup:{' '}
              <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{redirectUri}</code>
            </p>
            <a href={authUrl}>
              <Button size="lg" className="gap-2">
                <Mail className="h-4 w-4" />
                Mit Google anmelden
              </Button>
            </a>
            <p className="text-xs text-muted-foreground">
              Du wirst zu Google weitergeleitet. Nach der Autorisierung kehrst du automatisch hierher zurück.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wichtiger Hinweis */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-700">Redirect URI eintragen</p>
              <p className="text-muted-foreground mt-1">
                Die Redirect URI <code className="font-mono bg-muted px-1 rounded text-xs">{redirectUri}</code> muss in der{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google Cloud Console
                </a>{' '}
                unter dem OAuth-Client als autorisierte Weiterleitungs-URI eingetragen sein.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── OAuth-Callback-Handler ─────────────────────────────────────────────────
function OAuthCallbackHandler() {
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState('');

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const err = params.get('error');

    if (err) { setError(`Google: ${err}`); setPhase('error'); return; }
    if (!code) { setError('Kein Authorization Code'); setPhase('error'); return; }

    (async () => {
      try {
        const { exchangeCodeForToken, saveTokenAsGitHubSecret } = await import('@/hooks/useGmailSync');
        addLog('Authorization Code erhalten ✓');
        addLog('Tausche Code gegen Refresh Token...');
        const redirectUri = `${window.location.origin}/gmail-sync/callback`;
        const tokens = await exchangeCodeForToken(code, redirectUri);
        addLog('Refresh Token erhalten ✓');
        addLog('Speichere als GitHub Secret...');
        await saveTokenAsGitHubSecret(tokens.refresh_token);
        addLog('GMAIL_OAUTH_TOKEN gesetzt ✓');
        addLog('Gmail-Sync ist jetzt aktiv ✓');
        setPhase('done');
        // URL bereinigen
        window.history.replaceState({}, '', '/gmail-sync?tab=token');
        setTimeout(() => window.location.href = '/gmail-sync?tab=token', 2000);
      } catch (e: any) {
        setError(e.message);
        setPhase('error');
      }
    })();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {phase === 'done'
                ? <><CheckCircle2 className="h-5 w-5 text-green-600" /> OAuth abgeschlossen</>
                : phase === 'error'
                ? <><XCircle className="h-5 w-5 text-red-600" /> Fehler</>
                : <><Loader2 className="h-5 w-5 animate-spin" /> Verarbeite OAuth-Code...</>
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 font-mono text-xs space-y-1.5 min-h-[100px]">
              {log.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-green-600">›</span>
                  <span>{l}</span>
                </div>
              ))}
              {phase === 'loading' && (
                <div className="flex gap-2 text-muted-foreground">
                  <span className="text-green-600">›</span>
                  <span>Läuft...</span>
                </div>
              )}
            </div>
            {phase === 'error' && (
              <div className="rounded bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
                <div className="mt-2">
                  <a href="/gmail-sync?tab=setup">
                    <Button variant="outline" size="sm">← Zurück zum Setup</Button>
                  </a>
                </div>
              </div>
            )}
            {phase === 'done' && (
              <div className="rounded bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-700">
                Weiterleitung zum Token-Status...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ─── Haupt-Export ───────────────────────────────────────────────────────────
export default function GmailSync() {
  // Callback-Route innerhalb der Seite behandeln
  const isCallback = window.location.pathname.includes('/callback');
  if (isCallback) return <OAuthCallbackHandler />;

  const params = new URLSearchParams(window.location.search);
  const defaultTab = params.get('tab') ?? 'status';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="h-7 w-7" />
              Gmail-Sync
            </h1>
            <p className="text-muted-foreground">
              SecondBrain — Automatischer Gmail → Supabase Dokumenten-Import
            </p>
          </div>
          <a
            href={`https://github.com/alexanderdeibel-Fintutto/portal/actions/workflows/gmail-sync.yml`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              GitHub Actions
            </Button>
          </a>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="sync">Sync auslösen</TabsTrigger>
            <TabsTrigger value="token">Token-Status</TabsTrigger>
            <TabsTrigger value="setup">OAuth-Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="mt-6">
            <StatusTab />
          </TabsContent>
          <TabsContent value="sync" className="mt-6">
            <SyncTab />
          </TabsContent>
          <TabsContent value="token" className="mt-6">
            <TokenTab />
          </TabsContent>
          <TabsContent value="setup" className="mt-6">
            <OAuthSetupTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
