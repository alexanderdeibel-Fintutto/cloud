import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, ShoppingCart, Coins, TrendingUp } from 'lucide-react';
import { useUserCredits, useUserPurchases, useFinanceStats } from '@/hooks/useFinance';

export default function Finance() {
  const { data: credits, isLoading: creditsLoading } = useUserCredits();
  const { data: purchases, isLoading: purchasesLoading } = useUserPurchases();
  const stats = useFinanceStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finanzen & Guthaben</h1>
          <p className="text-muted-foreground">Credits, Kaufe und Umsatz-Ubersicht</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Credits</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCredits}</div>
              <p className="text-xs text-muted-foreground">{stats.totalCreditAmount} Gesamt-Guthaben</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Kaufe</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Umsatz</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Produkttypen</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.purchasesByType).length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="purchases" className="space-y-4">
          <TabsList>
            <TabsTrigger value="purchases">Kaufe ({purchases?.length || 0})</TabsTrigger>
            <TabsTrigger value="credits">Credits ({credits?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">User ID</th>
                    <th className="p-3 text-left text-sm font-medium">Produkttyp</th>
                    <th className="p-3 text-right text-sm font-medium">Betrag</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Stripe ID</th>
                    <th className="p-3 text-left text-sm font-medium">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasesLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={6} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : purchases?.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-muted/50">
                      <td className="p-3"><code className="text-xs">{p.user_id?.slice(0, 8) || '–'}...</code></td>
                      <td className="p-3"><Badge variant="outline">{p.product_type || '–'}</Badge></td>
                      <td className="p-3 text-right font-medium">{p.amount_cents ? `${(p.amount_cents / 100).toFixed(2)} ${p.currency || 'EUR'}` : '–'}</td>
                      <td className="p-3">
                        <Badge className={p.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700'}>
                          {p.status || '–'}
                        </Badge>
                      </td>
                      <td className="p-3"><code className="text-xs">{p.stripe_payment_id?.slice(0, 12) || '–'}</code></td>
                      <td className="p-3 text-sm text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!purchases || purchases.length === 0) && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Keine Kaufe vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="credits" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">User ID</th>
                    <th className="p-3 text-left text-sm font-medium">Typ</th>
                    <th className="p-3 text-right text-sm font-medium">Betrag</th>
                    <th className="p-3 text-left text-sm font-medium">Lauft ab</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {creditsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={5} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : credits?.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-muted/50">
                      <td className="p-3"><code className="text-xs">{c.user_id?.slice(0, 8) || '–'}...</code></td>
                      <td className="p-3"><Badge variant="outline">{c.credit_type || '–'}</Badge></td>
                      <td className="p-3 text-right font-medium">{c.amount || 0}</td>
                      <td className="p-3 text-sm">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('de-DE') : '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleDateString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!credits || credits.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Credits vorhanden</td></tr>
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
