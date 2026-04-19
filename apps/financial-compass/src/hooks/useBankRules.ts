import { useState, useCallback, useEffect } from 'react';

export type RuleConditionField =
  | 'description'
  | 'amount'
  | 'counterparty'
  | 'iban'
  | 'reference';

export type RuleConditionOperator =
  | 'contains'
  | 'equals'
  | 'starts_with'
  | 'ends_with'
  | 'regex'
  | 'greater_than'
  | 'less_than'
  | 'between';

export type RuleActionType =
  | 'categorize'
  | 'assign_account'
  | 'assign_cost_center'
  | 'assign_contact'
  | 'set_tax_rate'
  | 'add_tag'
  | 'auto_book';

export interface RuleCondition {
  id: string;
  field: RuleConditionField;
  operator: RuleConditionOperator;
  value: string;
  value2?: string; // For 'between' operator
}

export interface RuleAction {
  id: string;
  type: RuleActionType;
  value: string;
  label?: string;
}

export interface BankRule {
  id: string;
  name: string;
  description?: string;
  conditions: RuleCondition[];
  conditionLogic: 'and' | 'or';
  actions: RuleAction[];
  priority: number;
  isActive: boolean;
  matchCount: number;
  lastMatchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuleMatch {
  ruleId: string;
  ruleName: string;
  transactionId: string;
  matchedConditions: string[];
  suggestedActions: RuleAction[];
  confidence: number;
}

const STORAGE_KEY = 'fintutto_bank_rules';

const DEFAULT_RULES: BankRule[] = [
  {
    id: 'rule-1',
    name: 'Amazon Einkäufe',
    description: 'Automatische Kategorisierung von Amazon-Transaktionen',
    conditions: [
      { id: 'c1', field: 'description', operator: 'contains', value: 'AMAZON' },
    ],
    conditionLogic: 'and',
    actions: [
      { id: 'a1', type: 'categorize', value: 'office_supplies', label: 'Bürobedarf' },
      { id: 'a2', type: 'assign_account', value: '4930', label: 'Bürobedarf' },
    ],
    priority: 1,
    isActive: true,
    matchCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-2',
    name: 'Mietzahlungen',
    description: 'Erkennung von Mietzahlungen',
    conditions: [
      { id: 'c1', field: 'description', operator: 'contains', value: 'MIETE' },
      { id: 'c2', field: 'amount', operator: 'less_than', value: '0' },
    ],
    conditionLogic: 'and',
    actions: [
      { id: 'a1', type: 'categorize', value: 'rent', label: 'Miete' },
      { id: 'a2', type: 'assign_account', value: '4210', label: 'Miete' },
    ],
    priority: 2,
    isActive: true,
    matchCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-3',
    name: 'Telekom Rechnung',
    description: 'Automatische Buchung Telefonkosten',
    conditions: [
      { id: 'c1', field: 'counterparty', operator: 'contains', value: 'TELEKOM' },
    ],
    conditionLogic: 'and',
    actions: [
      { id: 'a1', type: 'categorize', value: 'telecom', label: 'Telekommunikation' },
      { id: 'a2', type: 'assign_account', value: '4920', label: 'Telefon' },
      { id: 'a3', type: 'set_tax_rate', value: '19', label: '19% MwSt' },
    ],
    priority: 3,
    isActive: true,
    matchCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const CONDITION_FIELDS: { value: RuleConditionField; label: string }[] = [
  { value: 'description', label: 'Verwendungszweck' },
  { value: 'amount', label: 'Betrag' },
  { value: 'counterparty', label: 'Gegenkonto/Name' },
  { value: 'iban', label: 'IBAN' },
  { value: 'reference', label: 'Referenz' },
];

export const CONDITION_OPERATORS: { value: RuleConditionOperator; label: string; fields: RuleConditionField[] }[] = [
  { value: 'contains', label: 'enthält', fields: ['description', 'counterparty', 'iban', 'reference'] },
  { value: 'equals', label: 'ist gleich', fields: ['description', 'counterparty', 'iban', 'reference', 'amount'] },
  { value: 'starts_with', label: 'beginnt mit', fields: ['description', 'counterparty', 'iban', 'reference'] },
  { value: 'ends_with', label: 'endet mit', fields: ['description', 'counterparty', 'iban', 'reference'] },
  { value: 'regex', label: 'Regex', fields: ['description', 'counterparty', 'reference'] },
  { value: 'greater_than', label: 'größer als', fields: ['amount'] },
  { value: 'less_than', label: 'kleiner als', fields: ['amount'] },
  { value: 'between', label: 'zwischen', fields: ['amount'] },
];

export const ACTION_TYPES: { value: RuleActionType; label: string }[] = [
  { value: 'categorize', label: 'Kategorie zuweisen' },
  { value: 'assign_account', label: 'Konto zuweisen' },
  { value: 'assign_cost_center', label: 'Kostenstelle zuweisen' },
  { value: 'assign_contact', label: 'Kontakt zuweisen' },
  { value: 'set_tax_rate', label: 'Steuersatz setzen' },
  { value: 'add_tag', label: 'Tag hinzufügen' },
  { value: 'auto_book', label: 'Automatisch buchen' },
];

export const CATEGORIES: { value: string; label: string }[] = [
  { value: 'office_supplies', label: 'Bürobedarf' },
  { value: 'rent', label: 'Miete' },
  { value: 'telecom', label: 'Telekommunikation' },
  { value: 'insurance', label: 'Versicherungen' },
  { value: 'travel', label: 'Reisekosten' },
  { value: 'advertising', label: 'Werbung' },
  { value: 'consulting', label: 'Beratung' },
  { value: 'salary', label: 'Gehälter' },
  { value: 'utilities', label: 'Nebenkosten' },
  { value: 'software', label: 'Software/Lizenzen' },
  { value: 'banking', label: 'Bankgebühren' },
  { value: 'revenue', label: 'Umsatzerlöse' },
  { value: 'other', label: 'Sonstiges' },
];

export function useBankRules() {
  const [rules, setRules] = useState<BankRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load rules from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRules(JSON.parse(stored));
      } catch {
        setRules(DEFAULT_RULES);
      }
    } else {
      setRules(DEFAULT_RULES);
    }
    setIsLoading(false);
  }, []);

  // Save rules to localStorage
  const saveRules = useCallback((newRules: BankRule[]) => {
    setRules(newRules);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRules));
  }, []);

  // Create new rule
  const createRule = useCallback((rule: Omit<BankRule, 'id' | 'matchCount' | 'createdAt' | 'updatedAt'>) => {
    const newRule: BankRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      matchCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveRules([...rules, newRule]);
    return newRule;
  }, [rules, saveRules]);

  // Update rule
  const updateRule = useCallback((id: string, updates: Partial<BankRule>) => {
    saveRules(rules.map(rule =>
      rule.id === id
        ? { ...rule, ...updates, updatedAt: new Date().toISOString() }
        : rule
    ));
  }, [rules, saveRules]);

  // Delete rule
  const deleteRule = useCallback((id: string) => {
    saveRules(rules.filter(rule => rule.id !== id));
  }, [rules, saveRules]);

  // Toggle rule active state
  const toggleRule = useCallback((id: string) => {
    saveRules(rules.map(rule =>
      rule.id === id
        ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() }
        : rule
    ));
  }, [rules, saveRules]);

  // Reorder rules (change priority)
  const reorderRules = useCallback((ruleIds: string[]) => {
    const reordered = ruleIds.map((id, index) => {
      const rule = rules.find(r => r.id === id);
      return rule ? { ...rule, priority: index + 1 } : null;
    }).filter(Boolean) as BankRule[];
    saveRules(reordered);
  }, [rules, saveRules]);

  // Check if a condition matches a transaction
  const checkCondition = useCallback((condition: RuleCondition, transaction: Record<string, any>): boolean => {
    const fieldValue = String(transaction[condition.field] || '').toLowerCase();
    const conditionValue = condition.value.toLowerCase();

    switch (condition.operator) {
      case 'contains':
        return fieldValue.includes(conditionValue);
      case 'equals':
        return fieldValue === conditionValue;
      case 'starts_with':
        return fieldValue.startsWith(conditionValue);
      case 'ends_with':
        return fieldValue.endsWith(conditionValue);
      case 'regex':
        try {
          return new RegExp(condition.value, 'i').test(fieldValue);
        } catch {
          return false;
        }
      case 'greater_than':
        return parseFloat(transaction.amount) > parseFloat(condition.value);
      case 'less_than':
        return parseFloat(transaction.amount) < parseFloat(condition.value);
      case 'between':
        const amount = parseFloat(transaction.amount);
        const min = parseFloat(condition.value);
        const max = parseFloat(condition.value2 || '0');
        return amount >= min && amount <= max;
      default:
        return false;
    }
  }, []);

  // Match a transaction against all rules
  const matchTransaction = useCallback((transaction: Record<string, any>): RuleMatch | null => {
    const activeRules = rules
      .filter(r => r.isActive)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of activeRules) {
      const matchedConditions: string[] = [];
      let allMatch = rule.conditionLogic === 'and';
      let anyMatch = false;

      for (const condition of rule.conditions) {
        const matches = checkCondition(condition, transaction);
        if (matches) {
          matchedConditions.push(condition.id);
          anyMatch = true;
        }
        if (rule.conditionLogic === 'and' && !matches) {
          allMatch = false;
        }
      }

      const isMatch = rule.conditionLogic === 'and' ? allMatch : anyMatch;

      if (isMatch && matchedConditions.length > 0) {
        // Update match count
        updateRule(rule.id, {
          matchCount: rule.matchCount + 1,
          lastMatchedAt: new Date().toISOString(),
        });

        return {
          ruleId: rule.id,
          ruleName: rule.name,
          transactionId: transaction.id,
          matchedConditions,
          suggestedActions: rule.actions,
          confidence: matchedConditions.length / rule.conditions.length,
        };
      }
    }

    return null;
  }, [rules, checkCondition, updateRule]);

  // Match multiple transactions
  const matchTransactions = useCallback((transactions: Record<string, any>[]): Map<string, RuleMatch> => {
    const matches = new Map<string, RuleMatch>();
    for (const transaction of transactions) {
      const match = matchTransaction(transaction);
      if (match) {
        matches.set(transaction.id, match);
      }
    }
    return matches;
  }, [matchTransaction]);

  // Test a rule against sample data
  const testRule = useCallback((rule: BankRule, sampleTransactions: Record<string, any>[]): { matched: number; total: number; examples: Record<string, any>[] } => {
    const examples: Record<string, any>[] = [];
    let matched = 0;

    for (const transaction of sampleTransactions) {
      let allMatch = rule.conditionLogic === 'and';
      let anyMatch = false;

      for (const condition of rule.conditions) {
        const matches = checkCondition(condition, transaction);
        if (matches) anyMatch = true;
        if (rule.conditionLogic === 'and' && !matches) allMatch = false;
      }

      const isMatch = rule.conditionLogic === 'and' ? allMatch : anyMatch;
      if (isMatch) {
        matched++;
        if (examples.length < 5) {
          examples.push(transaction);
        }
      }
    }

    return { matched, total: sampleTransactions.length, examples };
  }, [checkCondition]);

  // Duplicate a rule
  const duplicateRule = useCallback((id: string) => {
    const rule = rules.find(r => r.id === id);
    if (rule) {
      return createRule({
        ...rule,
        name: `${rule.name} (Kopie)`,
        priority: rules.length + 1,
        isActive: false,
      });
    }
    return null;
  }, [rules, createRule]);

  // Export rules
  const exportRules = useCallback(() => {
    const data = JSON.stringify(rules, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bankregeln_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rules]);

  // Import rules
  const importRules = useCallback((jsonData: string, mode: 'replace' | 'merge' = 'merge') => {
    try {
      const imported = JSON.parse(jsonData) as BankRule[];
      if (mode === 'replace') {
        saveRules(imported);
      } else {
        const existingIds = new Set(rules.map(r => r.id));
        const newRules = imported.map(r => ({
          ...r,
          id: existingIds.has(r.id) ? `rule-${Date.now()}-${Math.random()}` : r.id,
        }));
        saveRules([...rules, ...newRules]);
      }
      return { success: true, count: imported.length };
    } catch (error) {
      return { success: false, error: 'Ungültiges JSON-Format' };
    }
  }, [rules, saveRules]);

  // Get rule statistics
  const getStats = useCallback(() => {
    const active = rules.filter(r => r.isActive).length;
    const totalMatches = rules.reduce((sum, r) => sum + r.matchCount, 0);
    const mostUsed = [...rules].sort((a, b) => b.matchCount - a.matchCount).slice(0, 5);
    const lastMatched = [...rules]
      .filter(r => r.lastMatchedAt)
      .sort((a, b) => new Date(b.lastMatchedAt!).getTime() - new Date(a.lastMatchedAt!).getTime())
      .slice(0, 5);

    return {
      total: rules.length,
      active,
      inactive: rules.length - active,
      totalMatches,
      mostUsed,
      lastMatched,
    };
  }, [rules]);

  return {
    rules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    reorderRules,
    matchTransaction,
    matchTransactions,
    testRule,
    duplicateRule,
    exportRules,
    importRules,
    getStats,
  };
}
