import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { FileText, Info, Euro } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface EuerPosition {
  label: string
  betrag: number
  typ: 'einnahme' | 'ausgabe'
  kategorie: string
}

const DEFAULT_POSITIONEN: EuerPosition[] = [
  { label: 'Honorare/Rechnungen', betrag: 72000, typ: 'einnahme', kategorie: 'Umsatzerloese' },
  { label: 'Warenverkaeufe', betrag: 8000, typ: 'einnahme', kategorie: 'Umsatzerloese' },
  { label: 'Sonstige Einnahmen', betrag: 2000, typ: 'einnahme', kategorie: 'Sonstige' },
  { label: 'Wareneinkauf', betrag: 12000, typ: 'ausgabe', kategorie: 'Wareneinsatz' },
  { label: 'Personalkosten', betrag: 18000, typ: 'ausgabe', kategorie: 'Personal' },
  { label: 'Miete/Buero', betrag: 9600, typ: 'ausgabe', kategorie: 'Raumkosten' },
  { label: 'Versicherungen', betrag: 3600, typ: 'ausgabe', kategorie: 'Versicherung' },
  { label: 'KFZ-Kosten', betrag: 4800, typ: 'ausgabe', kategorie: 'Fahrzeug' },
  { label: 'Telefon/Internet', betrag: 1200, typ: 'ausgabe', kategorie: 'Kommunikation' },
  { label: 'Buromaterial', betrag: 600, typ: 'ausgabe', kategorie: 'Sonstige' },
  { label: 'Steuerberater', betrag: 2400, typ: 'ausgabe', kategorie: 'Beratung' },
  { label: 'Abschreibungen (AfA)', betrag: 3000, typ: 'ausgabe', kategorie: 'AfA' },
]

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

