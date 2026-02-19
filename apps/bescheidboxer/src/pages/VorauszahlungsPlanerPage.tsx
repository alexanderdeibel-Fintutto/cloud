import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Calendar, AlertTriangle, CheckCircle2, Clock, TrendingUp, Wallet } from 'lucide-react'

interface Vorauszahlung {
  id: string
  steuerart: string
  quartal: string
  faellig: string
  betrag: number
  bezahlt: boolean
  bezahltAm?: string
}

const DEMO_VORAUSZAHLUNGEN: Vorauszahlung[] = [
  // ESt
  { id: 'v-01', steuerart: 'Einkommensteuer', quartal: 'Q1/2026', faellig: '2026-03-10', betrag: 2400, bezahlt: false },
  { id: 'v-02', steuerart: 'Einkommensteuer', quartal: 'Q2/2026', faellig: '2026-06-10', betrag: 2400, bezahlt: false },
  { id: 'v-03', steuerart: 'Einkommensteuer', quartal: 'Q3/2026', faellig: '2026-09-10', betrag: 2400, bezahlt: false },
  { id: 'v-04', steuerart: 'Einkommensteuer', quartal: 'Q4/2026', faellig: '2026-12-10', betrag: 2400, bezahlt: false },
  // GewSt
  { id: 'v-05', steuerart: 'Gewerbesteuer', quartal: 'Q1/2026', faellig: '2026-02-15', betrag: 950, bezahlt: true, bezahltAm: '2026-02-12' },
  { id: 'v-06', steuerart: 'Gewerbesteuer', quartal: 'Q2/2026', faellig: '2026-05-15', betrag: 950, bezahlt: false },
  { id: 'v-07', steuerart: 'Gewerbesteuer', quartal: 'Q3/2026', faellig: '2026-08-15', betrag: 950, bezahlt: false },
  { id: 'v-08', steuerart: 'Gewerbesteuer', quartal: 'Q4/2026', faellig: '2026-11-15', betrag: 950, bezahlt: false },
  // Grundsteuer
  { id: 'v-09', steuerart: 'Grundsteuer', quartal: 'Q1/2026', faellig: '2026-02-15', betrag: 215, bezahlt: true, bezahltAm: '2026-02-10' },
  { id: 'v-10', steuerart: 'Grundsteuer', quartal: 'Q2/2026', faellig: '2026-05-15', betrag: 215, bezahlt: false },
  { id: 'v-11', steuerart: 'Grundsteuer', quartal: 'Q3/2026', faellig: '2026-08-15', betrag: 215, bezahlt: false },
  { id: 'v-12', steuerart: 'Grundsteuer', quartal: 'Q4/2026', faellig: '2026-11-15', betrag: 215, bezahlt: false },
]

