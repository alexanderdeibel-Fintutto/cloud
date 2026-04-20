import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export type ReconciliationStatus = 'unreconciled' | 'matched' | 'reconciled' | 'disputed';

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  bank_account_name: string;
  date: string;
  amount: number;
  description: string;
  reference?: string;
  counterparty?: string;
  category?: string;
  reconciliation_status: ReconciliationStatus;
  matched_item_type?: 'invoice' | 'receipt' | 'booking';
  matched_item_id?: string;
  reconciled_at?: string;
  notes?: string;
}

export interface MatchableItem {
  id: string;
  type: 'invoice' | 'receipt' | 'booking';
  reference: string;
  description: string;
  amount: number;
  date: string;
  contact_name?: string;
  status?: string;
}

export interface SuggestedMatch {
  item: MatchableItem;
  confidence: number; // 0-100
  matchReasons: string[];
}

export interface ReconciliationStats {
  total: number;
  unreconciled: number;
  matched: number;
  reconciled: number;
  disputed: number;
  totalAmount: number;
  unreconciledAmount: number;
}

const STORAGE_KEY = 'fintutto_bank_reconciliation';

export function useBankReconciliation() {
  const { currentCompany } = useCompany();
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [matchableItems, setMatchableItems] = useState<MatchableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);

  // Load data from localStorage
  useEffect(() => {
    if (!currentCompany) return;

    const storedData = localStorage.getItem(`${STORAGE_KEY}_${currentCompany.id}`);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setTransactions(parsed.transactions || []);
        setMatchableItems(parsed.matchableItems || []);
      } catch {
        loadDemoData();
      }
    } else {
      loadDemoData();
    }
    setLoading(false);
  }, [currentCompany]);

  // Load demo data
  const loadDemoData = useCallback(() => {
    const demoTransactions = generateDemoTransactions();
    const demoItems = generateDemoMatchableItems();
    setTransactions(demoTransactions);
    setMatchableItems(demoItems);
  }, []);

  // Save data
  const saveData = useCallback((txs: BankTransaction[], items: MatchableItem[]) => {
    if (!currentCompany) return;
    localStorage.setItem(
      `${STORAGE_KEY}_${currentCompany.id}`,
      JSON.stringify({ transactions: txs, matchableItems: items })
    );
  }, [currentCompany]);

  // Get suggested matches for a transaction
  const getSuggestedMatches = useCallback((transaction: BankTransaction): SuggestedMatch[] => {
    const suggestions: SuggestedMatch[] = [];

    matchableItems.forEach(item => {
      let confidence = 0;
      const reasons: string[] = [];

      // Amount matching (exact match is most important)
      const amountDiff = Math.abs(Math.abs(item.amount) - Math.abs(transaction.amount));
      if (amountDiff < 0.01) {
        confidence += 50;
        reasons.push('Exakter Betrag');
      } else if (amountDiff < 1) {
        confidence += 30;
        reasons.push('Ähnlicher Betrag');
      } else if (amountDiff / Math.abs(transaction.amount) < 0.05) {
        confidence += 15;
        reasons.push('Betrag nah');
      }

      // Reference matching
      if (item.reference && transaction.reference) {
        const refMatch = transaction.reference.toLowerCase().includes(item.reference.toLowerCase()) ||
          item.reference.toLowerCase().includes(transaction.reference.toLowerCase());
        if (refMatch) {
          confidence += 25;
          reasons.push('Referenz stimmt überein');
        }
      }

      // Description matching
      if (transaction.description && item.description) {
        const descWords = item.description.toLowerCase().split(/\s+/);
        const txWords = transaction.description.toLowerCase().split(/\s+/);
        const commonWords = descWords.filter(w => w.length > 3 && txWords.includes(w));
        if (commonWords.length > 0) {
          confidence += Math.min(commonWords.length * 5, 15);
          reasons.push('Beschreibung ähnlich');
        }
      }

      // Contact/counterparty matching
      if (transaction.counterparty && item.contact_name) {
        const cpLower = transaction.counterparty.toLowerCase();
        const cnLower = item.contact_name.toLowerCase();
        if (cpLower.includes(cnLower) || cnLower.includes(cpLower)) {
          confidence += 20;
          reasons.push('Kontakt stimmt überein');
        }
      }

      // Date proximity (within 7 days)
      const txDate = new Date(transaction.date);
      const itemDate = new Date(item.date);
      const daysDiff = Math.abs((txDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 3) {
        confidence += 10;
        reasons.push('Datum nah');
      } else if (daysDiff <= 7) {
        confidence += 5;
        reasons.push('Datum ähnlich');
      }

      // Only suggest if confidence is above threshold
      if (confidence >= 30) {
        suggestions.push({ item, confidence: Math.min(confidence, 100), matchReasons: reasons });
      }
    });

    // Sort by confidence descending
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }, [matchableItems]);

  // Match a transaction to an item
  const matchTransaction = useCallback((transactionId: string, item: MatchableItem) => {
    const updated = transactions.map(tx =>
      tx.id === transactionId
        ? {
          ...tx,
          reconciliation_status: 'matched' as ReconciliationStatus,
          matched_item_type: item.type,
          matched_item_id: item.id,
        }
        : tx
    );
    setTransactions(updated);
    saveData(updated, matchableItems);
  }, [transactions, matchableItems, saveData]);

  // Unmatch a transaction
  const unmatchTransaction = useCallback((transactionId: string) => {
    const updated = transactions.map(tx =>
      tx.id === transactionId
        ? {
          ...tx,
          reconciliation_status: 'unreconciled' as ReconciliationStatus,
          matched_item_type: undefined,
          matched_item_id: undefined,
        }
        : tx
    );
    setTransactions(updated);
    saveData(updated, matchableItems);
  }, [transactions, matchableItems, saveData]);

  // Reconcile a transaction (confirm the match)
  const reconcileTransaction = useCallback((transactionId: string) => {
    const updated = transactions.map(tx =>
      tx.id === transactionId
        ? {
          ...tx,
          reconciliation_status: 'reconciled' as ReconciliationStatus,
          reconciled_at: new Date().toISOString(),
        }
        : tx
    );
    setTransactions(updated);
    saveData(updated, matchableItems);
  }, [transactions, matchableItems, saveData]);

  // Reconcile all matched transactions
  const reconcileAllMatched = useCallback(() => {
    const updated = transactions.map(tx =>
      tx.reconciliation_status === 'matched'
        ? {
          ...tx,
          reconciliation_status: 'reconciled' as ReconciliationStatus,
          reconciled_at: new Date().toISOString(),
        }
        : tx
    );
    setTransactions(updated);
    saveData(updated, matchableItems);
  }, [transactions, matchableItems, saveData]);

  // Mark as disputed
  const disputeTransaction = useCallback((transactionId: string, notes?: string) => {
    const updated = transactions.map(tx =>
      tx.id === transactionId
        ? {
          ...tx,
          reconciliation_status: 'disputed' as ReconciliationStatus,
          notes,
        }
        : tx
    );
    setTransactions(updated);
    saveData(updated, matchableItems);
  }, [transactions, matchableItems, saveData]);

  // Add note to transaction
  const addNote = useCallback((transactionId: string, notes: string) => {
    const updated = transactions.map(tx =>
      tx.id === transactionId ? { ...tx, notes } : tx
    );
    setTransactions(updated);
    saveData(updated, matchableItems);
  }, [transactions, matchableItems, saveData]);

  // Auto-match all unreconciled transactions
  const autoMatchAll = useCallback(() => {
    let matched = 0;
    const updated = transactions.map(tx => {
      if (tx.reconciliation_status !== 'unreconciled') return tx;

      const suggestions = getSuggestedMatches(tx);
      const bestMatch = suggestions.find(s => s.confidence >= 75);

      if (bestMatch) {
        matched++;
        return {
          ...tx,
          reconciliation_status: 'matched' as ReconciliationStatus,
          matched_item_type: bestMatch.item.type,
          matched_item_id: bestMatch.item.id,
        };
      }
      return tx;
    });

    setTransactions(updated);
    saveData(updated, matchableItems);
    return matched;
  }, [transactions, matchableItems, getSuggestedMatches, saveData]);

  // Get matched item for a transaction
  const getMatchedItem = useCallback((transaction: BankTransaction): MatchableItem | undefined => {
    if (!transaction.matched_item_id) return undefined;
    return matchableItems.find(item => item.id === transaction.matched_item_id);
  }, [matchableItems]);

  // Calculate statistics
  const stats = useMemo((): ReconciliationStats => {
    const total = transactions.length;
    const unreconciled = transactions.filter(t => t.reconciliation_status === 'unreconciled').length;
    const matched = transactions.filter(t => t.reconciliation_status === 'matched').length;
    const reconciled = transactions.filter(t => t.reconciliation_status === 'reconciled').length;
    const disputed = transactions.filter(t => t.reconciliation_status === 'disputed').length;

    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const unreconciledAmount = transactions
      .filter(t => t.reconciliation_status === 'unreconciled')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { total, unreconciled, matched, reconciled, disputed, totalAmount, unreconciledAmount };
  }, [transactions]);

  // Filter transactions
  const getFilteredTransactions = useCallback((
    status?: ReconciliationStatus,
    bankAccountId?: string,
    dateFrom?: string,
    dateTo?: string
  ): BankTransaction[] => {
    return transactions.filter(tx => {
      if (status && tx.reconciliation_status !== status) return false;
      if (bankAccountId && tx.bank_account_id !== bankAccountId) return false;
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;
      return true;
    });
  }, [transactions]);

  // Get unique bank accounts from transactions
  const bankAccounts = useMemo(() => {
    const accounts = new Map<string, string>();
    transactions.forEach(tx => {
      if (!accounts.has(tx.bank_account_id)) {
        accounts.set(tx.bank_account_id, tx.bank_account_name);
      }
    });
    return Array.from(accounts, ([id, name]) => ({ id, name }));
  }, [transactions]);

  return {
    transactions,
    matchableItems,
    loading,
    stats,
    bankAccounts,
    selectedTransaction,
    setSelectedTransaction,
    getSuggestedMatches,
    matchTransaction,
    unmatchTransaction,
    reconcileTransaction,
    reconcileAllMatched,
    disputeTransaction,
    addNote,
    autoMatchAll,
    getMatchedItem,
    getFilteredTransactions,
  };
}

