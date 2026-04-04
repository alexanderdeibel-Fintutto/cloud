import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Euro, TrendingUp, Users, CreditCard, ArrowUpRight, ArrowDownRight,
  Activity, UserMinus, Send, FileText, RefreshCw, Wrench, BarChart3, Shield
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { useDashboardStats, useRecentActivity } from '@/hooks/useDashboardStats';
import { useAdminDashboard } from '@/hooks/useAnalytics';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function useRevenueChart() {
  return useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_payments')
        .select('amount, currency, paid_at, status')
        .eq('status', 'paid')
        .order('paid_at', { ascending: true });
      if (error) throw error;

      // Group by month
      const monthMap = new Map<string, { month: string; revenue: number; count: number }>();
      (data || []).forEach(p => {
        if (!p.paid_at) return;
        const date = new Date(p.paid_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleString('de-DE', { month: 'short', year: '2-digit' });
        const existing = monthMap.get(key) || { month: label, revenue: 0, count: 0 };
        existing.revenue += (p.amount || 0) / 100; // cents to euros
        existing.count++;
        monthMap.set(key, existing);
      });

      return Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([, v]) => v);
    },
  });
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch } = useDashboardStats();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();
  const { data: dashboard } = useAdminDashboard();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('upgrade') || action.includes('Upgrade')) return <ArrowUpRight className="h-4 w-4 text-primary" />;
    if (action.includes('cancel') || action.includes('Kündigung')) return <ArrowDownRight className="h-4 w-4 text-destructive" />;
    if (action.includes('support') || action.includes('ticket')) return <Send className="h-4 w-4 text-chart-4" />;
    return <Users className="h-4 w-4 text-chart-2" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
            <p className="text-muted-foreground">Willkommen zuruck! Hier ist die Ubersicht Ihrer Plattform.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Aktualisieren
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {statsLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                  <CardContent><Skeleton className="h-8 w-20" /></CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <KPICard title="MRR" value={formatCurrency(stats?.mrr || 0)} change={{ value: `${dashboard?.paid_subscriptions || 0} paid`, trend: 'up' }} icon={TrendingUp} />
              <KPICard title="ARR" value={formatCurrency(stats?.arr || 0)} change={{ value: `${dashboard?.active_subscriptions || 0} aktiv`, trend: 'up' }} icon={CreditCard} />
              <KPICard title="Aktive Nutzer" value={String(stats?.totalUsers || 0)} change={{ value: `+${dashboard?.new_users_7d || 0} (7d)`, trend: 'up' }} icon={Users} />
              <KPICard title="Aktive Abos" value={String(stats?.activeSubscriptions || 0)} change={{ value: `${dashboard?.active_apps || 0} Apps`, trend: 'up' }} icon={Euro} />
              <KPICard title="Churn Rate" value={`${stats?.churnRate || 0}%`} change={{ value: `${dashboard?.errors_today || 0} Fehler`, trend: (stats?.churnRate || 0) > 5 ? 'down' : 'up' }} icon={UserMinus} />
            </>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Umsatzentwicklung</CardTitle>
              <CardDescription>Monatlicher Umsatz aus Stripe Payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {revenueLoading ? <Skeleton className="h-full w-full" /> : revenueData && revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        formatter={(value) => [`€${Number(value).toFixed(2)}`, '']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} name="Umsatz" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Noch keine Zahlungsdaten vorhanden
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Live aus v_admin_dashboard</CardDescription>
                </div>
                <Activity className="h-5 w-5 text-chart-2 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Aktive Apps</span>
                  <Badge variant="default">{dashboard?.active_apps || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fehler heute</span>
                  <Badge className={
                    (dashboard?.errors_today || 0) > 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }>
                    {dashboard?.errors_today || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ungeloste Fehler</span>
                  <Badge variant="outline">{dashboard?.unresolved_errors || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Webhooks heute</span>
                  <Badge variant="outline">{dashboard?.webhooks_today || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Neue Nutzer heute</span>
                  <Badge variant="outline">{dashboard?.new_users_today || 0}</Badge>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Organisationen</span>
                    <span className="font-bold">{dashboard?.total_organizations || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Letzte Aktivitaten</CardTitle>
              <CardDescription>Neueste Admin-Logs auf der Plattform</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 6).map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          {getActivityIcon(activity.action)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{activity.user_email || 'System'}</p>
                          <p className="text-xs text-muted-foreground">{activity.action}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {activity.created_at ? format(new Date(activity.created_at), 'dd.MM. HH:mm', { locale: de }) : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Keine Aktivitaten vorhanden</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schnellaktionen</CardTitle>
              <CardDescription>Haufig verwendete Funktionen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/users')}>
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Nutzer verwalten</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/subscriptions')}>
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Subscriptions</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/tools')}>
                  <Wrench className="h-5 w-5" />
                  <span className="text-xs">Tools Registry</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/analytics')}>
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/errors')}>
                  <Activity className="h-5 w-5" />
                  <span className="text-xs">Error Logs</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/roles-security')}>
                  <Shield className="h-5 w-5" />
                  <span className="text-xs">Rollen & Security</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
