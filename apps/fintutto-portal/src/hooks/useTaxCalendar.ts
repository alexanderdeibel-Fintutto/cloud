import { useState, useCallback, useEffect, useMemo } from 'react';
import { addMonths, addDays, format, startOfMonth, endOfMonth, isWithinInterval, isBefore, isAfter, differenceInDays } from 'date-fns';

export type TaxDeadlineType =
  | 'ustva' | 'ust-jahres' | 'ust-vorauszahlung'
  | 'gewerbesteuer' | 'koerperschaftsteuer' | 'einkommensteuer'
  | 'lohnsteuer' | 'sozialversicherung'
  | 'bilanz' | 'jahresabschluss' | 'offenlegung'
  | 'grundsteuer' | 'kfzsteuer'
  | 'custom';

export type TaxDeadlineStatus = 'upcoming' | 'due' | 'overdue' | 'completed';

export interface TaxDeadline {
  id: string;
  type: TaxDeadlineType;
  title: string;
  description?: string;
  dueDate: string;
  reminderDays: number;
  status: TaxDeadlineStatus;
  completedAt?: string;
  amount?: number;
  notes?: string;
  recurring: boolean;
  recurrenceMonths?: number;
  filingRequired: boolean;
  paymentRequired: boolean;
}

const TYPE_LABELS: Record<TaxDeadlineType, { de: string; en: string }> = {
  ustva: { de: 'Umsatzsteuer-Voranmeldung', en: 'VAT Return' },
  'ust-jahres': { de: 'Umsatzsteuer-Jahreserklärung', en: 'Annual VAT Return' },
  'ust-vorauszahlung': { de: 'Umsatzsteuer-Vorauszahlung', en: 'VAT Prepayment' },
  gewerbesteuer: { de: 'Gewerbesteuer', en: 'Trade Tax' },
  koerperschaftsteuer: { de: 'Körperschaftsteuer', en: 'Corporate Tax' },
  einkommensteuer: { de: 'Einkommensteuer', en: 'Income Tax' },
  lohnsteuer: { de: 'Lohnsteuer', en: 'Payroll Tax' },
  sozialversicherung: { de: 'Sozialversicherung', en: 'Social Insurance' },
  bilanz: { de: 'Bilanzabgabe', en: 'Balance Sheet Filing' },
  jahresabschluss: { de: 'Jahresabschluss', en: 'Annual Financial Statement' },
  offenlegung: { de: 'Offenlegung', en: 'Disclosure' },
  grundsteuer: { de: 'Grundsteuer', en: 'Property Tax' },
  kfzsteuer: { de: 'Kfz-Steuer', en: 'Vehicle Tax' },
  custom: { de: 'Sonstiges', en: 'Other' },
};

const STORAGE_KEY = 'fintutto_tax_calendar';

