/**
 * useFcDocuments — Financial Compass Belege-Hook
 *
 * Verbindet Financial Compass mit dem zentralen Secondbrain-Dokumenten-Hub.
 * Alle Belege werden in sb_documents gespeichert (gleiche Supabase-Instanz).
 * Financial Compass filtert nach category='beleg' und source_app='financial-compass'.
 *
 * Architektur (laut Portal-Guard-Skill):
 *   Upload → secondbrain-docs (Storage) → sb_documents (DB)
 *              ↓
 *   Financial Compass liest sb_documents WHERE source_app='financial-compass'
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface FcDocument {
  id: string
  user_id: string
  title: string
  file_name: string
  file_type: 'pdf' | 'image' | 'text' | 'other'
  file_size: number
  mime_type: string | null
  storage_path: string
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped'
  ocr_text: string | null
  summary: string | null
  tags: string[]
  is_favorite: boolean
  category: string | null
  source_app: string | null
  // Aus OCR extrahierte Felder (werden in tags/summary gespeichert)
  vendor?: string
  amount?: number
  document_date?: string
  created_at: string
  updated_at: string
}

const FC_SOURCE_APP = 'financial-compass'
const FC_CATEGORY = 'beleg'
const STORAGE_BUCKET = 'secondbrain-docs'

/**
 * Alle Belege des aktuellen Nutzers aus sb_documents laden
 * (gefiltert nach source_app='financial-compass')
 */
export function useFcDocuments(options?: { search?: string; ocrStatus?: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['fc-documents', user?.id, options],
    queryFn: async (): Promise<FcDocument[]> => {
      if (!user) return []

      let query = supabase
        .from('sb_documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('source_app', FC_SOURCE_APP)
        .order('created_at', { ascending: false })

      if (options?.search) {
        query = query.or(
          `title.ilike.%${options.search}%,` +
          `ocr_text.ilike.%${options.search}%,` +
          `file_name.ilike.%${options.search}%`
        )
      }

      if (options?.ocrStatus) {
        query = query.eq('ocr_status', options.ocrStatus)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as FcDocument[]
    },
    enabled: !!user,
    refetchInterval: (query) => {
      // Alle 3 Sekunden pollen wenn OCR läuft
      const docs = query.state.data as FcDocument[] | undefined
      const hasProcessing = docs?.some(
        d => d.ocr_status === 'pending' || d.ocr_status === 'processing'
      )
      return hasProcessing ? 3000 : false
    },
  })
}

/**
 * Beleg hochladen: Upload in secondbrain-docs Storage + Eintrag in sb_documents
 * Optional: OCR über secondbrain-ocr Edge Function auslösen
 */
export function useUploadFcDocument() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      files,
      enableOcr = false,
    }: {
      files: File[]
      enableOcr?: boolean
    }) => {
      if (!user) throw new Error('Nicht angemeldet')

      const results: FcDocument[] = []

      for (const file of files) {
        // Eindeutiger Storage-Pfad (gleicher Bucket wie Secondbrain)
        const filePath = `${user.id}/fc/${Date.now()}_${file.name}`

        // 1. Datei in Supabase Storage hochladen
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file)

        if (storageError) throw storageError

        // 2. Dateityp bestimmen
        const fileType: FcDocument['file_type'] =
          file.type.startsWith('image/') ? 'image'
          : file.type === 'application/pdf' ? 'pdf'
          : file.type.startsWith('text/') ? 'text'
          : 'other'

        // 3. Eintrag in sb_documents anlegen
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
            ocr_status: enableOcr ? 'pending' : 'skipped',
            category: FC_CATEGORY,
            source_app: FC_SOURCE_APP,
            tags: [],
            is_favorite: false,
          })
          .select()
          .single()

        if (dbError) throw dbError

        results.push(data as FcDocument)

        // 4. OCR optional auslösen
        if (enableOcr) {
          supabase.functions
            .invoke('secondbrain-ocr', {
              body: {
                documentId: data.id,
                storagePath: filePath,
                fileType,
                mimeType: file.type,
              },
            })
            .catch(console.error)
        }
      }

      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fc-documents'] })
    },
  })
}

/**
 * OCR für einen Beleg manuell auslösen
 */
export function useTriggerFcOcr() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (doc: FcDocument) => {
      await supabase
        .from('sb_documents')
        .update({ ocr_status: 'pending' })
        .eq('id', doc.id)

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
      queryClient.invalidateQueries({ queryKey: ['fc-documents'] })
    },
  })
}

/**
 * Beleg löschen (Storage + DB)
 */
export function useDeleteFcDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (doc: FcDocument) => {
      await supabase.storage.from(STORAGE_BUCKET).remove([doc.storage_path])
      const { error } = await supabase.from('sb_documents').delete().eq('id', doc.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fc-documents'] })
    },
  })
}

/**
 * Download-URL für einen Beleg generieren
 */
export async function getFcDocumentUrl(storagePath: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 3600) // 1 Stunde gültig
  return data?.signedUrl ?? null
}
