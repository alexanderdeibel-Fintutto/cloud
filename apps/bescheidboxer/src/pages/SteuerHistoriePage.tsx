import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { History, TrendingUp, TrendingDown, ChevronDown, ChevronUp, FileText } from 'lucide-react'

interface SteuerJahr {
  jahr: number
  bruttoeinkommen: number
  zuVersteuerndesEinkommen: number
  einkommensteuer: number
  solidaritaet: number
  kirchensteuer: number
  gesamtbelastung: number
  erstattungNachzahlung: number
  bescheide: { typ: string; datum: string; betrag: number }[]
}

const DEMO_HISTORIE: SteuerJahr[] = [
  {
    jahr: 2025, bruttoeinkommen: 72000, zuVersteuerndesEinkommen: 56200, einkommensteuer: 13256, solidaritaet: 0, kirchensteuer: 1193, gesamtbelastung: 14449,
    erstattungNachzahlung: 1240,
    bescheide: [
      { typ: 'Einkommensteuerbescheid', datum: '2026-01-15', betrag: 13256 },
      { typ: 'Kirchensteuerbescheid', datum: '2026-01-15', betrag: 1193 },
    ],
  },
  {
    jahr: 2024, bruttoeinkommen: 68000, zuVersteuerndesEinkommen: 52800, einkommensteuer: 12150, solidaritaet: 0, kirchensteuer: 1094, gesamtbelastung: 13244,
    erstattungNachzahlung: 890,
    bescheide: [
      { typ: 'Einkommensteuerbescheid', datum: '2025-02-20', betrag: 12150 },
      { typ: 'Kirchensteuerbescheid', datum: '2025-02-20', betrag: 1094 },
    ],
  },
  {
    jahr: 2023, bruttoeinkommen: 65000, zuVersteuerndesEinkommen: 50100, einkommensteuer: 11420, solidaritaet: 0, kirchensteuer: 1028, gesamtbelastung: 12448,
    erstattungNachzahlung: 620,
    bescheide: [
      { typ: 'Einkommensteuerbescheid', datum: '2024-03-10', betrag: 11420 },
      { typ: 'Kirchensteuerbescheid', datum: '2024-03-10', betrag: 1028 },
    ],
  },
  {
    jahr: 2022, bruttoeinkommen: 60000, zuVersteuerndesEinkommen: 46500, einkommensteuer: 10280, solidaritaet: 0, kirchensteuer: 925, gesamtbelastung: 11205,
    erstattungNachzahlung: -350,
    bescheide: [
      { typ: 'Einkommensteuerbescheid', datum: '2023-04-05', betrag: 10280 },
      { typ: 'Geändert nach Einspruch', datum: '2023-07-12', betrag: 9930 },
    ],
  },
  {
    jahr: 2021, bruttoeinkommen: 55000, zuVersteuerndesEinkommen: 42800, einkommensteuer: 9150, solidaritaet: 0, kirchensteuer: 824, gesamtbelastung: 9974,
    erstattungNachzahlung: 1560,
    bescheide: [
      { typ: 'Einkommensteuerbescheid', datum: '2022-05-15', betrag: 9150 },
    ],
  },
  {
    jahr: 2020, bruttoeinkommen: 52000, zuVersteuerndesEinkommen: 40200, einkommensteuer: 8420, solidaritaet: 0, kirchensteuer: 758, gesamtbelastung: 9178,
    erstattungNachzahlung: 2100,
    bescheide: [
      { typ: 'Einkommensteuerbescheid', datum: '2021-06-20', betrag: 8420 },
      { typ: 'Kirchensteuerbescheid', datum: '2021-06-20', betrag: 758 },
    ],
  },
]

