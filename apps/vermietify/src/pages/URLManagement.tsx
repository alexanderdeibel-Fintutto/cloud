import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Globe,
  Search,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Clock,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Filter,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================
// TYPES
// ============================================================
type DomainStatus = 'online' | 'offline' | 'redirect' | 'error' | 'pending'
type PageStatus = 'online' | 'offline' | 'redirect' | 'error' | 'pending' | 'timeout'

interface Domain {
  id: string
  url: string
  label: string
  category: string
  status: DomainStatus
  httpCode: number | null
  hasGA: boolean
  hasGTM: boolean
  pageTitle: string
  totalPages: number
  pagesOnline: number
  pagesOffline: number
  lastCheckedAt: string | null
}

interface Page {
  id: string
  domainId: string
  url: string
  path: string
  status: PageStatus
  httpCode: number | null
  pageTitle: string
  hasGA: boolean
  hasGTM: boolean
  hasImpressum: boolean
  hasDatenschutz: boolean
  depth: number
  lastCheckedAt: string | null
}

// ============================================================
// DEMO DATA (wird später durch Supabase ersetzt)
// ============================================================
const DEMO_DOMAINS: Domain[] = [
  { id: '1', url: 'https://app.bescheidboxer.de', label: 'BescheidBoxer App', category: 'app', status: 'online', httpCode: 200, hasGA: true, hasGTM: true, pageTitle: 'BescheidBoxer - Bürgergeld Bescheid prüfen', totalPages: 47, pagesOnline: 43, pagesOffline: 4, lastCheckedAt: '2025-02-12T10:00:00Z' },
  { id: '2', url: 'https://fintutto.de', label: 'Fintutto Landing', category: 'landing', status: 'online', httpCode: 200, hasGA: false, hasGTM: false, pageTitle: 'Fintutto - Finanzielle Klarheit', totalPages: 12, pagesOnline: 10, pagesOffline: 2, lastCheckedAt: '2025-02-12T10:00:00Z' },
  { id: '3', url: 'https://nebenkostenrechner.eu', label: 'Nebenkostenrechner', category: 'checker', status: 'pending', httpCode: null, hasGA: false, hasGTM: false, pageTitle: '', totalPages: 0, pagesOnline: 0, pagesOffline: 0, lastCheckedAt: null },
  { id: '4', url: 'https://mieterhoehung.eu', label: 'Mieterhöhung Checker', category: 'checker', status: 'offline', httpCode: null, hasGA: false, hasGTM: false, pageTitle: '', totalPages: 0, pagesOnline: 0, pagesOffline: 0, lastCheckedAt: null },
  { id: '5', url: 'https://betriebskostencheck.de', label: 'Betriebskosten Check', category: 'checker', status: 'redirect', httpCode: 301, hasGA: false, hasGTM: false, pageTitle: '', totalPages: 5, pagesOnline: 3, pagesOffline: 2, lastCheckedAt: '2025-02-11T15:30:00Z' },
  { id: '6', url: 'https://vermietify.de', label: 'Vermietify', category: 'portal', status: 'online', httpCode: 200, hasGA: true, hasGTM: true, pageTitle: 'Vermietify - Immobilienverwaltung', totalPages: 8, pagesOnline: 8, pagesOffline: 0, lastCheckedAt: '2025-02-12T09:00:00Z' },
]

const DEMO_PAGES: Page[] = [
  { id: 'p1', domainId: '1', url: 'https://app.bescheidboxer.de/', path: '/', status: 'online', httpCode: 200, pageTitle: 'BescheidBoxer', hasGA: true, hasGTM: true, hasImpressum: true, hasDatenschutz: true, depth: 0, lastCheckedAt: '2025-02-12T10:00:00Z' },
  { id: 'p2', domainId: '1', url: 'https://app.bescheidboxer.de/rechner', path: '/rechner', status: 'online', httpCode: 200, pageTitle: 'Rechner', hasGA: true, hasGTM: true, hasImpressum: true, hasDatenschutz: true, depth: 1, lastCheckedAt: '2025-02-12T10:00:00Z' },
  { id: 'p3', domainId: '1', url: 'https://app.bescheidboxer.de/rechner/buergergeld', path: '/rechner/buergergeld', status: 'online', httpCode: 200, pageTitle: 'Bürgergeld Rechner', hasGA: true, hasGTM: true, hasImpressum: true, hasDatenschutz: true, depth: 2, lastCheckedAt: '2025-02-12T10:00:00Z' },
  { id: 'p4', domainId: '1', url: 'https://app.bescheidboxer.de/impressum', path: '/impressum', status: 'online', httpCode: 200, pageTitle: 'Impressum', hasGA: true, hasGTM: true, hasImpressum: true, hasDatenschutz: true, depth: 1, lastCheckedAt: '2025-02-12T10:00:00Z' },
  { id: 'p5', domainId: '1', url: 'https://app.bescheidboxer.de/forum', path: '/forum', status: 'offline', httpCode: 404, pageTitle: '', hasGA: false, hasGTM: false, hasImpressum: false, hasDatenschutz: false, depth: 1, lastCheckedAt: '2025-02-12T10:00:00Z' },
]

