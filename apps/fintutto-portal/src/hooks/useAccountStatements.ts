import { useState, useCallback, useEffect } from 'react';

export interface AccountTransaction {
  id: string;
  date: string;
  documentNumber: string;
  documentType: string;
  description: string;
  counterAccount: string;
  counterAccountName?: string;
  debit: number;
  credit: number;
  balance: number;
  costCenter?: string;
  projectId?: string;
  createdAt: string;
}

export interface AccountStatement {
  accountNumber: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  openingBalance: number;
  openingBalanceType: 'debit' | 'credit';
  closingBalance: number;
  closingBalanceType: 'debit' | 'credit';
  totalDebit: number;
  totalCredit: number;
  transactions: AccountTransaction[];
  period: {
    from: string;
    to: string;
  };
}

const STORAGE_KEY = 'fintutto_account_statements';

// Sample account definitions
const ACCOUNT_DEFINITIONS: Record<string, { name: string; type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' }> = {
  '1000': { name: 'Kasse', type: 'asset' },
  '1200': { name: 'Bank', type: 'asset' },
  '1400': { name: 'Forderungen aus L+L', type: 'asset' },
  '1576': { name: 'Vorsteuer 19%', type: 'asset' },
  '2000': { name: 'Gezeichnetes Kapital', type: 'equity' },
  '2900': { name: 'Gewinn-/Verlustvortrag', type: 'equity' },
  '3300': { name: 'Verbindlichkeiten aus L+L', type: 'liability' },
  '3806': { name: 'Umsatzsteuer 19%', type: 'liability' },
  '4100': { name: 'Löhne', type: 'expense' },
  '4120': { name: 'Gehälter', type: 'expense' },
  '4130': { name: 'Soziale Abgaben', type: 'expense' },
  '4210': { name: 'Miete', type: 'expense' },
  '4240': { name: 'Gas/Strom/Wasser', type: 'expense' },
  '4360': { name: 'Versicherungen', type: 'expense' },
  '4500': { name: 'KFZ-Kosten', type: 'expense' },
  '4600': { name: 'Werbekosten', type: 'expense' },
  '4830': { name: 'AfA auf Sachanlagen', type: 'expense' },
  '4930': { name: 'Büromaterial', type: 'expense' },
  '8400': { name: 'Erlöse 19%', type: 'revenue' },
  '8300': { name: 'Erlöse 7%', type: 'revenue' },
};

