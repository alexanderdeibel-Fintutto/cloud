import { useState, useCallback, useEffect } from 'react';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectType = 'internal' | 'client' | 'investment' | 'rd';

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  clientId?: string;
  clientName?: string;
  managerId?: string;
  managerName?: string;
  startDate: string;
  endDate?: string;
  budget: number;
  hourlyRate?: number;
  billingType: 'fixed' | 'hourly' | 'milestone';
  costCenterId?: string;
  actualCost: number;
  actualRevenue: number;
  invoicedAmount: number;
  hoursWorked: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTransaction {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  type: 'expense' | 'revenue' | 'invoice' | 'time';
  category: string;
  description: string;
  amount: number;
  hours?: number;
  invoiceId?: string;
  bookingId?: string;
  createdAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate: string;
  amount?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'invoiced';
  completedAt?: string;
  invoiceId?: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  userId?: string;
  userName: string;
  date: string;
  hours: number;
  description: string;
  isBillable: boolean;
  hourlyRate?: number;
  amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'invoiced';
  createdAt: string;
}

const STORAGE_KEY = 'fintutto_project_accounting';

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    code: 'P2024-001',
    name: 'Website Redesign',
    description: 'Komplettes Redesign der Firmenwebsite',
    type: 'client',
    status: 'active',
    clientName: 'Musterfirma GmbH',
    managerName: 'Max Mustermann',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    budget: 25000,
    hourlyRate: 120,
    billingType: 'hourly',
    actualCost: 8500,
    actualRevenue: 12000,
    invoicedAmount: 10000,
    hoursWorked: 85,
    tags: ['webentwicklung', 'design'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    code: 'P2024-002',
    name: 'ERP-Integration',
    description: 'Integration des neuen ERP-Systems',
    type: 'internal',
    status: 'active',
    managerName: 'Anna Schmidt',
    startDate: '2024-02-01',
    budget: 50000,
    billingType: 'fixed',
    actualCost: 15000,
    actualRevenue: 0,
    invoicedAmount: 0,
    hoursWorked: 120,
    tags: ['erp', 'integration'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'internal', label: 'Intern' },
  { value: 'client', label: 'Kundenprojekt' },
  { value: 'investment', label: 'Investition' },
  { value: 'rd', label: 'Forschung & Entwicklung' },
];

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planung' },
  { value: 'active', label: 'Aktiv' },
  { value: 'on_hold', label: 'Pausiert' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'cancelled', label: 'Abgebrochen' },
];

export const EXPENSE_CATEGORIES = [
  'Personal',
  'Material',
  'Software',
  'Hardware',
  'Reisekosten',
  'Freelancer',
  'Beratung',
  'Sonstige',
];

