import { useState, useMemo } from 'react';
import { EnergyContract, EnergyContractWithReminders, ContractReminder, ContractStatus, ProviderType } from '@/types/database';

// Local storage based contract management (no additional Supabase tables needed)
const STORAGE_KEY = 'fintutto_energy_contracts';
const REMINDERS_KEY = 'fintutto_contract_reminders';

function loadContracts(): EnergyContract[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveContracts(contracts: EnergyContract[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
}

function loadReminders(): ContractReminder[] {
  try {
    const data = localStorage.getItem(REMINDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveReminders(reminders: ContractReminder[]) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

function calculateDeadline(contract: EnergyContract): string | null {
  if (!contract.contract_end) return null;
  const end = new Date(contract.contract_end);
  end.setDate(end.getDate() - (contract.cancellation_period_days || 30));
  return end.toISOString().split('T')[0];
}

function calculateUrgency(daysUntilDeadline: number | null): 'ok' | 'warning' | 'critical' {
  if (daysUntilDeadline === null) return 'ok';
  if (daysUntilDeadline <= 14) return 'critical';
  if (daysUntilDeadline <= 90) return 'warning';
  return 'ok';
}

export function useEnergyContracts(organizationId?: string | null) {
  const [contracts, setContractsState] = useState<EnergyContract[]>(loadContracts);
  const [reminders, setRemindersState] = useState<ContractReminder[]>(loadReminders);

  const setContracts = (c: EnergyContract[]) => {
    setContractsState(c);
    saveContracts(c);
  };

  const setReminders = (r: ContractReminder[]) => {
    setRemindersState(r);
    saveReminders(r);
  };

  const contractsWithReminders: EnergyContractWithReminders[] = useMemo(() => {
    const now = new Date();
    return contracts
      .filter(c => !organizationId || c.organization_id === organizationId)
      .map(contract => {
        const deadline = calculateDeadline(contract);
        const daysUntilDeadline = deadline
          ? Math.ceil((new Date(deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;
        const contractReminders = reminders.filter(r => r.contract_id === contract.id);
        return {
          ...contract,
          cancellation_deadline: deadline,
          reminders: contractReminders,
          daysUntilDeadline,
          urgency: calculateUrgency(daysUntilDeadline),
        };
      })
      .sort((a, b) => {
        const urgencyOrder = { critical: 0, warning: 1, ok: 2 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });
  }, [contracts, reminders, organizationId]);

  const createContract = (data: Omit<EnergyContract, 'id' | 'created_at' | 'updated_at' | 'cancellation_deadline'>) => {
    const newContract: EnergyContract = {
      ...data,
      id: crypto.randomUUID(),
      cancellation_deadline: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    newContract.cancellation_deadline = calculateDeadline(newContract);
    setContracts([...contracts, newContract]);

    // Auto-create reminders
    if (newContract.cancellation_deadline) {
      const deadlineDate = new Date(newContract.cancellation_deadline);
      const newReminders: ContractReminder[] = [
        { id: crypto.randomUUID(), contract_id: newContract.id, reminder_date: new Date(deadlineDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], reminder_type: 'cancellation_deadline', is_dismissed: false, sent_at: null, created_at: new Date().toISOString() },
        { id: crypto.randomUUID(), contract_id: newContract.id, reminder_date: new Date(deadlineDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], reminder_type: 'cancellation_deadline', is_dismissed: false, sent_at: null, created_at: new Date().toISOString() },
        { id: crypto.randomUUID(), contract_id: newContract.id, reminder_date: new Date(deadlineDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], reminder_type: 'cancellation_deadline', is_dismissed: false, sent_at: null, created_at: new Date().toISOString() },
      ];
      setReminders([...reminders, ...newReminders]);
    }

    return newContract;
  };

  const updateContract = (id: string, data: Partial<EnergyContract>) => {
    const updated = contracts.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c);
    setContracts(updated);
  };

  const deleteContract = (id: string) => {
    setContracts(contracts.filter(c => c.id !== id));
    setReminders(reminders.filter(r => r.contract_id !== id));
  };

  const dismissReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, is_dismissed: true } : r));
  };

  const upcomingDeadlines = contractsWithReminders.filter(c => c.urgency !== 'ok' && c.status === 'active');

  const activeReminders = reminders.filter(r => {
    if (r.is_dismissed) return false;
    const reminderDate = new Date(r.reminder_date);
    const now = new Date();
    return reminderDate <= now;
  });

  return {
    contracts: contractsWithReminders,
    upcomingDeadlines,
    activeReminders,
    createContract,
    updateContract,
    deleteContract,
    dismissReminder,
  };
}