// Sample transactions for bank account
const SAMPLE_BANK_TRANSACTIONS: AccountTransaction[] = [
  { id: 'tx-1', date: '2024-01-02', documentNumber: 'ER-001', documentType: 'Eingangsrechnung', description: 'Büromaterial Staples', counterAccount: '4930', counterAccountName: 'Büromaterial', debit: 0, credit: 125.50, balance: 44874.50, createdAt: new Date().toISOString() },
  { id: 'tx-2', date: '2024-01-03', documentNumber: 'AR-001', documentType: 'Ausgangsrechnung', description: 'Rechnung Kunde Müller', counterAccount: '1400', counterAccountName: 'Forderungen', debit: 5950.00, credit: 0, balance: 50824.50, createdAt: new Date().toISOString() },
  { id: 'tx-3', date: '2024-01-05', documentNumber: 'ER-002', documentType: 'Eingangsrechnung', description: 'Miete Januar', counterAccount: '4210', counterAccountName: 'Miete', debit: 0, credit: 3500.00, balance: 47324.50, createdAt: new Date().toISOString() },
  { id: 'tx-4', date: '2024-01-08', documentNumber: 'BA-001', documentType: 'Bankbeleg', description: 'Gehälter Januar', counterAccount: '4120', counterAccountName: 'Gehälter', debit: 0, credit: 12000.00, balance: 35324.50, createdAt: new Date().toISOString() },
  { id: 'tx-5', date: '2024-01-10', documentNumber: 'BA-002', documentType: 'Bankbeleg', description: 'Sozialversicherung', counterAccount: '4130', counterAccountName: 'Soz. Abgaben', debit: 0, credit: 5600.00, balance: 29724.50, createdAt: new Date().toISOString() },
  { id: 'tx-6', date: '2024-01-12', documentNumber: 'AR-002', documentType: 'Zahlungseingang', description: 'Zahlung Kunde Schmidt', counterAccount: '1400', counterAccountName: 'Forderungen', debit: 8500.00, credit: 0, balance: 38224.50, createdAt: new Date().toISOString() },
  { id: 'tx-7', date: '2024-01-15', documentNumber: 'ER-003', documentType: 'Eingangsrechnung', description: 'Versicherung', counterAccount: '4360', counterAccountName: 'Versicherungen', debit: 0, credit: 1200.00, balance: 37024.50, createdAt: new Date().toISOString() },
  { id: 'tx-8', date: '2024-01-18', documentNumber: 'AR-003', documentType: 'Zahlungseingang', description: 'Zahlung Kunde Weber', counterAccount: '1400', counterAccountName: 'Forderungen', debit: 12500.00, credit: 0, balance: 49524.50, createdAt: new Date().toISOString() },
  { id: 'tx-9', date: '2024-01-20', documentNumber: 'ER-004', documentType: 'Eingangsrechnung', description: 'KFZ-Tanken', counterAccount: '4500', counterAccountName: 'KFZ-Kosten', debit: 0, credit: 185.00, balance: 49339.50, createdAt: new Date().toISOString() },
  { id: 'tx-10', date: '2024-01-22', documentNumber: 'BA-003', documentType: 'Bankbeleg', description: 'Strom/Gas', counterAccount: '4240', counterAccountName: 'Energie', debit: 0, credit: 850.00, balance: 48489.50, createdAt: new Date().toISOString() },
  { id: 'tx-11', date: '2024-01-25', documentNumber: 'AR-004', documentType: 'Zahlungseingang', description: 'Zahlung Kunde Bauer', counterAccount: '1400', counterAccountName: 'Forderungen', debit: 15000.00, credit: 0, balance: 63489.50, createdAt: new Date().toISOString() },
  { id: 'tx-12', date: '2024-01-28', documentNumber: 'ER-005', documentType: 'Eingangsrechnung', description: 'Werbekosten', counterAccount: '4600', counterAccountName: 'Werbung', debit: 0, credit: 1500.00, balance: 61989.50, createdAt: new Date().toISOString() },
  { id: 'tx-13', date: '2024-01-30', documentNumber: 'BA-004', documentType: 'Bankbeleg', description: 'Kontoführungsgebühren', counterAccount: '4970', counterAccountName: 'Bankgebühren', debit: 0, credit: 25.50, balance: 61964.00, createdAt: new Date().toISOString() },
];

