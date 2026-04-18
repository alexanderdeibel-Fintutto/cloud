import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Users,
  Building2,
  CreditCard,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGrowthSummary } from '@/hooks/useGrowth';
import { useAuth } from '@/contexts/AuthContext';

// ─── Farben ───────────────────────────────────────────────────────────────────
const COLORS = {
  users:   '#f97316',   // orange
  orgs:    '#3b82f6',   // blue
  subs:    '#10b981',   // green
  tenants: '#8b5cf6',   // purple
};

const PIE_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

// ─── KPI-Karte ────────────────────────────────────────────────────────────────
interface KPIProps {
  title: string;
  value: number | null;
  delta?: number | null;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}

function KPICard({ title, value, delta, icon: Icon, color, loading }: KPIProps) {
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
            <div className="text-3xl font-bold">{value?.toLocaleString('de-DE') ?? '–'}</div>
            {delta !== undefined && delta !== null && (
              <div className={`mt-1 flex items-center gap-1 text-xs ${
                isNeutral ? 'text-muted-foreground' :
                isPositive ? 'text-emerald-600 dark:text-emerald-400' :
                'text-red-500 dark:text-red-400'
              }`}>
                {isNeutral ? <Minus className="h-3 w-3" /> :
                 isPositive ? <ArrowUpRight className="h-3 w-3" /> :
                 <ArrowDownRight className="h-3 w-3" />}
                <span>{isPositive ? '+' : ''}{delta} diese Woche</span>
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
          <span className="font-medium text-foreground">{entry.value?.toLocaleString('de-DE')}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Hauptseite ───────────────────────────────────────────────────────────────
export default function GrowthDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGrowthSummary();

  // Superadmin-Guard: Nur für admin@fintutto.de / alexander@fintutto.world
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

  // Wachstumsrate berechnen (letzte Woche vs. vorletzte Woche)
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
              Nutzerwachstum und Plattform-Metriken im Zeitverlauf
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
            title="Mieter (Vermietify)"
            value={data?.totalTenants ?? null}
            delta={data?.newTenants7d ?? null}
            icon={Home}
            color={COLORS.tenants}
            loading={isLoading}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cumulative">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cumulative">Kumuliert</TabsTrigger>
            <TabsTrigger value="weekly">Wöchentlich</TabsTrigger>
            <TabsTrigger value="daily">Täglich</TabsTrigger>
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
                        {Object.entries(COLORS).map(([key, color]) => (
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
                      <Area type="monotone" dataKey="users"   name="Nutzer"       stroke={COLORS.users}   fill={`url(#grad-users)`}   strokeWidth={2} />
                      <Area type="monotone" dataKey="orgs"    name="Organisationen" stroke={COLORS.orgs}  fill={`url(#grad-orgs)`}    strokeWidth={2} />
                      <Area type="monotone" dataKey="subs"    name="Abonnements"  stroke={COLORS.subs}    fill={`url(#grad-subs)`}    strokeWidth={2} />
                      <Area type="monotone" dataKey="tenants" name="Mieter"       stroke={COLORS.tenants} fill={`url(#grad-tenants)`} strokeWidth={2} />
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
                ) : weekly.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-muted-foreground text-sm">
                    Noch keine Daten vorhanden
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weekly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="newUsers"   name="Neue Nutzer"       fill={COLORS.users}   radius={[3, 3, 0, 0]} />
                      <Bar dataKey="newOrgs"    name="Neue Orgs"         fill={COLORS.orgs}    radius={[3, 3, 0, 0]} />
                      <Bar dataKey="newSubs"    name="Neue Abos"         fill={COLORS.subs}    radius={[3, 3, 0, 0]} />
                      <Bar dataKey="newTenants" name="Neue Mieter"       fill={COLORS.tenants} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Letzte 4 Wochen Tabelle */}
            <Card>
              <CardHeader>
                <CardTitle>Letzte 4 Wochen im Detail</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
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

          {/* Tab: Tägliche Registrierungen */}
          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tägliche Nutzer-Registrierungen (60 Tage)</CardTitle>
                <CardDescription>Neue Nutzer-Accounts pro Tag</CardDescription>
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
                    <BarChart data={data.userRegistrationsByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 9 }}
                        className="fill-muted-foreground"
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Neue Nutzer" fill={COLORS.users} radius={[3, 3, 0, 0]} />
                    </BarChart>
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
