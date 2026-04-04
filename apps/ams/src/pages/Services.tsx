import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Server, Search, Activity, Key, Gauge } from 'lucide-react';
import { useServicesRegistry, useServiceUsageLogs, useServicesOverview, useUpdateService } from '@/hooks/useServices';

export default function Services() {
  const [search, setSearch] = useState('');
  const { data: services, isLoading } = useServicesRegistry();
  const { data: usageLogs } = useServiceUsageLogs();
  const { data: overview } = useServicesOverview();
  const updateService = useUpdateService();

  const filtered = services?.filter(s =>
    s.display_name.toLowerCase().includes(search.toLowerCase()) ||
    s.service_key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services & APIs</h1>
          <p className="text-muted-foreground">Externe Services, API-Keys und Nutzung verwalten</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Services gesamt</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{services?.filter(s => s.is_active).length || 0} aktiv</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Live</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services?.filter(s => s.is_live).length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">API-Key benotigt</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services?.filter(s => s.requires_api_key).length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usage Logs</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageLogs?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="registry" className="space-y-4">
          <TabsList>
            <TabsTrigger value="registry">Service Registry ({services?.length || 0})</TabsTrigger>
            <TabsTrigger value="usage">Usage Logs ({usageLogs?.length || 0})</TabsTrigger>
            <TabsTrigger value="overview">Ubersicht</TabsTrigger>
          </TabsList>

          <TabsContent value="registry" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Services suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Service</th>
                    <th className="p-3 text-left text-sm font-medium">Kategorie</th>
                    <th className="p-3 text-left text-sm font-medium">Integration</th>
                    <th className="p-3 text-left text-sm font-medium">Apps</th>
                    <th className="p-3 text-left text-sm font-medium">Tiers</th>
                    <th className="p-3 text-center text-sm font-medium">Aktiv</th>
                    <th className="p-3 text-center text-sm font-medium">Live</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={7} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : filtered?.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium">{service.display_name}</div>
                        <div className="text-xs text-muted-foreground">{service.service_key}</div>
                      </td>
                      <td className="p-3"><Badge variant="outline">{service.category}</Badge></td>
                      <td className="p-3"><Badge variant="outline">{service.integration_type}</Badge></td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {service.apps_enabled?.slice(0, 3).map(app => <Badge key={app} variant="outline" className="text-xs">{app.slice(0, 8)}</Badge>)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {service.tiers_enabled?.map(tier => <Badge key={tier} variant="outline" className="text-xs">{tier}</Badge>)}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Switch checked={service.is_active ?? false} onCheckedChange={() => updateService.mutate({ id: service.id, is_active: !service.is_active })} />
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={service.is_live ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700'}>
                          {service.is_live ? 'Live' : 'Test'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Service</th>
                    <th className="p-3 text-left text-sm font-medium">App ID</th>
                    <th className="p-3 text-right text-sm font-medium">Requests</th>
                    <th className="p-3 text-right text-sm font-medium">Kosten</th>
                    <th className="p-3 text-left text-sm font-medium">Zeitpunkt</th>
                  </tr>
                </thead>
                <tbody>
                  {usageLogs?.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{log.service_key || '–'}</td>
                      <td className="p-3"><code className="text-xs">{log.app_id.slice(0, 12)}...</code></td>
                      <td className="p-3 text-right">{log.request_count || 0}</td>
                      <td className="p-3 text-right">{log.cost_cents ? `${(log.cost_cents / 100).toFixed(2)} €` : '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{log.created_at ? new Date(log.created_at).toLocaleString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!usageLogs || usageLogs.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Usage-Daten vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Service</th>
                    <th className="p-3 text-left text-sm font-medium">Daten</th>
                  </tr>
                </thead>
                <tbody>
                  {overview?.map((item: Record<string, unknown>, i: number) => (
                    <tr key={i} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{JSON.stringify(item).slice(0, 50)}</td>
                      <td className="p-3 text-sm text-muted-foreground">{JSON.stringify(item).slice(50, 150)}</td>
                    </tr>
                  ))}
                  {(!overview || overview.length === 0) && (
                    <tr><td colSpan={2} className="p-8 text-center text-muted-foreground">Keine Ubersichtsdaten vorhanden</td></tr>
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