export function useAccountStatements() {
  const [statements, setStatements] = useState<Record<string, AccountStatement>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setStatements(data.statements || {});
      } catch {
        setStatements({});
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((newStatements: Record<string, AccountStatement>) => {
    setStatements(newStatements);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ statements: newStatements }));
  }, []);

  // Get account info
  const getAccountInfo = useCallback((accountNumber: string) => {
    return ACCOUNT_DEFINITIONS[accountNumber] || { name: `Konto ${accountNumber}`, type: 'asset' as const };
  }, []);

  // Generate account statement
  const generateStatement = useCallback((
    accountNumber: string,
    fromDate: string,
    toDate: string
  ): AccountStatement => {
    const accountInfo = getAccountInfo(accountNumber);

    // For demo, generate sample transactions based on account
    let transactions: AccountTransaction[] = [];
    let openingBalance = 0;
    let openingBalanceType: 'debit' | 'credit' = 'debit';

    if (accountNumber === '1200') {
      // Bank account - use sample transactions
      transactions = SAMPLE_BANK_TRANSACTIONS.filter(
        tx => tx.date >= fromDate && tx.date <= toDate
      );
      openingBalance = 45000;
      openingBalanceType = 'debit';
    } else {
      // Generate random transactions for other accounts
      const numTx = Math.floor(Math.random() * 10) + 3;
      let balance = Math.random() * 10000;
      openingBalance = balance;

      for (let i = 0; i < numTx; i++) {
        const day = Math.floor(Math.random() * 28) + 1;
        const isDebit = Math.random() > 0.5;
        const amount = Math.round((Math.random() * 2000 + 100) * 100) / 100;

        if (isDebit) {
          balance += amount;
        } else {
          balance -= amount;
        }

        transactions.push({
          id: `tx-${accountNumber}-${i}`,
          date: `2024-01-${String(day).padStart(2, '0')}`,
          documentNumber: `BEL-${String(i + 1).padStart(3, '0')}`,
          documentType: 'Beleg',
          description: `Buchung ${i + 1}`,
          counterAccount: '1200',
          counterAccountName: 'Bank',
          debit: isDebit ? amount : 0,
          credit: isDebit ? 0 : amount,
          balance: Math.round(balance * 100) / 100,
          createdAt: new Date().toISOString(),
        });
      }

      // Sort by date
      transactions.sort((a, b) => a.date.localeCompare(b.date));
    }

    const totalDebit = transactions.reduce((sum, tx) => sum + tx.debit, 0);
    const totalCredit = transactions.reduce((sum, tx) => sum + tx.credit, 0);
    const closingBalance = transactions.length > 0
      ? transactions[transactions.length - 1].balance
      : openingBalance;

    const statement: AccountStatement = {
      accountNumber,
      accountName: accountInfo.name,
      accountType: accountInfo.type,
      openingBalance,
      openingBalanceType,
      closingBalance: Math.abs(closingBalance),
      closingBalanceType: closingBalance >= 0 ? 'debit' : 'credit',
      totalDebit,
      totalCredit,
      transactions,
      period: { from: fromDate, to: toDate },
    };

    // Save to cache
    const key = `${accountNumber}-${fromDate}-${toDate}`;
    saveData({ ...statements, [key]: statement });

    return statement;
  }, [statements, getAccountInfo, saveData]);

  // Get statement from cache or generate
  const getStatement = useCallback((
    accountNumber: string,
    fromDate: string,
    toDate: string
  ): AccountStatement => {
    const key = `${accountNumber}-${fromDate}-${toDate}`;
    if (statements[key]) {
      return statements[key];
    }
    return generateStatement(accountNumber, fromDate, toDate);
  }, [statements, generateStatement]);

  // Get available accounts
  const getAvailableAccounts = useCallback(() => {
    return Object.entries(ACCOUNT_DEFINITIONS).map(([number, info]) => ({
      number,
      ...info,
    }));
  }, []);

  // Search transactions
  const searchTransactions = useCallback((
    transactions: AccountTransaction[],
    query: string
  ): AccountTransaction[] => {
    const q = query.toLowerCase();
    return transactions.filter(tx =>
      tx.documentNumber.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      tx.counterAccount.includes(q) ||
      tx.counterAccountName?.toLowerCase().includes(q)
    );
  }, []);

  // Filter by date range
  const filterByDateRange = useCallback((
    transactions: AccountTransaction[],
    fromDate: string,
    toDate: string
  ): AccountTransaction[] => {
    return transactions.filter(tx => tx.date >= fromDate && tx.date <= toDate);
  }, []);

  // Export statement to CSV
  const exportStatement = useCallback((statement: AccountStatement) => {
    const headers = [
      'Datum',
      'Belegnummer',
      'Belegart',
      'Buchungstext',
      'Gegenkonto',
      'Soll',
      'Haben',
      'Saldo',
    ];

    const rows: string[][] = [];

    // Add header info
    rows.push([`Kontoauszug Konto ${statement.accountNumber}: ${statement.accountName}`]);
    rows.push([`Zeitraum: ${statement.period.from} bis ${statement.period.to}`]);
    rows.push(['']);

    // Add opening balance
    rows.push([
      '',
      '',
      '',
      'Anfangssaldo',
      '',
      statement.openingBalanceType === 'debit' ? statement.openingBalance.toFixed(2) : '',
      statement.openingBalanceType === 'credit' ? statement.openingBalance.toFixed(2) : '',
      statement.openingBalance.toFixed(2),
    ]);

    // Add transactions
    for (const tx of statement.transactions) {
      rows.push([
        tx.date,
        tx.documentNumber,
        tx.documentType,
        tx.description,
        `${tx.counterAccount} ${tx.counterAccountName || ''}`,
        tx.debit > 0 ? tx.debit.toFixed(2) : '',
        tx.credit > 0 ? tx.credit.toFixed(2) : '',
        tx.balance.toFixed(2),
      ]);
    }

    // Add totals
    rows.push(['']);
    rows.push([
      '',
      '',
      '',
      'Summe Bewegungen',
      '',
      statement.totalDebit.toFixed(2),
      statement.totalCredit.toFixed(2),
      '',
    ]);
    rows.push([
      '',
      '',
      '',
      'Endsaldo',
      '',
      statement.closingBalanceType === 'debit' ? statement.closingBalance.toFixed(2) : '',
      statement.closingBalanceType === 'credit' ? statement.closingBalance.toFixed(2) : '',
      statement.closingBalance.toFixed(2),
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kontoauszug_${statement.accountNumber}_${statement.period.from}_${statement.period.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Print statement (generate printable HTML)
  const getPrintableHTML = useCallback((statement: AccountStatement): string => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kontoauszug ${statement.accountNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          h1 { font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .total-row { background-color: #f9f9f9; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Kontoauszug</h1>
        <p><strong>Konto:</strong> ${statement.accountNumber} - ${statement.accountName}</p>
        <p><strong>Zeitraum:</strong> ${statement.period.from} bis ${statement.period.to}</p>
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Beleg-Nr.</th>
              <th>Buchungstext</th>
              <th>Gegenkonto</th>
              <th class="right">Soll</th>
              <th class="right">Haben</th>
              <th class="right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="4">Anfangssaldo</td>
              <td class="right">${statement.openingBalanceType === 'debit' ? statement.openingBalance.toFixed(2) : ''}</td>
              <td class="right">${statement.openingBalanceType === 'credit' ? statement.openingBalance.toFixed(2) : ''}</td>
              <td class="right bold">${statement.openingBalance.toFixed(2)}</td>
            </tr>
    `;

    for (const tx of statement.transactions) {
      html += `
        <tr>
          <td>${tx.date}</td>
          <td>${tx.documentNumber}</td>
          <td>${tx.description}</td>
          <td>${tx.counterAccount}</td>
          <td class="right">${tx.debit > 0 ? tx.debit.toFixed(2) : ''}</td>
          <td class="right">${tx.credit > 0 ? tx.credit.toFixed(2) : ''}</td>
          <td class="right">${tx.balance.toFixed(2)}</td>
        </tr>
      `;
    }

    html += `
            <tr class="total-row">
              <td colspan="4">Summe / Endsaldo</td>
              <td class="right">${statement.totalDebit.toFixed(2)}</td>
              <td class="right">${statement.totalCredit.toFixed(2)}</td>
              <td class="right">${statement.closingBalance.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    return html;
  }, []);

  return {
    statements,
    isLoading,
    generateStatement,
    getStatement,
    getAvailableAccounts,
    getAccountInfo,
    searchTransactions,
    filterByDateRange,
    exportStatement,
    getPrintableHTML,
    accountDefinitions: ACCOUNT_DEFINITIONS,
  };
}
