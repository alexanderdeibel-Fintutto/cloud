import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase, useAuth } from '@fintutto/core'
import type { Meter, MeterReading, MeterType } from '@fintutto/shared'

const METERS_KEY = 'meters'

export interface MeterWithUnit extends Meter {
  unit?: {
    id: string
    unit_number: string
    building_id: string
    building?: { id: string; name: string; address: string; city: string }
  }
  latestReading?: MeterReading | null
  status?: 'ok' | 'due' | 'overdue'
}

export interface MeterFormData {
  unit_id: string
  meter_number: string
  meter_type: MeterType
  installation_date?: string
  reading_interval_months?: number
  notes?: string
}

export interface ReadingFormData {
  meter_id: string
  reading_value: number
  reading_date: string
  notes?: string
}

export function useMetersList() {
  return useQuery({
    queryKey: [METERS_KEY, 'list'],
    queryFn: async () => {
      const { data: meters, error } = await getSupabase()
        .from('meters')
        .select(`
          *,
          unit:units(
            id, unit_number, building_id,
            building:buildings(id, name, address, city)
          )
        `)
        .order('meter_number')

      if (error) throw error
      if (!meters || meters.length === 0) return []

      // Letzte Ablesung für jeden Zähler
      const meterIds = meters.map((m: { id: string }) => m.id)
      const { data: readings } = await getSupabase()
        .from('meter_readings')
        .select('*')
        .in('meter_id', meterIds)
        .order('reading_date', { ascending: false })

      // Status berechnen
      const now = new Date()
      return meters.map((meter: Record<string, unknown>) => {
        const meterReadings = (readings ?? []).filter(
          (r: { meter_id: string }) => r.meter_id === meter.id
        )
        const latestReading = meterReadings[0] ?? null
        const intervalMonths = (meter.reading_interval_months as number) ?? 12

        let status: 'ok' | 'due' | 'overdue' = 'ok'
        if (latestReading) {
          const lastDate = new Date(latestReading.reading_date)
          const monthsSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          if (monthsSince >= intervalMonths) status = 'overdue'
          else if (monthsSince >= intervalMonths - 1) status = 'due'
        } else {
          status = 'overdue'
        }

        return { ...meter, latestReading, status } as MeterWithUnit
      })
    },
  })
}

export function useMeterReadings(meterId: string | undefined) {
  return useQuery({
    queryKey: ['meter-readings', meterId],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('meter_readings')
        .select('*')
        .eq('meter_id', meterId!)
        .order('reading_date', { ascending: false })

      if (error) throw error
      return (data ?? []) as MeterReading[]
    },
    enabled: !!meterId,
  })
}

export function useCreateMeter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MeterFormData) => {
      const { data: meter, error } = await getSupabase()
        .from('meters')
        .insert({
          unit_id: data.unit_id,
          meter_number: data.meter_number,
          meter_type: data.meter_type,
          installation_date: data.installation_date ?? null,
          reading_interval_months: data.reading_interval_months ?? 12,
          notes: data.notes ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return meter as Meter
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [METERS_KEY] })
    },
  })
}

export function useAddReading() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: ReadingFormData) => {
      const { data: reading, error } = await getSupabase()
        .from('meter_readings')
        .insert({
          meter_id: data.meter_id,
          reading_value: data.reading_value,
          reading_date: data.reading_date,
          recorded_by: user?.id ?? null,
          notes: data.notes ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return reading as MeterReading
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [METERS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['meter-readings', variables.meter_id] })
    },
  })
}

export function useDeleteMeter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase()
        .from('meters')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [METERS_KEY] })
    },
  })
}
