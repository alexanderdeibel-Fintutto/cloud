import { useState, useCallback, useEffect } from 'react';

export type ClosingStep =
  | 'preparation'
  | 'inventory'
  | 'accruals'
  | 'depreciation'
  | 'provisions'
  | 'reconciliation'
  | 'adjustments'
  | 'closing_entries'
  | 'trial_balance'
  | 'financial_statements'
  | 'review'
  | 'completed';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked';

export interface ClosingTask {
  id: string;
  step: ClosingStep;
  title: string;
  description: string;
  status: TaskStatus;
  assignee?: string;
  dueDate?: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  blockedReason?: string;
  required: boolean;
  order: number;
}

export interface YearEndClosing {
  id: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  status: 'not_started' | 'in_progress' | 'review' | 'completed' | 'reopened';
  currentStep: ClosingStep;
  tasks: ClosingTask[];
  closingDate?: string;
  closedBy?: string;
  profitLoss?: number;
  notes?: string;
  documents: ClosingDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ClosingDocument {
  id: string;
  name: string;
  type: 'trial_balance' | 'balance_sheet' | 'income_statement' | 'notes' | 'audit_report' | 'other';
  url?: string;
  generatedAt: string;
}

export interface ClosingChecklistItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
  notes?: string;
}

const STORAGE_KEY = 'fintutto_year_end_closings';

const CLOSING_STEPS: { step: ClosingStep; label: string; description: string }[] = [
  { step: 'preparation', label: 'Vorbereitung', description: 'Unterlagen sammeln und prüfen' },
  { step: 'inventory', label: 'Inventur', description: 'Bestandsaufnahme durchführen' },
  { step: 'accruals', label: 'Abgrenzungen', description: 'Rechnungsabgrenzungsposten erfassen' },
  { step: 'depreciation', label: 'Abschreibungen', description: 'AfA berechnen und buchen' },
  { step: 'provisions', label: 'Rückstellungen', description: 'Rückstellungen bilden und prüfen' },
  { step: 'reconciliation', label: 'Abstimmung', description: 'Kontenabstimmung durchführen' },
  { step: 'adjustments', label: 'Korrekturen', description: 'Fehlbuchungen korrigieren' },
  { step: 'closing_entries', label: 'Abschlussbuchungen', description: 'GuV abschließen, Bilanz erstellen' },
  { step: 'trial_balance', label: 'Saldenbilanz', description: 'Probebilanz erstellen und prüfen' },
  { step: 'financial_statements', label: 'Jahresabschluss', description: 'Bilanz und GuV finalisieren' },
  { step: 'review', label: 'Prüfung', description: 'Interne Prüfung und Freigabe' },
  { step: 'completed', label: 'Abgeschlossen', description: 'Geschäftsjahr abgeschlossen' },
];

