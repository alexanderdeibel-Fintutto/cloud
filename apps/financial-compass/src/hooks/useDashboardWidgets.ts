import { useState, useEffect, useCallback } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export type WidgetType =
  | 'revenue-chart'
  | 'expense-chart'
  | 'profit-overview'
  | 'cash-balance'
  | 'open-invoices'
  | 'recent-transactions'
  | 'budget-status'
  | 'upcoming-payments'
  | 'tax-overview'
  | 'quick-stats'
  | 'customer-overview'
  | 'cashflow-mini';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number;
  visible: boolean;
  settings?: Record<string, any>;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: 1 | 2 | 3 | 4;
  theme: 'default' | 'compact' | 'detailed';
}

export const WIDGET_DEFINITIONS: Record<WidgetType, {
  title: string;
  description: string;
  defaultSize: WidgetSize;
  icon: string;
  category: 'finance' | 'operations' | 'analytics';
}> = {
  'revenue-chart': {
    title: 'Umsatzentwicklung',
    description: 'Monatlicher Umsatzverlauf',
    defaultSize: 'large',
    icon: 'TrendingUp',
    category: 'finance',
  },
  'expense-chart': {
    title: 'Ausgabenübersicht',
    description: 'Ausgaben nach Kategorie',
    defaultSize: 'medium',
    icon: 'PieChart',
    category: 'finance',
  },
  'profit-overview': {
    title: 'Gewinn/Verlust',
    description: 'Aktueller Gewinn oder Verlust',
    defaultSize: 'small',
    icon: 'Target',
    category: 'finance',
  },
  'cash-balance': {
    title: 'Kontostand',
    description: 'Aktueller Bankkontostand',
    defaultSize: 'small',
    icon: 'Wallet',
    category: 'finance',
  },
  'open-invoices': {
    title: 'Offene Rechnungen',
    description: 'Unbezahlte Ausgangsrechnungen',
    defaultSize: 'medium',
    icon: 'FileText',
    category: 'operations',
  },
  'recent-transactions': {
    title: 'Letzte Buchungen',
    description: 'Die neuesten Transaktionen',
    defaultSize: 'medium',
    icon: 'List',
    category: 'operations',
  },
  'budget-status': {
    title: 'Budget-Status',
    description: 'Aktueller Budgetverlauf',
    defaultSize: 'medium',
    icon: 'Target',
    category: 'analytics',
  },
  'upcoming-payments': {
    title: 'Anstehende Zahlungen',
    description: 'Fällige Rechnungen und Zahlungen',
    defaultSize: 'medium',
    icon: 'Calendar',
    category: 'operations',
  },
  'tax-overview': {
    title: 'Steuerübersicht',
    description: 'USt-Vorauszahlungen und -Erstattungen',
    defaultSize: 'small',
    icon: 'Receipt',
    category: 'finance',
  },
  'quick-stats': {
    title: 'Schnellübersicht',
    description: 'Wichtige Kennzahlen auf einen Blick',
    defaultSize: 'large',
    icon: 'BarChart3',
    category: 'analytics',
  },
  'customer-overview': {
    title: 'Kundenübersicht',
    description: 'Top-Kunden und Aktivität',
    defaultSize: 'medium',
    icon: 'Users',
    category: 'operations',
  },
  'cashflow-mini': {
    title: 'Cash-Flow Mini',
    description: 'Kompakte Liquiditätsübersicht',
    defaultSize: 'small',
    icon: 'ArrowUpDown',
    category: 'analytics',
  },
};

const DASHBOARD_STORAGE_KEY = 'fintutto_dashboard_layout';

