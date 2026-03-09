import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, FileText, Star, Download, Printer, Link2, Edit3, Check,
  Clock, Mail, Receipt, CalendarClock, Brain, ArrowRight, Tag, Plus, X,
  FolderOpen, Building2, AlertTriangle, RefreshCw, Save, ExternalLink,
  ChevronRight, History, Share2, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDocuments, useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import { useCollections, useAddDocumentToCollection } from '@/hooks/useCollections'
import { useCompanies } from '@/hooks/useCompanies'
import { useLogActivity, useActivityLog } from '@/hooks/useActivityLog'
import {
  DOCUMENT_TYPES, DOCUMENT_STATUS, TARGET_APPS, getSmartRouting,
  useDocumentLinks, useCreateDocumentLink,
} from '@/hooks/useWorkflows'
import { supabase } from '@/integrations/supabase'
import { formatRelativeTime, formatFileSize } from '@/lib/utils'
import { toast } from 'sonner'

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: documents = [], isLoading } = useDocuments()
  const { data: collections = [] } = useCollections()
  const { data: companies = [] } = useCompanies()
  const { data: links = [] } = useDocumentLinks(id)
  const { data: activities = [] } = useActivityLog(id)
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()
  const addToCollection = useAddDocumentToCollection()
  const logActivity = useLogActivity()
  const createLink = useCreateDocumentLink()

  const doc = useMemo(() => documents.find(d => d.id === id), [documents, id])

  // Related documents (same type, company, or tags overlap)
  const relatedDocs = useMemo(() => {
    if (!doc) return []
    return documents.filter(d => {
      if (d.id === doc.id) return false
      if (doc.document_type && d.document_type === doc.document_type) return true
      if (doc.company_id && d.company_id === doc.company_id) return true
      if (doc.tags.length > 0 && d.tags.some(t => doc.tags.includes(t))) return true
      return false
    }).slice(0, 6)
  }, [doc, documents])

  const [newTag, setNewTag] = useState('')
  const [tags, setTags] = useState<string[]>(doc?.tags || [])
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(doc?.title || '')
  const [notes, setNotes] = useState(doc?.notes || '')
  const [notesChanged, setNotesChanged] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isRetryingOcr, setIsRetryingOcr] = useState(false)

  const loggedRef = useRef<string | null>(null)

  // Sync state when doc loads
  useEffect(() => {
    if (doc) {
      if (doc.tags.length > 0) setTags(doc.tags)
      if (doc.title) setEditTitle(doc.title)
      if (doc.notes) setNotes(doc.notes)
    }
  }, [doc?.id])

  // Log view once per document
  useEffect(() => {
    if (doc && !isLoading && loggedRef.current !== doc.id) {
      loggedRef.current = doc.id
      logActivity.mutate({
        action: 'view',
        entity_type: 'document',
        entity_id: doc.id,
        metadata: { title: doc.title },
      })
    }
  }, [doc?.id, isLoading])

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center py-20">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Dokument nicht gefunden</h2>
        <p className="text-muted-foreground mb-4">Das Dokument existiert nicht oder wurde geloscht.</p>
        <Button onClick={() => navigate('/dokumente')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Zuruck zu Dokumente
        </Button>
      </div>
    )
  }

  const typeInfo = DOCUMENT_TYPES[doc.document_type || 'other'] || DOCUMENT_TYPES.other
  const statusInfo = DOCUMENT_STATUS[doc.status || 'inbox'] || DOCUMENT_STATUS.inbox
  const assignedCompany = companies.find(c => c.id === doc.company_id)
  const smartRouting = getSmartRouting(doc.document_type)
  const collectionInfos = collections.map(c => ({ id: c.id, name: c.name, color: c.color }))

  const handleSaveTitle = async () => {
    const title = editTitle.trim()
    if (!title || title === doc.title) { setIsEditingTitle(false); return }
    const { error } = await supabase.from('sb_documents').update({ title }).eq('id', doc.id)
    if (error) { toast.error('Fehler beim Umbenennen'); setEditTitle(doc.title) }
    else { doc.title = title; toast.success('Titel gespeichert') }
    setIsEditingTitle(false)
  }

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage.from('secondbrain-docs').download(doc.storage_path)
      if (error) throw error
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.title + '.' + doc.storage_path.split('.').pop()
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch { toast.error('Download fehlgeschlagen') }
  }

  const handleAddTag = async () => {
    const tag = newTag.trim()
    if (!tag || tags.includes(tag)) return
    const updated = [...tags, tag]
    setTags(updated); setNewTag('')
    const { error } = await supabase.from('sb_documents').update({ tags: updated }).eq('id', doc.id)
    if (error) { toast.error('Fehler'); setTags(tags) }
  }

  const handleRemoveTag = async (t: string) => {
    const updated = tags.filter(x => x !== t)
    setTags(updated)
    const { error } = await supabase.from('sb_documents').update({ tags: updated }).eq('id', doc.id)
    if (error) { toast.error('Fehler'); setTags(tags) }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    const { error } = await supabase.from('sb_documents').update({ notes: notes.trim() || null }).eq('id', doc.id)
    if (!error) { doc.notes = notes.trim() || null; setNotesChanged(false); toast.success('Notizen gespeichert') }
    else toast.error('Fehler beim Speichern')
    setIsSavingNotes(false)
  }

  const handleSetDocType = async (docType: string) => {
    const { error } = await supabase.from('sb_documents').update({ document_type: docType }).eq('id', doc.id)
    if (!error) { doc.document_type = docType; toast.success('Dokumenttyp gesetzt') }
  }

  const handleSetStatus = async (status: string) => {
    const { error } = await supabase.from('sb_documents').update({ status }).eq('id', doc.id)
    if (!error) { doc.status = status; toast.success('Status aktualisiert') }
  }

  const handleAssignCompany = async (companyId: string) => {
    const { error } = await supabase.from('sb_documents').update({ company_id: companyId }).eq('id', doc.id)
    if (!error) { doc.company_id = companyId; toast.success('Firma zugeordnet') }
  }

  const handleForwardToApp = (appKey: string) => {
    const app = TARGET_APPS[appKey]
    createLink.mutate({ document_id: doc.id, target_app: appKey, link_type: 'forwarded' })
    if (app?.url) {
      const params = new URLSearchParams()
      params.set('ref', 'secondbrain')
      params.set('doc_id', doc.id)
      if (doc.document_type) params.set('type', doc.document_type)
      if (doc.amount) params.set('amount', String(doc.amount))
      if (doc.sender) params.set('sender', doc.sender)
      window.open(`${app.url}?${params}`, '_blank', 'noopener,noreferrer')
    }
  }

  const handleRetryOcr = async () => {
    setIsRetryingOcr(true)
    try {
      await supabase.functions.invoke('secondbrain-ocr', {
        body: { documentId: doc.id, storagePath: doc.storage_path, fileType: doc.file_type, mimeType: '' },
      })
      toast.success('OCR-Verarbeitung neu gestartet')
    } catch { toast.error('Fehler beim Neustarten') }
    finally { setIsRetryingOcr(false) }
  }

  const handleDelete = () => {
    if (confirm('Dokument wirklich loschen?')) {
      deleteDocument.mutate(doc, { onSuccess: () => navigate('/dokumente') })
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/dokumente" className="hover:text-foreground transition-colors">Dokumente</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium truncate max-w-[300px]">{doc.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setIsEditingTitle(false) }}
                autoFocus
                className="text-2xl font-bold h-auto py-1"
              />
              <Button variant="ghost" size="icon" onClick={handleSaveTitle}>
                <Check className="w-5 h-5 text-green-500" />
              </Button>
            </div>
          ) : (
            <h1
              className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors group flex items-center gap-2"
              onClick={() => setIsEditingTitle(true)}
            >
              {doc.title}
              <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-50 shrink-0" />
            </h1>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-[11px]" style={{ borderColor: typeInfo.color, color: typeInfo.color }}>
              {typeInfo.label}
            </Badge>
            <Badge variant="outline" className="text-[11px]" style={{ borderColor: statusInfo.color, color: statusInfo.color }}>
              {statusInfo.label}
            </Badge>
            {doc.priority === 'urgent' && <Badge variant="destructive" className="text-[11px]">Dringend</Badge>}
            {doc.priority === 'high' && <Badge className="text-[11px] bg-orange-500">Wichtig</Badge>}
            {assignedCompany && (
              <Badge variant="outline" className="text-[11px]">
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: assignedCompany.color }} />
                {assignedCompany.name}
              </Badge>
            )}
            {doc.amount && (
              <Badge variant="secondary" className="text-[11px] font-medium">
                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: doc.currency || 'EUR' }).format(doc.amount)}
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => toggleFavorite.mutate(doc)} title="Favorit">
            <Star className={`w-4 h-4 ${doc.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.print()} title="Drucken">
            <Printer className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost" size="icon" title="Link kopieren"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/dokumente/${doc.id}`)
              toast.success('Link kopiert!')
            }}
          >
            <Link2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" />{doc.file_type.toUpperCase()} — {formatFileSize(doc.file_size)}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{formatRelativeTime(doc.created_at)}</span>
        {doc.sender && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Von: {doc.sender}</span>}
        {doc.reference_number && <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" />Ref: {doc.reference_number}</span>}
        {doc.document_date && <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" />Dok.-Datum: {new Date(doc.document_date).toLocaleDateString('de-DE')}</span>}
      </div>

      {/* Smart Routing Suggestion */}
      {smartRouting && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
            {smartRouting.primary.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary flex items-center gap-1">
              <Brain className="w-3.5 h-3.5" /> KI-Empfehlung
            </p>
            <p className="text-xs text-muted-foreground">{smartRouting.reason}</p>
          </div>
          <Button size="sm" onClick={() => handleForwardToApp(smartRouting.primary.key)}>
            {smartRouting.primary.label} <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
          {smartRouting.secondary && (
            <Button variant="outline" size="sm" onClick={() => handleForwardToApp(smartRouting.secondary!.key)}>
              {smartRouting.secondary.label}
            </Button>
          )}
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs: Summary & Text */}
          <Card>
            <Tabs defaultValue="summary">
              <CardHeader className="pb-0">
                <TabsList className="w-full">
                  <TabsTrigger value="summary" className="flex-1">KI-Zusammenfassung</TabsTrigger>
                  <TabsTrigger value="text" className="flex-1">Erkannter Text</TabsTrigger>
                  <TabsTrigger value="notes" className="flex-1">Notizen</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-4">
                <TabsContent value="summary" className="mt-0">
                  {doc.summary ? (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary">KI-generierte Zusammenfassung</span>
                      </div>
                      <p className="text-sm leading-relaxed">{doc.summary}</p>
                    </div>
                  ) : doc.ocr_status === 'failed' ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">OCR-Verarbeitung fehlgeschlagen</p>
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

                <TabsContent value="text" className="mt-0">
                  {doc.ocr_text ? (
                    <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                      {doc.ocr_text}
                    </pre>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        {doc.ocr_status === 'processing' ? 'OCR-Erkennung lauft...' : doc.ocr_status === 'pending' ? 'Wartet auf Verarbeitung...' : 'Kein Text erkannt'}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="mt-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Eigene Notizen & Quick-Finder Keywords</p>
                    {notesChanged && (
                      <Button variant="outline" size="sm" className="text-xs h-6" onClick={handleSaveNotes} disabled={isSavingNotes}>
                        <Save className="w-3 h-3 mr-1" /> Speichern
                      </Button>
                    )}
                  </div>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none min-h-[200px]"
                    placeholder="Eigene Notizen, Zusammenfassung, Quick-Finder Keywords..."
                    value={notes}
                    onChange={e => { setNotes(e.target.value); setNotesChanged(true) }}
                    onBlur={() => notesChanged && handleSaveNotes()}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Forward to App */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-muted-foreground" /> Weiterleiten an App
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(TARGET_APPS).map(([key, app]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-auto py-3 px-3 flex flex-col items-start gap-1 text-left"
                    onClick={() => handleForwardToApp(key)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{app.icon}</span>
                      <span className="text-xs font-medium">{app.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{app.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Documents */}
          {relatedDocs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-muted-foreground" /> Verwandte Dokumente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {relatedDocs.map(rd => {
                    const rdType = DOCUMENT_TYPES[rd.document_type || 'other'] || DOCUMENT_TYPES.other
                    return (
                      <Link key={rd.id} to={`/dokumente/${rd.id}`}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 transition-colors">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{rd.title}</p>
                            <p className="text-[11px] text-muted-foreground">{rdType.label} — {formatRelativeTime(rd.created_at)}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Document Type */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Dokumenttyp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(DOCUMENT_TYPES).slice(0, 12).map(([key, info]) => (
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
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Company */}
          {companies.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Firma
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Collections */}
          {collections.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" /> Sammlungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {collectionInfos.map(col => (
                    <button
                      key={col.id}
                      onClick={() => addToCollection.mutate(
                        { documentId: doc.id, collectionId: col.id },
                        { onSuccess: () => toast.success('Hinzugefügt'), onError: () => toast.error('Bereits vorhanden') }
                      )}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border hover:border-primary/30 hover:bg-accent text-[11px] transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                      {col.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(tag => (
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
                {tags.length === 0 && <span className="text-xs text-muted-foreground">Keine Tags</span>}
              </div>
              <div className="flex gap-1.5">
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  placeholder="Tag..."
                  className="h-7 text-xs"
                />
                <Button variant="outline" size="sm" className="h-7 shrink-0" onClick={handleAddTag} disabled={!newTag.trim()}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Forwarding history */}
          {links.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Weiterleitungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {links.map(link => {
                    const app = TARGET_APPS[link.target_app]
                    return (
                      <div key={link.id} className="flex items-center gap-2 text-xs">
                        <span className="text-sm">{app?.icon || '📄'}</span>
                        <span className="font-medium">{app?.label || link.target_app}</span>
                        <span className="text-muted-foreground ml-auto">{formatRelativeTime(link.linked_at)}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity log */}
          {activities.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <History className="w-3 h-3" /> Aktivitat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activities.slice(0, 10).map((act: { id: string; action: string; created_at: string }) => (
                    <div key={act.id} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                      <span className="capitalize">{act.action}</span>
                      <span className="text-muted-foreground ml-auto">{formatRelativeTime(act.created_at)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danger zone */}
          <Button variant="destructive" size="sm" className="w-full text-xs" onClick={handleDelete}>
            Dokument loschen
          </Button>
        </div>
      </div>
    </div>
  )
}
