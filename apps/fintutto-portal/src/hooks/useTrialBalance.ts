import { useState, useCallback, useEffect } from 'react';

export type AccountClass = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export interface TrialBalanceRow {
  accountNumber: string;
  accountName: string;
  accountClass: AccountClass;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
  balance: number;
  balanceType: 'debit' | 'credit' | 'zero';
}

export interface TrialBalanceSummary {
  totalOpeningDebit: number;
  totalOpeningCredit: number;
  totalPeriodDebit: number;
  totalPeriodCredit: number;
  totalClosingDebit: number;
  totalClosingCredit: number;
  isBalanced: boolean;
  difference: number;
}

export interface TrialBalanceReport {
  id: string;
  year: number;
  month: number;
  fromDate: string;
  toDate: string;
  rows: TrialBalanceRow[];
  summary: TrialBalanceSummary;
  createdAt: string;
}

const STORAGE_KEY = 'fintutto_trial_balance';

// Account class labels according to German SKR
export const ACCOUNT_CLASS_LABELS: Record<AccountClass, string> = {
  '0': 'Anlagevermögen',
  '1': 'Umlaufvermögen / Finanzkonten',
  '2': 'Eigenkapital / Rückstellungen',
  '3': 'Verbindlichkeiten / Wareneinkauf',
  '4': 'Betriebliche Aufwendungen',
  '5': 'Neutrale Aufwendungen',
  '6': 'Neutrale Erträge',
  '7': 'Außerordentliche Erträge/Aufwendungen',
  '8': 'Erlöse',
  '9': 'Vortragskonten / Statistische Konten',
};

