import { useState, useCallback, useEffect } from 'react';

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  managerName?: string;
  budget?: number;
  budgetPeriod?: 'monthly' | 'quarterly' | 'yearly';
  actualCost: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CostCenterAllocation {
  id: string;
  costCenterId: string;
  costCenterName: string;
  bookingId?: string;
  invoiceId?: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  createdAt: string;
}

export interface CostCenterReport {
  costCenterId: string;
  costCenterName: string;
  budget: number;
  actualCost: number;
  variance: number;
  variancePercent: number;
  allocations: number;
  children: CostCenterReport[];
}

const STORAGE_KEY = 'fintutto_cost_centers';

const DEFAULT_COST_CENTERS: CostCenter[] = [
  {
    id: 'cc-1',
    code: '100',
    name: 'Verwaltung',
    description: 'Allgemeine Verwaltungskosten',
    budget: 50000,
    budgetPeriod: 'yearly',
    actualCost: 0,
    isActive: true,
    tags: ['overhead'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cc-2',
    code: '200',
    name: 'Vertrieb',
    description: 'Vertrieb und Marketing',
    budget: 100000,
    budgetPeriod: 'yearly',
    actualCost: 0,
    isActive: true,
    tags: ['umsatz'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cc-3',
    code: '300',
    name: 'Produktion',
    description: 'Produktionskosten',
    budget: 200000,
    budgetPeriod: 'yearly',
    actualCost: 0,
    isActive: true,
    tags: ['fertigung'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cc-4',
    code: '110',
    name: 'IT',
    description: 'IT-Abteilung',
    parentId: 'cc-1',
    budget: 30000,
    budgetPeriod: 'yearly',
    actualCost: 0,
    isActive: true,
    tags: ['technik'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cc-5',
    code: '120',
    name: 'Personal',
    description: 'Personalabteilung',
    parentId: 'cc-1',
    budget: 20000,
    budgetPeriod: 'yearly',
    actualCost: 0,
    isActive: true,
    tags: ['hr'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useCostCenters() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [allocations, setAllocations] = useState<CostCenterAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setCostCenters(data.costCenters || DEFAULT_COST_CENTERS);
        setAllocations(data.allocations || []);
      } catch {
        setCostCenters(DEFAULT_COST_CENTERS);
      }
    } else {
      setCostCenters(DEFAULT_COST_CENTERS);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((newCostCenters?: CostCenter[], newAllocations?: CostCenterAllocation[]) => {
    const cc = newCostCenters || costCenters;
    const alloc = newAllocations || allocations;
    if (newCostCenters) setCostCenters(newCostCenters);
    if (newAllocations) setAllocations(newAllocations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ costCenters: cc, allocations: alloc }));
  }, [costCenters, allocations]);

  // Create cost center
  const createCostCenter = useCallback((cc: Omit<CostCenter, 'id' | 'actualCost' | 'createdAt' | 'updatedAt'>) => {
    const newCC: CostCenter = {
      ...cc,
      id: `cc-${Date.now()}`,
      actualCost: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveData([...costCenters, newCC]);
    return newCC;
  }, [costCenters, saveData]);

  // Update cost center
  const updateCostCenter = useCallback((id: string, updates: Partial<CostCenter>) => {
    saveData(costCenters.map(cc =>
      cc.id === id ? { ...cc, ...updates, updatedAt: new Date().toISOString() } : cc
    ));
  }, [costCenters, saveData]);

  // Delete cost center
  const deleteCostCenter = useCallback((id: string) => {
    // Also delete child cost centers
    const childIds = costCenters.filter(cc => cc.parentId === id).map(cc => cc.id);
    saveData(
      costCenters.filter(cc => cc.id !== id && !childIds.includes(cc.id)),
      allocations.filter(a => a.costCenterId !== id && !childIds.includes(a.costCenterId))
    );
  }, [costCenters, allocations, saveData]);

  // Allocate cost
  const allocateCost = useCallback((allocation: Omit<CostCenterAllocation, 'id' | 'createdAt'>) => {
    const cc = costCenters.find(c => c.id === allocation.costCenterId);
    if (!cc) return null;

    const newAllocation: CostCenterAllocation = {
      ...allocation,
      costCenterName: cc.name,
      id: `alloc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Update actual cost
    const updatedCostCenters = costCenters.map(c =>
      c.id === allocation.costCenterId
        ? { ...c, actualCost: c.actualCost + allocation.amount, updatedAt: new Date().toISOString() }
        : c
    );

    saveData(updatedCostCenters, [...allocations, newAllocation]);
    return newAllocation;
  }, [costCenters, allocations, saveData]);

  // Remove allocation
  const removeAllocation = useCallback((id: string) => {
    const allocation = allocations.find(a => a.id === id);
    if (!allocation) return;

    const updatedCostCenters = costCenters.map(cc =>
      cc.id === allocation.costCenterId
        ? { ...cc, actualCost: cc.actualCost - allocation.amount, updatedAt: new Date().toISOString() }
        : cc
    );

    saveData(updatedCostCenters, allocations.filter(a => a.id !== id));
  }, [costCenters, allocations, saveData]);

  // Get hierarchy (tree structure)
  const getHierarchy = useCallback((): CostCenter[] => {
    const rootCenters = costCenters.filter(cc => !cc.parentId);
    return rootCenters;
  }, [costCenters]);

  // Get children
  const getChildren = useCallback((parentId: string): CostCenter[] => {
    return costCenters.filter(cc => cc.parentId === parentId);
  }, [costCenters]);

  // Get parent
  const getParent = useCallback((id: string): CostCenter | undefined => {
    const cc = costCenters.find(c => c.id === id);
    if (!cc?.parentId) return undefined;
    return costCenters.find(c => c.id === cc.parentId);
  }, [costCenters]);

  // Get allocations for cost center
  const getAllocations = useCallback((costCenterId: string): CostCenterAllocation[] => {
    return allocations.filter(a => a.costCenterId === costCenterId);
  }, [allocations]);

  // Get budget status
  const getBudgetStatus = useCallback((id: string): { budget: number; actual: number; remaining: number; percentage: number } => {
    const cc = costCenters.find(c => c.id === id);
    if (!cc) return { budget: 0, actual: 0, remaining: 0, percentage: 0 };

    // Include children's actual costs
    const childrenActual = costCenters
      .filter(c => c.parentId === id)
      .reduce((sum, c) => sum + c.actualCost, 0);

    const totalActual = cc.actualCost + childrenActual;
    const budget = cc.budget || 0;
    const remaining = budget - totalActual;
    const percentage = budget > 0 ? (totalActual / budget) * 100 : 0;

    return { budget, actual: totalActual, remaining, percentage };
  }, [costCenters]);

  // Generate report
  const generateReport = useCallback((period?: { start: string; end: string }): CostCenterReport[] => {
    const buildReport = (cc: CostCenter): CostCenterReport => {
      const children = getChildren(cc.id).map(child => buildReport(child));
      const childrenActual = children.reduce((sum, c) => sum + c.actualCost, 0);
      const totalActual = cc.actualCost + childrenActual;
      const budget = cc.budget || 0;
      const variance = budget - totalActual;
      const variancePercent = budget > 0 ? (variance / budget) * 100 : 0;

      let allocationCount = allocations.filter(a => a.costCenterId === cc.id).length;
      if (period) {
        allocationCount = allocations.filter(a =>
          a.costCenterId === cc.id &&
          a.date >= period.start &&
          a.date <= period.end
        ).length;
      }

      return {
        costCenterId: cc.id,
        costCenterName: cc.name,
        budget,
        actualCost: totalActual,
        variance,
        variancePercent,
        allocations: allocationCount,
        children,
      };
    };

    return getHierarchy().map(cc => buildReport(cc));
  }, [costCenters, allocations, getChildren, getHierarchy]);

  // Search cost centers
  const searchCostCenters = useCallback((query: string): CostCenter[] => {
    const q = query.toLowerCase();
    return costCenters.filter(cc =>
      cc.code.toLowerCase().includes(q) ||
      cc.name.toLowerCase().includes(q) ||
      cc.description?.toLowerCase().includes(q) ||
      cc.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [costCenters]);

  // Get statistics
  const getStats = useCallback(() => {
    const active = costCenters.filter(cc => cc.isActive);
    const totalBudget = active.reduce((sum, cc) => sum + (cc.budget || 0), 0);
    const totalActual = active.reduce((sum, cc) => sum + cc.actualCost, 0);
    const overBudget = active.filter(cc => cc.budget && cc.actualCost > cc.budget);

    return {
      total: costCenters.length,
      active: active.length,
      totalBudget,
      totalActual,
      totalRemaining: totalBudget - totalActual,
      overBudgetCount: overBudget.length,
      totalAllocations: allocations.length,
    };
  }, [costCenters, allocations]);

  // Export
  const exportData = useCallback((format: 'json' | 'csv' = 'json') => {
    if (format === 'csv') {
      const headers = ['Code', 'Name', 'Beschreibung', 'Budget', 'Ist-Kosten', 'Status'];
      const rows = costCenters.map(cc => [
        cc.code,
        cc.name,
        cc.description || '',
        (cc.budget || 0).toFixed(2),
        cc.actualCost.toFixed(2),
        cc.isActive ? 'Aktiv' : 'Inaktiv',
      ]);
      const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kostenstellen_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = JSON.stringify({ costCenters, allocations }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kostenstellen_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [costCenters, allocations]);

  return {
    costCenters,
    allocations,
    isLoading,
    createCostCenter,
    updateCostCenter,
    deleteCostCenter,
    allocateCost,
    removeAllocation,
    getHierarchy,
    getChildren,
    getParent,
    getAllocations,
    getBudgetStatus,
    generateReport,
    searchCostCenters,
    getStats,
    exportData,
  };
}
