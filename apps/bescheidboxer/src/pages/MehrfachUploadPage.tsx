import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  Image,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Eye,
  FolderUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { useToast } from '../hooks/use-toast'
import { useBescheidContext } from '../contexts/BescheidContext'
import { useConfetti } from '../hooks/use-confetti'

interface QueuedFile {
  id: string
  file: File
  preview: string | null
  status: 'queued' | 'uploading' | 'processing' | 'done' | 'error'
  progress: number
  detectedTyp?: string
  detectedJahr?: string
  error?: string
}

const MAX_FILES = 20
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function MehrfachUploadPage() {
  const [files, setFiles] = useState<QueuedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { createBescheid } = useBescheidContext()
  const fireConfetti = useConfetti()

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)

    setFiles(prev => {
      const remaining = MAX_FILES - prev.length
      if (remaining <= 0) {
        toast({
          title: 'Maximum erreicht',
          description: `Maximal ${MAX_FILES} Dateien gleichzeitig.`,
          variant: 'destructive',
        })
        return prev
      }

      const toAdd = fileArray.slice(0, remaining)
      const newQueued: QueuedFile[] = toAdd
        .filter(f => {
          if (f.size > MAX_FILE_SIZE) {
            toast({
              title: 'Datei zu gross',
              description: `${f.name} ueberschreitet 20 MB.`,
              variant: 'destructive',
            })
            return false
          }
          const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
          if (!validTypes.includes(f.type)) {
            toast({
              title: 'Ungueltig',
              description: `${f.name} ist kein unterstuetztes Format.`,
              variant: 'destructive',
            })
            return false
          }
          return true
        })
        .map(f => {
          const queued: QueuedFile = {
            id: generateId(),
            file: f,
            preview: null,
            status: 'queued',
            progress: 0,
          }

          // Generate preview for images
          if (f.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
              setFiles(current =>
                current.map(qf =>
                  qf.id === queued.id ? { ...qf, preview: e.target?.result as string } : qf
                )
              )
            }
            reader.readAsDataURL(f)
          }

          return queued
        })

      if (toAdd.length < fileArray.length) {
        toast({
          title: 'Teilweise hinzugefuegt',
          description: `${toAdd.length} von ${fileArray.length} Dateien hinzugefuegt (Maximum: ${MAX_FILES}).`,
        })
      }

      return [...prev, ...newQueued]
    })
  }, [toast])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
      e.target.value = ''
    }
  }, [addFiles])

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const clearAll = () => {
    setFiles([])
  }

  const simulateProcessing = async (qf: QueuedFile): Promise<QueuedFile> => {
    // Simulate upload
    for (let p = 0; p <= 50; p += 10 + Math.random() * 15) {
      await new Promise(r => setTimeout(r, 150 + Math.random() * 200))
      setFiles(prev =>
        prev.map(f => f.id === qf.id ? { ...f, status: 'uploading' as const, progress: Math.min(p, 50) } : f)
      )
    }

    setFiles(prev =>
      prev.map(f => f.id === qf.id ? { ...f, status: 'processing', progress: 50 } : f)
    )

    // Simulate OCR/analysis
    for (let p = 50; p <= 100; p += 8 + Math.random() * 12) {
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300))
      setFiles(prev =>
        prev.map(f => f.id === qf.id ? { ...f, progress: Math.min(p, 100) } : f)
      )
    }

    // Simulate auto-detection
    const types = ['einkommensteuer', 'gewerbesteuer', 'umsatzsteuer', 'grundsteuer']
    const years = ['2024', '2023', '2022']
    const detectedTyp = types[Math.floor(Math.random() * types.length)]
    const detectedJahr = years[Math.floor(Math.random() * years.length)]

    // Create Bescheid
    const typLabel = detectedTyp.charAt(0).toUpperCase() + detectedTyp.slice(1)
    await createBescheid({
      titel: `${typLabel} ${detectedJahr}`,
      typ: detectedTyp as 'einkommensteuer' | 'gewerbesteuer' | 'umsatzsteuer' | 'grundsteuer',
      steuerjahr: parseInt(detectedJahr),
      finanzamt: 'Automatisch erkannt',
    })

    setFiles(prev =>
      prev.map(f =>
        f.id === qf.id
          ? { ...f, status: 'done', progress: 100, detectedTyp, detectedJahr }
          : f
      )
    )

    return { ...qf, status: 'done', progress: 100, detectedTyp, detectedJahr }
  }

  const processAll = async () => {
    const queued = files.filter(f => f.status === 'queued')
    if (queued.length === 0) return

    setIsProcessing(true)

    let successCount = 0
    let errorCount = 0

    for (const qf of queued) {
      try {
        await simulateProcessing(qf)
        successCount++
      } catch {
        setFiles(prev =>
          prev.map(f =>
            f.id === qf.id
              ? { ...f, status: 'error', error: 'Verarbeitung fehlgeschlagen', progress: 0 }
              : f
          )
        )
        errorCount++
      }
    }

    setIsProcessing(false)

    if (successCount > 0) {
      fireConfetti()
      toast({
        title: `${successCount} Bescheid${successCount > 1 ? 'e' : ''} hochgeladen`,
        description: errorCount > 0
          ? `${errorCount} Fehler aufgetreten.`
          : 'Alle Bescheide wurden erfolgreich verarbeitet.',
      })
    }
  }

  const queuedCount = files.filter(f => f.status === 'queued').length
  const doneCount = files.filter(f => f.status === 'done').length
  const errorCount = files.filter(f => f.status === 'error').length
  const processingCount = files.filter(f => f.status === 'uploading' || f.status === 'processing').length
  const overallProgress = files.length > 0
    ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)
    : 0

  const getStatusIcon = (status: QueuedFile['status']) => {
    switch (status) {
      case 'queued': return <FolderUp className="h-4 w-4 text-muted-foreground" />
      case 'uploading': return <Loader2 className="h-4 w-4 animate-spin text-fintutto-blue-500" />
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
      case 'done': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusLabel = (status: QueuedFile['status']) => {
    switch (status) {
      case 'queued': return 'Wartend'
      case 'uploading': return 'Hochladen...'
      case 'processing': return 'Analysieren...'
      case 'done': return 'Fertig'
      case 'error': return 'Fehler'
    }
  }

  const getStatusBadge = (status: QueuedFile['status']) => {
    const variant = {
      queued: 'secondary' as const,
      uploading: 'default' as const,
      processing: 'warning' as const,
      done: 'success' as const,
      error: 'destructive' as const,
    }[status]
    return <Badge variant={variant} className="text-[10px]">{getStatusLabel(status)}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mehrfach-Upload</h1>
          <p className="text-muted-foreground mt-1">
            Laden Sie bis zu {MAX_FILES} Bescheide gleichzeitig hoch
          </p>
        </div>
        <div className="flex gap-2">
          {files.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={clearAll} disabled={isProcessing}>
                <Trash2 className="h-4 w-4 mr-1" />
                Alle entfernen
              </Button>
              <Button
                size="sm"
                onClick={processAll}
                disabled={isProcessing || queuedCount === 0}
                className="gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isProcessing
                  ? `Verarbeite ${processingCount}...`
                  : `${queuedCount} hochladen`
                }
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Drop Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragOver
                ? 'border-fintutto-blue-500 bg-fintutto-blue-50 dark:bg-fintutto-blue-950/30'
                : 'border-border hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              multiple
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-4">
                <FolderUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">Dateien hierher ziehen</p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, JPG, PNG oder WebP &middot; max. 20 MB pro Datei
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 mt-2"
                onClick={() => inputRef.current?.click()}
              >
                <Plus className="h-4 w-4" />
                Dateien auswaehlen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      {files.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Gesamtfortschritt</span>
                <div className="flex gap-2 text-xs">
                  {queuedCount > 0 && (
                    <Badge variant="secondary">{queuedCount} wartend</Badge>
                  )}
                  {processingCount > 0 && (
                    <Badge variant="default">{processingCount} aktiv</Badge>
                  )}
                  {doneCount > 0 && (
                    <Badge variant="success">{doneCount} fertig</Badge>
                  )}
                  {errorCount > 0 && (
                    <Badge variant="destructive">{errorCount} Fehler</Badge>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold">
                {doneCount} / {files.length}
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((qf) => (
            <Card key={qf.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {/* Preview / Icon */}
                  <div className="shrink-0">
                    {qf.preview ? (
                      <img
                        src={qf.preview}
                        alt="Vorschau"
                        className="h-12 w-12 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        {qf.file.type === 'application/pdf' ? (
                          <FileText className="h-5 w-5 text-red-500" />
                        ) : (
                          <Image className="h-5 w-5 text-fintutto-blue-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{qf.file.name}</p>
                      {getStatusBadge(qf.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(qf.file.size)}
                      </span>
                      {qf.detectedTyp && (
                        <>
                          <span className="text-xs text-muted-foreground">&middot;</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {qf.detectedTyp} {qf.detectedJahr}
                          </span>
                        </>
                      )}
                      {qf.error && (
                        <span className="text-xs text-red-500">{qf.error}</span>
                      )}
                    </div>

                    {/* Progress bar for active files */}
                    {(qf.status === 'uploading' || qf.status === 'processing') && (
                      <div className="mt-1.5">
                        <Progress value={qf.progress} className="h-1" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {getStatusIcon(qf.status)}
                    {qf.status === 'queued' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeFile(qf.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {qf.status === 'done' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => navigate('/bescheide')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {files.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Keine Dateien ausgewaehlt</p>
              <p className="text-sm mt-1">
                Ziehen Sie Dateien in den Bereich oben oder klicken Sie auf &ldquo;Dateien auswaehlen&rdquo;
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All done banner */}
      {files.length > 0 && doneCount === files.length && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Alle {doneCount} Bescheide erfolgreich hochgeladen!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Die KI-Analyse wurde fuer alle Bescheide gestartet.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearAll}>
                  Weitere hochladen
                </Button>
                <Button onClick={() => navigate('/bescheide')}>
                  Zu den Bescheiden
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipps fuer den Mehrfach-Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2 shrink-0">
                <FileText className="h-4 w-4 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">PDF bevorzugt</p>
                <p className="text-xs text-muted-foreground">
                  PDFs liefern die beste OCR-Qualitaet und schnellere Verarbeitung.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2 shrink-0">
                <Image className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Gute Qualitaet</p>
                <p className="text-xs text-muted-foreground">
                  Bei Fotos auf gute Beleuchtung und scharfe Aufnahmen achten.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2 shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Auto-Erkennung</p>
                <p className="text-xs text-muted-foreground">
                  Bescheidtyp und Steuerjahr werden automatisch erkannt.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
