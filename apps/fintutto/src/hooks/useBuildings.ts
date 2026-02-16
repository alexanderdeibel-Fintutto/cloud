import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase, useAuth } from '@fintutto/core'
import type { Building, BuildingFormData, Unit } from '@fintutto/shared'

const BUILDINGS_KEY = 'buildings'

export interface BuildingWithUnits extends Building {
  units?: Unit[]
}

export function useBuildingsList(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [BUILDINGS_KEY, 'list', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await getSupabase()
        .from('buildings')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      return { buildings: (data ?? []) as Building[], total: count ?? 0 }
    },
  })
}

export function useBuilding(id: string | undefined) {
  return useQuery({
    queryKey: [BUILDINGS_KEY, 'detail', id],
    queryFn: async () => {
      const { data: building, error } = await getSupabase()
        .from('buildings')
        .select('*')
        .eq('id', id!)
        .maybeSingle()

      if (error) throw error
      if (!building) return null

      const { data: units } = await getSupabase()
        .from('units')
        .select('*')
        .eq('building_id', id!)
        .order('unit_number', { ascending: true })

      return { ...building, units: units ?? [] } as BuildingWithUnits
    },
    enabled: !!id,
  })
}

export function useCreateBuilding() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: async (data: BuildingFormData) => {
      const { data: building, error } = await getSupabase()
        .from('buildings')
        .insert({
          organization_id: profile?.organizationId ?? '',
          name: data.name,
          address: data.street,
          postal_code: data.zip,
          city: data.city,
          building_type: data.building_type || 'apartment',
          total_area: data.total_area,
          year_built: data.year_built,
          notes: data.notes,
        })
        .select()
        .single()

      if (error) throw error
      return building as Building
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUILDINGS_KEY] })
    },
  })
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BuildingFormData> }) => {
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.street !== undefined) updateData.address = data.street
      if (data.zip !== undefined) updateData.postal_code = data.zip
      if (data.city !== undefined) updateData.city = data.city
      if (data.building_type !== undefined) updateData.building_type = data.building_type
      if (data.total_area !== undefined) updateData.total_area = data.total_area
      if (data.year_built !== undefined) updateData.year_built = data.year_built
      if (data.notes !== undefined) updateData.notes = data.notes

      const { data: building, error } = await getSupabase()
        .from('buildings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return building as Building
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [BUILDINGS_KEY] })
      queryClient.invalidateQueries({ queryKey: [BUILDINGS_KEY, 'detail', variables.id] })
    },
  })
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase()
        .from('buildings')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUILDINGS_KEY] })
    },
  })
}
