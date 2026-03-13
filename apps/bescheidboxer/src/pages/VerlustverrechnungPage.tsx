import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { TrendingDown, ArrowRight, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react'

interface VerlustPosition {
  id: number
  jahr: number
  einkunftsart: string
  betrag: number
  verrechnet: number
  vortrag: number
  status: 'offen' | 'teilverrechnet' | 'verrechnet'
}

const DEMO_VERLUSTE: VerlustPosition[] = [
  { id: 1, jahr: 2023, einkunftsart: 'Einkünfte aus Vermietung und Verpachtung', betrag: -15000, verrechnet: 8000, vortrag: 7000, status: 'teilverrechnet' },
  { id: 2, jahr: 2024, einkunftsart: 'Einkünfte aus Kapitalvermögen', betrag: -3500, verrechnet: 0, vortrag: 3500, status: 'offen' },
  { id: 3, jahr: 2024, einkunftsart: 'Aktienveräußerungsverluste', betrag: -8200, verrechnet: 2000, vortrag: 6200, status: 'teilverrechnet' },
  { id: 4, jahr: 2022, einkunftsart: 'Einkünfte aus Gewerbebetrieb', betrag: -25000, verrechnet: 25000, vortrag: 0, status: 'verrechnet' },
  { id: 5, jahr: 2025, einkunftsart: 'Private Veräußerungsgeschäfte', betrag: -4800, verrechnet: 0, vortrag: 4800, status: 'offen' },
  { id: 6, jahr: 2023, einkunftsart: 'Einkünfte aus selbständiger Arbeit', betrag: -12000, verrechnet: 12000, vortrag: 0, status: 'verrechnet' },
]

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  offen: { label: 'Offen', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  teilverrechnet: { label: 'Teilverrechnet', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  verrechnet: { label: 'Verrechnet', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
}

export default function VerlustverrechnungPage() {
  const [verluste] = useState<VerlustPosition[]>(DEMO_VERLUSTE)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('alle')

  const stats = useMemo(() => {
    const gesamtVerlust = verluste.reduce((s, v) => s + Math.abs(v.betrag), 0)
    const verrechnet = verluste.reduce((s, v) => s + v.verrechnet, 0)
    const offenerVortrag = verluste.reduce((s, v) => s + v.vortrag, 0)
    // Geschätzte Steuerersparnis aus bereits verrechneten Verlusten
    const steuerersparnis = Math.round(verrechnet * 0.42)
    // Potenzielle Ersparnis aus offenem Vortrag
    const potenzial = Math.round(offenerVortrag * 0.42)
    return { gesamtVerlust, verrechnet, offenerVortrag, steuerersparnis, potenzial }
  }, [verluste])

  const filtered = verluste
    .filter(v => filterStatus === 'alle' || v.status === filterStatus)
    .sort((a, b) => b.jahr - a.jahr || a.einkunftsart.localeCompare(b.einkunftsart))

  // Gruppierung nach Einkunftsart für Vortragstöpfe
  const topfe = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of verluste) {
      if (v.vortrag > 0) {
        map.set(v.einkunftsart, (map.get(v.einkunftsart) || 0) + v.vortrag)
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [verluste])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingDown className="h-6 w-6 text-red-500" />
          Verlustverrechnung
        </h1>
        <p className="text-muted-foreground mt-1">
          Verlustvorträge, Verlustrücktrag und Verrechnungstöpfe im Überblick
        </p>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Erfasste Verluste</p>
            <p className="text-2xl font-bold text-red-600">{stats.gesamtVerlust.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Bereits verrechnet</p>
            <p className="text-2xl font-bold text-green-600">{stats.verrechnet.toLocaleString('de-DE')} €</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ersparnis: ~{stats.steuerersparnis.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Offener Verlustvortrag</p>
            <p className="text-2xl font-bold text-amber-600">{stats.offenerVortrag.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Potenzielle Ersparnis</p>
            <p className="text-2xl font-bold text-blue-600">~{stats.potenzial.toLocaleString('de-DE')} €</p>
            <p className="text-xs text-muted-foreground mt-0.5">bei 42% Grenzsteuersatz</p>
          </CardContent>
        </Card>
      </div>

      {/* Verrechnungstöpfe */}
      {topfe.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Offene Verrechnungstöpfe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topfe.map(([art, betrag]) => {
                const maxBetrag = Math.max(...topfe.map(t => t[1]))
                const pct = (betrag / maxBetrag) * 100
                return (
                  <div key={art}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground truncate mr-2">{art}</span>
                      <span className="font-medium text-amber-600 whitespace-nowrap">{betrag.toLocaleString('de-DE')} €</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['alle', 'offen', 'teilverrechnet', 'verrechnet'].map(f => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              filterStatus === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border hover:bg-muted'
            }`}
          >
            {f === 'alle' ? `Alle (${verluste.length})` : `${STATUS_CONFIG[f].label} (${verluste.filter(v => v.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Verlustliste */}
      <div className="space-y-3">
        {filtered.map(v => {
          const config = STATUS_CONFIG[v.status]
          const isExpanded = expandedId === v.id
          const pctVerrechnet = Math.abs(v.betrag) > 0 ? (v.verrechnet / Math.abs(v.betrag)) * 100 : 0

          return (
            <Card key={v.id}>
              <button onClick={() => setExpandedId(isExpanded ? null : v.id)} className="w-full text-left">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2">
                        <span className="text-sm font-bold text-red-700 dark:text-red-300">{v.jahr}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">{v.einkunftsart}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.text}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Verlust: {v.betrag.toLocaleString('de-DE')} € · Vortrag: {v.vortrag.toLocaleString('de-DE')} €
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-red-600">{v.betrag.toLocaleString('de-DE')} €</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Ursprungsverlust</p>
                          <p className="font-medium text-red-600">{v.betrag.toLocaleString('de-DE')} €</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bereits verrechnet</p>
                          <p className="font-medium text-green-600">{v.verrechnet.toLocaleString('de-DE')} €</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Offener Vortrag</p>
                          <p className="font-medium text-amber-600">{v.vortrag.toLocaleString('de-DE')} €</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Verrechnungsstand</span>
                          <span>{pctVerrechnet.toFixed(0)}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pctVerrechnet}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="h-3 w-3" />
                        <span>
                          {v.einkunftsart === 'Aktienveräußerungsverluste'
                            ? 'Nur mit Aktiengewinnen verrechenbar (§ 20 Abs. 6 S. 5 EStG)'
                            : v.einkunftsart === 'Private Veräußerungsgeschäfte'
                            ? 'Nur mit privaten Veräußerungsgewinnen verrechenbar (§ 23 Abs. 3 S. 7 EStG)'
                            : 'Horizontale und vertikale Verlustverrechnung möglich'
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </button>
            </Card>
          )
        })}
      </div>

      {/* Hinweise */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <p><strong>Mindestbesteuerung:</strong> Verlustvortrag ist nur bis 1 Mio. € unbeschränkt verrechenbar. Darüber hinaus 60% des verbleibenden Gesamtbetrags der Einkünfte.</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <p><strong>Verlustrücktrag:</strong> Verluste können 1 Jahr zurückgetragen werden (max. 10 Mio. €). Verlustvorträge sind zeitlich unbegrenzt.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
