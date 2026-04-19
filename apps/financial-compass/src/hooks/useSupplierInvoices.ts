import { useState, useCallback, useEffect } from 'react';

export type InvoiceStatus = 'draft' | 'received' | 'reviewed' | 'approved' | 'paid' | 'disputed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierId?: string;
  supplierVatId?: string;
  invoiceDate: string;
  receivedDate: string;
  dueDate: string;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
  taxRate: number;
  currency: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  description: string;
  category?: string;
  costCenter?: string;
  accountNumber?: string;
  documentUrl?: string;
  payments: InvoicePayment[];
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  bookedAt?: string;
  bookingId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePayment {
  id: string;
  date: string;
  amount: number;
  method: 'bank' | 'cash' | 'card' | 'sepa';
  reference?: string;
  notes?: string;
}

export interface SupplierInvoiceSummary {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  openAmount: number;
  overdueAmount: number;
  overdueCount: number;
  byStatus: Record<InvoiceStatus, number>;
  byMonth: { month: string; amount: number }[];
}

const STORAGE_KEY = 'fintutto_supplier_invoices';

const DEFAULT_INVOICES: SupplierInvoice[] = [
  {
    id: 'sinv-1',
    invoiceNumber: 'R-2024-0815',
    supplierName: 'Telekom Deutschland GmbH',
    supplierVatId: 'DE123456789',
    invoiceDate: '2024-01-15',
    receivedDate: '2024-01-17',
    dueDate: '2024-02-15',
    netAmount: 89.90,
    taxAmount: 17.08,
    grossAmount: 106.98,
    taxRate: 19,
    currency: 'EUR',
    status: 'paid',
    paymentStatus: 'paid',
    paidAmount: 106.98,
    description: 'Telefonrechnung Januar 2024',
    category: 'Telekommunikation',
    accountNumber: '4920',
    payments: [
      { id: 'p1', date: '2024-02-10', amount: 106.98, method: 'sepa' }
    ],
    tags: ['telefon', 'monatlich'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sinv-2',
    invoiceNumber: '2024-1234',
    supplierName: 'Büro Schmidt GmbH',
    invoiceDate: '2024-01-20',
    receivedDate: '2024-01-22',
    dueDate: '2024-02-20',
    netAmount: 250.00,
    taxAmount: 47.50,
    grossAmount: 297.50,
    taxRate: 19,
    currency: 'EUR',
    status: 'approved',
    paymentStatus: 'unpaid',
    paidAmount: 0,
    description: 'Büromaterial Q1',
    category: 'Bürobedarf',
    accountNumber: '4930',
    payments: [],
    tags: ['büro'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sinv-3',
    invoiceNumber: 'M-2024-001',
    supplierName: 'Immobilien Meier',
    invoiceDate: '2024-02-01',
    receivedDate: '2024-02-01',
    dueDate: '2024-02-05',
    netAmount: 1500.00,
    taxAmount: 0,
    grossAmount: 1500.00,
    taxRate: 0,
    currency: 'EUR',
    status: 'paid',
    paymentStatus: 'paid',
    paidAmount: 1500.00,
    description: 'Miete Februar 2024',
    category: 'Miete',
    accountNumber: '4210',
    payments: [
      { id: 'p1', date: '2024-02-03', amount: 1500.00, method: 'sepa' }
    ],
    tags: ['miete', 'monatlich'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INVOICE_CATEGORIES = [
  'Miete',
  'Nebenkosten',
  'Telekommunikation',
  'Bürobedarf',
  'EDV & Software',
  'Beratung',
  'Versicherungen',
  'Kfz-Kosten',
  'Reisekosten',
  'Werbung',
  'Reparaturen',
  'Sonstige',
];

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Entwurf',
  received: 'Eingegangen',
  reviewed: 'Geprüft',
  approved: 'Freigegeben',
  paid: 'Bezahlt',
  disputed: 'Beanstandet',
  cancelled: 'Storniert',
};

export const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  received: 'bg-blue-100 text-blue-800',
  reviewed: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  paid: 'bg-emerald-100 text-emerald-800',
  disputed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

export function useSupplierInvoices() {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setInvoices(JSON.parse(stored));
      } catch {
        setInvoices(DEFAULT_INVOICES);
      }
    } else {
      setInvoices(DEFAULT_INVOICES);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveInvoices = useCallback((newInvoices: SupplierInvoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newInvoices));
  }, []);

  // Calculate payment status based on amounts and due date
  const calculatePaymentStatus = useCallback((invoice: Partial<SupplierInvoice>): PaymentStatus => {
    const paidAmount = invoice.paidAmount || 0;
    const grossAmount = invoice.grossAmount || 0;
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date();
    const today = new Date();

    if (paidAmount >= grossAmount) return 'paid';
    if (paidAmount > 0) return 'partial';
    if (dueDate < today) return 'overdue';
    return 'unpaid';
  }, []);

  // Create invoice
  const createInvoice = useCallback((invoice: Omit<SupplierInvoice, 'id' | 'payments' | 'paidAmount' | 'paymentStatus' | 'createdAt' | 'updatedAt'>) => {
    const newInvoice: SupplierInvoice = {
      ...invoice,
      id: `sinv-${Date.now()}`,
      payments: [],
      paidAmount: 0,
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newInvoice.paymentStatus = calculatePaymentStatus(newInvoice);
    saveInvoices([...invoices, newInvoice]);
    return newInvoice;
  }, [invoices, saveInvoices, calculatePaymentStatus]);

  // Update invoice
  const updateInvoice = useCallback((id: string, updates: Partial<SupplierInvoice>) => {
    saveInvoices(invoices.map(inv => {
      if (inv.id === id) {
        const updated = { ...inv, ...updates, updatedAt: new Date().toISOString() };
        updated.paymentStatus = calculatePaymentStatus(updated);
        return updated;
      }
      return inv;
    }));
  }, [invoices, saveInvoices, calculatePaymentStatus]);

  // Delete invoice
  const deleteInvoice = useCallback((id: string) => {
    saveInvoices(invoices.filter(inv => inv.id !== id));
  }, [invoices, saveInvoices]);

  // Add payment
  const addPayment = useCallback((invoiceId: string, payment: Omit<InvoicePayment, 'id'>) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return null;

    const newPayment: InvoicePayment = {
      ...payment,
      id: `pay-${Date.now()}`,
    };

    const newPaidAmount = invoice.paidAmount + payment.amount;
    const newStatus: InvoiceStatus = newPaidAmount >= invoice.grossAmount ? 'paid' : invoice.status;

    updateInvoice(invoiceId, {
      payments: [...invoice.payments, newPayment],
      paidAmount: newPaidAmount,
      status: newStatus,
    });

    return newPayment;
  }, [invoices, updateInvoice]);

  // Remove payment
  const removePayment = useCallback((invoiceId: string, paymentId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const payment = invoice.payments.find(p => p.id === paymentId);
    if (!payment) return;

    updateInvoice(invoiceId, {
      payments: invoice.payments.filter(p => p.id !== paymentId),
      paidAmount: invoice.paidAmount - payment.amount,
      status: invoice.status === 'paid' ? 'approved' : invoice.status,
    });
  }, [invoices, updateInvoice]);

  // Approve invoice
  const approveInvoice = useCallback((id: string, approver: string) => {
    updateInvoice(id, {
      status: 'approved',
      approvedBy: approver,
      approvedAt: new Date().toISOString(),
    });
  }, [updateInvoice]);

  // Mark as booked
  const markAsBooked = useCallback((id: string, bookingId: string) => {
    updateInvoice(id, {
      bookedAt: new Date().toISOString(),
      bookingId,
    });
  }, [updateInvoice]);

  // Get overdue invoices
  const getOverdueInvoices = useCallback((): SupplierInvoice[] => {
    const today = new Date();
    return invoices.filter(inv =>
      inv.paymentStatus !== 'paid' &&
      inv.status !== 'cancelled' &&
      new Date(inv.dueDate) < today
    );
  }, [invoices]);

  // Get invoices due soon
  const getDueSoon = useCallback((days = 7): SupplierInvoice[] => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return invoices.filter(inv =>
      inv.paymentStatus !== 'paid' &&
      inv.status !== 'cancelled' &&
      new Date(inv.dueDate) >= today &&
      new Date(inv.dueDate) <= futureDate
    );
  }, [invoices]);

  // Get invoices by status
  const getByStatus = useCallback((status: InvoiceStatus): SupplierInvoice[] => {
    return invoices.filter(inv => inv.status === status);
  }, [invoices]);

  // Get invoices by supplier
  const getBySupplier = useCallback((supplierName: string): SupplierInvoice[] => {
    return invoices.filter(inv =>
      inv.supplierName.toLowerCase().includes(supplierName.toLowerCase())
    );
  }, [invoices]);

  // Search invoices
  const searchInvoices = useCallback((query: string): SupplierInvoice[] => {
    const q = query.toLowerCase();
    return invoices.filter(inv =>
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.supplierName.toLowerCase().includes(q) ||
      inv.description.toLowerCase().includes(q) ||
      inv.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [invoices]);

  // Get summary
  const getSummary = useCallback((): SupplierInvoiceSummary => {
    const today = new Date();
    const byStatus: Record<InvoiceStatus, number> = {
      draft: 0,
      received: 0,
      reviewed: 0,
      approved: 0,
      paid: 0,
      disputed: 0,
      cancelled: 0,
    };

    let totalAmount = 0;
    let paidAmount = 0;
    let overdueAmount = 0;
    let overdueCount = 0;

    const monthlyTotals: Record<string, number> = {};

    invoices.forEach(inv => {
      byStatus[inv.status]++;
      totalAmount += inv.grossAmount;
      paidAmount += inv.paidAmount;

      if (inv.paymentStatus === 'overdue') {
        overdueAmount += inv.grossAmount - inv.paidAmount;
        overdueCount++;
      }

      const month = inv.invoiceDate.substring(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] || 0) + inv.grossAmount;
    });

    const byMonth = Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => ({ month, amount }));

    return {
      totalInvoices: invoices.length,
      totalAmount,
      paidAmount,
      openAmount: totalAmount - paidAmount,
      overdueAmount,
      overdueCount,
      byStatus,
      byMonth,
    };
  }, [invoices]);

  // Get suppliers list
  const getSuppliers = useCallback((): { name: string; count: number; totalAmount: number }[] => {
    const suppliers: Record<string, { count: number; totalAmount: number }> = {};

    invoices.forEach(inv => {
      if (!suppliers[inv.supplierName]) {
        suppliers[inv.supplierName] = { count: 0, totalAmount: 0 };
      }
      suppliers[inv.supplierName].count++;
      suppliers[inv.supplierName].totalAmount += inv.grossAmount;
    });

    return Object.entries(suppliers)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [invoices]);

  // Export invoices
  const exportInvoices = useCallback((format: 'json' | 'csv' = 'json') => {
    if (format === 'csv') {
      const headers = ['Rechnungsnummer', 'Lieferant', 'Datum', 'Fällig', 'Netto', 'MwSt', 'Brutto', 'Status', 'Bezahlt'];
      const rows = invoices.map(inv => [
        inv.invoiceNumber,
        inv.supplierName,
        inv.invoiceDate,
        inv.dueDate,
        inv.netAmount.toFixed(2),
        inv.taxAmount.toFixed(2),
        inv.grossAmount.toFixed(2),
        STATUS_LABELS[inv.status],
        inv.paidAmount.toFixed(2),
      ]);
      const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eingangsrechnungen_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = JSON.stringify(invoices, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eingangsrechnungen_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [invoices]);

  return {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    addPayment,
    removePayment,
    approveInvoice,
    markAsBooked,
    getOverdueInvoices,
    getDueSoon,
    getByStatus,
    getBySupplier,
    searchInvoices,
    getSummary,
    getSuppliers,
    exportInvoices,
  };
}