// Demo data generators
function generateDemoTransactions(): BankTransaction[] {
  const now = new Date();
  const accounts = [
    { id: 'acc-1', name: 'Geschäftskonto (Sparkasse)' },
    { id: 'acc-2', name: 'PayPal Business' },
  ];

  return [
    {
      id: 'tx-1',
      bank_account_id: 'acc-1',
      bank_account_name: accounts[0].name,
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 4500.00,
      description: 'SEPA Überweisung Mustermann GmbH RE-2026-0042',
      reference: 'RE-2026-0042',
      counterparty: 'Mustermann GmbH',
      reconciliation_status: 'unreconciled',
    },
    {
      id: 'tx-2',
      bank_account_id: 'acc-1',
      bank_account_name: accounts[0].name,
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: -2500.00,
      description: 'Miete Februar 2026 Bürogebäude',
      counterparty: 'Immobilien Verwaltung KG',
      reconciliation_status: 'unreconciled',
    },
    {
      id: 'tx-3',
      bank_account_id: 'acc-1',
      bank_account_name: accounts[0].name,
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 8200.00,
      description: 'Zahlung Tech Solutions AG Rechnung 0045',
      reference: 'RE-2026-0045',
      counterparty: 'Tech Solutions AG',
      reconciliation_status: 'matched',
      matched_item_type: 'invoice',
      matched_item_id: 'inv-2',
    },
    {
      id: 'tx-4',
      bank_account_id: 'acc-1',
      bank_account_name: accounts[0].name,
      date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: -890.50,
      description: 'Adobe Creative Cloud Jahresabo',
      counterparty: 'Adobe Systems',
      reconciliation_status: 'reconciled',
      matched_item_type: 'receipt',
      matched_item_id: 'rec-1',
      reconciled_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tx-5',
      bank_account_id: 'acc-2',
      bank_account_name: accounts[1].name,
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 1250.00,
      description: 'PayPal Zahlung Online Shop Bestellung #12345',
      reference: '#12345',
      counterparty: 'Webshop Kunde',
      reconciliation_status: 'unreconciled',
    },
    {
      id: 'tx-6',
      bank_account_id: 'acc-1',
      bank_account_name: accounts[0].name,
      date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 3100.00,
      description: 'Handel Co KG Teilzahlung',
      counterparty: 'Handel & Co. KG',
      reconciliation_status: 'disputed',
      notes: 'Betrag stimmt nicht mit Rechnung überein',
    },
    {
      id: 'tx-7',
      bank_account_id: 'acc-1',
      bank_account_name: accounts[0].name,
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: -450.00,
      description: 'Büromaterial Office Express',
      counterparty: 'Office Express GmbH',
      reconciliation_status: 'unreconciled',
    },
    {
      id: 'tx-8',
      bank_account_id: 'acc-1',
      bank_account_name: accounts[0].name,
      date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 5800.00,
      description: 'Beratung Plus Projektabschluss',
      reference: 'RE-2026-0038',
      counterparty: 'Beratung Plus GmbH',
      reconciliation_status: 'unreconciled',
    },
    {
      id: 'tx-9',
      bank_account_id: 'acc-2',
      bank_account_name: accounts[1].name,
      date: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: -125.90,
      description: 'Google Workspace Abo',
      counterparty: 'Google Ireland Ltd',
      reconciliation_status: 'reconciled',
      matched_item_type: 'booking',
      matched_item_id: 'bk-1',
      reconciled_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tx-10',
      bank_account_id: 'acc-1',
      bank_account_name: accounts[0].name,
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: -15000.00,
      description: 'Gehälter Januar 2026',
      counterparty: 'Sammelüberweisung',
      reconciliation_status: 'reconciled',
      matched_item_type: 'booking',
      matched_item_id: 'bk-2',
      reconciled_at: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function generateDemoMatchableItems(): MatchableItem[] {
  const now = new Date();

  return [
    // Invoices
    {
      id: 'inv-1',
      type: 'invoice',
      reference: 'RE-2026-0042',
      description: 'Beratungsleistungen Januar 2026',
      amount: 4500.00,
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_name: 'Mustermann GmbH',
      status: 'sent',
    },
    {
      id: 'inv-2',
      type: 'invoice',
      reference: 'RE-2026-0045',
      description: 'Softwareentwicklung Projekt Alpha',
      amount: 8200.00,
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_name: 'Tech Solutions AG',
      status: 'paid',
    },
    {
      id: 'inv-3',
      type: 'invoice',
      reference: 'RE-2026-0038',
      description: 'Strategieberatung Q4 2025',
      amount: 5800.00,
      date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_name: 'Beratung Plus GmbH',
      status: 'sent',
    },
    {
      id: 'inv-4',
      type: 'invoice',
      reference: 'RE-2026-0040',
      description: 'Warenlieferung Elektronik',
      amount: 3500.00,
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_name: 'Handel & Co. KG',
      status: 'sent',
    },
    // Receipts
    {
      id: 'rec-1',
      type: 'receipt',
      reference: 'B-2026-0089',
      description: 'Adobe Creative Cloud Jahreslizenz',
      amount: 890.50,
      date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_name: 'Adobe Systems',
    },
    {
      id: 'rec-2',
      type: 'receipt',
      reference: 'B-2026-0092',
      description: 'Bürobedarf Papier und Toner',
      amount: 450.00,
      date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_name: 'Office Express GmbH',
    },
    {
      id: 'rec-3',
      type: 'receipt',
      reference: 'B-2026-0088',
      description: 'Büromiete Februar 2026',
      amount: 2500.00,
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_name: 'Immobilien Verwaltung KG',
    },
    // Bookings
    {
      id: 'bk-1',
      type: 'booking',
      reference: 'BU-2026-0145',
      description: 'Google Workspace Monatsabo',
      amount: 125.90,
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_name: 'Google Ireland Ltd',
    },
    {
      id: 'bk-2',
      type: 'booking',
      reference: 'BU-2026-0142',
      description: 'Gehaltsauszahlung Januar 2026',
      amount: 15000.00,
      date: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  ];
}