export function useDashboardWidgets() {
  const { currentCompany } = useCompany();
  const [layout, setLayout] = useState<DashboardLayout>(getDefaultLayout());
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Load layout from localStorage
  useEffect(() => {
    if (!currentCompany) return;

    const stored = localStorage.getItem(`${DASHBOARD_STORAGE_KEY}_${currentCompany.id}`);
    if (stored) {
      try {
        setLayout(JSON.parse(stored));
      } catch {
        setLayout(getDefaultLayout());
      }
    } else {
      setLayout(getDefaultLayout());
    }
    setLoading(false);
  }, [currentCompany]);

  // Save layout
  const saveLayout = useCallback((newLayout: DashboardLayout) => {
    if (!currentCompany) return;
    localStorage.setItem(`${DASHBOARD_STORAGE_KEY}_${currentCompany.id}`, JSON.stringify(newLayout));
    setLayout(newLayout);
  }, [currentCompany]);

  // Add widget
  const addWidget = useCallback((type: WidgetType) => {
    const definition = WIDGET_DEFINITIONS[type];
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: definition.title,
      size: definition.defaultSize,
      position: layout.widgets.length,
      visible: true,
    };

    saveLayout({
      ...layout,
      widgets: [...layout.widgets, newWidget],
    });
  }, [layout, saveLayout]);

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    const filtered = layout.widgets.filter(w => w.id !== widgetId);
    // Re-order positions
    const reordered = filtered.map((w, i) => ({ ...w, position: i }));
    saveLayout({ ...layout, widgets: reordered });
  }, [layout, saveLayout]);

  // Update widget
  const updateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    const updated = layout.widgets.map(w =>
      w.id === widgetId ? { ...w, ...updates } : w
    );
    saveLayout({ ...layout, widgets: updated });
  }, [layout, saveLayout]);

  // Move widget
  const moveWidget = useCallback((widgetId: string, direction: 'up' | 'down') => {
    const index = layout.widgets.findIndex(w => w.id === widgetId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= layout.widgets.length) return;

    const newWidgets = [...layout.widgets];
    const [removed] = newWidgets.splice(index, 1);
    newWidgets.splice(newIndex, 0, removed);

    // Update positions
    const reordered = newWidgets.map((w, i) => ({ ...w, position: i }));
    saveLayout({ ...layout, widgets: reordered });
  }, [layout, saveLayout]);

  // Toggle widget visibility
  const toggleWidget = useCallback((widgetId: string) => {
    const updated = layout.widgets.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    saveLayout({ ...layout, widgets: updated });
  }, [layout, saveLayout]);

  // Update layout settings
  const updateLayoutSettings = useCallback((settings: Partial<DashboardLayout>) => {
    saveLayout({ ...layout, ...settings });
  }, [layout, saveLayout]);

  // Reset to default
  const resetToDefault = useCallback(() => {
    saveLayout(getDefaultLayout());
  }, [saveLayout]);

  // Get visible widgets sorted by position
  const visibleWidgets = layout.widgets
    .filter(w => w.visible)
    .sort((a, b) => a.position - b.position);

  // Get available widgets (not yet added)
  const availableWidgets = Object.keys(WIDGET_DEFINITIONS).filter(
    type => !layout.widgets.some(w => w.type === type)
  ) as WidgetType[];

  return {
    layout,
    visibleWidgets,
    availableWidgets,
    loading,
    editMode,
    setEditMode,
    addWidget,
    removeWidget,
    updateWidget,
    moveWidget,
    toggleWidget,
    updateLayoutSettings,
    resetToDefault,
  };
}

function getDefaultLayout(): DashboardLayout {
  return {
    widgets: [
      {
        id: 'widget-1',
        type: 'quick-stats',
        title: 'Schnellübersicht',
        size: 'large',
        position: 0,
        visible: true,
      },
      {
        id: 'widget-2',
        type: 'revenue-chart',
        title: 'Umsatzentwicklung',
        size: 'large',
        position: 1,
        visible: true,
      },
      {
        id: 'widget-3',
        type: 'open-invoices',
        title: 'Offene Rechnungen',
        size: 'medium',
        position: 2,
        visible: true,
      },
      {
        id: 'widget-4',
        type: 'cash-balance',
        title: 'Kontostand',
        size: 'small',
        position: 3,
        visible: true,
      },
      {
        id: 'widget-5',
        type: 'recent-transactions',
        title: 'Letzte Buchungen',
        size: 'medium',
        position: 4,
        visible: true,
      },
      {
        id: 'widget-6',
        type: 'upcoming-payments',
        title: 'Anstehende Zahlungen',
        size: 'medium',
        position: 5,
        visible: true,
      },
    ],
    columns: 3,
    theme: 'default',
  };
}

// Widget data generators (simulated)
export function useWidgetData(widgetType: WidgetType) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setData(generateWidgetData(widgetType));
      setLoading(false);
    }, 300 + Math.random() * 500);

    return () => clearTimeout(timer);
  }, [widgetType]);

  return { data, loading };
}

