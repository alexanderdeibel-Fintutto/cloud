import { useState, useCallback, useEffect } from 'react';

export type PaymentDirection = 'incoming' | 'outgoing';
export type PaymentMethod = 'bank_transfer' | 'sepa' | 'cash' | 'card' | 'paypal' | 'check' | 'other';
export type PaymentType = 'invoice' | 'partial' | 'advance' | 'refund' | 'fee' | 'other';

export interface Payment {
  id: string;
  direction: PaymentDirection;
  type: PaymentType;
  method: PaymentMethod;
  amount: number;
  currency: string;
  date: string;
  valueDate?: string;
  reference?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  contactId?: string;
  contactName: string;
  bankAccountId?: string;
  bankAccountName?: string;
  description: string;
  isReconciled: boolean;
  reconciledAt?: string;
  transactionId?: string;
  fees?: number;
  originalAmount?: number;
  exchangeRate?: number;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReminder {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  contactName: string;
  amount: number;
  dueDate: string;
  reminderLevel: 1 | 2 | 3;
  sentAt?: string;
  nextReminderDate?: string;
  notes?: string;
}

export interface PaymentPlan {
  id: string;
  invoiceId: string;
  contactName: string;
  totalAmount: number;
  paidAmount: number;
  installments: PaymentInstallment[];
  startDate: string;
  status: 'active' | 'completed' | 'defaulted';
  notes?: string;
}

export interface PaymentInstallment {
  id: string;
  dueDate: string;
  amount: number;
  paidAt?: string;
  paidAmount?: number;
}

export interface PaymentStats {
  incoming: {
    total: number;
    count: number;
    avgDaysToPayment: number;
    byMonth: { month: string; amount: number }[];
  };
  outgoing: {
    total: number;
    count: number;
    avgDaysToPayment: number;
    byMonth: { month: string; amount: number }[];
  };
  pending: {
    incoming: number;
    outgoing: number;
  };
  overdue: {
    incoming: number;
    outgoing: number;
  };
}

const STORAGE_KEY = 'fintutto_payments';

const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    direction: 'incoming',
    type: 'invoice',
    method: 'bank_transfer',
    amount: 2380.00,
    currency: 'EUR',
    date: '2024-01-15',
    invoiceNumber: 'RE-2024-001',
    contactName: 'Musterfirma GmbH',
    description: 'Zahlung Rechnung RE-2024-001',
    isReconciled: true,
    reconciledAt: '2024-01-15',
    tags: ['kunde'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pay-2',
    direction: 'outgoing',
    type: 'invoice',
    method: 'sepa',
    amount: 1500.00,
    currency: 'EUR',
    date: '2024-01-03',
    invoiceNumber: 'M-2024-001',
    contactName: 'Immobilien Meier',
    description: 'Miete Januar 2024',
    isReconciled: true,
    reconciledAt: '2024-01-03',
    tags: ['miete', 'monatlich'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pay-3',
    direction: 'incoming',
    type: 'partial',
    method: 'bank_transfer',
    amount: 1000.00,
    currency: 'EUR',
    date: '2024-01-20',
    invoiceNumber: 'RE-2024-003',
    contactName: 'Beispiel AG',
    description: 'Teilzahlung Rechnung RE-2024-003 (1/3)',
    isReconciled: false,
    tags: ['teilzahlung'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'bank_transfer', label: 'Überweisung' },
  { value: 'sepa', label: 'SEPA-Lastschrift' },
  { value: 'cash', label: 'Barzahlung' },
  { value: 'card', label: 'Kartenzahlung' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'check', label: 'Scheck' },
  { value: 'other', label: 'Sonstige' },
];

export const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: 'invoice', label: 'Rechnungszahlung' },
  { value: 'partial', label: 'Teilzahlung' },
  { value: 'advance', label: 'Anzahlung' },
  { value: 'refund', label: 'Erstattung' },
  { value: 'fee', label: 'Gebühr' },
  { value: 'other', label: 'Sonstige' },
];

