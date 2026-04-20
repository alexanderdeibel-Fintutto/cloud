import { useState, useCallback, useEffect } from 'react';

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type AccountCategory =
  | 'anlagevermoegen'
  | 'umlaufvermoegen'
  | 'eigenkapital'
  | 'rueckstellungen'
  | 'verbindlichkeiten'
  | 'erloese'
  | 'aufwendungen'
  | 'steuern';

export interface Account {
  id: string;
  number: string;
  name: string;
  description?: string;
  type: AccountType;
  category: AccountCategory;
  parentNumber?: string;
  isHeader: boolean;
  isSystem: boolean;
  taxRate?: number;
  costCenterId?: string;
  balance: number;
  isActive: boolean;
  skr: '03' | '04';
  createdAt: string;
  updatedAt: string;
}

export interface AccountGroup {
  range: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
}

const STORAGE_KEY = 'fintutto_chart_of_accounts';

// SKR03 Account Groups
const SKR03_GROUPS: AccountGroup[] = [
  { range: '0', name: 'Anlagevermögen', type: 'asset', category: 'anlagevermoegen' },
  { range: '1', name: 'Umlaufvermögen & Abgrenzung', type: 'asset', category: 'umlaufvermoegen' },
  { range: '2', name: 'Eigenkapital', type: 'equity', category: 'eigenkapital' },
  { range: '3', name: 'Verbindlichkeiten', type: 'liability', category: 'verbindlichkeiten' },
  { range: '4', name: 'Betriebliche Aufwendungen', type: 'expense', category: 'aufwendungen' },
  { range: '5', name: 'Sonstige Aufwendungen', type: 'expense', category: 'aufwendungen' },
  { range: '6', name: 'Material & Waren', type: 'expense', category: 'aufwendungen' },
  { range: '7', name: 'Abschreibungen & Steuern', type: 'expense', category: 'steuern' },
  { range: '8', name: 'Erlöse', type: 'revenue', category: 'erloese' },
  { range: '9', name: 'Vorträge & statistische Konten', type: 'equity', category: 'eigenkapital' },
];

