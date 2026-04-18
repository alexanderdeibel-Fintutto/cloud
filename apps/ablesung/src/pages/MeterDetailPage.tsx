/**
 * MeterDetailPage.tsx — Ablesung
 *
 * Zähler-Detailansicht mit vollständiger SecondBrain-Integration.
 * Zeigt Zähler-Stammdaten, Ablesungen und alle SecondBrain-Dokumente,
 * die diesem Zähler zugeordnet sind (z.B. gescannte Versorger-Rechnungen).
 *
 * Eigenständige Implementierung ohne @fintutto/shared oder @tanstack/react-query.
 * Verwendet nativen useEffect + useState-Pattern.
 */

import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import {
  ArrowLeft,
  Zap,
  Flame,
  Droplets,
  ThermometerSun,
  BarChart3,
  Brain,
  FileText,
  ExternalLink,
  Plus,
  Loader2,
  Calendar,
  Hash,
  TrendingUp,
  RefreshCw,
  ScanLine,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

// ── Supabase-Client ──────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aaefocdqgdgexkcrjhks.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
})

// ── Typen ────────────────────────────────────────────────────────────────────

interface Meter {
  id: string
  meter_number: string
  meter_type: string
  location: string | null
  installation_date: string | null
  is_active: boolean
  notes: string | null
  unit_id: string
  created_at: string
}

interface MeterReading {
  id: string
  reading_value: number
  reading_date: string
  source: string
  notes: string | null
  created_at: string
}

