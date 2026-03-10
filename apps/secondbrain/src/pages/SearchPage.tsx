import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, FileText, Clock, X, Filter, Building2, CalendarClock,
  Receipt, Tag, ChevronDown, RotateCcw, Bookmark, BookmarkPlus, Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import SearchBar from '@/components/search/SearchBar'
import DocumentGrid from '@/components/documents/DocumentGrid'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { useSearch } from '@/hooks/useSearch'
import { useDocuments, useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import { useCollections, useAddDocumentToCollection } from '@/hooks/useCollections'
import { useCompanies } from '@/hooks/useCompanies'
import { DOCUMENT_TYPES } from '@/hooks/useWorkflows'
import { useSavedSearches, type SavedSearch } from '@/hooks/useSavedSearches'
import type { Document } from '@/components/documents/DocumentCard'
import { toast } from 'sonner'

const RECENT_SEARCHES_KEY = 'sb-recent-searches'

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
  } catch {
    return []
  }
}

function addRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query)
  recent.unshift(query)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, 8)))
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY)
}

export default function SearchPage() {
  const navigate = useNavigate()
  const { query, setQuery, results, isLoading, activeFilters, toggleFilter } = useSearch()
  const { data: allDocuments = [] } = useDocuments()
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches())
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()
  const { data: collections = [] } = useCollections()
  const { data: companies = [] } = useCompanies()
  const addToCollection = useAddDocumentToCollection()
  const savedSearches = useSavedSearches()
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')

  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filterDocType, setFilterDocType] = useState<string | null>(null)
  const [filterCompany, setFilterCompany] = useState<string | null>(null)
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterAmountMin, setFilterAmountMin] = useState('')
  const [filterAmountMax, setFilterAmountMax] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const collectionInfos = collections.map((c) => ({ id: c.id, name: c.name, color: c.color }))

  // Collect unique tags from all documents
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    allDocuments.forEach(d => d.tags.forEach(t => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [allDocuments])

  const activeAdvancedCount = [filterDocType, filterCompany, filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax, filterTag, filterStatus].filter(Boolean).length

  const resetAdvanced = () => {
    setFilterDocType(null)
    setFilterCompany(null)
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterAmountMin('')
    setFilterAmountMax('')
    setFilterTag(null)
    setFilterStatus(null)
  }

  const handleSaveSearch = () => {
    if (!saveName.trim()) return
    savedSearches.save(saveName.trim(), query, {
      docType: filterDocType,
      company: filterCompany,
      status: filterStatus,
      tag: filterTag,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
      amountMin: filterAmountMin,
      amountMax: filterAmountMax,
    })
    setSaveDialogOpen(false)
    setSaveName('')
    toast.success('Suche gespeichert')
  }

  const handleLoadSearch = (saved: SavedSearch) => {
    setQuery(saved.query)
    setFilterDocType(saved.filters.docType || null)
    setFilterCompany(saved.filters.company || null)
    setFilterStatus(saved.filters.status || null)
    setFilterTag(saved.filters.tag || null)
    setFilterDateFrom(saved.filters.dateFrom || '')
    setFilterDateTo(saved.filters.dateTo || '')
    setFilterAmountMin(saved.filters.amountMin || '')
    setFilterAmountMax(saved.filters.amountMax || '')
    if (Object.values(saved.filters).some(Boolean)) setShowAdvanced(true)
  }

  // Apply advanced filters on top of search results
  const filteredResults = useMemo(() => {
    let docs = query.trim() ? results : allDocuments
    if (filterDocType) docs = docs.filter(d => d.document_type === filterDocType)
    if (filterCompany) docs = docs.filter(d => d.company_id === filterCompany)
    if (filterStatus) docs = docs.filter(d => d.status === filterStatus)
    if (filterTag) docs = docs.filter(d => d.tags.includes(filterTag))
    if (filterDateFrom) {
      const from = new Date(filterDateFrom)
      docs = docs.filter(d => new Date(d.created_at) >= from)
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo)
      to.setHours(23, 59, 59, 999)
      docs = docs.filter(d => new Date(d.created_at) <= to)
    }
    if (filterAmountMin) {
      const min = parseFloat(filterAmountMin)
      if (!isNaN(min)) docs = docs.filter(d => d.amount != null && d.amount >= min)
    }
    if (filterAmountMax) {
      const max = parseFloat(filterAmountMax)
      if (!isNaN(max)) docs = docs.filter(d => d.amount != null && d.amount <= max)
    }
    return docs
  }, [query, results, allDocuments, filterDocType, filterCompany, filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax, filterTag, filterStatus])

  // Save searches when results come in
  useEffect(() => {
    if (query.trim() && results.length > 0) {
      addRecentSearch(query.trim())
      setRecentSearches(getRecentSearches())
    }
  }, [results])

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

  const handleClearRecent = () => {
    clearRecentSearches()
    setRecentSearches([])
  }

  const hasQuery = query.trim() || activeAdvancedCount > 0

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          Suche
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Durchsuche alle deine Dokumente — auch den per OCR erkannten Text
        </p>
      </div>

      {/* Search */}
      <SearchBar
        value={query}
        onChange={setQuery}
        activeFilters={activeFilters}
        onFilterToggle={toggleFilter}
        autoFocus
      />

      {/* Advanced Filter Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={showAdvanced ? 'secondary' : 'outline'}
          size="sm"
          className="text-xs"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="w-3.5 h-3.5 mr-1.5" />
          Erweiterte Filter
          {activeAdvancedCount > 0 && (
            <Badge variant="default" className="ml-1.5 text-[9px] h-4 px-1">{activeAdvancedCount}</Badge>
          )}
          <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>
        {activeAdvancedCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={resetAdvanced}>
            <RotateCcw className="w-3 h-3 mr-1" /> Filter zurucksetzen
          </Button>
        )}
        {(query.trim() || activeAdvancedCount > 0) && (
          <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSaveName(query || 'Meine Suche'); setSaveDialogOpen(true) }}>
            <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
            Suche speichern
          </Button>
        )}
        {savedSearches.searches.length > 0 && (
          <div className="ml-auto flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Gespeichert:</span>
            {savedSearches.searches.slice(0, 4).map(s => (
              <Button key={s.id} variant="ghost" size="sm" className="text-xs h-6 px-2 group" onClick={() => handleLoadSearch(s)}>
                {s.name}
                <button
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => { e.stopPropagation(); savedSearches.remove(s.id) }}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <Card className="animate-fade-in-up">
          <CardContent className="p-4 space-y-4">
            {/* Row 1: Document Type + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                  <FileText className="w-3 h-3" /> Dokumenttyp
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(DOCUMENT_TYPES).map(([key, info]) => (
                    <Button
                      key={key}
                      variant={filterDocType === key ? 'default' : 'outline'}
                      size="sm"
                      className="text-[11px] h-6 px-2"
                      onClick={() => setFilterDocType(filterDocType === key ? null : key)}
                    >
                      <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: info.color }} />
                      {info.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'inbox', label: 'Eingang' },
                    { key: 'processing', label: 'In Bearbeitung' },
                    { key: 'action_required', label: 'Aktion nötig' },
                    { key: 'done', label: 'Erledigt' },
                    { key: 'archived', label: 'Archiviert' },
                  ].map(s => (
                    <Button
                      key={s.key}
                      variant={filterStatus === s.key ? 'default' : 'outline'}
                      size="sm"
                      className="text-[11px] h-6 px-2"
                      onClick={() => setFilterStatus(filterStatus === s.key ? null : s.key)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Company + Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                    <Building2 className="w-3 h-3" /> Firma
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {companies.map(c => (
                      <Button
                        key={c.id}
                        variant={filterCompany === c.id ? 'default' : 'outline'}
                        size="sm"
                        className="text-[11px] h-6 px-2"
                        onClick={() => setFilterCompany(filterCompany === c.id ? null : c.id)}
                      >
                        <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {allTags.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                    <Tag className="w-3 h-3" /> Tag
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.slice(0, 20).map(tag => (
                      <Button
                        key={tag}
                        variant={filterTag === tag ? 'default' : 'outline'}
                        size="sm"
                        className="text-[11px] h-6 px-2"
                        onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Row 3: Date Range + Amount Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                  <CalendarClock className="w-3 h-3" /> Zeitraum
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={e => setFilterDateFrom(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Von"
                  />
                  <span className="text-xs text-muted-foreground">bis</span>
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={e => setFilterDateTo(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Bis"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                  <Receipt className="w-3 h-3" /> Betrag (EUR)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={filterAmountMin}
                    onChange={e => setFilterAmountMin(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Min"
                    min="0"
                    step="0.01"
                  />
                  <span className="text-xs text-muted-foreground">bis</span>
                  <Input
                    type="number"
                    value={filterAmountMax}
                    onChange={e => setFilterAmountMax(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Max"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasQuery ? (
        <>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Suche...' : `${filteredResults.length} Ergebnis${filteredResults.length !== 1 ? 'se' : ''}${query.trim() ? ` für "${query}"` : ''}`}
          </p>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <DocumentGrid
              documents={filteredResults}
              onView={handleView}
              onFavorite={(doc) => toggleFavorite.mutate(doc)}
              onDelete={(doc) => deleteDocument.mutate(doc)}
              onAddToCollection={handleAddToCollection}
              collections={collectionInfos}
              emptyMessage="Keine Ergebnisse gefunden"
            />
          )}
        </>
      ) : (
        <div className="space-y-8">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Letzte Suchen
                </p>
                <Button variant="ghost" size="sm" onClick={handleClearRecent} className="text-xs h-7">
                  Löschen
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setQuery(search)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/30 text-sm transition-colors"
                  >
                    <Search className="w-3 h-3 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved searches */}
          {savedSearches.searches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                  <Bookmark className="w-4 h-4" />
                  Gespeicherte Suchen
                </p>
                <Button variant="ghost" size="sm" onClick={savedSearches.clear} className="text-xs h-7">
                  Alle löschen
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {savedSearches.searches.map(s => {
                  const filterCount = Object.values(s.filters).filter(Boolean).length
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleLoadSearch(s)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 text-left transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Bookmark className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          {s.query && <span>"{s.query}"</span>}
                          {filterCount > 0 && <Badge variant="secondary" className="text-[9px] h-3.5 px-1">{filterCount} Filter</Badge>}
                        </div>
                      </div>
                      <button
                        className="p-1 rounded hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={e => { e.stopPropagation(); savedSearches.remove(s.id) }}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick filter shortcuts */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Schnellfilter</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Rechnungen', type: 'rechnung', icon: '🧾' },
                { label: 'Bescheide', type: 'bescheid', icon: '📋' },
                { label: 'Vertrage', type: 'vertrag', icon: '📝' },
                { label: 'Mahnungen', type: 'mahnung', icon: '⚠️' },
              ].map(shortcut => (
                <button
                  key={shortcut.type}
                  onClick={() => { setFilterDocType(shortcut.type); setShowAdvanced(true) }}
                  className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-colors text-left"
                >
                  <span className="text-xl">{shortcut.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{shortcut.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {allDocuments.filter(d => d.document_type === shortcut.type).length} Dokumente
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-1">
              Gib einen Suchbegriff ein oder nutze die erweiterten Filter
            </p>
            <p className="text-xs text-muted-foreground">
              Tipp: Drücke <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">/</kbd> um von überall zu suchen
            </p>
          </div>
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
        />
      )}

      {/* Save Search Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4" />
              Suche speichern
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
              <Input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveSearch()}
                placeholder="z.B. Rechnungen Q1 2024"
                autoFocus
              />
            </div>
            {(query.trim() || activeAdvancedCount > 0) && (
              <div className="text-xs text-muted-foreground space-y-1">
                {query.trim() && <p>Suchbegriff: <span className="font-medium text-foreground">"{query}"</span></p>}
                {activeAdvancedCount > 0 && <p>{activeAdvancedCount} Filter aktiv</p>}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>Abbrechen</Button>
              <Button size="sm" onClick={handleSaveSearch} disabled={!saveName.trim()}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
