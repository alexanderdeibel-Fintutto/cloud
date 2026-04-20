import { useState, useCallback, useEffect, useMemo } from 'react';

export type AuditAction =
  | 'create' | 'update' | 'delete' | 'view' | 'export' | 'import'
  | 'login' | 'logout' | 'send' | 'approve' | 'reject' | 'archive'
  | 'restore' | 'sync' | 'reconcile' | 'reverse';

export type AuditModule =
  | 'invoices' | 'receipts' | 'bookings' | 'contacts' | 'bank'
  | 'reports' | 'settings' | 'users' | 'assets' | 'archive'
  | 'auth' | 'sepa' | 'elster' | 'system';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  module: AuditModule;
  entityId?: string;
  entityType?: string;
  entityName?: string;
  details?: Record<string, unknown>;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

const STORAGE_KEY = 'fintutto_audit_log';
const MAX_ENTRIES = 10000;

const ACTION_LABELS: Record<AuditAction, { de: string; en: string }> = {
  create: { de: 'Erstellt', en: 'Created' },
  update: { de: 'Aktualisiert', en: 'Updated' },
  delete: { de: 'Gelöscht', en: 'Deleted' },
  view: { de: 'Angezeigt', en: 'Viewed' },
  export: { de: 'Exportiert', en: 'Exported' },
  import: { de: 'Importiert', en: 'Imported' },
  login: { de: 'Angemeldet', en: 'Logged in' },
  logout: { de: 'Abgemeldet', en: 'Logged out' },
  send: { de: 'Gesendet', en: 'Sent' },
  approve: { de: 'Genehmigt', en: 'Approved' },
  reject: { de: 'Abgelehnt', en: 'Rejected' },
  archive: { de: 'Archiviert', en: 'Archived' },
  restore: { de: 'Wiederhergestellt', en: 'Restored' },
  sync: { de: 'Synchronisiert', en: 'Synced' },
  reconcile: { de: 'Abgestimmt', en: 'Reconciled' },
  reverse: { de: 'Storniert', en: 'Reversed' },
};

const MODULE_LABELS: Record<AuditModule, { de: string; en: string }> = {
  invoices: { de: 'Rechnungen', en: 'Invoices' },
  receipts: { de: 'Belege', en: 'Receipts' },
  bookings: { de: 'Buchungen', en: 'Bookings' },
  contacts: { de: 'Kontakte', en: 'Contacts' },
  bank: { de: 'Bank', en: 'Bank' },
  reports: { de: 'Berichte', en: 'Reports' },
  settings: { de: 'Einstellungen', en: 'Settings' },
  users: { de: 'Benutzer', en: 'Users' },
  assets: { de: 'Anlagen', en: 'Assets' },
  archive: { de: 'Archiv', en: 'Archive' },
  auth: { de: 'Authentifizierung', en: 'Authentication' },
  sepa: { de: 'SEPA', en: 'SEPA' },
  elster: { de: 'ELSTER', en: 'ELSTER' },
  system: { de: 'System', en: 'System' },
};