// ============================================================
// COMPONENTS
// ============================================================
function StatusBadge({ status }: { status: DomainStatus | PageStatus }) {
  const config: Record<string, { bg: string; fg: string; icon: typeof CheckCircle2; label: string }> = {
    online: { bg: 'bg-emerald-100', fg: 'text-emerald-700', icon: CheckCircle2, label: 'Online' },
    offline: { bg: 'bg-red-100', fg: 'text-red-700', icon: XCircle, label: 'Offline' },
    redirect: { bg: 'bg-amber-100', fg: 'text-amber-700', icon: ArrowRight, label: 'Redirect' },
    error: { bg: 'bg-red-100', fg: 'text-red-700', icon: AlertTriangle, label: 'Error' },
    pending: { bg: 'bg-gray-100', fg: 'text-gray-500', icon: Clock, label: 'Ausstehend' },
    timeout: { bg: 'bg-orange-100', fg: 'text-orange-700', icon: Clock, label: 'Timeout' },
  }
  const c = config[status] || config.pending
  const Icon = c.icon
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', c.bg, c.fg)}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  )
}

function TrackingBadge({ hasGA, hasGTM }: { hasGA: boolean; hasGTM: boolean }) {
  if (hasGA && hasGTM) return <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">GA+GTM</span>
  if (hasGA) return <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">GA</span>
  if (hasGTM) return <span className="text-xs font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">GTM</span>
  return <span className="text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">KEIN TRACKING</span>
}

