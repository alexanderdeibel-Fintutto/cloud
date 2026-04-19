import { useState, useCallback, useEffect } from 'react';

export type VATReportingPeriod = 'monthly' | 'quarterly' | 'yearly';
export type VATFormField = string; // Kennzahl (KZ) im ELSTER-Formular

export interface VATTransaction {
  id: string;
  date: string;
  invoiceNumber?: string;
  contactName: string;
  description: string;
  netAmount: number;
  taxRate: number;
  taxAmount: number;
  grossAmount: number;
  type: 'output' | 'input' | 'innergemeinschaftlich' | 'reverse_charge' | 'export';
  kz: VATFormField; // Kennzahl für UStVA
  isBooked: boolean;
}

export interface VATReturn {
  id: string;
  period: string; // e.g., "2024-01" or "2024-Q1"
  periodType: VATReportingPeriod;
  year: number;
  month?: number;
  quarter?: number;
  status: 'draft' | 'calculated' | 'submitted' | 'accepted' | 'rejected';

  // Lieferungen und Leistungen (Ausgangsumsätze)
  kz81: number; // Steuerpflichtige Lieferungen 19%
  kz86: number; // Steuerpflichtige Lieferungen 7%
  kz35: number; // Innergemeinschaftliche Lieferungen
  kz77: number; // Sonstige steuerfreie Umsätze

  // Berechnete Steuer
  steuer81: number; // USt auf KZ 81
  steuer86: number; // USt auf KZ 86

  // Vorsteuer
  kz66: number; // Vorsteuer aus Rechnungen
  kz67: number; // Vorsteuer aus innergemeinschaftlichem Erwerb
  kz63: number; // Vorsteuer nach § 13b UStG (Reverse Charge)

  // Ergebnis
  umsatzsteuer: number; // Gesamt-Umsatzsteuer
  vorsteuer: number; // Gesamt-Vorsteuer
  zahllast: number; // Zahllast (positiv) oder Erstattung (negativ)