interface SbDocument {
  id: string
  title: string
  file_name: string
  file_type: string
  file_size: number
  document_type: string | null
  ocr_status: string
  summary: string | null
  created_at: string
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

const METER_TYPE_CONFIG: Record<string, { label: string; icon: typeof Zap; color: string; unit: string }> = {
  electricity: { label: 'Strom', icon: Zap, color: 'text-yellow-600 bg-yellow-100', unit: 'kWh' },
  gas: { label: 'Gas', icon: Flame, color: 'text-orange-600 bg-orange-100', unit: 'kWh' },
  water_cold: { label: 'Kaltwasser', icon: Droplets, color: 'text-blue-600 bg-blue-100', unit: 'm³' },
  water_hot: { label: 'Warmwasser', icon: Droplets, color: 'text-red-600 bg-red-100', unit: 'm³' },
  heating: { label: 'Heizung', icon: ThermometerSun, color: 'text-red-600 bg-red-100', unit: 'kWh' },
  other: { label: 'Sonstiges', icon: BarChart3, color: 'text-gray-600 bg-gray-100', unit: '' },
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const SB_URL = 'https://secondbrain.fintutto.cloud'

// ── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function MeterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [meter, setMeter] = useState<Meter | null>(null)
  const [readings, setReadings] = useState<MeterReading[]>([])
  const [sbDocs, setSbDocs] = useState<SbDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [sbLoading, setSbLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'readings' | 'documents'>('overview')

  useEffect(() => {
    if (!id) return
    loadMeter()
    loadReadings()
    loadSecondBrainDocs()
  }, [id])

  async function loadMeter() {
    setLoading(true)
    const { data } = await supabase
      .from('meters')
      .select('*')
      .eq('id', id!)
      .single()
    if (data) setMeter(data as Meter)
    setLoading(false)
  }

  async function loadReadings() {
    const { data } = await supabase
      .from('meter_readings')
      .select('id, reading_value, reading_date, source, notes, created_at')
      .eq('meter_id', id!)
      .order('reading_date', { ascending: false })
      .limit(20)
    if (data) setReadings(data as MeterReading[])
  }

  async function loadSecondBrainDocs() {
    setSbLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_documents_for_entity', {
        p_entity_type: 'meter',
        p_entity_id: id!,
      })
      if (!error && data) setSbDocs((data as SbDocument[]) ?? [])
    } catch {
      setSbDocs([])
    } finally {
      setSbLoading(false)
    }
  }

  // ── Berechnungen ───────────────────────────────────────────────────────────

  const latestReading = readings[0]
  const previousReading = readings[1]
  const consumption =
    latestReading && previousReading
      ? latestReading.reading_value - previousReading.reading_value
      : null

  const meterConfig = meter ? (METER_TYPE_CONFIG[meter.meter_type] || METER_TYPE_CONFIG.other) : null
  const MeterIcon = meterConfig?.icon || BarChart3

  const uploadLink = `${SB_URL}/upload?context=meter&id=${id}`

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!meter) {
    return (
      <div className="container py-12 text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Zähler nicht gefunden.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Zurück zum Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6 max-w-4xl">
      {/* Zurück-Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Dashboard
      </Link>

      {/* Zähler-Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 ${meterConfig?.color}`}>
              <MeterIcon className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{meterConfig?.label}-Zähler</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  meter.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {meter.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" />
                  <span className="font-mono">{meter.meter_number}</span>
                </div>
                {meter.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span>📍 {meter.location}</span>
                  </div>
                )}
                {meter.installation_date && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Eingebaut: {formatDate(meter.installation_date)}</span>
                  </div>
                )}
              </div>
              {meter.notes && (
                <p className="text-sm text-muted-foreground mt-2 italic">{meter.notes}</p>
              )}
            </div>
          </div>

          {/* KPI-Zeile */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {latestReading ? latestReading.reading_value.toLocaleString('de-DE') : '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Letzter Stand ({meterConfig?.unit})
              </p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${consumption !== null && consumption > 0 ? 'text-orange-500' : ''}`}>
                {consumption !== null ? consumption.toLocaleString('de-DE') : '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Verbrauch seit letzter Ablesung ({meterConfig?.unit})
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{readings.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Ablesungen gesamt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b flex gap-0">
        {(
          [
            { key: 'overview', label: 'Übersicht', icon: BarChart3 },
            { key: 'readings', label: 'Ablesungen', icon: TrendingUp },
            { key: 'documents', label: 'Dokumente', icon: Brain },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {key === 'documents' && sbDocs.length > 0 && (
              <span className="text-xs bg-indigo-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                {sbDocs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Übersicht */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Zähler-Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Zähler-Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Zähler-Typ</p>
                <p className="text-sm font-medium">{meterConfig?.label}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Zählernummer</p>
                <p className="text-sm font-mono">{meter.meter_number}</p>
              </div>
              {meter.location && (
                <div>
                  <p className="text-xs text-muted-foreground">Standort</p>
                  <p className="text-sm">{meter.location}</p>
                </div>
              )}
              {meter.installation_date && (
                <div>
                  <p className="text-xs text-muted-foreground">Einbaudatum</p>
                  <p className="text-sm">{formatDate(meter.installation_date)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  meter.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {meter.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* SecondBrain-Vorschau */}
          <Card className="border-indigo-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-indigo-500" />
                <span className="text-indigo-900">Verknüpfte Dokumente</span>
                {sbDocs.length > 0 && (
                  <span className="text-xs bg-indigo-500 text-white rounded-full px-2 py-0.5">
                    {sbDocs.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sbLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                </div>
              ) : sbDocs.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-indigo-200 rounded-lg">
                  <Brain className="h-6 w-6 mx-auto mb-2 text-indigo-300" />
                  <p className="text-xs text-muted-foreground mb-3">
                    Noch keine Dokumente verknüpft
                  </p>
                  <a
                    href={uploadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 border border-indigo-300 rounded-md px-2.5 py-1.5 hover:bg-indigo-50 transition-colors"
                  >
                    <ScanLine className="h-3.5 w-3.5" />
                    Rechnung scannen
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {sbDocs.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => window.open(`${SB_URL}/dokumente?view=${doc.id}`, '_blank')}
                      className="flex items-center gap-2.5 p-2 border border-indigo-100 rounded-lg hover:bg-indigo-50/50 cursor-pointer transition-all"
                    >
                      <div className="h-7 w-7 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3.5 w-3.5 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </p>
                      </div>
                      <ExternalLink className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                    </div>
                  ))}
                  {sbDocs.length > 3 && (
                    <button
                      onClick={() => setActiveTab('documents')}
                      className="w-full text-xs text-indigo-600 text-center py-1.5 hover:underline"
                    >
                      +{sbDocs.length - 3} weitere anzeigen
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Ablesungen */}
      {activeTab === 'readings' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Ablesungen
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  {readings.length}
                </span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadReadings}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {readings.length === 0 ? (
              <div className="text-center py-10">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Noch keine Ablesungen vorhanden.</p>
                <Link
                  to="/ocr"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ScanLine className="h-4 w-4" />
                  Rechnung scannen
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-3 py-2.5 font-medium">Datum</th>
                      <th className="text-right px-3 py-2.5 font-medium">
                        Stand ({meterConfig?.unit})
                      </th>
                      <th className="text-right px-3 py-2.5 font-medium">
                        Verbrauch
                      </th>
                      <th className="text-left px-3 py-2.5 font-medium">Quelle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {readings.map((r, idx) => {
                      const prev = readings[idx + 1]
                      const diff = prev ? r.reading_value - prev.reading_value : null
                      return (
                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {formatDate(r.reading_date)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-medium">
                            {r.reading_value.toLocaleString('de-DE', { minimumFractionDigits: 3 })}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            {diff !== null ? (
                              <span className={diff > 0 ? 'text-orange-600' : 'text-green-600'}>
                                {diff > 0 ? '+' : ''}{diff.toLocaleString('de-DE', { minimumFractionDigits: 3 })}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                              {r.source === 'ocr' ? 'OCR' : r.source === 'manual' ? 'Manuell' : r.source}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Dokumente */}
      {activeTab === 'documents' && (
        <Card className="border-indigo-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-indigo-500" />
                <span className="text-indigo-900">SecondBrain-Dokumente</span>
                {!sbLoading && (
                  <span className="text-xs bg-indigo-500 text-white rounded-full px-2 py-0.5">
                    {sbDocs.length}
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadSecondBrainDocs}
                  disabled={sbLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${sbLoading ? 'animate-spin' : ''}`} />
                </Button>
                <a
                  href={uploadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs border border-indigo-300 text-indigo-600 rounded-md px-3 py-1.5 hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Hochladen
                </a>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sbLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              </div>
            ) : sbDocs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-indigo-200 rounded-xl bg-indigo-50/30">
                <Brain className="h-10 w-10 mx-auto mb-3 text-indigo-300" />
                <p className="text-sm text-muted-foreground mb-1">
                  Noch keine Dokumente verknüpft
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Scanne Versorger-Rechnungen in SecondBrain und ordne sie diesem Zähler zu.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href={uploadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 border border-indigo-300 rounded-md px-3 py-2 hover:bg-indigo-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    In SecondBrain hochladen
                  </a>
                  <Link
                    to="/ocr"
                    className="inline-flex items-center gap-1.5 text-sm text-primary border border-primary/30 rounded-md px-3 py-2 hover:bg-primary/5 transition-colors"
                  >
                    <ScanLine className="h-4 w-4" />
                    Rechnung scannen
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {sbDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => window.open(`${SB_URL}/dokumente?view=${doc.id}`, '_blank')}
                    className="flex items-center gap-3 p-3 border border-indigo-100 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all"
                  >
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {doc.document_type && (
                          <span className="text-xs border border-indigo-200 text-indigo-600 rounded px-1.5 py-0.5">
                            {doc.document_type}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(doc.file_size)} · {formatDate(doc.created_at)}
                        </span>
                        {doc.ocr_status === 'completed' && (
                          <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">
                            OCR ✓
                          </span>
                        )}
                      </div>
                      {doc.summary && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                          {doc.summary}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                  </div>
                ))}

                <a
                  href={`${SB_URL}/dokumente?filter=meter:${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-lg py-2.5 hover:bg-indigo-50 transition-colors mt-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Alle Dokumente in SecondBrain öffnen
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
