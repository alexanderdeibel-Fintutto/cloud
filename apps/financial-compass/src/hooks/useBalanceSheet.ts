import { useState, useEffect, useCallback } from 'react';

// Balance sheet structure according to German HGB (Handelsgesetzbuch)
export type BalanceSheetSide = 'assets' | 'liabilities';

export interface BalanceSheetPosition {
  id: string;
  number: string;
  label: string;
  labelEn?: string;
  level: number;
  side: BalanceSheetSide;
  accounts: string[];
  isSubtotal?: boolean;
  formula?: string;
  parentId?: string;
}

export interface BalanceSheetRow {
  position: BalanceSheetPosition;
  currentYear: number;
  previousYear: number;
  change: number;
  changePercent: number;
}

export interface BalanceSheetData {
  asOfDate: string;
  fiscalYear: number;
  previousFiscalYear: number;
  companyName: string;
  assets: BalanceSheetRow[];
  liabilities: BalanceSheetRow[];
  totalAssets: number;
  totalLiabilities: number;
  previousTotalAssets: number;
  previousTotalLiabilities: number;
  isBalanced: boolean;
}

// German HGB balance sheet structure (§ 266 HGB)
export const BALANCE_SHEET_STRUCTURE: BalanceSheetPosition[] = [
  // AKTIVA (Assets)
  { id: 'A', number: 'A', label: 'Anlagevermögen', labelEn: 'Fixed Assets', level: 0, side: 'assets', accounts: [], isSubtotal: true },
  { id: 'A.I', number: 'A.I', label: 'Immaterielle Vermögensgegenstände', level: 1, side: 'assets', accounts: [], parentId: 'A', isSubtotal: true },
  { id: 'A.I.1', number: '1.', label: 'Selbst geschaffene Schutzrechte', level: 2, side: 'assets', accounts: ['0010-0019'], parentId: 'A.I' },
  { id: 'A.I.2', number: '2.', label: 'Konzessionen, Lizenzen', level: 2, side: 'assets', accounts: ['0020-0049'], parentId: 'A.I' },
  { id: 'A.I.3', number: '3.', label: 'Geschäfts- oder Firmenwert', level: 2, side: 'assets', accounts: ['0050-0069'], parentId: 'A.I' },
  { id: 'A.II', number: 'A.II', label: 'Sachanlagen', level: 1, side: 'assets', accounts: [], parentId: 'A', isSubtotal: true },
  { id: 'A.II.1', number: '1.', label: 'Grundstücke und Bauten', level: 2, side: 'assets', accounts: ['0100-0199'], parentId: 'A.II' },
  { id: 'A.II.2', number: '2.', label: 'Technische Anlagen und Maschinen', level: 2, side: 'assets', accounts: ['0200-0299'], parentId: 'A.II' },
  { id: 'A.II.3', number: '3.', label: 'Betriebs- und Geschäftsausstattung', level: 2, side: 'assets', accounts: ['0300-0499'], parentId: 'A.II' },
  { id: 'A.III', number: 'A.III', label: 'Finanzanlagen', level: 1, side: 'assets', accounts: [], parentId: 'A', isSubtotal: true },
  { id: 'A.III.1', number: '1.', label: 'Anteile an verbundenen Unternehmen', level: 2, side: 'assets', accounts: ['0600-0619'], parentId: 'A.III' },
  { id: 'A.III.2', number: '2.', label: 'Beteiligungen', level: 2, side: 'assets', accounts: ['0640-0659'], parentId: 'A.III' },

  { id: 'B', number: 'B', label: 'Umlaufvermögen', labelEn: 'Current Assets', level: 0, side: 'assets', accounts: [], isSubtotal: true },
  { id: 'B.I', number: 'B.I', label: 'Vorräte', level: 1, side: 'assets', accounts: [], parentId: 'B', isSubtotal: true },
  { id: 'B.I.1', number: '1.', label: 'Roh-, Hilfs- und Betriebsstoffe', level: 2, side: 'assets', accounts: ['3000-3099'], parentId: 'B.I' },
  { id: 'B.I.2', number: '2.', label: 'Unfertige Erzeugnisse', level: 2, side: 'assets', accounts: ['3100-3199'], parentId: 'B.I' },
  { id: 'B.I.3', number: '3.', label: 'Fertige Erzeugnisse und Waren', level: 2, side: 'assets', accounts: ['3200-3399'], parentId: 'B.I' },
  { id: 'B.II', number: 'B.II', label: 'Forderungen', level: 1, side: 'assets', accounts: [], parentId: 'B', isSubtotal: true },
  { id: 'B.II.1', number: '1.', label: 'Forderungen aus Lieferungen und Leistungen', level: 2, side: 'assets', accounts: ['1200-1299'], parentId: 'B.II' },
  { id: 'B.II.2', number: '2.', label: 'Sonstige Vermögensgegenstände', level: 2, side: 'assets', accounts: ['1400-1499'], parentId: 'B.II' },
  { id: 'B.III', number: 'B.III', label: 'Wertpapiere', level: 1, side: 'assets', accounts: ['1500-1599'], parentId: 'B' },
  { id: 'B.IV', number: 'B.IV', label: 'Kassenbestand, Bankguthaben', level: 1, side: 'assets', accounts: ['1000-1099', '1600-1699'], parentId: 'B' },

  { id: 'C', number: 'C', label: 'Rechnungsabgrenzungsposten', level: 0, side: 'assets', accounts: ['0980-0999'] },

  // PASSIVA (Liabilities & Equity)
  { id: 'P.A', number: 'A', label: 'Eigenkapital', labelEn: 'Equity', level: 0, side: 'liabilities', accounts: [], isSubtotal: true },
  { id: 'P.A.I', number: 'I.', label: 'Gezeichnetes Kapital', level: 1, side: 'liabilities', accounts: ['2900-2909'], parentId: 'P.A' },
  { id: 'P.A.II', number: 'II.', label: 'Kapitalrücklage', level: 1, side: 'liabilities', accounts: ['2910-2919'], parentId: 'P.A' },
  { id: 'P.A.III', number: 'III.', label: 'Gewinnrücklagen', level: 1, side: 'liabilities', accounts: ['2920-2949'], parentId: 'P.A' },
  { id: 'P.A.IV', number: 'IV.', label: 'Gewinn-/Verlustvortrag', level: 1, side: 'liabilities', accounts: ['2950-2969'], parentId: 'P.A' },
  { id: 'P.A.V', number: 'V.', label: 'Jahresüberschuss/-fehlbetrag', level: 1, side: 'liabilities', accounts: ['2970-2999'], parentId: 'P.A' },

  { id: 'P.B', number: 'B', label: 'Rückstellungen', labelEn: 'Provisions', level: 0, side: 'liabilities', accounts: [], isSubtotal: true },
  { id: 'P.B.1', number: '1.', label: 'Pensionsrückstellungen', level: 1, side: 'liabilities', accounts: ['3000-3049'], parentId: 'P.B' },
  { id: 'P.B.2', number: '2.', label: 'Steuerrückstellungen', level: 1, side: 'liabilities', accounts: ['3050-3099'], parentId: 'P.B' },
  { id: 'P.B.3', number: '3.', label: 'Sonstige Rückstellungen', level: 1, side: 'liabilities', accounts: ['3100-3199'], parentId: 'P.B' },

  { id: 'P.C', number: 'C', label: 'Verbindlichkeiten', labelEn: 'Liabilities', level: 0, side: 'liabilities', accounts: [], isSubtotal: true },
  { id: 'P.C.1', number: '1.', label: 'Verbindlichkeiten ggü. Kreditinstituten', level: 1, side: 'liabilities', accounts: ['3250-3299'], parentId: 'P.C' },
  { id: 'P.C.2', number: '2.', label: 'Erhaltene Anzahlungen', level: 1, side: 'liabilities', accounts: ['3300-3349'], parentId: 'P.C' },
  { id: 'P.C.3', number: '3.', label: 'Verbindlichkeiten aus L. u. L.', level: 1, side: 'liabilities', accounts: ['3350-3399', '1600-1699'], parentId: 'P.C' },
  { id: 'P.C.4', number: '4.', label: 'Sonstige Verbindlichkeiten', level: 1, side: 'liabilities', accounts: ['3500-3699'], parentId: 'P.C' },

  { id: 'P.D', number: 'D', label: 'Rechnungsabgrenzungsposten', level: 0, side: 'liabilities', accounts: ['3700-3799'] },
];