export default function EinnahmenUeberschussPage() {
  const [positionen, setPositionen] = useState(DEFAULT_POSITIONEN)
  const [vorsorge, setVorsorge] = useState(8000)
  const [sonderausgaben, setSonderausgaben] = useState(2000)

  const updateBetrag = (index: number, betrag: number) => {
    setPositionen(prev => prev.map((p, i) => i === index ? { ...p, betrag } : p))
  }

  const ergebnis = useMemo(() => {
    const einnahmen = positionen.filter(p => p.typ === 'einnahme').reduce((s, p) => s + p.betrag, 0)
    const ausgaben = positionen.filter(p => p.typ === 'ausgabe').reduce((s, p) => s + p.betrag, 0)
    const gewinn = einnahmen - ausgaben

    const zvE = Math.max(gewinn - vorsorge - sonderausgaben, 0)
    const est = calcESt(zvE)
    const soli = est > 18130 ? Math.min(Math.round((est - 18130) * 0.119), Math.round(est * 0.055)) : 0
    const gesamt = est + soli

    const grenzsteuersatz = zvE > 277825 ? 45 : zvE > 66760 ? 42 : zvE > 17005 ? Math.round((181.19 * 2 * ((zvE - 17005) / 10000) + 2397) / 100) : 14
    const durchschnittssteuersatz = zvE > 0 ? Math.round(est / zvE * 100 * 10) / 10 : 0

    // Kategorien fuer Chart
    const kategorien: Record<string, { einnahmen: number; ausgaben: number }> = {}
    for (const p of positionen) {
      if (!kategorien[p.kategorie]) kategorien[p.kategorie] = { einnahmen: 0, ausgaben: 0 }
      if (p.typ === 'einnahme') kategorien[p.kategorie].einnahmen += p.betrag
      else kategorien[p.kategorie].ausgaben += p.betrag
    }
    const chartData = Object.entries(kategorien).map(([name, val]) => ({
      name: name.length > 14 ? name.slice(0, 14) + '.' : name,
      einnahmen: val.einnahmen,
      ausgaben: val.ausgaben,
    })).filter(d => d.einnahmen > 0 || d.ausgaben > 0)

    return { einnahmen, ausgaben, gewinn, vorsorge, sonderausgaben, zvE, est, soli, gesamt, grenzsteuersatz, durchschnittssteuersatz, chartData }
  }, [positionen, vorsorge, sonderausgaben])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Einnahmen-Ueberschuss-Rechnung
        </h1>
        <p className="text-muted-foreground mt-1">
          EUER fuer Selbstaendige und Freiberufler – § 4 Abs. 3 EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>EUER (§ 4 Abs. 3 EStG):</strong> Vereinfachte Gewinnermittlung fuer Freiberufler, Kleingewerbetreibende und Gewerbetreibende unter 600.000 EUR Umsatz / 60.000 EUR Gewinn.</p>
              <p><strong>Prinzip:</strong> Gewinn = Betriebseinnahmen - Betriebsausgaben (Zufluss-/Abflussprinzip).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Einnahmen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-700 dark:text-green-400 flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Betriebseinnahmen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {positionen.map((pos, i) => pos.typ === 'einnahme' && (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm truncate">{pos.label}</span>
                <input type="number" value={pos.betrag} onChange={e => updateBetrag(i, +e.target.value)} className="w-28 rounded border px-2 py-1.5 text-sm text-right" />
                <span className="text-xs text-muted-foreground w-8">EUR</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t font-bold text-green-700 dark:text-green-400">
              <span>Gesamt Einnahmen</span>
              <span>{ergebnis.einnahmen.toLocaleString('de-DE')} EUR</span>
            </div>
          </CardContent>
        </Card>

        {/* Ausgaben */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-700 dark:text-red-400 flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Betriebsausgaben
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {positionen.map((pos, i) => pos.typ === 'ausgabe' && (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm truncate">{pos.label}</span>
                <input type="number" value={pos.betrag} onChange={e => updateBetrag(i, +e.target.value)} className="w-28 rounded border px-2 py-1.5 text-sm text-right" />
                <span className="text-xs text-muted-foreground w-8">EUR</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t font-bold text-red-700 dark:text-red-400">
              <span>Gesamt Ausgaben</span>
              <span>{ergebnis.ausgaben.toLocaleString('de-DE')} EUR</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abzuege */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Persoenliche Abzuege</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Vorsorgeaufwendungen: {vorsorge.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={30000} step={500} value={vorsorge} onChange={e => setVorsorge(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Sonderausgaben: {sonderausgaben.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={15000} step={500} value={sonderausgaben} onChange={e => setSonderausgaben(+e.target.value)} className="w-full accent-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ergebnis */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Ergebnis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{ergebnis.gewinn.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Gewinn (EUER)</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{ergebnis.zvE.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Zu versteuerndes Einkommen</p>
            </div>
            <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.gesamt.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">ESt + Soli</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{(ergebnis.gewinn - ergebnis.gesamt).toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Nach Steuern</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Einnahmen</span>
              <span className="font-medium text-green-700">{ergebnis.einnahmen.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Ausgaben</span>
              <span className="font-medium text-red-700">-{ergebnis.ausgaben.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b font-bold">
              <span>Gewinn</span>
              <span className="text-primary">{ergebnis.gewinn.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Vorsorgeaufwendungen</span>
              <span className="font-medium">-{ergebnis.vorsorge.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Sonderausgaben</span>
              <span className="font-medium">-{ergebnis.sonderausgaben.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b font-bold">
              <span>zvE</span>
              <span>{ergebnis.zvE.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Einkommensteuer</span>
              <span className="font-medium">{ergebnis.est.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Solidaritaetszuschlag</span>
              <span className="font-medium">{ergebnis.soli.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Grenzsteuersatz / Durchschnitt</span>
              <span className="font-medium">{ergebnis.grenzsteuersatz}% / {ergebnis.durchschnittssteuersatz}%</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-lg">
              <span>Netto nach Steuern</span>
              <span className="text-green-700 dark:text-green-400">{(ergebnis.gewinn - ergebnis.gesamt).toLocaleString('de-DE')} EUR</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Einnahmen vs. Ausgaben nach Kategorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="einnahmen" name="Einnahmen" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ausgaben" name="Ausgaben" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
