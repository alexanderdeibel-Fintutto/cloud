import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Document } from '@/components/documents/DocumentCard'

export function useDocuments(options?: {
  category?: string
  favorites?: boolean
  search?: string
  /** Wenn true: zeigt auch Dokumente aus anderen Apps (FC, Vermietify) — abhängig von Nutzer-Einstellung */
  showExternalDocs?: boolean
  /** Nur Dokumente einer bestimmten App anzeigen */
  sourceApp?: string
}) {
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

      // source_app Filter:
      // - Standard: nur SecondBrain-eigene Dokumente (source_app IS NULL oder 'secondbrain')
      // - showExternalDocs=true: alle Dokumente (FC, Vermietify etc.) — Nutzer-Einstellung
      // - sourceApp='financial-compass': nur FC-Belege
      if (options?.sourceApp) {
        query = query.eq('source_app', options.sourceApp)
      } else if (!options?.showExternalDocs) {
        query = query.or('source_app.is.null,source_app.eq.secondbrain')
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as Document[]
    },
    enabled: !!user,
  })
}

export interface UploadOptions {
  enableOcr?: boolean
}

export function useUploadDocument() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ files, options }: { files: File[]; options?: UploadOptions }) => {
      if (!user) throw new Error('Not authenticated')

      const enableOcr = options?.enableOcr ?? false

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

        // OCR-Status: 'pending' wenn OCR aktiviert, 'skipped' wenn nicht
        const ocrStatus = enableOcr ? 'pending' : 'skipped'

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
            ocr_status: ocrStatus,
            tags: [],
            is_favorite: false,
          })
          .select()
          .single()

        if (dbError) throw dbError
        results.push(data)

        // OCR nur auslösen wenn explizit aktiviert
        if (enableOcr) {
          supabase.functions.invoke('secondbrain-ocr', {
            body: { documentId: data.id, storagePath: filePath, fileType, mimeType: file.type },
          }).catch(console.error)
        }
      }

      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (doc: Document) => {
      const { error } = await supabase
        .from('sb_documents')
        .update({ is_favorite: !doc.is_favorite })
        .eq('id', doc.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (doc: Document) => {
      // Löschen-Schutz: FC- und Vermietify-Dokumente können nur aus der jeweiligen App gelöscht werden
      if (doc.source_app && doc.source_app !== 'secondbrain') {
        throw new Error(
          `Dieses Dokument gehört zu ${doc.source_app === 'financial-compass' ? 'Financial Compass' : 'Vermietify'} und kann nur dort gelöscht werden.`
        )
      }

      // Delete from storage
      await supabase.storage.from('secondbrain-docs').remove([doc.storage_path])

      // Delete from DB
      const { error } = await supabase.from('sb_documents').delete().eq('id', doc.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
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
        ocrSkipped: docs.filter((d) => d.ocr_status === 'skipped').length,
      }
    },
    enabled: !!user,
  })
}

/**
 * Manuell OCR für ein einzelnes Dokument auslösen (z.B. aus der Dokumentenliste)
 */
export function useTriggerOcr() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (doc: Document) => {
      // Status auf 'pending' setzen
      await supabase
        .from('sb_documents')
        .update({ ocr_status: 'pending' })
        .eq('id', doc.id)

      // Edge Function aufrufen
      const { error } = await supabase.functions.invoke('secondbrain-ocr', {
        body: {
          documentId: doc.id,
          storagePath: doc.storage_path,
          fileType: doc.file_type,
          mimeType: doc.mime_type || '',
        },
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
