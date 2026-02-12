import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export interface CashFlowEntry {
  id: string;
  date: string;
  type: 'inflow' | 'outflow';
  category: CashFlowCategory;
  description: string;
  amount: number;
  is_recurring: boolean;
  recurrence_type?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  source?: string;
}

export type CashFlowCategory =
  | 'revenue' | 'receivables' | 'other_income'
  | 'personnel' | 'rent' | 'utilities' | 'materials' | 'services'
  | 'taxes' | 'insurance' | 'loans' | 'investments' | 'other_expenses';

export interface CashFlowPeriod {
  start_date: string;
  end_date: string;
  opening_balance: number;
  closing_balance: number;
  total_inflows: number;
  total_outflows: number;
  net_cash_flow: number;
  entries: CashFlowEntry[];
}

export interface CashFlowForecast {
  periods: ForecastPeriod[];
  scenarios: ForecastScenario[];
}

export interface ForecastPeriod {
  month: string;
  year: number;
  projected_inflows: number;
  projected_outflows: number;
  projected_balance: number;
  confidence: number;
}

export interface ForecastScenario {
  name: 'optimistic' | 'realistic' | 'pessimistic';
  adjustmentFactor: number;
  projected_balance_6m: number;
  projected_balance_12m: number;
}

export interface LiquidityAlert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  date: string;
  projected_shortfall?: number;
}

const CASH_FLOW_STORAGE_KEY = 'fintutto_cash_flow_entries';
const CASH_FLOW_SETTINGS_KEY = 'fintutto_cash_flow_settings';

