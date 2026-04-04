import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Search, UserPlus, TrendingUp, Star, Filter } from 'lucide-react';
import { CSVExport } from '@/components/ui/csv-export';
import { useLeads, useLeadStats } from '@/hooks/useLeads';

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  qualified: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  converted: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  lost: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function Leads() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: leads, isLoading } = useLeads();
  const stats = useLeadStats();

  const filtered = leads?.filter(l => {
    const matchesSearch = l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.company || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
            <p className="text-muted-foreground">Leads aus allen Apps verwalten, bewerten und konvertieren</p>
          </div>
          <CSVExport data={(leads || []) as Record<string, unknown>[]} filename="leads" label="Leads CSV" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Leads gesamt</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats.total}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Neue Leads</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new}</div>
              <p className="text-xs text-muted-foreground">Unbearbeitet</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Qualifiziert</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Konvertiert</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.converted}</div>
              <p className="text-xs text-muted-foreground">{stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : 0}% Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}</div>
              <p className="text-xs text-muted-foreground">von 100</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Alle Leads</TabsTrigger>
            <TabsTrigger value="sources">Nach Quelle</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Leads suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="new">Neu</SelectItem>
                  <SelectItem value="contacted">Kontaktiert</SelectItem>
                  <SelectItem value="qualified">Qualifiziert</SelectItem>
                  <SelectItem value="converted">Konvertiert</SelectItem>
                  <SelectItem value="lost">Verloren</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Lead</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-right text-sm font-medium">Score</th>
                    <th className="p-3 text-left text-sm font-medium">Quelle</th>
                    <th className="p-3 text-left text-sm font-medium">App</th>
                    <th className="p-3 text-left text-sm font-medium">Tags</th>
                    <th className="p-3 text-left text-sm font-medium">Letzte Aktivitat</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={7} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : filtered?.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Keine Leads gefunden</td></tr>
                  ) : (
                    filtered?.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{lead.first_name || ''} {lead.last_name || ''}</div>
                            <div className="text-xs text-muted-foreground">{lead.email}</div>
                            {lead.company && <div className="text-xs text-muted-foreground">{lead.company}</div>}
                          </div>
                        </td>
                        <td className="p-3"><Badge className={statusColors[lead.status || 'new']}>{lead.status || 'new'}</Badge></td>
                        <td className="p-3 text-right">
                          <span className={`font-medium ${(lead.lead_score || 0) >= 70 ? 'text-green-600' : (lead.lead_score || 0) >= 40 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                            {lead.lead_score || 0}
                          </span>
                        </td>
                        <td className="p-3 text-sm">{lead.source || '–'}</td>
                        <td className="p-3 text-sm">{lead.source_app || '–'}</td>
                        <td className="p-3">
                          <div className="flex gap-1 flex-wrap">
                            {lead.tags?.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {lead.last_activity_at ? new Date(lead.last_activity_at).toLocaleDateString('de-DE') : '–'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Nach Quelle</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.bySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-sm">{source}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((count / stats.total) * 200, 150)}px` }} />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Nach App</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byApp).sort((a, b) => b[1] - a[1]).map(([app, count]) => (
                      <div key={app} className="flex items-center justify-between">
                        <span className="text-sm">{app}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-chart-2" style={{ width: `${Math.min((count / stats.total) * 200, 150)}px` }} />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
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
