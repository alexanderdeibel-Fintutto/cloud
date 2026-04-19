import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { EnergyContract, EnergyContractWithReminders, ContractReminder, ContractStatus, ProviderType } from '@/types/database';

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

export function useEnergyContracts(organizationIdOverride?: string | null) {
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const organizationId = organizationIdOverride ?? profile?.organization_id;

  // Fetch contracts from Supabase
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['energy_contracts', organizationId],
    queryFn: async (): Promise<EnergyContract[]> => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('energy_contracts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as EnergyContract[];
    },
    enabled: !!organizationId,
  });

  // Fetch reminders from Supabase
  const contractIds = contracts.map(c => c.id);
  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ['contract_reminders', contractIds],
    queryFn: async (): Promise<ContractReminder[]> => {
      if (contractIds.length === 0) return [];
      const { data, error } = await supabase
        .from('contract_reminders')
        .select('*')
        .in('contract_id', contractIds);
      if (error) throw error;
      return (data || []) as ContractReminder[];
    },
    enabled: contractIds.length > 0,
  });

  const contractsWithReminders: EnergyContractWithReminders[] = useMemo(() => {
    const now = new Date();
    return contracts.map(contract => {
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
    }).sort((a, b) => {
      const urgencyOrder = { critical: 0, warning: 1, ok: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }, [contracts, reminders]);

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (data: Omit<EnergyContract, 'id' | 'created_at' | 'updated_at' | 'cancellation_deadline'>) => {
      const cancellationDeadline = calculateDeadline(data as EnergyContract);

      const { data: newContract, error } = await supabase
        .from('energy_contracts')
        .insert({
          ...data,
          cancellation_deadline: cancellationDeadline,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-create reminders if there's a cancellation deadline
      if (cancellationDeadline) {
        const deadlineDate = new Date(cancellationDeadline);
        const reminderInserts = [
          { contract_id: newContract.id, reminder_date: new Date(deadlineDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], reminder_type: 'cancellation_deadline' },
          { contract_id: newContract.id, reminder_date: new Date(deadlineDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], reminder_type: 'cancellation_deadline' },
          { contract_id: newContract.id, reminder_date: new Date(deadlineDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], reminder_type: 'cancellation_deadline' },
        ];
        await supabase.from('contract_reminders').insert(reminderInserts);
      }

      return newContract as EnergyContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy_contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract_reminders'] });
    },
  });

  // Update contract mutation
  const updateContractMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<EnergyContract> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('energy_contracts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated as EnergyContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy_contracts'] });
    },
  });

  // Delete contract mutation
  const deleteContractMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('energy_contracts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy_contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract_reminders'] });
    },
  });

  // Dismiss reminder mutation
  const dismissReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contract_reminders')
        .update({ is_dismissed: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract_reminders'] });
    },
  });

  const createContract = (data: Omit<EnergyContract, 'id' | 'created_at' | 'updated_at' | 'cancellation_deadline'>) => {
    return createContractMutation.mutateAsync(data);
  };

  const updateContract = (id: string, data: Partial<EnergyContract>) => {
    return updateContractMutation.mutateAsync({ id, ...data });
  };

  const deleteContract = (id: string) => {
    return deleteContractMutation.mutateAsync(id);
  };

  const dismissReminder = (id: string) => {
    return dismissReminderMutation.mutateAsync(id);
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
    isLoading: contractsLoading || remindersLoading,
    createContract,
    updateContract,
    deleteContract,
    dismissReminder,
  };
}