function generateWidgetData(type: WidgetType): any {
  const now = new Date();
  const currentMonth = now.getMonth();

  switch (type) {
    case 'quick-stats':
      return {
        revenue: 125000 + Math.floor(Math.random() * 25000),
        expenses: 85000 + Math.floor(Math.random() * 15000),
        profit: 40000 + Math.floor(Math.random() * 10000),
        invoiceCount: 45 + Math.floor(Math.random() * 20),
        customerCount: 32 + Math.floor(Math.random() * 10),
        openInvoicesAmount: 18500 + Math.floor(Math.random() * 5000),
      };

    case 'revenue-chart':
      return Array.from({ length: 12 }, (_, i) => ({
        month: new Date(now.getFullYear(), i, 1).toLocaleDateString('de-DE', { month: 'short' }),
        revenue: i <= currentMonth ? 8000 + Math.floor(Math.random() * 15000) : 0,
        target: 12000,
      }));

    case 'expense-chart':
      return [
        { name: 'Personal', value: 45000, color: '#ef4444' },
        { name: 'Miete', value: 15000, color: '#f97316' },
        { name: 'Material', value: 12000, color: '#eab308' },
        { name: 'Marketing', value: 8000, color: '#22c55e' },
        { name: 'Sonstiges', value: 5000, color: '#3b82f6' },
      ];

    case 'open-invoices':
      return [
        { id: '1', customer: 'Mustermann GmbH', amount: 4500, dueDate: '2026-02-15', status: 'due' },
        { id: '2', customer: 'Tech Solutions AG', amount: 8200, dueDate: '2026-02-20', status: 'pending' },
        { id: '3', customer: 'Handel & Co. KG', amount: 3100, dueDate: '2026-02-05', status: 'overdue' },
        { id: '4', customer: 'Beratung Plus', amount: 2800, dueDate: '2026-02-28', status: 'pending' },
      ];

    case 'cash-balance':
      return {
        total: 52340 + Math.floor(Math.random() * 10000),
        accounts: [
          { name: 'Geschäftskonto', balance: 45000 },
          { name: 'Sparkonto', balance: 7340 },
        ],
        change: 2.5 + Math.random() * 5,
      };

    case 'recent-transactions':
      return [
        { id: '1', description: 'Zahlung Mustermann GmbH', amount: 4500, date: '2026-02-07', type: 'income' },
        { id: '2', description: 'Büromiete Februar', amount: -2500, date: '2026-02-01', type: 'expense' },
        { id: '3', description: 'Softwarelizenzen', amount: -890, date: '2026-02-05', type: 'expense' },
        { id: '4', description: 'Beratungshonorar', amount: 3200, date: '2026-02-06', type: 'income' },
        { id: '5', description: 'Telefonkosten', amount: -125, date: '2026-02-04', type: 'expense' },
      ];

    case 'budget-status':
      return {
        used: 68500,
        total: 100000,
        categories: [
          { name: 'Personal', used: 75, color: '#ef4444' },
          { name: 'Marketing', used: 45, color: '#22c55e' },
          { name: 'IT', used: 82, color: '#f97316' },
        ],
      };

    case 'upcoming-payments':
      return [
        { id: '1', description: 'Gehälter März', amount: 15000, dueDate: '2026-02-28', type: 'salary' },
        { id: '2', description: 'Krankenkasse Q1', amount: 4500, dueDate: '2026-02-15', type: 'insurance' },
        { id: '3', description: 'USt-Vorauszahlung', amount: 3200, dueDate: '2026-02-10', type: 'tax' },
      ];

    case 'tax-overview':
      return {
        vatPayable: 8500,
        vatReceivable: 3200,
        netVat: 5300,
        nextDue: '2026-02-10',
      };

    case 'customer-overview':
      return {
        totalCustomers: 32,
        newThisMonth: 3,
        topCustomers: [
          { name: 'Mustermann GmbH', revenue: 45000 },
          { name: 'Tech Solutions AG', revenue: 38000 },
          { name: 'Handel & Co. KG', revenue: 22000 },
        ],
      };

    case 'cashflow-mini':
      return {
        inflow: 28000,
        outflow: 22000,
        net: 6000,
        trend: 'up',
      };

    case 'profit-overview':
      return {
        profit: 42500,
        margin: 28.5,
        vsLastMonth: 5.2,
      };

    default:
      return null;
  }
}
