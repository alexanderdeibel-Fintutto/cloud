/**
 * useFcBookingSuggestions — Buchungsvorschläge aus KI-OCR-Analyse
 *
 * Architektur:
 *   OCR fertig → Nutzer klickt "Buchungsvorschlag" (Opt-in)
 *   → fc-suggest-booking Edge Function
 *   → fc_booking_suggestions (DB)
 *   → Nutzer bestätigt → Buchung in transactions anlegen
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface FcBookingSuggestion {
  id: string
  document_id: string
  user_id: string
  vendor: string | null
  amount_gross: number | null
  amount_net: number | null
  vat_rate: number | null
  vat_amount: number | null
  document_date: string | null
  account_number: string | null
  account_name: string | null
  booking_type: 'expense' | 'income' | 'transfer'
  confidence: number
  raw_suggestion: Record<string, unknown>
  status: 'pending' | 'accepted' | 'rejected' | 'applied'
  applied_transaction_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Alle offenen Buchungsvorschläge des Nutzers laden
 */
export function useFcBookingSuggestions(documentId?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['fc-booking-suggestions', user?.id, documentId],
    queryFn: async (): Promise<FcBookingSuggestion[]> => {
      if (!user) return []

      let query = supabase
        .from('fc_booking_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (documentId) {
        query = query.eq('document_id', documentId)
      } else {
        query = query.eq('status', 'pending')
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as FcBookingSuggestion[]
    },
    enabled: !!user,
  })
}

/**
 * Buchungsvorschlag für ein Dokument anfordern (Opt-in)
 */
export function useRequestBookingSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentId: string): Promise<FcBookingSuggestion> => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Nicht angemeldet')

      const { data, error } = await supabase.functions.invoke('fc-suggest-booking', {
        body: { documentId },
      })

      if (error) throw error
      if (data.error) throw new Error(data.error)

      return data.suggestion as FcBookingSuggestion
    },
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ['fc-booking-suggestions'] })
      queryClient.invalidateQueries({ queryKey: ['fc-documents'] })
      toast.success('Buchungsvorschlag erstellt')
    },
    onError: (err: Error) => {
      toast.error(`Vorschlag fehlgeschlagen: ${err.message}`)
    },
  })
}

/**
 * Buchungsvorschlag annehmen → Buchung in transactions anlegen
 */
export function useAcceptBookingSuggestion() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      suggestion,
      companyId,
    }: {
      suggestion: FcBookingSuggestion
      companyId: string
    }) => {
      if (!user) throw new Error('Nicht angemeldet')

      // 1. Buchung in transactions anlegen
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          company_id: companyId,
          type: suggestion.booking_type,
          amount: suggestion.amount_gross ?? 0,
          description: suggestion.vendor
            ? `${suggestion.vendor}${suggestion.account_name ? ` — ${suggestion.account_name}` : ''}`
            : suggestion.account_name ?? 'Buchung aus Beleg',
          category: suggestion.account_number ?? undefined,
          date: suggestion.document_date ?? new Date().toISOString().split('T')[0],
        })
        .select()
        .single()

      if (txError) throw txError

      // 2. Vorschlag als angewendet markieren
      const { error: updateError } = await supabase.rpc('accept_booking_suggestion', {
        p_suggestion_id: suggestion.id,
        p_transaction_id: transaction.id,
      })

      if (updateError) throw updateError

      // 3. Dokument mit Buchung verknüpfen
      await supabase.rpc('link_document_to_entity', {
        p_document_id: suggestion.document_id,
        p_entity_type: 'transaction',
        p_entity_id: transaction.id,
        p_notes: `Automatisch verknüpft via Buchungsvorschlag (Konfidenz: ${Math.round(suggestion.confidence * 100)}%)`,
      })

      return transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fc-booking-suggestions'] })
      queryClient.invalidateQueries({ queryKey: ['fc-documents'] })
      toast.success('Buchung angelegt und Beleg verknüpft ✓')
    },
    onError: (err: Error) => {
      toast.error(`Buchung fehlgeschlagen: ${err.message}`)
    },
  })
}

/**
 * Buchungsvorschlag ablehnen
 */
export function useRejectBookingSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('fc_booking_suggestions')
        .update({ status: 'rejected' })
        .eq('id', suggestionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fc-booking-suggestions'] })
      toast.info('Vorschlag abgelehnt')
    },
  })
}

/**
 * Dokument manuell mit einer Buchung verknüpfen
 */
export function useLinkDocumentToTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      documentId,
      transactionId,
      notes,
    }: {
      documentId: string
      transactionId: string
      notes?: string
    }) => {
      const { error } = await supabase.rpc('link_document_to_entity', {
        p_document_id: documentId,
        p_entity_type: 'transaction',
        p_entity_id: transactionId,
        p_notes: notes ?? null,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fc-documents'] })
      toast.success('Beleg mit Buchung verknüpft ✓')
    },
    onError: (err: Error) => {
      toast.error(`Verknüpfung fehlgeschlagen: ${err.message}`)
    },
  })
}
