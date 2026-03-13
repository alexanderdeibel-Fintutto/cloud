import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Receipt, CheckCircle2, Clock, AlertTriangle, ExternalLink } from 'lucide-react'

interface UStVA {
  id: number
  zeitraum: string
  monat: string
  faellig: string
  status: 'eingereicht' | 'offen' | 'ueberfaellig' | 'entwurf'
  umsatz19: number
  umsatz7: number
  vorsteuer: number
  zahllast: number
  transferticket?: string
}

const DEMO_VORANMELDUNGEN: UStVA[] = [
  { id: 1, zeitraum: '01/2026', monat: 'Januar', faellig: '2026-02-10', status: 'eingereicht', umsatz19: 12500, umsatz7: 3200, vorsteuer: 1850, zahllast: 637, transferticket: 'TT-2026-01-UST' },
  { id: 2, zeitraum: '02/2026', monat: 'Februar', faellig: '2026-03-10', status: 'entwurf', umsatz19: 15800, umsatz7: 1500, vorsteuer: 2100, zahllast: 1007, },
  { id: 3, zeitraum: '12/2025', monat: 'Dezember', faellig: '2026-01-10', status: 'eingereicht', umsatz19: 18200, umsatz7: 4100, vorsteuer: 2400, zahllast: 1345, transferticket: 'TT-2025-12-UST' },
  { id: 4, zeitraum: '11/2025', monat: 'November', faellig: '2025-12-10', status: 'eingereicht', umsatz19: 14000, umsatz7: 2800, vorsteuer: 1950, zahllast: 806, transferticket: 'TT-2025-11-UST' },
  { id: 5, zeitraum: '10/2025', monat: 'Oktober', faellig: '2025-11-10', status: 'eingereicht', umsatz19: 16500, umsatz7: 3600, vorsteuer: 2200, zahllast: 1137, transferticket: 'TT-2025-10-UST' },
  { id: 6, zeitraum: '09/2025', monat: 'September', faellig: '2025-10-10', status: 'eingereicht', umsatz19: 11800, umsatz7: 2100, vorsteuer: 1650, zahllast: 539, transferticket: 'TT-2025-09-UST' },
  { id: 7, zeitraum: '03/2026', monat: 'März', faellig: '2026-04-10', status: 'offen', umsatz19: 0, umsatz7: 0, vorsteuer: 0, zahllast: 0 },
]

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  eingereicht: { label: 'Eingereicht', icon: CheckCircle2, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  offen: { label: 'Offen', icon: Clock, bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
  ueberfaellig: { label: 'Überfällig', icon: AlertTriangle, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  entwurf: { label: 'Entwurf', icon: Clock, bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
}

export default function UmsatzsteuerPage() {
  const [voranmeldungen] = useState<UStVA[]>(DEMO_VORANMELDUNGEN)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const stats = useMemo(() => {
    const eingereicht = voranmeldungen.filter(v => v.status === 'eingereicht')
    const gesamtZahllast = eingereicht.reduce((s, v) => s + v.zahllast, 0)
    const gesamtVorsteuer = eingereicht.reduce((s, v) => s + v.vorsteuer, 0)
    const gesamtUmsatz = eingereicht.reduce((s, v) => s + v.umsatz19 + v.umsatz7, 0)
    const offeneCount = voranmeldungen.filter(v => v.status === 'offen' || v.status === 'entwurf').length
    return { gesamtZahllast, gesamtVorsteuer, gesamtUmsatz, offeneCount }
  }, [voranmeldungen])

  const chartData = useMemo(() => {
    return voranmeldungen
      .filter(v => v.status === 'eingereicht')
      .sort((a, b) => a.zeitraum.localeCompare(b.zeitraum))
      .map(v => ({
        name: v.monat.substring(0, 3),
        'USt 19%': Math.round(v.umsatz19 * 0.19),
        'USt 7%': Math.round(v.umsatz7 * 0.07),
        Vorsteuer: v.vorsteuer,
        Zahllast: v.zahllast,
      }))
  }, [voranmeldungen])

  const sorted = [...voranmeldungen].sort((a, b) => b.zeitraum.localeCompare(a.zeitraum))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Receipt className="h-6 w-6 text-violet-500" />
          Umsatzsteuer-Voranmeldung
        </h1>
        <p className="text-muted-foreground mt-1">
          UStVA-Übersicht, Zahllast-Berechnung und ELSTER-Status
        </p>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Netto-Umsatz (eingereicht)</p>
            <p className="text-2xl font-bold">{stats.gesamtUmsatz.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gezahlte Vorsteuer</p>
            <p className="text-2xl font-bold text-blue-600">{stats.gesamtVorsteuer.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gesamt-Zahllast</p>
            <p className="text-2xl font-bold text-amber-600">{stats.gesamtZahllast.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Offene Meldungen</p>
            <p className="text-2xl font-bold text-red-600">{stats.offeneCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">USt-Verlauf (eingereichte Monate)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v}€`} />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString('de-DE')} €`} />
                  <Legend />
                  <Bar dataKey="USt 19%" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="USt 7%" fill="#a78bfa" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Vorsteuer" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Zahllast" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voranmeldungen */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Alle Voranmeldungen</h2>
        {sorted.map(v => {
          const config = STATUS_CONFIG[v.status]
          const StatusIcon = config.icon
          const isExpanded = expandedId === v.id
          const ust19 = Math.round(v.umsatz19 * 0.19)
          const ust7 = Math.round(v.umsatz7 * 0.07)

          return (
            <Card key={v.id}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : v.id)}
                className="w-full text-left"
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <Receipt className="h-4 w-4 text-violet-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">UStVA {v.zeitraum}</p>
                        <p className="text-xs text-muted-foreground">Fällig: {new Date(v.faellig).toLocaleDateString('de-DE')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {v.zahllast > 0 && (
                        <span className="text-sm font-medium">{v.zahllast.toLocaleString('de-DE')} €</span>
                      )}
                      <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${config.bg} ${config.text}`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {isExpanded && v.status !== 'offen' && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Umsätze</h3>
                          <div className="flex justify-between text-sm">
                            <span>Umsatz 19%</span>
                            <span className="font-medium">{v.umsatz19.toLocaleString('de-DE')} €</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Umsatz 7%</span>
                            <span className="font-medium">{v.umsatz7.toLocaleString('de-DE')} €</span>
                          </div>
                          <div className="flex justify-between text-sm border-t pt-1">
                            <span>Gesamt netto</span>
                            <span className="font-medium">{(v.umsatz19 + v.umsatz7).toLocaleString('de-DE')} €</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Steuerberechnung</h3>
                          <div className="flex justify-between text-sm">
                            <span>USt 19%</span>
                            <span className="font-medium">{ust19.toLocaleString('de-DE')} €</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>USt 7%</span>
                            <span className="font-medium">{ust7.toLocaleString('de-DE')} €</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>abzgl. Vorsteuer</span>
                            <span className="font-medium text-blue-600">-{v.vorsteuer.toLocaleString('de-DE')} €</span>
                          </div>
                          <div className="flex justify-between text-sm border-t pt-1 font-bold">
                            <span>Zahllast</span>
                            <span className="text-amber-600">{v.zahllast.toLocaleString('de-DE')} €</span>
                          </div>
                        </div>
                      </div>
                      {v.transferticket && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Transferticket: <span className="font-mono">{v.transferticket}</span>
                        </div>
                      )}
                      <a
                        href="https://portal.fintutto.cloud/umsatzsteuer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Details im Portal
                      </a>
                    </div>
                  )}
                </CardContent>
              </button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