// Generate standard German tax deadlines
function generateDefaultDeadlines(year: number): TaxDeadline[] {
  const deadlines: TaxDeadline[] = [];
  const now = new Date();

  // UStVA - monthly on 10th of following month (with Dauerfristverlängerung: +1 month)
  for (let month = 0; month < 12; month++) {
    const baseDate = new Date(year, month + 1, 10); // 10th of next month
    const extendedDate = addMonths(baseDate, 1); // With extension

    deadlines.push({
      id: `ustva_${year}_${month + 1}`,
      type: 'ustva',
      title: `UStVA ${format(new Date(year, month, 1), 'MMMM yyyy')}`,
      description: 'Umsatzsteuer-Voranmeldung für den Vormonat',
      dueDate: extendedDate.toISOString(),
      reminderDays: 7,
      status: isBefore(extendedDate, now) ? 'overdue' : 'upcoming',
      recurring: true,
      recurrenceMonths: 1,
      filingRequired: true,
      paymentRequired: true,
    });
  }

  // Lohnsteuer - monthly on 10th
  for (let month = 0; month < 12; month++) {
    const dueDate = new Date(year, month + 1, 10);

    deadlines.push({
      id: `lohnsteuer_${year}_${month + 1}`,
      type: 'lohnsteuer',
      title: `Lohnsteuer ${format(new Date(year, month, 1), 'MMMM yyyy')}`,
      description: 'Lohnsteuer-Anmeldung und -Zahlung',
      dueDate: dueDate.toISOString(),
      reminderDays: 5,
      status: isBefore(dueDate, now) ? 'overdue' : 'upcoming',
      recurring: true,
      recurrenceMonths: 1,
      filingRequired: true,
      paymentRequired: true,
    });
  }

  // Sozialversicherung - monthly by end of month
  for (let month = 0; month < 12; month++) {
    const dueDate = endOfMonth(new Date(year, month, 1));

    deadlines.push({
      id: `sozialversicherung_${year}_${month + 1}`,
      type: 'sozialversicherung',
      title: `SV-Beiträge ${format(new Date(year, month, 1), 'MMMM yyyy')}`,
      description: 'Sozialversicherungsbeiträge',
      dueDate: dueDate.toISOString(),
      reminderDays: 3,
      status: isBefore(dueDate, now) ? 'overdue' : 'upcoming',
      recurring: true,
      recurrenceMonths: 1,
      filingRequired: false,
      paymentRequired: true,
    });
  }

  // Quarterly Gewerbesteuer Vorauszahlung (Feb 15, May 15, Aug 15, Nov 15)
  const gewerbesteuerDates = [
    new Date(year, 1, 15), // Feb 15
    new Date(year, 4, 15), // May 15
    new Date(year, 7, 15), // Aug 15
    new Date(year, 10, 15), // Nov 15
  ];

  gewerbesteuerDates.forEach((date, index) => {
    deadlines.push({
      id: `gewerbesteuer_${year}_q${index + 1}`,
      type: 'gewerbesteuer',
      title: `Gewerbesteuer Q${index + 1}/${year}`,
      description: 'Vierteljährliche Gewerbesteuer-Vorauszahlung',
      dueDate: date.toISOString(),
      reminderDays: 10,
      status: isBefore(date, now) ? 'overdue' : 'upcoming',
      recurring: true,
      recurrenceMonths: 3,
      filingRequired: false,
      paymentRequired: true,
    });
  });

  // Quarterly Einkommensteuer/Körperschaftsteuer Vorauszahlung
  const estDates = [
    new Date(year, 2, 10), // Mar 10
    new Date(year, 5, 10), // Jun 10
    new Date(year, 8, 10), // Sep 10
    new Date(year, 11, 10), // Dec 10
  ];

  estDates.forEach((date, index) => {
    deadlines.push({
      id: `est_${year}_q${index + 1}`,
      type: 'einkommensteuer',
      title: `ESt-Vorauszahlung Q${index + 1}/${year}`,
      description: 'Vierteljährliche Einkommensteuer-Vorauszahlung',
      dueDate: date.toISOString(),
      reminderDays: 10,
      status: isBefore(date, now) ? 'overdue' : 'upcoming',
      recurring: true,
      recurrenceMonths: 3,
      filingRequired: false,
      paymentRequired: true,
    });
  });

  // Jahresabschluss (depends on fiscal year - assuming calendar year)
  // Smaller companies: 6 months after fiscal year end
  // Larger companies: 3 months after fiscal year end
  deadlines.push({
    id: `jahresabschluss_${year - 1}`,
    type: 'jahresabschluss',
    title: `Jahresabschluss ${year - 1}`,
    description: 'Erstellung des Jahresabschlusses',
    dueDate: new Date(year, 5, 30).toISOString(), // June 30
    reminderDays: 30,
    status: isBefore(new Date(year, 5, 30), now) ? 'overdue' : 'upcoming',
    recurring: true,
    recurrenceMonths: 12,
    filingRequired: true,
    paymentRequired: false,
  });

  // Offenlegung im Bundesanzeiger (12 months after fiscal year end)
  deadlines.push({
    id: `offenlegung_${year - 1}`,
    type: 'offenlegung',
    title: `Offenlegung ${year - 1}`,
    description: 'Veröffentlichung im Bundesanzeiger',
    dueDate: new Date(year, 11, 31).toISOString(), // Dec 31
    reminderDays: 60,
    status: isBefore(new Date(year, 11, 31), now) ? 'overdue' : 'upcoming',
    recurring: true,
    recurrenceMonths: 12,
    filingRequired: true,
    paymentRequired: false,
  });

  // USt-Jahreserklärung (July 31 of following year)
  deadlines.push({
    id: `ust_jahres_${year - 1}`,
    type: 'ust-jahres',
    title: `Umsatzsteuer-Jahreserklärung ${year - 1}`,
    description: 'Jährliche Umsatzsteuererklärung',
    dueDate: new Date(year, 6, 31).toISOString(), // July 31
    reminderDays: 30,
    status: isBefore(new Date(year, 6, 31), now) ? 'overdue' : 'upcoming',
    recurring: true,
    recurrenceMonths: 12,
    filingRequired: true,
    paymentRequired: true,
  });

  return deadlines;
}

