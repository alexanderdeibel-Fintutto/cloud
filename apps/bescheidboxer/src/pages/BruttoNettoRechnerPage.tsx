import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Wallet, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcLohnsteuerJahr(brutto: number, klasse: number, kirchensteuer: boolean, kistSatz: number): number {
  let zvE = brutto - 1230 - 36 - Math.round(brutto * 0.11)
  if (klasse === 2) zvE -= 4260
  if (klasse === 3) zvE = Math.round(zvE / 2)
  zvE = Math.max(zvE, 0)

  let est: number
  if (zvE <= 12084) est = 0
  else if (zvE <= 17005) { const y = (zvE - 12084) / 10000; est = Math.round((922.98 * y + 1400) * y) }
  else if (zvE <= 66760) { const z = (zvE - 17005) / 10000; est = Math.round((181.19 * z + 2397) * z + 1025.38) }
  else if (zvE <= 277825) est = Math.round(0.42 * zvE - 10394.14)
  else est = Math.round(0.45 * zvE - 18730.89)

  if (klasse === 3) est *= 2
  const soli = est > 18130 ? Math.round(est * 0.055) : 0
  const kist = kirchensteuer ? Math.round(est * kistSatz / 100) : 0
  return est + soli + kist
}

export default function BruttoNettoRechnerPage() {
  const [bruttoMonat, setBruttoMonat] = useState(4500)
  const [steuerklasse, setSteuerklasse] = useState(1)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [kistSatz, setKistSatz] = useState(9)
  const [bundesland, setBundesland] = useState<'west' | 'ost'>('west')
  const [kinderlos25, setKinderlos25] = useState(false)

  const ergebnis = useMemo(() => {
    const bruttoJahr = bruttoMonat * 12

    // Lohnsteuer
    const lstJahr = calcLohnsteuerJahr(bruttoJahr, steuerklasse, kirchensteuer, kistSatz)
    const lstMonat = Math.round(lstJahr / 12)

    // Sozialversicherung (2025 Werte)
    const kvSatz = 14.6 / 2 + 0.85 // AN: halber allg. + Zusatzbeitrag
    const rvSatz = 18.6 / 2
    const avSatz = kinderlos25 ? 2.6 / 2 + 0.6 : 2.6 / 2 // Kinderlosenzuschlag
    const pvSatz = 3.6 / 2 + (kinderlos25 ? 0.6 : 0)

    const beitragsBemessungsKV = bundesland === 'west' ? 5175 : 5175
    const beitragsBemessungsRV = bundesland === 'west' ? 7550 : 7450

    const kvBrutto = Math.min(bruttoMonat, beitragsBemessungsKV)
    const rvBrutto = Math.min(bruttoMonat, beitragsBemessungsRV)

    const kvAN = Math.round(kvBrutto * kvSatz / 100)
    const rvAN = Math.round(rvBrutto * rvSatz / 100)
    const avAN = Math.round(rvBrutto * avSatz / 100)
    const pvAN = Math.round(kvBrutto * pvSatz / 100)

    const svGesamt = kvAN + rvAN + avAN + pvAN

    const nettoMonat = bruttoMonat - lstMonat - svGesamt
    const nettoJahr = nettoMonat * 12

    const abgabenQuote = Math.round((lstMonat + svGesamt) / bruttoMonat * 10000) / 100

    // Chart: Aufteilung
    const chartData = [
      { name: 'Netto', betrag: nettoMonat },
      { name: 'Lohnsteuer', betrag: lstMonat },
      { name: 'KV', betrag: kvAN },
      { name: 'RV', betrag: rvAN },
      { name: 'AV', betrag: avAN },
      { name: 'PV', betrag: pvAN },
    ]

    return {
      lstMonat, lstJahr,
      kvAN, rvAN, avAN, pvAN, svGesamt,
      nettoMonat, nettoJahr,
      abgabenQuote,
      chartData,
    }
  }, [bruttoMonat, steuerklasse, kirchensteuer, kistSatz, bundesland, kinderlos25])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          Brutto-Netto-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Nettolohn berechnen – Lohnsteuer & Sozialversicherung 2025
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Lohnsteuer:</strong> Abhaengig von Steuerklasse, Kirchensteuer und Freibetraegen.</p>
              <p><strong>SV-Beitraege 2025:</strong> KV 14,6% + Zusatzbeitrag | RV 18,6% | AV 2,6% | PV 3,6% (jeweils halbe AN-Anteil).</p>
              <p><strong>Beitragsbemessungsgrenzen:</strong> KV/PV: 5.175 EUR/M | RV/AV: 7.550 EUR/M (West) / 7.450 EUR/M (Ost).</p>
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
            <div>
              <label className="text-sm font-medium">Bruttogehalt/Monat: {bruttoMonat.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={1500} max={15000} step={100} value={bruttoMonat} onChange={e => setBruttoMonat(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Steuerklasse</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map(k => (
                  <button key={k} onClick={() => setSteuerklasse(k)} className={`rounded-md px-4 py-2 text-sm ${steuerklasse === k ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {(['west', 'ost'] as const).map(b => (
                <button key={b} onClick={() => setBundesland(b)} className={`rounded-md px-4 py-2 text-sm ${bundesland === b ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {b === 'west' ? 'West' : 'Ost'}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
                Kirchensteuer
                {kirchensteuer && (
                  <span className="flex gap-1 ml-2">
                    {([8, 9] as const).map(v => (
                      <button key={v} onClick={() => setKistSatz(v)} className={`rounded px-2 py-0.5 text-xs ${kistSatz === v ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{v}%</button>
                    ))}
                  </span>
                )}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kinderlos25} onChange={e => setKinderlos25(e.target.checked)} className="accent-primary" />
                Kinderlos ab 23 (PV-Zuschlag)
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">{ergebnis.nettoMonat.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Netto/Monat</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.abgabenQuote}%</p>
                <p className="text-xs text-muted-foreground mt-1">Abgabenquote</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b font-medium">
                <span>Brutto</span>
                <span>{bruttoMonat.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Lohnsteuer + Soli + KiSt</span>
                <span className="text-red-600">-{ergebnis.lstMonat.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Krankenversicherung</span>
                <span className="text-red-600">-{ergebnis.kvAN.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Rentenversicherung</span>
                <span className="text-red-600">-{ergebnis.rvAN.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Arbeitslosenversicherung</span>
                <span className="text-red-600">-{ergebnis.avAN.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Pflegeversicherung</span>
                <span className="text-red-600">-{ergebnis.pvAN.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-green-700 dark:text-green-400">
                <span>Netto</span>
                <span>{ergebnis.nettoMonat.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 text-muted-foreground text-xs">
                <span>Netto/Jahr</span>
                <span>{ergebnis.nettoJahr.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gehaltsaufteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="betrag" name="EUR/Monat" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
