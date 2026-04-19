import { useState } from 'react';
import {
  useTrialBalance,
  AccountClass,
  ACCOUNT_CLASS_LABELS,
} from '@/hooks/useTrialBalance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const TrialBalance = () => {
  const { toast } = useToast();
  const {
    isLoading,
    generateReport,
    getReport,
    getRowsByClass,
    getClassSubtotal,
    searchAccounts,
    getActiveAccounts,
    getNonZeroAccounts,
    exportTrialBalance,
  } = useTrialBalance();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [showOnlyNonZero, setShowOnlyNonZero] = useState(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const report = getReport(selectedYear, selectedMonth) || generateReport(selectedYear, selectedMonth);

  let displayRows = report.rows;

  // Apply filters
  if (showOnlyActive) {
    displayRows = getActiveAccounts(displayRows);
  }
  if (showOnlyNonZero) {
    displayRows = getNonZeroAccounts(displayRows);
  }
  if (searchQuery) {
    displayRows = searchAccounts(displayRows, searchQuery);
  }

  const handleRefresh = () => {
    generateReport(selectedYear, selectedMonth);
    toast({
      title: 'Aktualisiert',
      description: 'Die Summen- und Saldenliste wurde neu berechnet.',
    });
  };

  const handleExport = () => {
    exportTrialBalance(selectedYear, selectedMonth);
    toast({
      title: 'Export erstellt',
      description: 'Die Liste wurde als CSV exportiert.',
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '-';
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
          <h1 className="text-3xl font-bold">Summen- und Saldenliste</h1>
          <p className="text-muted-foreground">
            Kontenübersicht mit Anfangs-, Bewegungs- und Endsalden
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Period Selection and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
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

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Konto suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2">
            <Checkbox
              id="showActive"
              checked={showOnlyActive}
              onCheckedChange={(c) => setShowOnlyActive(c as boolean)}
            />
            <Label htmlFor="showActive" className="text-sm">Nur bebuchte Konten</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="showNonZero"
              checked={showOnlyNonZero}
              onCheckedChange={(c) => setShowOnlyNonZero(c as boolean)}
            />
            <Label htmlFor="showNonZero" className="text-sm">Nur mit Saldo</Label>
          </div>
        </div>
      </div>

      {/* Balance Check */}
      <Card className={report.summary.isBalanced ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {report.summary.isBalanced ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    Die Bilanz ist ausgeglichen
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-700 dark:text-red-400">
                    Differenz: {formatCurrency(report.summary.difference)} €
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Soll gesamt:</span>
                <span className="font-medium ml-2">{formatCurrency(report.summary.totalClosingDebit)} €</span>
              </div>
              <div>
                <span className="text-muted-foreground">Haben gesamt:</span>
                <span className="font-medium ml-2">{formatCurrency(report.summary.totalClosingCredit)} €</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts by Class */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Kontenübersicht
          </CardTitle>
          <CardDescription>
            Zeitraum: {format(new Date(selectedYear, selectedMonth - 1, 1), 'MMMM yyyy', { locale: de })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['0', '1', '4', '8']}>
            {(Object.keys(ACCOUNT_CLASS_LABELS) as AccountClass[]).map((accountClass) => {
              const classRows = displayRows.filter(r => r.accountClass === accountClass);
              if (classRows.length === 0) return null;

              const subtotal = getClassSubtotal(report.rows, accountClass);

              return (
                <AccordionItem key={accountClass} value={accountClass}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Klasse {accountClass}</Badge>
                        <span className="font-medium">{ACCOUNT_CLASS_LABELS[accountClass]}</span>
                        <span className="text-muted-foreground">({classRows.length} Konten)</span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span>Soll: {formatCurrency(subtotal.totalClosingDebit)} €</span>
                        <span>Haben: {formatCurrency(subtotal.totalClosingCredit)} €</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">Konto</TableHead>
                          <TableHead>Bezeichnung</TableHead>
                          <TableHead className="text-right">Anfang Soll</TableHead>
                          <TableHead className="text-right">Anfang Haben</TableHead>
                          <TableHead className="text-right">Umsatz Soll</TableHead>
                          <TableHead className="text-right">Umsatz Haben</TableHead>
                          <TableHead className="text-right">Ende Soll</TableHead>
                          <TableHead className="text-right">Ende Haben</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classRows.map((row) => (
                          <TableRow key={row.accountNumber}>
                            <TableCell className="font-mono">{row.accountNumber}</TableCell>
                            <TableCell>{row.accountName}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.openingDebit)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.openingCredit)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.periodDebit)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.periodCredit)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.closingDebit)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.closingCredit)}</TableCell>
                            <TableCell className={`text-right font-medium ${row.balance < 0 ? 'text-red-600' : ''}`}>
                              {formatCurrency(Math.abs(row.balance))} {row.balanceType === 'credit' ? 'H' : 'S'}
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Class Subtotal */}
                        <TableRow className="bg-muted/50 font-semibold">
                          <TableCell colSpan={2}>Summe Klasse {accountClass}</TableCell>
                          <TableCell className="text-right">{formatCurrency(subtotal.totalOpeningDebit)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(subtotal.totalOpeningCredit)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(subtotal.totalPeriodDebit)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(subtotal.totalPeriodCredit)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(subtotal.totalClosingDebit)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(subtotal.totalClosingCredit)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Grand Total */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <Table>
              <TableBody>
                <TableRow className="font-bold text-lg">
                  <TableCell className="w-24"></TableCell>
                  <TableCell>GESAMTSUMME</TableCell>
                  <TableCell className="text-right">{formatCurrency(report.summary.totalOpeningDebit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(report.summary.totalOpeningCredit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(report.summary.totalPeriodDebit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(report.summary.totalPeriodCredit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(report.summary.totalClosingDebit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(report.summary.totalClosingCredit)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialBalance;
