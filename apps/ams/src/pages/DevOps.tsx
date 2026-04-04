import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, GitBranch, Webhook, AlertTriangle } from 'lucide-react';
import { useSystemMetrics, useGitHubEvents, useWebhookLogs, useDevOpsStats } from '@/hooks/useDevOps';

export default function DevOps() {
  const { data: metrics, isLoading: metricsLoading } = useSystemMetrics();
  const { data: github } = useGitHubEvents();
  const { data: webhooks } = useWebhookLogs();
  const stats = useDevOpsStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DevOps & Monitoring</h1>
          <p className="text-muted-foreground">System-Metriken, GitHub-Events und Webhook-Logs</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Metriken</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMetrics}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">GitHub Events</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGithubEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWebhooks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fehlgeschlagen</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.failedWebhooks}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="metrics">Metriken ({metrics?.length || 0})</TabsTrigger>
            <TabsTrigger value="github">GitHub ({github?.length || 0})</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks ({webhooks?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Metrik</th>
                    <th className="p-3 text-right text-sm font-medium">Wert</th>
                    <th className="p-3 text-left text-sm font-medium">App ID</th>
                    <th className="p-3 text-left text-sm font-medium">Zeitpunkt</th>
                  </tr>
                </thead>
                <tbody>
                  {metricsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={4} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : metrics?.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{m.metric_name || '–'}</td>
                      <td className="p-3 text-right">{m.metric_value?.toLocaleString('de-DE') || '–'}</td>
                      <td className="p-3"><code className="text-xs">{m.app_id?.slice(0, 12) || 'global'}...</code></td>
                      <td className="p-3 text-sm text-muted-foreground">{m.recorded_at ? new Date(m.recorded_at).toLocaleString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!metrics || metrics.length === 0) && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Keine Metriken vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="github" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Event</th>
                    <th className="p-3 text-left text-sm font-medium">Repo</th>
                    <th className="p-3 text-left text-sm font-medium">Akteur</th>
                    <th className="p-3 text-left text-sm font-medium">Zeitpunkt</th>
                  </tr>
                </thead>
                <tbody>
                  {github?.map((e) => (
                    <tr key={e.id} className="border-b hover:bg-muted/50">
                      <td className="p-3"><Badge variant="outline">{e.event_type || '–'}</Badge></td>
                      <td className="p-3 text-sm">{e.repo || '–'}</td>
                      <td className="p-3 text-sm">{e.actor || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{e.created_at ? new Date(e.created_at).toLocaleString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!github || github.length === 0) && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Keine GitHub-Events vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Quelle</th>
                    <th className="p-3 text-left text-sm font-medium">Event</th>
                    <th className="p-3 text-right text-sm font-medium">Status Code</th>
                    <th className="p-3 text-center text-sm font-medium">Verarbeitet</th>
                    <th className="p-3 text-left text-sm font-medium">Fehler</th>
                    <th className="p-3 text-left text-sm font-medium">Zeitpunkt</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks?.map((w) => (
                    <tr key={w.id} className={`border-b hover:bg-muted/50 ${w.processing_error ? 'bg-red-50 dark:bg-red-950' : ''}`}>
                      <td className="p-3"><Badge variant="outline">{w.source || '–'}</Badge></td>
                      <td className="p-3 text-sm">{w.event_type || '–'}</td>
                      <td className="p-3 text-right">
                        <Badge className={
                          (w.status_code || 0) >= 200 && (w.status_code || 0) < 300 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }>
                          {w.status_code || '–'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={w.processed ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700'}>
                          {w.processed ? 'Ja' : 'Nein'}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-destructive truncate max-w-[200px]">{w.processing_error || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{w.created_at ? new Date(w.created_at).toLocaleString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!webhooks || webhooks.length === 0) && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Keine Webhook-Logs vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
