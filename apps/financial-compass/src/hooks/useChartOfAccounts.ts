import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

// ============================================================
// Typen
// ============================================================
export type SKRType = '03' | '04';
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'neutral';
export type AccountCategory = string;

export interface Account {
  id: string;
  skr: SKRType;
  number: string;
  name: string;
  account_type: AccountType;
  account_group: string;
  account_class: string;
  tax_key?: string | null;
  tax_rate?: number | null;
  datev_code?: string | null;
  description?: string | null;
  is_system: boolean;
  is_active: boolean;
  balance?: number;
  // Legacy-Kompatibilität
  type?: AccountType;
  category?: string;
  isSystem?: boolean;
  isActive?: boolean;
  isHeader?: boolean;
  taxRate?: number;
}

export interface AccountGroup {
  range: string;
  label: string;
  description: string;
}

// ============================================================
// Kontenrahmen-Gruppen
// ============================================================
export const SKR03_GROUPS: AccountGroup[] = [
  { range: '0', label: 'Klasse 0', description: 'Anlage- und Kapitalkonten' },
  { range: '1', label: 'Klasse 1', description: 'Finanz- und Privatkonten' },
  { range: '2', label: 'Klasse 2', description: 'Abgrenzungskonten' },
  { range: '3', label: 'Klasse 3', description: 'Wareneingang und Bestandskonten' },
  { range: '4', label: 'Klasse 4', description: 'Betriebliche Aufwendungen' },
  { range: '7', label: 'Klasse 7', description: 'Weitere Aufwendungen' },
  { range: '8', label: 'Klasse 8', description: 'Erlöskonten' },
  { range: '9', label: 'Klasse 9', description: 'Vortrags- und statistische Konten' },
];

export const SKR04_GROUPS: AccountGroup[] = [
  { range: '0', label: 'Klasse 0', description: 'Anlage- und Kapitalkonten' },
  { range: '1', label: 'Klasse 1', description: 'Umlaufvermögen' },
  { range: '2', label: 'Klasse 2', description: 'Forderungen und sonstige Vermögensgegenstände' },
  { range: '3', label: 'Klasse 3', description: 'Eigenkapital, Rückstellungen, Verbindlichkeiten' },
  { range: '4', label: 'Klasse 4', description: 'Betriebliche Erträge' },
  { range: '5', label: 'Klasse 5', description: 'Materialaufwendungen' },
  { range: '6', label: 'Klasse 6', description: 'Personalaufwendungen' },
  { range: '7', label: 'Klasse 7', description: 'Sonstige betriebliche Aufwendungen' },
  { range: '8', label: 'Klasse 8', description: 'Finanz- und außerordentliche Aufwendungen' },
  { range: '9', label: 'Klasse 9', description: 'Abschlusskonten' },
];

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'asset', label: 'Aktiva' },
  { value: 'liability', label: 'Passiva' },
  { value: 'equity', label: 'Eigenkapital' },
  { value: 'revenue', label: 'Erlöse' },
  { value: 'expense', label: 'Aufwendungen' },
  { value: 'neutral', label: 'Neutral' },
];

