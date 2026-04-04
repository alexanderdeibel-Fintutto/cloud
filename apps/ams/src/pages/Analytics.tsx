import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Activity, Cpu, DollarSign, Zap, AlertTriangle, AppWindow } from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar,
} from 'recharts';
import { useAIUsageDaily, useServiceUsageDaily, useAdminDashboard, useAITopFeatures, useAnalyticsStats } from '@/hooks/useAnalytics';

export default function Analytics() {
  const { isLoading: aiLoading } = useAIUsageDaily();
  const { isLoading: serviceLoading } = useServiceUsageDaily();
  const { data: dashboard, isLoading: dashLoading } = useAdminDashboard();
  const { data: topFeatures, isLoading: featuresLoading } = useAITopFeatures();
  const stats = useAnalyticsStats();

  const isLoading = aiLoading || serviceLoading || dashLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Usage</h1>
          <p className="text-muted-foreground">Detaillierte Einblicke in die Plattformnutzung</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nutzer gesamt</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+{stats.newUsers7d} (7 Tage)</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">{stats.totalAIRequests.toLocaleString('de-DE')}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">{stats.totalServiceRequests.toLocaleString('de-DE')}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Kosten</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">${stats.totalAICost.toFixed(2)}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aktive Apps</CardTitle>
              <AppWindow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.activeApps}</div>
                  <p className="text-xs text-muted-foreground">{stats.errorsToday} Fehler heute</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ai-usage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ai-usage">AI-Nutzung</TabsTrigger>
            <TabsTrigger value="service-usage">Service-Nutzung</TabsTrigger>
            <TabsTrigger value="features">Top Features</TabsTrigger>
            <TabsTrigger value="overview">Platform-Ubersicht</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Requests & Kosten (letzte 30 Tage)</CardTitle>
                <CardDescription>Tagliche AI-Nutzung uber alle Apps</CardDescription>
              </CardHeader>
              <CardContent>
                {aiLoading ? <Skeleton className="h-[300px] w-full" /> : stats.aiChart.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.aiChart}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" tickFormatter={d => d.slice(5)} />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                          }}
                        />
                        <Area type="monotone" dataKey="requests" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} name="Requests" />
                        <Area type="monotone" dataKey="tokens" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeWidth={2} name="Tokens" yAxisId={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Noch keine AI-Nutzungsdaten vorhanden</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service-usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service-Nutzung (letzte 30 Tage)</CardTitle>
                <CardDescription>Tagliche Service-Requests und Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {serviceLoading ? <Skeleton className="h-[300px] w-full" /> : stats.serviceChart.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.serviceChart}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" tickFormatter={d => d.slice(5)} />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                          }}
                        />
                        <Bar dataKey="requests" fill="hsl(var(--primary))" name="Requests" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="users" fill="hsl(var(--chart-2))" name="Unique Users" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Noch keine Service-Nutzungsdaten vorhanden</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top AI Features</CardTitle>
                <CardDescription>Meist genutzte KI-Features nach Requests</CardDescription>
              </CardHeader>
              <CardContent>
                {featuresLoading ? <Skeleton className="h-[300px] w-full" /> : topFeatures && topFeatures.length > 0 ? (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left text-sm font-medium">Feature</th>
                          <th className="p-3 text-left text-sm font-medium">Prompt Key</th>
                          <th className="p-3 text-right text-sm font-medium">Requests</th>
                          <th className="p-3 text-right text-sm font-medium">Tokens</th>
                          <th className="p-3 text-right text-sm font-medium">Avg. Response</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topFeatures.map((f, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-medium">{f.feature || '-'}</td>
                            <td className="p-3"><Badge variant="outline">{f.prompt_key || '-'}</Badge></td>
                            <td className="p-3 text-right">{(f.usage_count || 0).toLocaleString('de-DE')}</td>
                            <td className="p-3 text-right">{(f.total_tokens || 0).toLocaleString('de-DE')}</td>
                            <td className="p-3 text-right">{f.avg_response_time_ms ? `${Math.round(f.avg_response_time_ms)}ms` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Noch keine Feature-Daten vorhanden</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle className="text-base">Platform-Zahlen</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm">Nutzer gesamt</span><span className="font-medium">{dashboard?.total_users || 0}</span></div>
                    <div className="flex justify-between"><span className="text-sm">Neue Nutzer (30 Tage)</span><span className="font-medium">{dashboard?.new_users_30d || 0}</span></div>
                    <div className="flex justify-between"><span className="text-sm">Neue Nutzer (7 Tage)</span><span className="font-medium">{dashboard?.new_users_7d || 0}</span></div>
                    <div className="flex justify-between"><span className="text-sm">Neue Nutzer (heute)</span><span className="font-medium">{dashboard?.new_users_today || 0}</span></div>
                    <div className="flex justify-between"><span className="text-sm">Organisationen</span><span className="font-medium">{dashboard?.total_organizations || 0}</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Subscriptions</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm">Aktive Abos</span><span className="font-medium">{dashboard?.active_subscriptions || 0}</span></div>
                    <div className="flex justify-between"><span className="text-sm">Paid Abos</span><span className="font-medium">{dashboard?.paid_subscriptions || 0}</span></div>
                    <div className="flex justify-between"><span className="text-sm">Aktive Apps</span><span className="font-medium">{dashboard?.active_apps || 0}</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">System Health</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Fehler heute</span>
                      <Badge className={
                        (dashboard?.errors_today || 0) > 10 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        (dashboard?.errors_today || 0) > 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }>
                        {dashboard?.errors_today || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ungelöste Fehler</span>
                      <span className="font-medium">{dashboard?.unresolved_errors || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Webhooks heute</span>
                      <span className="font-medium">{dashboard?.webhooks_today || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. AI Response</span>
                      <span className="font-medium">{stats.avgResponseTime}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
