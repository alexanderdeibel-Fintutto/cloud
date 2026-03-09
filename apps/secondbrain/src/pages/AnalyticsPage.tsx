import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, TrendingUp, ArrowRight, FileText, Building2,
  Calendar, PieChart, Activity, Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useDocuments } from '@/hooks/useDocuments'
import { useCompanies } from '@/hooks/useCompanies'
import { useDocumentLinks } from '@/hooks/useWorkflows'
import { DOCUMENT_TYPES, TARGET_APPS } from '@/hooks/useWorkflows'
import { formatFileSize } from '@/lib/utils'
import type { Document } from '@/components/documents/DocumentCard'

function exportDocumentsCSV(docs: Document[]) {
  const headers = ['Titel', 'Typ', 'Status', 'Firma', 'Betrag', 'Datum', 'Tags', 'Absender', 'Referenz']
  const rows = docs.map(d => [
    d.title,
    DOCUMENT_TYPES[d.document_type || 'other']?.label || d.document_type || '',
    d.status || 'inbox',
    d.company_id || '',
    d.amount ? String(d.amount) : '',
    d.created_at ? new Date(d.created_at).toLocaleDateString('de-DE') : '',
    d.tags.join('; '),
    d.sender || '',
    d.reference_number || '',
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `secondbrain-export-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function AnalyticsPage() {
  const { data: documents = [] } = useDocuments()
  const { data: companies = [] } = useCompanies()
  const { data: links = [] } = useDocumentLinks()

  const stats = useMemo(() => {
    if (!documents.length) return null

    // Type breakdown
    const byType: Record<string, number> = {}
    documents.forEach(d => {
      const type = d.document_type || 'other'
      byType[type] = (byType[type] || 0) + 1
    })

    // Status breakdown
    const byStatus: Record<string, number> = {}
    documents.forEach(d => {
      const status = d.status || 'inbox'
      byStatus[status] = (byStatus[status] || 0) + 1
    })

    // Company breakdown
    const byCompany: Record<string, { name: string; color: string; count: number }> = {}
    documents.forEach(d => {
      if (d.company_id) {
        const company = companies.find(c => c.id === d.company_id)
        if (company) {
          if (!byCompany[company.id]) byCompany[company.id] = { name: company.name, color: company.color, count: 0 }
          byCompany[company.id].count++
        }
      }
    })

    // Forward breakdown
    const byTargetApp: Record<string, number> = {}
    links.forEach(l => {
      byTargetApp[l.target_app] = (byTargetApp[l.target_app] || 0) + 1
    })

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
      const count = documents.filter(doc => doc.created_at.startsWith(yearMonth)).length
      monthlyTrend.push({ month: label, count })
    }
    const maxMonthly = Math.max(...monthlyTrend.map(m => m.count), 1)

    // Priority breakdown
    const byPriority = {
      urgent: documents.filter(d => d.priority === 'urgent').length,
      high: documents.filter(d => d.priority === 'high').length,
      normal: documents.filter(d => !d.priority || d.priority === 'normal').length,
      low: documents.filter(d => d.priority === 'low').length,
    }

    // Duplicate detection (same title or very similar)
    const potentialDuplicates: { doc1: Document; doc2: Document }[] = []
    const titleMap = new Map<string, Document>()
    documents.forEach(doc => {
      const normalized = doc.title.toLowerCase().replace(/[^a-z0-9äöüß]/g, '').trim()
      if (titleMap.has(normalized)) {
        potentialDuplicates.push({ doc1: titleMap.get(normalized)!, doc2: doc })
      } else {
        titleMap.set(normalized, doc)
      }
    })

    // Amount stats
    const docsWithAmount = documents.filter(d => d.amount && d.amount > 0)
    const totalAmount = docsWithAmount.reduce((sum, d) => sum + (d.amount || 0), 0)

    return {
      total: documents.length,
      totalSize: documents.reduce((sum, d) => sum + (d.file_size || 0), 0),
      byType,
      byStatus,
      byCompany,
      byTargetApp,
      monthlyTrend,
      maxMonthly,
      byPriority,
      potentialDuplicates,
      totalAmount,
      docsWithAmountCount: docsWithAmount.length,
    }
  }, [documents, companies, links])

  if (!stats) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Statistiken
        </h1>
        <p className="text-sm text-muted-foreground mt-4">Lade Daten...</p>
      </div>
    )
  }

  const sortedTypes = Object.entries(stats.byType).sort((a, b) => b[1] - a[1])
  const maxTypeCount = Math.max(...sortedTypes.map(([, c]) => c), 1)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Statistiken & Analysen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} Dokumente, {formatFileSize(stats.totalSize)} Speicher
          </p>
        </div>
        <Button variant="outline" onClick={() => exportDocumentsCSV(documents)}>
          <Download className="w-4 h-4 mr-2" /> CSV Export
        </Button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Dokumente gesamt</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Weiterleitungen</p>
            <p className="text-3xl font-bold">{links.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Gesamtbetrag</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(stats.totalAmount)}
            </p>
            <p className="text-[10px] text-muted-foreground">{stats.docsWithAmountCount} Dokumente mit Betrag</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Speicher</p>
            <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Monatlicher Verlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {stats.monthlyTrend.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium">{m.count}</span>
                <div
                  className="w-full bg-primary/20 rounded-t-md relative overflow-hidden"
                  style={{ height: `${(m.count / stats.maxMonthly) * 100}%`, minHeight: m.count > 0 ? '4px' : '0' }}
                >
                  <div className="absolute inset-0 bg-primary rounded-t-md" />
                </div>
                <span className="text-[10px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document types breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Nach Dokumenttyp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedTypes.map(([type, count]) => {
              const info = DOCUMENT_TYPES[type] || DOCUMENT_TYPES.other
              const pct = Math.round((count / stats.total) * 100)
              return (
                <div key={type} className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] w-24 justify-center shrink-0" style={{ borderColor: info.color, color: info.color }}>
                    {info.label}
                  </Badge>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(count / maxTypeCount) * 100}%`, backgroundColor: info.color }}
                    />
                  </div>
                  <span className="text-xs font-medium w-12 text-right">{count} ({pct}%)</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" /> Nach Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const colors: Record<string, string> = {
                inbox: '#3b82f6', processing: '#f59e0b', reviewed: '#10b981',
                action_required: '#ef4444', done: '#22c55e', archived: '#6b7280',
              }
              const labels: Record<string, string> = {
                inbox: 'Eingang', processing: 'In Bearbeitung', reviewed: 'Geprüft',
                action_required: 'Aktion nötig', done: 'Erledigt', archived: 'Archiviert',
              }
              const pct = Math.round((count / stats.total) * 100)
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs w-24 shrink-0" style={{ color: colors[status] || '#6b7280' }}>
                    {labels[status] || status}
                  </span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: colors[status] || '#6b7280' }}
                    />
                  </div>
                  <span className="text-xs font-medium w-12 text-right">{count}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Company breakdown */}
        {Object.keys(stats.byCompany).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Nach Firma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(stats.byCompany).sort((a, b) => b.count - a.count).map((company) => {
                const pct = Math.round((company.count / stats.total) * 100)
                return (
                  <div key={company.name} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-28 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: company.color }} />
                      <span className="text-xs font-medium truncate">{company.name}</span>
                    </div>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: company.color }}
                      />
                    </div>
                    <span className="text-xs font-medium w-12 text-right">{company.count}</span>
                  </div>
                )
              })}
              <Separator />
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="text-xs w-28 shrink-0">Ohne Firma</span>
                <span className="text-xs">{documents.filter(d => !d.company_id).length} Dokumente</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Routing flow */}
        {Object.keys(stats.byTargetApp).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> Weiterleitungs-Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(stats.byTargetApp).sort((a, b) => b[1] - a[1]).map(([appKey, count]) => {
                const app = TARGET_APPS[appKey]
                return (
                  <div key={appKey} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-36 shrink-0">
                      <span className="text-base leading-none">{app?.icon || '📄'}</span>
                      <span className="text-xs font-medium truncate">{app?.label || appKey}</span>
                    </div>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(count / links.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Priority breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Prioritäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {[
              { key: 'urgent', label: 'Dringend', color: '#dc2626', count: stats.byPriority.urgent },
              { key: 'high', label: 'Wichtig', color: '#f97316', count: stats.byPriority.high },
              { key: 'normal', label: 'Normal', color: '#6b7280', count: stats.byPriority.normal },
              { key: 'low', label: 'Niedrig', color: '#94a3b8', count: stats.byPriority.low },
            ].map((p) => (
              <div key={p.key} className="flex-1 text-center">
                <p className="text-2xl font-bold" style={{ color: p.color }}>{p.count}</p>
                <p className="text-[10px] text-muted-foreground">{p.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Detection */}
      {stats.potentialDuplicates.length > 0 && (
        <Card className="border-orange-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-orange-600">
              <FileText className="w-4 h-4" /> Mögliche Duplikate ({stats.potentialDuplicates.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.potentialDuplicates.slice(0, 5).map(({ doc1, doc2 }, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc1.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(doc1.created_at).toLocaleDateString('de-DE')} & {new Date(doc2.created_at).toLocaleDateString('de-DE')}
                    {' — '}{formatFileSize(doc1.file_size)} / {formatFileSize(doc2.file_size)}
                  </p>
                </div>
                <Link to="/dokumente">
                  <Button variant="outline" size="sm" className="text-xs h-6">Prüfen</Button>
                </Link>
              </div>
            ))}
            {stats.potentialDuplicates.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{stats.potentialDuplicates.length - 5} weitere mögliche Duplikate
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
