import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, File, X, Loader2, Brain, Info } from 'lucide-react'
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
  onUpload: (files: File[], enableOcr: boolean) => Promise<void>
  enableOcr?: boolean
  onOcrToggle?: (enabled: boolean) => void
  maxFiles?: number
  maxSize?: number
}

const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  image: Image,
  text: FileText,
  other: File,
}

export default function DocumentUpload({
  onUpload,
  enableOcr = false,
  onOcrToggle,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024,
}: DocumentUploadProps) {
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
      await onUpload(filesToUpload, enableOcr)
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

      {/* OCR-Option Toggle */}
      {onOcrToggle && (
        <div
          className={cn(
            'flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer select-none',
            enableOcr
              ? 'border-primary/40 bg-primary/5'
              : 'border-border bg-muted/30 hover:bg-muted/50'
          )}
          onClick={() => onOcrToggle(!enableOcr)}
          role="checkbox"
          aria-checked={enableOcr}
          tabIndex={0}
          onKeyDown={(e) => e.key === ' ' && onOcrToggle(!enableOcr)}
        >
          {/* Custom Checkbox */}
          <div
            className={cn(
              'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
              enableOcr
                ? 'bg-primary border-primary'
                : 'border-muted-foreground/40 bg-background'
            )}
          >
            {enableOcr && (
              <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Brain className={cn('w-4 h-4', enableOcr ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-sm font-medium', enableOcr ? 'text-foreground' : 'text-muted-foreground')}>
                KI-Texterkennung (OCR) aktivieren
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {enableOcr
                ? 'Text wird aus PDFs und Bildern extrahiert und für die Volltextsuche indexiert.'
                : 'Dokument wird ohne Textanalyse gespeichert — schneller und kostengünstiger.'}
            </p>
          </div>

          {/* Info-Badge */}
          <div className="flex items-center gap-1 shrink-0">
            <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="text-[10px] text-muted-foreground/60 font-mono">
              ~€0.02/Seite
            </span>
          </div>
        </div>
      )}

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
                {enableOcr && (
                  <span className="ml-2 text-xs opacity-70">+ OCR</span>
                )}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
