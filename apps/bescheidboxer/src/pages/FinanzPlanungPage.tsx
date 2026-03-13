import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Szenario {
  id: string
  name: string
  bruttoEinkommen: number
  werbungskosten: number
  sonderausgaben: number
  aussergewoehnlich: number
  gewerbeEinkuenfte: number
  mietEinkuenfte: number
  kirchensteuer: boolean
}

const DEMO_SZENARIOS: Szenario[] = [
  { id: 's-1', name: 'Aktuell (2025)', bruttoEinkommen: 65000, werbungskosten: 3200, sonderausgaben: 4500, aussergewoehnlich: 0, gewerbeEinkuenfte: 0, mietEinkuenfte: 0, kirchensteuer: true },
  { id: 's-2', name: 'Gehaltserhöhung', bruttoEinkommen: 72000, werbungskosten: 3200, sonderausgaben: 4500, aussergewoehnlich: 0, gewerbeEinkuenfte: 0, mietEinkuenfte: 0, kirchensteuer: true },
  { id: 's-3', name: 'Mit Nebeneinkünften', bruttoEinkommen: 65000, werbungskosten: 3200, sonderausgaben: 4500, aussergewoehnlich: 0, gewerbeEinkuenfte: 15000, mietEinkuenfte: 0, kirchensteuer: true },
]

function berechneESt(zvE: number): number {
  if (zvE <= 11784) return 0
  if (zvE <= 17005) {
    const y = (zvE - 11784) / 10000
    return Math.round((922.98 * y + 1400) * y)
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.round((181.19 * z + 2397) * z + 1025.38)
  }
  if (zvE <= 277825) {
    return Math.round(0.42 * zvE - 10602.13)
  }
  return Math.round(0.45 * zvE - 18936.88)
}

const TOOLTIP_FORMATTER = (value: number) => `${value.toLocaleString('de-DE')} €`

