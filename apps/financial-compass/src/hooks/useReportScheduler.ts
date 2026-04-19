import { useState, useCallback, useEffect, useMemo } from 'react';

export type ReportType =
  | 'bwa' | 'bilanz' | 'guv' | 'ustva' | 'open-items'
  | 'account-ledger' | 'cashflow' | 'kpi' | 'custom';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type DeliveryMethod = 'email' | 'download' | 'archive';
export type ExportFormat = 'pdf' | 'csv' | 'xlsx' | 'datev';

export interface ScheduledReport {
  id: string;
  name: string;
  reportType: ReportType;
  frequency: ScheduleFrequency;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  monthOfYear?: number; // 1-12 for yearly
  time: string; // HH:mm
  format: ExportFormat;
  delivery: DeliveryMethod;
  recipients?: string[];
  filters?: {
    dateRange?: 'current-month' | 'previous-month' | 'current-quarter' | 'previous-quarter' | 'current-year' | 'custom';
    accounts?: string[];
    costCenters?: string[];
  };
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExecution {
  id: string;
  scheduleId: string;
  reportName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  fileUrl?: string;
  error?: string;
  deliveredTo?: string[];
}

const REPORT_TYPES: { type: ReportType; label: string; description: string }[] = [
  { type: 'bwa', label: 'BWA', description: 'Betriebswirtschaftliche Auswertung' },
  { type: 'bilanz', label: 'Bilanz', description: 'Bilanzübersicht' },
  { type: 'guv', label: 'GuV', description: 'Gewinn- und Verlustrechnung' },
  { type: 'ustva', label: 'UStVA', description: 'Umsatzsteuer-Voranmeldung' },
  { type: 'open-items', label: 'Offene Posten', description: 'Debitoren und Kreditoren' },
  { type: 'account-ledger', label: 'Kontenblatt', description: 'Einzelne Kontobewegungen' },
  { type: 'cashflow', label: 'Cash-Flow', description: 'Liquiditätsübersicht' },
  { type: 'kpi', label: 'KPI-Report', description: 'Kennzahlenübersicht' },
  { type: 'custom', label: 'Benutzerdefiniert', description: 'Eigener Bericht' },
];

const STORAGE_KEY = 'fintutto_report_scheduler';

export function useReportScheduler() {
  const [schedules, setSchedules] = useState<ScheduledReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_schedules`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [executions, setExecutions] = useState<ReportExecution[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_executions`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_schedules`, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_executions`, JSON.stringify(executions));
  }, [executions]);

  // Calculate next run date
  const calculateNextRun = useCallback((schedule: ScheduledReport): string => {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    // If time has passed today, start from tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    switch (schedule.frequency) {
      case 'daily':
        // Already set
        break;

      case 'weekly':
        const targetDay = schedule.dayOfWeek || 1; // Default Monday
        while (nextRun.getDay() !== targetDay) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'monthly':
        const targetDate = schedule.dayOfMonth || 1;
        nextRun.setDate(targetDate);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;

      case 'quarterly':
        const targetMonth = [0, 3, 6, 9].find(m => m > now.getMonth()) || 0;
        nextRun.setMonth(targetMonth);
        nextRun.setDate(schedule.dayOfMonth || 1);
        if (targetMonth === 0 && now.getMonth() >= 9) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
        break;

      case 'yearly':
        const targetYearMonth = (schedule.monthOfYear || 1) - 1;
        nextRun.setMonth(targetYearMonth);
        nextRun.setDate(schedule.dayOfMonth || 1);
        if (nextRun <= now) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
        break;
    }

    return nextRun.toISOString();
  }, []);

  // Create schedule
  const createSchedule = useCallback((
    data: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>
  ): ScheduledReport => {
    const newSchedule: ScheduledReport = {
      ...data,
      id: `schedule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextRun: '',
    };
    newSchedule.nextRun = calculateNextRun(newSchedule);

    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule;
  }, [calculateNextRun]);

  // Update schedule
  const updateSchedule = useCallback((id: string, updates: Partial<ScheduledReport>) => {
    setSchedules(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates, updatedAt: new Date().toISOString() };
        updated.nextRun = calculateNextRun(updated);
        return updated;
      }
      return s;
    }));
  }, [calculateNextRun]);

  // Delete schedule
  const deleteSchedule = useCallback((id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  }, []);

  // Toggle schedule active/inactive
  const toggleSchedule = useCallback((id: string) => {
    setSchedules(prev => prev.map(s =>
      s.id === id ? { ...s, isActive: !s.isActive, updatedAt: new Date().toISOString() } : s
    ));
  }, []);

  // Execute report manually
  const executeReport = useCallback(async (
    scheduleId: string,
    generator: (schedule: ScheduledReport) => Promise<{ fileUrl?: string; error?: string }>
  ): Promise<ReportExecution> => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const execution: ReportExecution = {
      id: `exec_${Date.now()}`,
      scheduleId,
      reportName: schedule.name,
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    setExecutions(prev => [execution, ...prev]);

    try {
      const result = await generator(schedule);

      const completedExecution: ReportExecution = {
        ...execution,
        status: result.error ? 'failed' : 'completed',
        completedAt: new Date().toISOString(),
        fileUrl: result.fileUrl,
        error: result.error,
        deliveredTo: schedule.delivery === 'email' ? schedule.recipients : undefined,
      };

      setExecutions(prev => prev.map(e => e.id === execution.id ? completedExecution : e));

      // Update last run
      setSchedules(prev => prev.map(s =>
        s.id === scheduleId
          ? { ...s, lastRun: new Date().toISOString(), nextRun: calculateNextRun(s) }
          : s
      ));

      return completedExecution;
    } catch (error) {
      const failedExecution: ReportExecution = {
        ...execution,
        status: 'failed',
        completedAt: new Date().toISOString(),
        error: (error as Error).message,
      };

      setExecutions(prev => prev.map(e => e.id === execution.id ? failedExecution : e));
      return failedExecution;
    }
  }, [schedules, calculateNextRun]);

  // Get due schedules
  const getDueSchedules = useCallback((): ScheduledReport[] => {
    const now = new Date();
    return schedules.filter(s => {
      if (!s.isActive) return false;
      const nextRun = new Date(s.nextRun || '');
      return nextRun <= now;
    });
  }, [schedules]);

  // Statistics
  const stats = useMemo(() => {
    const activeSchedules = schedules.filter(s => s.isActive);
    const recentExecutions = executions.slice(0, 50);
    const successfulExecutions = recentExecutions.filter(e => e.status === 'completed');
    const failedExecutions = recentExecutions.filter(e => e.status === 'failed');

    const byType = schedules.reduce((acc, s) => {
      acc[s.reportType] = (acc[s.reportType] || 0) + 1;
      return acc;
    }, {} as Record<ReportType, number>);

    const byFrequency = schedules.reduce((acc, s) => {
      acc[s.frequency] = (acc[s.frequency] || 0) + 1;
      return acc;
    }, {} as Record<ScheduleFrequency, number>);

    return {
      totalSchedules: schedules.length,
      activeSchedules: activeSchedules.length,
      totalExecutions: executions.length,
      successRate: recentExecutions.length > 0
        ? Math.round((successfulExecutions.length / recentExecutions.length) * 100)
        : 100,
      recentFailures: failedExecutions.length,
      byType,
      byFrequency,
      nextScheduledReport: activeSchedules
        .sort((a, b) => new Date(a.nextRun || '').getTime() - new Date(b.nextRun || '').getTime())[0],
    };
  }, [schedules, executions]);

  return {
    schedules,
    executions,
    reportTypes: REPORT_TYPES,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    executeReport,
    getDueSchedules,
    stats,
  };
}
