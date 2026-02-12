import { useState, useCallback } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export interface BackupData {
  version: string;
  created_at: string;
  company_id: string;
  company_name: string;
  data: {
    [key: string]: any;
  };
  checksum: string;
}

export interface BackupHistory {
  id: string;
  date: string;
  size: number;
  type: 'manual' | 'auto';
  status: 'success' | 'failed';
}

export interface RestoreResult {
  success: boolean;
  message: string;
  restoredKeys: string[];
  errors: string[];
}

// All localStorage keys used by Fintutto
const STORAGE_KEYS = [
  'fintutto_transactions',
  'fintutto_invoices',
  'fintutto_receipts',
  'fintutto_contacts',
  'fintutto_bank_accounts',
  'fintutto_recurring_bookings',
  'fintutto_quotes',
  'fintutto_orders',
  'fintutto_automation_rules',
  'fintutto_payment_reminders',
  'fintutto_tax_advisor_access',
  'fintutto_ecommerce_connections',
  'fintutto_online_payments',
  'fintutto_accounting_connections',
  'fintutto_scanned_receipts',
  'fintutto_cash_flow_entries',
  'fintutto_budgets',
  'fintutto_sepa_payments',
  'fintutto_templates',
  'fintutto_settings',
];

const BACKUP_HISTORY_KEY = 'fintutto_backup_history';

