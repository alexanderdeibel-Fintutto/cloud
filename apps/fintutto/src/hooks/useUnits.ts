import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase } from '@fintutto/core'
import type { Unit, UnitInsert, UnitStatus } from '@fintutto/shared'

const UNITS_KEY = 'units'

export interface UnitWithBuilding extends Unit {
  buildings?: { id: string; name: string; address: string; city: string }
}

export interface UnitFormData {
  building_id: string
  unit_number: string
  floor?: number | null
  area: number
  rooms: number
  rent_amount: number
  utility_advance?: number
  status: UnitStatus
  notes?: string
}

export function useUnitsList(buildingId?: string) {
  return useQuery({
    queryKey: [UNITS_KEY, 'list', buildingId],
    queryFn: async () => {
      let query = getSupabase()
        .from('units')
        .select('*, buildings!inner(id, name, address, city)')
        .order('unit_number', { ascending: true })

      if (buildingId) {
        query = query.eq('building_id', buildingId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as UnitWithBuilding[]
    },
  })
}

export function useUnit(id: string | undefined) {
  return useQuery({
    queryKey: [UNITS_KEY, 'detail', id],
    queryFn: async () => {
      const { data: unit, error } = await getSupabase()
        .from('units')
        .select('*, buildings(id, name, address, city)')
        .eq('id', id!)
        .maybeSingle()

      if (error) throw error
      if (!unit) return null

      // Aktiven Mietvertrag mit Mieter laden
      const { data: lease } = await getSupabase()
        .from('leases')
        .select('*, tenants(*)')
        .eq('unit_id', id!)
        .eq('is_active', true)
        .maybeSingle()

      return { ...unit, activeLease: lease }
    },
    enabled: !!id,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UnitFormData) => {
      const insertData: Partial<UnitInsert> = {
        building_id: data.building_id,
        unit_number: data.unit_number,
        floor: data.floor ?? null,
        area: data.area,
        rooms: data.rooms,
        rent_amount: data.rent_amount,
        utility_advance: data.utility_advance ?? 0,
        status: data.status,
        notes: data.notes ?? null,
      }

      const { data: unit, error } = await getSupabase()
        .from('units')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      return unit as Unit
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UNITS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UnitFormData> }) => {
      const { data: unit, error } = await getSupabase()
        .from('units')
        .update(data as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return unit as Unit
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UNITS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase()
        .from('units')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UNITS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })
}
