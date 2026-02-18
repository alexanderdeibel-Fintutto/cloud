import { useQuery } from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Meter, MeterReading, MeterWithReadings } from '../types/database'

/**
 * Shared hook: Fetch all meters (used by Ablesung, Vermietify).
 */
export function useMeters(supabase: SupabaseClient) {
  return useQuery({
    queryKey: ['meters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meters')
        .select(`
          *,
          units (
            id, unit_number,
            buildings ( id, name )
          )
        `)
        .order('meter_number')
      if (error) throw error
      return data as Meter[]
    },
  })
}

/**
 * Shared hook: Fetch meters with their readings for a specific unit.
 */
export function useMetersForUnit(supabase: SupabaseClient, unitId: string | undefined) {
  return useQuery({
    queryKey: ['meters', 'unit', unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meters')
        .select(`
          *,
          meter_readings ( * )
        `)
        .eq('unit_id', unitId!)
        .order('meter_type')
      if (error) throw error
      return data as MeterWithReadings[]
    },
    enabled: !!unitId,
  })
}

/**
 * Shared hook: Fetch recent meter readings.
 */
export function useRecentReadings(supabase: SupabaseClient, limit = 20) {
  return useQuery({
    queryKey: ['meter-readings', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meter_readings')
        .select(`
          *,
          meters (
            id, meter_number, meter_type,
            units (
              id, unit_number,
              buildings ( id, name )
            )
          )
        `)
        .order('reading_date', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data as MeterReading[]
    },
  })
}
