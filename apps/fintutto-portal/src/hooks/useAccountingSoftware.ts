import { useState, useEffect, useCallback } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export type AccountingSoftware = 'lexware' | 'sage' | 'datev' | 'sevdesk';
export type ImportExportFormat = 'csv' | 'xml' | 'json' | 'datev-ascii';
export type SyncDirection = 'import' | 'export' | 'both';

export interface SoftwareConnection {
  id: string;
  company_id: string;
  software: AccountingSoftware;
  name: string;
  version?: string;
  status: 'connected' | 'disconnected' | 'error';
  sync_direction: SyncDirection;
  last_import_at?: string;
  last_export_at?: string;
  imported_count: number;
  exported_count: number;
  settings: SoftwareSettings;
  created_at: string;
}

export interface SoftwareSettings {
  default_format: ImportExportFormat;
  encoding: 'utf-8' | 'iso-8859-1' | 'windows-1252';
  include_header: boolean;
  delimiter: ',' | ';' | '\t';
  date_format: 'dd.mm.yyyy' | 'yyyy-mm-dd' | 'mm/dd/yyyy';
  decimal_separator: ',' | '.';
  account_mapping_enabled: boolean;
  auto_sync_enabled: boolean;
  sync_interval_hours: number;
}

export interface ImportTemplate {
  id: string;
  name: string;
  software: AccountingSoftware;
  format: ImportExportFormat;
  field_mappings: FieldMapping[];
  created_at: string;
}

export interface FieldMapping {
  source_field: string;
  target_field: string;
  transform?: 'uppercase' | 'lowercase' | 'trim' | 'date' | 'number';
  default_value?: string;
}

export interface ImportResult {
  success: boolean;
  total_rows: number;
  imported: number;
  skipped: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  software: AccountingSoftware;
  format: ImportExportFormat;
  data_type: 'transactions' | 'invoices' | 'contacts' | 'accounts';
  filters: ExportFilter[];
  field_selection: string[];
  created_at: string;
}

export interface ExportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'between';
  value: string | number | [string, string];
}

export interface SyncLog {
  id: string;
  connection_id: string;
  type: 'import' | 'export';
  status: 'success' | 'partial' | 'failed';
  records_processed: number;
  records_failed: number;
  started_at: string;
  completed_at: string;
  error_message?: string;
  file_name?: string;
}

const CONNECTIONS_STORAGE_KEY = 'fintutto_accounting_connections';
const IMPORT_TEMPLATES_KEY = 'fintutto_import_templates';
const EXPORT_TEMPLATES_KEY = 'fintutto_export_templates';
const SYNC_LOGS_KEY = 'fintutto_sync_logs';

