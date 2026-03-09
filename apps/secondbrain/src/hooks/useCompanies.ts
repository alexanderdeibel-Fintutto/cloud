import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface Company {
  id: string
  user_id: string
  name: string
  short_name: string | null
  tax_id: string | null
  description: string | null
  color: string
  icon: string
  is_default: boolean
  created_at: string
  updated_at: string
  document_count?: number
}

export function useCompanies() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sb_companies')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
        .order('name')

      if (error) throw error

      // Get document counts per company
      const { data: counts } = await supabase
        .from('sb_documents')
        .select('company_id')
        .eq('user_id', user!.id)
        .not('company_id', 'is', null)

      const countMap: Record<string, number> = {}
      counts?.forEach(d => {
        if (d.company_id) {
          countMap[d.company_id] = (countMap[d.company_id] || 0) + 1
        }
      })

      return (data as Company[]).map(c => ({
        ...c,
        document_count: countMap[c.id] || 0,
      }))
    },
    enabled: !!user,
  })
}

export function useCreateCompany() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (company: {
      name: string
      short_name?: string
      tax_id?: string
      description?: string
      color?: string
      icon?: string
      is_default?: boolean
    }) => {
      const { data, error } = await supabase
        .from('sb_companies')
        .insert({ ...company, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Firma erstellt')
    },
    onError: () => toast.error('Fehler beim Erstellen der Firma'),
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Company> & { id: string }) => {
      const { data, error } = await supabase
        .from('sb_companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Firma aktualisiert')
    },
    onError: () => toast.error('Fehler beim Aktualisieren'),
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sb_companies')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Firma gelöscht')
    },
    onError: () => toast.error('Fehler beim Löschen'),
  })
}

export function useAssignCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      documentId,
      companyId,
    }: {
      documentId: string
      companyId: string | null
    }) => {
      const { error } = await supabase
        .from('sb_documents')
        .update({ company_id: companyId })
        .eq('id', documentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}