export function useCashFlowAnalysis() {
  const { currentCompany } = useCompany();
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [currentBalance, setCurrentBalance] = useState(50000);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    if (!currentCompany) return;

    const stored = localStorage.getItem(`${CASH_FLOW_STORAGE_KEY}_${currentCompany.id}`);
    const storedSettings = localStorage.getItem(`${CASH_FLOW_SETTINGS_KEY}_${currentCompany.id}`);

    if (stored) {
      try { setEntries(JSON.parse(stored)); } catch { setEntries(generateDemoEntries()); }
    } else {
      setEntries(generateDemoEntries());
    }

    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        setCurrentBalance(settings.currentBalance || 50000);
      } catch { /* use defaults */ }
    }

    setLoading(false);
  }, [currentCompany]);

  // Save entries
  const saveEntries = useCallback((list: CashFlowEntry[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${CASH_FLOW_STORAGE_KEY}_${currentCompany.id}`, JSON.stringify(list));
    setEntries(list);
  }, [currentCompany]);

  // Save settings
  const saveSettings = useCallback((balance: number) => {
    if (!currentCompany) return;
    localStorage.setItem(`${CASH_FLOW_SETTINGS_KEY}_${currentCompany.id}`, JSON.stringify({ currentBalance: balance }));
    setCurrentBalance(balance);
  }, [currentCompany]);

  // Add entry
  const addEntry = useCallback((data: Omit<CashFlowEntry, 'id'>) => {
    const newEntry: CashFlowEntry = {
      id: `cf-${Date.now()}`,
      ...data,
    };
    saveEntries([newEntry, ...entries]);
    return newEntry;
  }, [entries, saveEntries]);

  // Update entry
  const updateEntry = useCallback((id: string, data: Partial<CashFlowEntry>) => {
    const updated = entries.map(e => e.id === id ? { ...e, ...data } : e);
    saveEntries(updated);
  }, [entries, saveEntries]);

  // Delete entry
  const deleteEntry = useCallback((id: string) => {
    const filtered = entries.filter(e => e.id !== id);
    saveEntries(filtered);
  }, [entries, saveEntries]);

  // Get entries for a period
  const getEntriesForPeriod = useCallback((startDate: string, endDate: string): CashFlowEntry[] => {
    return entries.filter(e => e.date >= startDate && e.date <= endDate);
  }, [entries]);

  // Calculate cash flow for a period
  const calculatePeriod = useCallback((startDate: string, endDate: string, openingBalance: number): CashFlowPeriod => {
    const periodEntries = getEntriesForPeriod(startDate, endDate);

    const inflows = periodEntries.filter(e => e.type === 'inflow');
    const outflows = periodEntries.filter(e => e.type === 'outflow');

    const totalInflows = inflows.reduce((sum, e) => sum + e.amount, 0);
    const totalOutflows = outflows.reduce((sum, e) => sum + e.amount, 0);
    const netCashFlow = totalInflows - totalOutflows;

    return {
      start_date: startDate,
      end_date: endDate,
      opening_balance: openingBalance,
      closing_balance: openingBalance + netCashFlow,
      total_inflows: totalInflows,
      total_outflows: totalOutflows,
      net_cash_flow: netCashFlow,
      entries: periodEntries,
    };
  }, [getEntriesForPeriod]);

  // Get monthly breakdown
  const getMonthlyBreakdown = useCallback((months: number = 12): CashFlowPeriod[] => {
    const periods: CashFlowPeriod[] = [];
    let balance = currentBalance;
    const today = new Date();

    for (let i = 0; i < months; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i), 1);
      const startDate = date.toISOString().split('T')[0];
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

      const period = calculatePeriod(startDate, endDate, balance);
      periods.push(period);
      balance = period.closing_balance;
    }

    return periods;
  }, [currentBalance, calculatePeriod]);

  // Generate forecast
  const generateForecast = useCallback((months: number = 12): CashFlowForecast => {
    const periods: ForecastPeriod[] = [];
    let balance = currentBalance;
    const today = new Date();

    // Calculate average monthly flows from historical data
    const historical = getMonthlyBreakdown(6);
    const avgInflow = historical.reduce((sum, p) => sum + p.total_inflows, 0) / Math.max(historical.length, 1);
    const avgOutflow = historical.reduce((sum, p) => sum + p.total_outflows, 0) / Math.max(historical.length, 1);

    // Get recurring entries for projection
    const recurringEntries = entries.filter(e => e.is_recurring);
    const monthlyRecurringInflow = recurringEntries
      .filter(e => e.type === 'inflow')
      .reduce((sum, e) => sum + getMonthlyAmount(e), 0);
    const monthlyRecurringOutflow = recurringEntries
      .filter(e => e.type === 'outflow')
      .reduce((sum, e) => sum + getMonthlyAmount(e), 0);

    // Blend historical average with recurring for projection
    const projectedInflow = (avgInflow * 0.3) + (monthlyRecurringInflow * 0.7) || avgInflow || 15000;
    const projectedOutflow = (avgOutflow * 0.3) + (monthlyRecurringOutflow * 0.7) || avgOutflow || 12000;

    for (let i = 1; i <= months; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = date.toLocaleDateString('de-DE', { month: 'short' });

      // Add some variance
      const variance = 1 + (Math.random() - 0.5) * 0.2;
      const inflow = projectedInflow * variance;
      const outflow = projectedOutflow * variance;

      balance += inflow - outflow;

      periods.push({
        month: monthName,
        year: date.getFullYear(),
        projected_inflows: Math.round(inflow),
        projected_outflows: Math.round(outflow),
        projected_balance: Math.round(balance),
        confidence: Math.max(0.5, 1 - (i * 0.04)), // Confidence decreases over time
      });
    }

    // Calculate scenarios
    const scenarios: ForecastScenario[] = [
      {
        name: 'optimistic',
        adjustmentFactor: 1.15,
        projected_balance_6m: Math.round(currentBalance + (projectedInflow * 1.15 - projectedOutflow * 0.9) * 6),
        projected_balance_12m: Math.round(currentBalance + (projectedInflow * 1.15 - projectedOutflow * 0.9) * 12),
      },
      {
        name: 'realistic',
        adjustmentFactor: 1.0,
        projected_balance_6m: periods[5]?.projected_balance || currentBalance,
        projected_balance_12m: periods[11]?.projected_balance || currentBalance,
      },
      {
        name: 'pessimistic',
        adjustmentFactor: 0.85,
        projected_balance_6m: Math.round(currentBalance + (projectedInflow * 0.85 - projectedOutflow * 1.1) * 6),
        projected_balance_12m: Math.round(currentBalance + (projectedInflow * 0.85 - projectedOutflow * 1.1) * 12),
      },
    ];

    return { periods, scenarios };
  }, [currentBalance, entries, getMonthlyBreakdown]);

  // Get liquidity alerts
  const getLiquidityAlerts = useCallback((): LiquidityAlert[] => {
    const alerts: LiquidityAlert[] = [];
    const forecast = generateForecast(6);
    const minBalance = 5000; // Minimum liquidity threshold

    forecast.periods.forEach((period, index) => {
      if (period.projected_balance < 0) {
        alerts.push({
          id: `alert-${index}`,
          type: 'critical',
          message: `Liquiditätsengpass erwartet in ${period.month} ${period.year}`,
          date: `${period.year}-${String(new Date().getMonth() + index + 2).padStart(2, '0')}-01`,
          projected_shortfall: Math.abs(period.projected_balance),
        });
      } else if (period.projected_balance < minBalance) {
        alerts.push({
          id: `alert-${index}`,
          type: 'warning',
          message: `Niedriger Kontostand erwartet in ${period.month} ${period.year}`,
          date: `${period.year}-${String(new Date().getMonth() + index + 2).padStart(2, '0')}-01`,
          projected_shortfall: minBalance - period.projected_balance,
        });
      }
    });

    return alerts;
  }, [generateForecast]);

  // Get category summary
  const getCategorySummary = useCallback((startDate: string, endDate: string) => {
    const periodEntries = getEntriesForPeriod(startDate, endDate);
    const summary: Record<CashFlowCategory, { inflow: number; outflow: number }> = {} as any;

    const categories: CashFlowCategory[] = [
      'revenue', 'receivables', 'other_income',
      'personnel', 'rent', 'utilities', 'materials', 'services',
      'taxes', 'insurance', 'loans', 'investments', 'other_expenses'
    ];

    categories.forEach(cat => {
      summary[cat] = { inflow: 0, outflow: 0 };
    });

    periodEntries.forEach(entry => {
      if (entry.type === 'inflow') {
        summary[entry.category].inflow += entry.amount;
      } else {
        summary[entry.category].outflow += entry.amount;
      }
    });

    return summary;
  }, [getEntriesForPeriod]);

  // Get statistics
  const getStats = useMemo(() => {
    const today = new Date();
    const thisMonth = today.toISOString().slice(0, 7);
    const startOfMonth = `${thisMonth}-01`;
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const monthEntries = entries.filter(e => e.date >= startOfMonth && e.date <= endOfMonth);
    const monthInflows = monthEntries.filter(e => e.type === 'inflow').reduce((sum, e) => sum + e.amount, 0);
    const monthOutflows = monthEntries.filter(e => e.type === 'outflow').reduce((sum, e) => sum + e.amount, 0);

    const recurringInflows = entries.filter(e => e.is_recurring && e.type === 'inflow');
    const recurringOutflows = entries.filter(e => e.is_recurring && e.type === 'outflow');

    return {
      currentBalance,
      monthInflows,
      monthOutflows,
      monthNetFlow: monthInflows - monthOutflows,
      recurringInflowCount: recurringInflows.length,
      recurringOutflowCount: recurringOutflows.length,
      totalEntries: entries.length,
    };
  }, [currentBalance, entries]);

  return {
    entries,
    currentBalance,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    setCurrentBalance: saveSettings,
    getEntriesForPeriod,
    calculatePeriod,
    getMonthlyBreakdown,
    generateForecast,
    getLiquidityAlerts,
    getCategorySummary,
    stats: getStats,
  };
}

function getMonthlyAmount(entry: CashFlowEntry): number {
  switch (entry.recurrence_type) {
    case 'weekly': return entry.amount * 4.33;
    case 'monthly': return entry.amount;
    case 'quarterly': return entry.amount / 3;
    case 'yearly': return entry.amount / 12;
    default: return entry.amount;
  }
}

function generateDemoEntries(): CashFlowEntry[] {
  const entries: CashFlowEntry[] = [];
  const today = new Date();

  // Generate 6 months of historical data
  for (let m = 5; m >= 0; m--) {
    const month = new Date(today.getFullYear(), today.getMonth() - m, 1);

    // Revenue (main income)
    entries.push({
      id: `cf-rev-${m}`,
      date: new Date(month.getFullYear(), month.getMonth(), 5).toISOString().split('T')[0],
      type: 'inflow',
      category: 'revenue',
      description: 'Monatlicher Umsatz',
      amount: 25000 + Math.floor(Math.random() * 10000),
      is_recurring: true,
      recurrence_type: 'monthly',
      source: 'Kundenrechnungen',
    });

    // Personnel costs
    entries.push({
      id: `cf-pers-${m}`,
      date: new Date(month.getFullYear(), month.getMonth(), 28).toISOString().split('T')[0],
      type: 'outflow',
      category: 'personnel',
      description: 'Gehälter',
      amount: 15000 + Math.floor(Math.random() * 2000),
      is_recurring: true,
      recurrence_type: 'monthly',
    });

    // Rent
    entries.push({
      id: `cf-rent-${m}`,
      date: new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0],
      type: 'outflow',
      category: 'rent',
      description: 'Büromiete',
      amount: 2500,
      is_recurring: true,
      recurrence_type: 'monthly',
    });

    // Utilities
    entries.push({
      id: `cf-util-${m}`,
      date: new Date(month.getFullYear(), month.getMonth(), 15).toISOString().split('T')[0],
      type: 'outflow',
      category: 'utilities',
      description: 'Strom, Internet, Telefon',
      amount: 450 + Math.floor(Math.random() * 100),
      is_recurring: true,
      recurrence_type: 'monthly',
    });

    // Random additional entries
    if (Math.random() > 0.5) {
      entries.push({
        id: `cf-other-${m}-1`,
        date: new Date(month.getFullYear(), month.getMonth(), 10 + Math.floor(Math.random() * 10)).toISOString().split('T')[0],
        type: 'inflow',
        category: 'other_income',
        description: 'Sonstige Einnahmen',
        amount: 1000 + Math.floor(Math.random() * 3000),
        is_recurring: false,
      });
    }

    if (Math.random() > 0.3) {
      entries.push({
        id: `cf-mat-${m}`,
        date: new Date(month.getFullYear(), month.getMonth(), 8 + Math.floor(Math.random() * 15)).toISOString().split('T')[0],
        type: 'outflow',
        category: 'materials',
        description: 'Materialeinkauf',
        amount: 500 + Math.floor(Math.random() * 2000),
        is_recurring: false,
      });
    }
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export const CATEGORY_LABELS: Record<CashFlowCategory, string> = {
  revenue: 'Umsatzerlöse',
  receivables: 'Forderungen',
  other_income: 'Sonstige Einnahmen',
  personnel: 'Personalkosten',
  rent: 'Miete',
  utilities: 'Nebenkosten',
  materials: 'Material',
  services: 'Dienstleistungen',
  taxes: 'Steuern',
  insurance: 'Versicherungen',
  loans: 'Kredite',
  investments: 'Investitionen',
  other_expenses: 'Sonstige Ausgaben',
};

export const CATEGORY_COLORS: Record<CashFlowCategory, string> = {
  revenue: '#22c55e',
  receivables: '#84cc16',
  other_income: '#a3e635',
  personnel: '#ef4444',
  rent: '#f97316',
  utilities: '#fb923c',
  materials: '#f59e0b',
  services: '#eab308',
  taxes: '#dc2626',
  insurance: '#ea580c',
  loans: '#c2410c',
  investments: '#9a3412',
  other_expenses: '#78716c',
};
