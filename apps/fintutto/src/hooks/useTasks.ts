import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase, useAuth } from '@fintutto/core'
import type { Task, TaskPriority, TaskCategory, TaskStatus } from '@fintutto/shared'

const TASKS_KEY = 'tasks'

export interface TaskWithRelations extends Task {
  buildings?: { id: string; name: string } | null
  units?: { id: string; unit_number: string } | null
}

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority
  buildingId?: string
  unitId?: string
  category?: TaskCategory
}

export interface TaskFormData {
  title: string
  description?: string
  priority?: TaskPriority
  category?: TaskCategory
  status?: TaskStatus
  building_id?: string
  unit_id?: string
  assigned_to?: string
  due_date?: string
}

export function useTasksList(filters?: TaskFilters) {
  return useQuery({
    queryKey: [TASKS_KEY, 'list', filters],
    queryFn: async () => {
      let query = getSupabase()
        .from('tasks')
        .select('*, buildings(id, name), units(id, unit_number)')
        .order('created_at', { ascending: false })

      if (Array.isArray(filters?.status)) {
        query = query.in('status', filters.status)
      } else if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.priority) query = query.eq('priority', filters.priority)
      if (filters?.buildingId) query = query.eq('building_id', filters.buildingId)
      if (filters?.unitId) query = query.eq('unit_id', filters.unitId)
      if (filters?.category) query = query.eq('category', filters.category)

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as TaskWithRelations[]
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuth()

  return useMutation({
    mutationFn: async (data: TaskFormData) => {
      const { data: task, error } = await getSupabase()
        .from('tasks')
        .insert({
          organization_id: profile?.organizationId ?? '',
          building_id: data.building_id || null,
          unit_id: data.unit_id || null,
          title: data.title,
          description: data.description ?? null,
          priority: data.priority || 'normal',
          category: data.category || 'other',
          status: data.status || 'open',
          assigned_to: data.assigned_to || null,
          created_by: user?.id || null,
          due_date: data.due_date ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return task as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] })
    },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: task, error } = await getSupabase()
        .from('tasks')
        .update({ status: 'completed', is_completed: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return task as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase()
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] })
    },
  })
}
