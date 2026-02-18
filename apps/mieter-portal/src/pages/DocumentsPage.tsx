import { useEffect, useState } from 'react'
import { useAuth, getSupabase } from '@fintutto/core'
import { Card, CardContent, Badge, Skeleton, EmptyState } from '@fintutto/ui'
import { FileText, Download, Search, File, FileImage, FileSpreadsheet } from 'lucide-react'
import { Input } from '@fintutto/ui'

interface TenantDocument {
  id: string
  name: string
  file_type: string | null
  file_size: number | null
  category: string | null
  created_at: string
  file_url: string | null
}

const categoryLabels: Record<string, string> = {
  lease: 'Mietvertrag',
  invoice: 'Rechnung',
  notice: 'Bescheid',
  correspondence: 'Korrespondenz',
  protocol: 'Protokoll',
  other: 'Sonstiges',
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return <File className="h-5 w-5" />
  if (fileType.includes('image')) return <FileImage className="h-5 w-5" />
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
    return <FileSpreadsheet className="h-5 w-5" />
  }
  return <FileText className="h-5 w-5" />
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<TenantDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadDocuments() {
      if (!user) return
      setIsLoading(true)

      try {
        const supabase = getSupabase()

        // Lade Dokumente, die dem Mieter zugeordnet sind
        const { data: docs } = await supabase
          .from('documents')
          .select('id, name, file_type, file_size, category, created_at, file_url')
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false })

        setDocuments(docs ?? [])
      } catch (err) {
        console.error('Documents load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [user])

  const filtered = documents.filter((doc) =>
    !search ||
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    (doc.category && categoryLabels[doc.category]?.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDownload = (doc: TenantDocument) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meine Dokumente</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Dokument suchen..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title={search ? 'Keine Ergebnisse' : 'Noch keine Dokumente'}
          description="Hier erscheinen Ihre Mietvertraege, Rechnungen und andere Dokumente."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
                  {getFileIcon(doc.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{doc.name}</span>
                    {doc.category && (
                      <Badge variant="secondary">
                        {categoryLabels[doc.category] ?? doc.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(doc.created_at).toLocaleDateString('de-DE')}</span>
                    {doc.file_size && <span>{formatFileSize(doc.file_size)}</span>}
                  </div>
                </div>
                {doc.file_url && (
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors flex-shrink-0"
                    title="Herunterladen"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
