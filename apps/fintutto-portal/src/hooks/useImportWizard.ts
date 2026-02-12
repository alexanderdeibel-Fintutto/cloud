import { useState, useCallback, useMemo } from 'react';

export type ImportFormat = 'csv' | 'json' | 'xlsx' | 'mt940' | 'datev' | 'camt';
export type ImportTarget = 'contacts' | 'invoices' | 'receipts' | 'bookings' | 'transactions' | 'accounts';

export interface ImportMapping {
  sourceColumn: string;
  targetField: string;
  transform?: 'none' | 'date' | 'number' | 'currency' | 'lowercase' | 'uppercase';
  defaultValue?: string;
  required: boolean;
}

export interface ImportValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: ImportValidationError[];
  isValid: boolean;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: ImportValidationError[];
  duration: number;
}

export type WizardStep = 'upload' | 'mapping' | 'preview' | 'import' | 'complete';

// Target field definitions
const TARGET_FIELDS: Record<ImportTarget, { field: string; label: string; required: boolean; type: string }[]> = {
  contacts: [
    { field: 'name', label: 'Name', required: true, type: 'string' },
    { field: 'email', label: 'E-Mail', required: false, type: 'email' },
    { field: 'phone', label: 'Telefon', required: false, type: 'string' },
    { field: 'company', label: 'Firma', required: false, type: 'string' },
    { field: 'street', label: 'Straße', required: false, type: 'string' },
    { field: 'zip', label: 'PLZ', required: false, type: 'string' },
    { field: 'city', label: 'Stadt', required: false, type: 'string' },
    { field: 'country', label: 'Land', required: false, type: 'string' },
    { field: 'vatId', label: 'USt-IdNr.', required: false, type: 'string' },
    { field: 'iban', label: 'IBAN', required: false, type: 'iban' },
    { field: 'bic', label: 'BIC', required: false, type: 'string' },
    { field: 'type', label: 'Typ (Kunde/Lieferant)', required: false, type: 'string' },
    { field: 'notes', label: 'Notizen', required: false, type: 'string' },
  ],
  invoices: [
    { field: 'invoiceNumber', label: 'Rechnungsnummer', required: true, type: 'string' },
    { field: 'date', label: 'Datum', required: true, type: 'date' },
    { field: 'dueDate', label: 'Fälligkeitsdatum', required: false, type: 'date' },
    { field: 'contactName', label: 'Kunde', required: true, type: 'string' },
    { field: 'description', label: 'Beschreibung', required: false, type: 'string' },
    { field: 'amount', label: 'Betrag (netto)', required: true, type: 'currency' },
    { field: 'taxRate', label: 'Steuersatz', required: false, type: 'number' },
    { field: 'status', label: 'Status', required: false, type: 'string' },
  ],
  receipts: [
    { field: 'receiptNumber', label: 'Belegnummer', required: false, type: 'string' },
    { field: 'date', label: 'Datum', required: true, type: 'date' },
    { field: 'vendor', label: 'Lieferant', required: true, type: 'string' },
    { field: 'description', label: 'Beschreibung', required: false, type: 'string' },
    { field: 'amount', label: 'Betrag (brutto)', required: true, type: 'currency' },
    { field: 'taxRate', label: 'Steuersatz', required: false, type: 'number' },
    { field: 'category', label: 'Kategorie', required: false, type: 'string' },
    { field: 'account', label: 'Konto', required: false, type: 'string' },
  ],
  bookings: [
    { field: 'date', label: 'Buchungsdatum', required: true, type: 'date' },
    { field: 'debitAccount', label: 'Sollkonto', required: true, type: 'string' },
    { field: 'creditAccount', label: 'Habenkonto', required: true, type: 'string' },
    { field: 'amount', label: 'Betrag', required: true, type: 'currency' },
    { field: 'description', label: 'Buchungstext', required: true, type: 'string' },
    { field: 'reference', label: 'Referenz', required: false, type: 'string' },
    { field: 'costCenter', label: 'Kostenstelle', required: false, type: 'string' },
  ],
  transactions: [
    { field: 'date', label: 'Datum', required: true, type: 'date' },
    { field: 'valueDate', label: 'Valuta', required: false, type: 'date' },
    { field: 'amount', label: 'Betrag', required: true, type: 'currency' },
    { field: 'description', label: 'Verwendungszweck', required: true, type: 'string' },
    { field: 'counterparty', label: 'Auftraggeber/Empfänger', required: false, type: 'string' },
    { field: 'iban', label: 'IBAN', required: false, type: 'iban' },
    { field: 'reference', label: 'Referenz', required: false, type: 'string' },
  ],
  accounts: [
    { field: 'number', label: 'Kontonummer', required: true, type: 'string' },
    { field: 'name', label: 'Kontobezeichnung', required: true, type: 'string' },
    { field: 'type', label: 'Kontotyp', required: true, type: 'string' },
    { field: 'taxRate', label: 'Steuersatz', required: false, type: 'number' },
    { field: 'costCenter', label: 'Kostenstelle', required: false, type: 'string' },
  ],
};

