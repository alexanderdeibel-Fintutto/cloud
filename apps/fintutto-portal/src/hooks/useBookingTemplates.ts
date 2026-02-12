import { useState, useCallback, useEffect } from 'react';

export type BookingType = 'expense' | 'income' | 'transfer' | 'depreciation' | 'accrual';

export interface BookingTemplateLine {
  id: string;
  accountNumber: string;
  accountName: string;
  debitAmount?: number;
  creditAmount?: number;
  taxRate?: number;
  costCenter?: string;
}

export interface BookingTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: BookingType;
  lines: BookingTemplateLine[];
  defaultAmount?: number;
  isAmountFixed: boolean;
  vatIncluded: boolean;
  tags: string[];
  usageCount: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFromTemplate {
  templateId: string;
  date: string;
  amount: number;
  description: string;
  reference?: string;
  lines: BookingTemplateLine[];
}

const STORAGE_KEY = 'fintutto_booking_templates';

const DEFAULT_TEMPLATES: BookingTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Büromaterial',
    description: 'Standard-Buchung für Bürobedarf',
    category: 'Betriebsausgaben',
    type: 'expense',
    lines: [
      { id: 'l1', accountNumber: '4930', accountName: 'Bürobedarf', debitAmount: 100 },
      { id: 'l2', accountNumber: '1576', accountName: 'Vorsteuer 19%', debitAmount: 19 },
      { id: 'l3', accountNumber: '1200', accountName: 'Bank', creditAmount: 119 },
    ],
    isAmountFixed: false,
    vatIncluded: true,
    tags: ['büro', 'material'],
    usageCount: 0,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-2',
    name: 'Miete Geschäftsräume',
    description: 'Monatliche Mietbuchung',
    category: 'Raumkosten',
    type: 'expense',
    lines: [
      { id: 'l1', accountNumber: '4210', accountName: 'Miete', debitAmount: 1000 },
      { id: 'l2', accountNumber: '1200', accountName: 'Bank', creditAmount: 1000 },
    ],
    defaultAmount: 1500,
    isAmountFixed: false,
    vatIncluded: false,
    tags: ['miete', 'monatlich'],
    usageCount: 0,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-3',
    name: 'Telefonkosten',
    description: 'Telekommunikationsausgaben',
    category: 'Betriebsausgaben',
    type: 'expense',
    lines: [
      { id: 'l1', accountNumber: '4920', accountName: 'Telefon', debitAmount: 100 },
      { id: 'l2', accountNumber: '1576', accountName: 'Vorsteuer 19%', debitAmount: 19 },
      { id: 'l3', accountNumber: '1200', accountName: 'Bank', creditAmount: 119 },
    ],
    isAmountFixed: false,
    vatIncluded: true,
    tags: ['telefon', 'kommunikation'],
    usageCount: 0,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-4',
    name: 'Kundenrechnung bezahlt',
    description: 'Zahlungseingang von Kunden',
    category: 'Einnahmen',
    type: 'income',
    lines: [
      { id: 'l1', accountNumber: '1200', accountName: 'Bank', debitAmount: 100 },
      { id: 'l2', accountNumber: '1400', accountName: 'Forderungen', creditAmount: 100 },
    ],
    isAmountFixed: false,
    vatIncluded: false,
    tags: ['einnahme', 'zahlung'],
    usageCount: 0,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-5',
    name: 'Privatentnahme',
    description: 'Entnahme aus dem Geschäftsvermögen',
    category: 'Eigenkapital',
    type: 'transfer',
    lines: [
      { id: 'l1', accountNumber: '1800', accountName: 'Privatentnahmen', debitAmount: 100 },
      { id: 'l2', accountNumber: '1200', accountName: 'Bank', creditAmount: 100 },
    ],
    isAmountFixed: false,
    vatIncluded: false,
    tags: ['privat', 'entnahme'],
    usageCount: 0,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-6',
    name: 'AfA Büroausstattung',
    description: 'Monatliche Abschreibung',
    category: 'Abschreibungen',
    type: 'depreciation',
    lines: [
      { id: 'l1', accountNumber: '4830', accountName: 'Abschreibungen Sachanlagen', debitAmount: 100 },
      { id: 'l2', accountNumber: '0410', accountName: 'Büroausstattung', creditAmount: 100 },
    ],
    isAmountFixed: false,
    vatIncluded: false,
    tags: ['afa', 'abschreibung'],
    usageCount: 0,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const TEMPLATE_CATEGORIES = [
  'Betriebsausgaben',
  'Raumkosten',
  'Personalkosten',
  'Einnahmen',
  'Eigenkapital',
  'Abschreibungen',
  'Steuern',
  'Finanzen',
  'Sonstige',
];

