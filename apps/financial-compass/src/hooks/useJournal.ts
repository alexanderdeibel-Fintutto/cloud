import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

export type JournalEntryStatus = 'draft' | 'posted' | 'reversed';
export type JournalEntryType = 'standard' | 'opening' | 'closing' | 'adjustment' | 'reversal';

export interface JournalLine {
  id: string;
  accountNumber: string;
  accountName: string;
  debit: number;
  credit: number;
  costCenter?: string;
  description?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  postingDate: string;
  type: JournalEntryType;
  status: JournalEntryStatus;
  description: string;
  reference?: string;
  documentNumber?: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  createdAt: string;
  createdBy: string;
  postedAt?: string;
  postedBy?: string;
}

export const ENTRY_TYPE_LABELS: Record<JournalEntryType, string> = {
  standard: 'Standard', opening: 'Eröffnung', closing: 'Abschluss', adjustment: 'Korrektur', reversal: 'Storno',
};

export const ENTRY_STATUS_LABELS: Record<JournalEntryStatus, string> = {
  draft: 'Entwurf', posted: 'Gebucht', reversed: 'Storniert',
};

const STORAGE_KEY = 'fintutto_journal';

const DEMO_ENTRIES: JournalEntry[] = [
  {
    id: 'je-1', entryNumber: 'BU-2024-0001', date: '2024-01-15', postingDate: '2024-01-15',
    type: 'standard', status: 'posted', description: 'Wareneingang Lieferant Müller', reference: 'RE-2024-001',
    lines: [
      { id: 'l1', accountNumber: '3000', accountName: 'Waren', debit: 5000, credit: 0 },
      { id: 'l2', accountNumber: '1576', accountName: 'Vorsteuer 19%', debit: 950, credit: 0 },
      { id: 'l3', accountNumber: '1600', accountName: 'Verbindlichkeiten', debit: 0, credit: 5950 },
    ],
    totalDebit: 5950, totalCredit: 5950, isBalanced: true,
    createdAt: '2024-01-15T10:00:00Z', createdBy: 'Max Mustermann', postedAt: '2024-01-15T10:30:00Z', postedBy: 'Max Mustermann',
  },
  {
    id: 'je-2', entryNumber: 'BU-2024-0002', date: '2024-01-20', postingDate: '2024-01-20',
    type: 'standard', status: 'posted', description: 'Kundenrechnung Schmidt GmbH', reference: 'AR-2024-015',
    lines: [
      { id: 'l4', accountNumber: '1200', accountName: 'Forderungen', debit: 11900, credit: 0 },
      { id: 'l5', accountNumber: '8400', accountName: 'Erlöse 19%', debit: 0, credit: 10000 },
      { id: 'l6', accountNumber: '1776', accountName: 'Umsatzsteuer 19%', debit: 0, credit: 1900 },
    ],
    totalDebit: 11900, totalCredit: 11900, isBalanced: true,
    createdAt: '2024-01-20T14:00:00Z', createdBy: 'Max Mustermann', postedAt: '2024-01-20T14:15:00Z', postedBy: 'Max Mustermann',
  },
];

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEntries(JSON.parse(stored));
      else { setEntries(DEMO_ENTRIES); localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_ENTRIES)); }
    } catch (error) {
      console.error('Error loading journal:', error);
      setEntries(DEMO_ENTRIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveEntries = useCallback((newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  }, []);

  const getNextEntryNumber = useCallback((): string => {
    const year = new Date().getFullYear();
    const yearEntries = entries.filter(e => e.entryNumber.includes(`-${year}-`));
    return `BU-${year}-${String(yearEntries.length + 1).padStart(4, '0')}`;
  }, [entries]);

  const createEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdAt' | 'isBalanced' | 'totalDebit' | 'totalCredit'>): JournalEntry => {
    const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0);
    const newEntry: JournalEntry = {
      ...entry, id: `je-${Date.now()}`, entryNumber: getNextEntryNumber(),
      createdAt: new Date().toISOString(), totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
    saveEntries([...entries, newEntry]);
    return newEntry;
  }, [entries, getNextEntryNumber, saveEntries]);

  const updateEntry = useCallback((id: string, updates: Partial<JournalEntry>): JournalEntry | null => {
    const entry = entries.find(e => e.id === id);
    if (!entry || entry.status !== 'draft') return null;
    const lines = updates.lines || entry.lines;
    const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
    const updated = { ...entry, ...updates, totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
    saveEntries(entries.map(e => e.id === id ? updated : e));
    return updated;
  }, [entries, saveEntries]);

  const postEntry = useCallback((id: string, postedBy: string): boolean => {
    const entry = entries.find(e => e.id === id);
    if (!entry || entry.status !== 'draft' || !entry.isBalanced) return false;
    saveEntries(entries.map(e => e.id === id ? { ...e, status: 'posted' as const, postedAt: new Date().toISOString(), postedBy } : e));
    return true;
  }, [entries, saveEntries]);

  const reverseEntry = useCallback((id: string, reversedBy: string, reversalDate: string): JournalEntry | null => {
    const entry = entries.find(e => e.id === id);
    if (!entry || entry.status !== 'posted') return null;
    const reversalEntry: JournalEntry = {
      id: `je-rev-${Date.now()}`, entryNumber: getNextEntryNumber(), date: reversalDate, postingDate: reversalDate,
      type: 'reversal', status: 'posted', description: `Storno: ${entry.description}`, reference: entry.entryNumber,
      lines: entry.lines.map(l => ({ ...l, id: `rev-${l.id}`, debit: l.credit, credit: l.debit })),
      totalDebit: entry.totalCredit, totalCredit: entry.totalDebit, isBalanced: true,
      createdAt: new Date().toISOString(), createdBy: reversedBy, postedAt: new Date().toISOString(), postedBy: reversedBy,
    };
    saveEntries([...entries.map(e => e.id === id ? { ...e, status: 'reversed' as const } : e), reversalEntry]);
    return reversalEntry;
  }, [entries, getNextEntryNumber, saveEntries]);

  const deleteEntry = useCallback((id: string): boolean => {
    const entry = entries.find(e => e.id === id);
    if (!entry || entry.status !== 'draft') return false;
    saveEntries(entries.filter(e => e.id !== id));
    return true;
  }, [entries, saveEntries]);

  const filterEntries = useCallback((filter: { startDate?: string; endDate?: string; status?: JournalEntryStatus; searchQuery?: string }): JournalEntry[] => {
    return entries.filter(e => {
      if (filter.startDate && e.date < filter.startDate) return false;
      if (filter.endDate && e.date > filter.endDate) return false;
      if (filter.status && e.status !== filter.status) return false;
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        return e.description.toLowerCase().includes(q) || e.entryNumber.toLowerCase().includes(q) || e.lines.some(l => l.accountNumber.includes(q));
      }
      return true;
    });
  }, [entries]);

  const getSummary = useCallback(() => {
    const posted = entries.filter(e => e.status === 'posted');
    return {
      totalEntries: entries.length, draftEntries: entries.filter(e => e.status === 'draft').length,
      postedEntries: posted.length, totalDebit: posted.reduce((s, e) => s + e.totalDebit, 0),
    };
  }, [entries]);

  const exportToCSV = useCallback((): string => {
    const lines = ['Buchungsnr;Datum;Typ;Status;Beschreibung;Konto;Soll;Haben'];
    entries.forEach(e => e.lines.forEach((l, i) => lines.push(`${e.entryNumber};${e.date};${ENTRY_TYPE_LABELS[e.type]};${ENTRY_STATUS_LABELS[e.status]};${i === 0 ? e.description : ''};${l.accountNumber};${l.debit.toFixed(2)};${l.credit.toFixed(2)}`)));
    return lines.join('\n');
  }, [entries]);

  return { entries, isLoading, createEntry, updateEntry, postEntry, reverseEntry, deleteEntry, filterEntries, getSummary, getNextEntryNumber, exportToCSV };
}