const SUPPORTED_FORMATS: Record<ImportTarget, ImportFormat[]> = {
  contacts: ['csv', 'json', 'xlsx'],
  invoices: ['csv', 'json', 'datev'],
  receipts: ['csv', 'json'],
  bookings: ['csv', 'json', 'datev'],
  transactions: ['csv', 'mt940', 'camt'],
  accounts: ['csv', 'json', 'datev'],
};

export function useImportWizard(target: ImportTarget) {
  const [step, setStep] = useState<WizardStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImportFormat>('csv');
  const [rawData, setRawData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ImportMapping[]>([]);
  const [preview, setPreview] = useState<ImportPreviewRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [delimiter, setDelimiter] = useState(',');

  const targetFields = TARGET_FIELDS[target];
  const supportedFormats = SUPPORTED_FORMATS[target];

  // Parse CSV content
  const parseCSV = useCallback((content: string, delim: string = ','): string[][] => {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delim && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const content = await uploadedFile.text();

      if (format === 'csv') {
        const parsed = parseCSV(content, delimiter);
        if (parsed.length > 0) {
          if (hasHeaders) {
            setHeaders(parsed[0]);
            setRawData(parsed.slice(1));
          } else {
            setHeaders(parsed[0].map((_, i) => `Spalte ${i + 1}`));
            setRawData(parsed);
          }

          // Auto-create initial mappings
          const initialMappings: ImportMapping[] = targetFields.map(field => ({
            sourceColumn: '',
            targetField: field.field,
            transform: field.type === 'date' ? 'date' : field.type === 'currency' ? 'currency' : 'none',
            required: field.required,
          }));
          setMappings(initialMappings);
        }
      } else if (format === 'json') {
        const jsonData = JSON.parse(content);
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        if (dataArray.length > 0) {
          setHeaders(Object.keys(dataArray[0]));
          setRawData(dataArray.map(item => Object.values(item).map(String)));
        }
      }

      setStep('mapping');
    } catch (error) {
      console.error('Parse error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [format, delimiter, hasHeaders, parseCSV, targetFields]);

  // Update mapping
  const updateMapping = useCallback((targetField: string, sourceColumn: string) => {
    setMappings(prev => prev.map(m =>
      m.targetField === targetField ? { ...m, sourceColumn } : m
    ));
  }, []);

  // Validate row
  const validateRow = useCallback((row: Record<string, string>): ImportValidationError[] => {
    const errors: ImportValidationError[] = [];

    mappings.forEach(mapping => {
      if (mapping.required && !row[mapping.targetField]) {
        errors.push({
          row: 0,
          column: mapping.targetField,
          value: '',
          error: `${mapping.targetField} ist erforderlich`,
        });
      }

      const value = row[mapping.targetField];
      if (value) {
        if (mapping.transform === 'date') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push({
              row: 0,
              column: mapping.targetField,
              value,
              error: 'Ungültiges Datum',
            });
          }
        } else if (mapping.transform === 'currency' || mapping.transform === 'number') {
          const num = parseFloat(value.replace(',', '.').replace(/[^\d.-]/g, ''));
          if (isNaN(num)) {
            errors.push({
              row: 0,
              column: mapping.targetField,
              value,
              error: 'Ungültige Zahl',
            });
          }
        }
      }
    });

    return errors;
  }, [mappings]);

  // Generate preview
  const generatePreview = useCallback(() => {
    const previewRows: ImportPreviewRow[] = rawData.slice(0, 10).map((row, index) => {
      const mappedData: Record<string, string> = {};

      mappings.forEach(mapping => {
        const sourceIndex = headers.indexOf(mapping.sourceColumn);
        if (sourceIndex !== -1) {
          let value = row[sourceIndex] || '';

          // Apply transform
          if (mapping.transform === 'date' && value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              value = date.toISOString().split('T')[0];
            }
          } else if ((mapping.transform === 'currency' || mapping.transform === 'number') && value) {
            const num = parseFloat(value.replace(',', '.').replace(/[^\d.-]/g, ''));
            if (!isNaN(num)) {
              value = num.toFixed(2);
            }
          }

          mappedData[mapping.targetField] = value;
        } else if (mapping.defaultValue) {
          mappedData[mapping.targetField] = mapping.defaultValue;
        }
      });

      const errors = validateRow(mappedData);

      return {
        rowNumber: index + 1,
        data: mappedData,
        errors,
        isValid: errors.length === 0,
      };
    });

    setPreview(previewRows);
    setStep('preview');
  }, [rawData, headers, mappings, validateRow]);

  // Execute import
  const executeImport = useCallback(async (
    importHandler: (data: Record<string, string>[]) => Promise<{ success: boolean; error?: string }[]>
  ): Promise<ImportResult> => {
    setIsProcessing(true);
    setStep('import');
    const startTime = Date.now();

    try {
      // Map all data
      const mappedData = rawData.map(row => {
        const record: Record<string, string> = {};
        mappings.forEach(mapping => {
          const sourceIndex = headers.indexOf(mapping.sourceColumn);
          if (sourceIndex !== -1) {
            let value = row[sourceIndex] || '';

            if (mapping.transform === 'date' && value) {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                value = date.toISOString().split('T')[0];
              }
            } else if ((mapping.transform === 'currency' || mapping.transform === 'number') && value) {
              const num = parseFloat(value.replace(',', '.').replace(/[^\d.-]/g, ''));
              if (!isNaN(num)) {
                value = num.toFixed(2);
              }
            }

            record[mapping.targetField] = value;
          } else if (mapping.defaultValue) {
            record[mapping.targetField] = mapping.defaultValue;
          }
        });
        return record;
      });

      // Validate and filter
      const validData = mappedData.filter(row => validateRow(row).length === 0);
      const skippedCount = mappedData.length - validData.length;

      // Import
      const results = await importHandler(validData);
      const importedCount = results.filter(r => r.success).length;
      const errors = results
        .map((r, i) => r.error ? { row: i, column: '', value: '', error: r.error } : null)
        .filter((e): e is ImportValidationError => e !== null);

      const importResult: ImportResult = {
        imported: importedCount,
        skipped: skippedCount + (validData.length - importedCount),
        errors,
        duration: Date.now() - startTime,
      };

      setResult(importResult);
      setStep('complete');
      return importResult;
    } catch (error) {
      const importResult: ImportResult = {
        imported: 0,
        skipped: rawData.length,
        errors: [{ row: 0, column: '', value: '', error: (error as Error).message }],
        duration: Date.now() - startTime,
      };
      setResult(importResult);
      setStep('complete');
      return importResult;
    } finally {
      setIsProcessing(false);
    }
  }, [rawData, headers, mappings, validateRow]);

  // Reset wizard
  const reset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setMappings([]);
    setPreview([]);
    setResult(null);
  }, []);

  // Navigation
  const goToStep = useCallback((newStep: WizardStep) => {
    setStep(newStep);
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case 'upload':
        return file !== null;
      case 'mapping':
        const requiredMapped = mappings
          .filter(m => m.required)
          .every(m => m.sourceColumn !== '');
        return requiredMapped;
      case 'preview':
        return preview.some(p => p.isValid);
      default:
        return false;
    }
  }, [step, file, mappings, preview]);

  return {
    // State
    step,
    file,
    format,
    rawData,
    headers,
    mappings,
    preview,
    result,
    isProcessing,
    hasHeaders,
    delimiter,
    canProceed,

    // Config
    targetFields,
    supportedFormats,

    // Setters
    setFormat,
    setHasHeaders,
    setDelimiter,

    // Actions
    handleFileUpload,
    updateMapping,
    generatePreview,
    executeImport,
    reset,
    goToStep,
  };
}
