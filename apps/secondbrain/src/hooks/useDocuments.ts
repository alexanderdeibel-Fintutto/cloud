import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Document } from '@/components/documents/DocumentCard'

export function useDocuments(options?: { category?: string; favorites?: boolean; search?: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['documents', user?.id, options],
    queryFn: async (): Promise<Document[]> => {
      if (!user) return []

      let query = supabase
        .from('sb_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (options?.category) {
        query = query.eq('category', options.category)
      }
      if (options?.favorites) {
        query = query.eq('is_favorite', true)
      }
      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,ocr_text.ilike.%${options.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as Document[]
    },
    enabled: !!user,
  })
}

export function useUploadDocument() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (files: File[]) => {
      if (!user) throw new Error('Not authenticated')

      const results = []
      for (const file of files) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`

        // Upload to storage
        const { error: storageError } = await supabase.storage
          .from('secondbrain-docs')
          .upload(filePath, file)

        if (storageError) throw storageError

        // Create DB record
        const fileType = file.type.startsWith('image/') ? 'image'
          : file.type === 'application/pdf' ? 'pdf'
          : file.type.startsWith('text/') ? 'text'
          : 'other'

        const { data, error: dbError } = await supabase
          .from('sb_documents')
          .insert({
            user_id: user.id,
            title: file.name.replace(/\.[^/.]+$/, ''),
            file_name: file.name,
            file_type: fileType,
            file_size: file.size,
            mime_type: file.type,
            storage_path: filePath,
            ocr_status: 'pending',
            tags: [],
            is_favorite: false,
          })
          .select()
          .single()

        if (dbError) throw dbError
        results.push(data)

        // Trigger OCR processing (edge function)
        supabase.functions.invoke('secondbrain-ocr', {
          body: { documentId: data.id, storagePath: filePath, fileType, mimeType: file.type },
        }).catch(console.error)
      }

      return results
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      // Log upload activity for each document
      if (user && data) {
        for (const doc of data) {
          supabase.from('sb_activity_log').insert({
            user_id: user.id,
            action: 'upload',
            entity_type: 'document',
            entity_id: doc.id,
            metadata: { title: doc.title, file_type: doc.file_type },
          }).then(() => {})
        }
      }
    },
  })
}

export function useToggleFavorite() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (doc: Document) => {
      const { error } = await supabase
        .from('sb_documents')
        .update({ is_favorite: !doc.is_favorite })
        .eq('id', doc.id)

      if (error) throw error
      return doc
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      if (user && doc && !doc.is_favorite) {
        supabase.from('sb_activity_log').insert({
          user_id: user.id,
          action: 'favorite',
          entity_type: 'document',
          entity_id: doc.id,
          metadata: { title: doc.title },
        }).then(() => {})
      }
    },
  })
}

export function useDeleteDocument() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (doc: Document) => {
      // Delete from storage
      await supabase.storage.from('secondbrain-docs').remove([doc.storage_path])

      // Delete from DB
      const { error } = await supabase.from('sb_documents').delete().eq('id', doc.id)
      if (error) throw error
      return doc
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      if (user && doc) {
        supabase.from('sb_activity_log').insert({
          user_id: user.id,
          action: 'delete',
          entity_type: 'document',
          entity_id: doc.id,
          metadata: { title: doc.title },
        }).then(() => {})
      }
    },
  })
}

export function useDocumentStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['document-stats', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('sb_documents')
        .select('id, file_type, file_size, is_favorite, ocr_status')
        .eq('user_id', user.id)

      if (error) throw error

      const docs = data || []
      return {
        total: docs.length,
        totalSize: docs.reduce((sum, d) => sum + (d.file_size || 0), 0),
        byType: {
          pdf: docs.filter((d) => d.file_type === 'pdf').length,
          image: docs.filter((d) => d.file_type === 'image').length,
          text: docs.filter((d) => d.file_type === 'text').length,
          other: docs.filter((d) => !['pdf', 'image', 'text'].includes(d.file_type)).length,
        },
        favorites: docs.filter((d) => d.is_favorite).length,
        ocrCompleted: docs.filter((d) => d.ocr_status === 'completed').length,
        ocrPending: docs.filter((d) => d.ocr_status === 'pending' || d.ocr_status === 'processing').length,
      }
    },
    enabled: !!user,
  })
}
