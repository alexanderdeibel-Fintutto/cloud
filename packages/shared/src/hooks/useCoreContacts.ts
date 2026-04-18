/**
 * useCoreContacts — Shared Hook für die zentrale Kontaktverwaltung
 *
 * Nutzt die core_contacts, core_addresses und core_contact_addresses Tabellen
 * als Single Source of Truth für alle Apps im Fintutto-Ökosystem.
 *
 * Usage:
 *   import { useCoreContacts } from '@fintutto/shared/hooks'
 *
 *   const { contacts, createContact, updateContact } = useCoreContacts(supabase)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'

// ── Typen ─────────────────────────────────────────────────────

export type ContactType = 'person' | 'company'

export interface CoreAddress {
  id: string
  owner_id: string
  street: string
  house_number: string | null
  postal_code: string
  city: string
  state: string | null
  country: string
  latitude: number | null
  longitude: number | null
  google_place_id: string | null
  formatted: string | null
  created_at: string
  updated_at: string
}

export interface CoreContactAddress {
  id: string
  contact_id: string
  address_id: string
  address_type: 'primary' | 'billing' | 'shipping' | 'previous'
  is_primary: boolean
  valid_from: string | null
  valid_until: string | null
  created_at: string
  address?: CoreAddress
}

export interface CoreContact {
  id: string
  organization_id: string | null
  owner_id: string
  contact_type: ContactType
  first_name: string | null
  last_name: string | null
  company_name: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  tax_id: string | null
  vat_id: string | null
  iban: string | null
  bank_name: string | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
  // Joined
  addresses?: CoreContactAddress[]
  document_count?: number
  is_tenant?: boolean
  is_biz_client?: boolean
}

export interface CoreContactInsert {
  contact_type: ContactType
  first_name?: string
  last_name?: string
  company_name?: string
  email?: string
  phone?: string
  mobile?: string
  tax_id?: string
  vat_id?: string
  iban?: string
  bank_name?: string
  notes?: string
  tags?: string[]
  organization_id?: string
  // Optional: Adresse direkt mitgeben
  address?: {
    street: string
    house_number?: string
    postal_code: string
    city: string
    country?: string
    address_type?: 'primary' | 'billing'
    google_place_id?: string
    formatted?: string
    latitude?: number
    longitude?: number
  }
}

export type CoreContactUpdate = Partial<CoreContactInsert>

// ── Hooks ─────────────────────────────────────────────────────

/**
 * Alle Kontakte des aktuellen Nutzers laden
 */
export function useCoreContacts(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['core_contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_contacts_unified')
        .select('*')
        .order('display_name')
      if (error) throw error
      return data as (CoreContact & {
        display_name: string
        street: string | null
        house_number: string | null
        postal_code: string | null
        city: string | null
        country: string | null
        address_formatted: string | null
      })[]
    },
  })

  const createContact = useMutation({
    mutationFn: async (input: CoreContactInsert) => {
      // 1. Kontakt erstellen
      const { data: contact, error: contactError } = await supabase
        .from('core_contacts')
        .insert({
          contact_type: input.contact_type,
          first_name: input.first_name,
          last_name: input.last_name,
          company_name: input.company_name,
          email: input.email,
          phone: input.phone,
          mobile: input.mobile,
          tax_id: input.tax_id,
          vat_id: input.vat_id,
          iban: input.iban,
          bank_name: input.bank_name,
          notes: input.notes,
          tags: input.tags ?? [],
          organization_id: input.organization_id,
        })
        .select()
        .single()
      if (contactError) throw contactError

      // 2. Adresse erstellen und verknüpfen (falls angegeben)
      if (input.address && input.address.city) {
        const { data: addr, error: addrError } = await supabase
          .from('core_addresses')
          .insert({
            street: input.address.street,
            house_number: input.address.house_number,
            postal_code: input.address.postal_code,
            city: input.address.city,
            country: input.address.country ?? 'Deutschland',
            google_place_id: input.address.google_place_id,
            formatted: input.address.formatted,
            latitude: input.address.latitude,
            longitude: input.address.longitude,
          })
          .select()
          .single()
        if (addrError) throw addrError

        await supabase.from('core_contact_addresses').insert({
          contact_id: contact.id,
          address_id: addr.id,
          address_type: input.address.address_type ?? 'primary',
          is_primary: true,
        })
      }

      return contact as CoreContact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core_contacts'] })
    },
  })

  const updateContact = useMutation({
    mutationFn: async ({ id, ...updates }: CoreContactUpdate & { id: string }) => {
      const { address, ...contactUpdates } = updates as CoreContactInsert & { id: string }

      const { data, error } = await supabase
        .from('core_contacts')
        .update(contactUpdates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as CoreContact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core_contacts'] })
    },
  })

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('core_contacts')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core_contacts'] })
    },
  })

  return {
    contacts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createContact,
    updateContact,
    deleteContact,
    refetch: query.refetch,
  }
}

/**
 * Einzelnen Kontakt mit allen Details laden
 */
export function useCoreContact(supabase: SupabaseClient, id: string | undefined) {
  return useQuery({
    queryKey: ['core_contacts', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_contact_full', { p_contact_id: id })
      if (error) throw error
      return data as CoreContact & {
        addresses: (CoreAddress & { address_type: string; is_primary: boolean })[]
        documents: unknown[]
      }
    },
  })
}

/**
 * Kontakte suchen (für ContactSelector Dropdown)
 */
export function useContactSearch(supabase: SupabaseClient, query: string) {
  return useQuery({
    queryKey: ['core_contacts', 'search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('search_contacts', { p_query: query, p_limit: 20 })
      if (error) throw error
      return data as {
        id: string
        contact_type: ContactType
        display_name: string
        email: string | null
        phone: string | null
        company_name: string | null
      }[]
    },
  })
}

/**
 * Kontakt mit Mieter verknüpfen (Migration)
 */
export function useSyncTenantToContact(supabase: SupabaseClient) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const { data, error } = await supabase
        .rpc('sync_tenant_to_core_contact', { p_tenant_id: tenantId })
      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core_contacts'] })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })
}

/**
 * Kontakt mit biz_client verknüpfen (Migration)
 */
export function useSyncClientToContact(supabase: SupabaseClient) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (clientId: string) => {
      const { data, error } = await supabase
        .rpc('sync_biz_client_to_core_contact', { p_client_id: clientId })
      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core_contacts'] })
    },
  })
}
