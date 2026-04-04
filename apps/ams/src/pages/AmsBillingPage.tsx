// AMS Schaltzentrale — Admin-Seite für Abrechnungsauswertungen
// Nutzt die admin_get_* RPCs aus Migration 037
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Zap, Users, Clock, TrendingUp, Globe, Building2,
  UserCheck, Download, RefreshCw, ChevronLeft, ChevronRight,
  BarChart3, MapPin, Search
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlatformKPIs {
  total_sessions: number
  total_duration_minutes: number
  total_unique_listeners: number
  total_overage_eur: number
  total_guide_visits: number
  active_customers_30d: number
}

interface SessionRow {
  session_id: string
  started_at: string
  host_email: string
  host_name: string
  duration_minutes: number
  peak_listeners: number
  language_count: number
  session_type: string
  industry: string
  market: string
  geography_country: string
  sales_agent_name: string
  overage_cost_eur: number
  tier_name: string
}

interface IndustryRow {
  industry: string
  session_count: number
  total_duration_minutes: number
  total_listeners: number
  total_overage_eur: number
  customer_count: number
}

interface SalesRow {
  agent_id: string
  agent_name: string
  agent_email: string
  customer_count: number
  session_count: number
  total_duration_minutes: number
  total_revenue_eur: number
}

interface GeoRow {
  geography_country: string
  geography_region: string
  session_count: number
  customer_count: number
  total_duration_minutes: number
  total_overage_eur: number
}

type ActiveTab = 'sessions' | 'industries' | 'sales' | 'geography'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtMin(m: number) {
  if (!m) return '0 Min'
  if (m < 60) return `${m} Min`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}
