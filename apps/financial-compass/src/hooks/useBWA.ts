import { useState, useCallback, useEffect } from 'react';

export type BWAType = 'standard' | 'kurzfristig' | 'erweitert';

export interface BWARow {
  id: string;
  number: string; // BWA-Zeile
  label: string;
  accounts: string[]; // Kontonummern die in diese Zeile fließen
  type: 'revenue' | 'expense' | 'result' | 'header';
  isSubtotal?: boolean;
  formula?: string; // z.B. "1-2" für Zeile 1 minus Zeile 2
}

export interface BWAPeriodData {
  period: string; // YYYY-MM
  values: Record<string, number>; // BWA row number -> value
}

export interface BWAReport {
  id: string;
  type: BWAType;
  year: number;
  month: number;
  data: Record<string, number>; // row number -> value
  previousYear?: Record<string, number>;
  budget?: Record<string, number>;
  createdAt: string;
}

export interface BWASettings {
  showPreviousYear: boolean;
  showBudget: boolean;
  showPercentages: boolean;
  showYTD: boolean; // Year-to-date
}

const STORAGE_KEY = 'fintutto_bwa';

// Standard BWA nach DATEV Schema
export const BWA_STRUCTURE: BWARow[] = [
  // Betriebliche Erträge
  { id: 'bwa-1', number: '1', label: 'Umsatzerlöse', accounts: ['8000-8199'], type: 'revenue' },
  { id: 'bwa-2', number: '2', label: 'Bestandsveränderungen', accounts: ['8960-8989'], type: 'revenue' },
  { id: 'bwa-3', number: '3', label: 'Aktivierte Eigenleistungen', accounts: ['8990-8999'], type: 'revenue' },
  { id: 'bwa-4', number: '4', label: 'Gesamtleistung', accounts: [], type: 'result', isSubtotal: true, formula: '1+2+3' },

  // Materialaufwand
  { id: 'bwa-5', number: '5', label: 'Wareneinsatz', accounts: ['3000-3399'], type: 'expense' },
  { id: 'bwa-6', number: '6', label: 'Bezogene Leistungen', accounts: ['3400-3999'], type: 'expense' },
  { id: 'bwa-7', number: '7', label: 'Rohertrag', accounts: [], type: 'result', isSubtotal: true, formula: '4-5-6' },

  // Sonstige betriebliche Erträge
  { id: 'bwa-8', number: '8', label: 'Sonstige betriebliche Erträge', accounts: ['8200-8599'], type: 'revenue' },
  { id: 'bwa-9', number: '9', label: 'Betrieblicher Rohertrag', accounts: [], type: 'result', isSubtotal: true, formula: '7+8' },

  // Personalkosten
  { id: 'bwa-10', number: '10', label: 'Löhne und Gehälter', accounts: ['4100-4199'], type: 'expense' },
  { id: 'bwa-11', number: '11', label: 'Soziale Abgaben', accounts: ['4120-4199'], type: 'expense' },
  { id: 'bwa-12', number: '12', label: 'Personalkosten gesamt', accounts: [], type: 'result', isSubtotal: true, formula: '10+11' },

  // Raumkosten
  { id: 'bwa-13', number: '13', label: 'Miete/Pacht', accounts: ['4210-4219'], type: 'expense' },
  { id: 'bwa-14', number: '14', label: 'Energie/Nebenkosten', accounts: ['4220-4299'], type: 'expense' },
  { id: 'bwa-15', number: '15', label: 'Raumkosten gesamt', accounts: [], type: 'result', isSubtotal: true, formula: '13+14' },

  // Betriebliche Steuern
  { id: 'bwa-16', number: '16', label: 'Betriebliche Steuern', accounts: ['4500-4599'], type: 'expense' },

  // Versicherungen/Beiträge
  { id: 'bwa-17', number: '17', label: 'Versicherungen', accounts: ['4360-4399'], type: 'expense' },
  { id: 'bwa-18', number: '18', label: 'Beiträge', accounts: ['4380-4389'], type: 'expense' },

  // Fahrzeugkosten
  { id: 'bwa-19', number: '19', label: 'Fahrzeugkosten', accounts: ['4500-4599'], type: 'expense' },

  // Werbe-/Reisekosten
  { id: 'bwa-20', number: '20', label: 'Werbekosten', accounts: ['4600-4649'], type: 'expense' },
  { id: 'bwa-21', number: '21', label: 'Reisekosten', accounts: ['4650-4699'], type: 'expense' },

  // Kosten der Warenabgabe
  { id: 'bwa-22', number: '22', label: 'Kosten der Warenabgabe', accounts: ['4700-4799'], type: 'expense' },

  // Abschreibungen
  { id: 'bwa-23', number: '23', label: 'Abschreibungen auf Sachanlagen', accounts: ['4820-4839'], type: 'expense' },
  { id: 'bwa-24', number: '24', label: 'Abschreibungen auf immaterielle VG', accounts: ['4800-4819'], type: 'expense' },
  { id: 'bwa-25', number: '25', label: 'Abschreibungen gesamt', accounts: [], type: 'result', isSubtotal: true, formula: '23+24' },

  // Reparaturen/Instandhaltung
  { id: 'bwa-26', number: '26', label: 'Reparaturen/Instandhaltung', accounts: ['4850-4899'], type: 'expense' },

  // Sonstige Kosten
  { id: 'bwa-27', number: '27', label: 'Sonstige Kosten', accounts: ['4900-4999'], type: 'expense' },

  // Gesamtkosten
  { id: 'bwa-28', number: '28', label: 'Gesamtkosten', accounts: [], type: 'result', isSubtotal: true, formula: '12+15+16+17+18+19+20+21+22+25+26+27' },

  // Betriebsergebnis
  { id: 'bwa-29', number: '29', label: 'Betriebsergebnis', accounts: [], type: 'result', isSubtotal: true, formula: '9-28' },

  // Zinsen
  { id: 'bwa-30', number: '30', label: 'Zinsaufwand', accounts: ['7300-7399'], type: 'expense' },
  { id: 'bwa-31', number: '31', label: 'Zinsertrag', accounts: ['7100-7199'], type: 'revenue' },
  { id: 'bwa-32', number: '32', label: 'Zinsergebnis', accounts: [], type: 'result', isSubtotal: true, formula: '31-30' },

  // Neutrales Ergebnis
  { id: 'bwa-33', number: '33', label: 'Sonstige neutrale Erträge', accounts: ['7600-7699'], type: 'revenue' },
  { id: 'bwa-34', number: '34', label: 'Sonstige neutrale Aufwendungen', accounts: ['7400-7599'], type: 'expense' },
  { id: 'bwa-35', number: '35', label: 'Neutrales Ergebnis', accounts: [], type: 'result', isSubtotal: true, formula: '33-34' },

  // Ergebnis vor Steuern
  { id: 'bwa-36', number: '36', label: 'Ergebnis vor Steuern', accounts: [], type: 'result', isSubtotal: true, formula: '29+32+35' },

  // Steuern vom Einkommen
  { id: 'bwa-37', number: '37', label: 'Steuern vom Einkommen/Ertrag', accounts: ['7700-7799'], type: 'expense' },

  // Jahresergebnis
  { id: 'bwa-38', number: '38', label: 'Vorläufiges Ergebnis', accounts: [], type: 'result', isSubtotal: true, formula: '36-37' },
];

