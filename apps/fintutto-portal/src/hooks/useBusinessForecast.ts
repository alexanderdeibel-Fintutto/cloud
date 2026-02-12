import { useState, useCallback, useMemo, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export type ForecastHorizon = '3m' | '6m' | '12m' | '24m';
export type GrowthScenario = 'conservative' | 'moderate' | 'aggressive';

export interface ForecastConfig {
  horizon: ForecastHorizon;
  scenario: GrowthScenario;
  includeSeasonality: boolean;
  customGrowthRate?: number;
}

export interface MonthlyForecast {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  customers: number;
  invoices: number;
  cashBalance: number;
  confidence: number;
}

export interface YearlyForecast {
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  growth: number;
  profitMargin: number;
}

export interface ForecastSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  avgMonthlyRevenue: number;
  avgProfitMargin: number;
  peakMonth: { month: string; revenue: number };
  lowMonth: { month: string; revenue: number };
  breakEvenMonth?: string;
  endingCashBalance: number;
}

export interface ScenarioComparison {
  scenario: GrowthScenario;
  label: string;
  color: string;
  revenue12m: number;
  profit12m: number;
  growth: number;
  risk: 'low' | 'medium' | 'high';
}

export interface GrowthDriver {
  name: string;
  impact: number;
  description: string;
  controllable: boolean;
}

export interface ForecastAssumption {
  id: string;
  name: string;
  value: number;
  unit: string;
  editable: boolean;
}

const FORECAST_SETTINGS_KEY = 'fintutto_forecast_settings';

