import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  icon: string
  sort_order: number
  created_at: string
  updated_at: string
  document_count?: number
}

export function useCollections() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['collections', user?.id],
    queryFn: async (): Promise<Collection[]> => {
      if (!user) return []

      const { data: collections, error } = await supabase
        .from('sb_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })

      if (error) throw error

      // Get document counts per collection
      const { data: counts } = await supabase
        .from('sb_document_collections')
        .select('collection_id')
        .in('collection_id', (collections || []).map((c) => c.id))

      const countMap: Record<string, number> = {}
      for (const row of counts || []) {
        countMap[row.collection_id] = (countMap[row.collection_id] || 0) + 1
      }

      return (collections || []).map((c) => ({
        ...c,
        document_count: countMap[c.id] || 0,
      })) as Collection[]
    },
    enabled: !!user,
  })
}

export function useCreateCollection() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; description?: string; color?: string; icon?: string }) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('sb_collections')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          color: input.color || '#6366f1',
          icon: input.icon || 'folder',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; color?: string; icon?: string }) => {
      const { error } = await supabase
        .from('sb_collections')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sb_collections')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
}

export function useAddDocumentToCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ documentId, collectionId }: { documentId: string; collectionId: string }) => {
      const { error } = await supabase
        .from('sb_document_collections')
        .insert({ document_id: documentId, collection_id: collectionId })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection-documents'] })
    },
  })
}

export function useCollectionDocuments(collectionId: string | null) {
  return useQuery({
    queryKey: ['collection-documents', collectionId],
    queryFn: async () => {
      if (!collectionId) return []

      const { data: links, error: linkError } = await supabase
        .from('sb_document_collections')
        .select('document_id')
        .eq('collection_id', collectionId)

      if (linkError) throw linkError
      if (!links || links.length === 0) return []

      const docIds = links.map((l) => l.document_id)
      const { data: docs, error: docError } = await supabase
        .from('sb_documents')
        .select('*')
        .in('id', docIds)
        .order('created_at', { ascending: false })

      if (docError) throw docError
      return docs || []
    },
    enabled: !!collectionId,
  })
}

export function useRemoveDocumentFromCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ documentId, collectionId }: { documentId: string; collectionId: string }) => {
      const { error } = await supabase
        .from('sb_document_collections')
        .delete()
        .eq('document_id', documentId)
        .eq('collection_id', collectionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection-documents'] })
    },
  })
}