export function useAuditLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [filters, setFilters] = useState({
    action: null as AuditAction | null,
    module: null as AuditModule | null,
    userId: null as string | null,
    dateFrom: null as string | null,
    dateTo: null as string | null,
    searchQuery: '',
    successOnly: false,
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Log entry
  const log = useCallback((
    entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
  ): AuditLogEntry => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    setEntries(prev => {
      const updated = [newEntry, ...prev];
      // Keep max entries
      if (updated.length > MAX_ENTRIES) {
        return updated.slice(0, MAX_ENTRIES);
      }
      return updated;
    });

    return newEntry;
  }, []);

  // Quick log helpers
  const logCreate = useCallback((
    module: AuditModule,
    entityId: string,
    entityName: string,
    userId: string,
    userName: string,
    userEmail: string
  ) => {
    return log({
      action: 'create',
      module,
      entityId,
      entityName,
      entityType: module,
      userId,
      userName,
      userEmail,
      success: true,
    });
  }, [log]);

  const logUpdate = useCallback((
    module: AuditModule,
    entityId: string,
    entityName: string,
    changes: AuditLogEntry['changes'],
    userId: string,
    userName: string,
    userEmail: string
  ) => {
    return log({
      action: 'update',
      module,
      entityId,
      entityName,
      entityType: module,
      changes,
      userId,
      userName,
      userEmail,
      success: true,
    });
  }, [log]);

  const logDelete = useCallback((
    module: AuditModule,
    entityId: string,
    entityName: string,
    userId: string,
    userName: string,
    userEmail: string
  ) => {
    return log({
      action: 'delete',
      module,
      entityId,
      entityName,
      entityType: module,
      userId,
      userName,
      userEmail,
      success: true,
    });
  }, [log]);

  const logExport = useCallback((
    module: AuditModule,
    details: Record<string, unknown>,
    userId: string,
    userName: string,
    userEmail: string
  ) => {
    return log({
      action: 'export',
      module,
      details,
      userId,
      userName,
      userEmail,
      success: true,
    });
  }, [log]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (filters.action && entry.action !== filters.action) return false;
      if (filters.module && entry.module !== filters.module) return false;
      if (filters.userId && entry.userId !== filters.userId) return false;
      if (filters.successOnly && !entry.success) return false;

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        const entryDate = new Date(entry.timestamp);
        if (entryDate < from) return false;
      }

      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        const entryDate = new Date(entry.timestamp);
        if (entryDate > to) return false;
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchable = [
          entry.userName,
          entry.userEmail,
          entry.entityName,
          entry.entityId,
          ACTION_LABELS[entry.action]?.de,
          MODULE_LABELS[entry.module]?.de,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      return true;
    });
  }, [entries, filters]);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const todayEntries = entries.filter(e => new Date(e.timestamp) >= todayStart);
    const weekEntries = entries.filter(e => new Date(e.timestamp) >= weekStart);

    const byAction = entries.reduce((acc, e) => {
      acc[e.action] = (acc[e.action] || 0) + 1;
      return acc;
    }, {} as Record<AuditAction, number>);

    const byModule = entries.reduce((acc, e) => {
      acc[e.module] = (acc[e.module] || 0) + 1;
      return acc;
    }, {} as Record<AuditModule, number>);

    const byUser = entries.reduce((acc, e) => {
      if (!acc[e.userId]) {
        acc[e.userId] = { name: e.userName, count: 0 };
      }
      acc[e.userId].count++;
      return acc;
    }, {} as Record<string, { name: string; count: number }>);

    const errorCount = entries.filter(e => !e.success).length;

    return {
      total: entries.length,
      today: todayEntries.length,
      thisWeek: weekEntries.length,
      errorCount,
      successRate: entries.length > 0 ? ((entries.length - errorCount) / entries.length * 100).toFixed(1) : '100',
      byAction,
      byModule,
      byUser,
      mostActiveUser: Object.entries(byUser).sort((a, b) => b[1].count - a[1].count)[0],
    };
  }, [entries]);

  // Clear old entries
  const clearOldEntries = useCallback((daysToKeep: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    setEntries(prev => prev.filter(e => new Date(e.timestamp) >= cutoff));
  }, []);

  // Export log
  const exportLog = useCallback((format: 'json' | 'csv') => {
    const data = filteredEntries;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['Zeitstempel', 'Benutzer', 'E-Mail', 'Aktion', 'Modul', 'Objekt', 'Erfolg'];
      const rows = data.map(e => [
        e.timestamp,
        e.userName,
        e.userEmail,
        ACTION_LABELS[e.action]?.de || e.action,
        MODULE_LABELS[e.module]?.de || e.module,
        e.entityName || '',
        e.success ? 'Ja' : 'Nein',
      ]);

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [filteredEntries]);

  return {
    entries: filteredEntries,
    allEntries: entries,
    filters,
    setFilters,
    log,
    logCreate,
    logUpdate,
    logDelete,
    logExport,
    clearOldEntries,
    exportLog,
    stats,
    actionLabels: ACTION_LABELS,
    moduleLabels: MODULE_LABELS,
  };
}
