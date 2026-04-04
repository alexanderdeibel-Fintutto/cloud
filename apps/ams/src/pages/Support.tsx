import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Clock, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { CSVExport } from '@/components/ui/csv-export';
import { useServiceRequests, useSupportStats } from '@/hooks/useSupport';

export default function Support() {
  const [search, setSearch] = useState('');
  const { data: requests, isLoading } = useServiceRequests();
  const stats = useSupportStats();

  const filtered = requests?.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    (r.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string | null) => {
    switch (s) {
      case 'open': case 'new': case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in_progress': case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': case 'resolved': case 'closed': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': case 'rejected': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const urgencyColor = (u: string | null) => {
    switch (u) {
      case 'critical': case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': case 'normal': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Support & Tickets</h1>
            <p className="text-muted-foreground">Service-Anfragen und Tickets verwalten</p>
          </div>
          <CSVExport data={(requests || []) as Record<string, unknown>[]} filename="tickets" label="Tickets CSV" />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Offene Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openCount}</div>
              <p className="text-xs text-muted-foreground">von {stats.total} gesamt</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dringend</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.urgentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Heute gelost</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Kategorien</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tickets">Alle Tickets ({requests?.length || 0})</TabsTrigger>
            <TabsTrigger value="stats">Statistiken</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Tickets suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Titel</th>
                    <th className="p-3 text-left text-sm font-medium">Typ</th>
                    <th className="p-3 text-left text-sm font-medium">Kategorie</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Dringlichkeit</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={6} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : filtered && filtered.length > 0 ? filtered.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium truncate max-w-[250px]">{r.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[250px]">{r.description}</div>
                      </td>
                      <td className="p-3"><Badge variant="outline">{r.request_type}</Badge></td>
                      <td className="p-3"><Badge variant="outline">{r.category || '-'}</Badge></td>
                      <td className="p-3"><Badge className={statusColor(r.status)}>{r.status || 'new'}</Badge></td>
                      <td className="p-3"><Badge className={urgencyColor(r.urgency)}>{r.urgency || 'normal'}</Badge></td>
                      <td className="p-3 text-sm text-muted-foreground">{r.created_at ? new Date(r.created_at).toLocaleString('de-DE') : '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Keine Tickets vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Nach Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <Badge className={statusColor(status)}>{status}</Badge>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                    {Object.keys(stats.byStatus).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">Keine Daten</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Nach Kategorie</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-sm">{cat}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                    {Object.keys(stats.byCategory).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">Keine Daten</p>
                    )}
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