  submittedAt?: string;
  elsterTicket?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VATSettings {
  reportingPeriod: VATReportingPeriod;
  taxNumber: string;
  vatId: string;
  dauerfristverlaengerung: boolean; // +1 Monat Frist
  sondervorauszahlung: number;
  finanzamt: string;
}

const STORAGE_KEY = 'fintutto_vat_helper';

const DEFAULT_SETTINGS: VATSettings = {
  reportingPeriod: 'monthly',
  taxNumber: '',
  vatId: '',
  dauerfristverlaengerung: false,
  sondervorauszahlung: 0,
  finanzamt: '',
};

// Kennzahlen (KZ) für UStVA
export const VAT_FIELD_LABELS: Record<string, string> = {
  kz81: 'Steuerpflichtige Umsätze 19%',
  kz86: 'Steuerpflichtige Umsätze 7%',
  kz35: 'Steuerfreie innergemeinschaftliche Lieferungen',
  kz77: 'Sonstige steuerfreie Umsätze',
  kz66: 'Vorsteuerbeträge aus Rechnungen',
  kz67: 'Vorsteuer aus innergemeinschaftlichem Erwerb',
  kz63: 'Vorsteuer nach § 13b UStG',
};

export function useVATHelper() {
  const [transactions, setTransactions] = useState<VATTransaction[]>([]);
  const [returns, setReturns] = useState<VATReturn[]>([]);
  const [settings, setSettings] = useState<VATSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setTransactions(data.transactions || []);
        setReturns(data.returns || []);
        setSettings(data.settings || DEFAULT_SETTINGS);
      } catch {
        // Use defaults
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((
    newTransactions?: VATTransaction[],
    newReturns?: VATReturn[],
    newSettings?: VATSettings
  ) => {
    const data = {
      transactions: newTransactions || transactions,
      returns: newReturns || returns,
      settings: newSettings || settings,
    };
    if (newTransactions) setTransactions(newTransactions);
    if (newReturns) setReturns(newReturns);
    if (newSettings) setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [transactions, returns, settings]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<VATSettings>) => {
    const newSettings = { ...settings, ...updates };
    saveData(undefined, undefined, newSettings);
  }, [settings, saveData]);

  // Add VAT transaction
  const addTransaction = useCallback((tx: Omit<VATTransaction, 'id'>) => {
    const newTx: VATTransaction = {
      ...tx,
      id: `vat-tx-${Date.now()}`,
    };
    saveData([...transactions, newTx]);
    return newTx;
  }, [transactions, saveData]);

  // Get transactions for period
  const getTransactionsForPeriod = useCallback((year: number, month?: number, quarter?: number): VATTransaction[] => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth() + 1;

      if (txYear !== year) return false;

      if (month) {
        return txMonth === month;
      }

      if (quarter) {
        const txQuarter = Math.ceil(txMonth / 3);
        return txQuarter === quarter;
      }

      return true;
    });
  }, [transactions]);

  // Calculate VAT return
  const calculateReturn = useCallback((year: number, month?: number, quarter?: number): VATReturn => {
    const periodTxs = getTransactionsForPeriod(year, month, quarter);

    // Initialize return values
    let kz81 = 0, kz86 = 0, kz35 = 0, kz77 = 0;
    let kz66 = 0, kz67 = 0, kz63 = 0;

    periodTxs.forEach(tx => {
      if (tx.type === 'output') {
        if (tx.taxRate === 19) {
          kz81 += tx.netAmount;
        } else if (tx.taxRate === 7) {
          kz86 += tx.netAmount;
        }
      } else if (tx.type === 'input') {
        kz66 += tx.taxAmount;
      } else if (tx.type === 'innergemeinschaftlich') {
        kz35 += tx.netAmount;
        kz67 += tx.taxAmount;
      } else if (tx.type === 'reverse_charge') {
        kz63 += tx.taxAmount;
      } else if (tx.type === 'export') {
        kz77 += tx.netAmount;
      }
    });

    // Calculate tax amounts
    const steuer81 = Math.round(kz81 * 0.19 * 100) / 100;
    const steuer86 = Math.round(kz86 * 0.07 * 100) / 100;
    const umsatzsteuer = steuer81 + steuer86;
    const vorsteuer = kz66 + kz67 + kz63;
    const zahllast = Math.round((umsatzsteuer - vorsteuer) * 100) / 100;

    const period = month
      ? `${year}-${String(month).padStart(2, '0')}`
      : quarter
        ? `${year}-Q${quarter}`
        : `${year}`;

    const periodType: VATReportingPeriod = month ? 'monthly' : quarter ? 'quarterly' : 'yearly';

    return {
      id: `vat-return-${period}`,
      period,
      periodType,
      year,
      month,
      quarter,
      status: 'calculated',
      kz81: Math.round(kz81 * 100) / 100,
      kz86: Math.round(kz86 * 100) / 100,
      kz35: Math.round(kz35 * 100) / 100,
      kz77: Math.round(kz77 * 100) / 100,
      steuer81,
      steuer86,
      kz66: Math.round(kz66 * 100) / 100,
      kz67: Math.round(kz67 * 100) / 100,
      kz63: Math.round(kz63 * 100) / 100,
      umsatzsteuer,
      vorsteuer: Math.round(vorsteuer * 100) / 100,
      zahllast,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [getTransactionsForPeriod]);

  // Save return
  const saveReturn = useCallback((vatReturn: VATReturn) => {
    const existingIndex = returns.findIndex(r => r.period === vatReturn.period);
    let newReturns: VATReturn[];

    if (existingIndex >= 0) {
      newReturns = returns.map((r, i) =>
        i === existingIndex ? { ...vatReturn, updatedAt: new Date().toISOString() } : r
      );
    } else {
      newReturns = [...returns, vatReturn];
    }

    saveData(undefined, newReturns);
    return vatReturn;
  }, [returns, saveData]);

  // Submit return (mock ELSTER submission)
  const submitReturn = useCallback((returnId: string): { success: boolean; ticket?: string; error?: string } => {
    const vatReturn = returns.find(r => r.id === returnId);
    if (!vatReturn) return { success: false, error: 'Voranmeldung nicht gefunden' };

    if (!settings.taxNumber) {
      return { success: false, error: 'Steuernummer nicht konfiguriert' };
    }

    // Mock ELSTER submission
    const ticket = `ELSTER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const updatedReturns = returns.map(r =>
      r.id === returnId
        ? {
            ...r,
            status: 'submitted' as const,
            submittedAt: new Date().toISOString(),
            elsterTicket: ticket,
            updatedAt: new Date().toISOString(),
          }
        : r
    );

    saveData(undefined, updatedReturns);
    return { success: true, ticket };
  }, [returns, settings, saveData]);

  // Get deadline for period
  const getDeadline = useCallback((year: number, month?: number, quarter?: number): Date => {
    let deadlineMonth: number;
    let deadlineYear = year;

    if (month) {
      deadlineMonth = month + 1;
      if (deadlineMonth > 12) {
        deadlineMonth = 1;
        deadlineYear++;
      }
    } else if (quarter) {
      deadlineMonth = quarter * 3 + 1;
      if (deadlineMonth > 12) {
        deadlineMonth = 1;
        deadlineYear++;
      }
    } else {
      // Yearly - deadline is May 31st of next year
      return new Date(year + 1, 4, 31);
    }

    // 10th of the following month
    let day = 10;

    // If Dauerfristverlängerung is active, add one month
    if (settings.dauerfristverlaengerung) {
      deadlineMonth++;
      if (deadlineMonth > 12) {
        deadlineMonth = 1;
        deadlineYear++;
      }
    }

    return new Date(deadlineYear, deadlineMonth - 1, day);
  }, [settings.dauerfristverlaengerung]);

  // Get upcoming deadlines
  const getUpcomingDeadlines = useCallback((): { period: string; deadline: Date; daysRemaining: number; vatReturn?: VATReturn }[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const deadlines: { period: string; deadline: Date; daysRemaining: number; vatReturn?: VATReturn }[] = [];

    // Get deadlines for next 3 periods
    for (let i = 0; i < 3; i++) {
      let month = currentMonth - 1 + i;
      let year = currentYear;

      if (month <= 0) {
        month += 12;
        year--;
      } else if (month > 12) {
        month -= 12;
        year++;
      }

      const period = `${year}-${String(month).padStart(2, '0')}`;
      const deadline = getDeadline(year, month);
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining > -30) { // Show past 30 days too
        deadlines.push({
          period,
          deadline,
          daysRemaining,
          vatReturn: returns.find(r => r.period === period),
        });
      }
    }

    return deadlines.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  }, [getDeadline, returns]);

  // Generate XML for ELSTER (simplified mock)
  const generateElsterXML = useCallback((returnId: string): string => {
    const vatReturn = returns.find(r => r.id === returnId);
    if (!vatReturn) return '';

    // This would be proper ELSTER XML in production
    return `<?xml version="1.0" encoding="UTF-8"?>
<Elster xmlns="http://www.elster.de/elsterxml/schema/v11">
  <TransferHeader version="11">
    <Verfahren>ElsterAnmeldung</Verfahren>
    <DatenArt>UStVA</DatenArt>
  </TransferHeader>
  <DatenTeil>
    <Nutzdatenblock>
      <NutzdatenHeader version="11">
        <NutzdatenTicket>${vatReturn.id}</NutzdatenTicket>
      </NutzdatenHeader>
      <Nutzdaten>
        <Anmeldungssteuern art="UStVA">
          <Steuernummer>${settings.taxNumber}</Steuernummer>
          <Anmeldungszeitraum>${vatReturn.period}</Anmeldungszeitraum>
          <Kz81>${vatReturn.kz81.toFixed(2)}</Kz81>
          <Kz86>${vatReturn.kz86.toFixed(2)}</Kz86>
          <Kz35>${vatReturn.kz35.toFixed(2)}</Kz35>
          <Kz66>${vatReturn.kz66.toFixed(2)}</Kz66>
          <Kz83>${vatReturn.zahllast.toFixed(2)}</Kz83>
        </Anmeldungssteuern>
      </Nutzdaten>
    </Nutzdatenblock>
  </DatenTeil>
</Elster>`;
  }, [returns, settings]);

  // Get summary for period
  const getSummary = useCallback((year: number): {
    totalOutput: number;
    totalInput: number;
    totalPayable: number;
    byMonth: { month: number; output: number; input: number; payable: number }[];
  } => {
    const byMonth: { month: number; output: number; input: number; payable: number }[] = [];
    let totalOutput = 0;
    let totalInput = 0;

    for (let month = 1; month <= 12; month++) {
      const vatReturn = calculateReturn(year, month);
      byMonth.push({
        month,
        output: vatReturn.umsatzsteuer,
        input: vatReturn.vorsteuer,
        payable: vatReturn.zahllast,
      });
      totalOutput += vatReturn.umsatzsteuer;
      totalInput += vatReturn.vorsteuer;
    }

    return {
      totalOutput: Math.round(totalOutput * 100) / 100,
      totalInput: Math.round(totalInput * 100) / 100,
      totalPayable: Math.round((totalOutput - totalInput) * 100) / 100,
      byMonth,
    };
  }, [calculateReturn]);

  return {
    transactions,
    returns,
    settings,
    isLoading,
    updateSettings,
    addTransaction,
    getTransactionsForPeriod,
    calculateReturn,
    saveReturn,
    submitReturn,
    getDeadline,
    getUpcomingDeadlines,
    generateElsterXML,
    getSummary,
  };
}
