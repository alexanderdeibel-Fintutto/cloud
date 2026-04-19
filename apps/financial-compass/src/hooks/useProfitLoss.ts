import { useState, useEffect, useCallback } from 'react';

export type PnLType = 'revenue' | 'expense' | 'subtotal' | 'result';

export interface PnLPosition {
  id: string;
  number: string;
  label: string;
  type: PnLType;
  accounts: string[];
  isSubtotal?: boolean;
  formula?: string;
}

export interface PnLRow {
  position: PnLPosition;
  currentPeriod: number;
  previousPeriod: number;
  budget: number;
  budgetVariance: number;
}

export interface ProfitLossData {
  periodStart: string;
  periodEnd: string;
  fiscalYear: number;
  companyName: string;
  rows: PnLRow[];
  revenue: number;
  grossProfit: number;
  operatingResult: number;
  netIncome: number;
}

// German HGB P&L structure (Gesamtkostenverfahren § 275 HGB)
export const PNL_STRUCTURE: PnLPosition[] = [
  { id: '1', number: '1.', label: 'Umsatzerlöse', type: 'revenue', accounts: ['8000-8099'] },
  { id: '2', number: '2.', label: 'Bestandsveränderungen', type: 'revenue', accounts: ['8900-8999'] },
  { id: '3', number: '3.', label: 'Andere aktivierte Eigenleistungen', type: 'revenue', accounts: ['8800-8899'] },
  { id: '4', number: '4.', label: 'Sonstige betriebliche Erträge', type: 'revenue', accounts: ['8100-8199'] },
  { id: 'GL', number: '', label: 'Gesamtleistung', type: 'subtotal', accounts: [], isSubtotal: true, formula: '1+2+3+4' },
  { id: '5', number: '5.', label: 'Materialaufwand', type: 'expense', accounts: ['5000-5999'] },
  { id: 'RE', number: '', label: 'Rohergebnis', type: 'subtotal', accounts: [], isSubtotal: true },
  { id: '6', number: '6.', label: 'Personalaufwand', type: 'expense', accounts: ['6000-6099'] },
  { id: '7', number: '7.', label: 'Abschreibungen', type: 'expense', accounts: ['6200-6299'] },
  { id: '8', number: '8.', label: 'Sonstige betriebliche Aufwendungen', type: 'expense', accounts: ['6300-6999'] },
  { id: 'EBIT', number: '', label: 'Betriebsergebnis (EBIT)', type: 'result', accounts: [], isSubtotal: true },
  { id: '9', number: '9.', label: 'Erträge aus Beteiligungen', type: 'revenue', accounts: ['7600-7619'] },
  { id: '10', number: '10.', label: 'Sonstige Zinsen und Erträge', type: 'revenue', accounts: ['7650-7699'] },
  { id: '11', number: '11.', label: 'Abschreibungen auf Finanzanlagen', type: 'expense', accounts: ['7700-7749'] },
  { id: '12', number: '12.', label: 'Zinsen und ähnliche Aufwendungen', type: 'expense', accounts: ['7750-7799'] },
  { id: 'FIN', number: '', label: 'Finanzergebnis', type: 'result', accounts: [], isSubtotal: true },
  { id: 'EGT', number: '', label: 'Ergebnis der gewöhnlichen Geschäftstätigkeit', type: 'result', accounts: [], isSubtotal: true },
  { id: '13', number: '13.', label: 'Steuern vom Einkommen und Ertrag', type: 'expense', accounts: ['7800-7849'] },
  { id: '14', number: '14.', label: 'Sonstige Steuern', type: 'expense', accounts: ['7850-7899'] },
  { id: 'JUE', number: '', label: 'Jahresüberschuss / Jahresfehlbetrag', type: 'result', accounts: [], isSubtotal: true },
];

const STORAGE_KEY = 'fintutto_profit_loss';

export function useProfitLoss() {
  const [data, setData] = useState<Record<string, Record<string, number>>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setData(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading P&L:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPositionValue = useCallback((pos: PnLPosition, periodKey: string): number => {
    if (data[periodKey]?.[pos.id] !== undefined) return data[periodKey][pos.id];
    if (pos.isSubtotal) return 0;
    const seed = pos.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    let val = Math.abs(Math.sin(seed * 12345) * 50000);
    if (pos.id === '1') val *= 20;
    if (pos.id === '5') val *= 8;
    if (pos.id === '6') val *= 6;
    return Math.round(val);
  }, [data]);

  const generateProfitLoss = useCallback((periodStart: string, periodEnd: string): ProfitLossData => {
    const fiscalYear = new Date(periodStart).getFullYear();
    const periodKey = `${periodStart}_${periodEnd}`;

    // Calculate values with proper subtotals
    const values: Record<string, number> = {};
    PNL_STRUCTURE.forEach(pos => {
      if (!pos.isSubtotal) values[pos.id] = getPositionValue(pos, periodKey);
    });

    // Calculate subtotals
    values['GL'] = values['1'] + values['2'] + values['3'] + values['4'];
    values['RE'] = values['GL'] - values['5'];
    values['EBIT'] = values['RE'] - values['6'] - values['7'] - values['8'];
    values['FIN'] = values['9'] + values['10'] - values['11'] - values['12'];
    values['EGT'] = values['EBIT'] + values['FIN'];
    values['JUE'] = values['EGT'] - values['13'] - values['14'];

    const rows: PnLRow[] = PNL_STRUCTURE.map(pos => ({
      position: pos,
      currentPeriod: values[pos.id] || 0,
      previousPeriod: Math.round((values[pos.id] || 0) * 0.92),
      budget: Math.round((values[pos.id] || 0) * 0.95),
      budgetVariance: Math.round((values[pos.id] || 0) * 0.05),
    }));

    return {
      periodStart, periodEnd, fiscalYear, companyName: 'Musterfirma GmbH', rows,
      revenue: values['1'], grossProfit: values['RE'], operatingResult: values['EBIT'], netIncome: values['JUE'],
    };
  }, [getPositionValue]);

  const exportToCSV = useCallback((pnl: ProfitLossData): string => {
    const lines = [`GuV ${pnl.periodStart} - ${pnl.periodEnd}`, '', 'Nr;Bezeichnung;Aktuell;Vorjahr;Budget'];
    pnl.rows.forEach(r => lines.push(`${r.position.number};${r.position.label};${r.currentPeriod.toFixed(2)};${r.previousPeriod.toFixed(2)};${r.budget.toFixed(2)}`));
    return lines.join('\n');
  }, []);

  const calculateRatios = useCallback((pnl: ProfitLossData) => ({
    grossMargin: pnl.revenue > 0 ? (pnl.grossProfit / pnl.revenue) * 100 : 0,
    operatingMargin: pnl.revenue > 0 ? (pnl.operatingResult / pnl.revenue) * 100 : 0,
    netMargin: pnl.revenue > 0 ? (pnl.netIncome / pnl.revenue) * 100 : 0,
  }), []);

  return { isLoading, structure: PNL_STRUCTURE, generateProfitLoss, exportToCSV, calculateRatios };
}
