import { useState, useCallback, useEffect } from 'react';

export type OpenItemType = 'receivable' | 'payable';
export type OpenItemStatus = 'open' | 'partial' | 'paid' | 'overdue' | 'written_off';

export interface OpenItem {
  id: string;
  type: OpenItemType;
  invoiceNumber: string;
  invoiceId?: string;
  contactId?: string;
  contactName: string;
  invoiceDate: string;
  dueDate: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  status: OpenItemStatus;
  dunningLevel: number; // 0 = no dunning, 1-3 = dunning levels
  lastDunningDate?: string;
  paymentTermDays: number;
  notes?: string;
  costCenterId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  openItemId: string;
  date: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'cash' | 'card' | 'paypal' | 'other';
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface OpenItemsAgingSummary {
  current: number; // Not yet due
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90days: number;
  total: number;
}

const STORAGE_KEY = 'fintutto_open_items';

const DEFAULT_ITEMS: OpenItem[] = [
  {
    id: 'oi-1',
    type: 'receivable',
    invoiceNumber: 'RE-2024-001',
    contactName: 'Musterfirma GmbH',
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-14',
    originalAmount: 5950,
    paidAmount: 0,
    remainingAmount: 5950,
    currency: 'EUR',
    status: 'overdue',
    dunningLevel: 1,
    lastDunningDate: '2024-02-20',
    paymentTermDays: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'oi-2',
    type: 'receivable',
    invoiceNumber: 'RE-2024-002',
    contactName: 'ABC Handels AG',
    invoiceDate: '2024-01-20',
    dueDate: '2024-02-19',
    originalAmount: 2380,
    paidAmount: 1000,
    remainingAmount: 1380,
    currency: 'EUR',
    status: 'partial',
    dunningLevel: 0,
    paymentTermDays: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'oi-3',
    type: 'payable',
    invoiceNumber: 'ER-2024-015',
    contactName: 'Lieferant XYZ',
    invoiceDate: '2024-01-25',
    dueDate: '2024-02-24',
    originalAmount: 3570,
    paidAmount: 0,
    remainingAmount: 3570,
    currency: 'EUR',
    status: 'open',
    dunningLevel: 0,
    paymentTermDays: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'oi-4',
    type: 'receivable',
    invoiceNumber: 'RE-2024-003',
    contactName: 'Tech Solutions GmbH',
    invoiceDate: '2024-02-01',
    dueDate: '2024-03-02',
    originalAmount: 8925,
    paidAmount: 0,
    remainingAmount: 8925,
    currency: 'EUR',
    status: 'open',
    dunningLevel: 0,
    paymentTermDays: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useOpenItems() {
  const [items, setItems] = useState<OpenItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setItems(data.items || DEFAULT_ITEMS);
        setPayments(data.payments || []);
      } catch {
        setItems(DEFAULT_ITEMS);
      }
    } else {
      setItems(DEFAULT_ITEMS);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((
    newItems?: OpenItem[],
    newPayments?: Payment[]
  ) => {
    const data = {
      items: newItems || items,
      payments: newPayments || payments,
    };
    if (newItems) setItems(newItems);
    if (newPayments) setPayments(newPayments);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [items, payments]);

  // Calculate status based on dates and payments
  const calculateStatus = useCallback((item: OpenItem): OpenItemStatus => {
    if (item.remainingAmount <= 0) return 'paid';
    if (item.paidAmount > 0) return 'partial';

    const today = new Date();
    const dueDate = new Date(item.dueDate);
    if (today > dueDate) return 'overdue';

    return 'open';
  }, []);

  // Create open item
  const createItem = useCallback((item: Omit<OpenItem, 'id' | 'status' | 'dunningLevel' | 'createdAt' | 'updatedAt'>) => {
    const newItem: OpenItem = {
      ...item,
      id: `oi-${Date.now()}`,
      status: 'open',
      dunningLevel: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newItem.status = calculateStatus(newItem);
    saveData([...items, newItem]);
    return newItem;
  }, [items, calculateStatus, saveData]);

  // Update open item
  const updateItem = useCallback((id: string, updates: Partial<OpenItem>) => {
    saveData(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
      updated.status = calculateStatus(updated);
      return updated;
    }));
  }, [items, calculateStatus, saveData]);

  // Delete open item
  const deleteItem = useCallback((id: string) => {
    saveData(
      items.filter(item => item.id !== id),
      payments.filter(p => p.openItemId !== id)
    );
  }, [items, payments, saveData]);

  // Record payment
  const recordPayment = useCallback((payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const item = items.find(i => i.id === payment.openItemId);
    if (!item) return null;

    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const newPaidAmount = item.paidAmount + payment.amount;
    const newRemainingAmount = item.originalAmount - newPaidAmount;

    const updatedItems = items.map(i => {
      if (i.id !== payment.openItemId) return i;
      const updated = {
        ...i,
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, newRemainingAmount),
        updatedAt: new Date().toISOString(),
      };
      updated.status = calculateStatus(updated);
      return updated;
    });

    saveData(updatedItems, [...payments, newPayment]);
    return newPayment;
  }, [items, payments, calculateStatus, saveData]);

  // Write off remaining amount
  const writeOff = useCallback((id: string, reason?: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updatedItems = items.map(i => {
      if (i.id !== id) return i;
      return {
        ...i,
        remainingAmount: 0,
        status: 'written_off' as OpenItemStatus,
        notes: reason ? `${i.notes || ''}\nAbgeschrieben: ${reason}`.trim() : i.notes,
        updatedAt: new Date().toISOString(),
      };
    });

    saveData(updatedItems);
  }, [items, saveData]);

  // Update dunning level
  const setDunningLevel = useCallback((id: string, level: number) => {
    updateItem(id, {
      dunningLevel: level,
      lastDunningDate: new Date().toISOString().split('T')[0],
    });
  }, [updateItem]);

  // Get items by type
  const getByType = useCallback((type: OpenItemType): OpenItem[] => {
    return items.filter(i => i.type === type);
  }, [items]);

  // Get overdue items
  const getOverdueItems = useCallback((): OpenItem[] => {
    return items.filter(i => i.status === 'overdue');
  }, [items]);

  // Get items due soon (within X days)
  const getDueSoon = useCallback((days: number = 7): OpenItem[] => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    return items.filter(i =>
      i.status === 'open' &&
      i.dueDate >= todayStr &&
      i.dueDate <= futureDateStr
    );
  }, [items]);