// Demo accounts with sample data
const DEMO_ACCOUNTS: TrialBalanceRow[] = [
  // Klasse 0 - Anlagevermögen
  { accountNumber: '0200', accountName: 'EDV-Software', accountClass: '0', openingDebit: 15000, openingCredit: 0, periodDebit: 2500, periodCredit: 500, closingDebit: 17000, closingCredit: 0, balance: 17000, balanceType: 'debit' },
  { accountNumber: '0400', accountName: 'Maschinen', accountClass: '0', openingDebit: 85000, openingCredit: 0, periodDebit: 12000, periodCredit: 0, closingDebit: 97000, closingCredit: 0, balance: 97000, balanceType: 'debit' },
  { accountNumber: '0420', accountName: 'Büroausstattung', accountClass: '0', openingDebit: 12500, openingCredit: 0, periodDebit: 3500, periodCredit: 0, closingDebit: 16000, closingCredit: 0, balance: 16000, balanceType: 'debit' },
  { accountNumber: '0540', accountName: 'PKW', accountClass: '0', openingDebit: 35000, openingCredit: 0, periodDebit: 0, periodCredit: 0, closingDebit: 35000, closingCredit: 0, balance: 35000, balanceType: 'debit' },

  // Klasse 1 - Umlaufvermögen
  { accountNumber: '1000', accountName: 'Kasse', accountClass: '1', openingDebit: 500, openingCredit: 0, periodDebit: 2500, periodCredit: 1800, closingDebit: 1200, closingCredit: 0, balance: 1200, balanceType: 'debit' },
  { accountNumber: '1200', accountName: 'Bank', accountClass: '1', openingDebit: 45000, openingCredit: 0, periodDebit: 125000, periodCredit: 98000, closingDebit: 72000, closingCredit: 0, balance: 72000, balanceType: 'debit' },
  { accountNumber: '1400', accountName: 'Forderungen aus L+L', accountClass: '1', openingDebit: 28500, openingCredit: 0, periodDebit: 85000, periodCredit: 72000, closingDebit: 41500, closingCredit: 0, balance: 41500, balanceType: 'debit' },
  { accountNumber: '1576', accountName: 'Vorsteuer 19%', accountClass: '1', openingDebit: 3200, openingCredit: 0, periodDebit: 8500, periodCredit: 8500, closingDebit: 3200, closingCredit: 0, balance: 3200, balanceType: 'debit' },

  // Klasse 2 - Eigenkapital
  { accountNumber: '2000', accountName: 'Gezeichnetes Kapital', accountClass: '2', openingDebit: 0, openingCredit: 25000, periodDebit: 0, periodCredit: 0, closingDebit: 0, closingCredit: 25000, balance: -25000, balanceType: 'credit' },
  { accountNumber: '2900', accountName: 'Gewinn-/Verlustvortrag', accountClass: '2', openingDebit: 0, openingCredit: 42500, periodDebit: 0, periodCredit: 0, closingDebit: 0, closingCredit: 42500, balance: -42500, balanceType: 'credit' },

  // Klasse 3 - Verbindlichkeiten
  { accountNumber: '3000', accountName: 'Wareneingang', accountClass: '3', openingDebit: 0, openingCredit: 0, periodDebit: 35000, periodCredit: 0, closingDebit: 35000, closingCredit: 0, balance: 35000, balanceType: 'debit' },
  { accountNumber: '3300', accountName: 'Verbindlichkeiten aus L+L', accountClass: '3', openingDebit: 0, openingCredit: 15800, periodDebit: 42000, periodCredit: 45000, closingDebit: 0, closingCredit: 18800, balance: -18800, balanceType: 'credit' },
  { accountNumber: '3806', accountName: 'Umsatzsteuer 19%', accountClass: '3', openingDebit: 0, openingCredit: 5200, periodDebit: 0, periodCredit: 12500, closingDebit: 0, closingCredit: 17700, balance: -17700, balanceType: 'credit' },

  // Klasse 4 - Aufwendungen
  { accountNumber: '4100', accountName: 'Löhne', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 18000, periodCredit: 0, closingDebit: 18000, closingCredit: 0, balance: 18000, balanceType: 'debit' },
  { accountNumber: '4120', accountName: 'Gehälter', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 12000, periodCredit: 0, closingDebit: 12000, closingCredit: 0, balance: 12000, balanceType: 'debit' },
  { accountNumber: '4130', accountName: 'Soziale Abgaben', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 5600, periodCredit: 0, closingDebit: 5600, closingCredit: 0, balance: 5600, balanceType: 'debit' },
  { accountNumber: '4210', accountName: 'Miete', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 3500, periodCredit: 0, closingDebit: 3500, closingCredit: 0, balance: 3500, balanceType: 'debit' },
  { accountNumber: '4240', accountName: 'Gas/Strom/Wasser', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 850, periodCredit: 0, closingDebit: 850, closingCredit: 0, balance: 850, balanceType: 'debit' },
  { accountNumber: '4360', accountName: 'Versicherungen', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 1200, periodCredit: 0, closingDebit: 1200, closingCredit: 0, balance: 1200, balanceType: 'debit' },
  { accountNumber: '4500', accountName: 'KFZ-Kosten', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 2800, periodCredit: 0, closingDebit: 2800, closingCredit: 0, balance: 2800, balanceType: 'debit' },
  { accountNumber: '4600', accountName: 'Werbekosten', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 1500, periodCredit: 0, closingDebit: 1500, closingCredit: 0, balance: 1500, balanceType: 'debit' },
  { accountNumber: '4830', accountName: 'AfA auf Sachanlagen', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 2500, periodCredit: 0, closingDebit: 2500, closingCredit: 0, balance: 2500, balanceType: 'debit' },
  { accountNumber: '4930', accountName: 'Büromaterial', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 450, periodCredit: 0, closingDebit: 450, closingCredit: 0, balance: 450, balanceType: 'debit' },
  { accountNumber: '4970', accountName: 'Nebenkosten des Geldverkehrs', accountClass: '4', openingDebit: 0, openingCredit: 0, periodDebit: 180, periodCredit: 0, closingDebit: 180, closingCredit: 0, balance: 180, balanceType: 'debit' },

  // Klasse 7 - Zinsen
  { accountNumber: '7310', accountName: 'Zinsaufwendungen', accountClass: '7', openingDebit: 0, openingCredit: 0, periodDebit: 850, periodCredit: 0, closingDebit: 850, closingCredit: 0, balance: 850, balanceType: 'debit' },

  // Klasse 8 - Erlöse
  { accountNumber: '8400', accountName: 'Erlöse 19%', accountClass: '8', openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 95000, closingDebit: 0, closingCredit: 95000, balance: -95000, balanceType: 'credit' },
  { accountNumber: '8300', accountName: 'Erlöse 7%', accountClass: '8', openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 12000, closingDebit: 0, closingCredit: 12000, balance: -12000, balanceType: 'credit' },
];

