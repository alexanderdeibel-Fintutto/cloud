import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AppWindow, Search, Zap, ArrowRightLeft, Globe, Layers } from 'lucide-react';
import { useAppsRegistry, useEcosystem, useCrossSellRules, useUpdateApp } from '@/hooks/useAppsRegistry';

export default function AppRegistry() {
  const [search, setSearch] = useState('');
  const { data: apps, isLoading } = useAppsRegistry();
  const { data: ecosystem } = useEcosystem();
  const { data: crossSellRules } = useCrossSellRules();
  const updateApp = useUpdateApp();

  const filtered = apps?.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = (id: string, currentValue: boolean | null) => {
    updateApp.mutate({ id, is_active: !currentValue });
  };

  const handleToggleBeta = (id: string, currentValue: boolean | null) => {
    updateApp.mutate({ id, is_beta: !currentValue });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Registry & Ecosystem</h1>
          <p className="text-muted-foreground">Alle Apps im Fintutto-Ecosystem verwalten und steuern</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Apps gesamt</CardTitle>
              <AppWindow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apps?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{apps?.filter(a => a.is_active).length || 0} aktiv</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Beta-Apps</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apps?.filter(a => a.is_beta).length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cross-Sell Rules</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crossSellRules?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{crossSellRules?.filter(r => r.is_active).length || 0} aktiv</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ecosystem</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ecosystem?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Apps mit Pricing</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="apps" className="space-y-4">
          <TabsList>
            <TabsTrigger value="apps">App Registry ({apps?.length || 0})</TabsTrigger>
            <TabsTrigger value="ecosystem">Ecosystem View</TabsTrigger>
            <TabsTrigger value="crosssell">Cross-Sell Rules ({crossSellRules?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="apps" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Apps suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">App</th>
                    <th className="p-3 text-left text-sm font-medium">Slug</th>
                    <th className="p-3 text-left text-sm font-medium">Kategorie</th>
                    <th className="p-3 text-left text-sm font-medium">Min. Tier</th>
                    <th className="p-3 text-center text-sm font-medium">Aktiv</th>
                    <th className="p-3 text-center text-sm font-medium">Beta</th>
                    <th className="p-3 text-center text-sm font-medium">Public</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={7} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : filtered?.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Keine Apps gefunden</td></tr>
                  ) : (
                    filtered?.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {app.icon_url ? <img src={app.icon_url} className="h-6 w-6 rounded" alt="" /> : <AppWindow className="h-6 w-6 text-muted-foreground" />}
                            <div>
                              <div className="font-medium">{app.name}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">{app.tagline || app.description || '–'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3"><code className="text-xs bg-muted px-1 py-0.5 rounded">{app.slug}</code></td>
                        <td className="p-3"><Badge variant="outline">{app.category || '–'}</Badge></td>
                        <td className="p-3"><Badge variant="outline">{app.min_subscription_tier || 'free'}</Badge></td>
                        <td className="p-3 text-center">
                          <Switch checked={app.is_active ?? false} onCheckedChange={() => handleToggleActive(app.id, app.is_active)} />
                        </td>
                        <td className="p-3 text-center">
                          <Switch checked={app.is_beta ?? false} onCheckedChange={() => handleToggleBeta(app.id, app.is_beta)} />
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={app.is_public ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700'}>
                            {app.is_public ? 'Ja' : 'Nein'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="ecosystem" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ecosystem?.map((app) => (
                <Card key={app.app_id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {app.icon && <span className="text-2xl">{app.icon}</span>}
                      <div>
                        <CardTitle className="text-base">{app.app_name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{app.category}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{app.tagline || app.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {app.has_free_tier && <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Free Tier</Badge>}
                        <Badge variant="outline">{app.tier_count || 0} Tiers</Badge>
                      </div>
                      {app.starting_price != null && (
                        <span className="text-sm font-medium">ab {(app.starting_price / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}/Mo</span>
                      )}
                    </div>
                    {app.cross_sell_for && app.cross_sell_for.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">Cross-Sell:</span>
                        {app.cross_sell_for.map(cs => <Badge key={cs} variant="outline" className="text-xs">{cs}</Badge>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!ecosystem || ecosystem.length === 0) && (
                <div className="col-span-full p-8 text-center text-muted-foreground">Keine Ecosystem-Daten vorhanden</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="crosssell" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Headline</th>
                    <th className="p-3 text-left text-sm font-medium">Trigger</th>
                    <th className="p-3 text-left text-sm font-medium">Empfehlung</th>
                    <th className="p-3 text-left text-sm font-medium">Personas</th>
                    <th className="p-3 text-right text-sm font-medium">Prio</th>
                    <th className="p-3 text-center text-sm font-medium">Aktiv</th>
                  </tr>
                </thead>
                <tbody>
                  {crossSellRules?.map((rule) => (
                    <tr key={rule.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{rule.headline}</td>
                      <td className="p-3"><Badge variant="outline">{rule.trigger_type}</Badge></td>
                      <td className="p-3"><Badge variant="outline">{rule.recommend_type}</Badge></td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {rule.target_personas?.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
                        </div>
                      </td>
                      <td className="p-3 text-right">{rule.priority || '–'}</td>
                      <td className="p-3 text-center">
                        <Badge className={rule.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700'}>
                          {rule.is_active ? 'Ja' : 'Nein'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {(!crossSellRules || crossSellRules.length === 0) && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Keine Cross-Sell Rules vorhanden</td></tr>
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
