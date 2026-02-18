import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, getSupabase } from '@fintutto/core'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@fintutto/ui'
import { Upload, FileUp, X, CheckCircle2, AlertCircle, File } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
]

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.tiff,.tif'

export default function UploadPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles: UploadFile[] = []

    Array.from(newFiles).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" wird nicht unterstützt. Erlaubt: PDF, JPG, PNG, WebP, TIFF`)
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`"${file.name}" ist zu groß. Maximale Dateigröße: 20 MB`)
        return
      }
      validFiles.push({
        file,
        id: generateId(),
        progress: 0,
        status: 'pending',
      })
    })

    setFiles((prev) => [...prev, ...validFiles])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  const uploadMutation = useMutation({
    mutationFn: async (uploadFile: UploadFile) => {
      const supabase = getSupabase()
      const userId = profile?.id
      if (!userId) throw new Error('Nicht angemeldet')

      // Update progress
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 10 } : f
        )
      )

      // Upload to Supabase Storage
      const fileExt = uploadFile.file.name.split('.').pop()
      const storagePath = `${userId}/${generateId()}.${fileExt}`

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, progress: 30 } : f
        )
      )

      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(storagePath, uploadFile.file, {
          contentType: uploadFile.file.type,
          cacheControl: '3600',
        })

      if (storageError) throw storageError

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, progress: 60 } : f
        )
      )

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath)

      // Create database record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          app_id: 'bescheid-boxer',
          file_name: uploadFile.file.name,
          file_path: storagePath,
          file_url: urlData.publicUrl,
          file_size: uploadFile.file.size,
          mime_type: uploadFile.file.type,
          status: 'uploaded',
          document_type: null,
        })

      if (dbError) throw dbError

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, progress: 100, status: 'success' as const } : f
        )
      )
    },
    onError: (error, uploadFile) => {
      const message = error instanceof Error ? error.message : 'Upload fehlgeschlagen'
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: 'error' as const, error: message }
            : f
        )
      )
      toast.error(`Fehler beim Upload von "${uploadFile.file.name}": ${message}`)
    },
    onSuccess: (_, uploadFile) => {
      toast.success(`"${uploadFile.file.name}" erfolgreich hochgeladen`)
      queryClient.invalidateQueries({ queryKey: ['bescheid-boxer'] })
    },
  })

  const handleUploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) {
      toast.info('Keine Dateien zum Hochladen vorhanden')
      return
    }

    for (const file of pendingFiles) {
      await uploadMutation.mutateAsync(file)
    }
  }

  const allDone = files.length > 0 && files.every((f) => f.status === 'success')
  const hasUploading = files.some((f) => f.status === 'uploading')
  const hasPending = files.some((f) => f.status === 'pending')

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Bescheide hochladen</h1>
        <p className="text-muted-foreground">
          Lade deine Steuerbescheide als PDF oder Bild hoch, um sie analysieren zu lassen.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-red-50 p-4 dark:bg-red-950">
            <FileUp className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            Dateien hierher ziehen
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            oder klicken, um Dateien auszuwählen
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            PDF, JPG, PNG, WebP, TIFF — maximal 20 MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </CardContent>
      </Card>

      {/* Dateiliste */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {files.length} {files.length === 1 ? 'Datei' : 'Dateien'} ausgewählt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <File className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                  {uploadFile.status === 'uploading' && (
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-500 transition-all duration-300"
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                  )}
                  {uploadFile.status === 'error' && (
                    <p className="mt-1 text-xs text-destructive">{uploadFile.error}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {uploadFile.status === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {(uploadFile.status === 'pending' || uploadFile.status === 'error') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(uploadFile.id)
                      }}
                      className="rounded p-1 hover:bg-muted"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleUploadAll}
                disabled={!hasPending || hasUploading}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                {hasUploading ? 'Wird hochgeladen...' : 'Alle hochladen'}
              </Button>
              {allDone && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/documents')}
                >
                  Zu meinen Bescheiden
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
