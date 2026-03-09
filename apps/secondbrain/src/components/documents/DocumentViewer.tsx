import { useState } from 'react'
import {
  X, Download, Star, Tag, Clock, FileText, Brain, FolderOpen, RefreshCw, Plus,
  AlertTriangle, Edit3, Check, Building2, ArrowRight, CalendarClock, Save, Receipt, Mail, Printer, Share2, Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type Document, type CollectionInfo } from './DocumentCard'
import { formatRelativeTime, formatFileSize } from '@/lib/utils'
import { supabase } from '@/integrations/supabase'
import { DOCUMENT_TYPES, DOCUMENT_STATUS, TARGET_APPS, getSmartRouting } from '@/hooks/useWorkflows'
import { toast } from 'sonner'

interface DocumentViewerProps {
  document: Document
  onClose: () => void
  onFavorite: (doc: Document) => void
  onAddToCollection?: (doc: Document, collectionId: string) => void
  collections?: CollectionInfo[]
  companies?: Array<{ id: string; name: string; color: string }>
}

export default function DocumentViewer({
  document: doc,
  onClose,
  onFavorite,
  onAddToCollection,
  collections = [],
  companies = [],
}: DocumentViewerProps) {
  const [newTag, setNewTag] = useState('')
  const [tags, setTags] = useState<string[]>(doc.tags)
  const [isRetryingOcr, setIsRetryingOcr] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(doc.title)
  const [notes, setNotes] = useState(doc.notes || '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [notesChanged, setNotesChanged] = useState(false)

  const handleSaveTitle = async () => {
    const title = editTitle.trim()
    if (!title || title === doc.title) {
      setIsEditingTitle(false)
      return
    }
    const { error } = await supabase
      .from('sb_documents')
      .update({ title })
      .eq('id', doc.id)

    if (error) {
      toast.error('Fehler beim Umbenennen')
      setEditTitle(doc.title)
    } else {
      doc.title = title
    }
    setIsEditingTitle(false)
  }

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('secondbrain-docs')
        .download(doc.storage_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.title + '.' + doc.storage_path.split('.').pop()
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Download fehlgeschlagen')
    }
  }

  const handleAddTag = async () => {
    const tag = newTag.trim()
    if (!tag || tags.includes(tag)) return

    const updatedTags = [...tags, tag]
    setTags(updatedTags)
    setNewTag('')

    const { error } = await supabase
      .from('sb_documents')
      .update({ tags: updatedTags })
      .eq('id', doc.id)

    if (error) {
      toast.error('Fehler beim Speichern')
      setTags(tags)
    }
  }

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove)
    setTags(updatedTags)

    const { error } = await supabase
      .from('sb_documents')
      .update({ tags: updatedTags })
      .eq('id', doc.id)

    if (error) {
      toast.error('Fehler beim Speichern')
      setTags(tags)
    }
  }

  const handleRetryOcr = async () => {
    setIsRetryingOcr(true)
    try {
      await supabase.functions.invoke('secondbrain-ocr', {
        body: {
          documentId: doc.id,
          storagePath: doc.storage_path,
          fileType: doc.file_type,
          mimeType: '',
          fileName: doc.title,
        },
      })
      toast.success('OCR-Verarbeitung neu gestartet')
    } catch {
      toast.error('Fehler beim Neustarten')
    } finally {
      setIsRetryingOcr(false)
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    const { error } = await supabase
      .from('sb_documents')
      .update({ notes: notes.trim() || null })
      .eq('id', doc.id)

    if (error) {
      toast.error('Fehler beim Speichern')
    } else {
      doc.notes = notes.trim() || null
      setNotesChanged(false)
      toast.success('Notizen gespeichert')
    }
    setIsSavingNotes(false)
  }

  const handleSetDocType = async (docType: string) => {
    const { error } = await supabase
      .from('sb_documents')
      .update({ document_type: docType })
      .eq('id', doc.id)

    if (!error) {
      doc.document_type = docType
      toast.success('Dokumenttyp gesetzt')
    }
  }

  const handleAssignCompany = async (companyId: string) => {
    const { error } = await supabase
      .from('sb_documents')
      .update({ company_id: companyId })
      .eq('id', doc.id)

    if (!error) {
      doc.company_id = companyId
      toast.success('Firma zugeordnet')
    }
  }

  const handleSetStatus = async (status: string) => {
    const { error } = await supabase
      .from('sb_documents')
      .update({ status })
      .eq('id', doc.id)

    if (!error) {
      doc.status = status
      toast.success('Status aktualisiert')
    }
  }

  const handleForwardToApp = async (appKey: string) => {
    const app = TARGET_APPS[appKey]

    // Save link record in DB
    const { error } = await supabase
      .from('sb_document_links')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        document_id: doc.id,
        target_app: appKey,
        link_type: 'forwarded',
      })

    if (!error) {
      toast.success(`An ${app?.label || appKey} weitergeleitet`)
    }

    // Build deep link URL with document context
    if (app?.url) {
      const params = new URLSearchParams()
      params.set('ref', 'secondbrain')
      params.set('doc_id', doc.id)
      if (doc.document_type) params.set('type', doc.document_type)
      if (doc.amount) params.set('amount', String(doc.amount))
      if (doc.sender) params.set('sender', doc.sender)
      if (doc.reference_number) params.set('ref_nr', doc.reference_number)
      window.open(`${app.url}?${params}`, '_blank', 'noopener,noreferrer')
    }
  }

  const typeInfo = DOCUMENT_TYPES[doc.document_type || 'other'] || DOCUMENT_TYPES.other
  const statusInfo = DOCUMENT_STATUS[doc.status || 'inbox'] || DOCUMENT_STATUS.inbox
  const assignedCompany = companies.find(c => c.id === doc.company_id)
  const smartRouting = getSmartRouting(doc.document_type)

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl bg-card border-l border-border h-full overflow-y-auto animate-slide-in-left">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border p-4">
          <div className="flex items-center justify-between">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5 flex-1 pr-4">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setIsEditingTitle(false) }}
                  autoFocus
                  className="h-8 text-lg font-semibold"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleSaveTitle}>
                  <Check className="w-4 h-4 text-green-500" />
                </Button>
              </div>
            ) : (
              <h2
                className="text-lg font-semibold truncate pr-4 cursor-pointer hover:text-primary transition-colors group/title flex items-center gap-1.5"
                onClick={() => setIsEditingTitle(true)}
              >
                {doc.title}
                <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover/title:opacity-50 shrink-0" />
              </h2>
            )}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => onFavorite(doc)}>
                <Star className={`w-4 h-4 ${doc.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => window.print()} title="Drucken">
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Link kopieren"
                onClick={() => {
                  const url = `${window.location.origin}/dokumente?doc=${doc.id}`
                  navigator.clipboard.writeText(url)
                  toast.success('Link kopiert!')
                }}
              >
                <Link2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status badges row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: typeInfo.color, color: typeInfo.color }}>
              {typeInfo.label}
            </Badge>
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: statusInfo.color, color: statusInfo.color }}>
              {statusInfo.label}
            </Badge>
            {doc.priority === 'urgent' && (
              <Badge variant="destructive" className="text-[10px]">Dringend</Badge>
            )}
            {doc.priority === 'high' && (
              <Badge className="text-[10px] bg-orange-500">Wichtig</Badge>
            )}
            {assignedCompany && (
              <Badge variant="outline" className="text-[10px]">
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: assignedCompany.color }} />
                {assignedCompany.name}
              </Badge>
            )}
            {doc.amount && (
              <Badge variant="secondary" className="text-[10px] font-medium">
                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: doc.currency || 'EUR' }).format(doc.amount)}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {doc.file_type.toUpperCase()} — {formatFileSize(doc.file_size)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatRelativeTime(doc.created_at)}
            </div>
            {doc.sender && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Von: {doc.sender}
              </div>
            )}
            {doc.reference_number && (
              <div className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                Ref: {doc.reference_number}
              </div>
            )}
            {doc.document_date && (
              <div className="flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" />
                Dok.-Datum: {new Date(doc.document_date).toLocaleDateString('de-DE')}
              </div>
            )}
          </div>

          {/* Quick Actions: Document Type */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Dokumenttyp</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(DOCUMENT_TYPES).slice(0, 10).map(([key, info]) => (
                <Button
                  key={key}
                  variant={doc.document_type === key ? 'default' : 'outline'}
                  size="sm"
                  className="text-[11px] h-6 px-2"
                  onClick={() => handleSetDocType(key)}
                >
                  {info.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Company Assignment */}
          {companies.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Firma
              </p>
              <div className="flex flex-wrap gap-1.5">
                {companies.map(c => (
                  <Button
                    key={c.id}
                    variant={doc.company_id === c.id ? 'default' : 'outline'}
                    size="sm"
                    className="text-[11px] h-6 px-2"
                    onClick={() => handleAssignCompany(c.id)}
                  >
                    <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(DOCUMENT_STATUS).map(([key, info]) => (
                <Button
                  key={key}
                  variant={doc.status === key ? 'default' : 'outline'}
                  size="sm"
                  className="text-[11px] h-6 px-2"
                  onClick={() => handleSetStatus(key)}
                >
                  {info.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Smart Routing Suggestion */}
          {smartRouting && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                {smartRouting.primary.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary flex items-center gap-1">
                  <Brain className="w-3 h-3" /> KI-Empfehlung
                </p>
                <p className="text-[11px] text-muted-foreground">{smartRouting.reason}</p>
              </div>
              <Button
                size="sm"
                className="text-[11px] h-7 shrink-0"
                onClick={() => handleForwardToApp(smartRouting.primary.key)}
              >
                {smartRouting.primary.label}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
              {smartRouting.secondary && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-6 shrink-0"
                  onClick={() => handleForwardToApp(smartRouting.secondary!.key)}
                >
                  {smartRouting.secondary.label}
                </Button>
              )}
            </div>
          )}

          {/* Forward to App */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1">
              <ArrowRight className="w-3 h-3" /> Weiterleiten an App
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TARGET_APPS).map(([key, app]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-7 px-2.5 gap-1.5"
                  onClick={() => handleForwardToApp(key)}
                >
                  <span className="text-sm leading-none">{app.icon}</span>
                  {app.label}
                  <ArrowRight className="w-2.5 h-2.5 opacity-50" />
                </Button>
              ))}
            </div>
          </div>

          {/* Collection assignment */}
          {collections.length > 0 && onAddToCollection && (
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <FolderOpen className="w-3 h-3" /> Sammlung
              </p>
              <div className="flex flex-wrap gap-1.5">
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => onAddToCollection(doc, col.id)}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border hover:border-primary/30 hover:bg-accent text-[11px] transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    {col.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags - editable */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20 transition-colors group/tag text-[11px]"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="w-2.5 h-2.5 ml-1 opacity-0 group-hover/tag:opacity-100" />
                </Badge>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-muted-foreground">Keine Tags</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Neuen Tag hinzufügen..."
                className="h-7 text-xs"
              />
              <Button variant="outline" size="sm" className="h-7 shrink-0" onClick={handleAddTag} disabled={!newTag.trim()}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Notes / Quick-Finder */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Notizen / Quick-Finder
              </p>
              {notesChanged && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-6"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Speichern
                </Button>
              )}
            </div>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none min-h-[80px]"
              placeholder="Eigene Notizen, Zusammenfassung, Quick-Finder Keywords..."
              value={notes}
              onChange={e => { setNotes(e.target.value); setNotesChanged(true) }}
              onBlur={() => notesChanged && handleSaveNotes()}
            />
          </div>

          <Separator />

          {/* Tabs: Summary & Text */}
          <Tabs defaultValue="summary">
            <TabsList className="w-full">
              <TabsTrigger value="summary" className="flex-1">KI-Zusammenfassung</TabsTrigger>
              <TabsTrigger value="text" className="flex-1">Erkannter Text</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              {doc.summary ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-primary">KI-generierte Zusammenfassung</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{doc.summary}</p>
                </div>
              ) : doc.ocr_status === 'failed' ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    OCR-Verarbeitung fehlgeschlagen
                  </p>
                  <Button variant="outline" size="sm" onClick={handleRetryOcr} disabled={isRetryingOcr}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRetryingOcr ? 'animate-spin' : ''}`} />
                    Erneut versuchen
                  </Button>
                </div>
              ) : doc.ocr_status === 'processing' || doc.ocr_status === 'pending' ? (
                <div className="text-center py-8">
                  <Brain className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    {doc.ocr_status === 'processing' ? 'Zusammenfassung wird generiert...' : 'Wartet auf Verarbeitung...'}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Keine Zusammenfassung verfügbar</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="text" className="mt-4">
              {doc.ocr_text ? (
                <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {doc.ocr_text}
                </pre>
              ) : doc.ocr_status === 'failed' ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">Texterkennung fehlgeschlagen</p>
                  <Button variant="outline" size="sm" onClick={handleRetryOcr} disabled={isRetryingOcr}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRetryingOcr ? 'animate-spin' : ''}`} />
                    Erneut versuchen
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {doc.ocr_status === 'processing' ? 'OCR-Erkennung läuft...' : doc.ocr_status === 'pending' ? 'Wartet auf Verarbeitung...' : 'Kein Text erkannt'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