function ProgressBar({ online, total }: { online: number; total: number }) {
  const pct = total > 0 ? Math.round((online / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            pct === 100 ? 'bg-emerald-500' : pct > 70 ? 'bg-amber-500' : 'bg-red-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{online}/{total}</span>
    </div>
  )
}

function DomainRow({ domain, isExpanded, onToggle }: {
  domain: Domain
  isExpanded: boolean
  onToggle: () => void
}) {
  const pages = DEMO_PAGES.filter(p => p.domainId === domain.id)

  return (
    <>
      <tr
        className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="p-3">
          <button className="text-muted-foreground hover:text-foreground">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </td>
        <td className="p-3">
          <div className="flex flex-col">
            <span className="font-medium text-sm">{domain.label || domain.url}</span>
            <a
              href={domain.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {domain.url} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </td>
        <td className="p-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
            {domain.category}
          </span>
        </td>
        <td className="p-3"><StatusBadge status={domain.status} /></td>
        <td className="p-3">
          <span className="text-sm font-mono">
            {domain.httpCode || '–'}
          </span>
        </td>
        <td className="p-3"><TrackingBadge hasGA={domain.hasGA} hasGTM={domain.hasGTM} /></td>
        <td className="p-3 min-w-[140px]">
          <ProgressBar online={domain.pagesOnline} total={domain.totalPages} />
        </td>
        <td className="p-3 text-xs text-muted-foreground">
          {domain.lastCheckedAt
            ? new Date(domain.lastCheckedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            : '–'
          }
        </td>
      </tr>

      {/* Expanded: Sub-pages */}
      {isExpanded && pages.length > 0 && pages.map((page) => (
        <tr key={page.id} className="border-b bg-muted/30">
          <td className="p-2 pl-6"></td>
          <td className="p-2 pl-6" colSpan={2}>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">↳</span>
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                {page.path} <ExternalLink className="h-3 w-3" />
              </a>
              {page.pageTitle && (
                <span className="text-xs text-muted-foreground/60 truncate max-w-[200px]">
                  – {page.pageTitle}
                </span>
              )}
            </div>
          </td>
          <td className="p-2"><StatusBadge status={page.status} /></td>
          <td className="p-2">
            <span className="text-xs font-mono">{page.httpCode || '–'}</span>
          </td>
          <td className="p-2"><TrackingBadge hasGA={page.hasGA} hasGTM={page.hasGTM} /></td>
          <td className="p-2">
            <div className="flex gap-1">
              {page.hasImpressum
                ? <span className="text-xs text-emerald-600">Impr.</span>
                : <span className="text-xs text-red-500">!Impr.</span>
              }
              {page.hasDatenschutz
                ? <span className="text-xs text-emerald-600">DSGVO</span>
                : <span className="text-xs text-red-500">!DSGVO</span>
              }
            </div>
          </td>
          <td className="p-2 text-xs text-muted-foreground">
            Tiefe {page.depth}
          </td>
        </tr>
      ))}

      {isExpanded && pages.length === 0 && (
        <tr className="border-b bg-muted/30">
          <td className="p-3 pl-10 text-xs text-muted-foreground italic" colSpan={8}>
            Noch nicht gecrawlt. Starte einen Crawl um Unterseiten zu finden.
          </td>
        </tr>
      )}
    </>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================
export function URLManagement() {
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isChecking, setIsChecking] = useState(false)

  const domains = DEMO_DOMAINS

  // Stats
  const totalDomains = domains.length
  const onlineDomains = domains.filter(d => d.status === 'online').length
  const offlineDomains = domains.filter(d => d.status === 'offline' || d.status === 'error').length
  const pendingDomains = domains.filter(d => d.status === 'pending').length
  const totalPages = domains.reduce((sum, d) => sum + d.totalPages, 0)
  const onlinePages = domains.reduce((sum, d) => sum + d.pagesOnline, 0)

  // Filter
  const filteredDomains = domains.filter(d => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!d.url.toLowerCase().includes(q) && !d.label.toLowerCase().includes(q)) return false
    }
    if (filterStatus !== 'all' && d.status !== filterStatus) return false
    if (filterCategory !== 'all' && d.category !== filterCategory) return false
    return true
  })

  const categories = [...new Set(domains.map(d => d.category))]

  const toggleDomain = (id: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCheckAll = () => {
    setIsChecking(true)
    // TODO: Trigger actual check via Supabase Edge Function or CLI
    setTimeout(() => setIsChecking(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            URL Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Alle Domains und Unterseiten im Fintutto Ecosystem verwalten und prüfen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Domain hinzufügen
          </Button>
          <Button size="sm" onClick={handleCheckAll} disabled={isChecking}>
            <RefreshCw className={cn("h-4 w-4 mr-1", isChecking && "animate-spin")} />
            {isChecking ? 'Prüfe...' : 'Alle prüfen'}
          </Button>
        </div>
      </div>

      {/* Stats KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domains</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDomains}</div>
            <p className="text-xs text-muted-foreground">im Ecosystem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{onlineDomains}</div>
            <p className="text-xs text-muted-foreground">Domains erreichbar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{offlineDomains}</div>
            <p className="text-xs text-muted-foreground">brauchen Aufmerksamkeit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingDomains}</div>
            <p className="text-xs text-muted-foreground">noch nicht geprüft</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unterseiten</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlinePages}<span className="text-sm text-muted-foreground font-normal">/{totalPages}</span></div>
            <p className="text-xs text-muted-foreground">Seiten online</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-muted-foreground">Suche</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Domain oder Label suchen..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Alle</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="redirect">Redirect</option>
                <option value="pending">Ausstehend</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Kategorie</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Alle</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Table */}
      <Card>
        <CardHeader>
          <CardTitle>Domains & Unterseiten</CardTitle>
          <CardDescription>
            Klicke auf eine Domain um die Unterseiten zu sehen. {filteredDomains.length} von {totalDomains} Domains angezeigt.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 w-8"></th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Domain</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Kategorie</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">HTTP</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Tracking</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Seiten</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Zuletzt geprüft</th>
                </tr>
              </thead>
              <tbody>
                {filteredDomains.map((domain) => (
                  <DomainRow
                    key={domain.id}
                    domain={domain}
                    isExpanded={expandedDomains.has(domain.id)}
                    onToggle={() => toggleDomain(domain.id)}
                  />
                ))}
                {filteredDomains.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Keine Domains gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Crawler starten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Crawle eine Domain komplett und finde alle Unterseiten automatisch.
            </p>
            <code className="text-xs bg-muted p-2 rounded block mb-3 text-muted-foreground">
              npx ts-node scripts/crawl-urls.ts --domain example.de
            </code>
            <Button variant="outline" size="sm" className="w-full">
              Crawler-Dokumentation
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Google Sheet Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Prüfe URLs direkt in Google Sheets mit dem Apps Script.
            </p>
            <code className="text-xs bg-muted p-2 rounded block mb-3 text-muted-foreground">
              url-audit/google_apps_script.js
            </code>
            <Button variant="outline" size="sm" className="w-full">
              Script kopieren
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Python Audit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Vollständiger SEO-Audit aller 218 URLs mit Report-Generierung.
            </p>
            <code className="text-xs bg-muted p-2 rounded block mb-3 text-muted-foreground">
              python3 url-audit/check_all_urls.py
            </code>
            <Button variant="outline" size="sm" className="w-full">
              Audit starten
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