export const BOOKING_TYPES: { value: BookingType; label: string }[] = [
  { value: 'expense', label: 'Ausgabe' },
  { value: 'income', label: 'Einnahme' },
  { value: 'transfer', label: 'Umbuchung' },
  { value: 'depreciation', label: 'Abschreibung' },
  { value: 'accrual', label: 'Abgrenzung' },
];

export const COMMON_ACCOUNTS = [
  { number: '0410', name: 'Büroausstattung' },
  { number: '0420', name: 'Geschäftsausstattung' },
  { number: '0650', name: 'EDV-Software' },
  { number: '1200', name: 'Bank' },
  { number: '1000', name: 'Kasse' },
  { number: '1400', name: 'Forderungen aus LuL' },
  { number: '1576', name: 'Vorsteuer 19%' },
  { number: '1571', name: 'Vorsteuer 7%' },
  { number: '1600', name: 'Verbindlichkeiten aus LuL' },
  { number: '1776', name: 'Umsatzsteuer 19%' },
  { number: '1771', name: 'Umsatzsteuer 7%' },
  { number: '1800', name: 'Privatentnahmen' },
  { number: '4100', name: 'Löhne und Gehälter' },
  { number: '4210', name: 'Miete' },
  { number: '4240', name: 'Gas, Strom, Wasser' },
  { number: '4360', name: 'Versicherungen' },
  { number: '4500', name: 'Kfz-Kosten' },
  { number: '4600', name: 'Werbekosten' },
  { number: '4830', name: 'Abschreibungen Sachanlagen' },
  { number: '4920', name: 'Telefon' },
  { number: '4930', name: 'Bürobedarf' },
  { number: '4940', name: 'Zeitschriften, Bücher' },
  { number: '4950', name: 'Rechts- und Beratungskosten' },
  { number: '4970', name: 'Nebenkosten des Geldverkehrs' },
  { number: '8400', name: 'Erlöse 19% USt' },
  { number: '8300', name: 'Erlöse 7% USt' },
];

