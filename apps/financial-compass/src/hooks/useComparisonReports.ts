import { useState, useCallback, useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export type ComparisonType = 'year' | 'quarter' | 'month';
export type MetricType = 'revenue' | 'expenses' | 'profit' | 'assets' | 'liabilities' | 'equity';

export interface PeriodData {
  period: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
  assets: number;
  liabilities: number;
  equity: number;
  transactions: number;
  invoices: number;
  customers: number;
}

export interface ComparisonResult {
  period1: PeriodData;
  period2: PeriodData;
  changes: ChangeMetrics;
  trends: TrendAnalysis[];
}

export interface ChangeMetrics {
  revenue: { absolute: number; percent: number; direction: 'up' | 'down' | 'stable' };
  expenses: { absolute: number; percent: number; direction: 'up' | 'down' | 'stable' };
  profit: { absolute: number; percent: number; direction: 'up' | 'down' | 'stable' };
  assets: { absolute: number; percent: number; direction: 'up' | 'down' | 'stable' };
  liabilities: { absolute: number; percent: number; direction: 'up' | 'down' | 'stable' };
  equity: { absolute: number; percent: number; direction: 'up' | 'down' | 'stable' };
  transactions: { absolute: number; percent: number; direction: 'up' | 'down' | 'stable' };
  invoices: { absolute: number; percent: number; direction: 'up' | 'down' | 'stable' };
  customers: { absolute: number; percent: number; direction: 'up' | 'down' | 'stable' };
}

export interface TrendAnalysis {
  metric: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface AccountComparison {
  accountNumber: string;
  accountName: string;
  period1Amount: number;
  period2Amount: number;
  change: number;
  changePercent: number;
}

export function useComparisonReports() {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(false);

  // Generate demo data for a period
  const generatePeriodData = useCallback((period: string, label: string, seed: number = 0): PeriodData => {
    // Use seed for reproducible "random" data
    const random = (min: number, max: number) => {
      const x = Math.sin(seed++) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    };

    const baseRevenue = 250000 + random(-50000, 100000);
    const baseExpenses = 180000 + random(-30000, 50000);

    return {
      period,
      label,
      revenue: Math.round(baseRevenue),
      expenses: Math.round(baseExpenses),
      profit: Math.round(baseRevenue - baseExpenses),
      assets: Math.round(500000 + random(-100000, 200000)),
      liabilities: Math.round(200000 + random(-50000, 100000)),
      equity: Math.round(300000 + random(-50000, 100000)),
      transactions: Math.round(150 + random(-30, 50)),
      invoices: Math.round(45 + random(-10, 20)),
      customers: Math.round(25 + random(-5, 10)),
    };
  }, []);

  // Compare two periods
  const comparePeriods = useCallback((period1: string, period2: string, type: ComparisonType): ComparisonResult => {
    setLoading(true);

    const label1 = formatPeriodLabel(period1, type);
    const label2 = formatPeriodLabel(period2, type);

    // Generate data with different seeds for different periods
    const data1 = generatePeriodData(period1, label1, hashCode(period1));
    const data2 = generatePeriodData(period2, label2, hashCode(period2));

    const calculateChange = (v1: number, v2: number) => {
      const absolute = v2 - v1;
      const percent = v1 !== 0 ? ((v2 - v1) / Math.abs(v1)) * 100 : 0;
      const direction: 'up' | 'down' | 'stable' = absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'stable';
      return { absolute, percent: Math.round(percent * 10) / 10, direction };
    };

    const changes: ChangeMetrics = {
      revenue: calculateChange(data1.revenue, data2.revenue),
      expenses: calculateChange(data1.expenses, data2.expenses),
      profit: calculateChange(data1.profit, data2.profit),
      assets: calculateChange(data1.assets, data2.assets),
      liabilities: calculateChange(data1.liabilities, data2.liabilities),
      equity: calculateChange(data1.equity, data2.equity),
      transactions: calculateChange(data1.transactions, data2.transactions),
      invoices: calculateChange(data1.invoices, data2.invoices),
      customers: calculateChange(data1.customers, data2.customers),
    };

    // Generate trend analysis
    const trends: TrendAnalysis[] = [];

    if (changes.revenue.percent > 10) {
      trends.push({
        metric: 'Umsatz',
        description: `Umsatzsteigerung von ${changes.revenue.percent.toFixed(1)}%`,
        significance: changes.revenue.percent > 20 ? 'high' : 'medium',
        recommendation: 'Erfolgreiche Vertriebsstrategie fortsetzen',
      });
    } else if (changes.revenue.percent < -10) {
      trends.push({
        metric: 'Umsatz',
        description: `Umsatzrückgang von ${Math.abs(changes.revenue.percent).toFixed(1)}%`,
        significance: changes.revenue.percent < -20 ? 'high' : 'medium',
        recommendation: 'Vertriebsmaßnahmen überprüfen und anpassen',
      });
    }

    if (changes.expenses.percent > 15) {
      trends.push({
        metric: 'Ausgaben',
        description: `Kostensteigerung von ${changes.expenses.percent.toFixed(1)}%`,
        significance: 'high',
        recommendation: 'Kostenstruktur analysieren und Einsparpotenziale identifizieren',
      });
    }

    if (changes.profit.direction === 'down' && changes.profit.percent < -20) {
      trends.push({
        metric: 'Gewinn',
        description: `Signifikanter Gewinnrückgang von ${Math.abs(changes.profit.percent).toFixed(1)}%`,
        significance: 'high',
        recommendation: 'Dringende Maßnahmen zur Ergebnisverbesserung erforderlich',
      });
    } else if (changes.profit.direction === 'up' && changes.profit.percent > 20) {
      trends.push({
        metric: 'Gewinn',
        description: `Starke Gewinnsteigerung von ${changes.profit.percent.toFixed(1)}%`,
        significance: 'high',
        recommendation: 'Positive Entwicklung dokumentieren und Erfolgsfaktoren sichern',
      });
    }

    if (changes.customers.direction === 'up' && changes.customers.percent > 10) {
      trends.push({
        metric: 'Kunden',
        description: `Kundenwachstum von ${changes.customers.percent.toFixed(1)}%`,
        significance: 'medium',
      });
    }

    setLoading(false);

    return {
      period1: data1,
      period2: data2,
      changes,
      trends,
    };
  }, [generatePeriodData]);

  // Get monthly trends for a year
  const getMonthlyTrends = useCallback((year: number): MonthlyTrend[] => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      const date = new Date(year, m, 1);
      const monthName = date.toLocaleDateString('de-DE', { month: 'short' });
      const seed = hashCode(`${year}-${m}`);

      const random = (min: number, max: number) => {
        const x = Math.sin(seed + m) * 10000;
        return min + (x - Math.floor(x)) * (max - min);
      };

      // Add seasonal variation
      const seasonFactor = 1 + Math.sin((m - 3) * Math.PI / 6) * 0.2;
      const baseRevenue = (20000 + random(-5000, 8000)) * seasonFactor;
      const baseExpenses = (15000 + random(-3000, 5000)) * seasonFactor;

      months.push({
        month: monthName,
        year,
        revenue: Math.round(baseRevenue),
        expenses: Math.round(baseExpenses),
        profit: Math.round(baseRevenue - baseExpenses),
      });
    }
    return months;
  }, []);

  // Get account comparisons
  const getAccountComparisons = useCallback((period1: string, period2: string): AccountComparison[] => {
    const accounts = [
      { number: '1000', name: 'Kasse' },
      { number: '1200', name: 'Bank' },
      { number: '1400', name: 'Forderungen' },
      { number: '1600', name: 'Vorräte' },
      { number: '4000', name: 'Umsatzerlöse' },
      { number: '4400', name: 'Sonstige Erlöse' },
      { number: '6000', name: 'Aufwendungen für Waren' },
      { number: '6300', name: 'Personalaufwand' },
      { number: '6800', name: 'Abschreibungen' },
      { number: '7000', name: 'Sonstige Aufwendungen' },
    ];

    const seed1 = hashCode(period1);
    const seed2 = hashCode(period2);

    return accounts.map((acc, i) => {
      const v1 = 5000 + Math.abs(Math.sin(seed1 + i) * 50000);
      const v2 = 5000 + Math.abs(Math.sin(seed2 + i) * 50000);
      const change = v2 - v1;
      const changePercent = v1 !== 0 ? ((v2 - v1) / v1) * 100 : 0;

      return {
        accountNumber: acc.number,
        accountName: acc.name,
        period1Amount: Math.round(v1),
        period2Amount: Math.round(v2),
        change: Math.round(change),
        changePercent: Math.round(changePercent * 10) / 10,
      };
    });
  }, []);

  // Get available periods
  const getAvailablePeriods = useCallback((type: ComparisonType) => {
    const periods: { value: string; label: string }[] = [];
    const now = new Date();

    if (type === 'year') {
      for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) {
        periods.push({ value: y.toString(), label: y.toString() });
      }
    } else if (type === 'quarter') {
      for (let y = now.getFullYear(); y >= now.getFullYear() - 2; y--) {
        for (let q = 4; q >= 1; q--) {
          if (y === now.getFullYear() && q > Math.ceil((now.getMonth() + 1) / 3)) continue;
          periods.push({ value: `${y}-Q${q}`, label: `Q${q} ${y}` });
        }
      }
    } else {
      for (let i = 0; i < 24; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = date.toISOString().slice(0, 7);
        const label = date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
        periods.push({ value, label });
      }
    }

    return periods;
  }, []);

  // Get key insights
  const getKeyInsights = useCallback((comparison: ComparisonResult) => {
    const insights: string[] = [];

    const profitMargin1 = (comparison.period1.profit / comparison.period1.revenue) * 100;
    const profitMargin2 = (comparison.period2.profit / comparison.period2.revenue) * 100;

    if (profitMargin2 > profitMargin1) {
      insights.push(`Die Gewinnmarge hat sich von ${profitMargin1.toFixed(1)}% auf ${profitMargin2.toFixed(1)}% verbessert.`);
    } else if (profitMargin2 < profitMargin1) {
      insights.push(`Die Gewinnmarge ist von ${profitMargin1.toFixed(1)}% auf ${profitMargin2.toFixed(1)}% gesunken.`);
    }

    const expenseRatio1 = (comparison.period1.expenses / comparison.period1.revenue) * 100;
    const expenseRatio2 = (comparison.period2.expenses / comparison.period2.revenue) * 100;

    if (expenseRatio2 < expenseRatio1 - 2) {
      insights.push(`Die Kostenquote wurde um ${(expenseRatio1 - expenseRatio2).toFixed(1)} Prozentpunkte gesenkt.`);
    } else if (expenseRatio2 > expenseRatio1 + 2) {
      insights.push(`Die Kostenquote ist um ${(expenseRatio2 - expenseRatio1).toFixed(1)} Prozentpunkte gestiegen.`);
    }

    const revenuePerCustomer1 = comparison.period1.revenue / comparison.period1.customers;
    const revenuePerCustomer2 = comparison.period2.revenue / comparison.period2.customers;

    if (revenuePerCustomer2 > revenuePerCustomer1 * 1.1) {
      insights.push(`Der Umsatz pro Kunde ist um ${(((revenuePerCustomer2 / revenuePerCustomer1) - 1) * 100).toFixed(0)}% gestiegen.`);
    }

    return insights;
  }, []);

  return {
    loading,
    comparePeriods,
    getMonthlyTrends,
    getAccountComparisons,
    getAvailablePeriods,
    getKeyInsights,
  };
}

function formatPeriodLabel(period: string, type: ComparisonType): string {
  if (type === 'year') {
    return period;
  } else if (type === 'quarter') {
    return period.replace('-', ' ');
  } else {
    const date = new Date(period + '-01');
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