const DEFAULT_TASKS: Omit<ClosingTask, 'id'>[] = [
  // Vorbereitung
  { step: 'preparation', title: 'Buchhaltung auf Vollständigkeit prüfen', description: 'Alle Belege erfasst?', status: 'pending', required: true, order: 1 },
  { step: 'preparation', title: 'Offene Posten abklären', description: 'Debitoren und Kreditoren prüfen', status: 'pending', required: true, order: 2 },
  { step: 'preparation', title: 'Bankkonten abstimmen', description: 'Kontoauszüge mit Buchhaltung vergleichen', status: 'pending', required: true, order: 3 },
  { step: 'preparation', title: 'Kassenbestand prüfen', description: 'Kassenprotokoll zum Stichtag', status: 'pending', required: true, order: 4 },

  // Inventur
  { step: 'inventory', title: 'Warenbestand aufnehmen', description: 'Physische Bestandsaufnahme', status: 'pending', required: false, order: 5 },
  { step: 'inventory', title: 'Anlagenverzeichnis prüfen', description: 'Alle Anlagegüter vorhanden?', status: 'pending', required: true, order: 6 },
  { step: 'inventory', title: 'Inventarliste erstellen', description: 'Dokumentation der Inventur', status: 'pending', required: true, order: 7 },

  // Abgrenzungen
  { step: 'accruals', title: 'Aktive RAP buchen', description: 'Vorausbezahlte Aufwendungen', status: 'pending', required: true, order: 8 },
  { step: 'accruals', title: 'Passive RAP buchen', description: 'Vorauserhaltene Erträge', status: 'pending', required: true, order: 9 },
  { step: 'accruals', title: 'Sonstige Forderungen', description: 'Noch nicht fakturierte Leistungen', status: 'pending', required: true, order: 10 },
  { step: 'accruals', title: 'Sonstige Verbindlichkeiten', description: 'Noch nicht berechnete Kosten', status: 'pending', required: true, order: 11 },

  // Abschreibungen
  { step: 'depreciation', title: 'AfA-Berechnung durchführen', description: 'Jahresabschreibungen berechnen', status: 'pending', required: true, order: 12 },
  { step: 'depreciation', title: 'AfA buchen', description: 'Abschreibungen verbuchen', status: 'pending', required: true, order: 13 },
  { step: 'depreciation', title: 'GWG-Sammelposten prüfen', description: 'Pool-Abschreibung durchführen', status: 'pending', required: false, order: 14 },

  // Rückstellungen
  { step: 'provisions', title: 'Rückstellungen prüfen', description: 'Bestehende Rückstellungen bewerten', status: 'pending', required: true, order: 15 },
  { step: 'provisions', title: 'Urlaubsrückstellung', description: 'Nicht genommener Urlaub', status: 'pending', required: false, order: 16 },
  { step: 'provisions', title: 'Steuerrückstellung', description: 'Erwartete Steuernachzahlung', status: 'pending', required: true, order: 17 },

  // Abstimmung
  { step: 'reconciliation', title: 'Debitorenkonten abstimmen', description: 'OP-Liste mit Hauptbuch', status: 'pending', required: true, order: 18 },
  { step: 'reconciliation', title: 'Kreditorenkonten abstimmen', description: 'OP-Liste mit Hauptbuch', status: 'pending', required: true, order: 19 },
  { step: 'reconciliation', title: 'USt-Konten abstimmen', description: 'VSt und USt prüfen', status: 'pending', required: true, order: 20 },

  // Korrekturen
  { step: 'adjustments', title: 'Stornobuchungen prüfen', description: 'Alle korrekt durchgeführt?', status: 'pending', required: true, order: 21 },
  { step: 'adjustments', title: 'Umbuchungen durchführen', description: 'Falsche Kontierungen korrigieren', status: 'pending', required: false, order: 22 },

  // Abschlussbuchungen
  { step: 'closing_entries', title: 'Aufwandskonten abschließen', description: 'Saldovortrag auf GuV', status: 'pending', required: true, order: 23 },
  { step: 'closing_entries', title: 'Ertragskonten abschließen', description: 'Saldovortrag auf GuV', status: 'pending', required: true, order: 24 },
  { step: 'closing_entries', title: 'GuV-Konto abschließen', description: 'Ergebnis ermitteln', status: 'pending', required: true, order: 25 },
  { step: 'closing_entries', title: 'Ergebnisverwendung buchen', description: 'Gewinnvortrag/Verlustvortrag', status: 'pending', required: true, order: 26 },

  // Saldenbilanz
  { step: 'trial_balance', title: 'Saldenbilanz erstellen', description: 'Summen- und Saldenliste', status: 'pending', required: true, order: 27 },
  { step: 'trial_balance', title: 'Aktiva/Passiva prüfen', description: 'Bilanzgleichung sicherstellen', status: 'pending', required: true, order: 28 },

  // Jahresabschluss
  { step: 'financial_statements', title: 'Bilanz erstellen', description: 'Finale Bilanz generieren', status: 'pending', required: true, order: 29 },
  { step: 'financial_statements', title: 'GuV erstellen', description: 'Finale GuV generieren', status: 'pending', required: true, order: 30 },
  { step: 'financial_statements', title: 'Anhang erstellen', description: 'Erläuterungen zum Jahresabschluss', status: 'pending', required: false, order: 31 },

  // Prüfung
  { step: 'review', title: 'Interne Prüfung', description: 'Vier-Augen-Prinzip', status: 'pending', required: true, order: 32 },
  { step: 'review', title: 'Steuerberater-Review', description: 'Externe Prüfung', status: 'pending', required: false, order: 33 },
  { step: 'review', title: 'Geschäftsführer-Freigabe', description: 'Finale Freigabe', status: 'pending', required: true, order: 34 },
];

