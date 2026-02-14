import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export function useMeters() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['meters', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meters')
        .select(`
          *,
          unit:units (
            name,
            property:properties (id, name, street, house_number, city)
          ),
          meter_readings (
            id, reading_value, reading_date, source
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useCreateMeter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (meter: {
      unit_id: string
      meter_number: string
      meter_type: string
      location?: string | null
      installation_date?: string | null
    }) => {
      const { data, error } = await supabase
        .from('meters')
        .insert(meter)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] })
    },
  })
}

export function useCreateMeterReading() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (reading: {
      meter_id: string
      reading_value: number
      reading_date: string
      source?: string
      notes?: string | null
    }) => {
      const { data, error } = await supabase
        .from('meter_readings')
        .insert({ ...reading, read_by: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] })
    },
  })
}