const DEFAULT_ACCOUNTS: Account[] = [
  // Anlagevermögen
  { id: 'a1', number: '0400', name: 'Technische Anlagen und Maschinen', type: 'asset', category: 'anlagevermoegen', isHeader: true, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'a2', number: '0410', name: 'Maschinen', type: 'asset', category: 'anlagevermoegen', parentNumber: '0400', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'a3', number: '0420', name: 'Betriebs- und Geschäftsausstattung', type: 'asset', category: 'anlagevermoegen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'a4', number: '0650', name: 'EDV-Software', type: 'asset', category: 'anlagevermoegen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Umlaufvermögen
  { id: 'b1', number: '1000', name: 'Kasse', type: 'asset', category: 'umlaufvermoegen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'b2', number: '1200', name: 'Bank', type: 'asset', category: 'umlaufvermoegen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'b3', number: '1400', name: 'Forderungen aus Lieferungen und Leistungen', type: 'asset', category: 'umlaufvermoegen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'b4', number: '1571', name: 'Vorsteuer 7%', type: 'asset', category: 'umlaufvermoegen', isHeader: false, isSystem: true, taxRate: 7, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'b5', number: '1576', name: 'Vorsteuer 19%', type: 'asset', category: 'umlaufvermoegen', isHeader: false, isSystem: true, taxRate: 19, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Verbindlichkeiten
  { id: 'c1', number: '1600', name: 'Verbindlichkeiten aus Lieferungen und Leistungen', type: 'liability', category: 'verbindlichkeiten', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'c2', number: '1771', name: 'Umsatzsteuer 7%', type: 'liability', category: 'verbindlichkeiten', isHeader: false, isSystem: true, taxRate: 7, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'c3', number: '1776', name: 'Umsatzsteuer 19%', type: 'liability', category: 'verbindlichkeiten', isHeader: false, isSystem: true, taxRate: 19, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Eigenkapital
  { id: 'd1', number: '1800', name: 'Privatentnahmen', type: 'equity', category: 'eigenkapital', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'd2', number: '1890', name: 'Privateinlagen', type: 'equity', category: 'eigenkapital', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'd3', number: '2000', name: 'Gezeichnetes Kapital', type: 'equity', category: 'eigenkapital', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Aufwendungen
  { id: 'e1', number: '4100', name: 'Löhne und Gehälter', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e2', number: '4210', name: 'Miete', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e3', number: '4240', name: 'Gas, Strom, Wasser', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e4', number: '4360', name: 'Versicherungen', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e5', number: '4500', name: 'Kfz-Kosten', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e6', number: '4600', name: 'Werbekosten', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e7', number: '4830', name: 'Abschreibungen auf Sachanlagen', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e8', number: '4920', name: 'Telefon', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e9', number: '4930', name: 'Bürobedarf', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e10', number: '4950', name: 'Rechts- und Beratungskosten', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e11', number: '4970', name: 'Nebenkosten des Geldverkehrs', type: 'expense', category: 'aufwendungen', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Erlöse
  { id: 'f1', number: '8300', name: 'Erlöse 7% USt', type: 'revenue', category: 'erloese', isHeader: false, isSystem: true, taxRate: 7, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f2', number: '8400', name: 'Erlöse 19% USt', type: 'revenue', category: 'erloese', isHeader: false, isSystem: true, taxRate: 19, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f3', number: '8500', name: 'Provisionserlöse', type: 'revenue', category: 'erloese', isHeader: false, isSystem: true, balance: 0, isActive: true, skr: '03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'asset', label: 'Aktiva' },
  { value: 'liability', label: 'Passiva' },
  { value: 'equity', label: 'Eigenkapital' },
  { value: 'revenue', label: 'Erlöse' },
  { value: 'expense', label: 'Aufwendungen' },
];

export const ACCOUNT_CATEGORIES: { value: AccountCategory; label: string; type: AccountType }[] = [
  { value: 'anlagevermoegen', label: 'Anlagevermögen', type: 'asset' },
  { value: 'umlaufvermoegen', label: 'Umlaufvermögen', type: 'asset' },
  { value: 'eigenkapital', label: 'Eigenkapital', type: 'equity' },
  { value: 'rueckstellungen', label: 'Rückstellungen', type: 'liability' },
  { value: 'verbindlichkeiten', label: 'Verbindlichkeiten', type: 'liability' },
  { value: 'erloese', label: 'Erlöse', type: 'revenue' },
  { value: 'aufwendungen', label: 'Aufwendungen', type: 'expense' },
  { value: 'steuern', label: 'Steuern', type: 'expense' },
];

export function useChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSKR, setActiveSKR] = useState<'03' | '04'>('03');

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAccounts(data.accounts || DEFAULT_ACCOUNTS);
        setActiveSKR(data.skr || '03');
      } catch {
        setAccounts(DEFAULT_ACCOUNTS);
      }
    } else {
      setAccounts(DEFAULT_ACCOUNTS);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((newAccounts?: Account[], skr?: '03' | '04') => {
    const acc = newAccounts || accounts;
    const s = skr || activeSKR;
    if (newAccounts) setAccounts(newAccounts);
    if (skr) setActiveSKR(skr);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accounts: acc, skr: s }));
  }, [accounts, activeSKR]);

  // Create account
  const createAccount = useCallback((account: Omit<Account, 'id' | 'balance' | 'createdAt' | 'updatedAt'>) => {
    // Check if account number already exists
    if (accounts.some(a => a.number === account.number)) {
      throw new Error('Kontonummer existiert bereits');
    }

    const newAccount: Account = {
      ...account,
      id: `acc-${Date.now()}`,
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveData([...accounts, newAccount].sort((a, b) => a.number.localeCompare(b.number)));
    return newAccount;
  }, [accounts, saveData]);

  // Update account
  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    // Don't allow changing system accounts' number
    const account = accounts.find(a => a.id === id);
    if (account?.isSystem && updates.number && updates.number !== account.number) {
      throw new Error('Systemkonten können nicht umbenannt werden');
    }

    saveData(
      accounts
        .map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)
        .sort((a, b) => a.number.localeCompare(b.number))
    );
  }, [accounts, saveData]);

  // Delete account
  const deleteAccount = useCallback((id: string) => {
    const account = accounts.find(a => a.id === id);
    if (account?.isSystem) {
      throw new Error('Systemkonten können nicht gelöscht werden');
    }
    if (account?.balance !== 0) {
      throw new Error('Konten mit Saldo können nicht gelöscht werden');
    }
    saveData(accounts.filter(a => a.id !== id));
  }, [accounts, saveData]);

  // Get by number
  const getByNumber = useCallback((number: string): Account | undefined => {
    return accounts.find(a => a.number === number);
  }, [accounts]);

  // Get by type
  const getByType = useCallback((type: AccountType): Account[] => {
    return accounts.filter(a => a.type === type && a.isActive);
  }, [accounts]);

  // Get by category
  const getByCategory = useCallback((category: AccountCategory): Account[] => {
    return accounts.filter(a => a.category === category && a.isActive);
  }, [accounts]);

  // Get tree structure
  const getTree = useCallback(() => {
    const groups: Record<string, Account[]> = {};

    accounts.forEach(account => {
      const groupKey = account.number.charAt(0);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(account);
    });

    return SKR03_GROUPS.map(group => ({
      ...group,
      accounts: groups[group.range] || [],
    }));
  }, [accounts]);

  // Search accounts
  const searchAccounts = useCallback((query: string): Account[] => {
    const q = query.toLowerCase();
    return accounts.filter(a =>
      a.number.includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
    );
  }, [accounts]);

  // Get totals by type
  const getTotalsByType = useCallback(() => {
    const result: Record<AccountType, number> = {
      asset: 0,
      liability: 0,
      equity: 0,
      revenue: 0,
      expense: 0,
    };

    accounts.forEach(a => {
      if (a.isActive && !a.isHeader) {
        result[a.type] += a.balance;
      }
    });

    return result;
  }, [accounts]);

  // Switch SKR
  const switchSKR = useCallback((skr: '03' | '04') => {
    // In a real app, this would load different account data
    saveData(undefined, skr);
  }, [saveData]);

  // Validate account number
  const validateAccountNumber = useCallback((number: string): { valid: boolean; error?: string } => {
    if (!number) return { valid: false, error: 'Kontonummer erforderlich' };
    if (!/^\d{4}$/.test(number)) return { valid: false, error: 'Kontonummer muss 4-stellig sein' };
    if (accounts.some(a => a.number === number)) return { valid: false, error: 'Kontonummer existiert bereits' };
    return { valid: true };
  }, [accounts]);

  // Export accounts
  const exportAccounts = useCallback((format: 'json' | 'csv' = 'csv') => {
    if (format === 'csv') {
      const headers = ['Kontonummer', 'Bezeichnung', 'Typ', 'Kategorie', 'MwSt', 'Saldo', 'Status'];
      const rows = accounts.map(a => [
        a.number,
        a.name,
        ACCOUNT_TYPES.find(t => t.value === a.type)?.label || a.type,
        ACCOUNT_CATEGORIES.find(c => c.value === a.category)?.label || a.category,
        a.taxRate ? `${a.taxRate}%` : '-',
        a.balance.toFixed(2),
        a.isActive ? 'Aktiv' : 'Inaktiv',
      ]);
      const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kontenplan_skr${activeSKR}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = JSON.stringify(accounts, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kontenplan_skr${activeSKR}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [accounts, activeSKR]);

  // Get stats
  const getStats = useCallback(() => {
    return {
      total: accounts.length,
      active: accounts.filter(a => a.isActive).length,
      system: accounts.filter(a => a.isSystem).length,
      custom: accounts.filter(a => !a.isSystem).length,
      withBalance: accounts.filter(a => a.balance !== 0).length,
      skr: activeSKR,
    };
  }, [accounts, activeSKR]);

  return {
    accounts,
    isLoading,
    activeSKR,
    groups: SKR03_GROUPS,
    createAccount,
    updateAccount,
    deleteAccount,
    getByNumber,
    getByType,
    getByCategory,
    getTree,
    searchAccounts,
    getTotalsByType,
    switchSKR,
    validateAccountNumber,
    exportAccounts,
    getStats,
  };
}
