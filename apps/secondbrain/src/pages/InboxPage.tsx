import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, ArrowRight, Building2, Tag, CheckCircle, AlertTriangle, Clock, Filter, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDocuments, useToggleFavorite } from '@/hooks/useDocuments'
import { useCollections, useAddDocumentToCollection } from '@/hooks/useCollections'
import { useCompanies, useAssignCompany } from '@/hooks/useCompanies'
import { useUpdateDocumentStatus, useUpdateDocumentMeta, DOCUMENT_TYPES, DOCUMENT_STATUS, TARGET_APPS } from '@/hooks/useWorkflows'
import { useCreateDocumentLink } from '@/hooks/useWorkflows'
import { useLogActivity } from '@/hooks/useActivityLog'
import DocumentViewer from '@/components/documents/DocumentViewer'
import type { Document } from '@/components/documents/DocumentCard'
import { formatRelativeTime, formatFileSize } from '@/lib/utils'
import { toast } from 'sonner'

type InboxFilter = 'all' | 'action_required' | 'inbox' | 'processing'

export default function InboxPage() {
  const navigate = useNavigate()
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [filter, setFilter] = useState<InboxFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: documents = [], isLoading } = useDocuments()
  const { data: collections = [] } = useCollections()
  const { data: companies = [] } = useCompanies()
  const toggleFavorite = useToggleFavorite()
  const assignCompany = useAssignCompany()
  const updateStatus = useUpdateDocumentStatus()
  const updateMeta = useUpdateDocumentMeta()
  const createLink = useCreateDocumentLink()
  const addToCollection = useAddDocumentToCollection()
  const logActivity = useLogActivity()

  // Filter to inbox items (not done/archived)
  const inboxDocs = useMemo(() => {
    let docs = documents.filter(d =>
      !d.status || d.status === 'inbox' || d.status === 'processing' || d.status === 'action_required' || d.status === 'reviewed'
    )

    if (filter === 'action_required') docs = docs.filter(d => d.status === 'action_required' || d.priority === 'urgent')
    else if (filter === 'inbox') docs = docs.filter(d => !d.status || d.status === 'inbox')
    else if (filter === 'processing') docs = docs.filter(d => d.status === 'processing' || d.status === 'reviewed')

    // Sort: urgent first, then by date
    return docs.sort((a, b) => {
      const pOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 }
      const pa = pOrder[a.priority || 'normal'] ?? 2
      const pb = pOrder[b.priority || 'normal'] ?? 2
      if (pa !== pb) return pa - pb
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [documents, filter])

  const actionCount = documents.filter(d => d.status === 'action_required' || d.priority === 'urgent').length
  const inboxCount = documents.filter(d => !d.status || d.status === 'inbox').length
  const processingCount = documents.filter(d => d.status === 'processing' || d.status === 'reviewed').length

  const handleMarkDone = (doc: Document) => {
    updateStatus.mutate({ documentId: doc.id, status: 'done', workflowStatus: 'completed' })
    toast.success('Als erledigt markiert')
  }

  const handleArchive = (doc: Document) => {
    updateStatus.mutate({ documentId: doc.id, status: 'archived' })
    toast.success('Archiviert')
  }

  const handleAssignCompany = (doc: Document, companyId: string) => {
    assignCompany.mutate({ documentId: doc.id, companyId })
    toast.success('Firma zugeordnet')
  }

  const handleSetType = (doc: Document, docType: string) => {
    updateMeta.mutate({ documentId: doc.id, document_type: docType })
    toast.success('Dokumenttyp gesetzt')
  }

  const handleForward = (doc: Document, appKey: string) => {
    createLink.mutate({
      document_id: doc.id,
      target_app: appKey,
      link_type: 'forwarded',
    })
  }

  const collectionInfos = collections.map(c => ({ id: c.id, name: c.name, color: c.color }))

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="w-6 h-6 text-primary" />
            Eingangskorb
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {inboxDocs.length} Dokumente warten auf Bearbeitung
          </p>
        </div>
        <Button onClick={() => navigate('/upload')}>Neues Dokument</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          Alle ({inboxDocs.length})
        </Button>
        <Button variant={filter === 'action_required' ? 'default' : 'outline'} size="sm"
          className={actionCount > 0 ? 'border-destructive text-destructive hover:bg-destructive hover:text-white' : ''}
          onClick={() => setFilter('action_required')}>
          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
          Aktion nötig ({actionCount})
        </Button>
        <Button variant={filter === 'inbox' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('inbox')}>
          <Clock className="w-3.5 h-3.5 mr-1" />
          Neu ({inboxCount})
        </Button>
        <Button variant={filter === 'processing' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('processing')}>
          <Filter className="w-3.5 h-3.5 mr-1" />
          In Bearbeitung ({processingCount})
        </Button>
      </div>

      {/* Document list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : inboxDocs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <p className="text-lg font-medium text-foreground">Alles erledigt!</p>
          <p className="text-sm mt-1">Keine Dokumente im Eingangskorb</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inboxDocs.map(doc => {
            const isExpanded = expandedId === doc.id
            const typeInfo = DOCUMENT_TYPES[doc.document_type || 'other'] || DOCUMENT_TYPES.other
            const statusInfo = DOCUMENT_STATUS[doc.status || 'inbox'] || DOCUMENT_STATUS.inbox
            const company = companies.find(c => c.id === doc.company_id)

            return (
              <div
                key={doc.id}
                className={`rounded-xl border bg-card transition-all ${
                  doc.priority === 'urgent' ? 'border-destructive/50 bg-destructive/5' :
                  doc.priority === 'high' ? 'border-orange-400/50 bg-orange-50/50 dark:bg-orange-950/20' :
                  'border-border'
                }`}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors rounded-xl"
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                >
                  {/* Priority indicator */}
                  <div className={`w-1.5 h-12 rounded-full shrink-0 ${
                    doc.priority === 'urgent' ? 'bg-destructive' :
                    doc.priority === 'high' ? 'bg-orange-400' :
                    'bg-muted'
                  }`} />

                  {/* Doc info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold truncate">{doc.title}</h3>
                      {doc.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-[10px] shrink-0">Dringend</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: typeInfo.color, color: typeInfo.color }}>
                        {typeInfo.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: statusInfo.color, color: statusInfo.color }}>
                        {statusInfo.label}
                      </Badge>
                      {company && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: company.color }} />
                          {company.name}
                        </span>
                      )}
                      {doc.amount && (
                        <span className="font-medium">
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: doc.currency || 'EUR' }).format(doc.amount)}
                        </span>
                      )}
                      <span>{formatRelativeTime(doc.created_at)}</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                    </div>
                    {doc.summary && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{doc.summary}</p>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc) }}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-600" onClick={(e) => { e.stopPropagation(); handleMarkDone(doc) }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Expanded actions */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/50 mt-0 animate-fade-in-up">
                    {/* Company assignment */}
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Firma zuordnen</p>
                      <div className="flex flex-wrap gap-1.5">
                        {companies.map(c => (
                          <Button
                            key={c.id}
                            variant={doc.company_id === c.id ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleAssignCompany(doc, c.id)}
                          >
                            <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: c.color }} />
                            {c.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Document type */}
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Dokumenttyp</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(DOCUMENT_TYPES).slice(0, 8).map(([key, info]) => (
                          <Button
                            key={key}
                            variant={doc.document_type === key ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSetType(doc, key)}
                          >
                            {info.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Forward to app */}
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Weiterleiten an</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(TARGET_APPS).map(([key, app]) => (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleForward(doc, key)}
                          >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            {app.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Collections */}
                    {collections.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Sammlung</p>
                        <div className="flex flex-wrap gap-1.5">
                          {collections.map(col => (
                            <Button
                              key={col.id}
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => {
                                addToCollection.mutate({ documentId: doc.id, collectionId: col.id })
                                toast.success(`Zu "${col.name}" hinzugefügt`)
                              }}
                            >
                              <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: col.color }} />
                              {col.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" variant="default" onClick={() => handleMarkDone(doc)}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Erledigt
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleArchive(doc)}>
                        Archivieren
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedDoc(doc)}>
                        Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Document Viewer */}
      {selectedDoc && (
        <DocumentViewer
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onFavorite={(doc) => toggleFavorite.mutate(doc)}
          onAddToCollection={(doc, colId) => {
            addToCollection.mutate({ documentId: doc.id, collectionId: colId })
            toast.success('Zu Sammlung hinzugefügt')
          }}
          collections={collectionInfos}
        />
      )}
    </div>
  )
}