// Demo-Daten für aktuelle Periode
const DEFAULT_BWA_DATA: Record<string, number> = {
  '1': 125000,    // Umsatzerlöse
  '2': 2500,      // Bestandsveränderungen
  '3': 0,         // Aktivierte Eigenleistungen
  '5': 35000,     // Wareneinsatz
  '6': 8000,      // Bezogene Leistungen
  '8': 3500,      // Sonstige betr. Erträge
  '10': 28000,    // Löhne und Gehälter
  '11': 5600,     // Soziale Abgaben
  '13': 3500,     // Miete
  '14': 800,      // Energie
  '16': 450,      // Betr. Steuern
  '17': 1200,     // Versicherungen
  '18': 350,      // Beiträge
  '19': 2800,     // Fahrzeugkosten
  '20': 1500,     // Werbekosten
  '21': 650,      // Reisekosten
  '22': 1200,     // Warenabgabe
  '23': 2500,     // AfA Sachanlagen
  '24': 500,      // AfA immaterielle
  '26': 800,      // Reparaturen
  '27': 3200,     // Sonstige Kosten
  '30': 850,      // Zinsaufwand
  '31': 120,      // Zinsertrag
  '33': 250,      // Neutrale Erträge
  '34': 100,      // Neutrale Aufwände
  '37': 6500,     // Steuern
};

