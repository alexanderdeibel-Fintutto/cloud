/**
 * @fintutto/shared — BulkDocumentUpload
 *
 * Bulk-Upload-Komponente für mehrere Dokumente gleichzeitig.
 * Unterstützt: Drag & Drop, Datei-Picker, E-Mail-Weiterleitung (QR-Code).
 *
 * Verwendung:
 * - Financial Compass: Belege, Rechnungen, Kontoauszüge
 * - Vermietify: Mietverträge, Übergabeprotokolle, Rechnungen
 */
import { useState, useCallback, useRef } from 'react'
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, Mail, QrCode } from 'lucide-react'

export interface UploadFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'analyzing' | 'done' | 'error'
  progress: number
  error?: string
  result?: {
    document_type?: string
    amount?: number
    date?: string
    description?: string
    url?: string
  }
}

interface BulkDocumentUploadProps {
  /** Kontext-ID (company_id oder organization_id) */
  contextId: string
  /** Kontext-Typ für KI-Analyse-Hinweise */
  contextType: 'company' | 'organization'
  /** Callback nach erfolgreichem Upload aller Dateien */
  onComplete?: (files: UploadFile[]) => void
  /** Erlaubte Dateitypen */
  accept?: string
  /** Maximale Dateigröße in MB */
  maxSizeMB?: number
  /** Upload-Handler (wird von der App bereitgestellt) */
  onUpload: (file: File, contextId: string) => Promise<{ url: string; document_type?: string; amount?: number; date?: string; description?: string }>
  /** E-Mail-Adresse für E-Mail-Upload (optional) */
  emailInbox?: string
}

const MAX_FILES = 20

export function BulkDocumentUpload({
  contextId,
  contextType,
  onComplete,
  accept = '.pdf,.jpg,.jpeg,.png,.webp,.heic',
  maxSizeMB = 10,
  onUpload,
  emailInbox,
}: BulkDocumentUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showEmailInfo, setShowEmailInfo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((newFiles: File[]) => {
    const valid = newFiles
      .filter(f => f.size <= maxSizeMB * 1024 * 1024)
      .slice(0, MAX_FILES - files.length)

    const uploadFiles: UploadFile[] = valid.map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      status: 'pending',
      progress: 0,
    }))

    setFiles(prev => [...prev, ...uploadFiles])
  }, [files.length, maxSizeMB])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }, [addFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
      e.target.value = ''
    }
  }, [addFiles])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const uploadAll = useCallback(async () => {
    const pending = files.filter(f => f.status === 'pending')
    if (!pending.length) return

    setIsUploading(true)

    for (const uploadFile of pending) {
      // Status: uploading
      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 20 } : f
      ))

      try {
        // Status: analyzing
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'analyzing', progress: 60 } : f
        ))

        const result = await onUpload(uploadFile.file, contextId)

        // Status: done
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'done', progress: 100, result } : f
        ))
      } catch (error) {
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? {
            ...f,
            status: 'error',
            progress: 0,
            error: error instanceof Error ? error.message : 'Upload fehlgeschlagen',
          } : f
        ))
      }
    }

    setIsUploading(false)
    const completed = files.filter(f => f.status === 'done')
    if (onComplete && completed.length > 0) {
      onComplete(completed)
    }
  }, [files, contextId, onUpload, onComplete])

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const pendingCount = files.filter(f => f.status === 'pending').length
  const doneCount = files.filter(f => f.status === 'done').length
  const errorCount = files.filter(f => f.status === 'error').length

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload className={`h-10 w-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="font-medium mb-1">
          {isDragging ? 'Dateien hier ablegen' : 'Dateien hierher ziehen oder klicken'}
        </p>
        <p className="text-sm text-muted-foreground">
          PDF, JPG, PNG, HEIC — bis zu {maxSizeMB} MB pro Datei, max. {MAX_FILES} Dateien
        </p>
        {contextType === 'company' && (
          <p className="text-xs text-muted-foreground mt-1">
            KI erkennt automatisch: Betrag, Datum, Kategorie (Rechnung/Beleg/Kontoauszug)
          </p>
        )}
        {contextType === 'organization' && (
          <p className="text-xs text-muted-foreground mt-1">
            KI erkennt automatisch: Mietvertrag, Protokoll, Rechnung, Energieausweis
          </p>
        )}
      </div>

      {/* E-Mail-Upload Option */}
      {emailInbox && (
        <button
          onClick={() => setShowEmailInfo(!showEmailInfo)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
        >
          <Mail className="h-4 w-4" />
          Belege per E-Mail einsenden
          {showEmailInfo ? ' ▲' : ' ▼'}
        </button>
      )}

      {showEmailInfo && emailInbox && (
        <div className="glass rounded-xl p-4 text-sm space-y-2">
          <div className="flex items-start gap-3">
            <QrCode className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">E-Mail-Eingang aktiv</p>
              <p className="text-muted-foreground">
                Leite Rechnungen und Belege direkt an{' '}
                <span className="font-mono text-primary">{emailInbox}</span> weiter.
                Die KI liest Betrag, Datum und Kategorie automatisch aus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Datei-Liste */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{files.length} Datei{files.length !== 1 ? 'en' : ''}</span>
            <span>
              {doneCount > 0 && <span className="text-success">{doneCount} erfolgreich</span>}
              {errorCount > 0 && <span className="text-destructive ml-2">{errorCount} Fehler</span>}
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {files.map((f) => (
              <div key={f.id} className="glass rounded-lg p-3 flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatSize(f.file.size)}</span>
                    {f.status === 'uploading' && (
                      <span className="text-xs text-primary flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Wird hochgeladen...
                      </span>
                    )}
                    {f.status === 'analyzing' && (
                      <span className="text-xs text-primary flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> KI analysiert...
                      </span>
                    )}
                    {f.status === 'done' && f.result && (
                      <span className="text-xs text-success">
                        {f.result.document_type && `${f.result.document_type}`}
                        {f.result.amount && ` · ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(f.result.amount)}`}
                      </span>
                    )}
                    {f.status === 'error' && (
                      <span className="text-xs text-destructive">{f.error}</span>
                    )}
                  </div>
                  {(f.status === 'uploading' || f.status === 'analyzing') && (
                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {f.status === 'done' && <CheckCircle2 className="h-5 w-5 text-success" />}
                  {f.status === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
                  {(f.status === 'pending' || f.status === 'uploading' || f.status === 'analyzing') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                      className="p-1 hover:bg-accent rounded-md transition-colors"
                      disabled={f.status !== 'pending'}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload-Button */}
          {pendingCount > 0 && (
            <button
              onClick={uploadAll}
              disabled={isUploading}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wird verarbeitet...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {pendingCount} Datei{pendingCount !== 1 ? 'en' : ''} hochladen & analysieren
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
