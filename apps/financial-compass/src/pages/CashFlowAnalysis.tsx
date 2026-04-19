import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  useCashFlowAnalysis,
  CashFlowCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/hooks/useCashFlowAnalysis';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  AlertTriangle,
  AlertCircle,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Trash2,
  Edit2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart as RechartsPie,
  Pie,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function CashFlowAnalysis() {
  const { toast } = useToast();
  const {
    entries,
    currentBalance,
    loading,
    addEntry,
    deleteEntry,
    setCurrentBalance,
    getMonthlyBreakdown,
    generateForecast,
    getLiquidityAlerts,
    getCategorySummary,
    stats,
  } = useCashFlowAnalysis();

  const [activeTab, setActiveTab] = useState('overview');
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [tempBalance, setTempBalance] = useState(currentBalance.toString());
  const [newEntry, setNewEntry] = useState({
    type: 'inflow' as 'inflow' | 'outflow',
    category: 'revenue' as CashFlowCategory,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurrence_type: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  });

  const monthlyData = useMemo(() => getMonthlyBreakdown(12), [getMonthlyBreakdown]);
  const forecast = useMemo(() => generateForecast(12), [generateForecast]);
  const alerts = useMemo(() => getLiquidityAlerts(), [getLiquidityAlerts]);

  const today = new Date();
  const startOfYear = `${today.getFullYear()}-01-01`;
  const endOfYear = `${today.getFullYear()}-12-31`;
  const categorySummary = useMemo(
    () => getCategorySummary(startOfYear, endOfYear),
    [getCategorySummary, startOfYear, endOfYear]
  );

  // Prepare chart data
  const chartData = monthlyData.map(period => ({
    month: new Date(period.start_date).toLocaleDateString('de-DE', { month: 'short' }),
    inflows: period.total_inflows,
    outflows: period.total_outflows,
    net: period.net_cash_flow,
    balance: period.closing_balance,
  }));

  const forecastChartData = [
    { month: 'Aktuell', balance: currentBalance, type: 'actual' },
    ...forecast.periods.map(p => ({
      month: p.month,
      balance: p.projected_balance,
      type: 'forecast',
      confidence: p.confidence,
    })),
  ];

  // Pie chart data for categories
  const inflowCategories = Object.entries(categorySummary)
    .filter(([_, v]) => v.inflow > 0)
    .map(([cat, v]) => ({
      name: CATEGORY_LABELS[cat as CashFlowCategory],
      value: v.inflow,
      color: CATEGORY_COLORS[cat as CashFlowCategory],
    }));

  const outflowCategories = Object.entries(categorySummary)
    .filter(([_, v]) => v.outflow > 0)
    .map(([cat, v]) => ({
      name: CATEGORY_LABELS[cat as CashFlowCategory],
      value: v.outflow,
      color: CATEGORY_COLORS[cat as CashFlowCategory],
    }));

  const handleAddEntry = () => {
    if (!newEntry.description || !newEntry.amount) {
      toast({ title: 'Fehler', description: 'Bitte alle Felder ausfüllen', variant: 'destructive' });
      return;
    }

    addEntry({
      type: newEntry.type,
      category: newEntry.category,
      description: newEntry.description,
      amount: parseFloat(newEntry.amount),
      date: newEntry.date,
      is_recurring: newEntry.is_recurring,
      recurrence_type: newEntry.is_recurring ? newEntry.recurrence_type : undefined,
    });

    setNewEntryOpen(false);
    setNewEntry({
      type: 'inflow',
      category: 'revenue',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurrence_type: 'monthly',
    });
    toast({ title: 'Eintrag hinzugefügt' });
  };

  const handleUpdateBalance = () => {
    const balance = parseFloat(tempBalance);
    if (isNaN(balance)) {
      toast({ title: 'Fehler', description: 'Ungültiger Betrag', variant: 'destructive' });
      return;
    }
    setCurrentBalance(balance);
    setBalanceDialogOpen(false);
    toast({ title: 'Kontostand aktualisiert' });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

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
          <h1 className="text-2xl font-bold">Cash-Flow-Analyse</h1>
          <p className="text-muted-foreground">Liquiditätsplanung und Prognose</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wallet className="h-4 w-4 mr-2" />
                Kontostand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aktuellen Kontostand setzen</DialogTitle>
                <DialogDescription>
                  Geben Sie Ihren aktuellen Gesamtkontostand ein
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label>Kontostand (EUR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={tempBalance}
                  onChange={(e) => setTempBalance(e.target.value)}
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleUpdateBalance}>
                  Speichern
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={newEntryOpen} onOpenChange={setNewEntryOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Eintrag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuer Cash-Flow-Eintrag</DialogTitle>
                <DialogDescription>
                  Erfassen Sie eine Einnahme oder Ausgabe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={newEntry.type === 'inflow' ? 'default' : 'outline'}
                    className={newEntry.type === 'inflow' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => setNewEntry({ ...newEntry, type: 'inflow', category: 'revenue' })}
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Einnahme
                  </Button>
                  <Button
                    type="button"
                    variant={newEntry.type === 'outflow' ? 'default' : 'outline'}
                    className={newEntry.type === 'outflow' ? 'bg-red-600 hover:bg-red-700' : ''}
                    onClick={() => setNewEntry({ ...newEntry, type: 'outflow', category: 'personnel' })}
                  >
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Ausgabe
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Select
                    value={newEntry.category}
                    onValueChange={(v) => setNewEntry({ ...newEntry, category: v as CashFlowCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {newEntry.type === 'inflow' ? (
                        <>
                          <SelectItem value="revenue">Umsatzerlöse</SelectItem>
                          <SelectItem value="receivables">Forderungen</SelectItem>
                          <SelectItem value="other_income">Sonstige Einnahmen</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="personnel">Personalkosten</SelectItem>
                          <SelectItem value="rent">Miete</SelectItem>
                          <SelectItem value="utilities">Nebenkosten</SelectItem>
                          <SelectItem value="materials">Material</SelectItem>
                          <SelectItem value="services">Dienstleistungen</SelectItem>
                          <SelectItem value="taxes">Steuern</SelectItem>
                          <SelectItem value="insurance">Versicherungen</SelectItem>
                          <SelectItem value="loans">Kredite</SelectItem>
                          <SelectItem value="investments">Investitionen</SelectItem>
                          <SelectItem value="other_expenses">Sonstige Ausgaben</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Input
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="z.B. Monatliche Büromiete"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Betrag (EUR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newEntry.amount}
                      onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Datum</Label>
                    <Input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEntry.is_recurring}
                      onChange={(e) => setNewEntry({ ...newEntry, is_recurring: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span>Wiederkehrend</span>
                  </label>
                  {newEntry.is_recurring && (
                    <Select
                      value={newEntry.recurrence_type}
                      onValueChange={(v: any) => setNewEntry({ ...newEntry, recurrence_type: v })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                        <SelectItem value="quarterly">Quartalsweise</SelectItem>
                        <SelectItem value="yearly">Jährlich</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewEntryOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleAddEntry}>
                  Hinzufügen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-4 rounded-lg ${
                alert.type === 'critical'
                  ? 'bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800'
                  : 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
              }`}
            >
              {alert.type === 'critical' ? (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${alert.type === 'critical' ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                  {alert.message}
                </p>
                {alert.projected_shortfall && (
                  <p className={`text-sm ${alert.type === 'critical' ? 'text-red-600 dark:text-red-300' : 'text-yellow-600 dark:text-yellow-300'}`}>
                    {alert.type === 'critical' ? 'Fehlbetrag: ' : 'Unter Minimum: '}
                    {formatCurrency(alert.projected_shortfall)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(currentBalance)}</p>
                <p className="text-sm text-muted-foreground">Aktueller Stand</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.monthInflows)}</p>
                <p className="text-sm text-muted-foreground">Einnahmen (Monat)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.monthOutflows)}</p>
                <p className="text-sm text-muted-foreground">Ausgaben (Monat)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stats.monthNetFlow >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                {stats.monthNetFlow >= 0 ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-300" />
                )}
              </div>
              <div>
                <p className={`text-2xl font-bold ${stats.monthNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.monthNetFlow)}
                </p>
                <p className="text-sm text-muted-foreground">Netto (Monat)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <LineChart className="h-4 w-4 mr-2" />
            Prognose
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChart className="h-4 w-4 mr-2" />
            Kategorien
          </TabsTrigger>
          <TabsTrigger value="entries">
            <Calendar className="h-4 w-4 mr-2" />
            Einträge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash-Flow der letzten 12 Monate</CardTitle>
              <CardDescription>Einnahmen vs. Ausgaben</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Monat: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="inflows" name="Einnahmen" fill="#22c55e" />
                    <Bar dataKey="outflows" name="Ausgaben" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontostandentwicklung</CardTitle>
              <CardDescription>Verlauf über die letzten 12 Monate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      name="Kontostand"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {forecast.scenarios.map((scenario) => (
              <Card key={scenario.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg capitalize">
                    {scenario.name === 'optimistic' ? '🌟 Optimistisch' :
                      scenario.name === 'realistic' ? '📊 Realistisch' : '⚠️ Pessimistisch'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">In 6 Monaten</p>
                      <p className={`text-xl font-bold ${scenario.projected_balance_6m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(scenario.projected_balance_6m)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">In 12 Monaten</p>
                      <p className={`text-xl font-bold ${scenario.projected_balance_12m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(scenario.projected_balance_12m)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>12-Monats-Prognose</CardTitle>
              <CardDescription>Erwarteter Kontostandverlauf</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [formatCurrency(value), 'Kontostand']}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      name="Prognose"
                      stroke="#8b5cf6"
                      fill="#c4b5fd"
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monatliche Prognose</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Monat</TableHead>
                    <TableHead className="text-right">Einnahmen</TableHead>
                    <TableHead className="text-right">Ausgaben</TableHead>
                    <TableHead className="text-right">Kontostand</TableHead>
                    <TableHead className="text-right">Konfidenz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast.periods.slice(0, 6).map((period, i) => (
                    <TableRow key={i}>
                      <TableCell>{period.month} {period.year}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(period.projected_inflows)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(period.projected_outflows)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${period.projected_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(period.projected_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={period.confidence * 100} className="w-16 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {Math.round(period.confidence * 100)}%
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

        <TabsContent value="categories" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-green-600" />
                  Einnahmen nach Kategorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inflowCategories.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={inflowCategories}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {inflowCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Keine Daten</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowDownCircle className="h-5 w-5 text-red-600" />
                  Ausgaben nach Kategorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {outflowCategories.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={outflowCategories}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {outflowCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Keine Daten</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kategorien-Übersicht {today.getFullYear()}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategorie</TableHead>
                    <TableHead className="text-right">Einnahmen</TableHead>
                    <TableHead className="text-right">Ausgaben</TableHead>
                    <TableHead className="text-right">Netto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(categorySummary)
                    .filter(([_, v]) => v.inflow > 0 || v.outflow > 0)
                    .map(([cat, values]) => {
                      const net = values.inflow - values.outflow;
                      return (
                        <TableRow key={cat}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: CATEGORY_COLORS[cat as CashFlowCategory] }}
                              />
                              {CATEGORY_LABELS[cat as CashFlowCategory]}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {values.inflow > 0 ? formatCurrency(values.inflow) : '-'}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {values.outflow > 0 ? formatCurrency(values.outflow) : '-'}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(net)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alle Einträge</CardTitle>
              <CardDescription>
                {entries.length} Einträge • {stats.recurringInflowCount + stats.recurringOutflowCount} wiederkehrend
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Keine Einträge vorhanden
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead>Kategorie</TableHead>
                      <TableHead className="text-right">Betrag</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.slice(0, 50).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.date).toLocaleDateString('de-DE')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.description}
                            {entry.is_recurring && (
                              <Badge variant="outline" className="text-xs">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                {entry.recurrence_type === 'weekly' ? 'Wöchentlich' :
                                  entry.recurrence_type === 'monthly' ? 'Monatlich' :
                                    entry.recurrence_type === 'quarterly' ? 'Quartalsweise' : 'Jährlich'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[entry.category]}20`,
                              borderColor: CATEGORY_COLORS[entry.category],
                              color: CATEGORY_COLORS[entry.category],
                            }}
                          >
                            {CATEGORY_LABELS[entry.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${entry.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.type === 'inflow' ? '+' : '-'}{formatCurrency(entry.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              deleteEntry(entry.id);
                              toast({ title: 'Eintrag gelöscht' });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
