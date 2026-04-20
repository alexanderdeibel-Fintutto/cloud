import { useState, useCallback, useMemo } from 'react';

export type ValidationCategory =
  | 'bookings' | 'invoices' | 'receipts' | 'contacts'
  | 'bank' | 'accounts' | 'tax' | 'consistency';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  isActive: boolean;
  autoFix?: boolean;
}

export interface ValidationIssue {
  id: string;
  ruleId: string;
  ruleName: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  message: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  field?: string;
  currentValue?: unknown;
  expectedValue?: unknown;
  suggestedFix?: string;
  canAutoFix: boolean;
  detectedAt: string;
  resolvedAt?: string;
}

export interface ValidationResult {
  totalChecks: number;
  passedChecks: number;
  issues: ValidationIssue[];
  duration: number;
  completedAt: string;
}

// Standard validation rules for German accounting
const DEFAULT_RULES: ValidationRule[] = [
  // Bookings
  {
    id: 'booking-balance',
    name: 'Buchungsgleichgewicht',
    description: 'Soll und Haben müssen ausgeglichen sein',
    category: 'bookings',
    severity: 'error',
    isActive: true,
  },
  {
    id: 'booking-date',
    name: 'Buchungsdatum',
    description: 'Buchungsdatum muss im aktuellen Geschäftsjahr liegen',
    category: 'bookings',
    severity: 'warning',
    isActive: true,
  },
  {
    id: 'booking-account-exists',
    name: 'Konto vorhanden',
    description: 'Gebuchte Konten müssen im Kontenrahmen existieren',
    category: 'bookings',
    severity: 'error',
    isActive: true,
  },
  {
    id: 'booking-description',
    name: 'Buchungstext vorhanden',
    description: 'Jede Buchung muss einen Buchungstext haben',
    category: 'bookings',
    severity: 'warning',
    isActive: true,
  },

  // Invoices
  {
    id: 'invoice-number-unique',
    name: 'Rechnungsnummer eindeutig',
    description: 'Rechnungsnummern müssen eindeutig sein',
    category: 'invoices',
    severity: 'error',
    isActive: true,
  },
  {
    id: 'invoice-number-sequence',
    name: 'Rechnungsnummer-Sequenz',
    description: 'Rechnungsnummern sollten fortlaufend sein (GoBD)',
    category: 'invoices',
    severity: 'warning',
    isActive: true,
  },
  {
    id: 'invoice-customer',
    name: 'Kundendaten vollständig',
    description: 'Rechnungen müssen vollständige Kundendaten enthalten',
    category: 'invoices',
    severity: 'error',
    isActive: true,
  },
  {
    id: 'invoice-items',
    name: 'Rechnungspositionen',
    description: 'Rechnungen müssen mindestens eine Position haben',
    category: 'invoices',
    severity: 'error',
    isActive: true,
  },
  {
    id: 'invoice-tax',
    name: 'Steuerausweis',
    description: 'Steuer muss korrekt ausgewiesen sein',
    category: 'invoices',
    severity: 'error',
    isActive: true,
  },

  // Receipts
  {
    id: 'receipt-date',
    name: 'Belegdatum',
    description: 'Belegdatum darf nicht in der Zukunft liegen',
    category: 'receipts',
    severity: 'error',
    isActive: true,
  },
  {
    id: 'receipt-amount',
    name: 'Belegbetrag',
    description: 'Belegbetrag muss größer als 0 sein',
    category: 'receipts',
    severity: 'error',
    isActive: true,
  },
  {
    id: 'receipt-vendor',
    name: 'Lieferant',
    description: 'Belege sollten einen Lieferanten haben',
    category: 'receipts',
    severity: 'warning',
    isActive: true,
  },

  // Contacts
  {
    id: 'contact-duplicate',
    name: 'Doppelte Kontakte',
    description: 'Prüft auf mögliche Duplikate',
    category: 'contacts',
    severity: 'warning',
    isActive: true,
  },
  {
    id: 'contact-iban',
    name: 'IBAN Format',
    description: 'IBAN muss gültig sein',
    category: 'contacts',
    severity: 'warning',
    isActive: true,
    autoFix: true,
  },
  {
    id: 'contact-vat-id',
    name: 'USt-IdNr. Format',
    description: 'USt-IdNr. muss gültig sein',
    category: 'contacts',
    severity: 'warning',
    isActive: true,
  },

  // Bank
  {
    id: 'bank-unmatched',
    name: 'Nicht zugeordnete Transaktionen',
    description: 'Banktransaktionen ohne Belegzuordnung',
    category: 'bank',
    severity: 'warning',
    isActive: true,
  },
  {
    id: 'bank-balance',
    name: 'Kontostand-Abweichung',
    description: 'Berechneter Saldo weicht vom Banksaldo ab',
    category: 'bank',
    severity: 'error',
    isActive: true,
  },

  // Tax
  {
    id: 'tax-rate-valid',
    name: 'Gültiger Steuersatz',
    description: 'Steuersätze müssen gültig sein (0%, 7%, 19%)',
    category: 'tax',
    severity: 'error',
    isActive: true,
  },
  {
    id: 'tax-vat-mismatch',
    name: 'USt-Differenz',
    description: 'Berechnete und gebuchte USt stimmen nicht überein',
    category: 'tax',
    severity: 'error',
    isActive: true,
  },

  // Consistency
  {
    id: 'orphan-bookings',
    name: 'Verwaiste Buchungen',
    description: 'Buchungen ohne zugehörigen Beleg',
    category: 'consistency',
    severity: 'info',
    isActive: true,
  },
  {
    id: 'unbooked-receipts',
    name: 'Unverbuchte Belege',
    description: 'Belege ohne zugehörige Buchung',
    category: 'consistency',
    severity: 'warning',
    isActive: true,
  },
  {
    id: 'date-consistency',
    name: 'Datumskonsistenz',
    description: 'Belege vor Buchungsdatum',
    category: 'consistency',
    severity: 'warning',
    isActive: true,
  },
];

