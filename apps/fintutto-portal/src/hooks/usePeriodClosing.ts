import { useState, useEffect, useCallback } from 'react';

export type ClosingPeriodType = 'month' | 'quarter' | 'year';
export type ClosingStatus = 'open' | 'in_progress' | 'review' | 'closed' | 'locked';

export interface ClosingTask {
  id: string;
  name: string;
  description: string;
  category: string;
  order: number;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface PeriodClosing {
  id: string;
  type: ClosingPeriodType;
  year: number;
  month?: number;
  quarter?: number;
  status: ClosingStatus;
  tasks: ClosingTask[];
  startedAt?: string;
  startedBy?: string;
  closedAt?: string;
  closedBy?: string;
  lockedAt?: string;
  lockedBy?: string;
  notes?: string;
}

export const CLOSING_STATUS_LABELS: Record<ClosingStatus, string> = {
  open: 'Offen', in_progress: 'In Bearbeitung', review: 'Prüfung', closed: 'Abgeschlossen', locked: 'Gesperrt',
};

export const PERIOD_TYPE_LABELS: Record<ClosingPeriodType, string> = {
  month: 'Monat', quarter: 'Quartal', year: 'Jahr',
};

const MONTH_TASKS: Omit<ClosingTask, 'id' | 'isCompleted'>[] = [
  { name: 'Bankabstimmung', description: 'Alle Bankkonten abstimmen', category: 'Bank', order: 1, isRequired: true },
  { name: 'Offene Posten prüfen', description: 'Debitoren und Kreditoren abstimmen', category: 'Abstimmung', order: 2, isRequired: true },
  { name: 'Rechnungsabgrenzung', description: 'RAP Buchungen prüfen/erstellen', category: 'Abgrenzung', order: 3, isRequired: false },
  { name: 'USt-Voranmeldung', description: 'Umsatzsteuer-Voranmeldung erstellen', category: 'Steuern', order: 4, isRequired: true },
  { name: 'Kontenabstimmung', description: 'Salden der Hauptkonten prüfen', category: 'Abstimmung', order: 5, isRequired: true },
];

const QUARTER_TASKS: Omit<ClosingTask, 'id' | 'isCompleted'>[] = [
  ...MONTH_TASKS,
  { name: 'Quartalsabschluss BWA', description: 'BWA für das Quartal erstellen', category: 'Berichte', order: 6, isRequired: true },
  { name: 'Rückstellungen prüfen', description: 'Quartalsweise Rückstellungen anpassen', category: 'Abschluss', order: 7, isRequired: false },
];

const YEAR_TASKS: Omit<ClosingTask, 'id' | 'isCompleted'>[] = [
  ...QUARTER_TASKS,
  { name: 'Inventur', description: 'Jahresinventur durchführen', category: 'Inventur', order: 8, isRequired: true },
  { name: 'Abschreibungen', description: 'Jahresabschreibungen buchen', category: 'Abschluss', order: 9, isRequired: true },
  { name: 'Rückstellungen Jahresende', description: 'Alle Rückstellungen prüfen und buchen', category: 'Abschluss', order: 10, isRequired: true },
  { name: 'Bilanz erstellen', description: 'Jahresbilanz erstellen', category: 'Berichte', order: 11, isRequired: true },
  { name: 'GuV erstellen', description: 'Gewinn- und Verlustrechnung erstellen', category: 'Berichte', order: 12, isRequired: true },
  { name: 'Anhang erstellen', description: 'Anhang zum Jahresabschluss', category: 'Berichte', order: 13, isRequired: false },
  { name: 'Steuererklärungen', description: 'Körperschaftsteuer, Gewerbesteuer vorbereiten', category: 'Steuern', order: 14, isRequired: true },
  { name: 'DATEV-Export', description: 'Buchungen an Steuerberater exportieren', category: 'Export', order: 15, isRequired: false },
];

const STORAGE_KEY = 'fintutto_period_closing';

export function usePeriodClosing() {
  const [closings, setClosings] = useState<PeriodClosing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setClosings(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading period closings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveClosings = useCallback((newClosings: PeriodClosing[]) => {
    setClosings(newClosings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newClosings));
  }, []);

  const getTasksForType = (type: ClosingPeriodType): ClosingTask[] => {
    const templates = type === 'year' ? YEAR_TASKS : type === 'quarter' ? QUARTER_TASKS : MONTH_TASKS;
    return templates.map((t, i) => ({ ...t, id: `task-${i}`, isCompleted: false }));
  };

  const createClosing = useCallback((type: ClosingPeriodType, year: number, month?: number, quarter?: number): PeriodClosing => {
    const closing: PeriodClosing = {
      id: `closing-${Date.now()}`, type, year, month, quarter, status: 'open', tasks: getTasksForType(type),
    };
    saveClosings([...closings, closing]);
    return closing;
  }, [closings, saveClosings]);

  const startClosing = useCallback((id: string, startedBy: string): boolean => {
    const closing = closings.find(c => c.id === id);
    if (!closing || closing.status !== 'open') return false;
    saveClosings(closings.map(c => c.id === id ? { ...c, status: 'in_progress' as const, startedAt: new Date().toISOString(), startedBy } : c));
    return true;
  }, [closings, saveClosings]);

  const completeTask = useCallback((closingId: string, taskId: string, completedBy: string, notes?: string): boolean => {
    const closing = closings.find(c => c.id === closingId);
    if (!closing || closing.status === 'closed' || closing.status === 'locked') return false;
    const tasks = closing.tasks.map(t => t.id === taskId ? { ...t, isCompleted: true, completedAt: new Date().toISOString(), completedBy, notes } : t);
    saveClosings(closings.map(c => c.id === closingId ? { ...c, tasks } : c));
    return true;
  }, [closings, saveClosings]);

  const uncompleteTask = useCallback((closingId: string, taskId: string): boolean => {
    const closing = closings.find(c => c.id === closingId);
    if (!closing || closing.status === 'closed' || closing.status === 'locked') return false;
    const tasks = closing.tasks.map(t => t.id === taskId ? { ...t, isCompleted: false, completedAt: undefined, completedBy: undefined } : t);
    saveClosings(closings.map(c => c.id === closingId ? { ...c, tasks } : c));
    return true;
  }, [closings, saveClosings]);

  const submitForReview = useCallback((id: string): boolean => {
    const closing = closings.find(c => c.id === id);
    if (!closing || closing.status !== 'in_progress') return false;
    const requiredTasks = closing.tasks.filter(t => t.isRequired);
    if (!requiredTasks.every(t => t.isCompleted)) return false;
    saveClosings(closings.map(c => c.id === id ? { ...c, status: 'review' as const } : c));
    return true;
  }, [closings, saveClosings]);

  const closeClosing = useCallback((id: string, closedBy: string): boolean => {
    const closing = closings.find(c => c.id === id);
    if (!closing || closing.status !== 'review') return false;
    saveClosings(closings.map(c => c.id === id ? { ...c, status: 'closed' as const, closedAt: new Date().toISOString(), closedBy } : c));
    return true;
  }, [closings, saveClosings]);

  const lockClosing = useCallback((id: string, lockedBy: string): boolean => {
    const closing = closings.find(c => c.id === id);
    if (!closing || closing.status !== 'closed') return false;
    saveClosings(closings.map(c => c.id === id ? { ...c, status: 'locked' as const, lockedAt: new Date().toISOString(), lockedBy } : c));
    return true;
  }, [closings, saveClosings]);

  const getClosing = useCallback((type: ClosingPeriodType, year: number, month?: number, quarter?: number): PeriodClosing | undefined => {
    return closings.find(c => c.type === type && c.year === year && c.month === month && c.quarter === quarter);
  }, [closings]);

  const getProgress = useCallback((closing: PeriodClosing) => {
    const total = closing.tasks.length;
    const completed = closing.tasks.filter(t => t.isCompleted).length;
    const required = closing.tasks.filter(t => t.isRequired).length;
    const requiredCompleted = closing.tasks.filter(t => t.isRequired && t.isCompleted).length;
    return { total, completed, required, requiredCompleted, percent: total > 0 ? (completed / total) * 100 : 0 };
  }, []);

  return {
    closings, isLoading, createClosing, startClosing, completeTask, uncompleteTask,
    submitForReview, closeClosing, lockClosing, getClosing, getProgress,
  };
}
