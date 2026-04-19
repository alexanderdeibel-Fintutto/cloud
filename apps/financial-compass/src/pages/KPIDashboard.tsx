import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useKPIDashboard, KPI, KPICategory } from '@/hooks/useKPIDashboard';
import {
  TrendingUp, TrendingDown, Minus, Star, StarOff, Settings,
  AlertTriangle, CheckCircle, Target, BarChart3, PieChart,
  Activity, Wallet, RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from 'recharts';

const CATEGORY_LABELS: Record<KPICategory, { de: string; icon: React.ReactNode }> = {
  profitability: { de: 'Rentabilität', icon: <Wallet className="h-4 w-4" /> },
  liquidity: { de: 'Liquidität', icon: <Activity className="h-4 w-4" /> },
  activity: { de: 'Aktivität', icon: <RefreshCw className="h-4 w-4" /> },
  growth: { de: 'Wachstum', icon: <TrendingUp className="h-4 w-4" /> },
  efficiency: { de: 'Effizienz', icon: <BarChart3 className="h-4 w-4" /> },
};

function KPICard({ kpi, onToggleFavorite, isFavorite, formatValue }: {
  kpi: KPI;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  formatValue: (value: number, unit: KPI['value']['unit']) => string;
}) {
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
  const trendColor = kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500';

  return (
    <Card className={`relative ${kpi.status === 'critical' ? 'border-red-300' : kpi.status === 'warning' ? 'border-orange-300' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggleFavorite}>
            {isFavorite ? (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(kpi.value.current, kpi.value.unit)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span>{kpi.trendPercent > 0 ? '+' : ''}{kpi.trendPercent}%</span>
            </div>
          </div>
          <Badge
            variant={kpi.status === 'good' ? 'default' : kpi.status === 'warning' ? 'secondary' : 'destructive'}
            className={kpi.status === 'good' ? 'bg-green-600' : ''}
          >
            {kpi.status === 'good' ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <AlertTriangle className="mr-1 h-3 w-3" />
            )}
            {kpi.status === 'good' ? 'Gut' : kpi.status === 'warning' ? 'Warnung' : 'Kritisch'}
          </Badge>
        </div>
        {kpi.value.target && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Ziel: {formatValue(kpi.value.target, kpi.value.unit)}</span>
              <span>{Math.round((kpi.value.current / kpi.value.target) * 100)}%</span>
            </div>
            <Progress
              value={Math.min((kpi.value.current / kpi.value.target) * 100, 100)}
              className="h-1"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function KPIDashboard() {
  const {
    kpis,
    favoriteKPIs,
    criticalKPIs,
    alerts,
    settings,
    summary,
    updateSettings,
    toggleFavorite,
    acknowledgeAlert,
    getKPIsByCategory,
    formatKPIValue,
  } = useKPIDashboard();

  const [selectedCategory, setSelectedCategory] = useState<KPICategory | 'all'>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);

  const displayedKPIs = selectedCategory === 'all'
    ? kpis
    : getKPIsByCategory(selectedCategory);

  // Radar chart data
  const radarData = [
    { category: 'Rentabilität', value: getKPIsByCategory('profitability').filter(k => k.status === 'good').length / getKPIsByCategory('profitability').length * 100 },
    { category: 'Liquidität', value: getKPIsByCategory('liquidity').filter(k => k.status === 'good').length / getKPIsByCategory('liquidity').length * 100 },
    { category: 'Aktivität', value: getKPIsByCategory('activity').filter(k => k.status === 'good').length / getKPIsByCategory('activity').length * 100 },
    { category: 'Wachstum', value: getKPIsByCategory('growth').filter(k => k.status === 'good').length / getKPIsByCategory('growth').length * 100 },
    { category: 'Effizienz', value: getKPIsByCategory('efficiency').filter(k => k.status === 'good').length / getKPIsByCategory('efficiency').length * 100 },
  ];

  // Bar chart data for comparison
  const comparisonData = kpis.slice(0, 6).map(kpi => ({
    name: kpi.name.substring(0, 15),
    aktuell: kpi.value.current,
    vorperiode: kpi.value.previous,
    ziel: kpi.value.target || 0,
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KPI-Dashboard</h1>
          <p className="text-muted-foreground">Kennzahlen und Performance-Übersicht</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedCategory}
            onValueChange={(v) => setSelectedCategory(v as KPICategory | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, { de }]) => (
                <SelectItem key={key} value={key}>{de}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalKPIs}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Gut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.goodKPIs}</div>
            <Progress value={(summary.goodKPIs / summary.totalKPIs) * 100} className="mt-2 h-1 bg-green-100" />
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Warnung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.warningKPIs}</div>
            <Progress value={(summary.warningKPIs / summary.totalKPIs) * 100} className="mt-2 h-1 bg-orange-100" />
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Kritisch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.criticalKPIs}</div>
            <Progress value={(summary.criticalKPIs / summary.totalKPIs) * 100} className="mt-2 h-1 bg-red-100" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offene Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.unacknowledgedAlerts}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="favorites">Favoriten ({favoriteKPIs.length})</TabsTrigger>
          <TabsTrigger value="critical">Kritisch ({criticalKPIs.length})</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({summary.unacknowledgedAlerts})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Category Sections */}
          {selectedCategory === 'all' ? (
            Object.entries(CATEGORY_LABELS).map(([category, { de, icon }]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  {icon}
                  <h2 className="text-xl font-semibold">{de}</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getKPIsByCategory(category as KPICategory).map(kpi => (
                    <KPICard
                      key={kpi.id}
                      kpi={kpi}
                      isFavorite={settings.favoriteKPIs.includes(kpi.id)}
                      onToggleFavorite={() => toggleFavorite(kpi.id)}
                      formatValue={formatKPIValue}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedKPIs.map(kpi => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  isFavorite={settings.favoriteKPIs.includes(kpi.id)}
                  onToggleFavorite={() => toggleFavorite(kpi.id)}
                  formatValue={formatKPIValue}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {favoriteKPIs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Star className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Keine Favoriten ausgewählt</p>
                <p className="text-sm">Klicken Sie auf den Stern bei einer Kennzahl, um sie als Favorit zu markieren</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favoriteKPIs.map(kpi => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  isFavorite={true}
                  onToggleFavorite={() => toggleFavorite(kpi.id)}
                  formatValue={formatKPIValue}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          {criticalKPIs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <CheckCircle className="mx-auto h-12 w-12 mb-4 text-green-500" />
                <p className="text-green-600 font-medium">Alle Kennzahlen im grünen Bereich</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {criticalKPIs.map(kpi => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  isFavorite={settings.favoriteKPIs.includes(kpi.id)}
                  onToggleFavorite={() => toggleFavorite(kpi.id)}
                  formatValue={formatKPIValue}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance-Übersicht</CardTitle>
                <CardDescription>Anteil "guter" KPIs pro Kategorie</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Performance %"
                      dataKey="value"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Periodenvergleich</CardTitle>
                <CardDescription>Aktuell vs. Vorperiode vs. Ziel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aktuell" fill="#2563eb" name="Aktuell" />
                    <Bar dataKey="vorperiode" fill="#94a3b8" name="Vorperiode" />
                    <Bar dataKey="ziel" fill="#22c55e" name="Ziel" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KPI-Alerts</CardTitle>
              <CardDescription>Benachrichtigungen über kritische Kennzahlen</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Alerts vorhanden
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg flex items-center justify-between ${
                        alert.acknowledged
                          ? 'bg-muted'
                          : alert.severity === 'critical'
                          ? 'bg-red-50'
                          : alert.severity === 'warning'
                          ? 'bg-orange-50'
                          : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {alert.severity === 'critical' ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : alert.severity === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        ) : (
                          <Target className="h-5 w-5 text-blue-500" />
                        )}
                        <div>
                          <div className="font-medium">{alert.kpiName}</div>
                          <div className="text-sm text-muted-foreground">{alert.message}</div>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Bestätigen
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Dashboard-Einstellungen</SheetTitle>
            <SheetDescription>Konfigurieren Sie das KPI-Dashboard</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Benchmarks anzeigen</Label>
                <p className="text-sm text-muted-foreground">Branchenvergleiche einblenden</p>
              </div>
              <Switch
                checked={settings.showBenchmarks}
                onCheckedChange={(checked) => updateSettings({ showBenchmarks: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Ziele anzeigen</Label>
                <p className="text-sm text-muted-foreground">Zielwerte einblenden</p>
              </div>
              <Switch
                checked={settings.showTargets}
                onCheckedChange={(checked) => updateSettings({ showTargets: checked })}
              />
            </div>
            <div className="space-y-4">
              <Label>Schwellenwerte</Label>
              <div className="space-y-3">
                <div>
                  <span className="text-sm">Gewinnmarge Warnung</span>
                  <div className="text-xs text-muted-foreground">
                    Warnung: &lt; {settings.alertThresholds.profitMargin.warning}%,
                    Kritisch: &lt; {settings.alertThresholds.profitMargin.critical}%
                  </div>
                </div>
                <div>
                  <span className="text-sm">Current Ratio Warnung</span>
                  <div className="text-xs text-muted-foreground">
                    Warnung: &lt; {settings.alertThresholds.currentRatio.warning},
                    Kritisch: &lt; {settings.alertThresholds.currentRatio.critical}
                  </div>
                </div>
                <div>
                  <span className="text-sm">DSO Warnung</span>
                  <div className="text-xs text-muted-foreground">
                    Warnung: &gt; {settings.alertThresholds.dso.warning} Tage,
                    Kritisch: &gt; {settings.alertThresholds.dso.critical} Tage
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
