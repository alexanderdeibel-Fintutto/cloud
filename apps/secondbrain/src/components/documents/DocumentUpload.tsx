import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, File, X, Loader2, Brain, Info, Lock, Zap } from 'lucide-react'
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
  // Tier-Gating Props
  tierSupportsOcr?: boolean
  ocrLimit?: number
  ocrUsed?: number
  ocrRemaining?: number
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
  tierSupportsOcr = false,
  ocrLimit = 0,
  ocrUsed = 0,
  ocrRemaining = 0,
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

  // Kontingent-Prozent für Fortschrittsanzeige
  const usagePercent = ocrLimit > 0 ? Math.min(100, Math.round((ocrUsed / ocrLimit) * 100)) : 0
  const isNearLimit = ocrLimit > 0 && ocrRemaining <= 10 && ocrRemaining > 0
  const isAtLimit = ocrLimit > 0 && ocrRemaining === 0

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
        <div className="space-y-2">
          {/* Toggle Box */}
          <div
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border transition-colors select-none',
              !tierSupportsOcr
                ? 'border-border bg-muted/20 opacity-75 cursor-not-allowed'
                : isAtLimit
                ? 'border-destructive/30 bg-destructive/5 cursor-not-allowed'
                : 'cursor-pointer',
              tierSupportsOcr && !isAtLimit && enableOcr
                ? 'border-primary/40 bg-primary/5'
                : tierSupportsOcr && !isAtLimit
                ? 'border-border bg-muted/30 hover:bg-muted/50'
                : ''
            )}
            onClick={() => {
              if (tierSupportsOcr && !isAtLimit) onOcrToggle(!enableOcr)
            }}
            role="checkbox"
            aria-checked={enableOcr}
            aria-disabled={!tierSupportsOcr || isAtLimit}
            tabIndex={tierSupportsOcr && !isAtLimit ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === ' ' && tierSupportsOcr && !isAtLimit) onOcrToggle(!enableOcr)
            }}
          >
            {/* Custom Checkbox / Lock Icon */}
            <div
              className={cn(
                'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                !tierSupportsOcr || isAtLimit
                  ? 'border-muted-foreground/30 bg-muted/50'
                  : enableOcr
                  ? 'bg-primary border-primary'
                  : 'border-muted-foreground/40 bg-background'
              )}
            >
              {!tierSupportsOcr || isAtLimit ? (
                <Lock className="w-2.5 h-2.5 text-muted-foreground/50" />
              ) : enableOcr ? (
                <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Brain className={cn(
                  'w-4 h-4',
                  !tierSupportsOcr || isAtLimit ? 'text-muted-foreground/50' : enableOcr ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'text-sm font-medium',
                  !tierSupportsOcr || isAtLimit ? 'text-muted-foreground/60' : enableOcr ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  KI-Texterkennung (OCR)
                  {!tierSupportsOcr && (
                    <span className="ml-2 text-[10px] font-normal text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Pro erforderlich
                    </span>
                  )}
                  {isAtLimit && (
                    <span className="ml-2 text-[10px] font-normal text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                      Kontingent erschöpft
                    </span>
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {!tierSupportsOcr
                  ? 'OCR ist im SecondBrain Pro-Paket enthalten. Upgrade für KI-Texterkennung.'
                  : isAtLimit
                  ? `Monatliches Kontingent (${ocrLimit} Seiten) erreicht. Erneuert sich am 1. des Folgemonats.`
                  : enableOcr
                  ? 'Text wird aus PDFs und Bildern extrahiert und für die Volltextsuche indexiert.'
                  : 'Dokument wird ohne Textanalyse gespeichert — schneller und kostengünstiger.'}
              </p>
            </div>

            {/* Info-Badge oder Kontingent */}
            <div className="flex items-center gap-1 shrink-0">
              {tierSupportsOcr && ocrLimit > 0 ? (
                <span className={cn(
                  'text-[10px] font-mono px-1.5 py-0.5 rounded',
                  isAtLimit
                    ? 'text-destructive bg-destructive/10'
                    : isNearLimit
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-muted-foreground/60 bg-muted/50'
                )}>
                  {ocrRemaining === 9999 ? '∞' : ocrRemaining}/{ocrLimit === -1 ? '∞' : ocrLimit}
                </span>
              ) : tierSupportsOcr ? (
                <span className="text-[10px] text-muted-foreground/60 font-mono">∞</span>
              ) : (
                <div className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/40 font-mono">~€0.02/S.</span>
                </div>
              )}
            </div>
          </div>

          {/* Kontingent-Fortschrittsbalken (nur für Pro-Nutzer) */}
          {tierSupportsOcr && ocrLimit > 0 && (
            <div className="px-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-muted-foreground">OCR-Kontingent diesen Monat</span>
                <span className={cn(
                  'text-[10px] font-medium',
                  isAtLimit ? 'text-destructive' : isNearLimit ? 'text-amber-500' : 'text-muted-foreground'
                )}>
                  {ocrUsed} / {ocrLimit} Seiten
                </span>
              </div>
              <Progress
                value={usagePercent}
                className={cn(
                  'h-1.5',
                  isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-amber-500' : ''
                )}
              />
            </div>
          )}

          {/* Upgrade-Hinweis für Free-Nutzer */}
          {!tierSupportsOcr && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-medium">SecondBrain Pro — €9.99/Monat</p>
                <p className="text-[11px] text-muted-foreground">100 OCR-Seiten/Monat, Volltextsuche, KI-Zusammenfassungen</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 text-xs border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                onClick={() => window.location.href = '/pricing'}
              >
                Upgrade
              </Button>
            </div>
          )}
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