export default function FinanzPlanungPage() {
  const [szenarios, setSzenarios] = useState(DEMO_SZENARIOS)
  const [editId, setEditId] = useState<string | null>(null)

  const ergebnisse = useMemo(() => {
    return szenarios.map(s => {
      const gesamtEinkommen = s.bruttoEinkommen + s.gewerbeEinkuenfte + s.mietEinkuenfte
      const abzuege = Math.max(s.werbungskosten, 1230) + s.sonderausgaben + s.aussergewoehnlich
      const zvE = Math.max(0, gesamtEinkommen - abzuege)
      const est = berechneESt(zvE)
      const soli = est > 18130 ? Math.round(est * 0.055) : 0
      const kirche = s.kirchensteuer ? Math.round(est * 0.09) : 0
      const gesamtSteuer = est + soli + kirche
      const nettoEinkommen = gesamtEinkommen - gesamtSteuer
      const steuersatz = gesamtEinkommen > 0 ? (gesamtSteuer / gesamtEinkommen) * 100 : 0

      return {
        ...s,
        zvE,
        est,
        soli,
        kirche,
        gesamtSteuer,
        nettoEinkommen,
        steuersatz,
        gesamtEinkommen,
      }
    })
  }, [szenarios])

  const chartData = ergebnisse.map(e => ({
    name: e.name,
    'Brutto-Einkommen': e.gesamtEinkommen,
    'Steuer gesamt': e.gesamtSteuer,
    'Netto-Einkommen': e.nettoEinkommen,
  }))

  const updateSzenario = (id: string, field: keyof Szenario, value: number | boolean | string) => {
    setSzenarios(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finanzplanung</h1>
        <p className="text-muted-foreground mt-1">
          Vergleichen Sie verschiedene Einkommens-Szenarien und planen Sie Ihre Steuerlast
        </p>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Szenario-Vergleich</CardTitle>
          <CardDescription>Brutto vs. Steuer vs. Netto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={TOOLTIP_FORMATTER} />
                <Legend />
                <Bar dataKey="Brutto-Einkommen" fill="#3b82f6" />
                <Bar dataKey="Steuer gesamt" fill="#ef4444" />
                <Bar dataKey="Netto-Einkommen" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Szenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ergebnisse.map((erg, idx) => {
          const isEditing = editId === erg.id
          const prev = idx > 0 ? ergebnisse[idx - 1] : null
          const diffNetto = prev ? erg.nettoEinkommen - prev.nettoEinkommen : 0

          return (
            <Card key={erg.id} className={idx === 0 ? 'border-primary/30' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{erg.name}</CardTitle>
                  <button onClick={() => setEditId(isEditing ? null : erg.id)} className="text-xs text-primary hover:underline">
                    {isEditing ? 'Fertig' : 'Bearbeiten'}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Brutto-Einkommen</label>
                      <input type="number" value={erg.bruttoEinkommen} onChange={e => updateSzenario(erg.id, 'bruttoEinkommen', Number(e.target.value))} className="mt-0.5 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Werbungskosten</label>
                      <input type="number" value={erg.werbungskosten} onChange={e => updateSzenario(erg.id, 'werbungskosten', Number(e.target.value))} className="mt-0.5 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Sonderausgaben</label>
                      <input type="number" value={erg.sonderausgaben} onChange={e => updateSzenario(erg.id, 'sonderausgaben', Number(e.target.value))} className="mt-0.5 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Gewerbe-Einkünfte</label>
                      <input type="number" value={erg.gewerbeEinkuenfte} onChange={e => updateSzenario(erg.id, 'gewerbeEinkuenfte', Number(e.target.value))} className="mt-0.5 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Miet-Einkünfte</label>
                      <input type="number" value={erg.mietEinkuenfte} onChange={e => updateSzenario(erg.id, 'mietEinkuenfte', Number(e.target.value))} className="mt-0.5 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm" />
                    </div>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" checked={erg.kirchensteuer} onChange={e => updateSzenario(erg.id, 'kirchensteuer', e.target.checked)} className="rounded" />
                      Kirchensteuerpflichtig
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Brutto gesamt</span><span className="font-medium">{erg.gesamtEinkommen.toLocaleString('de-DE')} €</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">./. Abzüge</span><span>-{(Math.max(erg.werbungskosten, 1230) + erg.sonderausgaben + erg.aussergewoehnlich).toLocaleString('de-DE')} €</span></div>
                      <div className="flex justify-between border-t pt-1"><span className="text-muted-foreground">zvE</span><span>{erg.zvE.toLocaleString('de-DE')} €</span></div>
                    </div>

                    <div className="border-t pt-3 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Einkommensteuer</span><span className="text-red-600">{erg.est.toLocaleString('de-DE')} €</span></div>
                      {erg.soli > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Solidaritätszuschlag</span><span className="text-red-600">{erg.soli.toLocaleString('de-DE')} €</span></div>}
                      {erg.kirche > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Kirchensteuer</span><span className="text-red-600">{erg.kirche.toLocaleString('de-DE')} €</span></div>}
                      <div className="flex justify-between font-medium border-t pt-1"><span>Steuer gesamt</span><span className="text-red-600">{erg.gesamtSteuer.toLocaleString('de-DE')} €</span></div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm font-bold">
                        <span>Netto-Einkommen</span>
                        <span className="text-green-600">{erg.nettoEinkommen.toLocaleString('de-DE')} €</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Effektiver Steuersatz</span>
                        <span>{erg.steuersatz.toFixed(1)}%</span>
                      </div>
                      {diffNetto !== 0 && (
                        <div className={`flex items-center gap-1 text-xs mt-2 ${diffNetto > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {diffNetto > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          {diffNetto > 0 ? '+' : ''}{diffNetto.toLocaleString('de-DE')} € vs. {ergebnisse[idx - 1].name}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="pt-6 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Hinweis zur Berechnung</p>
            <p className="mt-1">
              Die Berechnung verwendet den ESt-Tarif 2024 (vereinfacht). Sozialversicherungsbeiträge, Arbeitgeberanteile und
              weitere Abzüge sind nicht berücksichtigt. Für eine exakte Berechnung konsultieren Sie einen Steuerberater.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
