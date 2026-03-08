import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Document } from '@/components/documents/DocumentCard'

export function useSearch() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const toggleFilter = useCallback((filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    )
  }, [])

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', user?.id, query, activeFilters],
    queryFn: async (): Promise<Document[]> => {
      if (!user || !query.trim()) return []

      let q = supabase
        .from('sb_documents')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,ocr_text.ilike.%${query}%,summary.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50)

      // Apply type filters
      if (activeFilters.includes('PDF')) q = q.eq('file_type', 'pdf')
      if (activeFilters.includes('Bilder')) q = q.eq('file_type', 'image')
      if (activeFilters.includes('Text')) q = q.eq('file_type', 'text')
      if (activeFilters.includes('Favoriten')) q = q.eq('is_favorite', true)

      const { data, error } = await q
      if (error) throw error
      return (data || []) as Document[]
    },
    enabled: !!user && !!query.trim(),
    staleTime: 30 * 1000,
  })

  return {
    query,
    setQuery,
    results,
    isLoading,
    activeFilters,
    toggleFilter,
  }
}