const STEUERART_COLORS: Record<string, string> = {
  Einkommensteuer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Gewerbesteuer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Grundsteuer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

export default function VorauszahlungsPlanerPage() {
  const [vorauszahlungen, setVorauszahlungen] = useState(DEMO_VORAUSZAHLUNGEN)
  const [filterSteuerart, setFilterSteuerart] = useState<string>('alle')
  const [filterStatus, setFilterStatus] = useState<string>('alle')

  const toggleBezahlt = (id: string) => {
    setVorauszahlungen(prev => prev.map(v =>
      v.id === id ? { ...v, bezahlt: !v.bezahlt, bezahltAm: !v.bezahlt ? new Date().toISOString().split('T')[0] : undefined } : v
    ))
  }

  const filtered = useMemo(() => {
    return vorauszahlungen.filter(v => {
      if (filterSteuerart !== 'alle' && v.steuerart !== filterSteuerart) return false
      if (filterStatus === 'bezahlt' && !v.bezahlt) return false
      if (filterStatus === 'offen' && v.bezahlt) return false
      return true
    }).sort((a, b) => new Date(a.faellig).getTime() - new Date(b.faellig).getTime())
  }, [vorauszahlungen, filterSteuerart, filterStatus])

  const stats = useMemo(() => {
    const now = new Date()
    const gesamt = vorauszahlungen.reduce((s, v) => s + v.betrag, 0)
    const bezahlt = vorauszahlungen.filter(v => v.bezahlt).reduce((s, v) => s + v.betrag, 0)
    const offen = gesamt - bezahlt
    const ueberfaellig = vorauszahlungen.filter(v => !v.bezahlt && new Date(v.faellig) < now)
    const naechste = vorauszahlungen
      .filter(v => !v.bezahlt && new Date(v.faellig) >= now)
      .sort((a, b) => new Date(a.faellig).getTime() - new Date(b.faellig).getTime())[0]

    // Liquiditätsplanung nach Monat
    const monate: Record<string, number> = {}
    vorauszahlungen.filter(v => !v.bezahlt).forEach(v => {
      const key = v.faellig.substring(0, 7)
      monate[key] = (monate[key] || 0) + v.betrag
    })

    return { gesamt, bezahlt, offen, ueberfaellig, naechste, monate: Object.entries(monate).sort((a, b) => a[0].localeCompare(b[0])) }
  }, [vorauszahlungen])

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vorauszahlungsplaner</h1>
        <p className="text-muted-foreground mt-1">
          Steuervorauszahlungen planen, verfolgen und Liquidität sichern
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Jahresgesamt 2026</p>
            <p className="text-2xl font-bold mt-1">{stats.gesamt.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Bereits bezahlt</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.bezahlt.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Noch offen</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.offen.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Überfällig</p>
            <p className={`text-2xl font-bold mt-1 ${stats.ueberfaellig.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.ueberfaellig.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Nächste Zahlung */}
      {stats.naechste && (
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nächste Zahlung</p>
                <p className="font-medium">{stats.naechste.steuerart} {stats.naechste.quartal}</p>
                <p className="text-sm text-muted-foreground">
                  Fällig: {new Date(stats.naechste.faellig).toLocaleDateString('de-DE')} ({getDaysUntil(stats.naechste.faellig)} Tage)
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">{stats.naechste.betrag.toLocaleString('de-DE')} €</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liquiditätsplanung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Liquiditätsplanung
          </CardTitle>
          <CardDescription>Ausstehende Zahlungen nach Monat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.monate.map(([monat, betrag]) => {
              const d = new Date(monat + '-01')
              const label = d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
              const maxBetrag = Math.max(...stats.monate.map(m => m[1] as number))
              const width = (betrag / maxBetrag) * 100
              return (
                <div key={monat} className="flex items-center gap-3">
                  <span className="text-sm w-36 shrink-0">{label}</span>
                  <div className="flex-1 h-8 bg-muted/50 rounded-md overflow-hidden">
                    <div className="h-full bg-primary/30 rounded-md flex items-center px-3" style={{ width: `${width}%` }}>
                      <span className="text-xs font-medium">{betrag.toLocaleString('de-DE')} €</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex gap-2">
          {['alle', 'Einkommensteuer', 'Gewerbesteuer', 'Grundsteuer'].map(f => (
            <button key={f} onClick={() => setFilterSteuerart(f)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${filterSteuerart === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
              {f === 'alle' ? 'Alle' : f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {[{ key: 'alle', label: 'Alle' }, { key: 'offen', label: 'Offen' }, { key: 'bezahlt', label: 'Bezahlt' }].map(f => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${filterStatus === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.map(v => {
          const daysUntil = getDaysUntil(v.faellig)
          const isOverdue = !v.bezahlt && daysUntil < 0
          const isSoon = !v.bezahlt && daysUntil >= 0 && daysUntil <= 14

          return (
            <Card key={v.id} className={v.bezahlt ? 'opacity-60' : isOverdue ? 'border-red-300 dark:border-red-800' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleBezahlt(v.id)} className={`p-2 rounded-lg transition-colors ${v.bezahlt ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted hover:bg-primary/10'}`}>
                    {v.bezahlt ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Wallet className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-medium text-sm ${v.bezahlt ? 'line-through' : ''}`}>{v.steuerart}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STEUERART_COLORS[v.steuerart] || 'bg-muted'}`}>
                        {v.quartal}
                      </span>
                      {isOverdue && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Überfällig
                        </span>
                      )}
                      {isSoon && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> In {daysUntil} Tagen
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Fällig: {new Date(v.faellig).toLocaleDateString('de-DE')}
                      {v.bezahltAm && ` • Bezahlt: ${new Date(v.bezahltAm).toLocaleDateString('de-DE')}`}
                    </p>
                  </div>
                  <p className={`text-sm font-medium shrink-0 ${v.bezahlt ? 'text-green-600' : 'text-foreground'}`}>
                    {v.betrag.toLocaleString('de-DE')} €
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
