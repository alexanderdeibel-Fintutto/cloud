import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Home, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function WohnungsbauPraemiePage() {
  const [einzahlung, setEinzahlung] = useState(700)
  const [familienstand, setFamilienstand] = useState<'ledig' | 'verheiratet'>('ledig')
  const [kinder, setKinder] = useState(0)
  const [zvE, setZvE] = useState(30000)
  const [laufzeit, setLaufzeit] = useState(7)
  const [arbeitnehmerSparzulage, setArbeitnehmerSparzulage] = useState(true)
  const [vlBetrag, setVlBetrag] = useState(470)

  const ergebnis = useMemo(() => {
    // Einkommensgrenzen (zvE) fuer WoP
    const wopGrenze = familienstand === 'verheiratet' ? 70000 : 35000
    const wopBerechtigt = zvE <= wopGrenze

    // WoP: 10% der Einzahlungen (§ 3 WoPG)
    const maxEinzahlung = familienstand === 'verheiratet' ? 1400 : 700
    const beruecksichtigteEinzahlung = Math.min(einzahlung, maxEinzahlung)
    const wopJahr = wopBerechtigt ? Math.round(beruecksichtigteEinzahlung * 0.10) : 0
    const wopGesamt = wopJahr * laufzeit

    // Arbeitnehmer-Sparzulage (VL in Bausparvertrag)
    // Grenze: 17.900 EUR (ledig) / 35.800 EUR (verheiratet)
    const ansGrenze = familienstand === 'verheiratet' ? 35800 : 17900
    const ansBerechtigt = zvE <= ansGrenze && arbeitnehmerSparzulage
    const maxVL = familienstand === 'verheiratet' ? 940 : 470
    const beruecksichtigteVL = Math.min(vlBetrag, maxVL)
    const ansJahr = ansBerechtigt ? Math.round(beruecksichtigteVL * 0.09) : 0
    const ansGesamt = ansJahr * laufzeit

    // Gesamtfoerderung
    const foerderungJahr = wopJahr + ansJahr
    const foerderungGesamt = wopGesamt + ansGesamt

    // Gesamtansparung
    const eigenleistungJahr = einzahlung + (arbeitnehmerSparzulage ? vlBetrag : 0)
    const eigenleistungGesamt = eigenleistungJahr * laufzeit
    const sparGesamt = eigenleistungGesamt + foerderungGesamt

    // Chart: Foerderung ueber die Jahre
    const chartData = Array.from({ length: laufzeit }, (_, i) => ({
      jahr: `Jahr ${i + 1}`,
      eigenleistung: eigenleistungJahr,
      wop: wopJahr,
      ans: ansJahr,
    }))

    return {
      wopBerechtigt,
      wopJahr,
      wopGesamt,
      ansBerechtigt,
      ansJahr,
      ansGesamt,
      foerderungJahr,
      foerderungGesamt,
      eigenleistungJahr,
      eigenleistungGesamt,
      sparGesamt,
      chartData,
    }
  }, [einzahlung, familienstand, kinder, zvE, laufzeit, arbeitnehmerSparzulage, vlBetrag])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          Wohnungsbauprämie
        </h1>
        <p className="text-muted-foreground mt-1">
          Staatliche Foerderung fuer Bausparer – § 1 WoPG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>WoP:</strong> <strong>10%</strong> auf max. 700 EUR/Jahr (1.400 EUR Ehepaare). Einkommensgrenze: 35.000/70.000 EUR zvE.</p>
              <p><strong>AN-Sparzulage:</strong> <strong>9%</strong> auf VL bis 470 EUR/Jahr (940 EUR Ehepaare). Grenze: 17.900/35.800 EUR.</p>
              <p><strong>Mindestlaufzeit:</strong> 7 Jahre Bindungsfrist. Vorzeitige Verwendung nur bei wohnungswirtschaftlicher Nutzung.</p>
              <p><strong>Kombination:</strong> WoP + AN-Sparzulage gleichzeitig moeglich!</p>
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
              <p className="text-sm font-medium mb-1">Familienstand</p>
              <div className="flex gap-2">
                {(['ledig', 'verheiratet'] as const).map(f => (
                  <button key={f} onClick={() => setFamilienstand(f)} className={`rounded-md px-4 py-2 text-sm ${familienstand === f ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {f === 'ledig' ? 'Ledig' : 'Verheiratet'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">zvE: {zvE.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={10000} max={80000} step={1000} value={zvE} onChange={e => setZvE(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Bauspar-Einzahlung/Jahr: {einzahlung} EUR</label>
              <input type="range" min={0} max={1400} step={50} value={einzahlung} onChange={e => setEinzahlung(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Max foerderfaehig: {familienstand === 'verheiratet' ? '1.400' : '700'} EUR</p>
            </div>

            <div>
              <label className="text-sm font-medium">Kinder: {kinder}</label>
              <input type="range" min={0} max={5} value={kinder} onChange={e => setKinder(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Laufzeit: {laufzeit} Jahre</label>
              <input type="range" min={7} max={20} value={laufzeit} onChange={e => setLaufzeit(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div className="border-t pt-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={arbeitnehmerSparzulage} onChange={e => setArbeitnehmerSparzulage(e.target.checked)} className="accent-primary" />
                Vermoegenswirksame Leistungen (VL)
              </label>
              {arbeitnehmerSparzulage && (
                <div className="mt-2">
                  <label className="text-sm font-medium">VL-Betrag/Jahr: {vlBetrag} EUR</label>
                  <input type="range" min={0} max={940} step={10} value={vlBetrag} onChange={e => setVlBetrag(+e.target.value)} className="w-full accent-primary" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Foerderung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.foerderungJahr.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Foerderung/Jahr</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.sparGesamt.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Gesamtansparung ({laufzeit} Jahre)</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">WoP berechtigt</span>
                <span className={`font-medium ${ergebnis.wopBerechtigt ? 'text-green-600' : 'text-red-600'}`}>
                  {ergebnis.wopBerechtigt ? 'Ja' : 'Nein (zvE zu hoch)'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Wohnungsbauprämie (10%)</span>
                <span className="font-medium">{ergebnis.wopJahr.toLocaleString('de-DE')} EUR/Jahr</span>
              </div>
              {arbeitnehmerSparzulage && (
                <>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">AN-Sparzulage berechtigt</span>
                    <span className={`font-medium ${ergebnis.ansBerechtigt ? 'text-green-600' : 'text-red-600'}`}>
                      {ergebnis.ansBerechtigt ? 'Ja' : 'Nein'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">AN-Sparzulage (9%)</span>
                    <span className="font-medium">{ergebnis.ansJahr.toLocaleString('de-DE')} EUR/Jahr</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Eigenleistung/Jahr</span>
                <span className="font-medium">{ergebnis.eigenleistungJahr.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b font-bold">
                <span>Foerderung gesamt ({laufzeit} J.)</span>
                <span className="text-primary">{ergebnis.foerderungGesamt.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ansparung & Foerderung nach Jahren</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jahr" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="eigenleistung" name="Eigenleistung" fill="#7c3aed" stackId="a" />
                <Bar dataKey="wop" name="WoP" fill="#22c55e" stackId="a" />
                <Bar dataKey="ans" name="AN-Sparzulage" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