const DEFAULT_CHECKLIST: ClosingChecklistItem[] = [
  { id: 'cl-1', category: 'Unterlagen', item: 'Alle Kontoauszüge vorhanden', checked: false },
  { id: 'cl-2', category: 'Unterlagen', item: 'Alle Belege erfasst', checked: false },
  { id: 'cl-3', category: 'Unterlagen', item: 'Verträge geprüft', checked: false },
  { id: 'cl-4', category: 'Abstimmung', item: 'Bankkonten abgestimmt', checked: false },
  { id: 'cl-5', category: 'Abstimmung', item: 'Kassenbestand stimmt', checked: false },
  { id: 'cl-6', category: 'Abstimmung', item: 'OP-Listen aktuell', checked: false },
  { id: 'cl-7', category: 'Steuern', item: 'USt-Voranmeldungen eingereicht', checked: false },
  { id: 'cl-8', category: 'Steuern', item: 'Lohnsteuer-Anmeldungen eingereicht', checked: false },
  { id: 'cl-9', category: 'Steuern', item: 'ZM eingereicht (falls EU-Geschäft)', checked: false },
  { id: 'cl-10', category: 'Anlagen', item: 'Anlagenverzeichnis vollständig', checked: false },
  { id: 'cl-11', category: 'Anlagen', item: 'AfA berechnet', checked: false },
  { id: 'cl-12', category: 'Prüfung', item: 'Bilanz ausgeglichen', checked: false },
  { id: 'cl-13', category: 'Prüfung', item: 'GuV korrekt', checked: false },
  { id: 'cl-14', category: 'Prüfung', item: 'Vier-Augen-Prinzip erfüllt', checked: false },
];

