import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../integrations/supabase/client'

interface UploadResult {
  path: string
  url: string
  dateiname: string
  dateityp: string
  dateigroesse: number
}

interface UseFileUploadReturn {
  uploading: boolean
  progress: number
  error: string | null
  uploadFile: (file: File, bescheidId?: string) => Promise<UploadResult | null>
  deleteFile: (path: string) => Promise<boolean>
}

const BUCKET = 'bescheid-dokumente'
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
]

export function useFileUpload(): UseFileUploadReturn {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (file: File, bescheidId?: string): Promise<UploadResult | null> => {
    if (!user?.id) {
      setError('Nicht angemeldet')
      return null
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Dateityp nicht unterstuetzt. Erlaubt: PDF, JPEG, PNG, WebP')
      return null
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Datei zu gross. Maximal 20 MB erlaubt.')
      return null
    }

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Generate storage path: userId/timestamp_filename
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `${user.id}/${timestamp}_${safeName}`

      setProgress(20)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      setProgress(60)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath)

      setProgress(80)

      // Save document reference in database
      if (bescheidId) {
        await supabase.from('dokumente').insert({
          user_id: user.id,
          bescheid_id: bescheidId,
          dateiname: file.name,
          dateityp: file.type,
          dateigroesse: file.size,
          storage_path: storagePath,
          ocr_status: 'pending',
        })
      }

      setProgress(100)

      return {
        path: storagePath,
        url: urlData.publicUrl,
        dateiname: file.name,
        dateityp: file.type,
        dateigroesse: file.size,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload fehlgeschlagen'
      setError(msg)
      return null
    } finally {
      setUploading(false)
    }
  }, [user?.id])

  const deleteFile = useCallback(async (path: string): Promise<boolean> => {
    if (!user?.id) return false

    try {
      const { error: deleteError } = await supabase.storage
        .from(BUCKET)
        .remove([path])

      if (deleteError) throw deleteError

      // Also delete the document reference
      await supabase
        .from('dokumente')
        .delete()
        .eq('storage_path', path)
        .eq('user_id', user.id)

      return true
    } catch {
      return false
    }
  }, [user?.id])

  return {
    uploading,
    progress,
    error,
    uploadFile,
    deleteFile,
  }
}
