import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  CreditCard,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lock,
  UserMinus,
  Activity,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useGrowthSummary, useAppActivityMonthly } from '@/hooks/useGrowth';
import { useAuth } from '@/contexts/AuthContext';

// ─── Farben ───────────────────────────────────────────────────────────────────
const COLORS = {
  users:   '#f97316',   // orange
  orgs:    '#3b82f6',   // blue
  subs:    '#10b981',   // green
  tenants: '#8b5cf6',   // purple
  churn:   '#ef4444',   // red
  net:     '#06b6d4',   // cyan
};

const PIE_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#0ea5e9'];

// ─── KPI-Karte ────────────────────────────────────────────────────────────────
interface KPIProps {
  title: string;
  value: number | null;
  delta?: number | null;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
  suffix?: string;
  deltaLabel?: string;
}

function KPICard({ title, value, delta, icon: Icon, color, loading, suffix = '', deltaLabel = 'diese Woche' }: KPIProps) {
  const isPositive = (delta ?? 0) > 0;
  const isNeutral = (delta ?? 0) === 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-lg p-1.5" style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-3xl font-bold">
              {value !== null && value !== undefined ? `${value.toLocaleString('de-DE')}${suffix}` : '–'}
            </div>
            {delta !== undefined && delta !== null && (
              <div className={`mt-1 flex items-center gap-1 text-xs ${
                isNeutral ? 'text-muted-foreground' :
                isPositive ? 'text-emerald-600 dark:text-emerald-400' :
                'text-red-500 dark:text-red-400'
              }`}>
                {isNeutral ? <Minus className="h-3 w-3" /> :
                 isPositive ? <ArrowUpRight className="h-3 w-3" /> :
                 <ArrowDownRight className="h-3 w-3" />}
                <span>{isPositive ? '+' : ''}{delta}{suffix} {deltaLabel}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg text-xs">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">
            {typeof entry.value === 'number'
              ? entry.name?.includes('%') || entry.dataKey === 'churnRate'
                ? `${entry.value.toLocaleString('de-DE')}%`
                : entry.value.toLocaleString('de-DE')
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Churn-Trend-Badge ────────────────────────────────────────────────────────
function ChurnTrendBadge({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'down') return (
    <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-xs">
      <TrendingDown className="h-3 w-3 mr-1" /> Abwanderung sinkt
    </Badge>
  );
  if (trend === 'up') return (
    <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 dark:bg-red-950 text-xs">
      <TrendingUp className="h-3 w-3 mr-1" /> Abwanderung steigt
    </Badge>
  );
  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      <Minus className="h-3 w-3 mr-1" /> Stabil
    </Badge>
  );
}

// ─── Hauptseite ───────────────────────────────────────────────────────────────
export default function GrowthDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGrowthSummary();

  // Superadmin-Guard
  const SUPERADMIN_EMAILS = ['admin@fintutto.de', 'alexander@fintutto.world', 'alexander@fintutto.de'];
  const isSuperAdmin = user?.email && SUPERADMIN_EMAILS.includes(user.email.toLowerCase());

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="rounded-full bg-muted p-6">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Zugriff verweigert</h2>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            Diese Seite ist ausschließlich für Superadmins zugänglich.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const weekly = data?.weeklyData ?? [];
  const last4Weeks = weekly.slice(-4);
  const churnData = data?.monthlyChurn ?? [];
  const appActivity = data?.appActivity ?? [];
  const integratedApps = appActivity.filter(a => a.integrated);
  const notIntegratedApps = appActivity.filter(a => !a.integrated);

  // Echte Aktivitätsdaten aus user_activity_log / app_activity_monthly View
  const { data: activityMonthly = [], isLoading: activityLoading } = useAppActivityMonthly();

  // Aktivitätsdaten für Charts aufbereiten
  // Alle Monate der letzten 12 Monate
  const activityMonths: string[] = (() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return d.toISOString().slice(0, 7); // "2026-04"
    });
  })();

  // Alle App-IDs aus den echten Daten
  const activityAppIds = Array.from(new Set(activityMonthly.map(r => r.app_id)));

  // Farben für App-IDs aus APP_CATALOG
  const appColorMap: Record<string, string> = Object.fromEntries(
    appActivity.map(a => [a.app, a.color])
  );
  const appLabelMap: Record<string, string> = Object.fromEntries(
    appActivity.map(a => [a.app, a.label])
  );

  // Chart-Daten: Monatliche Aktionen pro App
  const activityChartData = activityMonths.map(monthKey => {
    const point: Record<string, string | number> = {
      month: new Date(monthKey + '-01').toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }),
    };
    activityAppIds.forEach(appId => {
      const row = activityMonthly.find(r =>
        r.app_id === appId && r.month.startsWith(monthKey)
      );
      point[appId] = row?.total_actions ?? 0;
    });
    return point;
  });

  // Aktive Nutzer pro App (letzter Monat)
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const prevMonthKey = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  })();
  const activeUsersPerApp = activityAppIds.map(appId => {
    const current = activityMonthly.find(r => r.app_id === appId && r.month.startsWith(currentMonthKey));
    const prev = activityMonthly.find(r => r.app_id === appId && r.month.startsWith(prevMonthKey));
    return {
      app: appId,
      label: appLabelMap[appId] || appId,
      color: appColorMap[appId] || '#94a3b8',
      activeUsers: current?.active_users ?? 0,
      prevActiveUsers: prev?.active_users ?? 0,
      totalActions: current?.total_actions ?? 0,
      logins: current?.logins ?? 0,
    };
  }).sort((a, b) => b.totalActions - a.totalActions);

  // Gesamtmetriken aus echten Daten
  const totalActionsThisMonth = activityMonthly
    .filter(r => r.month.startsWith(currentMonthKey))
    .reduce((sum, r) => sum + r.total_actions, 0);
  const totalActiveUsersThisMonth = activityMonthly
    .filter(r => r.month.startsWith(currentMonthKey))
    .reduce((sum, r) => sum + r.active_users, 0);

  // Wachstumsrate berechnen
  const lastWeek = weekly[weekly.length - 1];
  const prevWeek = weekly[weekly.length - 2];
  const growthRate = lastWeek && prevWeek && prevWeek.users > 0
    ? (((lastWeek.users - prevWeek.users) / prevWeek.users) * 100).toFixed(1)
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wachstums-Dashboard</h1>
            <p className="text-muted-foreground">
              Nutzerwachstum, Abwanderungsrate und Plattform-Metriken im Zeitverlauf
            </p>
          </div>
          {growthRate !== null && (
            <Badge
              variant="outline"
              className={`text-sm px-3 py-1 ${
                parseFloat(growthRate) > 0
                  ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                  : 'border-muted text-muted-foreground'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              {parseFloat(growthRate) > 0 ? '+' : ''}{growthRate}% Nutzerwachstum
            </Badge>
          )}
        </div>

        {/* KPI-Karten */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Nutzer gesamt"
            value={data?.totalUsers ?? null}
            delta={data?.newUsers7d ?? null}
            icon={Users}
            color={COLORS.users}
            loading={isLoading}
          />
          <KPICard
            title="Organisationen"
            value={data?.totalOrgs ?? null}
            delta={data?.newOrgs7d ?? null}
            icon={Building2}
            color={COLORS.orgs}
            loading={isLoading}
          />
          <KPICard
            title="Abonnements"
            value={data?.totalSubs ?? null}
            delta={data?.newSubs7d ?? null}
            icon={CreditCard}
            color={COLORS.subs}
            loading={isLoading}
          />
          <KPICard
            title="Ø Monatl. Churn"
            value={data?.avgMonthlyChurnRate ?? null}
            delta={data ? data.currentMonthChurnRate - (data.avgMonthlyChurnRate ?? 0) : null}
            icon={UserMinus}
            color={COLORS.churn}
            loading={isLoading}
            suffix="%"
            deltaLabel="vs. Durchschnitt"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cumulative">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="cumulative">Kumuliert</TabsTrigger>
            <TabsTrigger value="weekly">Wöchentlich</TabsTrigger>
            <TabsTrigger value="daily">Täglich</TabsTrigger>
            <TabsTrigger value="churn">Abwanderung</TabsTrigger>
            <TabsTrigger value="apps">App-Aktivität</TabsTrigger>
            <TabsTrigger value="breakdown">Aufschlüsselung</TabsTrigger>
          </TabsList>

          {/* Tab: Kumuliertes Wachstum */}
          <TabsContent value="cumulative" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kumuliertes Wachstum (16 Wochen)</CardTitle>
                <CardDescription>Gesamtanzahl aller Entitäten im Wochenverlauf</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : weekly.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-muted-foreground text-sm">
                    Noch keine Daten vorhanden
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weekly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <defs>
                        {Object.entries(COLORS).filter(([k]) => ['users','orgs','subs','tenants'].includes(k)).map(([key, color]) => (
                          <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="users"   name="Nutzer"         stroke={COLORS.users}   fill={`url(#grad-users)`}   strokeWidth={2} />
                      <Area type="monotone" dataKey="orgs"    name="Organisationen" stroke={COLORS.orgs}    fill={`url(#grad-orgs)`}    strokeWidth={2} />
                      <Area type="monotone" dataKey="subs"    name="Abonnements"    stroke={COLORS.subs}    fill={`url(#grad-subs)`}    strokeWidth={2} />
                      <Area type="monotone" dataKey="tenants" name="Mieter"         stroke={COLORS.tenants} fill={`url(#grad-tenants)`} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Wöchentliche Neuregistrierungen */}
          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Neuregistrierungen pro Woche</CardTitle>
                <CardDescription>Neue Einträge je Kalenderwoche</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weekly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="newUsers"   name="Neue Nutzer"    fill={COLORS.users}   radius={[2, 2, 0, 0]} />
                      <Bar dataKey="newOrgs"    name="Neue Orgs"      fill={COLORS.orgs}    radius={[2, 2, 0, 0]} />
                      <Bar dataKey="newSubs"    name="Neue Abos"      fill={COLORS.subs}    radius={[2, 2, 0, 0]} />
                      <Bar dataKey="newTenants" name="Neue Mieter"    fill={COLORS.tenants} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Letzte 4 Wochen Tabelle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Letzte 4 Wochen</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-32 w-full" /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium text-muted-foreground">Woche</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Nutzer</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">+Neu</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Orgs</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Abos</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Mieter</th>
                        </tr>
                      </thead>
                      <tbody>
                        {last4Weeks.map((w, i) => (
                          <tr key={w.week} className={`border-b hover:bg-muted/50 ${i === last4Weeks.length - 1 ? 'font-semibold' : ''}`}>
                            <td className="p-2">{w.week}</td>
                            <td className="p-2 text-right">{w.users.toLocaleString('de-DE')}</td>
                            <td className="p-2 text-right">
                              {w.newUsers > 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400">+{w.newUsers}</span>
                              ) : (
                                <span className="text-muted-foreground">–</span>
                              )}
                            </td>
                            <td className="p-2 text-right">{w.orgs.toLocaleString('de-DE')}</td>
                            <td className="p-2 text-right">{w.subs.toLocaleString('de-DE')}</td>
                            <td className="p-2 text-right">{w.tenants.toLocaleString('de-DE')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Tägliche Registrierungen — LINIENDIAGRAMM */}
          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tägliche Nutzer-Registrierungen (60 Tage)</CardTitle>
                <CardDescription>Neue Nutzer-Accounts pro Tag als Liniendiagramm mit 7-Tage-Glättung</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : !data?.userRegistrationsByDay?.length ? (
                  <div className="flex items-center justify-center h-72 text-muted-foreground text-sm">
                    Keine Registrierungen in den letzten 60 Tagen
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={data.userRegistrationsByDay.map((d, i, arr) => {
                        // 7-Tage gleitender Durchschnitt
                        const window = arr.slice(Math.max(0, i - 6), i + 1);
                        const avg = window.reduce((s, x) => s + x.count, 0) / window.length;
                        return { ...d, avg: Math.round(avg * 10) / 10 };
                      })}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 9 }}
                        className="fill-muted-foreground"
                        tickFormatter={(v) => v.slice(5)}
                        interval={6}
                      />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Neue Nutzer"
                        stroke={COLORS.users}
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="avg"
                        name="Ø 7 Tage"
                        stroke={COLORS.orgs}
                        strokeWidth={2.5}
                        strokeDasharray="5 3"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* 30-Tage Wachstum */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Neue Nutzer (30 Tage)</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (
                    <div className="text-2xl font-bold text-orange-500">+{data?.newUsers30d ?? 0}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Neue Nutzer (7 Tage)</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (
                    <div className="text-2xl font-bold text-orange-500">+{data?.newUsers7d ?? 0}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ø Neue Nutzer/Woche</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (
                    <div className="text-2xl font-bold">
                      {weekly.length > 0
                        ? (weekly.reduce((s, w) => s + w.newUsers, 0) / weekly.length).toFixed(1)
                        : '0'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Monatliche Abwanderungsrate */}
          <TabsContent value="churn" className="space-y-4">
            {/* Churn-KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Aktuelle Churn-Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-8 w-20" /> : (
                    <div className="flex items-end gap-2">
                      <div className={`text-3xl font-bold ${
                        (data?.currentMonthChurnRate ?? 0) > 10 ? 'text-red-500' :
                        (data?.currentMonthChurnRate ?? 0) > 5 ? 'text-amber-500' : 'text-emerald-600'
                      }`}>
                        {data?.currentMonthChurnRate ?? 0}%
                      </div>
                      {data && <ChurnTrendBadge trend={data.churnTrend} />}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ø Monatliche Churn-Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-8 w-20" /> : (
                    <div className="text-3xl font-bold">{data?.avgMonthlyChurnRate ?? 0}%</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Nettowachstum (akt. Monat)</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-8 w-20" /> : (
                    <div className={`text-3xl font-bold ${
                      (churnData[churnData.length - 1]?.netGrowth ?? 0) >= 0
                        ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {(churnData[churnData.length - 1]?.netGrowth ?? 0) >= 0 ? '+' : ''}
                      {churnData[churnData.length - 1]?.netGrowth ?? 0}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Churn-Rate Liniendiagramm */}
            <Card>
              <CardHeader>
                <CardTitle>Monatliche Abwanderungsrate (12 Monate)</CardTitle>
                <CardDescription>
                  Churn-Rate in % — Anteil inaktiver oder abgewanderter Nutzer an der Gesamtnutzerbasis.
                  Zielwert: unter 5% monatlich.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : churnData.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-muted-foreground text-sm">
                    Noch keine Churn-Daten vorhanden
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={churnData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        className="fill-muted-foreground"
                        tickFormatter={(v) => `${v}%`}
                        domain={[0, 'auto']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {/* Zielwert-Linie bei 5% */}
                      <ReferenceLine
                        y={5}
                        stroke="#10b981"
                        strokeDasharray="6 3"
                        label={{ value: 'Ziel: 5%', position: 'insideTopRight', fontSize: 10, fill: '#10b981' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="churnRate"
                        name="Churn-Rate (%)"
                        stroke={COLORS.churn}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: COLORS.churn }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Neuregistrierungen vs. Abwanderung — ComposedChart */}
            <Card>
              <CardHeader>
                <CardTitle>Neuregistrierungen vs. Abwanderung</CardTitle>
                <CardDescription>Neue Nutzer (Balken) und abgewanderte Nutzer (Linie) pro Monat</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={churnData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="newUsers" name="Neue Nutzer" fill={COLORS.users} opacity={0.85} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="churnedUsers" name="Abgewandert" fill={COLORS.churn} opacity={0.7} radius={[3, 3, 0, 0]} />
                      <Line
                        type="monotone"
                        dataKey="netGrowth"
                        name="Nettowachstum"
                        stroke={COLORS.net}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Churn-Tabelle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monatliche Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-48 w-full" /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium text-muted-foreground">Monat</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Aktive Nutzer</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Neu</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Abgewandert</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Netto</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Churn-Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {churnData.slice(-6).map((m, i, arr) => (
                          <tr key={m.month} className={`border-b hover:bg-muted/50 ${i === arr.length - 1 ? 'font-semibold' : ''}`}>
                            <td className="p-2">{m.month}</td>
                            <td className="p-2 text-right">{m.activeUsers.toLocaleString('de-DE')}</td>
                            <td className="p-2 text-right text-emerald-600 dark:text-emerald-400">
                              {m.newUsers > 0 ? `+${m.newUsers}` : '–'}
                            </td>
                            <td className="p-2 text-right text-red-500">
                              {m.churnedUsers > 0 ? `-${m.churnedUsers}` : '–'}
                            </td>
                            <td className={`p-2 text-right font-medium ${m.netGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                              {m.netGrowth >= 0 ? `+${m.netGrowth}` : m.netGrowth}
                            </td>
                            <td className="p-2 text-right">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  m.churnRate > 10 ? 'border-red-400 text-red-600' :
                                  m.churnRate > 5 ? 'border-amber-400 text-amber-600' :
                                  'border-emerald-400 text-emerald-600'
                                }`}
                              >
                                {m.churnRate}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Churn-Erklärung */}
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Methodik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Die Churn-Rate wird berechnet als: <strong>Abgewanderte Nutzer / Aktive Nutzer × 100</strong>.
                  Als abgewandert gilt ein Nutzer, wenn sein Status auf <code className="bg-muted px-1 rounded">inactive</code> gesetzt wurde,
                  kein Login in den letzten 30 Tagen vor Monatsende stattfand, oder die Registrierung mehr als 60 Tage zurückliegt ohne erneuten Login.
                  Zielwert für SaaS-Plattformen: unter 5% monatlich (entspricht ~46% Jahresbindung).
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: App-Aktivität */}
          <TabsContent value="apps" className="space-y-4">
            {/* Übersicht-Karten: Kombination aus Katalog + echten Aktivitätsdaten */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Apps gesamt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{appActivity.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">im Portal-Repository</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Integriert (Supabase)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">{integratedApps.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">teilen Nutzerdaten im AMS</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Aktionen diesen Monat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {activityLoading ? <Skeleton className="h-8 w-16" /> : totalActionsThisMonth.toLocaleString('de-DE')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">aus user_activity_log</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Aktive Nutzer (Monat)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-violet-600">
                    {activityLoading ? <Skeleton className="h-8 w-16" /> : totalActiveUsersThisMonth.toLocaleString('de-DE')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">unique Users mit Aktivität</p>
                </CardContent>
              </Card>
            </div>

            {/* Echte Aktivitätsdaten: Monatliche Aktionen pro App */}
            {activityAppIds.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    Monatliche Aktionen pro App (letzte 12 Monate)
                  </CardTitle>
                  <CardDescription>
                    Echte Nutzungsmetriken aus <code className="bg-muted px-1 rounded text-xs">user_activity_log</code> — jede App loggt Login, Erstellen, Ansehen etc.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <Skeleton className="h-72 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={activityChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {activityAppIds.map(appId => (
                          <Line
                            key={appId}
                            type="monotone"
                            dataKey={appId}
                            name={appLabelMap[appId] || appId}
                            stroke={appColorMap[appId] || '#94a3b8'}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="font-medium text-sm">Noch keine Aktivitätsdaten vorhanden</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Sobald Nutzer sich in den integrierten Apps einloggen, erscheinen hier echte Nutzungsmetriken aus <code className="bg-muted px-1 rounded">user_activity_log</code>.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Aktive Nutzer pro App (aktueller Monat) */}
            {activeUsersPerApp.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-500" />
                    Aktive Nutzer & Aktionen pro App (aktueller Monat)
                  </CardTitle>
                  <CardDescription>Unique Nutzer und Gesamtaktionen im laufenden Monat</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={activeUsersPerApp}
                        margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="activeUsers" name="Aktive Nutzer" fill="#8b5cf6" opacity={0.85} radius={[3, 3, 0, 0]} />
                        <Bar dataKey="totalActions" name="Aktionen gesamt" fill="#3b82f6" opacity={0.85} radius={[3, 3, 0, 0]} />
                        <Bar dataKey="logins" name="Logins" fill="#10b981" opacity={0.85} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Detailtabelle: Aktivität pro App (aktueller Monat) */}
            {activeUsersPerApp.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Aktivitätsdetails pro App — aktueller Monat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium text-muted-foreground">App</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Aktive Nutzer</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Aktionen</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Logins</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeUsersPerApp.map(app => {
                          const trend = app.totalActions > app.prevActiveUsers ? 'up' : app.totalActions < app.prevActiveUsers ? 'down' : 'stable';
                          return (
                            <tr key={app.app} className="border-b hover:bg-muted/50">
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: app.color }} />
                                  <span className="font-medium">{app.label}</span>
                                </div>
                              </td>
                              <td className="p-2 text-right">
                                <Badge variant="secondary" className="text-xs">{app.activeUsers}</Badge>
                              </td>
                              <td className="p-2 text-right font-mono text-xs">{app.totalActions.toLocaleString('de-DE')}</td>
                              <td className="p-2 text-right font-mono text-xs">{app.logins.toLocaleString('de-DE')}</td>
                              <td className="p-2 text-right">
                                {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500 ml-auto" />}
                                {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500 ml-auto" />}
                                {trend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground ml-auto" />}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trennlinie zu Abo-Daten */}
            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground font-medium">Abonnement-Daten (aus subscriptions-Tabelle)</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Abonnements pro App — BarChart */}
            <Card>
              <CardHeader>
                <CardTitle>Abonnements pro App (kumuliert)</CardTitle>
                <CardDescription>Gesamte Abonnements je App basierend auf subscriptions.app_id</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={integratedApps.map(a => ({ label: a.label, subs: a.totalSubs, active: a.activeSubs }))}
                      margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="subs" name="Gesamt-Abos" fill={COLORS.subs} opacity={0.85} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="active" name="Aktive Abos" fill={COLORS.users} opacity={0.85} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Monatliche Abonnements — LineChart für die Top-3-Apps */}
            <Card>
              <CardHeader>
                <CardTitle>Monatliche Abonnement-Entwicklung (Top-Apps)</CardTitle>
                <CardDescription>Kumulierte Abonnements der integrierten Apps über 12 Monate</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (() => {
                  // Monatsdaten für LineChart aufbereiten
                  const months = integratedApps[0]?.monthlyData.map(m => m.month) ?? [];
                  const chartData = months.map((month, idx) => {
                    const point: Record<string, string | number> = { month };
                    integratedApps.slice(0, 6).forEach(app => {
                      point[app.label] = app.monthlyData[idx]?.subs ?? 0;
                    });
                    return point;
                  });
                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {integratedApps.slice(0, 6).map(app => (
                          <Line
                            key={app.app}
                            type="monotone"
                            dataKey={app.label}
                            stroke={app.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </CardContent>
            </Card>

            {/* App-Status-Tabelle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Alle Portal-Apps — Integrationsstatus
                </CardTitle>
                <CardDescription>
                  Übersicht aller Apps im Repository mit Supabase- und Vercel-Status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-64 w-full" /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium text-muted-foreground">App</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Kategorie</th>
                          <th className="text-center p-2 font-medium text-muted-foreground">Supabase</th>
                          <th className="text-center p-2 font-medium text-muted-foreground">Vercel</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Abos gesamt</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Aktive Abos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appActivity.map(app => (
                          <tr key={app.app} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: app.color }}
                                />
                                <span className="font-medium">{app.label}</span>
                              </div>
                            </td>
                            <td className="p-2 text-muted-foreground">{app.category}</td>
                            <td className="p-2 text-center">
                              {app.integrated
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                : <XCircle className="h-4 w-4 text-amber-400 mx-auto" />}
                            </td>
                            <td className="p-2 text-center">
                              {app.vercelDeployed
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                            </td>
                            <td className="p-2 text-right">
                              {app.totalSubs > 0
                                ? <Badge variant="secondary" className="text-xs">{app.totalSubs}</Badge>
                                : <span className="text-muted-foreground text-xs">–</span>}
                            </td>
                            <td className="p-2 text-right">
                              {app.activeSubs > 0
                                ? <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">{app.activeSubs}</Badge>
                                : <span className="text-muted-foreground text-xs">–</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nicht-integrierte Apps — Integrationsschritte */}
            {notIntegratedApps.length > 0 && (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <XCircle className="h-4 w-4" />
                    Noch nicht integrierte Apps — Nächste Schritte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notIntegratedApps.map(app => (
                      <div key={app.app} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <span
                          className="h-3 w-3 rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: app.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{app.label}</span>
                            <Badge variant="outline" className="text-xs">{app.category}</Badge>
                            {!app.vercelDeployed && (
                              <Badge variant="outline" className="text-xs border-red-300 text-red-600">Kein Vercel</Badge>
                            )}
                          </div>
                          <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
                            <li>Supabase-Client in <code className="bg-muted px-1 rounded">src/integrations/supabase/client.ts</code> anlegen</li>
                            <li><code className="bg-muted px-1 rounded">VITE_SUPABASE_URL</code> + <code className="bg-muted px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in Vercel setzen</li>
                            {!app.vercelDeployed && <li><code className="bg-muted px-1 rounded">vercel.json</code> anlegen und Projekt in Vercel registrieren</li>}
                            <li>Auth-Provider auf <code className="bg-muted px-1 rounded">supabase.auth</code> umstellen</li>
                            <li>Bei Registrierung Eintrag in <code className="bg-muted px-1 rounded">profiles</code>-Tabelle anlegen</li>
                          </ol>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Aufschlüsselung */}
          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Nutzer nach Rolle */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nutzer nach Rolle</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-48 w-full" /> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={data?.usersByRole ?? []}
                          dataKey="count"
                          nameKey="role"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          label={({ role, count }) => `${role}: ${count}`}
                          labelLine={false}
                        >
                          {(data?.usersByRole ?? []).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {!isLoading && (
                    <div className="mt-2 space-y-1">
                      {(data?.usersByRole ?? []).map((r, i) => (
                        <div key={r.role} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="capitalize">{r.role}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">{r.count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Abos nach Tier */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Abos nach Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-48 w-full" /> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={data?.subsByTier ?? []}
                          dataKey="count"
                          nameKey="tier"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          label={({ tier, count }) => `${tier}: ${count}`}
                          labelLine={false}
                        >
                          {(data?.subsByTier ?? []).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {!isLoading && (
                    <div className="mt-2 space-y-1">
                      {(data?.subsByTier ?? []).map((t, i) => (
                        <div key={t.tier} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="capitalize">{t.tier}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">{t.count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Abos nach Interval */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Abos nach Laufzeit</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-48 w-full" /> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={data?.subsByInterval ?? []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                        <YAxis dataKey="interval" type="category" tick={{ fontSize: 10 }} width={50} />
                        <Tooltip />
                        <Bar dataKey="count" name="Anzahl" fill={COLORS.subs} radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {!isLoading && (
                    <div className="mt-2 space-y-1">
                      {(data?.subsByInterval ?? []).map((s, i) => (
                        <div key={s.interval} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="capitalize">{s.interval === 'month' ? 'Monatlich' : s.interval === 'year' ? 'Jährlich' : s.interval}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">{s.count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Wachstumsziele */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Wachstumsziele</CardTitle>
                <CardDescription>Fortschritt zu den nächsten Meilensteinen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Nutzer', current: data?.totalUsers ?? 0, target: 100, color: COLORS.users },
                    { label: 'Organisationen', current: data?.totalOrgs ?? 0, target: 10, color: COLORS.orgs },
                    { label: 'Abonnements', current: data?.totalSubs ?? 0, target: 20, color: COLORS.subs },
                    { label: 'Mieter (Vermietify)', current: data?.totalTenants ?? 0, target: 50, color: COLORS.tenants },
                  ].map(({ label, current, target, color }) => {
                    const pct = Math.min(100, Math.round((current / target) * 100));
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{label}</span>
                          <span className="text-muted-foreground">{current} / {target} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
