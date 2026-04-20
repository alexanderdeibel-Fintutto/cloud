import { useState, useRef } from 'react'
import {
  Upload, Search, FileText, CheckCircle, Clock, Zap,
  AlertCircle, Eye, Trash2, RotateCcw, ExternalLink,
  Brain, FileImage, File, X
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useFcDocuments,
  useUploadFcDocument,
  useDeleteFcDocument,
  useTriggerFcOcr,
  getFcDocumentUrl,
  type FcDocument,
} from '@/hooks/useFcDocuments'

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// ── Status-Badge ─────────────────────────────────────────────────────────────

function OcrStatusBadge({ status }: { status: FcDocument['ocr_status'] }) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
          <CheckCircle className="h-3 w-3" />OCR fertig
        </span>
      )
    case 'pending':
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 animate-pulse">
          <Zap className="h-3 w-3" />OCR läuft…
        </span>
      )
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
          <AlertCircle className="h-3 w-3" />Fehler
        </span>
      )
    case 'skipped':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
          <Clock className="h-3 w-3" />Kein OCR
        </span>
      )
  }
}

// ── Datei-Icon ───────────────────────────────────────────────────────────────

function FileIcon({ type }: { type: FcDocument['file_type'] }) {
  if (type === 'image') return <FileImage className="h-4 w-4 text-purple-400" />
  if (type === 'pdf') return <FileText className="h-4 w-4 text-red-400" />
  return <File className="h-4 w-4 text-gray-400" />
}

// ── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function Belege() {
  const [search, setSearch] = useState('')
  const [dragging, setDragging] = useState(false)
  const [enableOcr, setEnableOcr] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<FcDocument | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: docs = [], isLoading, error } = useFcDocuments({ search })
  const upload = useUploadFcDocument()
  const deleteMutation = useDeleteFcDocument()
  const triggerOcr = useTriggerFcOcr()

  // ── Upload-Handler ───────────────────────────────────────────────────────

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    // Größenprüfung (max 10 MB pro Datei)
    const oversized = fileArray.filter(f => f.size > 10 * 1024 * 1024)
    if (oversized.length > 0) {
      toast.error(`${oversized.length} Datei(en) überschreiten 10 MB und wurden übersprungen.`)
    }
    const valid = fileArray.filter(f => f.size <= 10 * 1024 * 1024)
    if (valid.length === 0) return

    try {
      const result = await upload.mutateAsync({ files: valid, enableOcr })
      toast.success(
        `${result.length} Beleg(e) hochgeladen.${enableOcr ? ' OCR wird gestartet…' : ''}`
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
      toast.error(`Upload fehlgeschlagen: ${message}`)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  // ── Vorschau ─────────────────────────────────────────────────────────────

  async function openPreview(doc: FcDocument) {
    setPreviewDoc(doc)
    setPreviewUrl(null)
    const url = await getFcDocumentUrl(doc.storage_path)
    setPreviewUrl(url)
  }

  // ── Löschen ──────────────────────────────────────────────────────────────

  async function handleDelete(doc: FcDocument) {
    if (!confirm(`"${doc.title}" wirklich löschen?`)) return
    try {
      await deleteMutation.mutateAsync(doc)
      toast.success('Beleg gelöscht.')
    } catch {
      toast.error('Löschen fehlgeschlagen.')
    }
  }

  // ── OCR manuell auslösen ─────────────────────────────────────────────────

  async function handleTriggerOcr(doc: FcDocument) {
    try {
      await triggerOcr.mutateAsync(doc)
      toast.success('OCR gestartet.')
    } catch {
      toast.error('OCR konnte nicht gestartet werden.')
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Belege & OCR</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Belege hochladen · KI-Texterkennung · Verknüpft mit SecondBrain
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <Brain className="h-3.5 w-3.5 text-emerald-500" />
          <span>Powered by SecondBrain OCR</span>
        </div>
      </div>

      {/* Upload-Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
          dragging
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff"
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
        <Upload className={`h-10 w-10 mx-auto mb-3 ${dragging ? 'text-emerald-400' : 'text-gray-300'}`} />
        <p className="font-medium text-gray-700">
          {upload.isPending ? 'Wird hochgeladen…' : 'Belege hier ablegen oder klicken'}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          PDF, JPG, PNG, WEBP bis 10 MB · Mehrere Dateien gleichzeitig möglich
        </p>
      </div>

      {/* OCR-Toggle */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer select-none transition-colors ${
          enableOcr
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        onClick={() => setEnableOcr(v => !v)}
        role="checkbox"
        aria-checked={enableOcr}
        tabIndex={0}
        onKeyDown={e => e.key === ' ' && setEnableOcr(v => !v)}
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          enableOcr ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'
        }`}>
          {enableOcr && <CheckCircle className="h-3 w-3 text-white" />}
        </div>
        <Brain className={`h-4 w-4 ${enableOcr ? 'text-emerald-600' : 'text-gray-400'}`} />
        <div>
          <p className={`text-sm font-medium ${enableOcr ? 'text-emerald-700' : 'text-gray-700'}`}>
            {enableOcr ? 'KI-Texterkennung aktiv' : 'KI-Texterkennung aktivieren'}
          </p>
          <p className="text-xs text-gray-400">
            {enableOcr
              ? 'Betrag, Datum und Lieferant werden automatisch erkannt (~€0.02/Seite)'
              : 'Beleg wird ohne OCR gespeichert — jederzeit nachholbar'}
          </p>
        </div>
      </div>

      {/* Suche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Suche nach Dateiname, Lieferant, OCR-Text…"
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabelle */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Belege werden geladen…</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm">
          Fehler beim Laden: {(error as Error).message}
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="font-medium text-gray-500">Noch keine Belege</p>
          <p className="text-sm mt-1">Laden Sie Ihren ersten Beleg hoch</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datei</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Größe</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hochgeladen</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">OCR-Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Erkannter Text</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileIcon type={doc.file_type} />
                      <div>
                        <p className="text-gray-800 font-medium truncate max-w-48">{doc.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-48">{doc.file_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatBytes(doc.file_size)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(doc.created_at)}</td>
                  <td className="px-4 py-3">
                    <OcrStatusBadge status={doc.ocr_status} />
                  </td>
                  <td className="px-4 py-3">
                    {doc.ocr_text ? (
                      <p className="text-xs text-gray-600 truncate max-w-56" title={doc.ocr_text}>
                        {doc.ocr_text.slice(0, 80)}…
                      </p>
                    ) : doc.summary ? (
                      <p className="text-xs text-gray-500 italic truncate max-w-56">{doc.summary}</p>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Vorschau */}
                      <button
                        onClick={() => openPreview(doc)}
                        title="Vorschau"
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* OCR manuell auslösen */}
                      {(doc.ocr_status === 'skipped' || doc.ocr_status === 'failed') && (
                        <button
                          onClick={() => handleTriggerOcr(doc)}
                          title="OCR starten"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          disabled={triggerOcr.isPending}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      {/* In SecondBrain öffnen */}
                      <a
                        href={`/secondbrain/documents/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="In SecondBrain öffnen"
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      {/* Löschen */}
                      <button
                        onClick={() => handleDelete(doc)}
                        title="Löschen"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vorschau-Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => { setPreviewDoc(null); setPreviewUrl(null) }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal-Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileIcon type={previewDoc.file_type} />
                <div>
                  <p className="font-semibold text-gray-900">{previewDoc.title}</p>
                  <p className="text-xs text-gray-400">{previewDoc.file_name} · {formatBytes(previewDoc.file_size)}</p>
                </div>
              </div>
              <button
                onClick={() => { setPreviewDoc(null); setPreviewUrl(null) }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal-Body */}
            <div className="flex-1 overflow-auto p-5 space-y-4">
              {/* OCR-Text */}
              {previewDoc.ocr_text && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                    <Brain className="h-3.5 w-3.5" />KI-Texterkennung
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {previewDoc.ocr_text}
                  </p>
                </div>
              )}

              {/* Zusammenfassung */}
              {previewDoc.summary && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 mb-1">KI-Zusammenfassung</p>
                  <p className="text-sm text-gray-700">{previewDoc.summary}</p>
                </div>
              )}

              {/* Datei-Vorschau */}
              {previewUrl ? (
                previewDoc.file_type === 'image' ? (
                  <img
                    src={previewUrl}
                    alt={previewDoc.title}
                    className="w-full rounded-xl border border-gray-200 object-contain max-h-96"
                  />
                ) : previewDoc.file_type === 'pdf' ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-96 rounded-xl border border-gray-200"
                    title={previewDoc.title}
                  />
                ) : (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />Datei herunterladen
                  </a>
                )
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">Vorschau wird geladen…</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
