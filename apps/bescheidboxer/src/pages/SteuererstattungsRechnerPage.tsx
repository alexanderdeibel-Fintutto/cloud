import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Receipt, Info, TrendingDown, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function calcESt(zvE: number): number {
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

interface Position {
  label: string
  betrag: number
  kategorie: 'werbungskosten' | 'sonderausgaben' | 'aussergewoehnlich' | 'haushaltsnahe'
}

export default function SteuererstattungsRechnerPage() {
  const [brutto, setBrutto] = useState(55000)
  const [steuerklasse, setSteuerklasse] = useState(1)
  const [kirchensteuer, setKirchensteuer] = useState(true)
  const [bundesland, setBundesland] = useState('Bayern')

  const [positionen, setPositionen] = useState<Position[]>([
    { label: 'Entfernungspauschale', betrag: 1650, kategorie: 'werbungskosten' },
    { label: 'Homeoffice-Pauschale', betrag: 1260, kategorie: 'werbungskosten' },
    { label: 'Arbeitsmittel (Computer etc.)', betrag: 400, kategorie: 'werbungskosten' },
    { label: 'Spenden', betrag: 300, kategorie: 'sonderausgaben' },
    { label: 'Handwerkerleistungen (§ 35a)', betrag: 1200, kategorie: 'haushaltsnahe' },
  ])

  const updateBetrag = (index: number, betrag: number) => {
    setPositionen(prev => prev.map((p, i) => i === index ? { ...p, betrag } : p))
  }

  const ergebnis = useMemo(() => {
    // Werbungskosten: max(Summe, Pauschbetrag 1.230 EUR)
    const wkSumme = positionen.filter(p => p.kategorie === 'werbungskosten').reduce((s, p) => s + p.betrag, 0)
    const wkAbzug = Math.max(wkSumme, 1230)

    const saAbzug = positionen.filter(p => p.kategorie === 'sonderausgaben').reduce((s, p) => s + p.betrag, 0)
    const agbAbzug = positionen.filter(p => p.kategorie === 'aussergewoehnlich').reduce((s, p) => s + p.betrag, 0)
    const hhAbzug = positionen.filter(p => p.kategorie === 'haushaltsnahe').reduce((s, p) => s + p.betrag, 0)

    // zvE berechnen
    const zvE = Math.max(brutto - wkAbzug - saAbzug - agbAbzug, 0)

    // Einkommensteuer
    const est = steuerklasse === 3 || steuerklasse === 4
      ? calcESt(Math.round(zvE / 2)) * 2
      : calcESt(zvE)

    // Soli
    const soliGrenze = steuerklasse === 3 ? 36260 : 18130
    let soli = 0
    if (est > soliGrenze) {
      const zone = est - soliGrenze
      soli = Math.min(Math.round(zone * 0.119), Math.round(est * 0.055))
    }

    // Kirchensteuer
    const kiStSatz = bundesland === 'Bayern' || bundesland === 'Baden-Wuerttemberg' ? 8 : 9
    const kiSt = kirchensteuer ? Math.round(est * kiStSatz / 100) : 0

    // Jahressteuer tatsaechlich
    const jahressteuer = est + soli + kiSt

    // Abgezogene Lohnsteuer (Naeherung basierend auf Brutto)
    // Vereinfachte Schaetzung: ~wie ESt auf Brutto minus Pauschbetrag
    const zvEOhneSa = Math.max(brutto - 1230, 0)
    const lstEst = steuerklasse === 3 || steuerklasse === 4
      ? calcESt(Math.round(zvEOhneSa / 2)) * 2
      : calcESt(zvEOhneSa)
    const lstSoli = lstEst > soliGrenze ? Math.min(Math.round((lstEst - soliGrenze) * 0.119), Math.round(lstEst * 0.055)) : 0
    const lstKiSt = kirchensteuer ? Math.round(lstEst * kiStSatz / 100) : 0
    const gezahlteLohnsteuer = lstEst + lstSoli + lstKiSt

    // Erstattung/Nachzahlung
    let erstattungVorHH = gezahlteLohnsteuer - jahressteuer

    // § 35a Steuermaessigung direkt von der Steuer
    const hhErmassigung = Math.min(Math.round(hhAbzug * 0.20), 1200)
    const erstattung = erstattungVorHH + hhErmassigung

    return {
      wkSumme,
      wkAbzug,
      saAbzug,
      agbAbzug,
      hhAbzug,
      hhErmassigung,
      zvE,
      est,
      soli,
      kiSt,
      jahressteuer,
      gezahlteLohnsteuer,
      erstattung,
    }
  }, [brutto, steuerklasse, kirchensteuer, bundesland, positionen])

  const chartData = [
    { name: 'Lohnsteuer\n(gezahlt)', betrag: ergebnis.gezahlteLohnsteuer, fill: '#ef4444' },
    { name: 'Jahressteuer\n(tatsaechlich)', betrag: ergebnis.jahressteuer, fill: '#6366f1' },
    { name: ergebnis.erstattung >= 0 ? 'Erstattung' : 'Nachzahlung', betrag: Math.abs(ergebnis.erstattung), fill: ergebnis.erstattung >= 0 ? '#22c55e' : '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          Steuererstattungs-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Schaetzen Sie Ihre Steuererstattung oder Nachzahlung
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>So funktioniert es:</strong> Ihr Arbeitgeber fuehrt monatlich Lohnsteuer ab (basierend auf Steuerklasse + Pauschbetraegen). Die Steuererklaerung berechnet Ihre tatsaechliche Jahressteuer. Die Differenz ist Ihre Erstattung/Nachzahlung.</p>
              <p><strong>Durchschnitt:</strong> Arbeitnehmer erhalten ca. 1.063 EUR Erstattung (2024).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Grunddaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Jahresbrutto: {brutto.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={15000} max={200000} step={1000} value={brutto} onChange={e => setBrutto(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Steuerklasse</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map(sk => (
                  <button key={sk} onClick={() => setSteuerklasse(sk)} className={`rounded-md px-4 py-2 text-sm min-w-[44px] ${steuerklasse === sk ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {sk}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Bundesland</label>
              <select value={bundesland} onChange={e => setBundesland(e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm bg-background">
                {['Baden-Wuerttemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thueringen'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="rounded" />
              Kirchensteuerpflichtig
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Absetzbare Posten (EUR/Jahr)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {positionen.map((pos, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm truncate">{pos.label}</span>
                <input
                  type="number"
                  value={pos.betrag}
                  onChange={e => updateBetrag(i, +e.target.value)}
                  className="w-24 rounded border px-2 py-1.5 text-sm text-right"
                />
                <span className="text-xs text-muted-foreground w-8">EUR</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              Werbungskosten: Nur Betrag ueber 1.230 EUR Pauschbetrag wirkt sich aus.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ergebnis */}
      <Card className={`border-2 ${ergebnis.erstattung >= 0 ? 'border-green-500/50' : 'border-red-500/50'}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {ergebnis.erstattung >= 0 ? (
              <TrendingDown className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingUp className="h-5 w-5 text-red-600" />
            )}
            {ergebnis.erstattung >= 0 ? 'Voraussichtliche Erstattung' : 'Voraussichtliche Nachzahlung'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-xl font-bold">{ergebnis.gezahlteLohnsteuer.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Gezahlte Lohnsteuer+Soli+KiSt</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-xl font-bold text-primary">{ergebnis.jahressteuer.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Tatsaechliche Jahressteuer</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${ergebnis.erstattung >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <p className={`text-2xl font-bold ${ergebnis.erstattung >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {ergebnis.erstattung >= 0 ? '+' : ''}{ergebnis.erstattung.toLocaleString('de-DE')} EUR
              </p>
              <p className="text-xs text-muted-foreground mt-1">{ergebnis.erstattung >= 0 ? 'Erstattung' : 'Nachzahlung'}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Brutto</span>
              <span className="font-medium">{brutto.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Werbungskosten (max. {ergebnis.wkSumme.toLocaleString('de-DE')}/Pausch. 1.230)</span>
              <span className="font-medium">-{ergebnis.wkAbzug.toLocaleString('de-DE')} EUR</span>
            </div>
            {ergebnis.saAbzug > 0 && (
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Sonderausgaben</span>
                <span className="font-medium">-{ergebnis.saAbzug.toLocaleString('de-DE')} EUR</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Zu versteuerndes Einkommen</span>
              <span className="font-medium">{ergebnis.zvE.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">ESt / Soli / KiSt</span>
              <span className="font-medium">{ergebnis.est.toLocaleString('de-DE')} / {ergebnis.soli.toLocaleString('de-DE')} / {ergebnis.kiSt.toLocaleString('de-DE')} EUR</span>
            </div>
            {ergebnis.hhErmassigung > 0 && (
              <div className="flex justify-between py-1.5 border-b text-green-700 dark:text-green-400">
                <span>§ 35a Steuermaessigung (20% von {ergebnis.hhAbzug.toLocaleString('de-DE')} EUR)</span>
                <span className="font-medium">-{ergebnis.hhErmassigung.toLocaleString('de-DE')} EUR</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 font-bold">
              <span>{ergebnis.erstattung >= 0 ? 'Erstattung' : 'Nachzahlung'}</span>
              <span className={ergebnis.erstattung >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {ergebnis.erstattung >= 0 ? '+' : ''}{ergebnis.erstattung.toLocaleString('de-DE')} EUR
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Bar dataKey="betrag" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
