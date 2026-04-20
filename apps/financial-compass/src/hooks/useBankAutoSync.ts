import { useState, useCallback, useEffect, useRef } from 'react';

export type SyncFrequency = 'hourly' | 'every4hours' | 'daily' | 'weekly' | 'manual';
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface BankAccount {
  id: string;
  name: string;
  iban: string;
  bic?: string;
  bankName: string;
  balance: number;
  currency: string;
  lastSync: string | null;
  syncEnabled: boolean;
  syncFrequency: SyncFrequency;
  connectionStatus: 'connected' | 'disconnected' | 'expired';
  finapiConnectionId?: string;
}

export interface SyncJob {
  id: string;
  accountId: string;
  accountName: string;
  status: SyncStatus;
  startedAt: string;
  completedAt: string | null;
  transactionsImported: number;
  error: string | null;
  triggeredBy: 'schedule' | 'manual' | 'webhook';
}

export interface SyncSchedule {
  id: string;
  accountId: string;
  frequency: SyncFrequency;
  nextRun: string;
  enabled: boolean;
  lastRun: string | null;
  preferredTime?: string; // HH:mm format for daily/weekly
  dayOfWeek?: number; // 0-6 for weekly
}

export interface AutoSyncSettings {
  globalEnabled: boolean;
  defaultFrequency: SyncFrequency;
  retryOnError: boolean;
  maxRetries: number;
  notifyOnSync: boolean;
  notifyOnError: boolean;
  autoReconcile: boolean;
  reconcileThreshold: number; // Auto-match confidence threshold
}

const STORAGE_KEY = 'fintutto_bank_auto_sync';

