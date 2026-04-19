import { useState } from 'react';
import {
  useCashBook,
  CashTransaction,
  CashTransactionType,
  CASH_CATEGORIES,
} from '@/hooks/useCashBook';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  Plus,
  Minus,
  Search,
  Download,
  Settings,
  Euro,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Calendar,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';

const CashBook = () => {
  const { toast } = useToast();
  const {
    transactions,
    settings,
    isLoading,
    updateSettings,
    getCurrentBalance,
    getNextReceiptNumber,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsForPeriod,
    getDaySummary,
    getMonthlySummary,
    isBalanceWarning,
    exportCashBook,
    generateGoBDReport,
  } = useCashBook();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<CashTransactionType>('expense');

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    description: '',
    category: '',
    receiptNumber: '',
    counterAccount: '',
    taxRate: 19,
    notes: '',
  });

  const currentBalance = getCurrentBalance();
  const balanceWarning = isBalanceWarning();
  const monthlySummary = getMonthlySummary(selectedYear, selectedMonth);

  const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${new Date(selectedYear, selectedMonth, 0).getDate()}`;
  const monthTransactions = getTransactionsForPeriod(startDate, endDate);

  const filteredTransactions = monthTransactions.filter(t =>
    searchQuery === '' ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTransaction = () => {
    if (!formData.description || formData.amount <= 0 || !formData.category) {
      toast({
        title: 'Fehler',
        description: 'Bitte alle Pflichtfelder ausfüllen.',
        variant: 'destructive',
      });
      return;
    }

    const taxAmount = formData.taxRate > 0 ? formData.amount - (formData.amount / (1 + formData.taxRate / 100)) : 0;
    const netAmount = formData.amount - taxAmount;

    const result = addTransaction({
      date: formData.date,
      type: transactionType,
      amount: formData.amount,
      description: formData.description,
      category: formData.category,
      receiptNumber: formData.receiptNumber || getNextReceiptNumber(),
      counterAccount: formData.counterAccount || (transactionType === 'income' ? settings.defaultIncomeAccount : settings.defaultExpenseAccount),
      taxRate: formData.taxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      notes: formData.notes,
    });

    if ('error' in result) {
      toast({
        title: 'Fehler',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: transactionType === 'income' ? 'Einnahme erfasst' : 'Ausgabe erfasst',
      description: `${formatCurrency(formData.amount)} wurde erfasst.`,
    });

    setNewTransactionOpen(false);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: 0,
      description: '',
      category: '',
      receiptNumber: '',
      counterAccount: '',
      taxRate: 19,
      notes: '',
    });
  };

  const handleExport = () => {
    exportCashBook(startDate, endDate);
    toast({
      title: 'Export erstellt',
      description: 'Das Kassenbuch wurde als CSV exportiert.',
    });
  };

  const handleGoBDReport = () => {
    const report = generateGoBDReport(selectedYear, selectedMonth);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kassenbuch_gobd_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'GoBD-Bericht erstellt',
      description: 'Der GoBD-konforme Bericht wurde erstellt.',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

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
          <h1 className="text-3xl font-bold">Kassenbuch</h1>
          <p className="text-muted-foreground">
            Bargeldtransaktionen GoBD-konform erfassen
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Einstellungen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kassenbuch-Einstellungen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Anfangsbestand</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.openingBalance}
                      onChange={(e) => updateSettings({ openingBalance: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max. Kassenbestand (Warnung)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.maxCashBalance}
                      onChange={(e) => updateSettings({ maxCashBalance: parseFloat(e.target.value) || 5000 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard-Einnahmekonto</Label>
                    <Input
                      value={settings.defaultIncomeAccount}
                      onChange={(e) => updateSettings({ defaultIncomeAccount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Standard-Ausgabekonto</Label>
                    <Input
                      value={settings.defaultExpenseAccount}
                      onChange={(e) => updateSettings({ defaultExpenseAccount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Belege erforderlich</Label>
                    <p className="text-xs text-muted-foreground">Warnung bei fehlenden Belegen</p>
                  </div>
                  <Switch
                    checked={settings.requireReceipts}
                    onCheckedChange={(c) => updateSettings({ requireReceipts: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Negativen Bestand erlauben</Label>
                    <p className="text-xs text-muted-foreground">Kasse kann ins Minus gehen</p>
                  </div>
                  <Switch
                    checked={settings.allowNegativeBalance}
                    onCheckedChange={(c) => updateSettings({ allowNegativeBalance: c })}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleGoBDReport}>
            <FileText className="h-4 w-4 mr-2" />
            GoBD-Bericht
          </Button>
        </div>
      </div>

      {/* Balance Warning */}
      {balanceWarning && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                Kassenbestand ({formatCurrency(currentBalance)}) übersteigt das Maximum ({formatCurrency(settings.maxCashBalance)})
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktueller Bestand</p>
                <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(currentBalance)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Einnahmen (Monat)</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlySummary.totalIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ausgaben (Monat)</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlySummary.totalExpense)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Veränderung</p>
                <p className={`text-2xl font-bold ${monthlySummary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlySummary.netChange >= 0 ? '+' : ''}{formatCurrency(monthlySummary.netChange)}
                </p>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {monthlySummary.transactionCount} Buchungen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period Selection and Actions */}
      <div className="flex gap-4 items-center justify-between">
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
        </div>
        <div className="flex gap-2">
          <Dialog open={newTransactionOpen && transactionType === 'income'} onOpenChange={(open) => {
            setNewTransactionOpen(open);
            if (open) setTransactionType('income');
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                <Plus className="h-4 w-4 mr-2" />
                Einnahme
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={newTransactionOpen && transactionType === 'expense'} onOpenChange={(open) => {
            setNewTransactionOpen(open);
            if (open) setTransactionType('expense');
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                <Minus className="h-4 w-4 mr-2" />
                Ausgabe
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Transaction Dialog */}
      <Dialog open={newTransactionOpen} onOpenChange={setNewTransactionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={transactionType === 'income' ? 'text-green-600' : 'text-red-600'}>
              {transactionType === 'income' ? 'Einnahme erfassen' : 'Ausgabe erfassen'}
            </DialogTitle>
            <DialogDescription>
              Neue Kassenbuchung anlegen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Betrag (brutto) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Beschreibung *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="z.B. Büromaterial bei Staples"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CASH_CATEGORIES[transactionType].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Beleg-Nr.</Label>
                <Input
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                  placeholder={getNextReceiptNumber()}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gegenkonto</Label>
                <Input
                  value={formData.counterAccount}
                  onChange={(e) => setFormData({ ...formData, counterAccount: e.target.value })}
                  placeholder={transactionType === 'income' ? settings.defaultIncomeAccount : settings.defaultExpenseAccount}
                />
              </div>
              <div className="space-y-2">
                <Label>MwSt.-Satz</Label>
                <Select
                  value={formData.taxRate.toString()}
                  onValueChange={(v) => setFormData({ ...formData, taxRate: parseFloat(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0% (steuerfrei)</SelectItem>
                    <SelectItem value="7">7%</SelectItem>
                    <SelectItem value="19">19%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notizen</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optionale Notizen..."
              />
            </div>
            {formData.amount > 0 && formData.taxRate > 0 && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex justify-between">
                  <span>Brutto:</span>
                  <span>{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Netto:</span>
                  <span>{formatCurrency(formData.amount / (1 + formData.taxRate / 100))}</span>
                </div>
                <div className="flex justify-between">
                  <span>MwSt. ({formData.taxRate}%):</span>
                  <span>{formatCurrency(formData.amount - formData.amount / (1 + formData.taxRate / 100))}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTransactionOpen(false)}>Abbrechen</Button>
            <Button
              onClick={handleAddTransaction}
              className={transactionType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {transactionType === 'income' ? 'Einnahme erfassen' : 'Ausgabe erfassen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="buchungen">
        <TabsList>
          <TabsTrigger value="buchungen">Buchungen</TabsTrigger>
          <TabsTrigger value="kategorien">Nach Kategorien</TabsTrigger>
          <TabsTrigger value="monatsbericht">Monatsbericht</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="buchungen" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buchungen suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Beleg-Nr.</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Gegenkonto</TableHead>
                    <TableHead className="text-right">Einnahme</TableHead>
                    <TableHead className="text-right">Ausgabe</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Opening Balance Row */}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={5} className="font-medium">Anfangsbestand</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(monthlySummary.openingBalance)}</TableCell>
                  </TableRow>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Keine Buchungen in diesem Zeitraum
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{format(new Date(tx.date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                        <TableCell className="font-mono text-sm">{tx.receiptNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p>{tx.description}</p>
                            {tx.taxRate > 0 && (
                              <p className="text-xs text-muted-foreground">
                                inkl. {formatCurrency(tx.taxAmount)} MwSt. ({tx.taxRate}%)
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.category}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{tx.counterAccount}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {tx.type === 'income' ? formatCurrency(tx.amount) : ''}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {tx.type === 'expense' ? formatCurrency(tx.amount) : ''}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(tx.runningBalance)}</TableCell>
                      </TableRow>
                    ))
                  )}
                  {/* Closing Balance Row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={5}>Endbestand</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(monthlySummary.totalIncome)}</TableCell>
                    <TableCell className="text-right text-red-600">{formatCurrency(monthlySummary.totalExpense)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(monthlySummary.closingBalance)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="kategorien" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Einnahmen nach Kategorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(monthlySummary.incomeByCategory).length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Keine Einnahmen</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(monthlySummary.incomeByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span>{category}</span>
                          <span className="font-medium text-green-600">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    <div className="pt-2 border-t flex items-center justify-between font-bold">
                      <span>Gesamt</span>
                      <span className="text-green-600">{formatCurrency(monthlySummary.totalIncome)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  Ausgaben nach Kategorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(monthlySummary.expenseByCategory).length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Keine Ausgaben</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(monthlySummary.expenseByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span>{category}</span>
                          <span className="font-medium text-red-600">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    <div className="pt-2 border-t flex items-center justify-between font-bold">
                      <span>Gesamt</span>
                      <span className="text-red-600">{formatCurrency(monthlySummary.totalExpense)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monthly Report Tab */}
        <TabsContent value="monatsbericht">
          <Card>
            <CardHeader>
              <CardTitle>Monatsbericht {format(new Date(selectedYear, selectedMonth - 1, 1), 'MMMM yyyy', { locale: de })}</CardTitle>
              <CardDescription>Zusammenfassung des Kassenbuchs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Bestandsübersicht</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Anfangsbestand:</span>
                      <span className="font-medium">{formatCurrency(monthlySummary.openingBalance)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>+ Einnahmen:</span>
                      <span className="font-medium">{formatCurrency(monthlySummary.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Ausgaben:</span>
                      <span className="font-medium">{formatCurrency(monthlySummary.totalExpense)}</span>
                    </div>
                    <div className="pt-2 border-t flex justify-between font-bold">
                      <span>Endbestand:</span>
                      <span>{formatCurrency(monthlySummary.closingBalance)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Statistik</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Anzahl Buchungen:</span>
                      <span className="font-medium">{monthlySummary.transactionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nettoveränderung:</span>
                      <span className={`font-medium ${monthlySummary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthlySummary.netChange >= 0 ? '+' : ''}{formatCurrency(monthlySummary.netChange)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Einnahmen-Kategorien:</span>
                      <span className="font-medium">{Object.keys(monthlySummary.incomeByCategory).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ausgaben-Kategorien:</span>
                      <span className="font-medium">{Object.keys(monthlySummary.expenseByCategory).length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Als CSV exportieren
                </Button>
                <Button onClick={handleGoBDReport}>
                  <FileText className="h-4 w-4 mr-2" />
                  GoBD-Bericht erstellen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashBook;
