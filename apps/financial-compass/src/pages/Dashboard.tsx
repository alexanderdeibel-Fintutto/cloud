import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Building2, Settings, Grid3X3, RotateCcw, LayoutGrid } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart';
import { ExpenseByCategoryChart } from '@/components/dashboard/ExpenseByCategoryChart';
import { DueInvoicesList } from '@/components/dashboard/DueInvoicesList';
import { PendingReceiptsList } from '@/components/dashboard/PendingReceiptsList';
import { Widget } from '@/components/dashboard/DashboardWidgets';
import { useDashboardWidgets, WIDGET_DEFINITIONS, WidgetType } from '@/hooks/useDashboardWidgets';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  bankBalance: number;
  income: number;
  expenses: number;
  profit: number;
  previousIncome: number;
  previousExpenses: number;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category?: string;
}

interface MonthlyData {
  month: string;
  einnahmen: number;
  ausgaben: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface DueInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  contact_name?: string;
}

interface PendingReceipt {
  id: string;
  file_name: string;
  file_url?: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { currentCompany, companies, refetchCompanies } = useCompany();
  const { user } = useAuth();
  const {
    visibleWidgets,
    availableWidgets,
    editMode,
    setEditMode,
    addWidget,
    removeWidget,
    updateWidget,
    moveWidget,
    resetToDefault,
  } = useDashboardWidgets();
  const [stats, setStats] = useState<DashboardStats>({
    bankBalance: 0,
    income: 0,
    expenses: 0,
    profit: 0,
    previousIncome: 0,
    previousExpenses: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [dueInvoices, setDueInvoices] = useState<DueInvoice[]>([]);
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([]);
  const [sparklineData, setSparklineData] = useState<{
    balance: number[];
    income: number[];
    expenses: number[];
    profit: number[];
  }>({ balance: [], income: [], expenses: [], profit: [] });
  const [newCompanyName, setNewCompanyName] = useState('');
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useWidgets, setUseWidgets] = useState(false);
  const [widgetSheetOpen, setWidgetSheetOpen] = useState(false);

  useEffect(() => {
    if (currentCompany) {
      fetchDashboardData();
    }
  }, [currentCompany]);

  const fetchDashboardData = async () => {
    if (!currentCompany) return;
    setIsLoading(true);

    try {
      // Calculate date ranges
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(now.getDate() + 7);

      // Parallel data fetching
      const [
        bankAccountsResult,
        currentMonthTxResult,
        previousMonthTxResult,
        yearlyTxResult,
        recentTxResult,
        dueInvoicesResult,
        pendingReceiptsResult,
      ] = await Promise.all([
        // Bank accounts
        supabase
          .from('bank_accounts')
          .select('balance')
          .eq('company_id', currentCompany.id),
        
        // Current month transactions
        supabase
          .from('transactions')
          .select('*')
          .eq('company_id', currentCompany.id)
          .gte('date', startOfMonth.toISOString().split('T')[0]),
        
        // Previous month transactions
        supabase
          .from('transactions')
          .select('*')
          .eq('company_id', currentCompany.id)
          .gte('date', startOfPreviousMonth.toISOString().split('T')[0])
          .lte('date', endOfPreviousMonth.toISOString().split('T')[0]),
        
        // Yearly transactions (for charts)
        supabase
          .from('transactions')
          .select('*')
          .eq('company_id', currentCompany.id)
          .gte('date', startOfYear.toISOString().split('T')[0])
          .order('date', { ascending: true }),
        
        // Recent transactions
        supabase
          .from('transactions')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('date', { ascending: false })
          .limit(5),
        
        // Due invoices (next 7 days + overdue)
        supabase
          .from('invoices')
          .select('id, invoice_number, amount, due_date, contacts(name)')
          .eq('company_id', currentCompany.id)
          .eq('status', 'sent')
          .lte('due_date', sevenDaysFromNow.toISOString().split('T')[0])
          .order('due_date', { ascending: true })
          .limit(5),
        
        // Pending receipts (without transaction_id)
        supabase
          .from('receipts')
          .select('id, file_name, file_url, created_at')
          .eq('company_id', currentCompany.id)
          .is('transaction_id', null)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      // Process bank balance
      const bankBalance = bankAccountsResult.data?.reduce(
        (sum, acc) => sum + Number(acc.balance), 0
      ) || 0;

      // Process current month stats
      const currentMonthTx = currentMonthTxResult.data || [];
      const income = currentMonthTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = currentMonthTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Process previous month stats
      const previousMonthTx = previousMonthTxResult.data || [];
      const previousIncome = previousMonthTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const previousExpenses = previousMonthTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setStats({
        bankBalance,
        income,
        expenses,
        profit: income - expenses,
        previousIncome,
        previousExpenses,
      });

      // Process yearly transactions for monthly chart
      const yearlyTx = yearlyTxResult.data || [];
      const monthlyMap = new Map<string, { einnahmen: number; ausgaben: number }>();
      
      // Initialize all months
      const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
      for (let i = 0; i < 12; i++) {
        const monthKey = monthNames[i];
        monthlyMap.set(monthKey, { einnahmen: 0, ausgaben: 0 });
      }

      // Fill with actual data
      yearlyTx.forEach((tx) => {
        const date = new Date(tx.date);
        const monthKey = monthNames[date.getMonth()];
        const current = monthlyMap.get(monthKey)!;
        if (tx.type === 'income') {
          current.einnahmen += Number(tx.amount);
        } else {
          current.ausgaben += Number(tx.amount);
        }
      });

      const monthlyChartData: MonthlyData[] = monthNames.map((month) => ({
        month,
        ...monthlyMap.get(month)!,
      }));
      setMonthlyData(monthlyChartData);

      // Generate sparkline data (last 6 months)
      const last6Months = monthlyChartData.slice(Math.max(0, now.getMonth() - 5), now.getMonth() + 1);
      setSparklineData({
        balance: last6Months.map((m) => m.einnahmen - m.ausgaben),
        income: last6Months.map((m) => m.einnahmen),
        expenses: last6Months.map((m) => m.ausgaben),
        profit: last6Months.map((m) => m.einnahmen - m.ausgaben),
      });

      // Process expense categories
      const categoryMap = new Map<string, number>();
      yearlyTx
        .filter((tx) => tx.type === 'expense')
        .forEach((tx) => {
          const category = tx.category || 'Sonstiges';
          categoryMap.set(category, (categoryMap.get(category) || 0) + Number(tx.amount));
        });

      const categoryChartData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value, color: '' }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
      setCategoryData(categoryChartData);

      // Process recent transactions
      if (recentTxResult.data) {
        setTransactions(
          recentTxResult.data.map((t) => ({
            id: t.id,
            description: t.description || 'Ohne Beschreibung',
            amount: Number(t.amount),
            type: t.type as 'income' | 'expense',
            date: t.date,
            category: t.category || undefined,
          }))
        );
      }

      // Process due invoices
      if (dueInvoicesResult.data) {
        setDueInvoices(
          dueInvoicesResult.data.map((inv) => ({
            id: inv.id,
            invoice_number: inv.invoice_number,
            amount: Number(inv.amount),
            due_date: inv.due_date || '',
            contact_name: (inv.contacts as { name: string } | null)?.name,
          }))
        );
      }

      // Process pending receipts
      if (pendingReceiptsResult.data) {
        setPendingReceipts(
          pendingReceiptsResult.data.map((r) => ({
            id: r.id,
            file_name: r.file_name,
            file_url: r.file_url,
            created_at: r.created_at || '',
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCompany = async () => {
    if (!newCompanyName.trim() || !user) return;

    setCreatingCompany(true);
    try {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: newCompanyName.trim() })
        .select()
        .single();

      if (companyError) throw companyError;

      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      await refetchCompanies();
      setNewCompanyName('');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setCreatingCompany(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const calculateChange = (current: number, previous: number): { value: string; type: 'positive' | 'negative' | 'neutral' } => {
    if (previous === 0) return { value: '', type: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    const prefix = change >= 0 ? '+' : '';
    return {
      value: `${prefix}${change.toFixed(0)}%`,
      type: change >= 0 ? 'positive' : 'negative',
    };
  };

  // Show onboarding if no companies
  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="p-6 rounded-full bg-primary/10 mb-6">
          <Building2 className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Willkommen bei Fintutto!</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Erstellen Sie Ihre erste Firma, um mit der Buchhaltung zu beginnen.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Firma erstellen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Firma erstellen</DialogTitle>
              <DialogDescription>
                Geben Sie den Namen Ihrer Firma ein, um zu beginnen.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Firmenname</Label>
                <Input
                  id="companyName"
                  placeholder="z.B. Musterfirma GmbH"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                />
              </div>
              <Button
                onClick={createCompany}
                disabled={!newCompanyName.trim() || creatingCompany}
                className="w-full"
              >
                {creatingCompany ? 'Wird erstellt...' : 'Firma erstellen'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const incomeChange = calculateChange(stats.income, stats.previousIncome);
  const expensesChange = calculateChange(stats.expenses, stats.previousExpenses);
  const profitChange = calculateChange(stats.profit, stats.previousIncome - stats.previousExpenses);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Übersicht für {currentCompany?.name || 'Ihre Firma'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="widget-mode"
              checked={useWidgets}
              onCheckedChange={setUseWidgets}
            />
            <Label htmlFor="widget-mode" className="text-sm cursor-pointer">
              <LayoutGrid className="h-4 w-4 inline mr-1" />
              Widgets
            </Label>
          </div>
          {useWidgets && (
            <>
              <Button
                variant={editMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <Settings className="h-4 w-4 mr-1" />
                {editMode ? 'Fertig' : 'Anpassen'}
              </Button>
              {editMode && (
                <>
                  <Sheet open={widgetSheetOpen} onOpenChange={setWidgetSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Widget
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Widget hinzufügen</SheetTitle>
                      </SheetHeader>
                      <div className="space-y-4 mt-4">
                        {availableWidgets.length === 0 ? (
                          <p className="text-muted-foreground text-sm">
                            Alle Widgets wurden bereits hinzugefügt.
                          </p>
                        ) : (
                          availableWidgets.map((type) => {
                            const def = WIDGET_DEFINITIONS[type];
                            return (
                              <button
                                key={type}
                                className="w-full p-4 border rounded-lg text-left hover:bg-muted/50 transition-colors"
                                onClick={() => {
                                  addWidget(type);
                                  setWidgetSheetOpen(false);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{def.title}</p>
                                    <p className="text-sm text-muted-foreground">{def.description}</p>
                                  </div>
                                  <Badge variant="outline" className="capitalize">
                                    {def.category}
                                  </Badge>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                      {availableWidgets.length > 0 && (
                        <div className="mt-6 pt-4 border-t">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              resetToDefault();
                              setWidgetSheetOpen(false);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Standard wiederherstellen
                          </Button>
                        </div>
                      )}
                    </SheetContent>
                  </Sheet>
                  <Button variant="ghost" size="sm" onClick={resetToDefault}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {useWidgets ? (
        /* Customizable Widget View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleWidgets.map((widget) => (
            <Widget
              key={widget.id}
              widget={widget}
              editMode={editMode}
              onRemove={() => removeWidget(widget.id)}
              onMove={(dir) => moveWidget(widget.id, dir)}
              onUpdate={(updates) => updateWidget(widget.id, updates)}
            />
          ))}
          {visibleWidgets.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Widgets konfiguriert.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setWidgetSheetOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Widget hinzufügen
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Classic Dashboard View */
        <>
          {/* KPI Cards - 2 columns on mobile, 4 on large screens */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-4">
            <KPICard
              title="Bankguthaben"
              value={formatCurrency(stats.bankBalance)}
              icon={Wallet}
              sparklineData={sparklineData.balance}
            />
            <KPICard
              title="Einnahmen"
              value={formatCurrency(stats.income)}
              change={incomeChange.value}
              changeType={incomeChange.type}
              icon={TrendingUp}
              sparklineData={sparklineData.income}
            />
            <KPICard
              title="Ausgaben"
              value={formatCurrency(stats.expenses)}
              change={expensesChange.value}
              changeType={stats.expenses <= stats.previousExpenses ? 'positive' : 'negative'}
              icon={TrendingDown}
              sparklineData={sparklineData.expenses}
            />
            <KPICard
              title="Gewinn"
              value={formatCurrency(stats.profit)}
              change={profitChange.value}
              changeType={stats.profit >= 0 ? profitChange.type : 'negative'}
              icon={PiggyBank}
              sparklineData={sparklineData.profit}
            />
          </div>

          {/* Charts Row - stack on mobile */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <RevenueExpenseChart data={monthlyData} />
            <ExpenseByCategoryChart data={categoryData} />
          </div>

          {/* Lists Row - stack on mobile */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <RecentTransactions transactions={transactions} />
            <DueInvoicesList invoices={dueInvoices} />
            <PendingReceiptsList receipts={pendingReceipts} />
          </div>

          {/* Quick Actions - hidden on mobile as we have FAB */}
          <div className="hidden sm:block">
            <QuickActions />
          </div>
        </>
      )}
    </div>
  );
}