// Calculate next run time based on frequency
function calculateNextRun(frequency: SyncFrequency, preferredTime?: string, dayOfWeek?: number): Date {
  const now = new Date();
  const next = new Date(now);

  switch (frequency) {
    case 'hourly':
      next.setHours(next.getHours() + 1, 0, 0, 0);
      break;
    case 'every4hours':
      const nextHour = Math.ceil(next.getHours() / 4) * 4;
      next.setHours(nextHour === 24 ? 0 : nextHour, 0, 0, 0);
      if (nextHour === 24) next.setDate(next.getDate() + 1);
      break;
    case 'daily':
      if (preferredTime) {
        const [hours, minutes] = preferredTime.split(':').map(Number);
        next.setHours(hours, minutes, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
      } else {
        next.setDate(next.getDate() + 1);
        next.setHours(6, 0, 0, 0); // Default 6 AM
      }
      break;
    case 'weekly':
      if (preferredTime) {
        const [hours, minutes] = preferredTime.split(':').map(Number);
        next.setHours(hours, minutes, 0, 0);
      } else {
        next.setHours(6, 0, 0, 0);
      }
      const targetDay = dayOfWeek ?? 1; // Default Monday
      const daysUntil = (targetDay - next.getDay() + 7) % 7 || 7;
      next.setDate(next.getDate() + daysUntil);
      break;
    case 'manual':
    default:
      return new Date(0); // Never
  }

  return next;
}

export function useBankAutoSync() {
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Demo accounts
    return [
      {
        id: 'acc_1',
        name: 'Geschäftskonto',
        iban: 'DE89370400440532013000',
        bic: 'COBADEFFXXX',
        bankName: 'Commerzbank',
        balance: 45678.90,
        currency: 'EUR',
        lastSync: null,
        syncEnabled: true,
        syncFrequency: 'daily',
        connectionStatus: 'connected',
      },
      {
        id: 'acc_2',
        name: 'Sparkonto',
        iban: 'DE91100000000123456789',
        bic: 'MARKDEF1100',
        bankName: 'Bundesbank',
        balance: 125000.00,
        currency: 'EUR',
        lastSync: null,
        syncEnabled: true,
        syncFrequency: 'weekly',
        connectionStatus: 'connected',
      },
    ];
  });

  const [syncHistory, setSyncHistory] = useState<SyncJob[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_history`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [schedules, setSchedules] = useState<SyncSchedule[]>(() => {
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

  const [settings, setSettings] = useState<AutoSyncSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      globalEnabled: true,
      defaultFrequency: 'daily',
      retryOnError: true,
      maxRetries: 3,
      notifyOnSync: false,
      notifyOnError: true,
      autoReconcile: true,
      reconcileThreshold: 80,
    };
  });

  const [currentSyncStatus, setCurrentSyncStatus] = useState<Record<string, SyncStatus>>({});
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persist data
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_history`, JSON.stringify(syncHistory));
  }, [syncHistory]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_schedules`, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  // Initialize schedules for accounts
  useEffect(() => {
    const newSchedules: SyncSchedule[] = [];

    accounts.forEach(account => {
      if (!schedules.find(s => s.accountId === account.id)) {
        newSchedules.push({
          id: `sched_${account.id}`,
          accountId: account.id,
          frequency: account.syncFrequency,
          nextRun: calculateNextRun(account.syncFrequency).toISOString(),
          enabled: account.syncEnabled,
          lastRun: null,
        });
      }
    });

    if (newSchedules.length > 0) {
      setSchedules(prev => [...prev, ...newSchedules]);
    }
  }, [accounts]);

  // Simulate bank sync
  const syncAccount = useCallback(async (
    accountId: string,
    triggeredBy: 'schedule' | 'manual' | 'webhook' = 'manual'
  ): Promise<SyncJob> => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) {
      throw new Error('Konto nicht gefunden');
    }

    const job: SyncJob = {
      id: `sync_${Date.now()}`,
      accountId,
      accountName: account.name,
      status: 'syncing',
      startedAt: new Date().toISOString(),
      completedAt: null,
      transactionsImported: 0,
      error: null,
      triggeredBy,
    };

    setSyncHistory(prev => [job, ...prev].slice(0, 100)); // Keep last 100
    setCurrentSyncStatus(prev => ({ ...prev, [accountId]: 'syncing' }));

    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;
    const transactionsImported = success ? Math.floor(Math.random() * 20) : 0;
    const balanceChange = success ? (Math.random() - 0.5) * 1000 : 0;

    const completedJob: SyncJob = {
      ...job,
      status: success ? 'success' : 'error',
      completedAt: new Date().toISOString(),
      transactionsImported,
      error: success ? null : 'Verbindungsfehler: Bank-Server nicht erreichbar',
    };

    setSyncHistory(prev => prev.map(j => j.id === job.id ? completedJob : j));
    setCurrentSyncStatus(prev => ({ ...prev, [accountId]: success ? 'success' : 'error' }));

    // Update account
    setAccounts(prev => prev.map(a => {
      if (a.id === accountId) {
        return {
          ...a,
          lastSync: success ? completedJob.completedAt : a.lastSync,
          balance: success ? a.balance + balanceChange : a.balance,
        };
      }
      return a;
    }));

    // Update schedule
    setSchedules(prev => prev.map(s => {
      if (s.accountId === accountId) {
        return {
          ...s,
          lastRun: completedJob.completedAt,
          nextRun: calculateNextRun(s.frequency, s.preferredTime, s.dayOfWeek).toISOString(),
        };
      }
      return s;
    }));

    // Reset status after delay
    setTimeout(() => {
      setCurrentSyncStatus(prev => ({ ...prev, [accountId]: 'idle' }));
    }, 3000);

    return completedJob;
  }, [accounts]);

  // Sync all enabled accounts
  const syncAllAccounts = useCallback(async (): Promise<SyncJob[]> => {
    const enabledAccounts = accounts.filter(a => a.syncEnabled && a.connectionStatus === 'connected');
    const jobs: SyncJob[] = [];

    for (const account of enabledAccounts) {
      try {
        const job = await syncAccount(account.id, 'manual');
        jobs.push(job);
      } catch (error) {
        // Continue with other accounts
      }
    }

    return jobs;
  }, [accounts, syncAccount]);

  // Check and run scheduled syncs
  const checkScheduledSyncs = useCallback(async () => {
    if (!settings.globalEnabled) return;

    const now = new Date();
    const dueSchedules = schedules.filter(s =>
      s.enabled &&
      s.frequency !== 'manual' &&
      new Date(s.nextRun) <= now
    );

    for (const schedule of dueSchedules) {
      const account = accounts.find(a => a.id === schedule.accountId);
      if (account?.connectionStatus === 'connected') {
        try {
          await syncAccount(schedule.accountId, 'schedule');
        } catch (error) {
          // Log error but continue
        }
      }
    }
  }, [settings.globalEnabled, schedules, accounts, syncAccount]);

  // Start scheduler
  useEffect(() => {
    if (settings.globalEnabled) {
      // Check every minute
      syncIntervalRef.current = setInterval(checkScheduledSyncs, 60000);
      // Initial check
      checkScheduledSyncs();
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [settings.globalEnabled, checkScheduledSyncs]);

  // Update account sync settings
  const updateAccountSync = useCallback((
    accountId: string,
    updates: Partial<Pick<BankAccount, 'syncEnabled' | 'syncFrequency'>>
  ) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === accountId) {
        return { ...a, ...updates };
      }
      return a;
    }));

    // Update schedule
    if (updates.syncFrequency || updates.syncEnabled !== undefined) {
      setSchedules(prev => prev.map(s => {
        if (s.accountId === accountId) {
          return {
            ...s,
            frequency: updates.syncFrequency || s.frequency,
            enabled: updates.syncEnabled ?? s.enabled,
            nextRun: calculateNextRun(
              updates.syncFrequency || s.frequency,
              s.preferredTime,
              s.dayOfWeek
            ).toISOString(),
          };
        }
        return s;
      }));
    }
  }, []);

  // Update schedule preferred time
  const updateScheduleTime = useCallback((
    accountId: string,
    preferredTime: string,
    dayOfWeek?: number
  ) => {
    setSchedules(prev => prev.map(s => {
      if (s.accountId === accountId) {
        return {
          ...s,
          preferredTime,
          dayOfWeek,
          nextRun: calculateNextRun(s.frequency, preferredTime, dayOfWeek).toISOString(),
        };
      }
      return s;
    }));
  }, []);

  // Update global settings
  const updateSettings = useCallback((updates: Partial<AutoSyncSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Add new account
  const addAccount = useCallback((account: Omit<BankAccount, 'id' | 'lastSync' | 'connectionStatus'>) => {
    const newAccount: BankAccount = {
      ...account,
      id: `acc_${Date.now()}`,
      lastSync: null,
      connectionStatus: 'connected',
    };
    setAccounts(prev => [...prev, newAccount]);
    return newAccount;
  }, []);

  // Remove account
  const removeAccount = useCallback((accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    setSchedules(prev => prev.filter(s => s.accountId !== accountId));
  }, []);

  // Get sync statistics
  const getStats = useCallback((days: number = 30) => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const recentJobs = syncHistory.filter(j => new Date(j.startedAt) >= since);
    const successfulJobs = recentJobs.filter(j => j.status === 'success');
    const failedJobs = recentJobs.filter(j => j.status === 'error');

    return {
      totalSyncs: recentJobs.length,
      successRate: recentJobs.length > 0
        ? Math.round((successfulJobs.length / recentJobs.length) * 100)
        : 100,
      totalTransactions: successfulJobs.reduce((sum, j) => sum + j.transactionsImported, 0),
      failedSyncs: failedJobs.length,
      averageSyncsPerDay: Math.round(recentJobs.length / days * 10) / 10,
      lastError: failedJobs[0]?.error || null,
    };
  }, [syncHistory]);

  // Get next scheduled sync
  const getNextScheduledSync = useCallback((): { account: BankAccount; schedule: SyncSchedule } | null => {
    const enabledSchedules = schedules
      .filter(s => s.enabled && s.frequency !== 'manual')
      .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime());

    if (enabledSchedules.length === 0) return null;

    const schedule = enabledSchedules[0];
    const account = accounts.find(a => a.id === schedule.accountId);

    return account ? { account, schedule } : null;
  }, [schedules, accounts]);

  return {
    accounts,
    syncHistory,
    schedules,
    settings,
    currentSyncStatus,
    syncAccount,
    syncAllAccounts,
    updateAccountSync,
    updateScheduleTime,
    updateSettings,
    addAccount,
    removeAccount,
    getStats,
    getNextScheduledSync,
  };
}
