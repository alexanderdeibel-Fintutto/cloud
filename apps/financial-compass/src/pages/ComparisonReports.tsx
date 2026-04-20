import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useComparisonReports,
  ComparisonType,
  ComparisonResult,
} from '@/hooks/useComparisonReports';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  BarChart3,
  Calendar,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  FileBarChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
} from 'recharts';

export default function ComparisonReports() {
  const {
    loading,
    comparePeriods,
    getMonthlyTrends,
    getAccountComparisons,
    getAvailablePeriods,
    getKeyInsights,
  } = useComparisonReports();

  const [activeTab, setActiveTab] = useState('comparison');
  const [comparisonType, setComparisonType] = useState<ComparisonType>('year');
  const [period1, setPeriod1] = useState('');
  const [period2, setPeriod2] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  const availablePeriods = useMemo(
    () => getAvailablePeriods(comparisonType),
    [getAvailablePeriods, comparisonType]
  );

  // Set default periods
  useEffect(() => {
    if (availablePeriods.length >= 2) {
      setPeriod2(availablePeriods[0].value);
      setPeriod1(availablePeriods[1].value);
    }
  }, [availablePeriods]);

  // Run comparison when periods change
  useEffect(() => {
    if (period1 && period2) {
      const result = comparePeriods(period1, period2, comparisonType);
      setComparison(result);
    }
  }, [period1, period2, comparisonType, comparePeriods]);

  const monthlyTrends = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    return {
      current: getMonthlyTrends(currentYear),
      previous: getMonthlyTrends(lastYear),
    };
  }, [getMonthlyTrends]);

  const accountComparisons = useMemo(() => {
    if (period1 && period2) {
      return getAccountComparisons(period1, period2);
    }
    return [];
  }, [period1, period2, getAccountComparisons]);

  const insights = useMemo(() => {
    if (comparison) {
      return getKeyInsights(comparison);
    }
    return [];
  }, [comparison, getKeyInsights]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const formatPercent = (value: number) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  const getChangeIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = (direction: 'up' | 'down' | 'stable', isExpense = false) => {
    if (direction === 'stable') return 'text-gray-500';
    // For expenses, "up" is bad, "down" is good
    if (isExpense) {
      return direction === 'up' ? 'text-red-600' : 'text-green-600';
    }
    return direction === 'up' ? 'text-green-600' : 'text-red-600';
  };

  // Prepare chart data for monthly comparison
  const monthlyChartData = useMemo(() => {
    return monthlyTrends.current.map((curr, i) => ({
      month: curr.month,
      [`Umsatz ${new Date().getFullYear()}`]: curr.revenue,
      [`Umsatz ${new Date().getFullYear() - 1}`]: monthlyTrends.previous[i]?.revenue || 0,
      [`Gewinn ${new Date().getFullYear()}`]: curr.profit,
      [`Gewinn ${new Date().getFullYear() - 1}`]: monthlyTrends.previous[i]?.profit || 0,
    }));
  }, [monthlyTrends]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Vergleichsberichte</h1>
          <p className="text-muted-foreground">Periodenvergleich und Trendanalyse</p>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Vergleichsart</label>
              <Select
                value={comparisonType}
                onValueChange={(v) => setComparisonType(v as ComparisonType)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Jahresvergleich</SelectItem>
                  <SelectItem value="quarter">Quartalsvergleich</SelectItem>
                  <SelectItem value="month">Monatsvergleich</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Periode 1 (älter)</label>
              <Select value={period1} onValueChange={setPeriod1}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map((p) => (
                    <SelectItem key={p.value} value={p.value} disabled={p.value === period2}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />

            <div className="space-y-1">
              <label className="text-sm font-medium">Periode 2 (neuer)</label>
              <Select value={period2} onValueChange={setPeriod2}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map((p) => (
                    <SelectItem key={p.value} value={p.value} disabled={p.value === period1}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {comparison && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Umsatz</span>
                  {getChangeIcon(comparison.changes.revenue.direction)}
                </div>
                <p className="text-2xl font-bold">{formatCurrency(comparison.period2.revenue)}</p>
                <p className={`text-sm ${getChangeColor(comparison.changes.revenue.direction)}`}>
                  {formatPercent(comparison.changes.revenue.percent)} vs. Vorperiode
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Ausgaben</span>
                  {getChangeIcon(comparison.changes.expenses.direction)}
                </div>
                <p className="text-2xl font-bold">{formatCurrency(comparison.period2.expenses)}</p>
                <p className={`text-sm ${getChangeColor(comparison.changes.expenses.direction, true)}`}>
                  {formatPercent(comparison.changes.expenses.percent)} vs. Vorperiode
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Gewinn</span>
                  {getChangeIcon(comparison.changes.profit.direction)}
                </div>
                <p className={`text-2xl font-bold ${comparison.period2.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(comparison.period2.profit)}
                </p>
                <p className={`text-sm ${getChangeColor(comparison.changes.profit.direction)}`}>
                  {formatPercent(comparison.changes.profit.percent)} vs. Vorperiode
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Kunden</span>
                  {getChangeIcon(comparison.changes.customers.direction)}
                </div>
                <p className="text-2xl font-bold">{comparison.period2.customers}</p>
                <p className={`text-sm ${getChangeColor(comparison.changes.customers.direction)}`}>
                  {formatPercent(comparison.changes.customers.percent)} vs. Vorperiode
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Insights and Trends */}
          {(comparison.trends.length > 0 || insights.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {comparison.trends.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Trend-Analyse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comparison.trends.map((trend, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            trend.significance === 'high' ? 'bg-red-500' :
                              trend.significance === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className="font-medium">{trend.metric}</p>
                            <p className="text-sm text-muted-foreground">{trend.description}</p>
                            {trend.recommendation && (
                              <p className="text-sm text-primary mt-1">{trend.recommendation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {insights.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Wichtige Erkenntnisse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="comparison">
                <BarChart3 className="h-4 w-4 mr-2" />
                Vergleich
              </TabsTrigger>
              <TabsTrigger value="trends">
                <Calendar className="h-4 w-4 mr-2" />
                Monatstrend
              </TabsTrigger>
              <TabsTrigger value="accounts">
                <FileBarChart className="h-4 w-4 mr-2" />
                Konten
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-6">
              {/* Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Periodenvergleich</CardTitle>
                  <CardDescription>
                    {comparison.period1.label} vs. {comparison.period2.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: 'Umsatz',
                            [comparison.period1.label]: comparison.period1.revenue,
                            [comparison.period2.label]: comparison.period2.revenue,
                          },
                          {
                            name: 'Ausgaben',
                            [comparison.period1.label]: comparison.period1.expenses,
                            [comparison.period2.label]: comparison.period2.expenses,
                          },
                          {
                            name: 'Gewinn',
                            [comparison.period1.label]: comparison.period1.profit,
                            [comparison.period2.label]: comparison.period2.profit,
                          },
                        ]}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" width={80} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey={comparison.period1.label} fill="#94a3b8" />
                        <Bar dataKey={comparison.period2.label} fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailvergleich</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kennzahl</TableHead>
                        <TableHead className="text-right">{comparison.period1.label}</TableHead>
                        <TableHead className="text-right">{comparison.period2.label}</TableHead>
                        <TableHead className="text-right">Änderung</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { label: 'Umsatz', key: 'revenue', isExpense: false },
                        { label: 'Ausgaben', key: 'expenses', isExpense: true },
                        { label: 'Gewinn', key: 'profit', isExpense: false },
                        { label: 'Aktiva', key: 'assets', isExpense: false },
                        { label: 'Verbindlichkeiten', key: 'liabilities', isExpense: true },
                        { label: 'Eigenkapital', key: 'equity', isExpense: false },
                      ].map((row) => {
                        const change = comparison.changes[row.key as keyof typeof comparison.changes];
                        const v1 = comparison.period1[row.key as keyof typeof comparison.period1] as number;
                        const v2 = comparison.period2[row.key as keyof typeof comparison.period2] as number;
                        return (
                          <TableRow key={row.key}>
                            <TableCell className="font-medium">{row.label}</TableCell>
                            <TableCell className="text-right">{formatCurrency(v1)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(v2)}</TableCell>
                            <TableCell className={`text-right ${getChangeColor(change.direction, row.isExpense)}`}>
                              <div className="flex items-center justify-end gap-1">
                                {change.direction === 'up' ? (
                                  <ArrowUpRight className="h-4 w-4" />
                                ) : change.direction === 'down' ? (
                                  <ArrowDownRight className="h-4 w-4" />
                                ) : null}
                                {formatCurrency(change.absolute)}
                              </div>
                            </TableCell>
                            <TableCell className={`text-right ${getChangeColor(change.direction, row.isExpense)}`}>
                              {formatPercent(change.percent)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Activity Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitätsvergleich</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Buchungen</p>
                      <div className="flex items-center justify-center gap-4">
                        <div>
                          <p className="text-lg text-muted-foreground">{comparison.period1.transactions}</p>
                          <p className="text-xs text-muted-foreground">{comparison.period1.label}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{comparison.period2.transactions}</p>
                          <p className="text-xs text-muted-foreground">{comparison.period2.label}</p>
                        </div>
                      </div>
                      <Badge
                        className={`mt-2 ${
                          comparison.changes.transactions.direction === 'up'
                            ? 'bg-green-100 text-green-800'
                            : comparison.changes.transactions.direction === 'down'
                              ? 'bg-red-100 text-red-800'
                              : ''
                        }`}
                      >
                        {formatPercent(comparison.changes.transactions.percent)}
                      </Badge>
                    </div>

                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Rechnungen</p>
                      <div className="flex items-center justify-center gap-4">
                        <div>
                          <p className="text-lg text-muted-foreground">{comparison.period1.invoices}</p>
                          <p className="text-xs text-muted-foreground">{comparison.period1.label}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{comparison.period2.invoices}</p>
                          <p className="text-xs text-muted-foreground">{comparison.period2.label}</p>
                        </div>
                      </div>
                      <Badge
                        className={`mt-2 ${
                          comparison.changes.invoices.direction === 'up'
                            ? 'bg-green-100 text-green-800'
                            : comparison.changes.invoices.direction === 'down'
                              ? 'bg-red-100 text-red-800'
                              : ''
                        }`}
                      >
                        {formatPercent(comparison.changes.invoices.percent)}
                      </Badge>
                    </div>

                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Kunden</p>
                      <div className="flex items-center justify-center gap-4">
                        <div>
                          <p className="text-lg text-muted-foreground">{comparison.period1.customers}</p>
                          <p className="text-xs text-muted-foreground">{comparison.period1.label}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{comparison.period2.customers}</p>
                          <p className="text-xs text-muted-foreground">{comparison.period2.label}</p>
                        </div>
                      </div>
                      <Badge
                        className={`mt-2 ${
                          comparison.changes.customers.direction === 'up'
                            ? 'bg-green-100 text-green-800'
                            : comparison.changes.customers.direction === 'down'
                              ? 'bg-red-100 text-red-800'
                              : ''
                        }`}
                      >
                        {formatPercent(comparison.changes.customers.percent)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Umsatzentwicklung im Jahresvergleich</CardTitle>
                  <CardDescription>
                    {new Date().getFullYear() - 1} vs. {new Date().getFullYear()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={`Umsatz ${new Date().getFullYear() - 1}`}
                          stroke="#94a3b8"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey={`Umsatz ${new Date().getFullYear()}`}
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gewinnentwicklung im Jahresvergleich</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey={`Gewinn ${new Date().getFullYear() - 1}`}
                          fill="#e2e8f0"
                          stroke="#94a3b8"
                        />
                        <Line
                          type="monotone"
                          dataKey={`Gewinn ${new Date().getFullYear()}`}
                          stroke="#22c55e"
                          strokeWidth={2}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kontenvergleich</CardTitle>
                  <CardDescription>
                    Veränderungen auf Kontoebene zwischen den Perioden
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Konto</TableHead>
                        <TableHead>Bezeichnung</TableHead>
                        <TableHead className="text-right">{comparison.period1.label}</TableHead>
                        <TableHead className="text-right">{comparison.period2.label}</TableHead>
                        <TableHead className="text-right">Änderung</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accountComparisons.map((acc) => (
                        <TableRow key={acc.accountNumber}>
                          <TableCell className="font-mono">{acc.accountNumber}</TableCell>
                          <TableCell>{acc.accountName}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(acc.period1Amount)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(acc.period2Amount)}
                          </TableCell>
                          <TableCell className={`text-right ${acc.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(acc.change)}
                          </TableCell>
                          <TableCell className={`text-right ${acc.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(acc.changePercent)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
