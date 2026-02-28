import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Monitor, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function HomeOfficePauschalePage() {
  const [tageProWoche, setTageProWoche] = useState(3)
  const [wochen, setWochen] = useState(46)
  const [arbeitszimmer, setArbeitszimmer] = useState(false)
  const [arbeitszimmerKosten, setArbeitszimmerKosten] = useState(3000)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)
  const [pendlerEntfernung, setPendlerEntfernung] = useState(25)

  const ergebnis = useMemo(() => {
    const tageGesamt = Math.round(tageProWoche * wochen)
    const maxTage = 210
    const anrechenbareTage = Math.min(tageGesamt, maxTage)

    // Homeoffice-Pauschale: 6 EUR/Tag, max 1.260 EUR (210 Tage)
    const pauschaleProTag = 6
    const homeOfficePauschale = anrechenbareTage * pauschaleProTag
    const maxPauschale = 1260

    const effektivePauschale = Math.min(homeOfficePauschale, maxPauschale)

    // Alternative: Arbeitszimmer (nur wenn mittelpunkt der beruflichen Taetigkeit)
    const arbeitszimmerAbzug = arbeitszimmer ? arbeitszimmerKosten : 0

    // Vergleich: Was ist besser?
    const besserePauschale = arbeitszimmer
      ? Math.max(effektivePauschale, arbeitszimmerAbzug)
      : effektivePauschale

    // Entgangene Pendlerpauschale an Homeoffice-Tagen
    const pendlerProTag = pendlerEntfernung <= 20
      ? pendlerEntfernung * 0.30
      : 20 * 0.30 + (pendlerEntfernung - 20) * 0.38
    const entgangenePendler = Math.round(anrechenbareTage * pendlerProTag)

    // Buero-Tage Pendlerpauschale
    const bueroTage = Math.round((5 - tageProWoche) * wochen)
    const pendlerBuero = Math.round(bueroTage * pendlerProTag)

    // Gesamte Werbungskosten
    const gesamtWK = effektivePauschale + pendlerBuero
    const arbeitnehmerPauschbetrag = 1230
    const ueberschuss = Math.max(gesamtWK - arbeitnehmerPauschbetrag, 0)
    const steuerersparnis = Math.round(ueberschuss * grenzsteuersatz / 100)

    // Chart: Steuerersparnis nach Tagen
    const chartData = Array.from({ length: 22 }, (_, i) => {
      const tage = i * 10
      const hp = Math.min(tage * pauschaleProTag, maxPauschale)
      const buero = Math.round(((5 - (tage / wochen)) * wochen) * pendlerProTag)
      const wk = hp + Math.max(buero, 0)
      const ueb = Math.max(wk - arbeitnehmerPauschbetrag, 0)
      return {
        tage,
        homeoffice: hp,
        pendler: Math.max(buero, 0),
        ersparnis: Math.round(ueb * grenzsteuersatz / 100),
      }
    })

    return {
      tageGesamt,
      anrechenbareTage,
      effektivePauschale,
      arbeitszimmerAbzug,
      besserePauschale,
      entgangenePendler,
      pendlerBuero,
      gesamtWK,
      ueberschuss,
      steuerersparnis,
      bueroTage,
      chartData,
    }
  }, [tageProWoche, wochen, arbeitszimmer, arbeitszimmerKosten, grenzsteuersatz, pendlerEntfernung])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Monitor className="h-6 w-6 text-primary" />
          Homeoffice-Pauschale
        </h1>
        <p className="text-muted-foreground mt-1">
          Tagespauschale 6 EUR – § 4 Abs. 5 Nr. 6c EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Homeoffice-Pauschale:</strong> <strong>6 EUR/Tag</strong>, max. <strong>210 Tage = 1.260 EUR/Jahr</strong> (seit 2023 unbefristet).</p>
              <p><strong>Kein eigenes Arbeitszimmer noetig.</strong> Auch Kueche oder Wohnzimmer zaehlen.</p>
              <p><strong>Wichtig:</strong> An Homeoffice-Tagen <strong>keine Pendlerpauschale</strong> absetzbar. Optimale Mischung pruefen!</p>
              <p><strong>Alternative:</strong> Haeusliches Arbeitszimmer (§ 4 Abs. 5 Nr. 6b) bei Mittelpunkt der Taetigkeit – volle Kosten absetzbar.</p>
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
              <label className="text-sm font-medium">Homeoffice-Tage/Woche: {tageProWoche}</label>
              <input type="range" min={0} max={5} step={0.5} value={tageProWoche} onChange={e => setTageProWoche(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">Buero-Tage: {(5 - tageProWoche).toFixed(1)}/Woche</p>
            </div>

            <div>
              <label className="text-sm font-medium">Arbeitswochen/Jahr: {wochen}</label>
              <input type="range" min={30} max={52} value={wochen} onChange={e => setWochen(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">= {ergebnis.tageGesamt} Homeoffice-Tage (anrechenbar: {ergebnis.anrechenbareTage})</p>
            </div>

            <div>
              <label className="text-sm font-medium">Entfernung Wohnung–Buero: {pendlerEntfernung} km</label>
              <input type="range" min={0} max={100} value={pendlerEntfernung} onChange={e => setPendlerEntfernung(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={arbeitszimmer} onChange={e => setArbeitszimmer(e.target.checked)} className="accent-primary" />
              Haeusliches Arbeitszimmer (Mittelpunkt der Taetigkeit)
            </label>

            {arbeitszimmer && (
              <div>
                <label className="text-sm font-medium">Arbeitszimmer-Kosten: {arbeitszimmerKosten.toLocaleString('de-DE')} EUR/Jahr</label>
                <input type="range" min={500} max={10000} step={100} value={arbeitszimmerKosten} onChange={e => setArbeitszimmerKosten(+e.target.value)} className="w-full accent-primary" />
                <p className="text-xs text-muted-foreground mt-1">Miete, Nebenkosten, Strom, Internet (anteilig)</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.effektivePauschale.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Homeoffice-Pauschale</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Steuerersparnis</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Homeoffice-Tage</span>
                <span className="font-medium">{ergebnis.anrechenbareTage} Tage × 6 EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Homeoffice-Pauschale</span>
                <span className="font-medium">{ergebnis.effektivePauschale.toLocaleString('de-DE')} EUR</span>
              </div>
              {arbeitszimmer && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Arbeitszimmer-Kosten</span>
                  <span className="font-medium">{ergebnis.arbeitszimmerAbzug.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Pendlerpauschale (Buero-Tage)</span>
                <span className="font-medium">{ergebnis.pendlerBuero.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Buero-Tage</span>
                <span className="font-medium">{ergebnis.bueroTage} Tage</span>
              </div>
              <div className="flex justify-between py-1.5 border-b font-medium">
                <span>Gesamt-Werbungskosten</span>
                <span>{ergebnis.gesamtWK.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Abzgl. Pauschbetrag (1.230 EUR)</span>
                <span className="font-medium">-1.230 EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Ueberschuss</span>
                <span className="font-medium">{ergebnis.ueberschuss.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-lg">
                <span>Steuerersparnis</span>
                <span className="text-green-600">{ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Optimale Mischung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tage" tick={{ fontSize: 10 }} label={{ value: 'HO-Tage/Jahr', position: 'bottom', fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} labelFormatter={v => `${v} HO-Tage`} />
                <ReferenceLine x={ergebnis.anrechenbareTage} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Aktuell', fontSize: 10 }} />
                <Area type="monotone" dataKey="homeoffice" name="HO-Pauschale" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} stackId="1" />
                <Area type="monotone" dataKey="pendler" name="Pendlerpauschale" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Mehr Homeoffice = mehr HO-Pauschale, weniger Pendlerpauschale. Optimum abhaengig von Entfernung.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Homeoffice vs. Arbeitszimmer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Homeoffice-Pauschale</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Kein eigener Raum noetig</li>
                <li>+ Einfach: 6 EUR/Tag</li>
                <li>+ Keine Nachweise noetig</li>
                <li>- Max. 1.260 EUR/Jahr</li>
                <li>- Keine Pendlerpauschale gleichzeitig</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Haeusliches Arbeitszimmer</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Volle Kosten absetzbar (unbegrenzt)</li>
                <li>+ Auch Moebel, Internet etc.</li>
                <li>- Eigener, abgetrennter Raum noetig</li>
                <li>- Mittelpunkt der Taetigkeit erforderlich</li>
                <li>- Nachweise und Berechnung noetig</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