export function useAccountingSoftware() {
  const { currentCompany } = useCompany();
  const [connections, setConnections] = useState<SoftwareConnection[]>([]);
  const [importTemplates, setImportTemplates] = useState<ImportTemplate[]>([]);
  const [exportTemplates, setExportTemplates] = useState<ExportTemplate[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    if (!currentCompany) return;

    const storedConnections = localStorage.getItem(`${CONNECTIONS_STORAGE_KEY}_${currentCompany.id}`);
    const storedImportTemplates = localStorage.getItem(`${IMPORT_TEMPLATES_KEY}_${currentCompany.id}`);
    const storedExportTemplates = localStorage.getItem(`${EXPORT_TEMPLATES_KEY}_${currentCompany.id}`);
    const storedLogs = localStorage.getItem(`${SYNC_LOGS_KEY}_${currentCompany.id}`);

    if (storedConnections) {
      try { setConnections(JSON.parse(storedConnections)); } catch { setConnections([]); }
    } else {
      // Demo connections
      setConnections([
        {
          id: 'conn-1',
          company_id: currentCompany.id,
          software: 'lexware',
          name: 'Lexware Financial Office',
          version: '2024',
          status: 'connected',
          sync_direction: 'both',
          last_import_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          last_export_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          imported_count: 245,
          exported_count: 180,
          settings: getDefaultSettings(),
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    }

    if (storedImportTemplates) {
      try { setImportTemplates(JSON.parse(storedImportTemplates)); } catch { setImportTemplates([]); }
    } else {
      // Demo import templates
      setImportTemplates([
        {
          id: 'tpl-1',
          name: 'Lexware Buchungen Standard',
          software: 'lexware',
          format: 'csv',
          field_mappings: [
            { source_field: 'Datum', target_field: 'date', transform: 'date' },
            { source_field: 'Betrag', target_field: 'amount', transform: 'number' },
            { source_field: 'Beschreibung', target_field: 'description', transform: 'trim' },
            { source_field: 'Konto', target_field: 'account_number' },
            { source_field: 'Gegenkonto', target_field: 'contra_account' },
          ],
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'tpl-2',
          name: 'SAGE Debitoren',
          software: 'sage',
          format: 'csv',
          field_mappings: [
            { source_field: 'CustomerID', target_field: 'contact_id' },
            { source_field: 'Name', target_field: 'name', transform: 'trim' },
            { source_field: 'Email', target_field: 'email', transform: 'lowercase' },
            { source_field: 'Phone', target_field: 'phone' },
          ],
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    }

    if (storedExportTemplates) {
      try { setExportTemplates(JSON.parse(storedExportTemplates)); } catch { setExportTemplates([]); }
    } else {
      // Demo export templates
      setExportTemplates([
        {
          id: 'exp-1',
          name: 'DATEV Buchungsstapel',
          software: 'datev',
          format: 'datev-ascii',
          data_type: 'transactions',
          filters: [
            { field: 'status', operator: 'eq', value: 'completed' },
          ],
          field_selection: ['date', 'amount', 'description', 'account', 'contra_account', 'tax_rate'],
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    }

    if (storedLogs) {
      try { setSyncLogs(JSON.parse(storedLogs)); } catch { setSyncLogs([]); }
    } else {
      // Demo sync logs
      setSyncLogs([
        {
          id: 'log-1',
          connection_id: 'conn-1',
          type: 'import',
          status: 'success',
          records_processed: 45,
          records_failed: 0,
          started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15000).toISOString(),
          file_name: 'buchungen_januar.csv',
        },
        {
          id: 'log-2',
          connection_id: 'conn-1',
          type: 'export',
          status: 'success',
          records_processed: 120,
          records_failed: 0,
          started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 8000).toISOString(),
          file_name: 'datev_export_2024.txt',
        },
      ]);
    }

    setLoading(false);
  }, [currentCompany]);

  // Save functions
  const saveConnections = useCallback((list: SoftwareConnection[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${CONNECTIONS_STORAGE_KEY}_${currentCompany.id}`, JSON.stringify(list));
    setConnections(list);
  }, [currentCompany]);

  const saveImportTemplates = useCallback((list: ImportTemplate[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${IMPORT_TEMPLATES_KEY}_${currentCompany.id}`, JSON.stringify(list));
    setImportTemplates(list);
  }, [currentCompany]);

  const saveExportTemplates = useCallback((list: ExportTemplate[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${EXPORT_TEMPLATES_KEY}_${currentCompany.id}`, JSON.stringify(list));
    setExportTemplates(list);
  }, [currentCompany]);

  const saveSyncLogs = useCallback((list: SyncLog[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${SYNC_LOGS_KEY}_${currentCompany.id}`, JSON.stringify(list));
    setSyncLogs(list);
  }, [currentCompany]);

  // Create connection
  const createConnection = useCallback((data: {
    software: AccountingSoftware;
    name: string;
    version?: string;
    sync_direction: SyncDirection;
  }) => {
    if (!currentCompany) return null;

    const newConnection: SoftwareConnection = {
      id: `conn-${Date.now()}`,
      company_id: currentCompany.id,
      software: data.software,
      name: data.name,
      version: data.version,
      status: 'connected',
      sync_direction: data.sync_direction,
      imported_count: 0,
      exported_count: 0,
      settings: getDefaultSettings(),
      created_at: new Date().toISOString(),
    };

    saveConnections([newConnection, ...connections]);
    return newConnection;
  }, [currentCompany, connections, saveConnections]);

  // Update connection settings
  const updateConnectionSettings = useCallback((connectionId: string, settings: Partial<SoftwareSettings>) => {
    const updated = connections.map(c =>
      c.id === connectionId
        ? { ...c, settings: { ...c.settings, ...settings } }
        : c
    );
    saveConnections(updated);
  }, [connections, saveConnections]);

  // Delete connection
  const deleteConnection = useCallback((connectionId: string) => {
    const filtered = connections.filter(c => c.id !== connectionId);
    saveConnections(filtered);
  }, [connections, saveConnections]);

  // Create import template
  const createImportTemplate = useCallback((data: {
    name: string;
    software: AccountingSoftware;
    format: ImportExportFormat;
    field_mappings: FieldMapping[];
  }) => {
    const newTemplate: ImportTemplate = {
      id: `tpl-${Date.now()}`,
      name: data.name,
      software: data.software,
      format: data.format,
      field_mappings: data.field_mappings,
      created_at: new Date().toISOString(),
    };

    saveImportTemplates([newTemplate, ...importTemplates]);
    return newTemplate;
  }, [importTemplates, saveImportTemplates]);

  // Create export template
  const createExportTemplate = useCallback((data: {
    name: string;
    software: AccountingSoftware;
    format: ImportExportFormat;
    data_type: 'transactions' | 'invoices' | 'contacts' | 'accounts';
    filters: ExportFilter[];
    field_selection: string[];
  }) => {
    const newTemplate: ExportTemplate = {
      id: `exp-${Date.now()}`,
      name: data.name,
      software: data.software,
      format: data.format,
      data_type: data.data_type,
      filters: data.filters,
      field_selection: data.field_selection,
      created_at: new Date().toISOString(),
    };

    saveExportTemplates([newTemplate, ...exportTemplates]);
    return newTemplate;
  }, [exportTemplates, saveExportTemplates]);

  // Delete template
  const deleteImportTemplate = useCallback((templateId: string) => {
    const filtered = importTemplates.filter(t => t.id !== templateId);
    saveImportTemplates(filtered);
  }, [importTemplates, saveImportTemplates]);

  const deleteExportTemplate = useCallback((templateId: string) => {
    const filtered = exportTemplates.filter(t => t.id !== templateId);
    saveExportTemplates(filtered);
  }, [exportTemplates, saveExportTemplates]);

  // Import data (simulated)
  const importData = useCallback(async (
    connectionId: string,
    templateId: string,
    fileContent: string,
    fileName: string
  ): Promise<ImportResult> => {
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const lines = fileContent.split('\n').filter(l => l.trim());
    const total = Math.max(lines.length - 1, 0); // Exclude header
    const imported = Math.floor(total * 0.95);
    const skipped = total - imported;

    const result: ImportResult = {
      success: true,
      total_rows: total,
      imported,
      skipped,
      errors: skipped > 0 ? [
        { row: Math.floor(Math.random() * total), field: 'amount', message: 'Ungültiger Betrag', value: 'abc' },
      ] : [],
      warnings: imported > 0 ? ['Einige Konten wurden automatisch zugeordnet'] : [],
    };

    // Add sync log
    const newLog: SyncLog = {
      id: `log-${Date.now()}`,
      connection_id: connectionId,
      type: 'import',
      status: skipped > 0 ? 'partial' : 'success',
      records_processed: imported,
      records_failed: skipped,
      started_at: new Date(Date.now() - 2000).toISOString(),
      completed_at: new Date().toISOString(),
      file_name: fileName,
    };
    saveSyncLogs([newLog, ...syncLogs]);

    // Update connection stats
    const updated = connections.map(c =>
      c.id === connectionId
        ? {
            ...c,
            last_import_at: new Date().toISOString(),
            imported_count: c.imported_count + imported,
          }
        : c
    );
    saveConnections(updated);

    setProcessing(false);
    return result;
  }, [connections, syncLogs, saveConnections, saveSyncLogs]);

  // Export data (simulated)
  const exportData = useCallback(async (
    connectionId: string,
    templateId: string
  ): Promise<{ success: boolean; content: string; fileName: string; recordCount: number }> => {
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const template = exportTemplates.find(t => t.id === templateId);
    const connection = connections.find(c => c.id === connectionId);

    // Generate sample export data
    const recordCount = Math.floor(Math.random() * 100) + 20;
    let content = '';
    let fileName = '';

    if (template?.format === 'csv') {
      content = generateCSVExport(template, recordCount);
      fileName = `${template.software}_export_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (template?.format === 'datev-ascii') {
      content = generateDATEVExport(recordCount);
      fileName = `EXTF_Buchungsstapel_${new Date().toISOString().split('T')[0]}.txt`;
    } else {
      content = JSON.stringify({ records: [], count: recordCount }, null, 2);
      fileName = `export_${new Date().toISOString().split('T')[0]}.json`;
    }

    // Add sync log
    const newLog: SyncLog = {
      id: `log-${Date.now()}`,
      connection_id: connectionId,
      type: 'export',
      status: 'success',
      records_processed: recordCount,
      records_failed: 0,
      started_at: new Date(Date.now() - 1500).toISOString(),
      completed_at: new Date().toISOString(),
      file_name: fileName,
    };
    saveSyncLogs([newLog, ...syncLogs]);

    // Update connection stats
    const updated = connections.map(c =>
      c.id === connectionId
        ? {
            ...c,
            last_export_at: new Date().toISOString(),
            exported_count: c.exported_count + recordCount,
          }
        : c
    );
    saveConnections(updated);

    setProcessing(false);
    return { success: true, content, fileName, recordCount };
  }, [connections, exportTemplates, syncLogs, saveConnections, saveSyncLogs]);

  // Get software info
  const getSoftwareInfo = useCallback((software: AccountingSoftware) => {
    const info = {
      lexware: {
        name: 'Lexware',
        fullName: 'Lexware Financial Office',
        color: 'bg-blue-500',
        formats: ['csv', 'xml'] as ImportExportFormat[],
        features: ['Buchungen', 'Stammdaten', 'Debitoren/Kreditoren'],
      },
      sage: {
        name: 'SAGE',
        fullName: 'SAGE 50',
        color: 'bg-green-500',
        formats: ['csv', 'xml'] as ImportExportFormat[],
        features: ['Buchhaltung', 'Faktura', 'Kontakte'],
      },
      datev: {
        name: 'DATEV',
        fullName: 'DATEV Unternehmen Online',
        color: 'bg-orange-500',
        formats: ['datev-ascii', 'csv'] as ImportExportFormat[],
        features: ['Buchungsstapel', 'Stammdaten', 'Steuerberater-Export'],
      },
      sevdesk: {
        name: 'sevDesk',
        fullName: 'sevDesk Cloud Buchhaltung',
        color: 'bg-purple-500',
        formats: ['json', 'csv'] as ImportExportFormat[],
        features: ['API-Integration', 'Rechnungen', 'Belege'],
      },
    };
    return info[software];
  }, []);

  // Get sync logs for connection
  const getLogsForConnection = useCallback((connectionId: string) => {
    return syncLogs.filter(l => l.connection_id === connectionId);
  }, [syncLogs]);

  // Get statistics
  const getStats = useCallback(() => {
    const activeConnections = connections.filter(c => c.status === 'connected');
    const totalImported = connections.reduce((sum, c) => sum + c.imported_count, 0);
    const totalExported = connections.reduce((sum, c) => sum + c.exported_count, 0);
    const recentLogs = syncLogs.slice(0, 10);
    const failedSyncs = syncLogs.filter(l => l.status === 'failed').length;

    return {
      totalConnections: connections.length,
      activeConnections: activeConnections.length,
      totalImported,
      totalExported,
      importTemplates: importTemplates.length,
      exportTemplates: exportTemplates.length,
      recentLogs,
      failedSyncs,
    };
  }, [connections, importTemplates, exportTemplates, syncLogs]);

  return {
    connections,
    importTemplates,
    exportTemplates,
    syncLogs,
    loading,
    processing,
    createConnection,
    updateConnectionSettings,
    deleteConnection,
    createImportTemplate,
    createExportTemplate,
    deleteImportTemplate,
    deleteExportTemplate,
    importData,
    exportData,
    getSoftwareInfo,
    getLogsForConnection,
    getStats,
  };
}

function getDefaultSettings(): SoftwareSettings {
  return {
    default_format: 'csv',
    encoding: 'utf-8',
    include_header: true,
    delimiter: ';',
    date_format: 'dd.mm.yyyy',
    decimal_separator: ',',
    account_mapping_enabled: true,
    auto_sync_enabled: false,
    sync_interval_hours: 24,
  };
}

function generateCSVExport(template: ExportTemplate, count: number): string {
  const headers = template.field_selection.join(';');
  const rows = [];

  for (let i = 0; i < count; i++) {
    const row = template.field_selection.map(field => {
      switch (field) {
        case 'date':
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        case 'amount':
          return (Math.random() * 1000).toFixed(2).replace('.', ',');
        case 'description':
          return `Buchung ${i + 1}`;
        case 'account':
          return ['1400', '1600', '8400', '4400'][i % 4];
        case 'contra_account':
          return ['1800', '1200', '1000', '1210'][i % 4];
        case 'tax_rate':
          return ['19', '7', '0'][i % 3];
        default:
          return '';
      }
    });
    rows.push(row.join(';'));
  }

  return `${headers}\n${rows.join('\n')}`;
}

function generateDATEVExport(count: number): string {
  // DATEV ASCII format header
  const header = [
    'EXTF;700;21;Buchungsstapel;12;',
    new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    ';',
    'RE;EUR;1;',
    new Date().getFullYear().toString(),
    '0101;',
    new Date().getFullYear().toString(),
    '1231;',
    'Fintutto Export;;',
  ].join('');

  const rows = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const amount = (Math.random() * 1000).toFixed(2);
    const account = ['1400', '1600', '8400', '4400'][i % 4];
    const contraAccount = ['1800', '1200', '1000', '1210'][i % 4];

    rows.push(`${amount};S;EUR;${account};${contraAccount};;;${dateStr};Buchung ${i + 1};;;;;;;;;;;;`);
  }

  return `${header}\n${rows.join('\n')}`;
}