export default function SteuerHistoriePage() {
  const [expandedJahr, setExpandedJahr] = useState<number | null>(null)

  const chartData = [...DEMO_HISTORIE].reverse().map(j => ({
    name: j.jahr.toString(),
    Einkommen: j.bruttoeinkommen,
    Steuer: j.gesamtbelastung,
    'Steuerquote (%)': parseFloat(((j.gesamtbelastung / j.bruttoeinkommen) * 100).toFixed(1)),
  }))

  const gesamtErstattung = DEMO_HISTORIE.reduce((s, j) => s + (j.erstattungNachzahlung > 0 ? j.erstattungNachzahlung : 0), 0)
  const durchschnittSteuer = Math.round(DEMO_HISTORIE.reduce((s, j) => s + j.gesamtbelastung, 0) / DEMO_HISTORIE.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-indigo-500" />
          Steuer-Historie
        </h1>
        <p className="text-muted-foreground mt-1">
          Ihre Steuerveranlagungen im Zeitverlauf – von {DEMO_HISTORIE[DEMO_HISTORIE.length - 1].jahr} bis {DEMO_HISTORIE[0].jahr}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Erfasste Jahre</p>
            <p className="text-3xl font-bold">{DEMO_HISTORIE.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ø Steuerbelastung</p>
            <p className="text-2xl font-bold">{durchschnittSteuer.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gesamt-Erstattungen</p>
            <p className="text-2xl font-bold text-green-600">+{gesamtErstattung.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aktuelle Steuerquote</p>
            <p className="text-2xl font-bold text-amber-600">
              {((DEMO_HISTORIE[0].gesamtbelastung / DEMO_HISTORIE[0].bruttoeinkommen) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Einkommen vs. Steuerbelastung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number, name: string) =>
                  name === 'Steuerquote (%)' ? `${value}%` : `${value.toLocaleString('de-DE')} €`
                } />
                <Area type="monotone" dataKey="Einkommen" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="Steuer" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Jahresdetails */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Jahresübersicht</h2>
        {DEMO_HISTORIE.map(j => {
          const isExpanded = expandedJahr === j.jahr
          const steuerquote = ((j.gesamtbelastung / j.bruttoeinkommen) * 100).toFixed(1)

          return (
            <Card key={j.jahr}>
              <button
                onClick={() => setExpandedJahr(isExpanded ? null : j.jahr)}
                className="w-full text-left"
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-2.5">
                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{j.jahr}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Steuerjahr {j.jahr}</p>
                        <p className="text-xs text-muted-foreground">
                          Brutto: {j.bruttoeinkommen.toLocaleString('de-DE')} € · Steuer: {j.gesamtbelastung.toLocaleString('de-DE')} € · Quote: {steuerquote}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium flex items-center gap-1 ${j.erstattungNachzahlung >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {j.erstattungNachzahlung >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {j.erstattungNachzahlung >= 0 ? '+' : ''}{j.erstattungNachzahlung.toLocaleString('de-DE')} €
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Einkünfte</h3>
                          <div className="flex justify-between text-sm">
                            <span>Bruttoeinkommen</span>
                            <span className="font-medium">{j.bruttoeinkommen.toLocaleString('de-DE')} €</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Zu versteuerndes Einkommen</span>
                            <span className="font-medium">{j.zuVersteuerndesEinkommen.toLocaleString('de-DE')} €</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Steuern</h3>
                          <div className="flex justify-between text-sm">
                            <span>Einkommensteuer</span>
                            <span className="font-medium">{j.einkommensteuer.toLocaleString('de-DE')} €</span>
                          </div>
                          {j.kirchensteuer > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Kirchensteuer</span>
                              <span className="font-medium">{j.kirchensteuer.toLocaleString('de-DE')} €</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm border-t pt-1 font-bold">
                            <span>Gesamtbelastung</span>
                            <span>{j.gesamtbelastung.toLocaleString('de-DE')} €</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Bescheide</h3>
                        <div className="space-y-1.5">
                          {j.bescheide.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm rounded-lg bg-muted/50 px-3 py-2">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="flex-1">{b.typ}</span>
                              <span className="text-xs text-muted-foreground">{new Date(b.datum).toLocaleDateString('de-DE')}</span>
                              <span className="font-medium">{b.betrag.toLocaleString('de-DE')} €</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
