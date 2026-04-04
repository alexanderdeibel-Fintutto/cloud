import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Handshake, Search, MousePointerClick, UserPlus, CreditCard,
  TrendingUp, ExternalLink, DollarSign, Users, Eye
} from 'lucide-react';
import { CSVExport } from '@/components/ui/csv-export';
import {
  usePartners, useAffiliatePerformance, useAffiliateTracking,
  usePartnerCommissions, usePartnerPayouts, usePartnerStats
} from '@/hooks/usePartners';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  churned: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
};

export default function Partners() {
  const [search, setSearch] = useState('');
  const { data: partners, isLoading: partnersLoading } = usePartners();
  const { data: performance, isLoading: perfLoading } = useAffiliatePerformance();
  const { data: tracking } = useAffiliateTracking();
  const { data: commissions } = usePartnerCommissions();
  const { data: payouts } = usePartnerPayouts();
  const stats = usePartnerStats();

  const filteredPartners = partners?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.company_name.toLowerCase().includes(search.toLowerCase()) ||
    p.contact_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partner & Affiliate</h1>
            <p className="text-muted-foreground">Partner-Netzwerk, Affiliate-Tracking und Provisionen verwalten</p>
          </div>
          <div className="flex gap-2">
            <CSVExport data={(partners || []) as Record<string, unknown>[]} filename="partners" label="Partner CSV" />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Partner gesamt</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {partnersLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.totalPartners}</div>
                  <p className="text-xs text-muted-foreground">{stats.activePartners} aktiv, {stats.pendingPartners} ausstehend</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Klicks gesamt</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {perfLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString('de-DE')}</div>
                  <p className="text-xs text-muted-foreground">{stats.totalConversions} Conversions</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Umsatz via Partner</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.totalRevenue / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
              <p className="text-xs text-muted-foreground">Gesamt-Umsatz durch Affiliates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Provisionen</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.totalCommissions / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
              <p className="text-xs text-muted-foreground">Gesamt ausgezahlte Provisionen</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="partners" className="space-y-4">
          <TabsList>
            <TabsTrigger value="partners">Partner ({partners?.length || 0})</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="tracking">Clicks & Tracking ({tracking?.length || 0})</TabsTrigger>
            <TabsTrigger value="commissions">Provisionen ({commissions?.length || 0})</TabsTrigger>
            <TabsTrigger value="payouts">Auszahlungen ({payouts?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Partner suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Partner</th>
                    <th className="p-3 text-left text-sm font-medium">Typ</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Referral Code</th>
                    <th className="p-3 text-left text-sm font-medium">Provision %</th>
                    <th className="p-3 text-left text-sm font-medium">Onboarding</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {partnersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={7} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : filteredPartners?.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Keine Partner gefunden</td></tr>
                  ) : (
                    filteredPartners?.map((partner) => (
                      <tr key={partner.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{partner.company_name}</div>
                            <div className="text-xs text-muted-foreground">{partner.contact_email}</div>
                          </div>
                        </td>
                        <td className="p-3"><Badge variant="outline">{partner.partner_type}</Badge></td>
                        <td className="p-3">
                          <Badge className={statusColors[partner.status || 'pending']}>{partner.status || 'pending'}</Badge>
                        </td>
                        <td className="p-3"><code className="text-xs bg-muted px-1 py-0.5 rounded">{partner.referral_code || '–'}</code></td>
                        <td className="p-3">{partner.referral_commission_percent ? `${partner.referral_commission_percent}%` : '–'}</td>
                        <td className="p-3">
                          {partner.onboarding_completed ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Fertig</Badge>
                          ) : (
                            <Badge variant="outline">Schritt {partner.onboarding_step || 0}</Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {partner.created_at ? new Date(partner.created_at).toLocaleDateString('de-DE') : '–'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Partner</th>
                    <th className="p-3 text-right text-sm font-medium">Klicks</th>
                    <th className="p-3 text-right text-sm font-medium">Signups</th>
                    <th className="p-3 text-right text-sm font-medium">Conversions</th>
                    <th className="p-3 text-right text-sm font-medium">Conv. Rate</th>
                    <th className="p-3 text-right text-sm font-medium">Umsatz</th>
                    <th className="p-3 text-right text-sm font-medium">Provisionen</th>
                  </tr>
                </thead>
                <tbody>
                  {performance?.map((perf) => (
                    <tr key={perf.partner_id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{perf.partner_name || perf.partner_id}</td>
                      <td className="p-3 text-right">{perf.total_clicks?.toLocaleString('de-DE') || 0}</td>
                      <td className="p-3 text-right">{perf.total_signups?.toLocaleString('de-DE') || 0}</td>
                      <td className="p-3 text-right">{perf.total_conversions?.toLocaleString('de-DE') || 0}</td>
                      <td className="p-3 text-right">{perf.conversion_rate ? `${(perf.conversion_rate * 100).toFixed(1)}%` : '0%'}</td>
                      <td className="p-3 text-right">{((perf.total_revenue || 0) / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="p-3 text-right">{((perf.total_commissions || 0) / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                    </tr>
                  ))}
                  {(!performance || performance.length === 0) && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Keine Performance-Daten vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Click ID</th>
                    <th className="p-3 text-left text-sm font-medium">Referral Code</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Land/Stadt</th>
                    <th className="p-3 text-left text-sm font-medium">Device</th>
                    <th className="p-3 text-left text-sm font-medium">UTM Source</th>
                    <th className="p-3 text-left text-sm font-medium">Besuch</th>
                  </tr>
                </thead>
                <tbody>
                  {tracking?.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/50">
                      <td className="p-3"><code className="text-xs">{t.click_id.slice(0, 8)}...</code></td>
                      <td className="p-3"><code className="text-xs bg-muted px-1 py-0.5 rounded">{t.referral_code}</code></td>
                      <td className="p-3"><Badge variant="outline">{t.status || 'clicked'}</Badge></td>
                      <td className="p-3 text-sm">{t.country || '–'}{t.city ? `, ${t.city}` : ''}</td>
                      <td className="p-3 text-sm">{t.device_type || '–'}</td>
                      <td className="p-3 text-sm">{t.utm_source || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {t.visited_at ? new Date(t.visited_at).toLocaleDateString('de-DE') : '–'}
                      </td>
                    </tr>
                  ))}
                  {(!tracking || tracking.length === 0) && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Keine Tracking-Daten vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">ID</th>
                    <th className="p-3 text-left text-sm font-medium">Partner ID</th>
                    <th className="p-3 text-right text-sm font-medium">Betrag</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions?.map((c: Record<string, unknown>) => (
                    <tr key={c.id as string} className="border-b hover:bg-muted/50">
                      <td className="p-3"><code className="text-xs">{(c.id as string).slice(0, 8)}...</code></td>
                      <td className="p-3 text-sm">{(c.partner_id as string)?.slice(0, 8) || '–'}...</td>
                      <td className="p-3 text-right">{((c.amount as number || 0) / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="p-3"><Badge variant="outline">{c.status as string || 'pending'}</Badge></td>
                      <td className="p-3 text-sm text-muted-foreground">{c.created_at ? new Date(c.created_at as string).toLocaleDateString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!commissions || commissions.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Provisionen vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">ID</th>
                    <th className="p-3 text-left text-sm font-medium">Partner ID</th>
                    <th className="p-3 text-right text-sm font-medium">Betrag</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts?.map((p: Record<string, unknown>) => (
                    <tr key={p.id as string} className="border-b hover:bg-muted/50">
                      <td className="p-3"><code className="text-xs">{(p.id as string).slice(0, 8)}...</code></td>
                      <td className="p-3 text-sm">{(p.partner_id as string)?.slice(0, 8) || '–'}...</td>
                      <td className="p-3 text-right">{((p.amount as number || 0) / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="p-3"><Badge variant="outline">{p.status as string || 'pending'}</Badge></td>
                      <td className="p-3 text-sm text-muted-foreground">{p.created_at ? new Date(p.created_at as string).toLocaleDateString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!payouts || payouts.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Auszahlungen vorhanden</td></tr>
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