function fmtEur(v: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v || 0)
}
function fmtNum(v: number) {
  return new Intl.NumberFormat('de-DE').format(v || 0)
}
function csvDownload(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [headers.join(';'), ...rows.map(r => headers.map(h => String(r[h] ?? '')).join(';'))].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AmsBillingPage() {
  const [kpis, setKpis] = useState<PlatformKPIs | null>(null)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [industries, setIndustries] = useState<IndustryRow[]>([])
  const [salesData, setSalesData] = useState<SalesRow[]>([])
  const [geoData, setGeoData] = useState<GeoRow[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('sessions')
  const [loading, setLoading] = useState(false)

  // Filters
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [searchQuery, setSearchQuery] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('all')
  const [filterMarket, setFilterMarket] = useState('all')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 25

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [kpiRes, sessRes, indRes, salesRes, geoRes] = await Promise.all([
      supabase.rpc('admin_get_platform_kpis', { p_date_from: dateFrom, p_date_to: dateTo }),
      supabase.rpc('admin_get_sessions_overview', {
        p_date_from: dateFrom,
        p_date_to: dateTo,
        p_search: searchQuery || null,
        p_industry: filterIndustry === 'all' ? null : filterIndustry,
        p_market: filterMarket === 'all' ? null : filterMarket,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      }),
      supabase.rpc('admin_get_industry_breakdown', { p_date_from: dateFrom, p_date_to: dateTo }),
      supabase.rpc('admin_get_sales_dashboard', { p_date_from: dateFrom, p_date_to: dateTo }),
      supabase.rpc('admin_get_geography_breakdown', { p_date_from: dateFrom, p_date_to: dateTo }),
    ])
    if (kpiRes.data) setKpis(kpiRes.data as PlatformKPIs)
    // admin_get_sessions_overview returns JSONB { total, sessions }
    if (sessRes.data) {
      const payload = sessRes.data as { total: number; sessions: SessionRow[] }
      setSessions(payload.sessions ?? (sessRes.data as SessionRow[]))
    }
    if (indRes.data) setIndustries(indRes.data as IndustryRow[])
    if (salesRes.data) setSalesData(salesRes.data as SalesRow[])
    if (geoRes.data) setGeoData(geoRes.data as GeoRow[])
    setLoading(false)
  }, [dateFrom, dateTo, searchQuery, filterIndustry, filterMarket, page])

  useEffect(() => { loadAll() }, [loadAll])

  const TABS: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'sessions', label: 'Sessions', icon: Zap },
    { id: 'industries', label: 'Branchen', icon: Building2 },
    { id: 'sales', label: 'Vertriebler', icon: UserCheck },
    { id: 'geography', label: 'Geografie', icon: Globe },
  ]

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" /> AMS Schaltzentrale
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Abrechnungs- und Nutzungsauswertung — Translator & Guide-Lösungen
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAll} disabled={loading} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Date & Filter Bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Von</label>
          <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0) }} className="w-36 h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Bis</label>
          <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0) }} className="w-36 h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Branche</label>
          <Select value={filterIndustry} onValueChange={v => { setFilterIndustry(v); setPage(0) }}>
            <SelectTrigger className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Branchen</SelectItem>
              <SelectItem value="museum">Museum</SelectItem>
              <SelectItem value="conference">Konferenz</SelectItem>
              <SelectItem value="shipping">Reederei</SelectItem>
              <SelectItem value="agency">Agentur</SelectItem>
              <SelectItem value="government">Behörde</SelectItem>
              <SelectItem value="medical">Medizin</SelectItem>
              <SelectItem value="education">Bildung</SelectItem>
              <SelectItem value="corporate">Unternehmen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Markt</label>
          <Select value={filterMarket} onValueChange={v => { setFilterMarket(v); setPage(0) }}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Märkte</SelectItem>
              <SelectItem value="dach">DACH</SelectItem>
              <SelectItem value="eu">EU</SelectItem>
              <SelectItem value="mena">MENA</SelectItem>
              <SelectItem value="apac">APAC</SelectItem>
              <SelectItem value="americas">Americas</SelectItem>
              <SelectItem value="global">Global</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 flex-1 min-w-48">
          <label className="text-xs text-muted-foreground">Suche (Kunde / E-Mail)</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Suchen…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(0) }}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Sessions gesamt', value: fmtNum(kpis.total_sessions), icon: Zap, color: 'text-blue-500' },
            { label: 'Gesamtdauer', value: fmtMin(kpis.total_duration_minutes), icon: Clock, color: 'text-violet-500' },
            { label: 'Unique Hörer', value: fmtNum(kpis.total_unique_listeners), icon: Users, color: 'text-emerald-500' },
            { label: 'Overage-Erlös', value: fmtEur(kpis.total_overage_eur), icon: TrendingUp, color: 'text-amber-500' },
            { label: 'Guide-Besuche', value: fmtNum(kpis.total_guide_visits), icon: BarChart3, color: 'text-cyan-500' },
            { label: 'Aktive Kunden (30T)', value: fmtNum(kpis.active_customers_30d), icon: UserCheck, color: 'text-rose-500' },
          ].map(kpi => (
            <Card key={kpi.label} className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <div className="text-xl font-bold tabular-nums">{kpi.value}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Sessions Tab ── */}
      {activeTab === 'sessions' && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Session-Übersicht</CardTitle>
            <Button
              variant="outline" size="sm"
              onClick={() => csvDownload(sessions as unknown as Record<string, unknown>[], `sessions_${dateFrom}_${dateTo}.csv`)}
              className="gap-1.5 h-7 text-xs"
            >
              <Download className="h-3 w-3" /> CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {['Datum', 'Kunde', 'Dauer', 'Hörer', 'Sprachen', 'Typ', 'Branche', 'Land', 'Vertriebler', 'Overage', 'Paket'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 && (
                    <tr><td colSpan={11} className="px-3 py-8 text-center text-muted-foreground">Keine Sessions im gewählten Zeitraum</td></tr>
                  )}
                  {sessions.map(s => (
                    <tr key={s.session_id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">{new Date(s.started_at).toLocaleDateString('de-DE')}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium truncate max-w-32">{s.host_name || s.host_email}</div>
                        <div className="text-muted-foreground truncate max-w-32">{s.host_email}</div>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{fmtMin(s.duration_minutes)}</td>
                      <td className="px-3 py-2 tabular-nums">{s.peak_listeners ?? '—'}</td>
                      <td className="px-3 py-2 tabular-nums">{s.language_count ?? '—'}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-[10px]">{s.session_type || 'live'}</Badge>
                      </td>
                      <td className="px-3 py-2">{s.industry || '—'}</td>
                      <td className="px-3 py-2">{s.geography_country || '—'}</td>
                      <td className="px-3 py-2">{s.sales_agent_name || '—'}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {s.overage_cost_eur > 0
                          ? <span className="text-amber-600 font-medium">{fmtEur(s.overage_cost_eur)}</span>
                          : <span className="text-muted-foreground">—</span>
                        }
                      </td>
                      <td className="px-3 py-2">{s.tier_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-2 border-t">
              <span className="text-xs text-muted-foreground">Seite {page + 1}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="h-7 w-7 p-0">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} disabled={sessions.length < PAGE_SIZE} className="h-7 w-7 p-0">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Industries Tab ── */}
      {activeTab === 'industries' && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Branchen-Auswertung</CardTitle>
            <Button variant="outline" size="sm"
              onClick={() => csvDownload(industries as unknown as Record<string, unknown>[], `branchen_${dateFrom}_${dateTo}.csv`)}
              className="gap-1.5 h-7 text-xs">
              <Download className="h-3 w-3" /> CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  {['Branche', 'Sessions', 'Gesamtdauer', 'Hörer gesamt', 'Kunden', 'Overage-Erlös'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {industries.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Keine Daten</td></tr>
                )}
                {industries.map(i => (
                  <tr key={i.industry} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{i.industry || 'Unbekannt'}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtNum(i.session_count)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtMin(i.total_duration_minutes)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtNum(i.total_listeners)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtNum(i.customer_count)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtEur(i.total_overage_eur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ── Sales Tab ── */}
      {activeTab === 'sales' && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Vertriebler-Performance</CardTitle>
            <Button variant="outline" size="sm"
              onClick={() => csvDownload(salesData as unknown as Record<string, unknown>[], `vertriebler_${dateFrom}_${dateTo}.csv`)}
              className="gap-1.5 h-7 text-xs">
              <Download className="h-3 w-3" /> CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  {['Vertriebler', 'Kunden', 'Sessions', 'Gesamtdauer', 'Umsatz (Overage)'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salesData.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Keine Daten</td></tr>
                )}
                {salesData.map(s => (
                  <tr key={s.agent_id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <div className="font-medium">{s.agent_name || s.agent_email}</div>
                      <div className="text-muted-foreground">{s.agent_email}</div>
                    </td>
                    <td className="px-3 py-2 tabular-nums">{fmtNum(s.customer_count)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtNum(s.session_count)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtMin(s.total_duration_minutes)}</td>
                    <td className="px-3 py-2 tabular-nums font-medium">{fmtEur(s.total_revenue_eur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ── Geography Tab ── */}
      {activeTab === 'geography' && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Geografie-Auswertung
            </CardTitle>
            <Button variant="outline" size="sm"
              onClick={() => csvDownload(geoData as unknown as Record<string, unknown>[], `geografie_${dateFrom}_${dateTo}.csv`)}
              className="gap-1.5 h-7 text-xs">
              <Download className="h-3 w-3" /> CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  {['Land', 'Region', 'Sessions', 'Kunden', 'Gesamtdauer', 'Overage-Erlös'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {geoData.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Keine Daten</td></tr>
                )}
                {geoData.map((g, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{g.geography_country || 'Unbekannt'}</td>
                    <td className="px-3 py-2">{g.geography_region || '—'}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtNum(g.session_count)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtNum(g.customer_count)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtMin(g.total_duration_minutes)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtEur(g.total_overage_eur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