export function useBookingTemplates() {
  const [templates, setTemplates] = useState<BookingTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTemplates(JSON.parse(stored));
      } catch {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } else {
      setTemplates(DEFAULT_TEMPLATES);
    }
    setIsLoading(false);
  }, []);

  // Save templates to localStorage
  const saveTemplates = useCallback((newTemplates: BookingTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
  }, []);

  // Create new template
  const createTemplate = useCallback((template: Omit<BookingTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: BookingTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTemplates([...templates, newTemplate]);
    return newTemplate;
  }, [templates, saveTemplates]);

  // Update template
  const updateTemplate = useCallback((id: string, updates: Partial<BookingTemplate>) => {
    saveTemplates(templates.map(tpl =>
      tpl.id === id
        ? { ...tpl, ...updates, updatedAt: new Date().toISOString() }
        : tpl
    ));
  }, [templates, saveTemplates]);

  // Delete template
  const deleteTemplate = useCallback((id: string) => {
    saveTemplates(templates.filter(tpl => tpl.id !== id));
  }, [templates, saveTemplates]);

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    saveTemplates(templates.map(tpl =>
      tpl.id === id
        ? { ...tpl, isFavorite: !tpl.isFavorite, updatedAt: new Date().toISOString() }
        : tpl
    ));
  }, [templates, saveTemplates]);

  // Use template (create booking)
  const useTemplate = useCallback((id: string, amount: number, description: string, date: string): BookingFromTemplate | null => {
    const template = templates.find(t => t.id === id);
    if (!template) return null;

    // Calculate amounts based on template
    const ratio = template.defaultAmount ? amount / template.defaultAmount : 1;
    const lines = template.lines.map(line => ({
      ...line,
      debitAmount: line.debitAmount ? Math.round(line.debitAmount * ratio * 100) / 100 : undefined,
      creditAmount: line.creditAmount ? Math.round(line.creditAmount * ratio * 100) / 100 : undefined,
    }));

    // Update usage count
    updateTemplate(id, { usageCount: template.usageCount + 1 });

    return {
      templateId: id,
      date,
      amount,
      description,
      lines,
    };
  }, [templates, updateTemplate]);

  // Duplicate template
  const duplicateTemplate = useCallback((id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      return createTemplate({
        ...template,
        name: `${template.name} (Kopie)`,
        isFavorite: false,
      });
    }
    return null;
  }, [templates, createTemplate]);

  // Search templates
  const searchTemplates = useCallback((query: string): BookingTemplate[] => {
    const q = query.toLowerCase();
    return templates.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [templates]);

  // Get templates by category
  const getByCategory = useCallback((category: string): BookingTemplate[] => {
    return templates.filter(t => t.category === category);
  }, [templates]);

  // Get templates by type
  const getByType = useCallback((type: BookingType): BookingTemplate[] => {
    return templates.filter(t => t.type === type);
  }, [templates]);

  // Get favorites
  const getFavorites = useCallback((): BookingTemplate[] => {
    return templates.filter(t => t.isFavorite);
  }, [templates]);

  // Get most used
  const getMostUsed = useCallback((limit = 5): BookingTemplate[] => {
    return [...templates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }, [templates]);

  // Get recently used
  const getRecentlyUsed = useCallback((limit = 5): BookingTemplate[] => {
    return [...templates]
      .filter(t => t.usageCount > 0)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }, [templates]);

  // Validate template lines (debit = credit)
  const validateTemplate = useCallback((lines: BookingTemplateLine[]): { valid: boolean; debit: number; credit: number } => {
    const debit = lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
    const credit = lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0);
    return {
      valid: Math.abs(debit - credit) < 0.01,
      debit,
      credit,
    };
  }, []);

  // Export templates
  const exportTemplates = useCallback(() => {
    const data = JSON.stringify(templates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buchungsvorlagen_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [templates]);

  // Import templates
  const importTemplates = useCallback((jsonData: string, mode: 'replace' | 'merge' = 'merge') => {
    try {
      const imported = JSON.parse(jsonData) as BookingTemplate[];
      if (mode === 'replace') {
        saveTemplates(imported);
      } else {
        const existingIds = new Set(templates.map(t => t.id));
        const newTemplates = imported.map(t => ({
          ...t,
          id: existingIds.has(t.id) ? `tpl-${Date.now()}-${Math.random()}` : t.id,
        }));
        saveTemplates([...templates, ...newTemplates]);
      }
      return { success: true, count: imported.length };
    } catch (error) {
      return { success: false, error: 'Ungültiges JSON-Format' };
    }
  }, [templates, saveTemplates]);

  // Get statistics
  const getStats = useCallback(() => {
    const byCategory = TEMPLATE_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = templates.filter(t => t.category === cat).length;
      return acc;
    }, {} as Record<string, number>);

    const byType = BOOKING_TYPES.reduce((acc, bt) => {
      acc[bt.value] = templates.filter(t => t.type === bt.value).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: templates.length,
      favorites: templates.filter(t => t.isFavorite).length,
      totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
      byCategory,
      byType,
    };
  }, [templates]);

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite,
    useTemplate,
    duplicateTemplate,
    searchTemplates,
    getByCategory,
    getByType,
    getFavorites,
    getMostUsed,
    getRecentlyUsed,
    validateTemplate,
    exportTemplates,
    importTemplates,
    getStats,
  };
}
