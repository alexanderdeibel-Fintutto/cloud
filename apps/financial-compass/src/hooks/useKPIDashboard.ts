import { useState, useCallback, useEffect, useMemo } from 'react';

export type KPICategory = 'profitability' | 'liquidity' | 'activity' | 'growth' | 'efficiency';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface KPIValue {
  current: number;
  previous: number;
  target?: number;
  unit: 'percent' | 'currency' | 'days' | 'ratio' | 'number';
}

export interface KPI {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: KPICategory;
  value: KPIValue;
  trend: TrendDirection;
  trendPercent: number;
  status: 'good' | 'warning' | 'critical';
  calculation: string;
  benchmark?: {
    industry: number;
    source: string;
  };
}

export interface KPIAlert {
  id: string;
  kpiId: string;
  kpiName: string;
  type: 'threshold' | 'trend' | 'target';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
  acknowledged: boolean;
}

export interface KPIDashboardSettings {
  refreshInterval: number; // minutes
  showBenchmarks: boolean;
  showTargets: boolean;
  alertThresholds: {
    profitMargin: { warning: number; critical: number };
    currentRatio: { warning: number; critical: number };
    dso: { warning: number; critical: number };
    quickRatio: { warning: number; critical: number };
  };
  favoriteKPIs: string[];
}

export interface FinancialData {
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  totalAssets: number;
  currentAssets: number;
  inventory: number;
  accountsReceivable: number;
  cash: number;
  totalLiabilities: number;
  currentLiabilities: number;
  accountsPayable: number;
  equity: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  previousPeriod?: Partial<FinancialData>;
}

const STORAGE_KEY = 'fintutto_kpi_dashboard';

// Default financial data (would come from actual accounting data)
const DEFAULT_FINANCIAL_DATA: FinancialData = {
  revenue: 1250000,
  grossProfit: 562500,
  operatingIncome: 187500,
  netIncome: 143750,
  totalAssets: 890000,
  currentAssets: 445000,
  inventory: 89000,
  accountsReceivable: 178000,
  cash: 156000,
  totalLiabilities: 356000,
  currentLiabilities: 178000,
  accountsPayable: 89000,
  equity: 534000,
  costOfGoodsSold: 687500,
  operatingExpenses: 375000,
  previousPeriod: {
    revenue: 1125000,
    grossProfit: 506250,
    operatingIncome: 168750,
    netIncome: 129375,
    totalAssets: 801000,
    currentAssets: 400500,
    inventory: 80100,
    accountsReceivable: 160200,
    cash: 140400,
    totalLiabilities: 320400,
    currentLiabilities: 160200,
    accountsPayable: 80100,
    equity: 480600,
    costOfGoodsSold: 618750,
    operatingExpenses: 337500,
  },
};

function calculateTrend(current: number, previous: number): { direction: TrendDirection; percent: number } {
  if (previous === 0) return { direction: 'stable', percent: 0 };
  const percent = ((current - previous) / Math.abs(previous)) * 100;
  return {
    direction: percent > 1 ? 'up' : percent < -1 ? 'down' : 'stable',
    percent: Math.round(percent * 10) / 10,
  };
}

function getStatus(
  value: number,
  thresholds: { warning: number; critical: number },
  higherIsBetter: boolean = true
): 'good' | 'warning' | 'critical' {
  if (higherIsBetter) {
    if (value >= thresholds.warning) return 'good';
    if (value >= thresholds.critical) return 'warning';
    return 'critical';
  } else {
    if (value <= thresholds.warning) return 'good';
    if (value <= thresholds.critical) return 'warning';
    return 'critical';
  }
}