  // Calculate aging summary
  const getAgingSummary = useCallback((type: OpenItemType): OpenItemsAgingSummary => {
    const today = new Date();
    const filteredItems = items.filter(i =>
      i.type === type && i.status !== 'paid' && i.status !== 'written_off'
    );

    const summary: OpenItemsAgingSummary = {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      over90days: 0,
      total: 0,
    };

    filteredItems.forEach(item => {
      const dueDate = new Date(item.dueDate);
      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      summary.total += item.remainingAmount;

      if (daysDiff <= 0) {
        summary.current += item.remainingAmount;
      } else if (daysDiff <= 30) {
        summary.days1to30 += item.remainingAmount;
      } else if (daysDiff <= 60) {
        summary.days31to60 += item.remainingAmount;
      } else if (daysDiff <= 90) {
        summary.days61to90 += item.remainingAmount;
      } else {
        summary.over90days += item.remainingAmount;
      }
    });

    return summary;
  }, [items]);

  // Get summary statistics
  const getSummary = useCallback(() => {
    const receivables = items.filter(i => i.type === 'receivable' && i.status !== 'paid' && i.status !== 'written_off');
    const payables = items.filter(i => i.type === 'payable' && i.status !== 'paid' && i.status !== 'written_off');

    const totalReceivables = receivables.reduce((sum, i) => sum + i.remainingAmount, 0);
    const totalPayables = payables.reduce((sum, i) => sum + i.remainingAmount, 0);

    const overdueReceivables = receivables.filter(i => i.status === 'overdue');
    const overduePayables = payables.filter(i => i.status === 'overdue');

    const overdueReceivablesAmount = overdueReceivables.reduce((sum, i) => sum + i.remainingAmount, 0);
    const overduePayablesAmount = overduePayables.reduce((sum, i) => sum + i.remainingAmount, 0);

    return {
      receivablesCount: receivables.length,
      payablesCount: payables.length,
      totalReceivables,
      totalPayables,
      netPosition: totalReceivables - totalPayables,
      overdueReceivablesCount: overdueReceivables.length,
      overduePayablesCount: overduePayables.length,
      overdueReceivablesAmount,
      overduePayablesAmount,
      dunningNeeded: receivables.filter(i => i.status === 'overdue' && i.dunningLevel < 3).length,
    };
  }, [items]);

  // Get payment history for an item
  const getPaymentHistory = useCallback((itemId: string): Payment[] => {
    return payments
      .filter(p => p.openItemId === itemId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [payments]);

  // Search items
  const searchItems = useCallback((query: string): OpenItem[] => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.contactName.toLowerCase().includes(q) ||
      i.notes?.toLowerCase().includes(q)
    );
  }, [items]);

  // Export items
  const exportItems = useCallback((type?: OpenItemType) => {
    const filtered = type ? items.filter(i => i.type === type) : items;
    const headers = ['Typ', 'Rechnungsnr.', 'Kontakt', 'Rechnungsdatum', 'Fällig', 'Betrag', 'Bezahlt', 'Offen', 'Status'];
    const rows = filtered.map(i => [
      i.type === 'receivable' ? 'Forderung' : 'Verbindlichkeit',
      i.invoiceNumber,
      i.contactName,
      i.invoiceDate,
      i.dueDate,
      i.originalAmount.toFixed(2),
      i.paidAmount.toFixed(2),
      i.remainingAmount.toFixed(2),
      i.status,
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offene_posten_${type || 'alle'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  return {
    items,
    payments,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    recordPayment,
    writeOff,
    setDunningLevel,
    getByType,
    getOverdueItems,
    getDueSoon,
    getAgingSummary,
    getSummary,
    getPaymentHistory,
    searchItems,
    exportItems,
  };
}