export const ACCOUNT_CATEGORIES: { value: string; label: string; type: AccountType }[] = [
  { value: 'Immaterielle Vermögensgegenstände', label: 'Immaterielle Vermögensgegenstände', type: 'asset' },
  { value: 'Sachanlagen', label: 'Sachanlagen', type: 'asset' },
  { value: 'Finanzanlagen', label: 'Finanzanlagen', type: 'asset' },
  { value: 'Vorräte', label: 'Vorräte', type: 'asset' },
  { value: 'Forderungen', label: 'Forderungen', type: 'asset' },
  { value: 'Zahlungsmittel', label: 'Zahlungsmittel', type: 'asset' },
  { value: 'Eigenkapital', label: 'Eigenkapital', type: 'equity' },
  { value: 'Rückstellungen', label: 'Rückstellungen', type: 'liability' },
  { value: 'Verbindlichkeiten', label: 'Verbindlichkeiten', type: 'liability' },
  { value: 'Erlöse', label: 'Erlöse', type: 'revenue' },
  { value: 'Sonstige Erträge', label: 'Sonstige Erträge', type: 'revenue' },
  { value: 'Finanzerträge', label: 'Finanzerträge', type: 'revenue' },
  { value: 'Personalaufwendungen', label: 'Personalaufwendungen', type: 'expense' },
  { value: 'Materialaufwendungen', label: 'Materialaufwendungen', type: 'expense' },
  { value: 'Raumkosten', label: 'Raumkosten', type: 'expense' },
  { value: 'Fahrzeugkosten', label: 'Fahrzeugkosten', type: 'expense' },
  { value: 'Marketing', label: 'Marketing', type: 'expense' },
  { value: 'Bürokosten', label: 'Bürokosten', type: 'expense' },
  { value: 'Kommunikation', label: 'Kommunikation', type: 'expense' },
  { value: 'IT-Kosten', label: 'IT-Kosten', type: 'expense' },
  { value: 'Beratung', label: 'Beratung', type: 'expense' },
  { value: 'Reisekosten', label: 'Reisekosten', type: 'expense' },
  { value: 'Abschreibungen', label: 'Abschreibungen', type: 'expense' },
  { value: 'Finanzkosten', label: 'Finanzkosten', type: 'expense' },
  { value: 'Steuern und Abgaben', label: 'Steuern und Abgaben', type: 'expense' },
  { value: 'Sonstiges', label: 'Sonstiges', type: 'expense' },
  { value: 'Steuerkonten', label: 'Steuerkonten', type: 'neutral' },
];

export const TAX_KEY_LABELS: Record<string, string> = {
  'VSt19': 'Vorsteuer 19%',
  'VSt7': 'Vorsteuer 7%',
  'VSt19EU': 'Vorsteuer EU 19%',
  'VSt7EU': 'Vorsteuer EU 7%',
  'USt19': 'Umsatzsteuer 19%',
  'USt7': 'Umsatzsteuer 7%',
  'USt19EU': 'Umsatzsteuer EU 19%',
  'USt7EU': 'Umsatzsteuer EU 7%',
  'stfr': 'Steuerfrei',
  'stfrEU': 'Steuerfrei (EU)',
};

