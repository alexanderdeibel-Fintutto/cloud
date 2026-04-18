import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, LineChart, Line, ReferenceLine, Cell,
} from 'recharts';
import {
  Activity, RefreshCw, CheckCircle2, XCircle, Clock,
  Zap, Globe, Server, AlertTriangle, TrendingUp,
} from 'lucide-react';
import { useLiveApiCheck, useApiStatusHistory, useUptimeSummary, API_ENDPOINTS } from '@/hooks/useApiStatus';
import type { ApiCheckResult } from '@/hooks/useApiStatus';

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  app: 'App',
  supabase: 'Supabase',
  edge: 'Edge Functions',
  api: 'API',
  stripe: 'Stripe',
};

const CATEGORY_COLORS: Record<string, string> = {
  app: '#6366f1',
  supabase: '#22c55e',
  edge: '#f59e0b',
  api: '#3b82f6',
  stripe: '#8b5cf6',
};

function StatusBadge({ status }: { status: 'ok' | 'error' | 'loading' }) {
  if (status === 'loading') return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Prüfe...</Badge>;
  if (status === 'ok') return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />OK</Badge>;
  return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Fehler</Badge>;
}

function UptimeBar({ pct }: { pct: number }) {
  const color = pct >= 99 ? '#22c55e' : pct >= 95 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono w-12 text-right" style={{ color }}>{pct.toFixed(1)}%</span>
    </div>
  );
}