export function useBusinessForecast() {
  const { currentCompany } = useCompany();
  const [config, setConfig] = useState<ForecastConfig>({
    horizon: '12m',
    scenario: 'moderate',
    includeSeasonality: true,
  });
  const [assumptions, setAssumptions] = useState<ForecastAssumption[]>(getDefaultAssumptions());
  const [loading, setLoading] = useState(false);

  // Load settings
  useEffect(() => {
    if (!currentCompany) return;
    const stored = localStorage.getItem(`${FORECAST_SETTINGS_KEY}_${currentCompany.id}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setConfig(data.config || config);
        setAssumptions(data.assumptions || getDefaultAssumptions());
      } catch { /* use defaults */ }
    }
  }, [currentCompany]);

  // Save settings
  const saveSettings = useCallback(() => {
    if (!currentCompany) return;
    localStorage.setItem(`${FORECAST_SETTINGS_KEY}_${currentCompany.id}`, JSON.stringify({ config, assumptions }));
  }, [currentCompany, config, assumptions]);

  // Update config
  const updateConfig = useCallback((updates: Partial<ForecastConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Update assumption
  const updateAssumption = useCallback((id: string, value: number) => {
    setAssumptions(prev => prev.map(a => a.id === id ? { ...a, value } : a));
  }, []);

  // Get scenario parameters
  const getScenarioParams = useCallback((scenario: GrowthScenario) => {
    switch (scenario) {
      case 'conservative':
        return { growthRate: 0.03, expenseGrowth: 0.02, volatility: 0.05 };
      case 'moderate':
        return { growthRate: 0.08, expenseGrowth: 0.05, volatility: 0.10 };
      case 'aggressive':
        return { growthRate: 0.15, expenseGrowth: 0.08, volatility: 0.20 };
    }
  }, []);

  // Generate monthly forecast
  const generateMonthlyForecast = useCallback((customConfig?: Partial<ForecastConfig>): MonthlyForecast[] => {
    const effectiveConfig = { ...config, ...customConfig };
    const params = getScenarioParams(effectiveConfig.scenario);
    const horizonMonths = parseInt(effectiveConfig.horizon.replace('m', ''));

    const forecasts: MonthlyForecast[] = [];
    const today = new Date();

    // Base values (simulated historical data)
    let baseRevenue = 25000;
    let baseExpenses = 18000;
    let baseCustomers = 30;
    let cashBalance = 50000;

    // Get custom growth rate if set
    const monthlyGrowth = effectiveConfig.customGrowthRate
      ? effectiveConfig.customGrowthRate / 100 / 12
      : params.growthRate / 12;

    for (let i = 1; i <= horizonMonths; i++) {
      const forecastDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = forecastDate.toLocaleDateString('de-DE', { month: 'short' });
      const month = forecastDate.getMonth();

      // Seasonal factors (German business patterns)
      let seasonalFactor = 1;
      if (effectiveConfig.includeSeasonality) {
        // Higher in Q4 (Christmas), lower in summer
        const seasonality = [0.9, 0.95, 1.0, 1.05, 1.0, 0.85, 0.8, 0.85, 1.0, 1.05, 1.15, 1.2];
        seasonalFactor = seasonality[month];
      }

      // Apply growth with some variance
      const variance = 1 + (Math.random() - 0.5) * params.volatility;
      const revenue = baseRevenue * (1 + monthlyGrowth * i) * seasonalFactor * variance;
      const expenses = baseExpenses * (1 + params.expenseGrowth / 12 * i) * (0.95 + Math.random() * 0.1);
      const profit = revenue - expenses;

      // Customer and invoice projections
      const customers = Math.round(baseCustomers * (1 + monthlyGrowth * i * 0.8));
      const invoices = Math.round(customers * (1.5 + Math.random() * 0.5));

      // Cash balance
      cashBalance += profit;

      // Confidence decreases over time
      const confidence = Math.max(0.4, 1 - (i / horizonMonths) * 0.5);

      forecasts.push({
        month: monthName,
        year: forecastDate.getFullYear(),
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        profit: Math.round(profit),
        customers,
        invoices,
        cashBalance: Math.round(cashBalance),
        confidence,
      });
    }

    return forecasts;
  }, [config, getScenarioParams]);

  // Generate yearly forecast
  const generateYearlyForecast = useCallback((years: number = 3): YearlyForecast[] => {
    const forecasts: YearlyForecast[] = [];
    const today = new Date();
    const params = getScenarioParams(config.scenario);

    let baseRevenue = 300000;
    let baseExpenses = 220000;

    for (let i = 0; i < years; i++) {
      const year = today.getFullYear() + i;
      const growth = i === 0 ? 0 : params.growthRate;
      const revenue = Math.round(baseRevenue * Math.pow(1 + params.growthRate, i));
      const expenses = Math.round(baseExpenses * Math.pow(1 + params.expenseGrowth, i));
      const profit = revenue - expenses;

      forecasts.push({
        year,
        revenue,
        expenses,
        profit,
        growth: i === 0 ? 0 : params.growthRate * 100,
        profitMargin: Math.round((profit / revenue) * 100 * 10) / 10,
      });
    }

    return forecasts;
  }, [config.scenario, getScenarioParams]);

  // Get forecast summary
  const getForecastSummary = useCallback((forecasts: MonthlyForecast[]): ForecastSummary => {
    if (forecasts.length === 0) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        totalProfit: 0,
        avgMonthlyRevenue: 0,
        avgProfitMargin: 0,
        peakMonth: { month: '-', revenue: 0 },
        lowMonth: { month: '-', revenue: 0 },
        endingCashBalance: 0,
      };
    }

    const totalRevenue = forecasts.reduce((sum, f) => sum + f.revenue, 0);
    const totalExpenses = forecasts.reduce((sum, f) => sum + f.expenses, 0);
    const totalProfit = forecasts.reduce((sum, f) => sum + f.profit, 0);

    const peakForecast = forecasts.reduce((max, f) => f.revenue > max.revenue ? f : max);
    const lowForecast = forecasts.reduce((min, f) => f.revenue < min.revenue ? f : min);

    const breakEvenForecast = forecasts.find((f, i) =>
      i > 0 && forecasts[i - 1].cashBalance < 0 && f.cashBalance >= 0
    );

    return {
      totalRevenue,
      totalExpenses,
      totalProfit,
      avgMonthlyRevenue: Math.round(totalRevenue / forecasts.length),
      avgProfitMargin: Math.round((totalProfit / totalRevenue) * 100 * 10) / 10,
      peakMonth: { month: `${peakForecast.month} ${peakForecast.year}`, revenue: peakForecast.revenue },
      lowMonth: { month: `${lowForecast.month} ${lowForecast.year}`, revenue: lowForecast.revenue },
      breakEvenMonth: breakEvenForecast ? `${breakEvenForecast.month} ${breakEvenForecast.year}` : undefined,
      endingCashBalance: forecasts[forecasts.length - 1].cashBalance,
    };
  }, []);

  // Compare scenarios
  const compareScenarios = useCallback((): ScenarioComparison[] => {
    const scenarios: GrowthScenario[] = ['conservative', 'moderate', 'aggressive'];

    return scenarios.map(scenario => {
      const forecasts = generateMonthlyForecast({ horizon: '12m', scenario });
      const summary = getForecastSummary(forecasts);
      const params = getScenarioParams(scenario);

      return {
        scenario,
        label: scenario === 'conservative' ? 'Konservativ' :
          scenario === 'moderate' ? 'Moderat' : 'Aggressiv',
        color: scenario === 'conservative' ? '#94a3b8' :
          scenario === 'moderate' ? '#3b82f6' : '#22c55e',
        revenue12m: summary.totalRevenue,
        profit12m: summary.totalProfit,
        growth: params.growthRate * 100,
        risk: scenario === 'conservative' ? 'low' :
          scenario === 'moderate' ? 'medium' : 'high',
      };
    });
  }, [generateMonthlyForecast, getForecastSummary, getScenarioParams]);

  // Get growth drivers
  const getGrowthDrivers = useCallback((): GrowthDriver[] => {
    return [
      {
        name: 'Neukundenakquise',
        impact: 35,
        description: 'Gewinnung neuer Kunden durch Marketing und Vertrieb',
        controllable: true,
      },
      {
        name: 'Bestandskundenwachstum',
        impact: 25,
        description: 'Umsatzsteigerung bei bestehenden Kunden',
        controllable: true,
      },
      {
        name: 'Preisanpassungen',
        impact: 15,
        description: 'Jährliche Preiserhöhungen',
        controllable: true,
      },
      {
        name: 'Marktentwicklung',
        impact: 15,
        description: 'Allgemeines Marktwachstum',
        controllable: false,
      },
      {
        name: 'Neue Produkte/Services',
        impact: 10,
        description: 'Umsatz aus neuen Angeboten',
        controllable: true,
      },
    ];
  }, []);

  // Calculate what-if scenarios
  const calculateWhatIf = useCallback((changes: { revenueChange?: number; expenseChange?: number; customerGrowth?: number }) => {
    const baseForecasts = generateMonthlyForecast();
    const modifiedForecasts = baseForecasts.map(f => ({
      ...f,
      revenue: Math.round(f.revenue * (1 + (changes.revenueChange || 0) / 100)),
      expenses: Math.round(f.expenses * (1 + (changes.expenseChange || 0) / 100)),
      customers: Math.round(f.customers * (1 + (changes.customerGrowth || 0) / 100)),
    }));

    modifiedForecasts.forEach(f => {
      f.profit = f.revenue - f.expenses;
    });

    // Recalculate cash balance
    let cash = 50000;
    modifiedForecasts.forEach(f => {
      cash += f.profit;
      f.cashBalance = Math.round(cash);
    });

    return {
      base: getForecastSummary(baseForecasts),
      modified: getForecastSummary(modifiedForecasts),
      forecasts: modifiedForecasts,
    };
  }, [generateMonthlyForecast, getForecastSummary]);

  // Get risk factors
  const getRiskFactors = useCallback(() => {
    const forecasts = generateMonthlyForecast();
    const risks: { factor: string; probability: number; impact: number; mitigation: string }[] = [];

    // Check for negative cash flow months
    const negativeCashMonths = forecasts.filter(f => f.profit < 0).length;
    if (negativeCashMonths > 0) {
      risks.push({
        factor: 'Negative Monate',
        probability: (negativeCashMonths / forecasts.length) * 100,
        impact: 70,
        mitigation: 'Kostenstruktur überprüfen, Einnahmen diversifizieren',
      });
    }

    // Check for seasonal volatility
    const revenues = forecasts.map(f => f.revenue);
    const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const volatility = Math.sqrt(revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) / revenues.length) / avgRevenue;

    if (volatility > 0.15) {
      risks.push({
        factor: 'Hohe Saisonalität',
        probability: 80,
        impact: 40,
        mitigation: 'Rücklagen für schwache Monate bilden',
      });
    }

    // Market dependency
    risks.push({
      factor: 'Marktabhängigkeit',
      probability: 50,
      impact: 60,
      mitigation: 'Kundenbasis diversifizieren',
    });

    return risks;
  }, [generateMonthlyForecast]);

  return {
    config,
    assumptions,
    loading,
    updateConfig,
    updateAssumption,
    saveSettings,
    generateMonthlyForecast,
    generateYearlyForecast,
    getForecastSummary,
    compareScenarios,
    getGrowthDrivers,
    calculateWhatIf,
    getRiskFactors,
  };
}

function getDefaultAssumptions(): ForecastAssumption[] {
  return [
    { id: 'base_revenue', name: 'Basis-Monatsumsatz', value: 25000, unit: 'EUR', editable: true },
    { id: 'base_expenses', name: 'Basis-Monatsausgaben', value: 18000, unit: 'EUR', editable: true },
    { id: 'customer_count', name: 'Aktuelle Kundenzahl', value: 30, unit: '', editable: true },
    { id: 'avg_order_value', name: 'Durchschnittlicher Auftragswert', value: 850, unit: 'EUR', editable: true },
    { id: 'churn_rate', name: 'Kundenabwanderung', value: 5, unit: '%', editable: true },
    { id: 'conversion_rate', name: 'Konversionsrate', value: 15, unit: '%', editable: true },
  ];
}
