import { useState, useCallback, useEffect } from 'react';

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
export type RecurringStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface RecurringBooking {
  id: string;
  name: string;
  description?: string;
  amount: number;
  sollKonto: string;
  habenKonto: string;
  costCenterId?: string;
  taxRate: number;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  nextExecution: string;
  lastExecution?: string;
  executionCount: number;
  maxExecutions?: number;
  dayOfMonth?: number; // For monthly/quarterly/yearly
  dayOfWeek?: number; // For weekly (0-6)
  status: RecurringStatus;
  autoBook: boolean; // Automatically create booking or just notify
  notifyDaysBefore: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExecutedBooking {
  id: string;
  recurringId: string;
  recurringName: string;
  executionDate: string;
  amount: number;
  sollKonto: string;
  habenKonto: string;
  bookingId?: string; // Reference to actual booking if auto-booked
  status: 'pending' | 'executed' | 'skipped' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

const STORAGE_KEY = 'fintutto_recurring_bookings';

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  biweekly: 'Alle 2 Wochen',
  monthly: 'Monatlich',
  quarterly: 'Vierteljährlich',
  yearly: 'Jährlich',
};

export const STATUS_LABELS: Record<RecurringStatus, string> = {
  active: 'Aktiv',
  paused: 'Pausiert',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
};

const DEFAULT_RECURRING: RecurringBooking[] = [
  {
    id: 'rec-1',
    name: 'Büromiete',
    description: 'Monatliche Miete für Büroräume',
    amount: 1500,
    sollKonto: '4210',
    habenKonto: '1200',
    taxRate: 19,
    frequency: 'monthly',
    startDate: '2024-01-01',
    nextExecution: '2024-02-01',
    lastExecution: '2024-01-01',
    executionCount: 1,
    dayOfMonth: 1,
    status: 'active',
    autoBook: true,
    notifyDaysBefore: 3,
    tags: ['miete', 'fixkosten'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-2',
    name: 'Telefonkosten',
    description: 'Monatliche Telefonrechnung',
    amount: 89.99,
    sollKonto: '4920',
    habenKonto: '1200',
    taxRate: 19,
    frequency: 'monthly',
    startDate: '2024-01-15',
    nextExecution: '2024-02-15',
    lastExecution: '2024-01-15',
    executionCount: 1,
    dayOfMonth: 15,
    status: 'active',
    autoBook: false,
    notifyDaysBefore: 5,
    tags: ['telekommunikation'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-3',
    name: 'Versicherungsprämie',
    description: 'Jährliche Betriebshaftpflicht',
    amount: 2400,
    sollKonto: '4360',
    habenKonto: '1200',
    taxRate: 19,
    frequency: 'yearly',
    startDate: '2024-01-01',
    nextExecution: '2025-01-01',
    lastExecution: '2024-01-01',
    executionCount: 1,
    dayOfMonth: 1,
    status: 'active',
    autoBook: false,
    notifyDaysBefore: 14,
    tags: ['versicherung', 'jährlich'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useRecurringBookings() {
  const [bookings, setBookings] = useState<RecurringBooking[]>([]);
  const [executions, setExecutions] = useState<ExecutedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setBookings(data.bookings || DEFAULT_RECURRING);
        setExecutions(data.executions || []);
      } catch {
        setBookings(DEFAULT_RECURRING);
      }
    } else {
      setBookings(DEFAULT_RECURRING);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((
    newBookings?: RecurringBooking[],
    newExecutions?: ExecutedBooking[]
  ) => {
    const data = {
      bookings: newBookings || bookings,
      executions: newExecutions || executions,
    };
    if (newBookings) setBookings(newBookings);
    if (newExecutions) setExecutions(newExecutions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [bookings, executions]);

  // Calculate next execution date
  const calculateNextExecution = useCallback((booking: RecurringBooking, fromDate: Date = new Date()): string => {
    const date = new Date(fromDate);

    switch (booking.frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        if (booking.dayOfMonth) {
          date.setDate(Math.min(booking.dayOfMonth, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
        }
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        if (booking.dayOfMonth) {
          date.setDate(Math.min(booking.dayOfMonth, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
        }
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        if (booking.dayOfMonth) {
          date.setDate(Math.min(booking.dayOfMonth, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
        }
        break;
    }

    return date.toISOString().split('T')[0];
  }, []);

  // Create recurring booking
  const createBooking = useCallback((booking: Omit<RecurringBooking, 'id' | 'executionCount' | 'createdAt' | 'updatedAt'>) => {
    const newBooking: RecurringBooking = {
      ...booking,
      id: `rec-${Date.now()}`,
      executionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveData([...bookings, newBooking]);
    return newBooking;
  }, [bookings, saveData]);

  // Update recurring booking
  const updateBooking = useCallback((id: string, updates: Partial<RecurringBooking>) => {
    saveData(bookings.map(b =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    ));
  }, [bookings, saveData]);

  // Delete recurring booking
  const deleteBooking = useCallback((id: string) => {
    saveData(
      bookings.filter(b => b.id !== id),
      executions.filter(e => e.recurringId !== id)
    );
  }, [bookings, executions, saveData]);

  // Pause/Resume booking
  const toggleStatus = useCallback((id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    const newStatus: RecurringStatus = booking.status === 'active' ? 'paused' : 'active';
    updateBooking(id, { status: newStatus });
  }, [bookings, updateBooking]);

  // Execute booking
  const executeBooking = useCallback((id: string): ExecutedBooking | null => {
    const booking = bookings.find(b => b.id === id);
    if (!booking || booking.status !== 'active') return null;

    const execution: ExecutedBooking = {
      id: `exec-${Date.now()}`,
      recurringId: booking.id,
      recurringName: booking.name,
      executionDate: new Date().toISOString().split('T')[0],
      amount: booking.amount,
      sollKonto: booking.sollKonto,
      habenKonto: booking.habenKonto,
      status: booking.autoBook ? 'executed' : 'pending',
      createdAt: new Date().toISOString(),
    };

    // Update booking with next execution date
    const nextExecution = calculateNextExecution(booking, new Date());
    const newExecutionCount = booking.executionCount + 1;

    let newStatus: RecurringStatus = booking.status;
    if (booking.maxExecutions && newExecutionCount >= booking.maxExecutions) {
      newStatus = 'completed';
    }
    if (booking.endDate && new Date(nextExecution) > new Date(booking.endDate)) {
      newStatus = 'completed';
    }

    const updatedBookings = bookings.map(b =>
      b.id === id ? {
        ...b,
        lastExecution: execution.executionDate,
        nextExecution,
        executionCount: newExecutionCount,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      } : b
    );

    saveData(updatedBookings, [...executions, execution]);
    return execution;
  }, [bookings, executions, calculateNextExecution, saveData]);

  // Skip execution
  const skipExecution = useCallback((id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    const execution: ExecutedBooking = {
      id: `exec-${Date.now()}`,
      recurringId: booking.id,
      recurringName: booking.name,
      executionDate: new Date().toISOString().split('T')[0],
      amount: booking.amount,
      sollKonto: booking.sollKonto,
      habenKonto: booking.habenKonto,
      status: 'skipped',
      createdAt: new Date().toISOString(),
    };

    const nextExecution = calculateNextExecution(booking, new Date());

    const updatedBookings = bookings.map(b =>
      b.id === id ? {
        ...b,
        nextExecution,
        updatedAt: new Date().toISOString(),
      } : b
    );

    saveData(updatedBookings, [...executions, execution]);
  }, [bookings, executions, calculateNextExecution, saveData]);

  // Get due bookings (next execution is today or in the past)
  const getDueBookings = useCallback((): RecurringBooking[] => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b =>
      b.status === 'active' && b.nextExecution <= today
    );
  }, [bookings]);

  // Get upcoming bookings (within X days)
  const getUpcomingBookings = useCallback((days: number = 7): RecurringBooking[] => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    return bookings.filter(b =>
      b.status === 'active' &&
      b.nextExecution > todayStr &&
      b.nextExecution <= futureDateStr
    ).sort((a, b) => a.nextExecution.localeCompare(b.nextExecution));
  }, [bookings]);

  // Get notifications (bookings due for notification)
  const getNotifications = useCallback((): RecurringBooking[] => {
    const today = new Date();

    return bookings.filter(b => {
      if (b.status !== 'active') return false;

      const nextExec = new Date(b.nextExecution);
      const notifyDate = new Date(nextExec);
      notifyDate.setDate(notifyDate.getDate() - b.notifyDaysBefore);

      return today >= notifyDate && today < nextExec;
    });
  }, [bookings]);

  // Get execution history for a booking
  const getExecutionHistory = useCallback((bookingId: string): ExecutedBooking[] => {
    return executions
      .filter(e => e.recurringId === bookingId)
      .sort((a, b) => b.executionDate.localeCompare(a.executionDate));
  }, [executions]);

  // Get summary
  const getSummary = useCallback(() => {
    const active = bookings.filter(b => b.status === 'active');
    const paused = bookings.filter(b => b.status === 'paused');
    const due = getDueBookings();
    const upcoming = getUpcomingBookings(7);

    const monthlyTotal = active.reduce((sum, b) => {
      let monthlyAmount = b.amount;
      switch (b.frequency) {
        case 'daily': monthlyAmount *= 30; break;
        case 'weekly': monthlyAmount *= 4; break;
        case 'biweekly': monthlyAmount *= 2; break;
        case 'quarterly': monthlyAmount /= 3; break;
        case 'yearly': monthlyAmount /= 12; break;
      }
      return sum + monthlyAmount;
    }, 0);

    const yearlyTotal = monthlyTotal * 12;

    return {
      totalBookings: bookings.length,
      activeCount: active.length,
      pausedCount: paused.length,
      dueCount: due.length,
      upcomingCount: upcoming.length,
      monthlyTotal,
      yearlyTotal,
      totalExecutions: executions.length,
    };
  }, [bookings, executions, getDueBookings, getUpcomingBookings]);

  // Search bookings
  const searchBookings = useCallback((query: string): RecurringBooking[] => {
    const q = query.toLowerCase();
    return bookings.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      b.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [bookings]);

  // Export bookings
  const exportBookings = useCallback(() => {
    const headers = ['Name', 'Betrag', 'Soll-Konto', 'Haben-Konto', 'Frequenz', 'Status', 'Nächste Ausführung'];
    const rows = bookings.map(b => [
      b.name,
      b.amount.toFixed(2),
      b.sollKonto,
      b.habenKonto,
      FREQUENCY_LABELS[b.frequency],
      STATUS_LABELS[b.status],
      b.nextExecution,
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dauerbuchungen_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bookings]);

  return {
    bookings,
    executions,
    isLoading,
    createBooking,
    updateBooking,
    deleteBooking,
    toggleStatus,
    executeBooking,
    skipExecution,
    getDueBookings,
    getUpcomingBookings,
    getNotifications,
    getExecutionHistory,
    getSummary,
    searchBookings,
    exportBookings,
  };
}