export function useYearEndClosing() {
  const [closings, setClosings] = useState<YearEndClosing[]>([]);
  const [checklist, setChecklist] = useState<ClosingChecklistItem[]>(DEFAULT_CHECKLIST);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setClosings(data.closings || []);
        setChecklist(data.checklist || DEFAULT_CHECKLIST);
      } catch {
        setClosings([]);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((newClosings: YearEndClosing[], newChecklist?: ClosingChecklistItem[]) => {
    setClosings(newClosings);
    if (newChecklist) setChecklist(newChecklist);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      closings: newClosings,
      checklist: newChecklist || checklist,
    }));
  }, [checklist]);

  // Start new closing
  const startClosing = useCallback((fiscalYear: number): YearEndClosing => {
    const startDate = `${fiscalYear}-01-01`;
    const endDate = `${fiscalYear}-12-31`;

    const tasks: ClosingTask[] = DEFAULT_TASKS.map((task, index) => ({
      ...task,
      id: `task-${fiscalYear}-${index}`,
    }));

    const newClosing: YearEndClosing = {
      id: `closing-${fiscalYear}`,
      fiscalYear,
      startDate,
      endDate,
      status: 'in_progress',
      currentStep: 'preparation',
      tasks,
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveData([...closings, newClosing]);
    return newClosing;
  }, [closings, saveData]);

  // Get closing by year
  const getClosingByYear = useCallback((year: number): YearEndClosing | undefined => {
    return closings.find(c => c.fiscalYear === year);
  }, [closings]);

  // Update task status
  const updateTaskStatus = useCallback((closingId: string, taskId: string, status: TaskStatus, notes?: string) => {
    const closing = closings.find(c => c.id === closingId);
    if (!closing) return;

    const updatedTasks = closing.tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status,
          notes,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return task;
    });

    // Determine current step based on task completion
    let currentStep = closing.currentStep;
    const stepOrder = CLOSING_STEPS.map(s => s.step);

    for (const step of stepOrder) {
      const stepTasks = updatedTasks.filter(t => t.step === step);
      const allCompleted = stepTasks.every(t => t.status === 'completed' || t.status === 'skipped');
      if (!allCompleted) {
        currentStep = step;
        break;
      }
      if (step === 'review' && allCompleted) {
        currentStep = 'completed';
      }
    }

    const updatedClosings = closings.map(c => {
      if (c.id === closingId) {
        return {
          ...c,
          tasks: updatedTasks,
          currentStep,
          status: currentStep === 'completed' ? 'completed' as const : c.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    saveData(updatedClosings);
  }, [closings, saveData]);

  // Complete closing
  const completeClosing = useCallback((closingId: string, profitLoss: number, closedBy: string) => {
    const updatedClosings = closings.map(c => {
      if (c.id === closingId) {
        return {
          ...c,
          status: 'completed' as const,
          currentStep: 'completed' as ClosingStep,
          closingDate: new Date().toISOString(),
          closedBy,
          profitLoss,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    saveData(updatedClosings);
  }, [closings, saveData]);

  // Reopen closing
  const reopenClosing = useCallback((closingId: string, reason: string) => {
    const updatedClosings = closings.map(c => {
      if (c.id === closingId) {
        return {
          ...c,
          status: 'reopened' as const,
          notes: `${c.notes || ''}\n[Wiedereröffnet: ${reason}]`.trim(),
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    saveData(updatedClosings);
  }, [closings, saveData]);

  // Add document
  const addDocument = useCallback((closingId: string, doc: Omit<ClosingDocument, 'id' | 'generatedAt'>) => {
    const updatedClosings = closings.map(c => {
      if (c.id === closingId) {
        return {
          ...c,
          documents: [
            ...c.documents,
            { ...doc, id: `doc-${Date.now()}`, generatedAt: new Date().toISOString() },
          ],
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    saveData(updatedClosings);
  }, [closings, saveData]);

  // Update checklist item
  const updateChecklistItem = useCallback((itemId: string, checked: boolean, notes?: string) => {
    const newChecklist = checklist.map(item => {
      if (item.id === itemId) {
        return { ...item, checked, notes };
      }
      return item;
    });
    saveData(closings, newChecklist);
  }, [closings, checklist, saveData]);

  // Reset checklist
  const resetChecklist = useCallback(() => {
    saveData(closings, DEFAULT_CHECKLIST);
  }, [closings, saveData]);

  // Get progress
  const getProgress = useCallback((closingId: string): { completed: number; total: number; percentage: number } => {
    const closing = closings.find(c => c.id === closingId);
    if (!closing) return { completed: 0, total: 0, percentage: 0 };

    const required = closing.tasks.filter(t => t.required);
    const completed = required.filter(t => t.status === 'completed').length;
    const total = required.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }, [closings]);

  // Get step progress
  const getStepProgress = useCallback((closingId: string, step: ClosingStep): { completed: number; total: number } => {
    const closing = closings.find(c => c.id === closingId);
    if (!closing) return { completed: 0, total: 0 };

    const stepTasks = closing.tasks.filter(t => t.step === step);
    const completed = stepTasks.filter(t => t.status === 'completed' || t.status === 'skipped').length;

    return { completed, total: stepTasks.length };
  }, [closings]);

  // Get checklist progress
  const getChecklistProgress = useCallback((): { checked: number; total: number; percentage: number } => {
    const checked = checklist.filter(item => item.checked).length;
    const total = checklist.length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    return { checked, total, percentage };
  }, [checklist]);

  return {
    closings,
    checklist,
    isLoading,
    closingSteps: CLOSING_STEPS,
    startClosing,
    getClosingByYear,
    updateTaskStatus,
    completeClosing,
    reopenClosing,
    addDocument,
    updateChecklistItem,
    resetChecklist,
    getProgress,
    getStepProgress,
    getChecklistProgress,
  };
}