// ─── KPI-Karte ────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, accent }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: accent }} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 pl-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pl-5">
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function ApiStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: liveResults, isLoading: liveLoading, refetch } = useLiveApiCheck();
  const { data: history = [], isLoading: historyLoading } = useApiStatusHistory(100);
  const uptimeSummary = useUptimeSummary(history);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // KPI-Werte
  const totalEndpoints = API_ENDPOINTS.length;
  const okCount = liveResults?.filter(r => r.status === 'ok').length ?? 0;
  const errorCount = liveResults?.filter(r => r.status === 'error').length ?? 0;
  const avgResponseMs = liveResults && liveResults.length > 0
    ? Math.round(liveResults.reduce((s, r) => s + (r.responseTimeMs ?? 0), 0) / liveResults.length)
    : 0;
  const overallOk = errorCount === 0 && !liveLoading;

  // Verlauf-Daten für LineChart (letzte 20 Checks)
  const historyChartData = [...history]
    .reverse()
    .slice(-20)
    .map(e => ({
      ts: new Date(e.checked_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      issues: e.issues_count,
      ok: e.overall_ok ? 1 : 0,
    }));

  // Uptime-Daten für BarChart
  const uptimeChartData = uptimeSummary
    .slice()
    .sort((a, b) => a.uptime_pct - b.uptime_pct)
    .map(s => ({
      label: s.label.length > 22 ? s.label.slice(0, 22) + '…' : s.label,
      fullLabel: s.label,
      uptime: s.uptime_pct,
      category: s.category,
    }));

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6">

          {/* ── Header ── */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">API Verfügbarkeit</h1>
              <p className="text-muted-foreground mt-1">
                Live-Status und historische Uptime aller Vermietify-Endpunkte
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!liveLoading && (
                <Badge
                  className={overallOk
                    ? 'bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1'
                    : 'bg-red-100 text-red-800 border-red-200 text-sm px-3 py-1'}
                >
                  {overallOk ? <CheckCircle2 className="h-4 w-4 mr-1.5" /> : <AlertTriangle className="h-4 w-4 mr-1.5" />}
                  {overallOk ? 'Alle Systeme betriebsbereit' : `${errorCount} Problem${errorCount !== 1 ? 'e' : ''} erkannt`}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || liveLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || liveLoading) ? 'animate-spin' : ''}`} />
                Aktualisieren
              </Button>
            </div>
          </div>

          {/* ── KPI-Karten ── */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <KpiCard
              title="Endpunkte gesamt"
              value={totalEndpoints}
              sub="REST, Auth, Edge, Stripe"
              icon={Globe}
              accent="#6366f1"
            />
            <KpiCard
              title="Erreichbar"
              value={liveLoading ? '…' : okCount}
              sub={`von ${totalEndpoints} Endpunkten`}
              icon={CheckCircle2}
              accent="#22c55e"
            />
            <KpiCard
              title="Probleme"
              value={liveLoading ? '…' : errorCount}
              sub="aktuell nicht erreichbar"
              icon={XCircle}
              accent={errorCount > 0 ? '#ef4444' : '#22c55e'}
            />
            <KpiCard
              title="Ø Antwortzeit"
              value={liveLoading ? '…' : `${avgResponseMs} ms`}
              sub="über alle Endpunkte"
              icon={Clock}
              accent="#f59e0b"
            />
            <KpiCard
              title="Checks gesamt"
              value={history.length}
              sub="historische Einträge"
              icon={TrendingUp}
              accent="#3b82f6"
            />
          </div>

          {/* ── Tabs ── */}
          <Tabs defaultValue="live" className="space-y-4">
            <TabsList>
              <TabsTrigger value="live">
                <Activity className="h-4 w-4 mr-2" />
                Live-Status
              </TabsTrigger>
              <TabsTrigger value="history">
                <TrendingUp className="h-4 w-4 mr-2" />
                Verlauf & Uptime
              </TabsTrigger>
              <TabsTrigger value="incidents">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Incident-Log
              </TabsTrigger>
            </TabsList>

            {/* ── Tab: Live-Status ── */}
            <TabsContent value="live" className="space-y-4">
              {/* Gruppenweise nach Kategorie */}
              {(['app', 'supabase', 'edge', 'stripe'] as const).map(cat => {
                const endpoints = API_ENDPOINTS.filter(e => e.category === cat);
                const results = liveResults?.filter(r => r.category === cat) ?? [];
                return (
                  <Card key={cat}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                        <CardTitle className="text-base">{CATEGORY_LABELS[cat]}</CardTitle>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {results.filter(r => r.status === 'ok').length}/{endpoints.length} OK
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50 border-b">
                              <th className="p-3 text-left font-medium">Endpunkt</th>
                              <th className="p-3 text-left font-medium">Status</th>
                              <th className="p-3 text-right font-medium">HTTP</th>
                              <th className="p-3 text-right font-medium">Antwortzeit</th>
                              <th className="p-3 text-left font-medium">Detail</th>
                            </tr>
                          </thead>
                          <tbody>
                            {liveLoading
                              ? endpoints.map((_, i) => (
                                  <tr key={i} className="border-b">
                                    <td colSpan={5} className="p-3">
                                      <Skeleton className="h-5 w-full" />
                                    </td>
                                  </tr>
                                ))
                              : endpoints.map(ep => {
                                  const r = results.find(x => x.label === ep.label);
                                  return (
                                    <tr key={ep.label} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                      <td className="p-3 font-medium">{ep.label}</td>
                                      <td className="p-3">
                                        <StatusBadge status={r?.status ?? 'loading'} />
                                      </td>
                                      <td className="p-3 text-right font-mono text-xs text-muted-foreground">
                                        {r?.statusCode ?? '–'}
                                      </td>
                                      <td className="p-3 text-right font-mono text-xs">
                                        {r?.responseTimeMs != null
                                          ? <span className={r.responseTimeMs > 2000 ? 'text-yellow-600' : 'text-muted-foreground'}>
                                              {r.responseTimeMs} ms
                                            </span>
                                          : '–'}
                                      </td>
                                      <td className="p-3 text-xs text-muted-foreground truncate max-w-[200px]">
                                        {r?.detail ?? '–'}
                                      </td>
                                    </tr>
                                  );
                                })
                            }
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* ── Tab: Verlauf & Uptime ── */}
            <TabsContent value="history" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">

                {/* Probleme pro Check */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Probleme pro Check-Lauf</CardTitle>
                    <CardDescription>Letzte 20 automatische Checks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <Skeleton className="h-48 w-full" />
                    ) : historyChartData.length === 0 ? (
                      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                        Noch keine historischen Daten vorhanden
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={historyChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="ts" tick={{ fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <RechartTooltip
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                            formatter={(v: number) => [`${v} Problem(e)`, 'Probleme']}
                          />
                          <ReferenceLine y={0} stroke="#22c55e" strokeDasharray="4 2" />
                          <Line
                            type="monotone"
                            dataKey="issues"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={(props) => {
                              const { cx, cy, payload } = props;
                              return (
                                <circle
                                  key={`dot-${cx}-${cy}`}
                                  cx={cx}
                                  cy={cy}
                                  r={payload.issues > 0 ? 5 : 3}
                                  fill={payload.issues > 0 ? '#ef4444' : '#22c55e'}
                                  stroke="white"
                                  strokeWidth={1.5}
                                />
                              );
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Uptime-Donut nach Kategorie */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Uptime nach Kategorie</CardTitle>
                    <CardDescription>Durchschnitt über alle historischen Checks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <Skeleton className="h-48 w-full" />
                    ) : uptimeSummary.length === 0 ? (
                      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                        Noch keine historischen Daten vorhanden
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(['app', 'supabase', 'edge', 'stripe'] as const).map(cat => {
                          const items = uptimeSummary.filter(s => s.category === cat);
                          if (items.length === 0) return null;
                          const avg = items.reduce((s, i) => s + i.uptime_pct, 0) / items.length;
                          return (
                            <div key={cat} className="flex items-center gap-3">
                              <div className="w-24 text-xs font-medium text-muted-foreground">{CATEGORY_LABELS[cat]}</div>
                              <div className="flex-1">
                                <UptimeBar pct={Math.round(avg * 10) / 10} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Uptime pro Endpunkt */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Uptime pro Endpunkt</CardTitle>
                  <CardDescription>Basierend auf {history.length} historischen Check-Läufen</CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : uptimeChartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                      Noch keine historischen Daten vorhanden. Der erste automatische Check läuft nächsten Montag.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={Math.max(200, uptimeChartData.length * 32)}>
                      <BarChart data={uptimeChartData} layout="vertical" margin={{ left: 8, right: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[90, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={180} />
                        <RechartTooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          formatter={(v: number, _: string, props: { payload?: { fullLabel?: string } }) => [
                            `${v.toFixed(1)}%`,
                            props.payload?.fullLabel ?? 'Uptime',
                          ]}
                        />
                        <ReferenceLine x={99} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: '99% SLA', position: 'top', fontSize: 10, fill: '#94a3b8' }} />
                        <Bar dataKey="uptime" radius={[0, 4, 4, 0]}>
                          {uptimeChartData.map((entry, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={CATEGORY_COLORS[entry.category] ?? '#6366f1'}
                              opacity={0.85}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Uptime-Tabelle */}
              {uptimeSummary.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detaillierte Uptime-Tabelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b">
                            <th className="p-3 text-left font-medium">Endpunkt</th>
                            <th className="p-3 text-left font-medium">Kategorie</th>
                            <th className="p-3 text-right font-medium">Uptime</th>
                            <th className="p-3 text-right font-medium">OK / Gesamt</th>
                            <th className="p-3 text-left font-medium">Letzter Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uptimeSummary.map(s => (
                            <tr key={s.label} className="border-b last:border-0 hover:bg-muted/30">
                              <td className="p-3 font-medium">{s.label}</td>
                              <td className="p-3">
                                <Badge variant="outline" style={{ borderColor: CATEGORY_COLORS[s.category], color: CATEGORY_COLORS[s.category] }}>
                                  {CATEGORY_LABELS[s.category] ?? s.category}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                <UptimeBar pct={s.uptime_pct} />
                              </td>
                              <td className="p-3 text-right font-mono text-xs text-muted-foreground">
                                {s.ok_checks}/{s.total_checks}
                              </td>
                              <td className="p-3">
                                <StatusBadge status={s.last_status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ── Tab: Incident-Log ── */}
            <TabsContent value="incidents">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Incident-Log</CardTitle>
                  <CardDescription>Alle Check-Läufe mit Problemen</CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b">
                            <th className="p-3 text-left font-medium">Datum & Uhrzeit</th>
                            <th className="p-3 text-right font-medium">Probleme</th>
                            <th className="p-3 text-left font-medium">Betroffene Endpunkte</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.filter(e => !e.overall_ok).length === 0 ? (
                            <tr>
                              <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                Keine Incidents — alle Checks erfolgreich
                              </td>
                            </tr>
                          ) : (
                            history
                              .filter(e => !e.overall_ok)
                              .map(e => {
                                const failedEndpoints = Array.isArray(e.results)
                                  ? (e.results as unknown as ApiCheckResult[]).filter(r => r.status === 'error')
                                  : [];
                                return (
                                  <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="p-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                                      {new Date(e.checked_at).toLocaleString('de-DE')}
                                    </td>
                                    <td className="p-3 text-right">
                                      <Badge variant="destructive">{e.issues_count}</Badge>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex flex-wrap gap-1">
                                        {failedEndpoints.map(r => (
                                          <Tooltip key={r.label}>
                                            <TooltipTrigger asChild>
                                              <Badge variant="outline" className="text-xs border-red-200 text-red-700 cursor-default">
                                                {r.label}
                                              </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="text-xs">{r.detail ?? 'Kein Detail'}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* ── Footer ── */}
          <p className="text-xs text-muted-foreground text-center pb-4">
            <Zap className="h-3 w-3 inline mr-1" />
            Live-Checks werden automatisch alle 5 Minuten aktualisiert · Wöchentliche Checks jeden Montag 08:00 Uhr
          </p>

        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
