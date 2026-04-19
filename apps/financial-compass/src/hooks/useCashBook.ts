import { useState, useCallback, useEffect } from 'react';

export type CashTransactionType = 'income' | 'expense';

export interface CashTransaction {
  id: string;
  date: string;
  type: CashTransactionType;
  amount: number;
  description: string;
  category: string;
  receiptNumber?: string;
  receiptId?: string;
  counterAccount: string; // Gegenkonto
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  costCenterId?: string;
  runningBalance: number;
  createdBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashBookSettings {
  openingBalance: number;
  openingDate: string;
  maxCashBalance: number; // Warning threshold
  requireReceipts: boolean;
  allowNegativeBalance: boolean;
  defaultIncomeAccount: string;
  defaultExpenseAccount: string;
}

export interface CashBookDaySummary {
  date: string;
  openingBalance: number;
  closingBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
}

const STORAGE_KEY = 'fintutto_cash_book';

const DEFAULT_SETTINGS: CashBookSettings = {
  openingBalance: 500,
  openingDate: '2024-01-01',
  maxCashBalance: 5000,
  requireReceipts: true,
  allowNegativeBalance: false,
  defaultIncomeAccount: '1000',
  defaultExpenseAccount: '1000',
};

export const CASH_CATEGORIES = {
  income: [
    'Barverkauf',
    'Kundenanzahlung',
    'Bankabhebung',
    'Sonstige Einnahme',
  ],
  expense: [
    'Büromaterial',
    'Porto',
    'Bewirtung',
    'Tankkosten',
    'Kleinmaterial',
    'Trinkgeld',
    'Bankeinzahlung',
    'Sonstige Ausgabe',
  ],
};

const DEFAULT_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'cash-1',
    date: '2024-01-02',
    type: 'expense',
    amount: 25.50,
    description: 'Büromaterial bei Staples',
    category: 'Büromaterial',
    receiptNumber: 'K-2024-001',
    counterAccount: '4930',
    taxRate: 19,
    taxAmount: 4.07,
    netAmount: 21.43,
    runningBalance: 474.50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cash-2',
    date: '2024-01-03',
    type: 'income',
    amount: 150,
    description: 'Barverkauf - Produkt XY',
    category: 'Barverkauf',
    receiptNumber: 'K-2024-002',
    counterAccount: '8400',
    taxRate: 19,
    taxAmount: 23.95,
    netAmount: 126.05,
    runningBalance: 624.50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cash-3',
    date: '2024-01-05',
    type: 'expense',
    amount: 8.50,
    description: 'Briefmarken',
    category: 'Porto',
    receiptNumber: 'K-2024-003',
    counterAccount: '4910',
    taxRate: 0,
    taxAmount: 0,
    netAmount: 8.50,
    runningBalance: 616,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useCashBook() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [settings, setSettings] = useState<CashBookSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setTransactions(data.transactions || DEFAULT_TRANSACTIONS);
        setSettings(data.settings || DEFAULT_SETTINGS);
      } catch {
        setTransactions(DEFAULT_TRANSACTIONS);
      }
    } else {
      setTransactions(DEFAULT_TRANSACTIONS);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((
    newTransactions?: CashTransaction[],
    newSettings?: CashBookSettings
  ) => {
    const data = {
      transactions: newTransactions || transactions,
      settings: newSettings || settings,
    };
    if (newTransactions) setTransactions(newTransactions);
    if (newSettings) setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [transactions, settings]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<CashBookSettings>) => {
    saveData(undefined, { ...settings, ...updates });
  }, [settings, saveData]);

  // Calculate current balance
  const getCurrentBalance = useCallback((): number => {
    if (transactions.length === 0) return settings.openingBalance;

    // Get the most recent transaction's running balance
    const sortedTx = [...transactions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedTx[0].runningBalance;
  }, [transactions, settings.openingBalance]);

  // Recalculate running balances
  const recalculateBalances = useCallback((txList: CashTransaction[]): CashTransaction[] => {
    const sorted = [...txList].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime() ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let balance = settings.openingBalance;
    return sorted.map(tx => {
      if (tx.type === 'income') {
        balance += tx.amount;
      } else {
        balance -= tx.amount;
      }
      return { ...tx, runningBalance: balance };
    });
  }, [settings.openingBalance]);

  // Generate next receipt number
  const getNextReceiptNumber = useCallback((): string => {
    const year = new Date().getFullYear();
    const prefix = `K-${year}-`;
    const existingNumbers = transactions
      .filter(t => t.receiptNumber?.startsWith(prefix))
      .map(t => parseInt(t.receiptNumber?.replace(prefix, '') || '0'))
      .filter(n => !isNaN(n));

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
  }, [transactions]);

  // Add transaction
  const addTransaction = useCallback((tx: Omit<CashTransaction, 'id' | 'runningBalance' | 'createdAt' | 'updatedAt'>): CashTransaction | { error: string } => {
    const currentBalance = getCurrentBalance();
    let newBalance = currentBalance;

    if (tx.type === 'income') {
      newBalance += tx.amount;
    } else {
      newBalance -= tx.amount;
    }

    // Validate balance
    if (!settings.allowNegativeBalance && newBalance < 0) {
      return { error: 'Nicht genügend Bargeld in der Kasse. Transaktion würde negativen Kontostand erzeugen.' };
    }

    // Check max balance warning (not an error)
    if (newBalance > settings.maxCashBalance) {
      console.warn(`Warnung: Kassenbestand (${newBalance}€) übersteigt Maximum (${settings.maxCashBalance}€)`);
    }

    const newTx: CashTransaction = {
      ...tx,
      id: `cash-${Date.now()}`,
      runningBalance: newBalance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert in correct position and recalculate balances
    const allTx = [...transactions, newTx];
    const recalculated = recalculateBalances(allTx);

    saveData(recalculated);
    return recalculated.find(t => t.id === newTx.id) || newTx;
  }, [transactions, settings, getCurrentBalance, recalculateBalances, saveData]);

  // Update transaction
  const updateTransaction = useCallback((id: string, updates: Partial<CashTransaction>) => {
    const updatedList = transactions.map(tx =>
      tx.id === id ? { ...tx, ...updates, updatedAt: new Date().toISOString() } : tx
    );
    const recalculated = recalculateBalances(updatedList);
    saveData(recalculated);
  }, [transactions, recalculateBalances, saveData]);

  // Delete transaction
  const deleteTransaction = useCallback((id: string) => {
    const filtered = transactions.filter(tx => tx.id !== id);
    const recalculated = recalculateBalances(filtered);
    saveData(recalculated);
  }, [transactions, recalculateBalances, saveData]);

  // Get transactions for date range
  const getTransactionsForPeriod = useCallback((startDate: string, endDate: string): CashTransaction[] => {
    return transactions
      .filter(tx => tx.date >= startDate && tx.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
  }, [transactions]);

  // Get transactions for specific date
  const getTransactionsForDate = useCallback((date: string): CashTransaction[] => {
    return transactions
      .filter(tx => tx.date === date)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [transactions]);

  // Get day summary
  const getDaySummary = useCallback((date: string): CashBookDaySummary => {
    const dayTx = getTransactionsForDate(date);
    const allTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

    // Find opening balance (balance at end of previous day)
    const prevTx = allTx.filter(tx => tx.date < date);
    const openingBalance = prevTx.length > 0
      ? prevTx[prevTx.length - 1].runningBalance
      : settings.openingBalance;

    const totalIncome = dayTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = dayTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);

    return {
      date,
      openingBalance,
      closingBalance: openingBalance + totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      transactionCount: dayTx.length,
    };
  }, [transactions, settings.openingBalance, getTransactionsForDate]);

  // Get monthly summary
  const getMonthlySummary = useCallback((year: number, month: number) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    const monthTx = getTransactionsForPeriod(startDate, endDate);
    const prevTx = transactions.filter(tx => tx.date < startDate);

    const openingBalance = prevTx.length > 0
      ? [...prevTx].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))[0].runningBalance
      : settings.openingBalance;

    const totalIncome = monthTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = monthTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);

    // Group by category
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    monthTx.forEach(tx => {
      if (tx.type === 'income') {
        incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
      } else {
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
      }
    });

    return {
      year,
      month,
      openingBalance,
      closingBalance: openingBalance + totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      netChange: totalIncome - totalExpense,
      transactionCount: monthTx.length,
      incomeByCategory,
      expenseByCategory,
    };
  }, [transactions, settings.openingBalance, getTransactionsForPeriod]);

  // Check if balance exceeds threshold
  const isBalanceWarning = useCallback((): boolean => {
    return getCurrentBalance() > settings.maxCashBalance;
  }, [getCurrentBalance, settings.maxCashBalance]);

  // Search transactions
  const searchTransactions = useCallback((query: string): CashTransaction[] => {
    const q = query.toLowerCase();
    return transactions.filter(tx =>
      tx.description.toLowerCase().includes(q) ||
      tx.category.toLowerCase().includes(q) ||
      tx.receiptNumber?.toLowerCase().includes(q) ||
      tx.notes?.toLowerCase().includes(q)
    );
  }, [transactions]);

  // Export cash book for period
  const exportCashBook = useCallback((startDate: string, endDate: string) => {
    const periodTx = getTransactionsForPeriod(startDate, endDate);
    const headers = ['Datum', 'Beleg-Nr.', 'Beschreibung', 'Kategorie', 'Gegenkonto', 'Einnahme', 'Ausgabe', 'MwSt', 'Saldo'];

    const rows = periodTx.map(tx => [
      tx.date,
      tx.receiptNumber || '-',
      tx.description,
      tx.category,
      tx.counterAccount,
      tx.type === 'income' ? tx.amount.toFixed(2) : '',
      tx.type === 'expense' ? tx.amount.toFixed(2) : '',
      tx.taxAmount.toFixed(2),
      tx.runningBalance.toFixed(2),
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kassenbuch_${startDate}_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getTransactionsForPeriod]);

  // Generate GoBD-compliant report
  const generateGoBDReport = useCallback((year: number, month: number): string => {
    const summary = getMonthlySummary(year, month);
    const monthTx = getTransactionsForPeriod(
      `${year}-${String(month).padStart(2, '0')}-01`,
      `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`
    );

    let report = `KASSENBUCH - ${String(month).padStart(2, '0')}/${year}\n`;
    report += `======================================\n\n`;
    report += `Anfangsbestand: ${summary.openingBalance.toFixed(2)} €\n`;
    report += `Endbestand: ${summary.closingBalance.toFixed(2)} €\n\n`;
    report += `Einnahmen gesamt: ${summary.totalIncome.toFixed(2)} €\n`;
    report += `Ausgaben gesamt: ${summary.totalExpense.toFixed(2)} €\n`;
    report += `Veränderung: ${summary.netChange.toFixed(2)} €\n\n`;
    report += `Anzahl Buchungen: ${summary.transactionCount}\n\n`;
    report += `======================================\n`;
    report += `EINZELBUCHUNGEN\n`;
    report += `======================================\n\n`;

    monthTx.forEach(tx => {
      report += `${tx.date} | ${tx.receiptNumber || '-'}\n`;
      report += `${tx.description}\n`;
      report += `${tx.type === 'income' ? 'Einnahme' : 'Ausgabe'}: ${tx.amount.toFixed(2)} €`;
      if (tx.taxAmount > 0) {
        report += ` (inkl. ${tx.taxAmount.toFixed(2)} € MwSt.)`;
      }
      report += `\nSaldo: ${tx.runningBalance.toFixed(2)} €\n`;
      report += `---\n`;
    });

    report += `\nDieser Bericht wurde GoBD-konform erstellt.\n`;
    report += `Erstellt am: ${new Date().toLocaleString('de-DE')}\n`;

    return report;
  }, [getMonthlySummary, getTransactionsForPeriod]);

  return {
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
    getTransactionsForDate,
    getDaySummary,
    getMonthlySummary,
    isBalanceWarning,
    searchTransactions,
    exportCashBook,
    generateGoBDReport,
  };
}
