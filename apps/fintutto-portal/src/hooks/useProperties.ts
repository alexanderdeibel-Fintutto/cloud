import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface PropertyOption {
  id: string
  name: string
  street: string
  house_number: string
  postal_code: string
  city: string
  property_type: string
  units: {
    id: string
    name: string
    living_space: number
    current_rent: number | null
    tenants: {
      id: string
      first_name: string
      last_name: string
    }[]
  }[]
}

/**
 * Hook to fetch the logged-in user's properties from the shared Supabase.
 * Used by Rechner and Formulare to pre-fill building/tenant data.
 * Only fetches if the user is logged in.
 */
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
      .from('properties')
      .select(`
        id, name, street, house_number, postal_code, city, property_type,
        units (
          id, name, living_space, current_rent,
          tenants (id, first_name, last_name)
        )
      `)
      .eq('user_id', user.id)
      .order('name')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching properties:', error)
        } else {
          setProperties((data as PropertyOption[]) || [])
        }
        setIsLoading(false)
      })
  }, [user])

  return { properties, isLoading, hasProperties: properties.length > 0 }
}