export function usePaymentTracking() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPayments(data.payments || DEFAULT_PAYMENTS);
        setReminders(data.reminders || []);
        setPaymentPlans(data.paymentPlans || []);
      } catch {
        setPayments(DEFAULT_PAYMENTS);
      }
    } else {
      setPayments(DEFAULT_PAYMENTS);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((
    newPayments?: Payment[],
    newReminders?: PaymentReminder[],
    newPlans?: PaymentPlan[]
  ) => {
    const data = {
      payments: newPayments || payments,
      reminders: newReminders || reminders,
      paymentPlans: newPlans || paymentPlans,
    };
    if (newPayments) setPayments(newPayments);
    if (newReminders) setReminders(newReminders);
    if (newPlans) setPaymentPlans(newPlans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [payments, reminders, paymentPlans]);

  // Record payment
  const recordPayment = useCallback((payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveData([...payments, newPayment]);
    return newPayment;
  }, [payments, saveData]);

  // Update payment
  const updatePayment = useCallback((id: string, updates: Partial<Payment>) => {
    const newPayments = payments.map(p =>
      p.id === id
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    );
    saveData(newPayments);
  }, [payments, saveData]);

  // Delete payment
  const deletePayment = useCallback((id: string) => {
    saveData(payments.filter(p => p.id !== id));
  }, [payments, saveData]);

  // Reconcile payment with bank transaction
  const reconcilePayment = useCallback((paymentId: string, transactionId: string) => {
    updatePayment(paymentId, {
      isReconciled: true,
      reconciledAt: new Date().toISOString(),
      transactionId,
    });
  }, [updatePayment]);

  // Get payments by invoice
  const getPaymentsByInvoice = useCallback((invoiceId: string): Payment[] => {
    return payments.filter(p => p.invoiceId === invoiceId);
  }, [payments]);

  // Get payments by contact
  const getPaymentsByContact = useCallback((contactName: string): Payment[] => {
    return payments.filter(p =>
      p.contactName.toLowerCase().includes(contactName.toLowerCase())
    );
  }, [payments]);

  // Get payments by date range
  const getPaymentsByDateRange = useCallback((startDate: string, endDate: string): Payment[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return payments.filter(p => {
      const date = new Date(p.date);
      return date >= start && date <= end;
    });
  }, [payments]);

  // Get unreconciled payments
  const getUnreconciledPayments = useCallback((): Payment[] => {
    return payments.filter(p => !p.isReconciled);
  }, [payments]);

  // Create payment reminder
  const createReminder = useCallback((reminder: Omit<PaymentReminder, 'id'>) => {
    const newReminder: PaymentReminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
    };
    saveData(undefined, [...reminders, newReminder]);
    return newReminder;
  }, [reminders, saveData]);

  // Mark reminder as sent
  const markReminderSent = useCallback((id: string) => {
    const newReminders = reminders.map(r => {
      if (r.id === id) {
        const nextLevel = Math.min(r.reminderLevel + 1, 3) as 1 | 2 | 3;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + (nextLevel === 2 ? 7 : nextLevel === 3 ? 14 : 7));
        return {
          ...r,
          sentAt: new Date().toISOString(),
          reminderLevel: nextLevel,
          nextReminderDate: nextDate.toISOString().split('T')[0],
        };
      }
      return r;
    });
    saveData(undefined, newReminders);
  }, [reminders, saveData]);

  // Delete reminder
  const deleteReminder = useCallback((id: string) => {
    saveData(undefined, reminders.filter(r => r.id !== id));
  }, [reminders, saveData]);

  // Create payment plan
  const createPaymentPlan = useCallback((
    invoiceId: string,
    contactName: string,
    totalAmount: number,
    installmentCount: number,
    startDate: string
  ): PaymentPlan => {
    const installmentAmount = Math.round((totalAmount / installmentCount) * 100) / 100;
    const installments: PaymentInstallment[] = [];

    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      installments.push({
        id: `inst-${Date.now()}-${i}`,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: i === installmentCount - 1
          ? totalAmount - (installmentAmount * (installmentCount - 1))
          : installmentAmount,
      });
    }

    const newPlan: PaymentPlan = {
      id: `plan-${Date.now()}`,
      invoiceId,
      contactName,
      totalAmount,
      paidAmount: 0,
      installments,
      startDate,
      status: 'active',
    };

    saveData(undefined, undefined, [...paymentPlans, newPlan]);
    return newPlan;
  }, [paymentPlans, saveData]);

  // Record installment payment
  const recordInstallmentPayment = useCallback((planId: string, installmentId: string, amount: number) => {
    const newPlans = paymentPlans.map(plan => {
      if (plan.id === planId) {
        const newInstallments = plan.installments.map(inst => {
          if (inst.id === installmentId) {
            return {
              ...inst,
              paidAt: new Date().toISOString(),
              paidAmount: amount,
            };
          }
          return inst;
        });

        const paidAmount = newInstallments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
        const allPaid = newInstallments.every(inst => inst.paidAmount && inst.paidAmount >= inst.amount);

        return {
          ...plan,
          installments: newInstallments,
          paidAmount,
          status: allPaid ? 'completed' as const : plan.status,
        };
      }
      return plan;
    });
    saveData(undefined, undefined, newPlans);
  }, [paymentPlans, saveData]);

  // Get payment statistics
  const getStats = useCallback((startDate?: string, endDate?: string): PaymentStats => {
    let filteredPayments = payments;
    if (startDate && endDate) {
      filteredPayments = getPaymentsByDateRange(startDate, endDate);
    }

    const incoming = filteredPayments.filter(p => p.direction === 'incoming');
    const outgoing = filteredPayments.filter(p => p.direction === 'outgoing');

    const getMonthlyTotals = (paymentList: Payment[]) => {
      const byMonth: Record<string, number> = {};
      paymentList.forEach(p => {
        const month = p.date.substring(0, 7);
        byMonth[month] = (byMonth[month] || 0) + p.amount;
      });
      return Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, amount]) => ({ month, amount }));
    };

    // Calculate pending (from reminders)
    const pendingIncoming = reminders.reduce((sum, r) => sum + r.amount, 0);

    // Calculate overdue from reminders
    const today = new Date();
    const overdueReminders = reminders.filter(r => new Date(r.dueDate) < today);
    const overdueIncoming = overdueReminders.reduce((sum, r) => sum + r.amount, 0);

    return {
      incoming: {
        total: incoming.reduce((sum, p) => sum + p.amount, 0),
        count: incoming.length,
        avgDaysToPayment: 0, // Would need invoice data to calculate
        byMonth: getMonthlyTotals(incoming),
      },
      outgoing: {
        total: outgoing.reduce((sum, p) => sum + p.amount, 0),
        count: outgoing.length,
        avgDaysToPayment: 0,
        byMonth: getMonthlyTotals(outgoing),
      },
      pending: {
        incoming: pendingIncoming,
        outgoing: 0, // Would need supplier invoice data
      },
      overdue: {
        incoming: overdueIncoming,
        outgoing: 0,
      },
    };
  }, [payments, reminders, getPaymentsByDateRange]);

  // Search payments
  const searchPayments = useCallback((query: string): Payment[] => {
    const q = query.toLowerCase();
    return payments.filter(p =>
      p.contactName.toLowerCase().includes(q) ||
      p.invoiceNumber?.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.reference?.toLowerCase().includes(q) ||
      p.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [payments]);

  // Export payments
  const exportPayments = useCallback((format: 'json' | 'csv' = 'json') => {
    if (format === 'csv') {
      const headers = ['Datum', 'Richtung', 'Kontakt', 'Betrag', 'Währung', 'Rechnung', 'Methode', 'Beschreibung', 'Abgestimmt'];
      const rows = payments.map(p => [
        p.date,
        p.direction === 'incoming' ? 'Eingang' : 'Ausgang',
        p.contactName,
        p.amount.toFixed(2),
        p.currency,
        p.invoiceNumber || '',
        PAYMENT_METHODS.find(m => m.value === p.method)?.label || p.method,
        p.description,
        p.isReconciled ? 'Ja' : 'Nein',
      ]);
      const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zahlungen_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = JSON.stringify(payments, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zahlungen_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [payments]);

  // Get payment totals by method
  const getByMethod = useCallback((direction?: PaymentDirection): { method: PaymentMethod; amount: number; count: number }[] => {
    const filtered = direction ? payments.filter(p => p.direction === direction) : payments;
    const byMethod: Record<PaymentMethod, { amount: number; count: number }> = {} as any;

    filtered.forEach(p => {
      if (!byMethod[p.method]) {
        byMethod[p.method] = { amount: 0, count: 0 };
      }
      byMethod[p.method].amount += p.amount;
      byMethod[p.method].count++;
    });

    return Object.entries(byMethod)
      .map(([method, data]) => ({ method: method as PaymentMethod, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [payments]);

  return {
    payments,
    reminders,
    paymentPlans,
    isLoading,
    recordPayment,
    updatePayment,
    deletePayment,
    reconcilePayment,
    getPaymentsByInvoice,
    getPaymentsByContact,
    getPaymentsByDateRange,
    getUnreconciledPayments,
    createReminder,
    markReminderSent,
    deleteReminder,
    createPaymentPlan,
    recordInstallmentPayment,
    getStats,
    searchPayments,
    exportPayments,
    getByMethod,
  };
}
