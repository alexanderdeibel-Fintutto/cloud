import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Receipt, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  description: string | null;
  amount: number;
  type: string;
  date: string;
  category: string | null;
}

type FilterType = 'all' | 'income' | 'expense';

const categories = [
  'Einnahmen',
  'Gehälter',
  'Miete',
  'Büromaterial',
  'Marketing',
  'Reisekosten',
  'Versicherungen',
  'Telekommunikation',
  'Sonstiges',
];

export default function Transactions() {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (currentCompany) {
      fetchTransactions();
    }
  }, [currentCompany]);

  const fetchTransactions = async () => {
    if (!currentCompany) return;

    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('company_id', currentCompany.id)
      .order('date', { ascending: false });

    if (data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return {
      total: transactions.length,
      income: totalIncome,
      expense: totalExpense,
      balance,
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const handleCreateTransaction = async () => {
    if (!currentCompany) return;

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie einen gültigen Betrag ein.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('transactions').insert({
      company_id: currentCompany.id,
      type: newTransaction.type,
      amount: amount,
      description: newTransaction.description || null,
      category: newTransaction.category || null,
      date: newTransaction.date,
    });

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Buchung konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erfolg',
        description: 'Buchung wurde erstellt.',
      });
      setDialogOpen(false);
      setNewTransaction({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchTransactions();
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || t.type === filter;
    return matchesSearch && matchesFilter;
  });

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Bitte wählen Sie eine Firma aus.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Buchungen</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Verwalten Sie Ihre Transaktionen</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neue Buchung
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Neue Buchung erstellen</DialogTitle>
              <DialogDescription>
                Fügen Sie eine neue Einnahme oder Ausgabe hinzu.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Income/Expense Toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newTransaction.type === 'income' ? 'default' : 'outline'}
                  className={`flex-1 gap-2 ${newTransaction.type === 'income' ? 'bg-success hover:bg-success/90' : ''}`}
                  onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  Einnahme
                </Button>
                <Button
                  type="button"
                  variant={newTransaction.type === 'expense' ? 'default' : 'outline'}
                  className={`flex-1 gap-2 ${newTransaction.type === 'expense' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                  onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Ausgabe
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Betrag (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  placeholder="Beschreibung der Buchung..."
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateTransaction}>Buchung erstellen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="glass">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Buchungen</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 shrink-0 ml-2">
                <Receipt className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Einnahmen</p>
                <p className="text-lg sm:text-2xl font-bold text-success truncate">{formatCurrency(stats.income)}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-success/10 shrink-0 ml-2">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Ausgaben</p>
                <p className="text-lg sm:text-2xl font-bold text-destructive truncate">{formatCurrency(stats.expense)}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-destructive/10 shrink-0 ml-2">
                <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Saldo</p>
                <p className={`text-lg sm:text-2xl font-bold truncate ${stats.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(stats.balance)}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-xl shrink-0 ml-2 ${stats.balance >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <Wallet className={`h-4 w-4 sm:h-6 sm:w-6 ${stats.balance >= 0 ? 'text-success' : 'text-destructive'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
            className="shrink-0"
          >
            Alle
          </Button>
          <Button
            variant={filter === 'income' ? 'default' : 'outline'}
            onClick={() => setFilter('income')}
            size="sm"
            className={`shrink-0 ${filter === 'income' ? 'bg-success hover:bg-success/90' : ''}`}
          >
            <ArrowDownLeft className="mr-1 h-4 w-4" />
            <span className="hidden xs:inline">Einnahmen</span>
            <span className="xs:hidden">Ein.</span>
          </Button>
          <Button
            variant={filter === 'expense' ? 'default' : 'outline'}
            onClick={() => setFilter('expense')}
            size="sm"
            className={`shrink-0 ${filter === 'expense' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
          >
            <ArrowUpRight className="mr-1 h-4 w-4" />
            <span className="hidden xs:inline">Ausgaben</span>
            <span className="xs:hidden">Aus.</span>
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Laden...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Keine Buchungen gefunden
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-secondary/30 transition-colors cursor-pointer active:bg-secondary/40"
              >
                <div
                  className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${
                    transaction.type === 'income'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {transaction.type === 'income' ? (
                    <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium truncate">
                    {transaction.description || 'Ohne Beschreibung'}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {transaction.category || 'Sonstiges'} • {formatDate(transaction.date)}
                  </p>
                </div>
                <span
                  className={`text-sm sm:text-base font-semibold shrink-0 ${
                    transaction.type === 'income' ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
