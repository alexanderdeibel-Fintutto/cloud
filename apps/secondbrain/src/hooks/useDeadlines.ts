import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface Deadline {
  id: string
  user_id: string
  document_id: string | null
  title: string
  description: string | null
  deadline_date: string
  reminder_date: string | null
  deadline_type: string
  is_completed: boolean
  completed_at: string | null
  priority: string
  created_at: string
  updated_at: string
  // Joined
  document_title?: string
}

export function useDeadlines(options?: { includeCompleted?: boolean }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['deadlines', options],
    queryFn: async () => {
      let query = supabase
        .from('sb_deadlines')
        .select('*, sb_documents(title)')
        .eq('user_id', user!.id)
        .order('deadline_date', { ascending: true })

      if (!options?.includeCompleted) {
        query = query.eq('is_completed', false)
      }

      const { data, error } = await query
      if (error) throw error

      return (data || []).map((d: any) => ({
        ...d,
        document_title: d.sb_documents?.title || null,
        sb_documents: undefined,
      })) as Deadline[]
    },
    enabled: !!user,
  })
}

export function useUpcomingDeadlines(days: number = 14) {
  const { user } = useAuth()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)

  return useQuery({
    queryKey: ['deadlines', 'upcoming', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sb_deadlines')
        .select('*, sb_documents(title)')
        .eq('user_id', user!.id)
        .eq('is_completed', false)
        .lte('deadline_date', futureDate.toISOString().split('T')[0])
        .order('deadline_date', { ascending: true })

      if (error) throw error

      return (data || []).map((d: any) => ({
        ...d,
        document_title: d.sb_documents?.title || null,
        sb_documents: undefined,
      })) as Deadline[]
    },
    enabled: !!user,
  })
}

export function useCreateDeadline() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deadline: {
      document_id?: string
      title: string
      description?: string
      deadline_date: string
      reminder_date?: string
      deadline_type?: string
      priority?: string
    }) => {
      const { data, error } = await supabase
        .from('sb_deadlines')
        .insert({ ...deadline, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] })
      toast.success('Frist erstellt')
    },
    onError: () => toast.error('Fehler beim Erstellen der Frist'),
  })
}

export function useUpdateDeadline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Deadline> & { id: string }) => {
      const { data, error } = await supabase
        .from('sb_deadlines')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] })
    },
  })
}

export function useCompleteDeadline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sb_deadlines')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] })
      toast.success('Frist als erledigt markiert')
    },
  })
}

export function useDeleteDeadline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sb_deadlines')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] })
      toast.success('Frist gelöscht')
    },
  })
}

// Helper: Days until deadline
export function daysUntil(dateStr: string): number {
  const deadline = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  deadline.setHours(0, 0, 0, 0)
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function deadlineUrgency(dateStr: string): 'overdue' | 'critical' | 'warning' | 'ok' {
  const days = daysUntil(dateStr)
  if (days < 0) return 'overdue'
  if (days <= 3) return 'critical'
  if (days <= 7) return 'warning'
  return 'ok'
}
