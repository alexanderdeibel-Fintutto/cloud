import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  useBusinessForecast,
  ForecastHorizon,
  GrowthScenario,
} from '@/hooks/useBusinessForecast';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  AlertTriangle,
  Calendar,
  BarChart3,
  LineChart,
  Settings,
  Save,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Shield,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart as RechartsLine,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export default function BusinessForecast() {
  const { toast } = useToast();
  const {
    config,
    assumptions,
    updateConfig,
    updateAssumption,
    saveSettings,
    generateMonthlyForecast,
    generateYearlyForecast,
    getForecastSummary,
    compareScenarios,
    getGrowthDrivers,
    calculateWhatIf,
    getRiskFactors,
  } = useBusinessForecast();

  const [activeTab, setActiveTab] = useState('forecast');
  const [whatIfChanges, setWhatIfChanges] = useState({
    revenueChange: 0,
    expenseChange: 0,
    customerGrowth: 0,
  });

  const monthlyForecast = useMemo(() => generateMonthlyForecast(), [generateMonthlyForecast]);
  const yearlyForecast = useMemo(() => generateYearlyForecast(5), [generateYearlyForecast]);
  const summary = useMemo(() => getForecastSummary(monthlyForecast), [getForecastSummary, monthlyForecast]);
  const scenarios = useMemo(() => compareScenarios(), [compareScenarios]);
  const growthDrivers = useMemo(() => getGrowthDrivers(), [getGrowthDrivers]);
  const risks = useMemo(() => getRiskFactors(), [getRiskFactors]);
  const whatIfResult = useMemo(
    () => calculateWhatIf(whatIfChanges),
    [calculateWhatIf, whatIfChanges]
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const handleSave = () => {
    saveSettings();
    toast({ title: 'Einstellungen gespeichert' });
  };

  // Chart data
  const forecastChartData = monthlyForecast.map(f => ({
    month: `${f.month} ${f.year}`,
    revenue: f.revenue,
    expenses: f.expenses,
    profit: f.profit,
    confidence: f.confidence * 100,
  }));

  const cashFlowChartData = monthlyForecast.map(f => ({
    month: `${f.month} ${f.year}`,
    cashBalance: f.cashBalance,
    profit: f.profit,
  }));

  const scenarioChartData = scenarios.map(s => ({
    name: s.label,
    revenue: s.revenue12m,
    profit: s.profit12m,
  }));

  const radarData = growthDrivers.map(d => ({
    driver: d.name,
    impact: d.impact,
    fullMark: 100,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Business Forecast</h1>
          <p className="text-muted-foreground">Prognose und Szenarioplanung</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
        </div>
      </div>

      {/* Config Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Prognose-Horizont</label>
              <Select
                value={config.horizon}
                onValueChange={(v) => updateConfig({ horizon: v as ForecastHorizon })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">3 Monate</SelectItem>
                  <SelectItem value="6m">6 Monate</SelectItem>
                  <SelectItem value="12m">12 Monate</SelectItem>
                  <SelectItem value="24m">24 Monate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Szenario</label>
              <Select
                value={config.scenario}
                onValueChange={(v) => updateConfig({ scenario: v as GrowthScenario })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Konservativ</SelectItem>
                  <SelectItem value="moderate">Moderat</SelectItem>
                  <SelectItem value="aggressive">Aggressiv</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.includeSeasonality}
                onCheckedChange={(v) => updateConfig({ includeSeasonality: v })}
              />
              <span className="text-sm">Saisonalität</span>
            </div>

            <div className="flex-1" />

            <Badge
              variant="outline"
              className={
                config.scenario === 'conservative' ? 'border-gray-400 text-gray-600' :
                  config.scenario === 'moderate' ? 'border-blue-400 text-blue-600' :
                    'border-green-400 text-green-600'
              }
            >
              {config.scenario === 'conservative' ? 'Niedriges Risiko' :
                config.scenario === 'moderate' ? 'Mittleres Risiko' : 'Hohes Risiko'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Progn. Umsatz</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.totalProfit)}
                </p>
                <p className="text-sm text-muted-foreground">Progn. Gewinn</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.avgProfitMargin}%</p>
                <p className="text-sm text-muted-foreground">Gewinnmarge</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${summary.endingCashBalance >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <Zap className={`h-5 w-5 ${summary.endingCashBalance >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${summary.endingCashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.endingCashBalance)}
                </p>
                <p className="text-sm text-muted-foreground">Endbestand</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="forecast">
            <LineChart className="h-4 w-4 mr-2" />
            Prognose
          </TabsTrigger>
          <TabsTrigger value="scenarios">
            <BarChart3 className="h-4 w-4 mr-2" />
            Szenarien
          </TabsTrigger>
          <TabsTrigger value="whatif">
            <Lightbulb className="h-4 w-4 mr-2" />
            Was-wäre-wenn
          </TabsTrigger>
          <TabsTrigger value="risks">
            <Shield className="h-4 w-4 mr-2" />
            Risiken
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Umsatz- und Gewinnprognose</CardTitle>
              <CardDescription>
                {config.horizon} Prognose - {config.scenario === 'conservative' ? 'Konservatives' :
                  config.scenario === 'moderate' ? 'Moderates' : 'Aggressives'} Szenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} interval={1} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Umsatz"
                      stroke="#22c55e"
                      fill="#bbf7d0"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Ausgaben"
                      stroke="#ef4444"
                      fill="#fecaca"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="Gewinn"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liquiditätsentwicklung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={cashFlowChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} interval={1} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cashBalance"
                      name="Kontostand"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monatliche Detailprognose</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Monat</TableHead>
                    <TableHead className="text-right">Umsatz</TableHead>
                    <TableHead className="text-right">Ausgaben</TableHead>
                    <TableHead className="text-right">Gewinn</TableHead>
                    <TableHead className="text-right">Kontostand</TableHead>
                    <TableHead className="text-right">Konfidenz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyForecast.slice(0, 12).map((f, i) => (
                    <TableRow key={i}>
                      <TableCell>{f.month} {f.year}</TableCell>
                      <TableCell className="text-right">{formatCurrency(f.revenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(f.expenses)}</TableCell>
                      <TableCell className={`text-right ${f.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(f.profit)}
                      </TableCell>
                      <TableCell className={`text-right ${f.cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(f.cashBalance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={f.confidence * 100} className="w-16 h-2" />
                          <span className="text-sm text-muted-foreground w-10">
                            {Math.round(f.confidence * 100)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {scenarios.map((s) => (
              <Card key={s.scenario} className={config.scenario === s.scenario ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{s.label}</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      s.risk === 'low' ? 'bg-green-50 text-green-700 border-green-200' :
                        s.risk === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-red-50 text-red-700 border-red-200'
                    }
                  >
                    {s.risk === 'low' ? 'Niedriges Risiko' :
                      s.risk === 'medium' ? 'Mittleres Risiko' : 'Hohes Risiko'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Wachstumsrate</p>
                      <p className="text-xl font-bold">{s.growth.toFixed(0)}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">12-Monats-Umsatz</p>
                      <p className="text-xl font-bold">{formatCurrency(s.revenue12m)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">12-Monats-Gewinn</p>
                      <p className={`text-xl font-bold ${s.profit12m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(s.profit12m)}
                      </p>
                    </div>
                    <Button
                      variant={config.scenario === s.scenario ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => updateConfig({ scenario: s.scenario })}
                    >
                      {config.scenario === s.scenario ? 'Aktiv' : 'Auswählen'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Szenario-Vergleich</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" name="Umsatz 12M" fill="#22c55e" />
                    <Bar dataKey="profit" name="Gewinn 12M" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wachstumstreiber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="driver" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Impact"
                        dataKey="impact"
                        stroke="#8b5cf6"
                        fill="#c4b5fd"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {growthDrivers.map((driver, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium">{driver.name}</div>
                      <div className="flex-1">
                        <Progress value={driver.impact} className="h-3" />
                      </div>
                      <div className="w-12 text-right text-sm font-medium">{driver.impact}%</div>
                      <Badge variant={driver.controllable ? 'default' : 'secondary'} className="text-xs">
                        {driver.controllable ? 'Steuerbar' : 'Extern'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatif" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anpassungen</CardTitle>
                <CardDescription>Simulieren Sie verschiedene Szenarien</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Umsatzänderung</Label>
                    <span className={`font-medium ${whatIfChanges.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {whatIfChanges.revenueChange >= 0 ? '+' : ''}{whatIfChanges.revenueChange}%
                    </span>
                  </div>
                  <Slider
                    value={[whatIfChanges.revenueChange]}
                    onValueChange={([v]) => setWhatIfChanges(prev => ({ ...prev, revenueChange: v }))}
                    min={-50}
                    max={50}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Kostenänderung</Label>
                    <span className={`font-medium ${whatIfChanges.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {whatIfChanges.expenseChange >= 0 ? '+' : ''}{whatIfChanges.expenseChange}%
                    </span>
                  </div>
                  <Slider
                    value={[whatIfChanges.expenseChange]}
                    onValueChange={([v]) => setWhatIfChanges(prev => ({ ...prev, expenseChange: v }))}
                    min={-30}
                    max={30}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Kundenwachstum</Label>
                    <span className={`font-medium ${whatIfChanges.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {whatIfChanges.customerGrowth >= 0 ? '+' : ''}{whatIfChanges.customerGrowth}%
                    </span>
                  </div>
                  <Slider
                    value={[whatIfChanges.customerGrowth]}
                    onValueChange={([v]) => setWhatIfChanges(prev => ({ ...prev, customerGrowth: v }))}
                    min={-30}
                    max={50}
                    step={5}
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setWhatIfChanges({ revenueChange: 0, expenseChange: 0, customerGrowth: 0 })}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Zurücksetzen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auswirkungen</CardTitle>
                <CardDescription>Vergleich Basis vs. Angepasst</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Gesamtumsatz', base: whatIfResult.base.totalRevenue, mod: whatIfResult.modified.totalRevenue },
                    { label: 'Gesamtausgaben', base: whatIfResult.base.totalExpenses, mod: whatIfResult.modified.totalExpenses, inverted: true },
                    { label: 'Gesamtgewinn', base: whatIfResult.base.totalProfit, mod: whatIfResult.modified.totalProfit },
                    { label: 'Gewinnmarge', base: whatIfResult.base.avgProfitMargin, mod: whatIfResult.modified.avgProfitMargin, isPercent: true },
                    { label: 'Endbestand', base: whatIfResult.base.endingCashBalance, mod: whatIfResult.modified.endingCashBalance },
                  ].map((row, i) => {
                    const change = row.mod - row.base;
                    const changePercent = row.base !== 0 ? ((row.mod - row.base) / Math.abs(row.base)) * 100 : 0;
                    const isPositive = row.inverted ? change < 0 : change > 0;

                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{row.label}</span>
                        <div className="text-right">
                          <p className="font-medium">
                            {row.isPercent ? `${row.mod.toFixed(1)}%` : formatCurrency(row.mod)}
                          </p>
                          <p className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {row.isPercent
                              ? `${change >= 0 ? '+' : ''}${change.toFixed(1)} Pkt.`
                              : `${change >= 0 ? '+' : ''}${formatCurrency(change)}`}
                            {!row.isPercent && ` (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%)`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Angepasste Prognose</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={whatIfResult.forecasts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Umsatz (angepasst)"
                      stroke="#22c55e"
                      fill="#bbf7d0"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="Gewinn (angepasst)"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {risks.map((risk, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${
                        risk.impact > 60 ? 'text-red-500' :
                          risk.impact > 40 ? 'text-orange-500' : 'text-yellow-500'
                      }`} />
                      {risk.factor}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        risk.impact > 60 ? 'bg-red-50 text-red-700 border-red-200' :
                          risk.impact > 40 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }
                    >
                      Impact: {risk.impact}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Wahrscheinlichkeit</p>
                        <Progress value={risk.probability} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12">{risk.probability.toFixed(0)}%</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Maßnahme</p>
                      <p className="text-sm">{risk.mitigation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Annahmen anpassen</CardTitle>
              <CardDescription>
                Passen Sie die Grundannahmen der Prognose an
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assumptions.map((assumption) => (
                  <div key={assumption.id} className="space-y-2">
                    <Label>{assumption.name}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={assumption.value}
                        onChange={(e) => updateAssumption(assumption.id, parseFloat(e.target.value) || 0)}
                        disabled={!assumption.editable}
                      />
                      {assumption.unit && (
                        <span className="flex items-center text-sm text-muted-foreground w-12">
                          {assumption.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