const DEFAULT_SETTINGS: BWASettings = {
  showPreviousYear: true,
  showBudget: true,
  showPercentages: true,
  showYTD: true,
};

export function useBWA() {
  const [reports, setReports] = useState<BWAReport[]>([]);
  const [settings, setSettings] = useState<BWASettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setReports(data.reports || []);
        setSettings(data.settings || DEFAULT_SETTINGS);
      } catch {
        setReports([]);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((
    newReports?: BWAReport[],
    newSettings?: BWASettings
  ) => {
    const data = {
      reports: newReports || reports,
      settings: newSettings || settings,
    };
    if (newReports) setReports(newReports);
    if (newSettings) setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [reports, settings]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<BWASettings>) => {
    saveData(undefined, { ...settings, ...updates });
  }, [settings, saveData]);

  // Calculate formula values
  const calculateFormula = useCallback((formula: string, data: Record<string, number>): number => {
    // Simple formula parser for +/- operations
    // Example: "1+2+3" or "4-5-6" or "7+8"
    const parts = formula.split(/([+-])/);
    let result = 0;
    let operator = '+';

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed === '+' || trimmed === '-') {
        operator = trimmed;
      } else if (trimmed) {
        const value = data[trimmed] || 0;
        if (operator === '+') {
          result += value;
        } else {
          result -= value;
        }
      }
    }

    return result;
  }, []);

  // Calculate all derived values
  const calculateDerivedValues = useCallback((data: Record<string, number>): Record<string, number> => {
    const result = { ...data };

    // Calculate formulas in order
    for (const row of BWA_STRUCTURE) {
      if (row.formula) {
        result[row.number] = calculateFormula(row.formula, result);
      }
    }

    return result;
  }, [calculateFormula]);

  // Generate BWA report
  const generateReport = useCallback((year: number, month: number, type: BWAType = 'standard'): BWAReport => {
    // In a real app, this would aggregate actual booking data
    // For demo, we use sample data with some variation
    const baseData = { ...DEFAULT_BWA_DATA };

    // Add some monthly variation
    const variation = (Math.random() - 0.5) * 0.2; // ±10%
    for (const key of Object.keys(baseData)) {
      baseData[key] = Math.round(baseData[key] * (1 + variation));
    }

    const calculatedData = calculateDerivedValues(baseData);

    // Previous year data (simulated)
    const prevYearData = { ...DEFAULT_BWA_DATA };
    for (const key of Object.keys(prevYearData)) {
      prevYearData[key] = Math.round(prevYearData[key] * 0.9); // 10% weniger
    }
    const prevYearCalculated = calculateDerivedValues(prevYearData);

    // Budget data (simulated)
    const budgetData = { ...DEFAULT_BWA_DATA };
    for (const key of Object.keys(budgetData)) {
      budgetData[key] = Math.round(budgetData[key] * 1.05); // 5% mehr geplant
    }
    const budgetCalculated = calculateDerivedValues(budgetData);

    const report: BWAReport = {
      id: `bwa-${year}-${month}`,
      type,
      year,
      month,
      data: calculatedData,
      previousYear: prevYearCalculated,
      budget: budgetCalculated,
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
  }, [reports, calculateDerivedValues, saveData]);

  // Get BWA for period
  const getReport = useCallback((year: number, month: number): BWAReport | null => {
    return reports.find(r => r.year === year && r.month === month) || null;
  }, [reports]);

  // Calculate YTD (Year-to-date)
  const getYTDReport = useCallback((year: number, month: number): Record<string, number> => {
    const ytdData: Record<string, number> = {};

    // Initialize all rows to 0
    for (const row of BWA_STRUCTURE) {
      ytdData[row.number] = 0;
    }

    // Sum all months up to and including the given month
    for (let m = 1; m <= month; m++) {
      const report = reports.find(r => r.year === year && r.month === m);
      if (report) {
        for (const row of BWA_STRUCTURE) {
          if (!row.formula) { // Only sum base values, recalculate formulas
            ytdData[row.number] += report.data[row.number] || 0;
          }
        }
      }
    }

    // Recalculate derived values
    return calculateDerivedValues(ytdData);
  }, [reports, calculateDerivedValues]);

  // Calculate percentages (relative to revenue)
  const calculatePercentages = useCallback((data: Record<string, number>): Record<string, number> => {
    const revenue = data['1'] || 1; // Prevent division by zero
    const percentages: Record<string, number> = {};

    for (const row of BWA_STRUCTURE) {
      percentages[row.number] = (data[row.number] || 0) / revenue * 100;
    }

    return percentages;
  }, []);

  // Compare with budget
  const compareToBudget = useCallback((actual: Record<string, number>, budget: Record<string, number>): Record<string, { diff: number; percent: number }> => {
    const comparison: Record<string, { diff: number; percent: number }> = {};

    for (const row of BWA_STRUCTURE) {
      const actualValue = actual[row.number] || 0;
      const budgetValue = budget[row.number] || 0;
      const diff = actualValue - budgetValue;
      const percent = budgetValue !== 0 ? (diff / Math.abs(budgetValue)) * 100 : 0;

      comparison[row.number] = { diff, percent };
    }

    return comparison;
  }, []);

  // Get key metrics
  const getKeyMetrics = useCallback((report: BWAReport) => {
    const data = report.data;
    const revenue = data['1'] || 0;
    const grossProfit = data['7'] || 0;
    const operatingResult = data['29'] || 0;
    const netResult = data['38'] || 0;
    const totalCosts = data['28'] || 0;

    return {
      revenue,
      grossProfit,
      grossProfitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      operatingResult,
      operatingMargin: revenue > 0 ? (operatingResult / revenue) * 100 : 0,
      netResult,
      netMargin: revenue > 0 ? (netResult / revenue) * 100 : 0,
      totalCosts,
      costRatio: revenue > 0 ? (totalCosts / revenue) * 100 : 0,
      personnelCosts: data['12'] || 0,
      personnelCostRatio: revenue > 0 ? ((data['12'] || 0) / revenue) * 100 : 0,
    };
  }, []);

  // Export BWA to CSV
  const exportBWA = useCallback((year: number, month: number) => {
    const report = getReport(year, month) || generateReport(year, month);
    const percentages = calculatePercentages(report.data);

    const headers = ['Zeile', 'Bezeichnung', 'Ist', '% v. Umsatz'];
    if (settings.showPreviousYear && report.previousYear) {
      headers.push('Vorjahr', 'Abw. VJ');
    }
    if (settings.showBudget && report.budget) {
      headers.push('Plan', 'Abw. Plan');
    }

    const rows = BWA_STRUCTURE.map(row => {
      const rowData = [
        row.number,
        row.label,
        (report.data[row.number] || 0).toFixed(2),
        percentages[row.number].toFixed(1) + '%',
      ];

      if (settings.showPreviousYear && report.previousYear) {
        const prevValue = report.previousYear[row.number] || 0;
        const diff = (report.data[row.number] || 0) - prevValue;
        rowData.push(prevValue.toFixed(2), diff.toFixed(2));
      }

      if (settings.showBudget && report.budget) {
        const budgetValue = report.budget[row.number] || 0;
        const diff = (report.data[row.number] || 0) - budgetValue;
        rowData.push(budgetValue.toFixed(2), diff.toFixed(2));
      }

      return rowData;
    });

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BWA_${year}_${String(month).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getReport, generateReport, calculatePercentages, settings]);

  return {
    reports,
    settings,
    isLoading,
    updateSettings,
    generateReport,
    getReport,
    getYTDReport,
    calculatePercentages,
    compareToBudget,
    getKeyMetrics,
    exportBWA,
    bwaStructure: BWA_STRUCTURE,
  };
}
