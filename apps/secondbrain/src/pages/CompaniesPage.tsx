import { useState } from 'react'
import { Building2, Plus, Pencil, Trash2, FileText, ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany, type Company } from '@/hooks/useCompanies'
import { useDocuments } from '@/hooks/useDocuments'
import DocumentGrid from '@/components/documents/DocumentGrid'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { useToggleFavorite } from '@/hooks/useDocuments'
import { useCollections, useAddDocumentToCollection } from '@/hooks/useCollections'
import type { Document } from '@/components/documents/DocumentCard'
import { toast } from 'sonner'

const COMPANY_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#6366f1', '#d97706',
]

export default function CompaniesPage() {
  const { data: companies = [], isLoading } = useCompanies()
  const { data: allDocuments = [] } = useDocuments()
  const { data: collections = [] } = useCollections()
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const deleteCompany = useDeleteCompany()
  const toggleFavorite = useToggleFavorite()
  const addToCollection = useAddDocumentToCollection()

  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [color, setColor] = useState(COMPANY_COLORS[0])

  const collectionInfos = collections.map(c => ({ id: c.id, name: c.name, color: c.color }))

  const companyDocs = selectedCompany
    ? allDocuments.filter(d => d.company_id === selectedCompany.id)
    : []

  const handleCreate = () => {
    if (!name.trim()) return
    createCompany.mutate({
      name: name.trim(),
      short_name: shortName.trim() || undefined,
      tax_id: taxId.trim() || undefined,
      color,
    }, {
      onSuccess: () => {
        setName('')
        setShortName('')
        setTaxId('')
        setShowCreate(false)
      }
    })
  }

  const handleUpdate = () => {
    if (!editingId || !name.trim()) return
    updateCompany.mutate({
      id: editingId,
      name: name.trim(),
      short_name: shortName.trim() || undefined,
      tax_id: taxId.trim() || undefined,
      color,
    }, {
      onSuccess: () => {
        setEditingId(null)
        setName('')
        setShortName('')
        setTaxId('')
      }
    })
  }

  const startEdit = (company: Company) => {
    setEditingId(company.id)
    setName(company.name)
    setShortName(company.short_name || '')
    setTaxId(company.tax_id || '')
    setColor(company.color)
    setShowCreate(false)
  }

  // Detail view
  if (selectedCompany) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedCompany(null)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedCompany.color }} />
          <div>
            <h1 className="text-xl font-bold">{selectedCompany.name}</h1>
            <p className="text-sm text-muted-foreground">
              {companyDocs.length} Dokumente
              {selectedCompany.tax_id && ` · St.-Nr.: ${selectedCompany.tax_id}`}
            </p>
          </div>
        </div>

        <DocumentGrid
          documents={companyDocs}
          onView={setSelectedDoc}
          onFavorite={(doc) => toggleFavorite.mutate(doc)}
          onDelete={() => {}}
          onAddToCollection={(doc, colId) => {
            addToCollection.mutate({ documentId: doc.id, collectionId: colId })
            toast.success('Zu Sammlung hinzugefügt')
          }}
          collections={collectionInfos}
          emptyMessage="Keine Dokumente für diese Firma"
        />

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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Firmen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verwalte deine Firmen und ordne Dokumente zu
          </p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditingId(null); setName(''); setShortName(''); setTaxId(''); setColor(COMPANY_COLORS[0]) }}>
          <Plus className="w-4 h-4 mr-2" />
          Neue Firma
        </Button>
      </div>

      {/* Create / Edit form */}
      {(showCreate || editingId) && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{editingId ? 'Firma bearbeiten' : 'Neue Firma erstellen'}</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowCreate(false); setEditingId(null) }}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="Firmenname *"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (editingId ? handleUpdate() : handleCreate())}
            />
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="Kurzname (optional)"
              value={shortName}
              onChange={e => setShortName(e.target.value)}
            />
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="Steuernummer (optional)"
              value={taxId}
              onChange={e => setTaxId(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Farbe:</span>
            {COMPANY_COLORS.map(c => (
              <button
                key={c}
                className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-ring ring-offset-2 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <Button onClick={editingId ? handleUpdate : handleCreate} disabled={!name.trim()}>
            {editingId ? 'Speichern' : 'Erstellen'}
          </Button>
        </div>
      )}

      {/* Companies grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Noch keine Firmen erstellt</p>
          <Button variant="outline" className="mt-3" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Erste Firma erstellen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map(company => {
            const docCount = company.document_count || 0
            const unprocessed = allDocuments.filter(d =>
              d.company_id === company.id && (!d.status || d.status === 'inbox')
            ).length

            return (
              <div
                key={company.id}
                className="doc-card cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedCompany(company)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: company.color + '20' }}>
                      <Building2 className="w-5 h-5" style={{ color: company.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{company.name}</h3>
                      {company.short_name && (
                        <p className="text-[11px] text-muted-foreground">{company.short_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(company)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCompany.mutate(company.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {company.tax_id && (
                  <p className="text-[11px] text-muted-foreground mb-2">St.-Nr.: {company.tax_id}</p>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{docCount} Dokumente</span>
                  </div>
                  {unprocessed > 0 && (
                    <Badge variant="secondary" className="text-[10px]">{unprocessed} neu</Badge>
                  )}
                </div>

                {company.is_default && (
                  <Badge variant="outline" className="text-[10px] mt-2">Standard</Badge>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
