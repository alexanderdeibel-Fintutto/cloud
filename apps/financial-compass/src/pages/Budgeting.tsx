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
  useBudgeting,
  BudgetPeriod,
  BudgetCategory,
  CATEGORY_CONFIG,
} from '@/hooks/useBudgeting';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  BarChart3,
  Calendar,
  Copy,
  Play,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';

export default function Budgeting() {
  const { toast } = useToast();
  const {
    budgets,
    loading,
    createBudget,
    updateCategoryAmount,
    deleteBudget,
    activateBudget,
    getBudgetComparison,
    getBudgetSummary,
    getPeriodLabels,
    getCurrentPeriodIndex,
    getActiveBudget,
    getBudgetProgress,
  } = useBudgeting();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<number | undefined>(undefined);
  const [newBudgetOpen, setNewBudgetOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: '',
    year: new Date().getFullYear(),
    period: 'monthly' as BudgetPeriod,
    copyFrom: '',
  });

  // Set default selected budget
  useMemo(() => {
    if (!selectedBudgetId && budgets.length > 0) {
      const active = getActiveBudget();
      setSelectedBudgetId(active?.id || budgets[0].id);
    }
  }, [budgets, selectedBudgetId, getActiveBudget]);

  const selectedBudget = budgets.find(b => b.id === selectedBudgetId);
  const comparison = useMemo(
    () => selectedBudget ? getBudgetComparison(selectedBudgetId, selectedPeriod) : [],
    [selectedBudgetId, selectedPeriod, getBudgetComparison, selectedBudget]
  );
  const summary = useMemo(
    () => selectedBudget ? getBudgetSummary(selectedBudgetId) : null,
    [selectedBudgetId, getBudgetSummary, selectedBudget]
  );
  const periodLabels = selectedBudget ? getPeriodLabels(selectedBudget.period) : [];
  const currentPeriodIndex = selectedBudget ? getCurrentPeriodIndex(selectedBudget.period) : 0;
  const budgetProgress = selectedBudget ? getBudgetProgress(selectedBudget) : 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const handleCreateBudget = () => {
    if (!newBudget.name) {
      toast({ title: 'Fehler', description: 'Bitte geben Sie einen Namen ein', variant: 'destructive' });
      return;
    }

    const budget = createBudget(newBudget);
    if (budget) {
      setSelectedBudgetId(budget.id);
      setNewBudgetOpen(false);
      setNewBudget({ name: '', year: new Date().getFullYear(), period: 'monthly', copyFrom: '' });
      toast({ title: 'Budget erstellt', description: `${budget.name} wurde erstellt` });
    }
  };

  const handleActivate = () => {
    if (selectedBudgetId) {
      activateBudget(selectedBudgetId);
      toast({ title: 'Budget aktiviert' });
    }
  };

  const handleDelete = () => {
    if (selectedBudgetId) {
      deleteBudget(selectedBudgetId);
      setSelectedBudgetId(budgets.filter(b => b.id !== selectedBudgetId)[0]?.id || '');
      toast({ title: 'Budget gelöscht' });
    }
  };

  // Chart data
  const comparisonChartData = comparison
    .filter(c => c.type === 'expense' && (c.planned > 0 || c.actual > 0))
    .map(c => ({
      name: c.categoryLabel,
      Geplant: c.planned,
      Ist: c.actual,
    }));

  const pieChartData = comparison
    .filter(c => c.type === 'expense' && c.actual > 0)
    .map(c => ({
      name: c.categoryLabel,
      value: c.actual,
      color: CATEGORY_CONFIG[c.category].color,
    }));

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
          <h1 className="text-2xl font-bold">Budgetplanung</h1>
          <p className="text-muted-foreground">Planen und überwachen Sie Ihr Budget</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedBudgetId} onValueChange={setSelectedBudgetId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Budget wählen" />
            </SelectTrigger>
            <SelectContent>
              {budgets.map(b => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name} {b.status === 'active' && '✓'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={newBudgetOpen} onOpenChange={setNewBudgetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neues Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neues Budget erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie ein neues Budget für Ihre Finanzplanung
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newBudget.name}
                    onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                    placeholder="z.B. Budget 2026"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jahr</Label>
                    <Select
                      value={newBudget.year.toString()}
                      onValueChange={(v) => setNewBudget({ ...newBudget, year: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(5)].map((_, i) => {
                          const year = new Date().getFullYear() + i - 1;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Zeitraum</Label>
                    <Select
                      value={newBudget.period}
                      onValueChange={(v) => setNewBudget({ ...newBudget, period: v as BudgetPeriod })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                        <SelectItem value="quarterly">Quartalsweise</SelectItem>
                        <SelectItem value="yearly">Jährlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Kopieren von (optional)</Label>
                  <Select
                    value={newBudget.copyFrom}
                    onValueChange={(v) => setNewBudget({ ...newBudget, copyFrom: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kein Kopieren" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Kein Kopieren</SelectItem>
                      {budgets.map(b => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewBudgetOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleCreateBudget}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedBudget && summary && (
        <>
          {/* Budget Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedBudget.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedBudget.period === 'monthly' ? 'Monatlich' :
                        selectedBudget.period === 'quarterly' ? 'Quartalsweise' : 'Jährlich'} • {selectedBudget.year}
                    </p>
                  </div>
                  <Badge
                    variant={selectedBudget.status === 'active' ? 'default' :
                      selectedBudget.status === 'draft' ? 'secondary' : 'outline'}
                  >
                    {selectedBudget.status === 'active' ? 'Aktiv' :
                      selectedBudget.status === 'draft' ? 'Entwurf' : 'Abgeschlossen'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Jahresfortschritt</span>
                      <span className="font-medium">{budgetProgress}%</span>
                    </div>
                    <Progress value={budgetProgress} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    {selectedBudget.status === 'draft' && (
                      <Button variant="outline" size="sm" onClick={handleActivate}>
                        <Play className="h-4 w-4 mr-1" />
                        Aktivieren
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      {editMode ? 'Fertig' : 'Bearbeiten'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
                    <p className="text-sm text-muted-foreground">Plan-Einnahmen</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.totalPlannedIncome)}</p>
                    <p className="text-sm text-green-600">
                      Ist: {formatCurrency(summary.totalActualIncome)}
                    </p>
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
                    <p className="text-sm text-muted-foreground">Plan-Ausgaben</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.totalPlannedExpenses)}</p>
                    <p className="text-sm text-red-600">
                      Ist: {formatCurrency(summary.totalActualExpenses)}
                    </p>
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
                    <p className="text-sm text-muted-foreground">Plan-Gewinn</p>
                    <p className={`text-xl font-bold ${summary.plannedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(summary.plannedProfit)}
                    </p>
                    <p className={`text-sm ${summary.actualProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Ist: {formatCurrency(summary.actualProfit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${summary.overBudgetCategories > 0 ? 'bg-orange-100 dark:bg-orange-900' : 'bg-green-100 dark:bg-green-900'}`}>
                    {summary.overBudgetCategories > 0 ? (
                      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-300" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget-Status</p>
                    <p className="text-xl font-bold">
                      {summary.overBudgetCategories > 0 ? (
                        <span className="text-orange-600">{summary.overBudgetCategories} über Plan</span>
                      ) : (
                        <span className="text-green-600">Im Plan</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {summary.underBudgetCategories} unter Plan
                    </p>
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
              <TabsTrigger value="details">
                <Calendar className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="categories">
                <PieChart className="h-4 w-4 mr-2" />
                Kategorien
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Period Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Label>Zeitraum:</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedPeriod === undefined ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedPeriod(undefined)}
                      >
                        Gesamt
                      </Button>
                      {periodLabels.map((label, i) => (
                        <Button
                          key={i}
                          variant={selectedPeriod === i ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedPeriod(i)}
                          className={i === currentPeriodIndex ? 'ring-2 ring-primary ring-offset-2' : ''}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan vs. Ist Vergleich</CardTitle>
                  <CardDescription>Ausgaben nach Kategorie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" width={120} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="Geplant" fill="#94a3b8" />
                        <Bar dataKey="Ist" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget-Vergleich</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategorie</TableHead>
                        <TableHead className="text-right">Geplant</TableHead>
                        <TableHead className="text-right">Ist</TableHead>
                        <TableHead className="text-right">Abweichung</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparison.map((c) => (
                        <TableRow key={c.category}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: CATEGORY_CONFIG[c.category].color }}
                              />
                              {c.categoryLabel}
                              {c.type === 'income' && (
                                <Badge variant="outline" className="text-xs">Einnahme</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(c.planned)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(c.actual)}</TableCell>
                          <TableCell className={`text-right ${
                            c.type === 'expense'
                              ? c.variance > 0 ? 'text-red-600' : c.variance < 0 ? 'text-green-600' : ''
                              : c.variance > 0 ? 'text-green-600' : c.variance < 0 ? 'text-red-600' : ''
                          }`}>
                            {c.variance >= 0 ? '+' : ''}{formatCurrency(c.variance)}
                            <span className="text-xs ml-1">
                              ({c.variancePercent >= 0 ? '+' : ''}{c.variancePercent.toFixed(1)}%)
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className={
                                c.status === 'over' ? 'bg-red-50 text-red-700 border-red-200' :
                                  c.status === 'under' ? 'bg-green-50 text-green-700 border-green-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                              }
                            >
                              {c.status === 'over' ? 'Über Plan' :
                                c.status === 'under' ? 'Unter Plan' : 'Im Plan'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Budget-Details nach Periode</CardTitle>
                  <CardDescription>
                    {editMode ? 'Klicken Sie auf Werte zum Bearbeiten' : 'Aktivieren Sie den Bearbeitungsmodus'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background">Kategorie</TableHead>
                        {periodLabels.map((label, i) => (
                          <TableHead
                            key={i}
                            className={`text-center min-w-[100px] ${i === currentPeriodIndex ? 'bg-primary/10' : ''}`}
                          >
                            {label}
                          </TableHead>
                        ))}
                        <TableHead className="text-right">Summe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBudget.categories.map((cat) => {
                        const config = CATEGORY_CONFIG[cat.category];
                        const plannedSum = cat.planned.reduce((sum, v) => sum + v, 0);
                        const actualSum = cat.actual.reduce((sum, v) => sum + v, 0);

                        return (
                          <TableRow key={cat.category}>
                            <TableCell className="sticky left-0 bg-background">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: config.color }}
                                />
                                <span className="truncate">{config.label}</span>
                              </div>
                            </TableCell>
                            {periodLabels.map((_, i) => (
                              <TableCell
                                key={i}
                                className={`text-center ${i === currentPeriodIndex ? 'bg-primary/10' : ''}`}
                              >
                                <div className="space-y-1">
                                  {editMode ? (
                                    <Input
                                      type="number"
                                      className="w-24 h-7 text-xs text-center mx-auto"
                                      value={cat.planned[i] || 0}
                                      onChange={(e) => updateCategoryAmount(
                                        selectedBudgetId,
                                        cat.category,
                                        i,
                                        'planned',
                                        parseFloat(e.target.value) || 0
                                      )}
                                    />
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      {(cat.planned[i] || 0).toLocaleString('de-DE')}
                                    </p>
                                  )}
                                  <p className={`text-sm font-medium ${
                                    i <= currentPeriodIndex
                                      ? cat.type === 'expense'
                                        ? cat.actual[i] > cat.planned[i] ? 'text-red-600' : 'text-green-600'
                                        : cat.actual[i] < cat.planned[i] ? 'text-red-600' : 'text-green-600'
                                      : 'text-muted-foreground'
                                  }`}>
                                    {(cat.actual[i] || 0).toLocaleString('de-DE')}
                                  </p>
                                </div>
                              </TableCell>
                            ))}
                            <TableCell className="text-right">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Plan: {plannedSum.toLocaleString('de-DE')}
                                </p>
                                <p className="text-sm font-medium">
                                  Ist: {actualSum.toLocaleString('de-DE')}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ausgabenverteilung (Ist)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pieChartData.length > 0 ? (
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={pieChartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              labelLine={false}
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Keine Ist-Daten vorhanden
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Abweichungen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comparison
                        .filter(c => c.type === 'expense' && Math.abs(c.variancePercent) > 5)
                        .sort((a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent))
                        .slice(0, 5)
                        .map((c) => (
                          <div key={c.category} className="flex items-center gap-4">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: CATEGORY_CONFIG[c.category].color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{c.categoryLabel}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(c.actual)} von {formatCurrency(c.planned)}
                              </p>
                            </div>
                            <div className={`text-right ${
                              c.variance > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              <p className="font-medium">
                                {c.variancePercent >= 0 ? '+' : ''}{c.variancePercent.toFixed(1)}%
                              </p>
                              <p className="text-sm">
                                {c.variance >= 0 ? '+' : ''}{formatCurrency(c.variance)}
                              </p>
                            </div>
                          </div>
                        ))}
                      {comparison.filter(c => c.type === 'expense' && Math.abs(c.variancePercent) > 5).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Alle Kategorien im Plan
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!selectedBudget && budgets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Kein Budget vorhanden</h3>
            <p className="text-muted-foreground mb-4">
              Erstellen Sie Ihr erstes Budget, um Ihre Finanzen zu planen
            </p>
            <Button onClick={() => setNewBudgetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Budget erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