const STORAGE_KEY = 'fintutto_validation';

export function useDataValidation() {
  const [rules, setRules] = useState<ValidationRule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rules`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_RULES;
  });

  const [lastResult, setLastResult] = useState<ValidationResult | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_result`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [isRunning, setIsRunning] = useState(false);

  // Toggle rule
  const toggleRule = useCallback((ruleId: string) => {
    setRules(prev => {
      const updated = prev.map(r =>
        r.id === ruleId ? { ...r, isActive: !r.isActive } : r
      );
      localStorage.setItem(`${STORAGE_KEY}_rules`, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Run validation
  const runValidation = useCallback(async (
    validators: {
      category: ValidationCategory;
      validate: () => Promise<ValidationIssue[]>;
    }[]
  ): Promise<ValidationResult> => {
    setIsRunning(true);
    const startTime = Date.now();
    const allIssues: ValidationIssue[] = [];

    try {
      const activeRules = rules.filter(r => r.isActive);
      const activeCategories = new Set(activeRules.map(r => r.category));

      for (const validator of validators) {
        if (activeCategories.has(validator.category)) {
          const issues = await validator.validate();
          allIssues.push(...issues);
        }
      }

      const result: ValidationResult = {
        totalChecks: activeRules.length,
        passedChecks: activeRules.length - new Set(allIssues.map(i => i.ruleId)).size,
        issues: allIssues,
        duration: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };

      setLastResult(result);
      localStorage.setItem(`${STORAGE_KEY}_result`, JSON.stringify(result));
      return result;
    } finally {
      setIsRunning(false);
    }
  }, [rules]);

  // Quick validation helpers
  const validateIBAN = useCallback((iban: string): boolean => {
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned)) return false;

    // Move first 4 chars to end and convert letters to numbers
    const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
    const numeric = rearranged.replace(/[A-Z]/g, char => (char.charCodeAt(0) - 55).toString());

    // Mod 97 check
    let remainder = numeric;
    while (remainder.length > 2) {
      const chunk = remainder.slice(0, 9);
      remainder = (parseInt(chunk) % 97).toString() + remainder.slice(9);
    }
    return parseInt(remainder) % 97 === 1;
  }, []);

  const validateVatId = useCallback((vatId: string): boolean => {
    const cleaned = vatId.replace(/\s/g, '').toUpperCase();
    // German VAT ID format: DE followed by 9 digits
    if (/^DE\d{9}$/.test(cleaned)) return true;
    // Austrian: ATU followed by 8 digits
    if (/^ATU\d{8}$/.test(cleaned)) return true;
    // Other EU formats...
    return /^[A-Z]{2}[A-Z0-9]{2,12}$/.test(cleaned);
  }, []);

  const validateTaxRate = useCallback((rate: number): boolean => {
    const validRates = [0, 7, 19]; // German standard rates
    return validRates.includes(rate);
  }, []);

  // Create issue
  const createIssue = useCallback((
    rule: ValidationRule,
    entityType: string,
    entityId: string,
    message: string,
    options?: {
      entityName?: string;
      field?: string;
      currentValue?: unknown;
      expectedValue?: unknown;
      suggestedFix?: string;
      canAutoFix?: boolean;
    }
  ): ValidationIssue => ({
    id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ruleId: rule.id,
    ruleName: rule.name,
    category: rule.category,
    severity: rule.severity,
    message,
    entityType,
    entityId,
    entityName: options?.entityName,
    field: options?.field,
    currentValue: options?.currentValue,
    expectedValue: options?.expectedValue,
    suggestedFix: options?.suggestedFix,
    canAutoFix: options?.canAutoFix ?? false,
    detectedAt: new Date().toISOString(),
  }), []);

  // Statistics
  const stats = useMemo(() => {
    if (!lastResult) return null;

    const byCategory = lastResult.issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<ValidationCategory, number>);

    const bySeverity = lastResult.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<ValidationSeverity, number>);

    return {
      totalIssues: lastResult.issues.length,
      errors: bySeverity.error || 0,
      warnings: bySeverity.warning || 0,
      info: bySeverity.info || 0,
      byCategory,
      healthScore: Math.max(0, 100 - (bySeverity.error || 0) * 10 - (bySeverity.warning || 0) * 3),
      lastRun: lastResult.completedAt,
    };
  }, [lastResult]);

  return {
    rules,
    lastResult,
    isRunning,
    stats,
    toggleRule,
    runValidation,
    validateIBAN,
    validateVatId,
    validateTaxRate,
    createIssue,
    defaultRules: DEFAULT_RULES,
  };
}
