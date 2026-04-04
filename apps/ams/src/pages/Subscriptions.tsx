import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Search, Clock, AlertTriangle, Bot, Armchair, Filter, Webhook } from 'lucide-react';
import { useSubscriptionsDeep, useSeatAllocations, useStripeWebhookEvents, useSubscriptionStats } from '@/hooks/useSubscriptionsDeep';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  canceled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  past_due: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  incomplete: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function Subscriptions() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: subs, isLoading } = useSubscriptionsDeep();
  const { data: seats } = useSeatAllocations();
  const { data: webhookEvents } = useStripeWebhookEvents();
  const stats = useSubscriptionStats();

  const filtered = subs?.filter(s => {
    const matchesSearch = (s.customer_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.stripe_subscription_id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions Deep Dive</h1>
          <p className="text-muted-foreground">Abos, Trials, Seats und Stripe-Events im Detail</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aktiv</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">von {stats.total} gesamt</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Trial</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trialing}</div>
              <p className="text-xs text-muted-foreground">{stats.trialExpiringSoon} laufen bald ab</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gekuendigt</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.canceled}</div>
              <p className="text-xs text-muted-foreground">{stats.cancelPending} Kuendigung ausstehend</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">KI-Zugang</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withKiAccess}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Past Due</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.pastDue}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subs">Subscriptions ({subs?.length || 0})</TabsTrigger>
            <TabsTrigger value="tiers">Nach Tier</TabsTrigger>
            <TabsTrigger value="seats">Seats ({seats?.length || 0})</TabsTrigger>
            <TabsTrigger value="webhooks">Stripe Events ({webhookEvents?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="subs" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="E-Mail oder Stripe ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="trialing">Trial</SelectItem>
                  <SelectItem value="canceled">Gekuendigt</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">E-Mail</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Tier</th>
                    <th className="p-3 text-left text-sm font-medium">Intervall</th>
                    <th className="p-3 text-center text-sm font-medium">KI</th>
                    <th className="p-3 text-left text-sm font-medium">Periode endet</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={7} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : filtered?.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Keine Subscriptions gefunden</td></tr>
                  ) : (
                    filtered?.map((sub) => (
                      <tr key={sub.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-sm">{sub.customer_email || '–'}</td>
                        <td className="p-3">
                          <Badge className={statusColors[sub.status] || 'bg-gray-100 text-gray-700'}>
                            {sub.status}{sub.cancel_at_period_end ? ' (kuendigt)' : ''}
                          </Badge>
                        </td>
                        <td className="p-3"><Badge variant="outline">{sub.tier || '–'}</Badge></td>
                        <td className="p-3 text-sm">{sub.billing_interval || '–'}</td>
                        <td className="p-3 text-center">{sub.ki_access ? <Bot className="h-4 w-4 text-primary mx-auto" /> : '–'}</td>
                        <td className="p-3 text-sm">{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString('de-DE') : '–'}</td>
                        <td className="p-3 text-sm text-muted-foreground">{sub.created_at ? new Date(sub.created_at).toLocaleDateString('de-DE') : '–'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="tiers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(stats.byTier).sort((a, b) => b[1] - a[1]).map(([tier, count]) => (
                <Card key={tier}>
                  <CardHeader className="pb-2"><CardTitle className="text-base capitalize">{tier}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{count}</div>
                    <p className="text-xs text-muted-foreground">{((count / stats.total) * 100).toFixed(1)}% aller Subscriptions</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seats" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Org ID</th>
                    <th className="p-3 text-left text-sm font-medium">App ID</th>
                    <th className="p-3 text-right text-sm font-medium">Genutzt</th>
                    <th className="p-3 text-right text-sm font-medium">Gesamt</th>
                    <th className="p-3 text-right text-sm font-medium">Auslastung</th>
                  </tr>
                </thead>
                <tbody>
                  {seats?.map((seat) => (
                    <tr key={seat.id} className="border-b hover:bg-muted/50">
                      <td className="p-3"><code className="text-xs">{seat.org_id.slice(0, 8)}...</code></td>
                      <td className="p-3"><code className="text-xs">{seat.app_id.slice(0, 8)}...</code></td>
                      <td className="p-3 text-right">{seat.used_seats || 0}</td>
                      <td className="p-3 text-right">{seat.total_seats || 0}</td>
                      <td className="p-3 text-right">
                        {seat.total_seats ? `${Math.round(((seat.used_seats || 0) / seat.total_seats) * 100)}%` : '–'}
                      </td>
                    </tr>
                  ))}
                  {(!seats || seats.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Seat-Daten vorhanden</td></tr>
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
                    <th className="p-3 text-left text-sm font-medium">Event Type</th>
                    <th className="p-3 text-left text-sm font-medium">Stripe Event ID</th>
                    <th className="p-3 text-center text-sm font-medium">Verarbeitet</th>
                    <th className="p-3 text-left text-sm font-medium">Fehler</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {webhookEvents?.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-muted/50">
                      <td className="p-3"><Badge variant="outline">{event.event_type || '–'}</Badge></td>
                      <td className="p-3"><code className="text-xs">{event.stripe_event_id || '–'}</code></td>
                      <td className="p-3 text-center">
                        <Badge className={event.processed ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700'}>
                          {event.processed ? 'Ja' : 'Nein'}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-destructive">{event.processing_error || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{event.created_at ? new Date(event.created_at).toLocaleString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!webhookEvents || webhookEvents.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Webhook-Events vorhanden</td></tr>
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