export function useProjectAccounting() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<ProjectTransaction[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setProjects(data.projects || DEFAULT_PROJECTS);
        setTransactions(data.transactions || []);
        setMilestones(data.milestones || []);
        setTimeEntries(data.timeEntries || []);
      } catch {
        setProjects(DEFAULT_PROJECTS);
      }
    } else {
      setProjects(DEFAULT_PROJECTS);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((
    newProjects?: Project[],
    newTransactions?: ProjectTransaction[],
    newMilestones?: ProjectMilestone[],
    newTimeEntries?: TimeEntry[]
  ) => {
    const data = {
      projects: newProjects || projects,
      transactions: newTransactions || transactions,
      milestones: newMilestones || milestones,
      timeEntries: newTimeEntries || timeEntries,
    };
    if (newProjects) setProjects(newProjects);
    if (newTransactions) setTransactions(newTransactions);
    if (newMilestones) setMilestones(newMilestones);
    if (newTimeEntries) setTimeEntries(newTimeEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [projects, transactions, milestones, timeEntries]);

  // Create project
  const createProject = useCallback((project: Omit<Project, 'id' | 'actualCost' | 'actualRevenue' | 'invoicedAmount' | 'hoursWorked' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      actualCost: 0,
      actualRevenue: 0,
      invoicedAmount: 0,
      hoursWorked: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveData([...projects, newProject]);
    return newProject;
  }, [projects, saveData]);

  // Update project
  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    saveData(projects.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  }, [projects, saveData]);

  // Delete project
  const deleteProject = useCallback((id: string) => {
    saveData(
      projects.filter(p => p.id !== id),
      transactions.filter(t => t.projectId !== id),
      milestones.filter(m => m.projectId !== id),
      timeEntries.filter(e => e.projectId !== id)
    );
  }, [projects, transactions, milestones, timeEntries, saveData]);

  // Add transaction
  const addTransaction = useCallback((tx: Omit<ProjectTransaction, 'id' | 'projectName' | 'createdAt'>) => {
    const project = projects.find(p => p.id === tx.projectId);
    if (!project) return null;

    const newTx: ProjectTransaction = {
      ...tx,
      id: `ptx-${Date.now()}`,
      projectName: project.name,
      createdAt: new Date().toISOString(),
    };

    // Update project totals
    const updates: Partial<Project> = {};
    if (tx.type === 'expense') {
      updates.actualCost = project.actualCost + tx.amount;
    } else if (tx.type === 'revenue') {
      updates.actualRevenue = project.actualRevenue + tx.amount;
    } else if (tx.type === 'invoice') {
      updates.invoicedAmount = project.invoicedAmount + tx.amount;
    }

    const updatedProjects = projects.map(p =>
      p.id === tx.projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );

    saveData(updatedProjects, [...transactions, newTx]);
    return newTx;
  }, [projects, transactions, saveData]);

  // Add time entry
  const addTimeEntry = useCallback((entry: Omit<TimeEntry, 'id' | 'projectName' | 'amount' | 'createdAt'>) => {
    const project = projects.find(p => p.id === entry.projectId);
    if (!project) return null;

    const hourlyRate = entry.hourlyRate || project.hourlyRate || 0;
    const amount = entry.isBillable ? entry.hours * hourlyRate : 0;

    const newEntry: TimeEntry = {
      ...entry,
      id: `time-${Date.now()}`,
      projectName: project.name,
      hourlyRate,
      amount,
      createdAt: new Date().toISOString(),
    };

    // Update project hours
    const updatedProjects = projects.map(p =>
      p.id === entry.projectId
        ? { ...p, hoursWorked: p.hoursWorked + entry.hours, updatedAt: new Date().toISOString() }
        : p
    );

    saveData(updatedProjects, undefined, undefined, [...timeEntries, newEntry]);
    return newEntry;
  }, [projects, timeEntries, saveData]);

  // Add milestone
  const addMilestone = useCallback((milestone: Omit<ProjectMilestone, 'id'>) => {
    const newMilestone: ProjectMilestone = {
      ...milestone,
      id: `ms-${Date.now()}`,
    };
    saveData(undefined, undefined, [...milestones, newMilestone]);
    return newMilestone;
  }, [milestones, saveData]);

  // Complete milestone
  const completeMilestone = useCallback((id: string) => {
    saveData(undefined, undefined, milestones.map(m =>
      m.id === id ? { ...m, status: 'completed' as const, completedAt: new Date().toISOString() } : m
    ));
  }, [milestones, saveData]);

  // Get project summary
  const getProjectSummary = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    const projectTxs = transactions.filter(t => t.projectId === projectId);
    const projectTime = timeEntries.filter(e => e.projectId === projectId);
    const projectMilestones = milestones.filter(m => m.projectId === projectId);

    const budgetRemaining = project.budget - project.actualCost;
    const budgetUsedPercent = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;
    const profitMargin = project.actualRevenue > 0
      ? ((project.actualRevenue - project.actualCost) / project.actualRevenue) * 100
      : 0;

    const billableHours = projectTime.filter(e => e.isBillable).reduce((sum, e) => sum + e.hours, 0);
    const nonBillableHours = projectTime.filter(e => !e.isBillable).reduce((sum, e) => sum + e.hours, 0);
    const billableAmount = projectTime.filter(e => e.isBillable).reduce((sum, e) => sum + e.amount, 0);
    const unbilledAmount = billableAmount - project.invoicedAmount;

    return {
      project,
      transactions: projectTxs,
      timeEntries: projectTime,
      milestones: projectMilestones,
      budgetRemaining,
      budgetUsedPercent: Math.round(budgetUsedPercent * 10) / 10,
      profitMargin: Math.round(profitMargin * 10) / 10,
      billableHours,
      nonBillableHours,
      billableAmount,
      unbilledAmount,
      completedMilestones: projectMilestones.filter(m => m.status === 'completed' || m.status === 'invoiced').length,
      totalMilestones: projectMilestones.length,
    };
  }, [projects, transactions, timeEntries, milestones]);

  // Get all projects summary
  const getOverallSummary = useCallback(() => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const totalBudget = activeProjects.reduce((sum, p) => sum + p.budget, 0);
    const totalCost = activeProjects.reduce((sum, p) => sum + p.actualCost, 0);
    const totalRevenue = activeProjects.reduce((sum, p) => sum + p.actualRevenue, 0);
    const totalInvoiced = activeProjects.reduce((sum, p) => sum + p.invoicedAmount, 0);
    const totalHours = activeProjects.reduce((sum, p) => sum + p.hoursWorked, 0);

    const overBudgetProjects = activeProjects.filter(p => p.actualCost > p.budget);
    const profitableProjects = activeProjects.filter(p => p.actualRevenue > p.actualCost);

    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalBudget,
      totalCost,
      totalRevenue,
      totalProfit: totalRevenue - totalCost,
      totalInvoiced,
      totalUnbilled: totalRevenue - totalInvoiced,
      totalHours,
      overBudgetCount: overBudgetProjects.length,
      profitableCount: profitableProjects.length,
    };
  }, [projects]);

  // Search projects
  const searchProjects = useCallback((query: string): Project[] => {
    const q = query.toLowerCase();
    return projects.filter(p =>
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.clientName?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [projects]);

  // Get projects by status
  const getByStatus = useCallback((status: ProjectStatus): Project[] => {
    return projects.filter(p => p.status === status);
  }, [projects]);

  // Export projects
  const exportProjects = useCallback((format: 'json' | 'csv' = 'csv') => {
    if (format === 'csv') {
      const headers = ['Code', 'Name', 'Typ', 'Status', 'Budget', 'Ist-Kosten', 'Erlöse', 'Stunden'];
      const rows = projects.map(p => [
        p.code,
        p.name,
        PROJECT_TYPES.find(t => t.value === p.type)?.label || p.type,
        PROJECT_STATUSES.find(s => s.value === p.status)?.label || p.status,
        p.budget.toFixed(2),
        p.actualCost.toFixed(2),
        p.actualRevenue.toFixed(2),
        p.hoursWorked.toFixed(1),
      ]);
      const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projekte_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = JSON.stringify({ projects, transactions, milestones, timeEntries }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projekte_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [projects, transactions, milestones, timeEntries]);

  return {
    projects,
    transactions,
    milestones,
    timeEntries,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    addTransaction,
    addTimeEntry,
    addMilestone,
    completeMilestone,
    getProjectSummary,
    getOverallSummary,
    searchProjects,
    getByStatus,
    exportProjects,
  };
}
