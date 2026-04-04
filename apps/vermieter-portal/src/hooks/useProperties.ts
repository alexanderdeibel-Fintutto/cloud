import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface PropertyOption {
  id: string
  name: string
  address: string
  postal_code: string
  city: string
  building_type: string
  units: {
    id: string
    unit_number: string
    area: number
    rent_amount: number
    status: string
    leases: {
      tenant_id: string
      tenants: {
        id: string
        first_name: string
        last_name: string
      } | null
    }[]
  }[]
}

export function useProperties() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setProperties([])
      return
    }

    setIsLoading(true)
    supabase
      .from('buildings')
      .select(`
        id, name, address, postal_code, city, building_type,
        units (
          id, unit_number, area, rent_amount, status,
          leases (
            tenant_id,
            tenants ( id, first_name, last_name )
          )
        )
      `)
      .order('name')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching buildings:', error)
        } else {
          setProperties((data as unknown as PropertyOption[]) || [])
        }
        setIsLoading(false)
      })
  }, [user])

  return { properties, isLoading, hasProperties: properties.length > 0 }
}