// ============================================================
// Hook
// ============================================================
export function useChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSKR, setActiveSKR] = useState<SKRType>('03');
  const { currentCompany } = useCompany();

  const loadAccounts = useCallback(async (skr: SKRType) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('fc_chart_of_accounts')
        .select('*')
        .eq('skr', skr)
        .eq('is_active', true)
        .order('number');

      if (error) throw error;

      const normalized = (data || []).map((a: Record<string, unknown>) => ({
        ...a,
        type: a.account_type as AccountType,
        category: a.account_group as string,
        isSystem: a.is_system as boolean,
        isActive: a.is_active as boolean,
        isHeader: false,
        balance: 0,
        taxRate: a.tax_rate as number | undefined,
      })) as Account[];

      setAccounts(normalized);
    } catch (err) {
      console.error('Fehler beim Laden des Kontenplans:', err);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const skr = (currentCompany?.chart_of_accounts as SKRType) || '03';
    setActiveSKR(skr);
    loadAccounts(skr);
  }, [currentCompany?.id, loadAccounts]);

  const switchSKR = useCallback((skr: SKRType) => {
    setActiveSKR(skr);
    loadAccounts(skr);
  }, [loadAccounts]);

  const createAccount = useCallback(async (account: Partial<Account>) => {
    if (accounts.some(a => a.number === account.number && a.skr === activeSKR)) {
      throw new Error('Kontonummer existiert bereits');
    }
    const { data, error } = await supabase
      .from('fc_chart_of_accounts')
      .insert({ ...account, skr: activeSKR, is_system: false, is_active: true })
      .select()
      .single();
    if (error) throw error;
    await loadAccounts(activeSKR);
    return data;
  }, [accounts, activeSKR, loadAccounts]);

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    const account = accounts.find(a => a.id === id);
    if (account?.is_system && updates.number && updates.number !== account.number) {
      throw new Error('Systemkonten können nicht umbenannt werden');
    }
    const { error } = await supabase.from('fc_chart_of_accounts').update(updates).eq('id', id);
    if (error) throw error;
    await loadAccounts(activeSKR);
  }, [accounts, activeSKR, loadAccounts]);

  const deleteAccount = useCallback(async (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (account?.is_system) throw new Error('Systemkonten können nicht gelöscht werden');
    const { error } = await supabase.from('fc_chart_of_accounts').delete().eq('id', id);
    if (error) throw error;
    await loadAccounts(activeSKR);
  }, [accounts, activeSKR, loadAccounts]);

  const getByNumber = useCallback((number: string) =>
    accounts.find(a => a.number === number), [accounts]);

  const getByType = useCallback((type: AccountType) =>
    accounts.filter(a => a.account_type === type && a.is_active), [accounts]);

  const getByCategory = useCallback((category: string) =>
    accounts.filter(a => a.account_group === category && a.is_active), [accounts]);

  const getTree = useCallback(() => {
    const groups = activeSKR === '03' ? SKR03_GROUPS : SKR04_GROUPS;
    return groups.map(group => ({
      ...group,
      accounts: accounts.filter(a => a.account_class === group.range),
    }));
  }, [accounts, activeSKR]);

  const searchAccounts = useCallback((query: string) => {
    const q = query.toLowerCase();
    return accounts.filter(a =>
      a.number.includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.account_group?.toLowerCase().includes(q) ||
      a.tax_key?.toLowerCase().includes(q)
    );
  }, [accounts]);

  const getTotalsByType = useCallback(() => {
    const result: Record<string, number> = {
      asset: 0, liability: 0, equity: 0, revenue: 0, expense: 0, neutral: 0,
    };
    accounts.forEach(a => { if (a.is_active) result[a.account_type] += (a.balance || 0); });
    return result;
  }, [accounts]);

  const validateAccountNumber = useCallback((number: string) => {
    if (!number) return { valid: false, error: 'Kontonummer erforderlich' };
    if (!/^\d{4}$/.test(number)) return { valid: false, error: 'Kontonummer muss 4-stellig sein' };
    if (accounts.some(a => a.number === number)) return { valid: false, error: 'Kontonummer existiert bereits' };
    return { valid: true };
  }, [accounts]);

  const exportAccounts = useCallback((format: 'json' | 'csv' = 'csv') => {
    if (format === 'csv') {
      const headers = ['Kontonummer', 'Bezeichnung', 'Typ', 'Gruppe', 'Steuerkennzeichen', 'MwSt-Satz', 'Status'];
      const rows = accounts.map(a => [
        a.number, a.name,
        ACCOUNT_TYPES.find(t => t.value === a.account_type)?.label || a.account_type,
        a.account_group,
        a.tax_key ? (TAX_KEY_LABELS[a.tax_key] || a.tax_key) : '-',
        a.tax_rate ? `${a.tax_rate}%` : '-',
        a.is_active ? 'Aktiv' : 'Inaktiv',
      ]);
      const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kontenplan_skr${activeSKR}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [accounts, activeSKR]);

  const getStats = useCallback(() => ({
    total: accounts.length,
    active: accounts.filter(a => a.is_active).length,
    system: accounts.filter(a => a.is_system).length,
    custom: accounts.filter(a => !a.is_system).length,
    withTaxKey: accounts.filter(a => a.tax_key).length,
    skr: activeSKR,
  }), [accounts, activeSKR]);

  return {
    accounts,
    isLoading,
    activeSKR,
    groups: activeSKR === '03' ? SKR03_GROUPS : SKR04_GROUPS,
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
    reload: () => loadAccounts(activeSKR),
  };
}
