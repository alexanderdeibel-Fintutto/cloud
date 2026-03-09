import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FileText, Plus, CheckSquare, X, FolderOpen, Trash2, Tag, ArrowRight, CheckCircle, Archive, Download, Grid3X3, List, ArrowUpDown, ChevronUp, ChevronDown, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import SearchBar from '@/components/search/SearchBar'
import DocumentGrid from '@/components/documents/DocumentGrid'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { useDocuments, useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import { useCollections, useAddDocumentToCollection } from '@/hooks/useCollections'
import { useCompanies } from '@/hooks/useCompanies'
import { useLogActivity } from '@/hooks/useActivityLog'
import { useUpdateDocumentStatus, useCreateDocumentLink, TARGET_APPS, DOCUMENT_TYPES } from '@/hooks/useWorkflows'
import { supabase } from '@/integrations/supabase'
import type { Document } from '@/components/documents/DocumentCard'
import MergeDialog from '@/components/documents/MergeDialog'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data: documents = [], isLoading } = useDocuments({ search: search || undefined })
  const { data: collections = [] } = useCollections()
  const { data: companies = [] } = useCompanies()
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()
  const addToCollection = useAddDocumentToCollection()
  const logActivity = useLogActivity()
  const updateStatus = useUpdateDocumentStatus()
  const createLink = useCreateDocumentLink()
  const [bulkTag, setBulkTag] = useState('')
  const [mergeOpen, setMergeOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const collectionInfos = useMemo(
    () => collections.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    [collections]
  )

  const handleView = (doc: Document) => {
    navigate(`/dokumente/${doc.id}`)
  }

  const handleAddToCollection = (doc: Document, collectionId: string) => {
    addToCollection.mutate(
      { documentId: doc.id, collectionId },
      {
        onSuccess: () => toast.success('Zu Sammlung hinzugefügt'),
        onError: () => toast.error('Bereits in dieser Sammlung'),
      }
    )
  }

  const handleSelect = (doc: Document) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(doc.id)) next.delete(doc.id)
      else next.add(doc.id)
      return next
    })
  }

  const handleBulkDelete = () => {
    const docs = documents.filter((d) => selectedIds.has(d.id))
    for (const doc of docs) {
      deleteDocument.mutate(doc)
    }
    toast.success(`${docs.length} Dokumente gelöscht`)
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const handleBulkAddToCollection = (collectionId: string) => {
    for (const docId of selectedIds) {
      addToCollection.mutate({ documentId: docId, collectionId })
    }
    toast.success(`${selectedIds.size} Dokumente zugeordnet`)
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const handleBulkDone = () => {
    for (const docId of selectedIds) {
      updateStatus.mutate({ documentId: docId, status: 'done', workflowStatus: 'completed' })
    }
    toast.success(`${selectedIds.size} Dokumente als erledigt markiert`)
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const handleBulkArchive = () => {
    for (const docId of selectedIds) {
      updateStatus.mutate({ documentId: docId, status: 'archived' })
    }
    toast.success(`${selectedIds.size} Dokumente archiviert`)
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const handleBulkForward = (appKey: string) => {
    for (const docId of selectedIds) {
      createLink.mutate({ document_id: docId, target_app: appKey, link_type: 'forwarded' })
    }
    const app = TARGET_APPS[appKey]
    toast.success(`${selectedIds.size} Dokumente an ${app?.label || appKey} weitergeleitet`)
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const handleBulkTag = async () => {
    const tag = bulkTag.trim()
    if (!tag) return
    const docs = documents.filter(d => selectedIds.has(d.id))
    for (const doc of docs) {
      if (!doc.tags.includes(tag)) {
        await supabase
          .from('sb_documents')
          .update({ tags: [...doc.tags, tag] })
          .eq('id', doc.id)
      }
    }
    toast.success(`Tag "${tag}" zu ${docs.length} Dokumenten hinzugefügt`)
    setBulkTag('')
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    )
  }

  // Apply local filters including temporal
  const filteredDocs = useMemo(() => {
    let docs = documents
    if (activeFilters.includes('PDF')) docs = docs.filter((d) => d.file_type === 'pdf')
    if (activeFilters.includes('Bilder')) docs = docs.filter((d) => d.file_type === 'image')
    if (activeFilters.includes('Text')) docs = docs.filter((d) => d.file_type === 'text')
    if (activeFilters.includes('Favoriten')) docs = docs.filter((d) => d.is_favorite)
    if (activeFilters.includes('Heute')) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      docs = docs.filter((d) => new Date(d.created_at) >= today)
    }
    if (activeFilters.includes('Diese Woche')) {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      docs = docs.filter((d) => new Date(d.created_at) >= weekAgo)
    }
    // Sort
    docs = [...docs].sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name': cmp = a.title.localeCompare(b.title); break
        case 'type': cmp = (a.document_type || 'zzz').localeCompare(b.document_type || 'zzz'); break
        case 'amount': cmp = (a.amount || 0) - (b.amount || 0); break
        case 'date': default: cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return docs
  }, [documents, activeFilters, sortBy, sortDir])

  // Duplicate detection
  const duplicates = useMemo(() => {
    const groups = new Map<string, Document[]>()
    documents.forEach(doc => {
      const key = doc.title.toLowerCase().replace(/[^a-z0-9äöüß]/g, '').trim()
      if (!key) return
      const list = groups.get(key) || []
      list.push(doc)
      groups.set(key, list)
    })
    return Array.from(groups.values()).filter(g => g.length > 1)
  }, [documents])

  const handleExportCSV = (docs: Document[]) => {
    const bom = '\uFEFF'
    const headers = ['Titel', 'Typ', 'Status', 'Absender', 'Betrag', 'Tags', 'Dateityp', 'Groesse', 'Erstellt']
    const rows = docs.map(d => [
      d.title,
      DOCUMENT_TYPES[d.document_type || 'other']?.label || d.document_type || '',
      d.status || '',
      d.sender || '',
      d.amount ? String(d.amount) : '',
      d.tags.join('; '),
      d.file_type,
      formatFileSize(d.file_size),
      new Date(d.created_at).toLocaleDateString('de-DE'),
    ])
    const csv = bom + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `secondbrain-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${docs.length} Dokumente exportiert`)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Dokumente
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length} {documents.length === 1 ? 'Dokument' : 'Dokumente'} in deinem SecondBrain
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="h-7 text-xs rounded border border-border bg-background px-1.5"
            >
              <option value="date">Datum</option>
              <option value="name">Name</option>
              <option value="type">Typ</option>
              <option value="amount">Betrag</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              title={sortDir === 'asc' ? 'Aufsteigend' : 'Absteigend'}
            >
              {sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCSV(filteredDocs)}
            disabled={filteredDocs.length === 0}
          >
            <Download className="w-4 h-4 mr-1.5" />
            CSV
          </Button>
          <Button
            variant={selectionMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectionMode(!selectionMode)
              setSelectedIds(new Set())
            }}
          >
            <CheckSquare className="w-4 h-4 mr-1.5" />
            Auswählen
          </Button>
          <Button onClick={() => navigate('/upload')}>
            <Plus className="w-4 h-4 mr-2" />
            Hochladen
          </Button>
        </div>
      </div>

      {/* Batch action bar */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="space-y-2 animate-fade-in-up">
          <div className="flex items-center gap-2 p-3 rounded-xl border border-primary/30 bg-primary/5">
            <Badge variant="default" className="text-xs">{selectedIds.size} ausgewählt</Badge>
            <div className="flex-1" />
            <Button size="sm" variant="default" className="text-xs h-7" onClick={handleBulkDone}>
              <CheckCircle className="w-3 h-3 mr-1" /> Erledigt
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={handleBulkArchive}>
              <Archive className="w-3 h-3 mr-1" /> Archiv
            </Button>
            {collections.slice(0, 3).map((col) => (
              <Button key={col.id} variant="outline" size="sm" className="text-xs h-7" onClick={() => handleBulkAddToCollection(col.id)}>
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: col.color }} />
                {col.name}
              </Button>
            ))}
            <Button variant="destructive" size="sm" className="text-xs h-7" onClick={handleBulkDelete}>
              <Trash2 className="w-3 h-3 mr-1" /> Löschen
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setSelectedIds(new Set()); setSelectionMode(false) }}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Bulk tag + forward row */}
          <div className="flex items-center gap-2 px-3">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={bulkTag}
                onChange={e => setBulkTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBulkTag()}
                placeholder="Tag hinzufügen..."
                className="h-7 w-36 text-xs"
              />
              <Button variant="outline" size="sm" className="text-xs h-7" onClick={handleBulkTag} disabled={!bulkTag.trim()}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Weiterleiten:</span>
            {Object.entries(TARGET_APPS).slice(0, 4).map(([key, app]) => (
              <Button key={key} variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => handleBulkForward(key)}>
                <span className="text-sm leading-none mr-1">{app.icon}</span>
                {app.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        activeFilters={activeFilters}
        onFilterToggle={toggleFilter}
      />

      {/* Duplicate warning */}
      {duplicates.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-orange-400/50 bg-orange-50/50 dark:bg-orange-950/20">
          <Copy className="w-5 h-5 text-orange-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {duplicates.length} mögliche Duplikat{duplicates.length > 1 ? 'e' : ''} erkannt
            </p>
            <p className="text-xs text-muted-foreground">
              {duplicates.slice(0, 3).map(g => `"${g[0].title}" (${g.length}x)`).join(', ')}
              {duplicates.length > 3 && ` und ${duplicates.length - 3} weitere`}
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setMergeOpen(true)}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Zusammenführen
          </Button>
        </div>
      )}

      {/* Merge dialog */}
      {duplicates.length > 0 && (
        <MergeDialog
          duplicateGroups={duplicates}
          open={mergeOpen}
          onClose={() => setMergeOpen(false)}
        />
      )}

      {/* Documents */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <DocumentGrid
          documents={filteredDocs}
          onView={handleView}
          onFavorite={(doc) => toggleFavorite.mutate(doc)}
          onDelete={(doc) => deleteDocument.mutate(doc)}
          onAddToCollection={handleAddToCollection}
          collections={collectionInfos}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          selectionMode={selectionMode}
          emptyMessage={search ? 'Keine Ergebnisse für deine Suche' : 'Noch keine Dokumente hochgeladen'}
        />
      ) : (
        /* List View */
        <div className="space-y-1">
          {/* List header */}
          <div className="grid grid-cols-[1fr_100px_100px_80px_80px_100px] gap-2 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground font-medium border-b border-border">
            <span>Titel</span>
            <span>Typ</span>
            <span>Absender</span>
            <span className="text-right">Betrag</span>
            <span className="text-right">Grosse</span>
            <span className="text-right">Datum</span>
          </div>
          {filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {search ? 'Keine Ergebnisse' : 'Noch keine Dokumente'}
            </div>
          ) : filteredDocs.map(doc => {
            const typeInfo = DOCUMENT_TYPES[doc.document_type || 'other'] || DOCUMENT_TYPES.other
            return (
              <Link key={doc.id} to={`/dokumente/${doc.id}`}>
                <div className={`grid grid-cols-[1fr_100px_100px_80px_80px_100px] gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-border hover:bg-accent/50 transition-colors items-center ${selectionMode && selectedIds.has(doc.id) ? 'bg-primary/5 border-primary/30' : ''}`}
                  onClick={e => { if (selectionMode) { e.preventDefault(); handleSelect(doc) } }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {selectionMode && (
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedIds.has(doc.id) ? 'bg-primary border-primary text-white' : 'border-muted-foreground/40'}`}>
                        {selectedIds.has(doc.id) && <svg className="w-2.5 h-2.5" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" /></svg>}
                      </div>
                    )}
                    <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: typeInfo.color }} />
                    <span className="text-sm font-medium truncate">{doc.title}</span>
                    {doc.is_favorite && <span className="text-yellow-400 text-xs">★</span>}
                    {doc.priority === 'urgent' && <Badge variant="destructive" className="text-[8px] h-3.5 px-1">!</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{typeInfo.label}</span>
                  <span className="text-xs text-muted-foreground truncate">{doc.sender || '—'}</span>
                  <span className="text-xs text-right font-medium text-green-600 dark:text-green-400">
                    {doc.amount ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: doc.currency || 'EUR' }).format(doc.amount) : '—'}
                  </span>
                  <span className="text-[11px] text-muted-foreground text-right">{formatFileSize(doc.file_size)}</span>
                  <span className="text-[11px] text-muted-foreground text-right">{formatRelativeTime(doc.created_at)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Viewer */}
      {selectedDoc && (
        <DocumentViewer
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onFavorite={(doc) => toggleFavorite.mutate(doc)}
          onAddToCollection={handleAddToCollection}
          collections={collectionInfos}
          companies={companies.map(c => ({ id: c.id, name: c.name, color: c.color }))}
        />
      )}
    </div>
  )
}