export function useDataBackup() {
  const { currentCompany } = useCompany();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get backup history
  const getBackupHistory = useCallback((): BackupHistory[] => {
    if (!currentCompany) return [];
    const stored = localStorage.getItem(`${BACKUP_HISTORY_KEY}_${currentCompany.id}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  }, [currentCompany]);

  // Save backup history
  const saveBackupHistory = useCallback((history: BackupHistory[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${BACKUP_HISTORY_KEY}_${currentCompany.id}`, JSON.stringify(history));
  }, [currentCompany]);

  // Add to backup history
  const addToHistory = useCallback((type: 'manual' | 'auto', size: number, success: boolean) => {
    const history = getBackupHistory();
    const newEntry: BackupHistory = {
      id: `backup-${Date.now()}`,
      date: new Date().toISOString(),
      size,
      type,
      status: success ? 'success' : 'failed',
    };
    saveBackupHistory([newEntry, ...history.slice(0, 49)]); // Keep last 50
  }, [getBackupHistory, saveBackupHistory]);

  // Generate checksum for data
  const generateChecksum = useCallback((data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }, []);

  // Export all data
  const exportData = useCallback(async (): Promise<{ blob: Blob; filename: string } | null> => {
    if (!currentCompany) return null;

    setIsExporting(true);
    setProgress(0);

    try {
      const data: { [key: string]: any } = {};
      let totalKeys = STORAGE_KEYS.length;
      let processed = 0;

      for (const baseKey of STORAGE_KEYS) {
        const key = `${baseKey}_${currentCompany.id}`;
        const value = localStorage.getItem(key);
        if (value) {
          try {
            data[baseKey] = JSON.parse(value);
          } catch {
            data[baseKey] = value;
          }
        }
        processed++;
        setProgress(Math.round((processed / totalKeys) * 100));
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const backupData: BackupData = {
        version: '1.0.0',
        created_at: new Date().toISOString(),
        company_id: currentCompany.id,
        company_name: currentCompany.name || 'Unbekannt',
        data,
        checksum: '',
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      backupData.checksum = generateChecksum(jsonString);

      const finalJson = JSON.stringify(backupData, null, 2);
      const blob = new Blob([finalJson], { type: 'application/json' });
      const date = new Date().toISOString().split('T')[0];
      const filename = `fintutto_backup_${currentCompany.id}_${date}.json`;

      addToHistory('manual', blob.size, true);
      setIsExporting(false);
      setProgress(100);

      return { blob, filename };
    } catch (error) {
      addToHistory('manual', 0, false);
      setIsExporting(false);
      throw error;
    }
  }, [currentCompany, generateChecksum, addToHistory]);

  // Download backup
  const downloadBackup = useCallback(async () => {
    const result = await exportData();
    if (!result) return false;

    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  }, [exportData]);

  // Validate backup file
  const validateBackup = useCallback((data: BackupData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.version) {
      errors.push('Keine Versionsinformation gefunden');
    }

    if (!data.company_id) {
      errors.push('Keine Firmen-ID gefunden');
    }

    if (!data.data || typeof data.data !== 'object') {
      errors.push('Keine Daten gefunden');
    }

    if (!data.created_at) {
      errors.push('Kein Erstellungsdatum gefunden');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, []);

  // Import data from backup
  const importData = useCallback(async (
    file: File,
    options: { overwrite: boolean; selectedKeys?: string[] }
  ): Promise<RestoreResult> => {
    if (!currentCompany) {
      return { success: false, message: 'Keine Firma ausgewählt', restoredKeys: [], errors: ['Keine Firma ausgewählt'] };
    }

    setIsImporting(true);
    setProgress(0);

    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      // Validate
      const validation = validateBackup(backupData);
      if (!validation.valid) {
        setIsImporting(false);
        return {
          success: false,
          message: 'Ungültige Backup-Datei',
          restoredKeys: [],
          errors: validation.errors,
        };
      }

      const restoredKeys: string[] = [];
      const errors: string[] = [];

      const keysToRestore = options.selectedKeys || Object.keys(backupData.data);
      let processed = 0;

      for (const baseKey of keysToRestore) {
        const storageKey = `${baseKey}_${currentCompany.id}`;
        const value = backupData.data[baseKey];

        if (value !== undefined) {
          try {
            // Check if we should overwrite
            const existing = localStorage.getItem(storageKey);
            if (!options.overwrite && existing) {
              errors.push(`${baseKey}: Bereits vorhanden (übersprungen)`);
            } else {
              const valueString = typeof value === 'string' ? value : JSON.stringify(value);
              localStorage.setItem(storageKey, valueString);
              restoredKeys.push(baseKey);
            }
          } catch (e) {
            errors.push(`${baseKey}: Fehler beim Wiederherstellen`);
          }
        }

        processed++;
        setProgress(Math.round((processed / keysToRestore.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setIsImporting(false);
      setProgress(100);

      return {
        success: restoredKeys.length > 0,
        message: `${restoredKeys.length} Datenbereiche wiederhergestellt`,
        restoredKeys,
        errors,
      };
    } catch (error) {
      setIsImporting(false);
      return {
        success: false,
        message: 'Fehler beim Lesen der Backup-Datei',
        restoredKeys: [],
        errors: [(error as Error).message],
      };
    }
  }, [currentCompany, validateBackup]);

  // Get storage statistics
  const getStorageStats = useCallback(() => {
    if (!currentCompany) return { used: 0, items: 0, breakdown: [] };

    let totalSize = 0;
    let itemCount = 0;
    const breakdown: { key: string; label: string; size: number; count: number }[] = [];

    const keyLabels: Record<string, string> = {
      fintutto_transactions: 'Buchungen',
      fintutto_invoices: 'Rechnungen',
      fintutto_receipts: 'Belege',
      fintutto_contacts: 'Kontakte',
      fintutto_bank_accounts: 'Bankkonten',
      fintutto_recurring_bookings: 'Wiederkehrende Buchungen',
      fintutto_quotes: 'Angebote',
      fintutto_orders: 'Aufträge',
      fintutto_automation_rules: 'Automatisierungsregeln',
      fintutto_payment_reminders: 'Zahlungserinnerungen',
      fintutto_tax_advisor_access: 'Steuerberater-Zugang',
      fintutto_ecommerce_connections: 'E-Commerce',
      fintutto_online_payments: 'Online-Zahlungen',
      fintutto_accounting_connections: 'Buchhaltungssoftware',
      fintutto_scanned_receipts: 'Gescannte Belege',
      fintutto_cash_flow_entries: 'Cash-Flow',
      fintutto_budgets: 'Budgets',
      fintutto_sepa_payments: 'SEPA-Zahlungen',
      fintutto_templates: 'Vorlagen',
      fintutto_settings: 'Einstellungen',
    };

    for (const baseKey of STORAGE_KEYS) {
      const key = `${baseKey}_${currentCompany.id}`;
      const value = localStorage.getItem(key);
      if (value) {
        const size = new Blob([value]).size;
        totalSize += size;

        let count = 0;
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            count = parsed.length;
          } else if (typeof parsed === 'object') {
            count = Object.keys(parsed).length;
          }
        } catch { /* ignore */ }

        itemCount += count;
        breakdown.push({
          key: baseKey,
          label: keyLabels[baseKey] || baseKey,
          size,
          count,
        });
      }
    }

    breakdown.sort((a, b) => b.size - a.size);

    return {
      used: totalSize,
      items: itemCount,
      breakdown,
    };
  }, [currentCompany]);

  // Clear all data for current company
  const clearAllData = useCallback(async () => {
    if (!currentCompany) return false;

    for (const baseKey of STORAGE_KEYS) {
      const key = `${baseKey}_${currentCompany.id}`;
      localStorage.removeItem(key);
    }

    return true;
  }, [currentCompany]);

  // Format bytes to human readable
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    isExporting,
    isImporting,
    progress,
    exportData,
    downloadBackup,
    importData,
    validateBackup,
    getBackupHistory,
    getStorageStats,
    clearAllData,
    formatBytes,
    STORAGE_KEYS,
  };
}
