import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderOpen,
  FileText,
  Image,
  Search,
  Download,
  Eye,
  Calendar,
  HardDrive,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  File,
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useBescheidContext } from '../contexts/BescheidContext'
import { formatDate } from '../lib/utils'
import { BESCHEID_TYP_LABELS } from '../types/bescheid'
import type { BescheidTyp } from '../types/bescheid'

type ViewMode = 'grid' | 'list'
type SortBy = 'datum' | 'name' | 'typ' | 'groesse'

interface Dokument {
  id: string
  name: string
  bescheidId: string
  bescheidTitel: string
  typ: BescheidTyp
  steuerjahr: number
  url: string | null
  datum: string
  groesse: number // simulated
  format: 'pdf' | 'jpg' | 'png' | 'unknown'
}

function getFormatFromUrl(url: string | null): 'pdf' | 'jpg' | 'png' | 'unknown' {
  if (!url) return 'unknown'
  const lower = url.toLowerCase()
  if (lower.includes('.pdf')) return 'pdf'
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'jpg'
  if (lower.includes('.png')) return 'png'
  return 'pdf' // default assumption
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const FORMAT_CONFIG = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/40', label: 'PDF' },
  jpg: { icon: Image, color: 'text-fintutto-blue-500', bg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40', label: 'JPG' },
  png: { icon: Image, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40', label: 'PNG' },
  unknown: { icon: File, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Datei' },
}

export default function DokumentenPage() {
  const { bescheide } = useBescheidContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('datum')
  const [sortAsc, setSortAsc] = useState(false)
  const [filterFormat, setFilterFormat] = useState<string>('alle')

  // Build document list from Bescheide
  const dokumente: Dokument[] = useMemo(() => {
    return bescheide
      .filter(b => b.dokumentUrl)
      .map(b => ({
        id: b.id,
        name: `${b.titel}.${getFormatFromUrl(b.dokumentUrl)}`,
        bescheidId: b.id,
        bescheidTitel: b.titel,
        typ: b.typ,
        steuerjahr: b.steuerjahr,
        url: b.dokumentUrl,
        datum: b.createdAt,
        groesse: Math.floor(500000 + Math.random() * 5000000), // simulated
        format: getFormatFromUrl(b.dokumentUrl),
      }))
  }, [bescheide])

  const filtered = useMemo(() => {
    let result = dokumente

    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase()
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.bescheidTitel.toLowerCase().includes(q)
      )
    }

    if (filterFormat !== 'alle') {
      result = result.filter(d => d.format === filterFormat)
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'datum':
          cmp = new Date(a.datum).getTime() - new Date(b.datum).getTime()
          break
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'typ':
          cmp = a.typ.localeCompare(b.typ)
          break
        case 'groesse':
          cmp = a.groesse - b.groesse
          break
      }
      return sortAsc ? cmp : -cmp
    })

    return result
  }, [dokumente, searchQuery, filterFormat, sortBy, sortAsc])

  // Stats
  const totalSize = dokumente.reduce((s, d) => s + d.groesse, 0)
  const formatCounts = dokumente.reduce<Record<string, number>>((acc, d) => {
    acc[d.format] = (acc[d.format] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FolderOpen className="h-8 w-8" />
          Dokumente
        </h1>
        <p className="text-muted-foreground mt-1">
          Alle hochgeladenen Dateien und Bescheid-Dokumente
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2">
                <FolderOpen className="h-4 w-4 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{dokumente.length}</p>
                <p className="text-xs text-muted-foreground">Dokumente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2">
                <HardDrive className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatFileSize(totalSize)}</p>
                <p className="text-xs text-muted-foreground">Speicher</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/40 p-2">
                <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCounts.pdf || 0}</p>
                <p className="text-xs text-muted-foreground">PDFs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2">
                <Image className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{(formatCounts.jpg || 0) + (formatCounts.png || 0)}</p>
                <p className="text-xs text-muted-foreground">Bilder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dokument suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterFormat} onValueChange={setFilterFormat}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Formate</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sortierung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="datum">Datum</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="typ">Steuerart</SelectItem>
                <SelectItem value="groesse">Groesse</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSortAsc(!sortAsc)}
                className="h-9 w-9"
              >
                {sortAsc ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-9 w-9"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-9 w-9"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              {dokumente.length === 0 ? (
                <>
                  <p className="font-medium">Noch keine Dokumente</p>
                  <p className="text-sm mt-1">
                    Laden Sie Bescheide hoch, um Ihre Dokumente hier zu sehen.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">Keine Treffer</p>
                  <p className="text-sm mt-1">Versuchen Sie andere Filter.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(doc => {
            const cfg = FORMAT_CONFIG[doc.format]
            const Icon = cfg.icon
            return (
              <Card key={doc.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-3">
                  <div className="flex flex-col items-center text-center">
                    <div className={`rounded-xl ${cfg.bg} p-4 mb-3 group-hover:scale-105 transition-transform`}>
                      <Icon className={`h-8 w-8 ${cfg.color}`} />
                    </div>
                    <p className="text-sm font-medium truncate w-full">{doc.bescheidTitel}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {BESCHEID_TYP_LABELS[doc.typ]} &middot; {doc.steuerjahr}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{cfg.label}</Badge>
                      <span className="text-[10px] text-muted-foreground">{formatFileSize(doc.groesse)}</span>
                    </div>
                    <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/bescheide/${doc.bescheidId}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filtered.map(doc => {
            const cfg = FORMAT_CONFIG[doc.format]
            const Icon = cfg.icon
            return (
              <Card key={doc.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg ${cfg.bg} p-2 shrink-0`}>
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{doc.bescheidTitel}</p>
                        <Badge variant="secondary" className="text-[10px] shrink-0">{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{BESCHEID_TYP_LABELS[doc.typ]}</span>
                        <span>&middot;</span>
                        <span>{doc.steuerjahr}</span>
                        <span>&middot;</span>
                        <span>{formatFileSize(doc.groesse)}</span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(doc.datum)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link to={`/bescheide/${doc.bescheidId}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