export function useKPIDashboard() {
  const [financialData, setFinancialData] = useState<FinancialData>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_data`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_FINANCIAL_DATA;
  });

  const [settings, setSettings] = useState<KPIDashboardSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      refreshInterval: 60,
      showBenchmarks: true,
      showTargets: true,
      alertThresholds: {
        profitMargin: { warning: 10, critical: 5 },
        currentRatio: { warning: 1.5, critical: 1.0 },
        dso: { warning: 45, critical: 60 },
        quickRatio: { warning: 1.0, critical: 0.7 },
      },
      favoriteKPIs: ['gross-profit-margin', 'current-ratio', 'dso', 'roe'],
    };
  });

  const [alerts, setAlerts] = useState<KPIAlert[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_alerts`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_data`, JSON.stringify(financialData));
  }, [financialData]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
  }, [alerts]);

  // Calculate KPIs
  const kpis = useMemo((): KPI[] => {
    const d = financialData;
    const p = d.previousPeriod || {};

    const kpiList: KPI[] = [
      // Profitability KPIs
      {
        id: 'gross-profit-margin',
        name: 'Bruttogewinnmarge',
        nameEn: 'Gross Profit Margin',
        description: 'Verhältnis von Bruttogewinn zu Umsatz',
        category: 'profitability',
        value: {
          current: (d.grossProfit / d.revenue) * 100,
          previous: ((p.grossProfit || 0) / (p.revenue || 1)) * 100,
          target: 50,
          unit: 'percent',
        },
        calculation: 'Bruttogewinn / Umsatz × 100',
        benchmark: { industry: 45, source: 'Destatis 2024' },
      },
      {
        id: 'operating-margin',
        name: 'Operative Marge (EBIT-Marge)',
        nameEn: 'Operating Margin',
        description: 'Verhältnis von operativem Ergebnis zu Umsatz',
        category: 'profitability',
        value: {
          current: (d.operatingIncome / d.revenue) * 100,
          previous: ((p.operatingIncome || 0) / (p.revenue || 1)) * 100,
          target: 15,
          unit: 'percent',
        },
        calculation: 'Operatives Ergebnis / Umsatz × 100',
        benchmark: { industry: 12, source: 'Destatis 2024' },
      },
      {
        id: 'net-profit-margin',
        name: 'Nettogewinnmarge',
        nameEn: 'Net Profit Margin',
        description: 'Verhältnis von Nettogewinn zu Umsatz',
        category: 'profitability',
        value: {
          current: (d.netIncome / d.revenue) * 100,
          previous: ((p.netIncome || 0) / (p.revenue || 1)) * 100,
          target: 12,
          unit: 'percent',
        },
        calculation: 'Nettogewinn / Umsatz × 100',
        benchmark: { industry: 8, source: 'Destatis 2024' },
      },
      {
        id: 'roe',
        name: 'Eigenkapitalrendite (ROE)',
        nameEn: 'Return on Equity',
        description: 'Rendite des eingesetzten Eigenkapitals',
        category: 'profitability',
        value: {
          current: (d.netIncome / d.equity) * 100,
          previous: ((p.netIncome || 0) / (p.equity || 1)) * 100,
          target: 20,
          unit: 'percent',
        },
        calculation: 'Nettogewinn / Eigenkapital × 100',
        benchmark: { industry: 15, source: 'DAX-Durchschnitt' },
      },
      {
        id: 'roa',
        name: 'Gesamtkapitalrendite (ROA)',
        nameEn: 'Return on Assets',
        description: 'Rendite des Gesamtvermögens',
        category: 'profitability',
        value: {
          current: (d.netIncome / d.totalAssets) * 100,
          previous: ((p.netIncome || 0) / (p.totalAssets || 1)) * 100,
          target: 10,
          unit: 'percent',
        },
        calculation: 'Nettogewinn / Gesamtvermögen × 100',
        benchmark: { industry: 6, source: 'Destatis 2024' },
      },

      // Liquidity KPIs
      {
        id: 'current-ratio',
        name: 'Liquidität 3. Grades',
        nameEn: 'Current Ratio',
        description: 'Verhältnis von Umlaufvermögen zu kurzfristigen Verbindlichkeiten',
        category: 'liquidity',
        value: {
          current: d.currentAssets / d.currentLiabilities,
          previous: (p.currentAssets || 0) / (p.currentLiabilities || 1),
          target: 2.0,
          unit: 'ratio',
        },
        calculation: 'Umlaufvermögen / kurzfristige Verbindlichkeiten',
        benchmark: { industry: 1.8, source: 'Bundesbank' },
      },
      {
        id: 'quick-ratio',
        name: 'Liquidität 2. Grades',
        nameEn: 'Quick Ratio',
        description: 'Liquidität ohne Vorräte',
        category: 'liquidity',
        value: {
          current: (d.currentAssets - d.inventory) / d.currentLiabilities,
          previous: ((p.currentAssets || 0) - (p.inventory || 0)) / (p.currentLiabilities || 1),
          target: 1.2,
          unit: 'ratio',
        },
        calculation: '(Umlaufvermögen - Vorräte) / kurzfristige Verbindlichkeiten',
        benchmark: { industry: 1.0, source: 'Bundesbank' },
      },
      {
        id: 'cash-ratio',
        name: 'Liquidität 1. Grades',
        nameEn: 'Cash Ratio',
        description: 'Barliquidität',
        category: 'liquidity',
        value: {
          current: d.cash / d.currentLiabilities,
          previous: (p.cash || 0) / (p.currentLiabilities || 1),
          target: 0.3,
          unit: 'ratio',
        },
        calculation: 'Liquide Mittel / kurzfristige Verbindlichkeiten',
        benchmark: { industry: 0.2, source: 'Bundesbank' },
      },

      // Activity KPIs
      {
        id: 'dso',
        name: 'Debitorenlaufzeit (DSO)',
        nameEn: 'Days Sales Outstanding',
        description: 'Durchschnittliche Forderungslaufzeit in Tagen',
        category: 'activity',
        value: {
          current: (d.accountsReceivable / d.revenue) * 365,
          previous: ((p.accountsReceivable || 0) / (p.revenue || 1)) * 365,
          target: 30,
          unit: 'days',
        },
        calculation: 'Forderungen / Umsatz × 365',
        benchmark: { industry: 35, source: 'Creditreform' },
      },
      {
        id: 'dpo',
        name: 'Kreditorenlaufzeit (DPO)',
        nameEn: 'Days Payable Outstanding',
        description: 'Durchschnittliche Verbindlichkeitenlaufzeit in Tagen',
        category: 'activity',
        value: {
          current: (d.accountsPayable / d.costOfGoodsSold) * 365,
          previous: ((p.accountsPayable || 0) / (p.costOfGoodsSold || 1)) * 365,
          target: 45,
          unit: 'days',
        },
        calculation: 'Verbindlichkeiten / Wareneinsatz × 365',
        benchmark: { industry: 40, source: 'Creditreform' },
      },
      {
        id: 'inventory-turnover',
        name: 'Lagerumschlag',
        nameEn: 'Inventory Turnover',
        description: 'Wie oft wird das Lager pro Jahr umgeschlagen',
        category: 'activity',
        value: {
          current: d.costOfGoodsSold / d.inventory,
          previous: (p.costOfGoodsSold || 0) / (p.inventory || 1),
          target: 8,
          unit: 'ratio',
        },
        calculation: 'Wareneinsatz / Lagerbestand',
        benchmark: { industry: 6, source: 'Destatis 2024' },
      },
      {
        id: 'asset-turnover',
        name: 'Kapitalumschlag',
        nameEn: 'Asset Turnover',
        description: 'Effizienz der Vermögensnutzung',
        category: 'activity',
        value: {
          current: d.revenue / d.totalAssets,
          previous: (p.revenue || 0) / (p.totalAssets || 1),
          target: 1.5,
          unit: 'ratio',
        },
        calculation: 'Umsatz / Gesamtvermögen',
        benchmark: { industry: 1.2, source: 'Destatis 2024' },
      },

      // Growth KPIs
      {
        id: 'revenue-growth',
        name: 'Umsatzwachstum',
        nameEn: 'Revenue Growth',
        description: 'Umsatzveränderung zum Vorjahr',
        category: 'growth',
        value: {
          current: ((d.revenue - (p.revenue || d.revenue)) / (p.revenue || d.revenue)) * 100,
          previous: 0,
          target: 10,
          unit: 'percent',
        },
        calculation: '(Umsatz aktuell - Umsatz Vorjahr) / Umsatz Vorjahr × 100',
      },
      {
        id: 'profit-growth',
        name: 'Gewinnwachstum',
        nameEn: 'Profit Growth',
        description: 'Gewinnveränderung zum Vorjahr',
        category: 'growth',
        value: {
          current: ((d.netIncome - (p.netIncome || d.netIncome)) / (p.netIncome || d.netIncome)) * 100,
          previous: 0,
          target: 15,
          unit: 'percent',
        },
        calculation: '(Gewinn aktuell - Gewinn Vorjahr) / Gewinn Vorjahr × 100',
      },

      // Efficiency KPIs
      {
        id: 'debt-ratio',
        name: 'Verschuldungsgrad',
        nameEn: 'Debt Ratio',
        description: 'Anteil Fremdkapital am Gesamtkapital',
        category: 'efficiency',
        value: {
          current: (d.totalLiabilities / d.totalAssets) * 100,
          previous: ((p.totalLiabilities || 0) / (p.totalAssets || 1)) * 100,
          target: 40,
          unit: 'percent',
        },
        calculation: 'Fremdkapital / Gesamtkapital × 100',
        benchmark: { industry: 60, source: 'Bundesbank' },
      },
      {
        id: 'equity-ratio',
        name: 'Eigenkapitalquote',
        nameEn: 'Equity Ratio',
        description: 'Anteil Eigenkapital am Gesamtkapital',
        category: 'efficiency',
        value: {
          current: (d.equity / d.totalAssets) * 100,
          previous: ((p.equity || 0) / (p.totalAssets || 1)) * 100,
          target: 40,
          unit: 'percent',
        },
        calculation: 'Eigenkapital / Gesamtkapital × 100',
        benchmark: { industry: 35, source: 'Bundesbank' },
      },
      {
        id: 'operating-expense-ratio',
        name: 'Betriebskostenquote',
        nameEn: 'Operating Expense Ratio',
        description: 'Verhältnis Betriebskosten zu Umsatz',
        category: 'efficiency',
        value: {
          current: (d.operatingExpenses / d.revenue) * 100,
          previous: ((p.operatingExpenses || 0) / (p.revenue || 1)) * 100,
          target: 25,
          unit: 'percent',
        },
        calculation: 'Betriebskosten / Umsatz × 100',
      },
    ];

    // Add trend and status to each KPI
    return kpiList.map(kpi => {
      const trend = calculateTrend(kpi.value.current, kpi.value.previous);

      // Determine status based on KPI type
      let status: 'good' | 'warning' | 'critical' = 'good';
      if (kpi.id === 'dso') {
        status = getStatus(kpi.value.current, settings.alertThresholds.dso, false);
      } else if (kpi.id === 'current-ratio') {
        status = getStatus(kpi.value.current, settings.alertThresholds.currentRatio, true);
      } else if (kpi.id === 'quick-ratio') {
        status = getStatus(kpi.value.current, settings.alertThresholds.quickRatio, true);
      } else if (kpi.id.includes('margin') || kpi.id.includes('growth') || kpi.id === 'roe' || kpi.id === 'roa') {
        status = getStatus(kpi.value.current, settings.alertThresholds.profitMargin, true);
      }

      return {
        ...kpi,
        trend: trend.direction,
        trendPercent: trend.percent,
        status,
      };
    });
  }, [financialData, settings.alertThresholds]);

  // Update financial data
  const updateFinancialData = useCallback((updates: Partial<FinancialData>) => {
    setFinancialData(prev => ({ ...prev, ...updates }));
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<KPIDashboardSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Toggle favorite KPI
  const toggleFavorite = useCallback((kpiId: string) => {
    setSettings(prev => ({
      ...prev,
      favoriteKPIs: prev.favoriteKPIs.includes(kpiId)
        ? prev.favoriteKPIs.filter(id => id !== kpiId)
        : [...prev.favoriteKPIs, kpiId],
    }));
  }, []);

  // Add alert
  const addAlert = useCallback((alert: Omit<KPIAlert, 'id' | 'createdAt' | 'acknowledged'>) => {
    const newAlert: KPIAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
      acknowledged: false,
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 50));
  }, []);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  }, []);

  // Get KPIs by category
  const getKPIsByCategory = useCallback((category: KPICategory): KPI[] => {
    return kpis.filter(k => k.category === category);
  }, [kpis]);

  // Get favorite KPIs
  const favoriteKPIs = useMemo(() => {
    return kpis.filter(k => settings.favoriteKPIs.includes(k.id));
  }, [kpis, settings.favoriteKPIs]);

  // Get critical KPIs
  const criticalKPIs = useMemo(() => {
    return kpis.filter(k => k.status === 'critical' || k.status === 'warning');
  }, [kpis]);

  // Format KPI value
  const formatKPIValue = useCallback((value: number, unit: KPIValue['unit']): string => {
    switch (unit) {
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
      case 'days':
        return `${Math.round(value)} Tage`;
      case 'ratio':
        return value.toFixed(2);
      case 'number':
        return new Intl.NumberFormat('de-DE').format(value);
      default:
        return value.toString();
    }
  }, []);

  // Summary stats
  const summary = useMemo(() => ({
    totalKPIs: kpis.length,
    goodKPIs: kpis.filter(k => k.status === 'good').length,
    warningKPIs: kpis.filter(k => k.status === 'warning').length,
    criticalKPIs: kpis.filter(k => k.status === 'critical').length,
    unacknowledgedAlerts: alerts.filter(a => !a.acknowledged).length,
    byCategory: {
      profitability: kpis.filter(k => k.category === 'profitability').length,
      liquidity: kpis.filter(k => k.category === 'liquidity').length,
      activity: kpis.filter(k => k.category === 'activity').length,
      growth: kpis.filter(k => k.category === 'growth').length,
      efficiency: kpis.filter(k => k.category === 'efficiency').length,
    },
  }), [kpis, alerts]);

  return {
    kpis,
    favoriteKPIs,
    criticalKPIs,
    alerts,
    settings,
    financialData,
    summary,
    updateFinancialData,
    updateSettings,
    toggleFavorite,
    addAlert,
    acknowledgeAlert,
    getKPIsByCategory,
    formatKPIValue,
  };
}
