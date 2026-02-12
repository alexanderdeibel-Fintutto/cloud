import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly';
export type BudgetCategory =
  | 'revenue' | 'personnel' | 'rent' | 'utilities' | 'marketing'
  | 'materials' | 'services' | 'travel' | 'office' | 'it'
  | 'insurance' | 'taxes' | 'other';

export interface Budget {
  id: string;
  company_id: string;
  name: string;
  year: number;
  period: BudgetPeriod;
  categories: BudgetCategoryItem[];
  status: 'draft' | 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface BudgetCategoryItem {
  category: BudgetCategory;
  type: 'income' | 'expense';
  planned: number[];  // Array of amounts per period (12 for monthly, 4 for quarterly, 1 for yearly)
  actual: number[];   // Actual amounts
  notes?: string;
}

export interface BudgetComparison {
  category: BudgetCategory;
  categoryLabel: string;
  type: 'income' | 'expense';
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: 'under' | 'on-track' | 'over';
}

export interface BudgetSummary {
  totalPlannedIncome: number;
  totalActualIncome: number;
  totalPlannedExpenses: number;
  totalActualExpenses: number;
  plannedProfit: number;
  actualProfit: number;
  overBudgetCategories: number;
  underBudgetCategories: number;
}

const BUDGETS_STORAGE_KEY = 'fintutto_budgets';

export const CATEGORY_CONFIG: Record<BudgetCategory, { label: string; type: 'income' | 'expense'; color: string }> = {
  revenue: { label: 'Umsatzerlöse', type: 'income', color: '#22c55e' },
  personnel: { label: 'Personalkosten', type: 'expense', color: '#ef4444' },
  rent: { label: 'Miete & Nebenkosten', type: 'expense', color: '#f97316' },
  utilities: { label: 'Strom, Wasser, Gas', type: 'expense', color: '#fb923c' },
  marketing: { label: 'Marketing & Werbung', type: 'expense', color: '#a855f7' },
  materials: { label: 'Material & Waren', type: 'expense', color: '#f59e0b' },
  services: { label: 'Fremdleistungen', type: 'expense', color: '#eab308' },
  travel: { label: 'Reisekosten', type: 'expense', color: '#06b6d4' },
  office: { label: 'Bürobedarf', type: 'expense', color: '#8b5cf6' },
  it: { label: 'IT & Software', type: 'expense', color: '#3b82f6' },
  insurance: { label: 'Versicherungen', type: 'expense', color: '#64748b' },
  taxes: { label: 'Steuern & Abgaben', type: 'expense', color: '#dc2626' },
  other: { label: 'Sonstiges', type: 'expense', color: '#78716c' },
};

export function useBudgeting() {
  const { currentCompany } = useCompany();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Load budgets from localStorage
  useEffect(() => {
    if (!currentCompany) return;

    const stored = localStorage.getItem(`${BUDGETS_STORAGE_KEY}_${currentCompany.id}`);

    if (stored) {
      try { setBudgets(JSON.parse(stored)); } catch { setBudgets([]); }
    } else {
      // Create demo budget
      setBudgets([createDemoBudget(currentCompany.id)]);
    }

    setLoading(false);
  }, [currentCompany]);

  // Save budgets
  const saveBudgets = useCallback((list: Budget[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${BUDGETS_STORAGE_KEY}_${currentCompany.id}`, JSON.stringify(list));
    setBudgets(list);
  }, [currentCompany]);

  // Create new budget
  const createBudget = useCallback((data: {
    name: string;
    year: number;
    period: BudgetPeriod;
    copyFrom?: string;
  }) => {
    if (!currentCompany) return null;

    const periodsCount = data.period === 'monthly' ? 12 : data.period === 'quarterly' ? 4 : 1;

    let categories: BudgetCategoryItem[] = [];

    if (data.copyFrom) {
      const sourceBudget = budgets.find(b => b.id === data.copyFrom);
      if (sourceBudget) {
        categories = sourceBudget.categories.map(cat => ({
          ...cat,
          actual: new Array(periodsCount).fill(0),
          planned: cat.planned.slice(0, periodsCount),
        }));
      }
    }

    if (categories.length === 0) {
      categories = Object.entries(CATEGORY_CONFIG).map(([category, config]) => ({
        category: category as BudgetCategory,
        type: config.type,
        planned: new Array(periodsCount).fill(0),
        actual: new Array(periodsCount).fill(0),
      }));
    }

    const newBudget: Budget = {
      id: `budget-${Date.now()}`,
      company_id: currentCompany.id,
      name: data.name,
      year: data.year,
      period: data.period,
      categories,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveBudgets([newBudget, ...budgets]);
    return newBudget;
  }, [currentCompany, budgets, saveBudgets]);

  // Update budget
  const updateBudget = useCallback((budgetId: string, data: Partial<Budget>) => {
    const updated = budgets.map(b =>
      b.id === budgetId
        ? { ...b, ...data, updated_at: new Date().toISOString() }
        : b
    );
    saveBudgets(updated);
  }, [budgets, saveBudgets]);

  // Update category amount
  const updateCategoryAmount = useCallback((
    budgetId: string,
    category: BudgetCategory,
    periodIndex: number,
    field: 'planned' | 'actual',
    value: number
  ) => {
    const updated = budgets.map(b => {
      if (b.id !== budgetId) return b;

      const updatedCategories = b.categories.map(cat => {
        if (cat.category !== category) return cat;

        const newValues = [...cat[field]];
        newValues[periodIndex] = value;
        return { ...cat, [field]: newValues };
      });

      return { ...b, categories: updatedCategories, updated_at: new Date().toISOString() };
    });
    saveBudgets(updated);
  }, [budgets, saveBudgets]);

  // Delete budget
  const deleteBudget = useCallback((budgetId: string) => {
    const filtered = budgets.filter(b => b.id !== budgetId);
    saveBudgets(filtered);
  }, [budgets, saveBudgets]);

  // Activate budget
  const activateBudget = useCallback((budgetId: string) => {
    const updated = budgets.map(b =>
      b.id === budgetId
        ? { ...b, status: 'active' as const, updated_at: new Date().toISOString() }
        : b
    );
    saveBudgets(updated);
  }, [budgets, saveBudgets]);

  // Get budget comparison
  const getBudgetComparison = useCallback((budgetId: string, periodIndex?: number): BudgetComparison[] => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return [];

    return budget.categories.map(cat => {
      const config = CATEGORY_CONFIG[cat.category];

      let planned: number;
      let actual: number;

      if (periodIndex !== undefined) {
        planned = cat.planned[periodIndex] || 0;
        actual = cat.actual[periodIndex] || 0;
      } else {
        planned = cat.planned.reduce((sum, v) => sum + v, 0);
        actual = cat.actual.reduce((sum, v) => sum + v, 0);
      }

      const variance = actual - planned;
      const variancePercent = planned !== 0 ? (variance / planned) * 100 : 0;

      let status: 'under' | 'on-track' | 'over';
      if (cat.type === 'expense') {
        status = variancePercent > 10 ? 'over' : variancePercent < -10 ? 'under' : 'on-track';
      } else {
        status = variancePercent < -10 ? 'under' : variancePercent > 10 ? 'over' : 'on-track';
      }

      return {
        category: cat.category,
        categoryLabel: config.label,
        type: cat.type,
        planned,
        actual,
        variance,
        variancePercent,
        status,
      };
    });
  }, [budgets]);

  // Get budget summary
  const getBudgetSummary = useCallback((budgetId: string): BudgetSummary => {
    const comparisons = getBudgetComparison(budgetId);

    const incomeItems = comparisons.filter(c => c.type === 'income');
    const expenseItems = comparisons.filter(c => c.type === 'expense');

    const totalPlannedIncome = incomeItems.reduce((sum, c) => sum + c.planned, 0);
    const totalActualIncome = incomeItems.reduce((sum, c) => sum + c.actual, 0);
    const totalPlannedExpenses = expenseItems.reduce((sum, c) => sum + c.planned, 0);
    const totalActualExpenses = expenseItems.reduce((sum, c) => sum + c.actual, 0);

    const overBudget = expenseItems.filter(c => c.status === 'over').length +
      incomeItems.filter(c => c.status === 'under').length;
    const underBudget = expenseItems.filter(c => c.status === 'under').length +
      incomeItems.filter(c => c.status === 'over').length;

    return {
      totalPlannedIncome,
      totalActualIncome,
      totalPlannedExpenses,
      totalActualExpenses,
      plannedProfit: totalPlannedIncome - totalPlannedExpenses,
      actualProfit: totalActualIncome - totalActualExpenses,
      overBudgetCategories: overBudget,
      underBudgetCategories: underBudget,
    };
  }, [getBudgetComparison]);

  // Get period labels
  const getPeriodLabels = useCallback((period: BudgetPeriod) => {
    if (period === 'monthly') {
      return ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    } else if (period === 'quarterly') {
      return ['Q1', 'Q2', 'Q3', 'Q4'];
    } else {
      return ['Gesamt'];
    }
  }, []);

  // Get current period index
  const getCurrentPeriodIndex = useCallback((period: BudgetPeriod) => {
    const now = new Date();
    const month = now.getMonth();

    if (period === 'monthly') {
      return month;
    } else if (period === 'quarterly') {
      return Math.floor(month / 3);
    } else {
      return 0;
    }
  }, []);

  // Get active budget for current year
  const getActiveBudget = useCallback(() => {
    const currentYear = new Date().getFullYear();
    return budgets.find(b => b.year === currentYear && b.status === 'active');
  }, [budgets]);

  // Get budget progress (percentage of year elapsed)
  const getBudgetProgress = useCallback((budget: Budget) => {
    const now = new Date();
    if (budget.year !== now.getFullYear()) {
      return budget.year < now.getFullYear() ? 100 : 0;
    }

    const startOfYear = new Date(budget.year, 0, 1);
    const endOfYear = new Date(budget.year + 1, 0, 1);
    const elapsed = now.getTime() - startOfYear.getTime();
    const total = endOfYear.getTime() - startOfYear.getTime();

    return Math.round((elapsed / total) * 100);
  }, []);

  return {
    budgets,
    loading,
    createBudget,
    updateBudget,
    updateCategoryAmount,
    deleteBudget,
    activateBudget,
    getBudgetComparison,
    getBudgetSummary,
    getPeriodLabels,
    getCurrentPeriodIndex,
    getActiveBudget,
    getBudgetProgress,
  };
}

function createDemoBudget(companyId: string): Budget {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const categories: BudgetCategoryItem[] = [
    {
      category: 'revenue',
      type: 'income',
      planned: [25000, 26000, 27000, 28000, 25000, 22000, 20000, 22000, 28000, 30000, 32000, 35000],
      actual: generateActualValues([25000, 26000, 27000, 28000, 25000, 22000, 20000, 22000, 28000, 30000, 32000, 35000], currentMonth),
    },
    {
      category: 'personnel',
      type: 'expense',
      planned: Array(12).fill(15000),
      actual: generateActualValues(Array(12).fill(15000), currentMonth, 0.02),
    },
    {
      category: 'rent',
      type: 'expense',
      planned: Array(12).fill(2500),
      actual: generateActualValues(Array(12).fill(2500), currentMonth),
    },
    {
      category: 'utilities',
      type: 'expense',
      planned: [400, 380, 350, 320, 300, 280, 260, 280, 320, 360, 400, 450],
      actual: generateActualValues([400, 380, 350, 320, 300, 280, 260, 280, 320, 360, 400, 450], currentMonth, 0.1),
    },
    {
      category: 'marketing',
      type: 'expense',
      planned: [1500, 1500, 2000, 1500, 1500, 1000, 1000, 1500, 2000, 2500, 3000, 3000],
      actual: generateActualValues([1500, 1500, 2000, 1500, 1500, 1000, 1000, 1500, 2000, 2500, 3000, 3000], currentMonth, 0.15),
    },
    {
      category: 'materials',
      type: 'expense',
      planned: Array(12).fill(800),
      actual: generateActualValues(Array(12).fill(800), currentMonth, 0.2),
    },
    {
      category: 'services',
      type: 'expense',
      planned: Array(12).fill(500),
      actual: generateActualValues(Array(12).fill(500), currentMonth, 0.1),
    },
    {
      category: 'travel',
      type: 'expense',
      planned: [200, 300, 400, 500, 300, 200, 100, 200, 400, 500, 400, 300],
      actual: generateActualValues([200, 300, 400, 500, 300, 200, 100, 200, 400, 500, 400, 300], currentMonth, 0.25),
    },
    {
      category: 'office',
      type: 'expense',
      planned: Array(12).fill(150),
      actual: generateActualValues(Array(12).fill(150), currentMonth, 0.1),
    },
    {
      category: 'it',
      type: 'expense',
      planned: Array(12).fill(300),
      actual: generateActualValues(Array(12).fill(300), currentMonth, 0.05),
    },
    {
      category: 'insurance',
      type: 'expense',
      planned: Array(12).fill(250),
      actual: generateActualValues(Array(12).fill(250), currentMonth),
    },
    {
      category: 'taxes',
      type: 'expense',
      planned: [0, 0, 2000, 0, 0, 2000, 0, 0, 2000, 0, 0, 2000],
      actual: generateActualValues([0, 0, 2000, 0, 0, 2000, 0, 0, 2000, 0, 0, 2000], currentMonth),
    },
    {
      category: 'other',
      type: 'expense',
      planned: Array(12).fill(200),
      actual: generateActualValues(Array(12).fill(200), currentMonth, 0.3),
    },
  ];

  return {
    id: 'budget-demo',
    company_id: companyId,
    name: `Budget ${currentYear}`,
    year: currentYear,
    period: 'monthly',
    categories,
    status: 'active',
    created_at: new Date(currentYear, 0, 1).toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function generateActualValues(planned: number[], upToMonth: number, variance: number = 0.05): number[] {
  return planned.map((value, index) => {
    if (index > upToMonth) return 0;
    const randomVariance = 1 + (Math.random() - 0.5) * 2 * variance;
    return Math.round(value * randomVariance);
  });
}
