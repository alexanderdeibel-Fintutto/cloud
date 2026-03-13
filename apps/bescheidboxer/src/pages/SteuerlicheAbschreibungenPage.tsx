import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { TrendingDown, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function SteuerlicheAbschreibungenPage() {
  const [anschaffungskosten, setAnschaffungskosten] = useState(50000)
  const [nutzungsdauer, setNutzungsdauer] = useState(10)
  const [methode, setMethode] = useState<'linear' | 'degressiv' | 'sonderafa'>('linear')
  const [sonderAfaProzent, setSonderAfaProzent] = useState(20)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)
  const [gwgCheck, setGwgCheck] = useState(false)
  const [gwgBetrag, setGwgBetrag] = useState(800)

  const ergebnis = useMemo(() => {
    // GWG-Prüfung
    if (gwgCheck && gwgBetrag <= 800) {
      return {
        isGWG: true,
        gwgBetrag,
        sofortAbzug: gwgBetrag,
        steuerersparnis: Math.round(gwgBetrag * grenzsteuersatz / 100),
        chartData: [],
        verlauf: [],
        gesamtAfA: gwgBetrag,
      }
    }

    const chartData: Array<{
      jahr: number
      linear: number
      degressiv: number
      sonderafa: number
      linearKumuliert: number
      degressivKumuliert: number
      sonderafaKumuliert: number
    }> = []

    // Linear: gleichmäßig
    const linearJahr = Math.round(anschaffungskosten / nutzungsdauer)
    const linearSatz = Math.round(100 / nutzungsdauer * 100) / 100

    // Degressiv: 25% (max 2,5× linear), Wechsel zu linear wenn vorteilhafter
    const degressivSatz = Math.min(25, linearSatz * 2.5)
    let degressivRestwert = anschaffungskosten

    // Sonder-AfA: z.B. 20% im 1. Jahr + linear Rest
    const sonderAfABetrag = Math.round(anschaffungskosten * sonderAfaProzent / 100)

    let linearKum = 0
    let degressivKum = 0
    let sonderafaKum = 0

    const verlauf: Array<{
      jahr: number
      linear: number
      degressiv: number
      sonderafa: number
    }> = []

    for (let j = 1; j <= nutzungsdauer; j++) {
      // Linear
      const lin = j === nutzungsdauer ? anschaffungskosten - linearKum : linearJahr
      linearKum += lin

      // Degressiv (mit Wechsel)
      const degJahr = Math.round(degressivRestwert * degressivSatz / 100)
      const restJahre = nutzungsdauer - j + 1
      const linearRest = Math.round(degressivRestwert / restJahre)
      const deg = linearRest >= degJahr ? linearRest : degJahr
      const effDeg = Math.min(deg, anschaffungskosten - degressivKum)
      degressivRestwert -= effDeg
      degressivKum += effDeg

      // Sonder-AfA
      let safa: number
      if (j === 1) {
        safa = sonderAfABetrag + Math.round((anschaffungskosten - sonderAfABetrag) / nutzungsdauer)
      } else {
        safa = Math.round((anschaffungskosten - sonderAfABetrag) / nutzungsdauer)
      }
      safa = Math.min(safa, anschaffungskosten - sonderafaKum)
      sonderafaKum += safa

      verlauf.push({ jahr: j, linear: lin, degressiv: effDeg, sonderafa: safa })
      chartData.push({
        jahr: j,
        linear: lin,
        degressiv: effDeg,
        sonderafa: safa,
        linearKumuliert: linearKum,
        degressivKumuliert: degressivKum,
        sonderafaKumuliert: sonderafaKum,
      })
    }

    // Gewählte Methode: Ersparnis im 1. Jahr
    const erstesJahr = verlauf[0]
    const afaErstesJahr = methode === 'linear' ? erstesJahr.linear : methode === 'degressiv' ? erstesJahr.degressiv : erstesJahr.sonderafa
    const steuerersparnis = Math.round(afaErstesJahr * grenzsteuersatz / 100)

    return {
      isGWG: false,
      linearJahr,
      linearSatz,
      degressivSatz,
      sonderAfABetrag,
      chartData,
      verlauf,
      afaErstesJahr,
      steuerersparnis,
      gesamtAfA: anschaffungskosten,
    }
  }, [anschaffungskosten, nutzungsdauer, methode, sonderAfaProzent, grenzsteuersatz, gwgCheck, gwgBetrag])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingDown className="h-6 w-6 text-primary" />
          Steuerliche Abschreibungen
        </h1>
        <p className="text-muted-foreground mt-1">
          AfA-Methoden im Vergleich – § 7 EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Linear (§ 7 Abs. 1):</strong> Gleichmaessige Verteilung ueber Nutzungsdauer. Standard-Methode.</p>
              <p><strong>Degressiv (§ 7 Abs. 2):</strong> Max. 25% (2,5× linear). Hoehere AfA am Anfang, Wechsel zu linear moeglich.</p>
              <p><strong>Sonder-AfA (§ 7b/7g):</strong> Zusaetzlich 20-40% im 1. Jahr (z.B. Mietwohnungsneubau, IAB).</p>
              <p><strong>GWG (§ 6 Abs. 2):</strong> Bis <strong>800 EUR netto</strong> sofort abziehbar. Pool-Abschreibung 250,01–1.000 EUR (5 Jahre).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eingaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={gwgCheck} onChange={e => setGwgCheck(e.target.checked)} className="accent-primary" />
              Geringwertiges Wirtschaftsgut (GWG)
            </label>

            {gwgCheck ? (
              <div>
                <label className="text-sm font-medium">GWG-Betrag (netto): {gwgBetrag.toLocaleString('de-DE')} EUR</label>
                <input type="range" min={50} max={1000} step={50} value={gwgBetrag} onChange={e => setGwgBetrag(+e.target.value)} className="w-full accent-primary" />
                <p className="text-xs text-muted-foreground mt-1">{gwgBetrag <= 800 ? 'Sofortabzug moeglich (§ 6 Abs. 2)' : 'Ueber GWG-Grenze – Pool oder regulaere AfA'}</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium mb-2">AfA-Methode</p>
                  <div className="flex gap-2 flex-wrap">
                    {([
                      { key: 'linear', label: 'Linear' },
                      { key: 'degressiv', label: 'Degressiv' },
                      { key: 'sonderafa', label: 'Sonder-AfA' },
                    ] as const).map(m => (
                      <button key={m.key} onClick={() => setMethode(m.key)} className={`rounded-md px-4 py-2 text-sm ${methode === m.key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Anschaffungskosten: {anschaffungskosten.toLocaleString('de-DE')} EUR</label>
                  <input type="range" min={1000} max={500000} step={1000} value={anschaffungskosten} onChange={e => setAnschaffungskosten(+e.target.value)} className="w-full accent-primary" />
                </div>

                <div>
                  <label className="text-sm font-medium">Nutzungsdauer: {nutzungsdauer} Jahre</label>
                  <input type="range" min={1} max={50} value={nutzungsdauer} onChange={e => setNutzungsdauer(+e.target.value)} className="w-full accent-primary" />
                </div>

                {methode === 'sonderafa' && (
                  <div>
                    <label className="text-sm font-medium">Sonder-AfA: {sonderAfaProzent}%</label>
                    <input type="range" min={5} max={50} step={5} value={sonderAfaProzent} onChange={e => setSonderAfaProzent(+e.target.value)} className="w-full accent-primary" />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            {ergebnis.isGWG ? (
              <div className="text-center py-8">
                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-6">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.sofortAbzug?.toLocaleString('de-DE')} EUR</p>
                  <p className="text-sm text-muted-foreground mt-1">Sofortabzug im Anschaffungsjahr</p>
                  <p className="text-lg font-bold text-green-600 mt-2">Steuerersparnis: {ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                  <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{'afaErstesJahr' in ergebnis ? ergebnis.afaErstesJahr?.toLocaleString('de-DE') : '0'} EUR</p>
                    <p className="text-xs text-muted-foreground mt-1">AfA 1. Jahr</p>
                  </div>
                  <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR</p>
                    <p className="text-xs text-muted-foreground mt-1">Steuerersparnis 1. Jahr</p>
                  </div>
                </div>

                {'linearSatz' in ergebnis && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">Anschaffungskosten</span>
                      <span className="font-medium">{anschaffungskosten.toLocaleString('de-DE')} EUR</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">Nutzungsdauer</span>
                      <span className="font-medium">{nutzungsdauer} Jahre</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">Linearer AfA-Satz</span>
                      <span className="font-medium">{ergebnis.linearSatz?.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">Lineare AfA/Jahr</span>
                      <span className="font-medium">{ergebnis.linearJahr?.toLocaleString('de-DE')} EUR</span>
                    </div>
                    {methode === 'degressiv' && (
                      <div className="flex justify-between py-1.5 border-b">
                        <span className="text-muted-foreground">Degressiver Satz</span>
                        <span className="font-medium">{ergebnis.degressivSatz?.toFixed(1)}%</span>
                      </div>
                    )}
                    {methode === 'sonderafa' && (
                      <div className="flex justify-between py-1.5 border-b">
                        <span className="text-muted-foreground">Sonder-AfA Betrag</span>
                        <span className="font-medium">{ergebnis.sonderAfABetrag?.toLocaleString('de-DE')} EUR</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {!ergebnis.isGWG && ergebnis.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AfA-Verlauf (kumuliert)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ergebnis.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="jahr" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} labelFormatter={v => `Jahr ${v}`} />
                  <Legend />
                  <Area type="monotone" dataKey="linearKumuliert" name="Linear (kum.)" stroke="#94a3b8" fill="none" strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="degressivKumuliert" name="Degressiv (kum.)" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="sonderafaKumuliert" name="Sonder-AfA (kum.)" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Typische Nutzungsdauern (AfA-Tabelle)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {[
              { name: 'Computer/Laptop', dauer: '1 Jahr', info: 'Sofortabschreibung seit 2021' },
              { name: 'Bueromöbel', dauer: '13 Jahre', info: 'Schreibtisch, Stuhl, Regal' },
              { name: 'PKW', dauer: '6 Jahre', info: 'Betrieblich genutzter PKW' },
              { name: 'Gebaeude (Wohnung)', dauer: '50 Jahre', info: '2% p.a. (nach 1924) / 2,5% (vor 1925)' },
              { name: 'Gebaeude (Neubau ab 2023)', dauer: '33 Jahre', info: '3% p.a. fuer neue Wohngebaeude' },
              { name: 'Smartphone', dauer: '5 Jahre', info: 'Beruflicher Anteil absetzbar' },
            ].map((item, i) => (
              <div key={i} className="rounded-lg bg-muted p-3">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.dauer} – {item.info}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