const STORAGE_KEY = 'fintutto_balance_sheet';

export function useBalanceSheet() {
  const [data, setData] = useState<Record<string, Record<string, number>>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setData(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading balance sheet:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPositionValue = useCallback((position: BalanceSheetPosition, year: number): number => {
    if (data[year]?.[position.id] !== undefined) return data[year][position.id];
    if (position.isSubtotal) return 0;
    const seed = position.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + year;
    return Math.round(Math.abs(Math.sin(seed) * 50000));
  }, [data]);

  const calculateSubtotal = useCallback((parentId: string, year: number): number => {
    return BALANCE_SHEET_STRUCTURE
      .filter(p => p.parentId === parentId)
      .reduce((sum, child) => sum + (child.isSubtotal ? calculateSubtotal(child.id, year) : getPositionValue(child, year)), 0);
  }, [getPositionValue]);

  const generateBalanceSheet = useCallback((asOfDate: string): BalanceSheetData => {
    const fiscalYear = new Date(asOfDate).getFullYear();
    const previousFiscalYear = fiscalYear - 1;

    const calculateRow = (pos: BalanceSheetPosition): BalanceSheetRow => {
      const currentYear = pos.isSubtotal ? calculateSubtotal(pos.id, fiscalYear) : getPositionValue(pos, fiscalYear);
      const previousYear = pos.isSubtotal ? calculateSubtotal(pos.id, previousFiscalYear) : getPositionValue(pos, previousFiscalYear);
      return { position: pos, currentYear, previousYear, change: currentYear - previousYear, changePercent: previousYear ? ((currentYear - previousYear) / previousYear) * 100 : 0 };
    };

    const assets = BALANCE_SHEET_STRUCTURE.filter(p => p.side === 'assets').map(calculateRow);
    const liabilities = BALANCE_SHEET_STRUCTURE.filter(p => p.side === 'liabilities').map(calculateRow);
    const totalAssets = assets.filter(r => r.position.level === 0).reduce((s, r) => s + r.currentYear, 0);
    const totalLiabilities = liabilities.filter(r => r.position.level === 0).reduce((s, r) => s + r.currentYear, 0);

    return {
      asOfDate, fiscalYear, previousFiscalYear, companyName: 'Musterfirma GmbH',
      assets, liabilities, totalAssets, totalLiabilities,
      previousTotalAssets: assets.filter(r => r.position.level === 0).reduce((s, r) => s + r.previousYear, 0),
      previousTotalLiabilities: liabilities.filter(r => r.position.level === 0).reduce((s, r) => s + r.previousYear, 0),
      isBalanced: Math.abs(totalAssets - totalLiabilities) < 0.01,
    };
  }, [calculateSubtotal, getPositionValue]);

  const exportToCSV = useCallback((bs: BalanceSheetData): string => {
    const lines = [`Bilanz zum ${bs.asOfDate}`, bs.companyName, '', 'Position;Bezeichnung;Aktuell;Vorjahr'];
    [...bs.assets, ...bs.liabilities].forEach(r => lines.push(`${r.position.number};${r.position.label};${r.currentYear.toFixed(2)};${r.previousYear.toFixed(2)}`));
    return lines.join('\n');
  }, []);

  return { isLoading, structure: BALANCE_SHEET_STRUCTURE, generateBalanceSheet, exportToCSV };
}
