/**
 * MeterListPage.tsx — Ablesung
 *
 * Vollständige Zählerliste mit echter Supabase-Anbindung.
 * Zeigt alle Zähler des eingeloggten Nutzers gruppiert nach Typ,
 * mit Klick-Navigation zur MeterDetailPage.
 *
 * Eigenständige Implementierung ohne @fintutto/shared.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  Zap,
  Flame,
  Droplets,
  ThermometerSun,
  BarChart3,
  Plus,
  Loader2,
  Search,
  ChevronRight,
  Hash,
  MapPin,
  CheckCircle2,
  XCircle,
  ScanLine,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ── Supabase-Client ──────────────────────────────────────────────────────────



// ── Typen ────────────────────────────────────────────────────────────────────

type MeterType = 'electricity' | 'gas' | 'water_cold' | 'water_hot' | 'heating' | 'other'

interface Meter {
  id: string
  meter_number: string
  meter_type: MeterType
  location: string | null
  installation_date: string | null
  is_active: boolean
  notes: string | null
  unit_id: string
  created_at: string
  // Join: letzte Ablesung
  last_reading?: {
    reading_value: number
    reading_date: string
  } | null
  // Join: Einheit/Gebäude
  unit?: {
    name: string
    building?: {
      street: string
      house_number: string
      city: string
    }
  } | null
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

const METER_CONFIG: Record<MeterType, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  unit: string
}> = {
  electricity: { label: 'Strom',      icon: Zap,           color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', unit: 'kWh' },
  gas:         { label: 'Gas',        icon: Flame,         color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', unit: 'm³' },
  water_cold:  { label: 'Kaltwasser', icon: Droplets,      color: 'text-blue-600',   bgColor: 'bg-blue-50 border-blue-200',     unit: 'm³' },
  water_hot:   { label: 'Warmwasser', icon: Droplets,      color: 'text-red-500',    bgColor: 'bg-red-50 border-red-200',       unit: 'm³' },
  heating:     { label: 'Fernwärme',  icon: ThermometerSun,color: 'text-rose-600',   bgColor: 'bg-rose-50 border-rose-200',     unit: 'GJ' },
  other:       { label: 'Sonstiger',  icon: BarChart3,     color: 'text-gray-600',   bgColor: 'bg-gray-50 border-gray-200',     unit: '' },
}

// ── Komponente ───────────────────────────────────────────────────────────────

export default function MeterListPage() {
  const [meters, setMeters] = useState<Meter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<MeterType | 'all'>('all')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  // ── Daten laden ────────────────────────────────────────────────────────────

  useEffect(() => {
    loadMeters()
  }, [])

  async function loadMeters() {
    setLoading(true)
    setError(null)
    try {
      // Zähler mit letzter Ablesung laden
      const { data, error: err } = await supabase
        .from('meters')
        .select(`
          id,
          meter_number,
          meter_type,
          location,
          installation_date,
          is_active,
          notes,
          unit_id,
          created_at,
          meter_readings (
            reading_value,
            reading_date
          )
        `)
        .order('created_at', { ascending: false })

      if (err) throw err

      // Letzte Ablesung pro Zähler ermitteln
      const metersWithLastReading: Meter[] = (data || []).map((m: any) => {
        const readings = m.meter_readings || []
        const sorted = [...readings].sort((a: any, b: any) =>
          new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime()
        )
        return {
          ...m,
          last_reading: sorted[0] || null,
          meter_readings: undefined,
        }
      })

      setMeters(metersWithLastReading)
    } catch (err: any) {
      console.error('Fehler beim Laden der Zähler:', err)
      setError(err.message || 'Zähler konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

  // ── Filterlogik ────────────────────────────────────────────────────────────

  const filtered = meters.filter((m) => {
    const matchSearch =
      search === '' ||
      m.meter_number.toLowerCase().includes(search.toLowerCase()) ||
      (m.location || '').toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || m.meter_type === filterType
    const matchActive =
      filterActive === 'all' ||
      (filterActive === 'active' && m.is_active) ||
      (filterActive === 'inactive' && !m.is_active)
    return matchSearch && matchType && matchActive
  })

  // ── Statistiken ────────────────────────────────────────────────────────────

  const stats = {
    total: meters.length,
    active: meters.filter((m) => m.is_active).length,
    byType: Object.fromEntries(
      (Object.keys(METER_CONFIG) as MeterType[]).map((t) => [
        t,
        meters.filter((m) => m.meter_type === t).length,
      ])
    ),
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <section className="gradient-energy py-10">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Zähler
              </h1>
              <p className="text-white/80">
                {stats.active} aktive Zähler · {stats.total} gesamt
              </p>
            </div>
            <Button
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => alert('Zähler hinzufügen — demnächst verfügbar')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Zähler hinzufügen
            </Button>
          </div>
        </div>
      </section>

      {/* Typ-Statistiken */}
      <section className="py-6 border-b bg-muted/30">
        <div className="container">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                filterType === 'all'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              Alle ({stats.total})
            </button>
            {(Object.keys(METER_CONFIG) as MeterType[]).map((type) => {
              const cfg = METER_CONFIG[type]
              const count = stats.byType[type] || 0
              if (count === 0) return null
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${
                    filterType === type
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-muted-foreground border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  <cfg.icon className="h-3.5 w-3.5" />
                  {cfg.label} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Suche + Filter */}
      <section className="py-4">
        <div className="container">
          <div className="flex gap-3 flex-wrap items-center">
            {/* Suchfeld */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Zählernummer oder Standort suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            {/* Aktiv-Filter */}
            <div className="flex gap-2">
              {(['all', 'active', 'inactive'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterActive(f)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    filterActive === f
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  {f === 'all' ? 'Alle' : f === 'active' ? '✓ Aktiv' : '✗ Inaktiv'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Zählerliste */}
      <section className="py-4 pb-12">
        <div className="container">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Zähler werden geladen...</span>
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6 text-center text-red-700">
                <p className="font-medium">Fehler beim Laden</p>
                <p className="text-sm mt-1">{error}</p>
                <Button variant="outline" className="mt-4" onClick={loadMeters}>
                  Erneut versuchen
                </Button>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              {meters.length === 0 ? (
                <>
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Noch keine Zähler</h3>
                  <p className="text-muted-foreground mb-6">
                    Füge deinen ersten Zähler hinzu oder scanne eine Versorger-Rechnung.
                  </p>
                  <Button asChild>
                    <Link to="/ocr">
                      <ScanLine className="h-4 w-4 mr-2" />
                      Rechnung scannen
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine Treffer</h3>
                  <p className="text-muted-foreground">
                    Keine Zähler gefunden für "{search}".
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((meter) => {
                const cfg = METER_CONFIG[meter.meter_type] || METER_CONFIG.other
                const Icon = cfg.icon
                return (
                  <Link
                    key={meter.id}
                    to={`/zaehler/${meter.id}`}
                    className="block group"
                  >
                    <Card className={`border transition-all group-hover:shadow-md group-hover:border-primary/40 ${
                      !meter.is_active ? 'opacity-60' : ''
                    }`}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          {/* Typ-Icon */}
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${cfg.bgColor}`}>
                            <Icon className={`h-5 w-5 ${cfg.color}`} />
                          </div>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-sm truncate">
                                {cfg.label}
                              </span>
                              {meter.is_active ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Hash className="h-3 w-3" />
                              <span className="font-mono">{meter.meter_number}</span>
                            </div>

                            {meter.location && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{meter.location}</span>
                              </div>
                            )}

                            {meter.last_reading && (
                              <div className="mt-2 pt-2 border-t flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  Letzter Stand
                                </span>
                                <span className="text-sm font-semibold text-primary">
                                  {meter.last_reading.reading_value.toLocaleString('de-DE', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 3,
                                  })} {cfg.unit}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Chevron */}
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