export function useTrialBalance() {
  const [reports, setReports] = useState<TrialBalanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setReports(data.reports || []);
      } catch {
        setReports([]);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((newReports: TrialBalanceReport[]) => {
    setReports(newReports);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ reports: newReports }));
  }, []);

  // Calculate summary from rows
  const calculateSummary = useCallback((rows: TrialBalanceRow[]): TrialBalanceSummary => {
    const summary = rows.reduce(
      (acc, row) => ({
        totalOpeningDebit: acc.totalOpeningDebit + row.openingDebit,
        totalOpeningCredit: acc.totalOpeningCredit + row.openingCredit,
        totalPeriodDebit: acc.totalPeriodDebit + row.periodDebit,
        totalPeriodCredit: acc.totalPeriodCredit + row.periodCredit,
        totalClosingDebit: acc.totalClosingDebit + row.closingDebit,
        totalClosingCredit: acc.totalClosingCredit + row.closingCredit,
      }),
      {
        totalOpeningDebit: 0,
        totalOpeningCredit: 0,
        totalPeriodDebit: 0,
        totalPeriodCredit: 0,
        totalClosingDebit: 0,
        totalClosingCredit: 0,
      }
    );

    const difference = Math.abs(summary.totalClosingDebit - summary.totalClosingCredit);

    return {
      ...summary,
      isBalanced: difference < 0.01, // Allow for floating point errors
      difference,
    };
  }, []);

  // Generate trial balance report
  const generateReport = useCallback((year: number, month: number): TrialBalanceReport => {
    // In a real app, this would aggregate actual booking data
    // For demo, we use sample data
    const rows = [...DEMO_ACCOUNTS];

    // Calculate summary
    const summary = calculateSummary(rows);

    const report: TrialBalanceReport = {
      id: `tb-${year}-${month}`,
      year,
      month,
      fromDate: `${year}-${String(month).padStart(2, '0')}-01`,
      toDate: `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`,
      rows,
      summary,
      createdAt: new Date().toISOString(),
    };

    // Save report
    const existingIndex = reports.findIndex(r => r.year === year && r.month === month);
    if (existingIndex >= 0) {
      const newReports = [...reports];
      newReports[existingIndex] = report;
      saveData(newReports);
    } else {
      saveData([...reports, report]);
    }

    return report;
  }, [reports, calculateSummary, saveData]);

  // Get report for period
  const getReport = useCallback((year: number, month: number): TrialBalanceReport | null => {
    return reports.find(r => r.year === year && r.month === month) || null;
  }, [reports]);

  // Get rows by account class
  const getRowsByClass = useCallback((rows: TrialBalanceRow[], accountClass: AccountClass): TrialBalanceRow[] => {
    return rows.filter(r => r.accountClass === accountClass);
  }, []);

  // Get class subtotal
  const getClassSubtotal = useCallback((rows: TrialBalanceRow[], accountClass: AccountClass): TrialBalanceSummary => {
    const classRows = rows.filter(r => r.accountClass === accountClass);
    return calculateSummary(classRows);
  }, [calculateSummary]);

  // Search accounts
  const searchAccounts = useCallback((rows: TrialBalanceRow[], query: string): TrialBalanceRow[] => {
    const q = query.toLowerCase();
    return rows.filter(r =>
      r.accountNumber.includes(q) ||
      r.accountName.toLowerCase().includes(q)
    );
  }, []);

  // Get accounts with activity
  const getActiveAccounts = useCallback((rows: TrialBalanceRow[]): TrialBalanceRow[] => {
    return rows.filter(r => r.periodDebit !== 0 || r.periodCredit !== 0);
  }, []);

  // Get non-zero balance accounts
  const getNonZeroAccounts = useCallback((rows: TrialBalanceRow[]): TrialBalanceRow[] => {
    return rows.filter(r => r.balance !== 0);
  }, []);

  // Export to CSV
  const exportTrialBalance = useCallback((year: number, month: number) => {
    const report = getReport(year, month) || generateReport(year, month);

    const headers = [
      'Konto',
      'Bezeichnung',
      'Anfangssaldo Soll',
      'Anfangssaldo Haben',
      'Umsatz Soll',
      'Umsatz Haben',
      'Endsaldo Soll',
      'Endsaldo Haben',
      'Saldo',
    ];

    const rows: string[][] = [];

    // Group by account class
    for (const classKey of Object.keys(ACCOUNT_CLASS_LABELS) as AccountClass[]) {
      const classRows = report.rows.filter(r => r.accountClass === classKey);
      if (classRows.length === 0) continue;

      // Add class header
      rows.push([`Klasse ${classKey}: ${ACCOUNT_CLASS_LABELS[classKey]}`, '', '', '', '', '', '', '', '']);

      // Add account rows
      for (const row of classRows) {
        rows.push([
          row.accountNumber,
          row.accountName,
          row.openingDebit.toFixed(2),
          row.openingCredit.toFixed(2),
          row.periodDebit.toFixed(2),
          row.periodCredit.toFixed(2),
          row.closingDebit.toFixed(2),
          row.closingCredit.toFixed(2),
          row.balance.toFixed(2),
        ]);
      }

      // Add class subtotal
      const subtotal = calculateSummary(classRows);
      rows.push([
        '',
        'Summe Klasse ' + classKey,
        subtotal.totalOpeningDebit.toFixed(2),
        subtotal.totalOpeningCredit.toFixed(2),
        subtotal.totalPeriodDebit.toFixed(2),
        subtotal.totalPeriodCredit.toFixed(2),
        subtotal.totalClosingDebit.toFixed(2),
        subtotal.totalClosingCredit.toFixed(2),
        '',
      ]);
      rows.push(['', '', '', '', '', '', '', '', '']);
    }

    // Add grand total
    const summary = report.summary;
    rows.push([
      '',
      'GESAMTSUMME',
      summary.totalOpeningDebit.toFixed(2),
      summary.totalOpeningCredit.toFixed(2),
      summary.totalPeriodDebit.toFixed(2),
      summary.totalPeriodCredit.toFixed(2),
      summary.totalClosingDebit.toFixed(2),
      summary.totalClosingCredit.toFixed(2),
      '',
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Summen_Saldenliste_${year}_${String(month).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getReport, generateReport, calculateSummary]);

  return {
    reports,
    isLoading,
    generateReport,
    getReport,
    getRowsByClass,
    getClassSubtotal,
    searchAccounts,
    getActiveAccounts,
    getNonZeroAccounts,
    exportTrialBalance,
    accountClassLabels: ACCOUNT_CLASS_LABELS,
  };
}
