import { useState } from 'react';
import { useBWA, BWA_STRUCTURE } from '@/hooks/useBWA';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  Download,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  Euro,
  Percent,
  Calculator,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const BWA = () => {
  const { toast } = useToast();
  const {
    settings,
    isLoading,
    updateSettings,
    generateReport,
    getReport,
    getYTDReport,
    calculatePercentages,
    compareToBudget,
    getKeyMetrics,
    exportBWA,
  } = useBWA();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const report = getReport(selectedYear, selectedMonth) || generateReport(selectedYear, selectedMonth);
  const percentages = calculatePercentages(report.data);
  const metrics = getKeyMetrics(report);
  const budgetComparison = report.budget ? compareToBudget(report.data, report.budget) : null;
  const ytdData = settings.showYTD ? getYTDReport(selectedYear, selectedMonth) : null;

  const handleRefresh = () => {
    generateReport(selectedYear, selectedMonth);
    toast({
      title: 'BWA aktualisiert',
      description: 'Die Daten wurden neu berechnet.',
    });
  };

  const handleExport = () => {
    exportBWA(selectedYear, selectedMonth);
    toast({
      title: 'Export erstellt',
      description: 'Die BWA wurde als CSV exportiert.',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">BWA</h1>
          <p className="text-muted-foreground">
            Betriebswirtschaftliche Auswertung nach DATEV-Schema
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Optionen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Anzeigeoptionen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Label>Vorjahr anzeigen</Label>
                  <Switch
                    checked={settings.showPreviousYear}
                    onCheckedChange={(c) => updateSettings({ showPreviousYear: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Plan/Budget anzeigen</Label>
                  <Switch
                    checked={settings.showBudget}
                    onCheckedChange={(c) => updateSettings({ showBudget: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Prozentuale Anteile</Label>
                  <Switch
                    checked={settings.showPercentages}
                    onCheckedChange={(c) => updateSettings({ showPercentages: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Kumuliert (YTD)</Label>
                  <Switch
                    checked={settings.showYTD}
                    onCheckedChange={(c) => updateSettings({ showYTD: c })}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex gap-4 items-center">
        <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {format(new Date(2024, m - 1, 1), 'MMMM', { locale: de })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="ml-4">
          Periode: {format(new Date(selectedYear, selectedMonth - 1, 1), 'MMMM yyyy', { locale: de })}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Umsatzerlöse</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.revenue)}</p>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rohertrag</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.grossProfit)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.grossProfitMargin.toFixed(1)}% vom Umsatz
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Betriebsergebnis</p>
                <p className={`text-2xl font-bold ${metrics.operatingResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.operatingResult)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.operatingMargin.toFixed(1)}% Marge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vorläufiges Ergebnis</p>
                <p className={`text-2xl font-bold ${metrics.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.netResult)}
                </p>
              </div>
              {metrics.netResult >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.netMargin.toFixed(1)}% Nettomarge
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="auswertung">
        <TabsList>
          <TabsTrigger value="auswertung">BWA-Auswertung</TabsTrigger>
          <TabsTrigger value="kennzahlen">Kennzahlen</TabsTrigger>
          {settings.showYTD && <TabsTrigger value="ytd">Kumuliert (YTD)</TabsTrigger>}
        </TabsList>

        {/* Main BWA Tab */}
        <TabsContent value="auswertung">
          <Card>
            <CardHeader>
              <CardTitle>Betriebswirtschaftliche Auswertung</CardTitle>
              <CardDescription>
                {format(new Date(selectedYear, selectedMonth - 1, 1), 'MMMM yyyy', { locale: de })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Zeile</TableHead>
                      <TableHead>Bezeichnung</TableHead>
                      <TableHead className="text-right">Ist</TableHead>
                      {settings.showPercentages && (
                        <TableHead className="text-right">% Umsatz</TableHead>
                      )}
                      {settings.showPreviousYear && report.previousYear && (
                        <>
                          <TableHead className="text-right">Vorjahr</TableHead>
                          <TableHead className="text-right">Abw. VJ</TableHead>
                        </>
                      )}
                      {settings.showBudget && report.budget && (
                        <>
                          <TableHead className="text-right">Plan</TableHead>
                          <TableHead className="text-right">Abw. Plan</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {BWA_STRUCTURE.map((row) => {
                      const value = report.data[row.number] || 0;
                      const prevValue = report.previousYear?.[row.number] || 0;
                      const budgetValue = report.budget?.[row.number] || 0;
                      const percent = percentages[row.number] || 0;

                      const isSubtotal = row.isSubtotal;
                      const isResult = row.type === 'result';

                      return (
                        <TableRow
                          key={row.id}
                          className={`${isSubtotal ? 'bg-muted/50 font-semibold' : ''} ${isResult && !isSubtotal ? 'font-medium' : ''}`}
                        >
                          <TableCell className="font-mono text-sm">{row.number}</TableCell>
                          <TableCell className={isSubtotal ? 'font-semibold' : ''}>
                            {row.label}
                          </TableCell>
                          <TableCell className={`text-right ${value < 0 ? 'text-red-600' : ''}`}>
                            {formatCurrency(value)}
                          </TableCell>
                          {settings.showPercentages && (
                            <TableCell className="text-right text-muted-foreground">
                              {percent.toFixed(1)}%
                            </TableCell>
                          )}
                          {settings.showPreviousYear && report.previousYear && (
                            <>
                              <TableCell className="text-right text-muted-foreground">
                                {formatCurrency(prevValue)}
                              </TableCell>
                              <TableCell className={`text-right ${value - prevValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(value - prevValue)}
                              </TableCell>
                            </>
                          )}
                          {settings.showBudget && report.budget && budgetComparison && (
                            <>
                              <TableCell className="text-right text-muted-foreground">
                                {formatCurrency(budgetValue)}
                              </TableCell>
                              <TableCell className={`text-right ${budgetComparison[row.number]?.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercent(budgetComparison[row.number]?.percent || 0)}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Metrics Tab */}
        <TabsContent value="kennzahlen">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ertragsstruktur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Umsatzerlöse</span>
                  <span className="font-medium">{formatCurrency(metrics.revenue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Rohertrag</span>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(metrics.grossProfit)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({metrics.grossProfitMargin.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Betriebsergebnis (EBIT)</span>
                  <div className="text-right">
                    <span className={`font-medium ${metrics.operatingResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(metrics.operatingResult)}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({metrics.operatingMargin.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Vorläufiges Ergebnis</span>
                  <div className="text-right">
                    <span className={`font-medium ${metrics.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(metrics.netResult)}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({metrics.netMargin.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kostenstruktur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Gesamtkosten</span>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(metrics.totalCosts)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({metrics.costRatio.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>davon Personalkosten</span>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(metrics.personnelCosts)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({metrics.personnelCostRatio.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Materialaufwand</span>
                  <span className="font-medium">{formatCurrency(report.data['5'] + report.data['6'])}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Abschreibungen</span>
                  <span className="font-medium">{formatCurrency(report.data['25'] || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* YTD Tab */}
        {settings.showYTD && ytdData && (
          <TabsContent value="ytd">
            <Card>
              <CardHeader>
                <CardTitle>Kumulierte Werte (Januar - {format(new Date(selectedYear, selectedMonth - 1, 1), 'MMMM', { locale: de })})</CardTitle>
                <CardDescription>Year-to-Date Auswertung</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Zeile</TableHead>
                      <TableHead>Bezeichnung</TableHead>
                      <TableHead className="text-right">Kumuliert</TableHead>
                      <TableHead className="text-right">Durchschnitt/Monat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {BWA_STRUCTURE.filter(r => r.isSubtotal || r.number === '1').map((row) => {
                      const ytdValue = ytdData[row.number] || 0;
                      const avgValue = ytdValue / selectedMonth;

                      return (
                        <TableRow key={row.id} className={row.isSubtotal ? 'bg-muted/50 font-semibold' : ''}>
                          <TableCell className="font-mono text-sm">{row.number}</TableCell>
                          <TableCell>{row.label}</TableCell>
                          <TableCell className={`text-right ${ytdValue < 0 ? 'text-red-600' : ''}`}>
                            {formatCurrency(ytdValue)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(avgValue)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default BWA;
