import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { BookOpen, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function GewinnermittlungPage() {
  const [umsatz, setUmsatz] = useState(120000)
  const [wareneinsatz, setWareneinsatz] = useState(30000)
  const [personalkosten, setPersonalkosten] = useState(25000)
  const [miete, setMiete] = useState(12000)
  const [sonstigeBK, setSonstigeBK] = useState(8000)
  const [abschreibungen, setAbschreibungen] = useState(5000)
  const [privatanteil, setPrivatanteil] = useState(10)
  const [methode, setMethode] = useState<'bilanz' | 'euer'>('euer')

  const ergebnis = useMemo(() => {
    const betriebsausgaben = wareneinsatz + personalkosten + miete + sonstigeBK + abschreibungen
    const gewinn = umsatz - betriebsausgaben

    // EÜR: Zufluss-/Abflussprinzip
    const euerGewinn = gewinn // Vereinfacht gleich

    // Bilanz: Mit Bestandsveränderungen (simuliert)
    const bestandsVeraenderung = Math.round(wareneinsatz * 0.05) // 5% Bestandsaufbau
    const bilanzGewinn = gewinn + bestandsVeraenderung

    // Privatanteil (z.B. Kfz, Telefon)
    const privatEntnahme = Math.round(betriebsausgaben * privatanteil / 100)
    const korrigierterGewinn = (methode === 'bilanz' ? bilanzGewinn : euerGewinn) + privatEntnahme

    // Steuer auf Gewinn (ESt vereinfacht)
    const calcESt = (zvE: number) => {
      if (zvE <= 12084) return 0
      if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
      if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
      if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
      return Math.round(0.45 * zvE - 18730.89)
    }

    const est = calcESt(korrigierterGewinn)
    const soli = est > 18130 ? Math.round(est * 0.055) : 0
    const steuerGesamt = est + soli

    // Gewinnvergleich EÜR vs Bilanz
    const chartData = [
      { name: 'EÜR', umsatz, ausgaben: betriebsausgaben, gewinn: euerGewinn + privatEntnahme },
      { name: 'Bilanz', umsatz, ausgaben: betriebsausgaben - bestandsVeraenderung, gewinn: bilanzGewinn + privatEntnahme },
    ]

    return {
      betriebsausgaben,
      gewinn,
      euerGewinn,
      bilanzGewinn,
      bestandsVeraenderung,
      privatEntnahme,
      korrigierterGewinn,
      est,
      soli,
      steuerGesamt,
      chartData,
    }
  }, [umsatz, wareneinsatz, personalkosten, miete, sonstigeBK, abschreibungen, privatanteil, methode])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Gewinnermittlung
        </h1>
        <p className="text-muted-foreground mt-1">
          EÜR vs. Bilanzierung – § 4 Abs. 1/3 EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>EÜR (§ 4 Abs. 3):</strong> Zufluss-/Abflussprinzip. Fuer Freiberufler + Gewerbetreibende unter 80.000 EUR Gewinn / 800.000 EUR Umsatz.</p>
              <p><strong>Bilanzierung (§ 4 Abs. 1):</strong> Betriebsvermoegensvergleich. Pflicht bei Ueberschreitung der Grenzen oder Handelsregistereintrag.</p>
              <p><strong>Wechsel:</strong> EÜR → Bilanz: Uebergangsgewinn wird aufgeloest. Bilanz → EÜR: Nur mit FA-Genehmigung.</p>
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
              <p className="text-sm font-medium mb-2">Gewinnermittlungsart</p>
              <div className="flex gap-2">
                <button onClick={() => setMethode('euer')} className={`rounded-md px-4 py-2 text-sm ${methode === 'euer' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  EÜR (§ 4/3)
                </button>
                <button onClick={() => setMethode('bilanz')} className={`rounded-md px-4 py-2 text-sm ${methode === 'bilanz' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  Bilanz (§ 4/1)
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Umsatz: {umsatz.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={10000} max={500000} step={5000} value={umsatz} onChange={e => setUmsatz(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Wareneinsatz/Material: {wareneinsatz.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={wareneinsatz} onChange={e => setWareneinsatz(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Personalkosten: {personalkosten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={personalkosten} onChange={e => setPersonalkosten(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Miete/Raumkosten: {miete.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={500} value={miete} onChange={e => setMiete(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Sonstige Betriebskosten: {sonstigeBK.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={500} value={sonstigeBK} onChange={e => setSonstigeBK(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Abschreibungen (AfA): {abschreibungen.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={500} value={abschreibungen} onChange={e => setAbschreibungen(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Privatanteil: {privatanteil}%</label>
              <input type="range" min={0} max={30} value={privatanteil} onChange={e => setPrivatanteil(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis ({methode === 'euer' ? 'EÜR' : 'Bilanz'})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.korrigierterGewinn.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Gewinn (steuerpflichtig)</p>
              </div>
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.steuerGesamt.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">ESt + Soli</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Betriebseinnahmen</span>
                <span className="font-medium">{umsatz.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Betriebsausgaben</span>
                <span className="font-medium text-red-600">-{ergebnis.betriebsausgaben.toLocaleString('de-DE')} EUR</span>
              </div>
              {methode === 'bilanz' && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Bestandsveraenderung</span>
                  <span className="font-medium text-green-600">+{ergebnis.bestandsVeraenderung.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Gewinn vor Korrekturen</span>
                <span className="font-medium">{(methode === 'bilanz' ? ergebnis.bilanzGewinn : ergebnis.euerGewinn).toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">+ Privatentnahmen/-anteile</span>
                <span className="font-medium">{ergebnis.privatEntnahme.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b font-bold">
                <span>Steuerpflichtiger Gewinn</span>
                <span>{ergebnis.korrigierterGewinn.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Einkommensteuer</span>
                <span className="font-medium">{ergebnis.est.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.soli > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Solidaritaetszuschlag</span>
                  <span className="font-medium">{ergebnis.soli.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 font-bold text-lg">
                <span>Steuer gesamt</span>
                <span className="text-red-600">{ergebnis.steuerGesamt.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vergleich EÜR vs. Bilanz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="umsatz" name="Umsatz" fill="#94a3b8" />
                <Bar dataKey="ausgaben" name="Ausgaben" fill="#ef4444" />
                <Bar dataKey="gewinn" name="Gewinn" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">EÜR vs. Bilanzierung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">EÜR (§ 4 Abs. 3)</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Einfach: Einnahmen − Ausgaben</li>
                <li>+ Zufluss-/Abflussprinzip</li>
                <li>+ Kein Jahresabschluss noetig</li>
                <li>+ Steuergestaltung durch Zahlungszeitpunkt</li>
                <li>- Kein Vermoegensueberblick</li>
                <li>= Grenzen: 80.000 Gewinn / 800.000 Umsatz</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Bilanzierung (§ 4 Abs. 1)</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Vollstaendiger Vermoegensueberblick</li>
                <li>+ Periodengerechte Zuordnung</li>
                <li>+ Rueckstellungen moeglich</li>
                <li>+ Bessere Vergleichbarkeit</li>
                <li>- Aufwendiger, Steuerberater empfohlen</li>
                <li>= Pflicht bei Kaufleuten / Ueberschreitung</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
