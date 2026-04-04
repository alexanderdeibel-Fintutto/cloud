import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrench, Search, Calculator, Star, TrendingUp, Target } from 'lucide-react';
import { useToolsRegistry, useUpdateTool, useToolStats } from '@/hooks/useToolsRegistry';

export default function Tools() {
  const [search, setSearch] = useState('');
  const { data: tools, isLoading } = useToolsRegistry();
  const updateTool = useUpdateTool();
  const stats = useToolStats();

  const filtered = tools?.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tools Registry</h1>
          <p className="text-muted-foreground">Alle Rechner-Tools, Pricing und Performance verwalten</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tools gesamt</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{stats.active} aktiv</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premium</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premium}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Berechnungen</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCalculations.toLocaleString('de-DE')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Leads generiert</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads.toLocaleString('de-DE')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgConversion}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tools suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left text-sm font-medium">Tool</th>
                <th className="p-3 text-left text-sm font-medium">Kategorie</th>
                <th className="p-3 text-left text-sm font-medium">Typ</th>
                <th className="p-3 text-left text-sm font-medium">Tier</th>
                <th className="p-3 text-right text-sm font-medium">Free Limit</th>
                <th className="p-3 text-right text-sm font-medium">Preis</th>
                <th className="p-3 text-right text-sm font-medium">Berechnungen</th>
                <th className="p-3 text-right text-sm font-medium">Conv. Rate</th>
                <th className="p-3 text-center text-sm font-medium">Aktiv</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b"><td colSpan={9} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                ))
              ) : filtered?.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Keine Tools gefunden</td></tr>
              ) : (
                filtered?.map((tool) => (
                  <tr key={tool.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {tool.icon && <span className="text-lg">{tool.icon}</span>}
                        <div>
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-xs text-muted-foreground">{tool.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="outline">{tool.category}</Badge></td>
                    <td className="p-3"><Badge variant="outline">{tool.tool_type}</Badge></td>
                    <td className="p-3"><Badge variant="outline">{tool.tier || 'free'}</Badge></td>
                    <td className="p-3 text-right">{tool.free_limit || '∞'}</td>
                    <td className="p-3 text-right">{tool.premium_price_cents ? `${(tool.premium_price_cents / 100).toFixed(2)} €` : '–'}</td>
                    <td className="p-3 text-right">{tool.total_calculations?.toLocaleString('de-DE') || 0}</td>
                    <td className="p-3 text-right">{tool.conversion_rate ? `${(tool.conversion_rate * 100).toFixed(1)}%` : '–'}</td>
                    <td className="p-3 text-center">
                      <Switch checked={tool.is_active ?? false} onCheckedChange={() => updateTool.mutate({ id: tool.id, is_active: !tool.is_active })} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