export function useTaxCalendar() {
  const currentYear = new Date().getFullYear();

  const [deadlines, setDeadlines] = useState<TaxDeadline[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Generate default deadlines for current and next year
    return [
      ...generateDefaultDeadlines(currentYear),
      ...generateDefaultDeadlines(currentYear + 1),
    ];
  });

  const [settings, setSettings] = useState({
    defaultReminderDays: 7,
    emailReminders: true,
    pushReminders: true,
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deadlines));
  }, [deadlines]);

  // Update status based on current date
  const updateStatuses = useCallback(() => {
    const now = new Date();

    setDeadlines(prev => prev.map(deadline => {
      if (deadline.status === 'completed') return deadline;

      const dueDate = new Date(deadline.dueDate);
      const daysUntilDue = differenceInDays(dueDate, now);

      let status: TaxDeadlineStatus;
      if (isBefore(dueDate, now)) {
        status = 'overdue';
      } else if (daysUntilDue <= deadline.reminderDays) {
        status = 'due';
      } else {
        status = 'upcoming';
      }

      return { ...deadline, status };
    }));
  }, []);

  // Update on mount and periodically
  useEffect(() => {
    updateStatuses();
    const interval = setInterval(updateStatuses, 1000 * 60 * 60); // Every hour
    return () => clearInterval(interval);
  }, [updateStatuses]);

  // Mark as completed
  const completeDeadline = useCallback((id: string) => {
    setDeadlines(prev => prev.map(d =>
      d.id === id ? { ...d, status: 'completed' as TaxDeadlineStatus, completedAt: new Date().toISOString() } : d
    ));
  }, []);

  // Add custom deadline
  const addDeadline = useCallback((deadline: Omit<TaxDeadline, 'id' | 'status'>): TaxDeadline => {
    const now = new Date();
    const dueDate = new Date(deadline.dueDate);
    const daysUntilDue = differenceInDays(dueDate, now);

    let status: TaxDeadlineStatus;
    if (isBefore(dueDate, now)) {
      status = 'overdue';
    } else if (daysUntilDue <= deadline.reminderDays) {
      status = 'due';
    } else {
      status = 'upcoming';
    }

    const newDeadline: TaxDeadline = {
      ...deadline,
      id: `custom_${Date.now()}`,
      status,
    };

    setDeadlines(prev => [...prev, newDeadline]);
    return newDeadline;
  }, []);

  // Update deadline
  const updateDeadline = useCallback((id: string, updates: Partial<TaxDeadline>) => {
    setDeadlines(prev => prev.map(d =>
      d.id === id ? { ...d, ...updates } : d
    ));
  }, []);

  // Delete deadline
  const deleteDeadline = useCallback((id: string) => {
    setDeadlines(prev => prev.filter(d => d.id !== id));
  }, []);

  // Get deadlines for a month
  const getDeadlinesForMonth = useCallback((year: number, month: number): TaxDeadline[] => {
    const start = startOfMonth(new Date(year, month, 1));
    const end = endOfMonth(new Date(year, month, 1));

    return deadlines.filter(d => {
      const dueDate = new Date(d.dueDate);
      return isWithinInterval(dueDate, { start, end });
    });
  }, [deadlines]);

  // Get upcoming deadlines
  const getUpcomingDeadlines = useCallback((days: number = 30): TaxDeadline[] => {
    const now = new Date();
    const futureDate = addDays(now, days);

    return deadlines
      .filter(d => {
        if (d.status === 'completed') return false;
        const dueDate = new Date(d.dueDate);
        return isWithinInterval(dueDate, { start: now, end: futureDate }) || isBefore(dueDate, now);
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [deadlines]);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const overdue = deadlines.filter(d => d.status === 'overdue');
    const due = deadlines.filter(d => d.status === 'due');
    const upcoming = deadlines.filter(d => d.status === 'upcoming');
    const completed = deadlines.filter(d => d.status === 'completed');

    const thisMonth = getDeadlinesForMonth(now.getFullYear(), now.getMonth());
    const nextMonth = getDeadlinesForMonth(now.getFullYear(), now.getMonth() + 1);

    return {
      total: deadlines.length,
      overdue: overdue.length,
      due: due.length,
      upcoming: upcoming.length,
      completed: completed.length,
      thisMonth: thisMonth.length,
      nextMonth: nextMonth.length,
      pendingPayments: deadlines.filter(d => d.paymentRequired && d.status !== 'completed').length,
      pendingFilings: deadlines.filter(d => d.filingRequired && d.status !== 'completed').length,
    };
  }, [deadlines, getDeadlinesForMonth]);

  return {
    deadlines,
    completeDeadline,
    addDeadline,
    updateDeadline,
    deleteDeadline,
    getDeadlinesForMonth,
    getUpcomingDeadlines,
    stats,
    settings,
    setSettings,
    typeLabels: TYPE_LABELS,
  };
}
