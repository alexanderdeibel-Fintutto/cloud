import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, File, X, Loader2 } from 'lucide-react'
import { cn, formatFileSize, getFileType } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

interface DocumentUploadProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  maxSize?: number
}

const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  image: Image,
  text: FileText,
  other: File,
}

export default function DocumentUpload({ onUpload, maxFiles = 10, maxSize = 50 * 1024 * 1024 }: DocumentUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).slice(2),
      progress: 0,
      status: 'pending' as const,
    }))
    setUploadFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'text/*': ['.txt', '.md', '.csv'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  })

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return
    setIsUploading(true)

    const filesToUpload = uploadFiles.filter((f) => f.status === 'pending').map((f) => f.file)

    // Simulate progress
    for (const uf of uploadFiles) {
      if (uf.status !== 'pending') continue
      setUploadFiles((prev) =>
        prev.map((f) => (f.id === uf.id ? { ...f, status: 'uploading' as const, progress: 30 } : f))
      )
    }

    try {
      await onUpload(filesToUpload)
      setUploadFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'complete' as const, progress: 100 }))
      )
      setTimeout(() => setUploadFiles([]), 2000)
    } catch {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading' ? { ...f, status: 'error' as const, error: 'Upload fehlgeschlagen' } : f
        )
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn('upload-zone cursor-pointer', isDragActive && 'upload-zone-active')}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload className={cn('w-8 h-8 text-primary transition-transform', isDragActive && 'scale-110')} />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {isDragActive ? 'Dateien hier ablegen' : 'Dokumente hochladen'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, Bilder, Text-Dateien — Drag & Drop oder Klick
            </p>
          </div>
          <Button variant="outline" size="sm" type="button">
            Dateien auswählen
          </Button>
        </div>
      </div>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <div className="space-y-2">
          {uploadFiles.map((uf) => {
            const type = getFileType(uf.file.name)
            const Icon = fileTypeIcons[type] || File
            return (
              <div
                key={uf.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uf.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(uf.file.size)}</p>
                  {uf.status === 'uploading' && <Progress value={uf.progress} className="mt-1 h-1" />}
                  {uf.status === 'error' && (
                    <p className="text-xs text-destructive mt-1">{uf.error}</p>
                  )}
                </div>
                {uf.status === 'uploading' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : uf.status === 'complete' ? (
                  <span className="text-xs text-success font-medium">Fertig</span>
                ) : (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile(uf.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )
          })}

          <Button onClick={handleUpload} disabled={isUploading} className="w-full" variant="glow">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird hochgeladen...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {uploadFiles.length} {uploadFiles.length === 1 ? 'Datei' : 'Dateien'} hochladen
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
