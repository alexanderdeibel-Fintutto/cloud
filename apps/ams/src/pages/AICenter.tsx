import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Cpu, DollarSign, Zap, Users, Clock } from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar,
} from 'recharts';
import { useAIUsageLogs, useAIConversations, useAICostsSummary, useAICenterStats } from '@/hooks/useAICenter';
import { useAIRateLimits } from '@/hooks/useAIConfig';

export default function AICenter() {
  const { isLoading: logsLoading } = useAIUsageLogs();
  const { data: conversations, isLoading: convsLoading } = useAIConversations();
  const { isLoading: costsLoading } = useAICostsSummary();
  const { data: rateLimits } = useAIRateLimits();
  const stats = useAICenterStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KI-Center</h1>
          <p className="text-muted-foreground">KI-Nutzung, Kosten, Rate Limits und Conversations</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tokens (7 Tage)</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {logsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">{stats.tokens7d.toLocaleString('de-DE')}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Kosten (7 Tage)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {logsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">${stats.cost7d.toFixed(2)}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Requests (7 Tage)</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {logsLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.requests7d.toLocaleString('de-DE')}</div>
                  <p className="text-xs text-muted-foreground">{stats.errorCount} Fehler</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aktive Nutzer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {logsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {logsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">{stats.avgResponseTime}ms</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="usage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="usage">Token-Verbrauch</TabsTrigger>
            <TabsTrigger value="costs">Kosten-Ubersicht</TabsTrigger>
            <TabsTrigger value="models">Nach Modell</TabsTrigger>
            <TabsTrigger value="users">Top-Nutzer</TabsTrigger>
            <TabsTrigger value="conversations">Conversations ({conversations?.length || 0})</TabsTrigger>
            <TabsTrigger value="limits">Rate Limits ({rateLimits?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tagliche Kosten & Requests</CardTitle>
                <CardDescription>Letzte 30 Tage AI-Nutzung</CardDescription>
              </CardHeader>
              <CardContent>
                {costsLoading ? <Skeleton className="h-[300px] w-full" /> : stats.costChart.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.costChart}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" tickFormatter={d => d.slice(5)} />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                        <Area type="monotone" dataKey="tokens" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} name="Tokens" />
                        <Area type="monotone" dataKey="requests" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeWidth={2} name="Requests" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Noch keine Token-Verbrauchsdaten</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Kosten nach Tag</CardTitle></CardHeader>
              <CardContent>
                {costsLoading ? <Skeleton className="h-[300px] w-full" /> : stats.costChart.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.costChart}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" tickFormatter={d => d.slice(5)} />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} formatter={(v) => [`$${Number(v).toFixed(4)}`, '']} />
                        <Bar dataKey="cost" fill="hsl(var(--chart-4))" name="Kosten ($)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Noch keine Kostendaten</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Modell</th>
                    <th className="p-3 text-right text-sm font-medium">Requests</th>
                    <th className="p-3 text-right text-sm font-medium">Tokens</th>
                    <th className="p-3 text-right text-sm font-medium">Kosten</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byModel.length > 0 ? stats.byModel.map((m) => (
                    <tr key={m.model} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{m.model}</td>
                      <td className="p-3 text-right">{m.requests.toLocaleString('de-DE')}</td>
                      <td className="p-3 text-right">{m.tokens.toLocaleString('de-DE')}</td>
                      <td className="p-3 text-right">${m.cost.toFixed(4)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Keine Modell-Daten</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">User ID</th>
                    <th className="p-3 text-right text-sm font-medium">Requests</th>
                    <th className="p-3 text-right text-sm font-medium">Tokens</th>
                    <th className="p-3 text-right text-sm font-medium">Kosten</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topUsers.length > 0 ? stats.topUsers.map((u) => (
                    <tr key={u.user_id} className="border-b hover:bg-muted/50">
                      <td className="p-3"><code className="text-xs">{u.user_id.slice(0, 12)}...</code></td>
                      <td className="p-3 text-right">{u.requests.toLocaleString('de-DE')}</td>
                      <td className="p-3 text-right">{u.tokens.toLocaleString('de-DE')}</td>
                      <td className="p-3 text-right">${u.cost.toFixed(4)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Keine Nutzer-Daten</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Titel</th>
                    <th className="p-3 text-left text-sm font-medium">Typ</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-right text-sm font-medium">Nachrichten</th>
                    <th className="p-3 text-right text-sm font-medium">Tokens</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {convsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={6} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : conversations && conversations.length > 0 ? conversations.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium truncate max-w-[200px]">{c.title || '-'}</td>
                      <td className="p-3"><Badge variant="outline">{c.conversation_type}</Badge></td>
                      <td className="p-3">
                        <Badge className={
                          c.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          c.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {c.status || 'unknown'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">{c.message_count || 0}</td>
                      <td className="p-3 text-right">{(c.total_tokens_used || 0).toLocaleString('de-DE')}</td>
                      <td className="p-3 text-sm text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleString('de-DE') : '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Keine Conversations vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">App ID</th>
                    <th className="p-3 text-left text-sm font-medium">Tier</th>
                    <th className="p-3 text-right text-sm font-medium">Req/Min</th>
                    <th className="p-3 text-right text-sm font-medium">Daily Limit</th>
                    <th className="p-3 text-right text-sm font-medium">Monthly Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {rateLimits && rateLimits.length > 0 ? rateLimits.map((rl) => (
                    <tr key={rl.id} className="border-b hover:bg-muted/50">
                      <td className="p-3"><code className="text-xs">{rl.app_id?.slice(0, 12) || '-'}...</code></td>
                      <td className="p-3"><Badge variant="outline">{rl.tier || '-'}</Badge></td>
                      <td className="p-3 text-right">{rl.requests_per_minute || '-'}</td>
                      <td className="p-3 text-right">{rl.daily_limit?.toLocaleString('de-DE') || '-'}</td>
                      <td className="p-3 text-right">{rl.monthly_limit?.toLocaleString('de-DE') || '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Rate Limits konfiguriert</td></tr>
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
