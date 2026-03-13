import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Sun, Info, CheckCircle2 } from 'lucide-react'

export default function PhotovoltaikSteuerPage() {
  const [leistungKwp, setLeistungKwp] = useState(10)
  const [inbetriebnahme, setInbetriebnahme] = useState(2024)
  const [einspeisungKwh, setEinspeisungKwh] = useState(7500)
  const [eigenverbrauchKwh, setEigenverbrauchKwh] = useState(3000)
  const [einspeiseverguetung, setEinspeiseverguetung] = useState(8.11)
  const [strompreis, setStrompreis] = useState(32)

  const ergebnis = useMemo(() => {
    // Seit 2023: PV-Anlagen bis 30 kWp sind einkommensteuer- und umsatzsteuerfrei
    const istBefreit = inbetriebnahme >= 2023 && leistungKwp <= 30

    // Einnahmen aus Einspeisung
    const einspeiseEinnahmen = Math.round((einspeisungKwh * einspeiseverguetung) / 100)

    // Eigenverbrauch-Ersparnis
    const eigenverbrauchErsparnis = Math.round((eigenverbrauchKwh * strompreis) / 100)

    // Gesamt wirtschaftlicher Vorteil
    const gesamtVorteil = einspeiseEinnahmen + eigenverbrauchErsparnis

    // Jahresproduktion
    const gesamtProduktion = einspeisungKwh + eigenverbrauchKwh
    const eigenverbrauchQuote = gesamtProduktion > 0 ? ((eigenverbrauchKwh / gesamtProduktion) * 100).toFixed(1) : '0.0'

    // Steuerliche Behandlung bei NICHT-Befreiung (Alt-Anlagen)
    let einkommensteuer = 0
    let umsatzsteuer = 0
    let vorsteuerAbzug = 0
    if (!istBefreit) {
      // Vereinfacht: Gewinn = Einnahmen - Abschreibung
      const afa = (leistungKwp * 1200) / 20 // 20 Jahre lineare AfA bei ~1.200€/kWp
      const gewinn = einspeiseEinnahmen - afa
      einkommensteuer = gewinn > 0 ? Math.round(gewinn * 0.35) : 0

      // USt auf Einspeisung (bei Regelbesteuerung)
      umsatzsteuer = Math.round(einspeiseEinnahmen * 0.19)
      // Vorsteuer auf Anschaffung (verteilt auf 20 Jahre)
      vorsteuerAbzug = Math.round((leistungKwp * 1200 * 0.19) / 20)
    }

    return {
      istBefreit, einspeiseEinnahmen, eigenverbrauchErsparnis, gesamtVorteil,
      gesamtProduktion, eigenverbrauchQuote,
      einkommensteuer, umsatzsteuer, vorsteuerAbzug,
      nettoVorteil: istBefreit ? gesamtVorteil : gesamtVorteil - einkommensteuer - umsatzsteuer + vorsteuerAbzug,
    }
  }, [leistungKwp, inbetriebnahme, einspeisungKwh, eigenverbrauchKwh, einspeiseverguetung, strompreis])

  const chartData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const jahr = i + 1
      const degradation = 1 - (i * 0.005) // 0,5% Degradation/Jahr
      const einspeisung = Math.round(einspeisungKwh * degradation)
      const eigenverbrauch = Math.round(eigenverbrauchKwh * degradation)
      return {
        name: `J${jahr}`,
        Einspeisung: Math.round((einspeisung * einspeiseverguetung) / 100),
        Eigenverbrauch: Math.round((eigenverbrauch * strompreis) / 100),
      }
    })
  }, [einspeisungKwh, eigenverbrauchKwh, einspeiseverguetung, strompreis])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sun className="h-6 w-6 text-yellow-500" />
          Photovoltaik & Steuern
        </h1>
        <p className="text-muted-foreground mt-1">
          Steuerliche Behandlung von PV-Anlagen – EStG-Befreiung, USt und Wirtschaftlichkeit
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anlagendaten</CardTitle>
              <CardDescription>Leistung, Inbetriebnahme und Ertragserwartung</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Anlagenleistung (kWp)</label>
                <input type="number" value={leistungKwp} onChange={e => setLeistungKwp(Number(e.target.value))} min={1} max={100} step={0.5} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                <input type="range" min={1} max={50} step={0.5} value={leistungKwp} onChange={e => setLeistungKwp(Number(e.target.value))} className="w-full mt-2 accent-yellow-500" />
              </div>
              <div>
                <label className="text-sm font-medium">Inbetriebnahme</label>
                <select value={inbetriebnahme} onChange={e => setInbetriebnahme(Number(e.target.value))} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                  {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(j => (
                    <option key={j} value={j}>{j} {j >= 2023 ? '(ESt + USt-Befreiung)' : '(Altanlage)'}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Einspeisung (kWh/a)</label>
                  <input type="number" value={einspeisungKwh} onChange={e => setEinspeisungKwh(Number(e.target.value))} min={0} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Eigenverbrauch (kWh/a)</label>
                  <input type="number" value={eigenverbrauchKwh} onChange={e => setEigenverbrauchKwh(Number(e.target.value))} min={0} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Einspeisevergütung (ct/kWh)</label>
                  <input type="number" value={einspeiseverguetung} onChange={e => setEinspeiseverguetung(Number(e.target.value))} min={0} step={0.01} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Strompreis (ct/kWh)</label>
                  <input type="number" value={strompreis} onChange={e => setStrompreis(Number(e.target.value))} min={0} step={1} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader><CardTitle className="text-sm">20-Jahres-Prognose</CardTitle></CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}€`} />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                    <Legend />
                    <Bar dataKey="Einspeisung" fill="#eab308" radius={[1, 1, 0, 0]} stackId="a" />
                    <Bar dataKey="Eigenverbrauch" fill="#22c55e" radius={[1, 1, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Steuerbefreiung */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {ergebnis.istBefreit ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
                ) : (
                  <Info className="h-8 w-8 text-amber-500 shrink-0" />
                )}
                <div>
                  <p className="font-medium">
                    {ergebnis.istBefreit ? 'Steuerbefreiung aktiv' : 'Steuerpflicht (Altanlage)'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ergebnis.istBefreit
                      ? `Seit 2023: PV-Anlagen ≤ 30 kWp sind einkommen- und umsatzsteuerfrei (§ 3 Nr. 72 EStG, § 12 Abs. 3 UStG)`
                      : `Anlagen vor 2023 oder > 30 kWp: Einspeisevergütung ist steuerpflichtig`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wirtschaftlichkeit */}
          <Card>
            <CardHeader><CardTitle>Wirtschaftlichkeit pro Jahr</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Einspeisevergütung ({einspeisungKwh.toLocaleString('de-DE')} kWh)</span>
                <span className="font-medium text-yellow-600">{ergebnis.einspeiseEinnahmen.toLocaleString('de-DE')} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Eigenverbrauch-Ersparnis ({eigenverbrauchKwh.toLocaleString('de-DE')} kWh)</span>
                <span className="font-medium text-green-600">{ergebnis.eigenverbrauchErsparnis.toLocaleString('de-DE')} €</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 font-medium">
                <span>Wirtschaftlicher Vorteil brutto</span>
                <span>{ergebnis.gesamtVorteil.toLocaleString('de-DE')} €</span>
              </div>

              {!ergebnis.istBefreit && (
                <>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>- Einkommensteuer (ca.)</span>
                    <span>-{ergebnis.einkommensteuer.toLocaleString('de-DE')} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>- Umsatzsteuer (19%)</span>
                    <span>-{ergebnis.umsatzsteuer.toLocaleString('de-DE')} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>+ Vorsteuerabzug (anteilig)</span>
                    <span>+{ergebnis.vorsteuerAbzug.toLocaleString('de-DE')} €</span>
                  </div>
                </>
              )}

              <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
                <p className="text-sm text-green-600 dark:text-green-400">Nettovorteil pro Jahr</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{ergebnis.nettoVorteil.toLocaleString('de-DE')} €</p>
                <p className="text-xs text-green-500 mt-1">Eigenverbrauchsquote: {ergebnis.eigenverbrauchQuote}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Kennzahlen</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Jahresproduktion</p><p className="font-medium">{ergebnis.gesamtProduktion.toLocaleString('de-DE')} kWh</p></div>
                <div><p className="text-xs text-muted-foreground">Spez. Ertrag</p><p className="font-medium">{leistungKwp > 0 ? Math.round(ergebnis.gesamtProduktion / leistungKwp) : 0} kWh/kWp</p></div>
                <div><p className="text-xs text-muted-foreground">20-Jahres-Ertrag</p><p className="font-medium">{(ergebnis.nettoVorteil * 19).toLocaleString('de-DE')} €</p></div>
                <div><p className="text-xs text-muted-foreground">Amortisation (ca.)</p><p className="font-medium">{ergebnis.nettoVorteil > 0 ? Math.round((leistungKwp * 1200) / ergebnis.nettoVorteil) : '—'} Jahre</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
