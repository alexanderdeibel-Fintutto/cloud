import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Search, CreditCard, Handshake, Palette } from 'lucide-react';
import { useOrganizations, useOrgMemberships, useOrgStats } from '@/hooks/useOrganizations';

export default function Organizations() {
  const [search, setSearch] = useState('');
  const { data: orgs, isLoading } = useOrganizations();
  const { data: memberships } = useOrgMemberships();
  const stats = useOrgStats();

  const filtered = orgs?.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.slug.toLowerCase().includes(search.toLowerCase()) ||
    (o.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const getMemberCount = (orgId: string) => memberships?.filter(m => m.org_id === orgId).length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organisationen</h1>
          <p className="text-muted-foreground">Alle Organisationen, Teams und deren Konfiguration</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Organisationen</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">{stats.active} aktiv</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mitglieder</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mit Stripe</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withStripe}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Uber Partner</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withPartner}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">White-Label</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.whiteLabel}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Organisationen suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left text-sm font-medium">Organisation</th>
                <th className="p-3 text-left text-sm font-medium">Typ</th>
                <th className="p-3 text-left text-sm font-medium">Status</th>
                <th className="p-3 text-right text-sm font-medium">Mitglieder</th>
                <th className="p-3 text-left text-sm font-medium">Standort</th>
                <th className="p-3 text-left text-sm font-medium">Stripe</th>
                <th className="p-3 text-left text-sm font-medium">Erstellt</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b"><td colSpan={7} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                ))
              ) : filtered?.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Keine Organisationen gefunden</td></tr>
              ) : (
                filtered?.map((org) => (
                  <tr key={org.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {org.logo_url ? <img src={org.logo_url} className="h-6 w-6 rounded" alt="" /> : (
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">{org.name.charAt(0)}</div>
                        )}
                        <div>
                          <div className="font-medium">{org.name}</div>
                          <div className="text-xs text-muted-foreground">{org.email || org.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="outline">{org.type}</Badge></td>
                    <td className="p-3">
                      <Badge className={org.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700'}>
                        {org.status || 'unknown'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">{getMemberCount(org.id)}</td>
                    <td className="p-3 text-sm">{org.city || '–'}{org.country ? `, ${org.country}` : ''}</td>
                    <td className="p-3">
                      {org.stripe_customer_id ? (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Verbunden</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">–</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {org.created_at ? new Date(org.created_at).toLocaleDateString('de-DE') : '–'}
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
