import { useState } from 'react';
import { useProfitLoss, PNL_STRUCTURE, ProfitLossData } from '@/hooks/useProfitLoss';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Download, Printer, Euro, BarChart3, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';

const ProfitLoss = () => {
  const { toast } = useToast();
  const { isLoading, generateProfitLoss, exportToCSV, calculateRatios } = useProfitLoss();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [profitLoss, setProfitLoss] = useState<ProfitLossData | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handleGenerate = () => {
    const periodStart = month
      ? `${year}-${String(month).padStart(2, '0')}-01`
      : `${year}-01-01`;
    const periodEnd = month
      ? `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`
      : `${year}-12-31`;

    const pnl = generateProfitLoss(periodStart, periodEnd);
    setProfitLoss(pnl);
    toast({ title: 'GuV erstellt', description: `Gewinn- und Verlustrechnung für ${month ? `${month}/${year}` : year}` });
  };

  const handleExportCSV = () => {
    if (!profitLoss) return;
    const csv = exportToCSV(profitLoss);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `guv_${year}${month ? `_${month}` : ''}.csv`;
    link.click();
    toast({ title: 'Export erstellt', description: 'Die GuV wurde als CSV exportiert.' });
  };

  const handlePrint = () => window.print();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const ratios = profitLoss ? calculateRatios(profitLoss) : null;

  const months = [
    { value: 1, label: 'Januar' }, { value: 2, label: 'Februar' }, { value: 3, label: 'März' },
    { value: 4, label: 'April' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Dezember' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gewinn- und Verlustrechnung</h1>
          <p className="text-muted-foreground">Gesamtkostenverfahren nach HGB § 275 Abs. 2</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Drucken</Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={!profitLoss}><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jahr</label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Monat (optional)</label>
              <Select value={month ? String(month) : 'all'} onValueChange={(v) => setMonth(v === 'all' ? undefined : Number(v))}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Gesamtjahr</SelectItem>
                  {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate}>GuV erstellen</Button>
          </div>
        </CardContent>
      </Card>

      {profitLoss && ratios && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Umsatzerlöse</p><p className="text-2xl font-bold">{formatCurrency(profitLoss.revenue)}</p></div>
                <Euro className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Rohertrag</p><p className="text-2xl font-bold">{formatCurrency(profitLoss.grossProfit)}</p><p className="text-xs text-muted-foreground">{ratios.grossMargin.toFixed(1)}% Marge</p></div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Betriebsergebnis</p><p className={`text-2xl font-bold ${profitLoss.operatingResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profitLoss.operatingResult)}</p></div>
                {profitLoss.operatingResult >= 0 ? <TrendingUp className="h-8 w-8 text-green-500" /> : <TrendingDown className="h-8 w-8 text-red-500" />}
              </div>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Jahresüberschuss</p><p className={`text-2xl font-bold ${profitLoss.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profitLoss.netIncome)}</p><p className="text-xs text-muted-foreground">{ratios.netMargin.toFixed(1)}% Nettomarge</p></div>
                <PiggyBank className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent></Card>
          </div>

          {/* Margin Visualization */}
          <Card>
            <CardHeader><CardTitle>Margenentwicklung</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm">Bruttomarge</span><span className="text-sm font-medium">{ratios.grossMargin.toFixed(1)}%</span></div>
                  <Progress value={Math.min(100, Math.max(0, ratios.grossMargin))} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm">Nettomarge</span><span className="text-sm font-medium">{ratios.netMargin.toFixed(1)}%</span></div>
                  <Progress value={Math.min(100, Math.max(0, ratios.netMargin))} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GuV Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Gewinn- und Verlustrechnung</CardTitle>
              <CardDescription>{month ? `${months.find(m => m.value === month)?.label} ${year}` : `Geschäftsjahr ${year}`}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Nr.</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Aktuell</TableHead>
                    <TableHead className="text-right">Vorjahr</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitLoss.rows.map((row) => (
                    <TableRow key={row.position.id} className={row.position.isSubtotal ? 'bg-muted/50 font-bold' : ''}>
                      <TableCell className="text-muted-foreground">{row.position.number}</TableCell>
                      <TableCell className={row.position.isSubtotal ? 'font-bold' : ''}>{row.position.label}</TableCell>
                      <TableCell className={`text-right ${row.currentPeriod < 0 ? 'text-red-600' : ''}`}>{formatCurrency(row.currentPeriod)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(row.previousPeriod)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(row.budget)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {!profitLoss && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Wählen Sie einen Zeitraum und erstellen Sie die GuV.</p>
        </CardContent></Card>
      )}
    </div>
  );
};

export default ProfitLoss;
