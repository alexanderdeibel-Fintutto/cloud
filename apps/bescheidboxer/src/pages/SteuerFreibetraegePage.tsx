import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ShieldCheck, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Freibetrag {
  name: string
  betrag: number
  paragraph: string
  kategorie: string
  info: string
  splitting?: boolean
}

const FREIBETRAEGE: Freibetrag[] = [
  { name: 'Grundfreibetrag', betrag: 12084, paragraph: '§ 32a EStG', kategorie: 'Allgemein', info: 'Existenzminimum, automatisch beruecksichtigt', splitting: true },
  { name: 'Arbeitnehmer-Pauschbetrag', betrag: 1230, paragraph: '§ 9a Nr. 1a EStG', kategorie: 'Werbungskosten', info: 'Werbungskosten-Pauschale (ohne Nachweis)' },
  { name: 'Sparerpauschbetrag', betrag: 1000, paragraph: '§ 20 Abs. 9 EStG', kategorie: 'Kapital', info: 'Fuer Kapitalertraege (Zinsen, Dividenden)', splitting: true },
  { name: 'Sonderausgaben-Pauschale', betrag: 36, paragraph: '§ 10c EStG', kategorie: 'Sonderausgaben', info: 'Minimal-Pauschale ohne Nachweis', splitting: true },
  { name: 'Kinderfreibetrag', betrag: 6612, paragraph: '§ 32 Abs. 6 EStG', kategorie: 'Kinder', info: 'Pro Kind, wird mit Kindergeld verrechnet (Guenstigerpruefung)' },
  { name: 'BEA-Freibetrag', betrag: 2928, paragraph: '§ 32 Abs. 6 EStG', kategorie: 'Kinder', info: 'Betreuungs-/Erziehungs-/Ausbildungsfreibetrag pro Kind' },
  { name: 'Entlastungsbetrag Alleinerziehende', betrag: 4260, paragraph: '§ 24b EStG', kategorie: 'Kinder', info: '+ 240 EUR fuer jedes weitere Kind' },
  { name: 'Ausbildungsfreibetrag', betrag: 1200, paragraph: '§ 33a Abs. 2 EStG', kategorie: 'Kinder', info: 'Volljaehriges Kind in Ausbildung, auswaertig untergebracht' },
  { name: 'Versorgungsfreibetrag (max)', betrag: 1140, paragraph: '§ 19 Abs. 2 EStG', kategorie: 'Versorgung', info: 'Fuer Versorgungsbezuege (Beamtenpension), abschmelzend' },
  { name: 'Altersentlastungsbetrag (max)', betrag: 684, paragraph: '§ 24a EStG', kategorie: 'Alter', info: 'Ab 64. Lebensjahr, abschmelzend bis 2058' },
  { name: 'Uebungsleiterpauschale', betrag: 3000, paragraph: '§ 3 Nr. 26 EStG', kategorie: 'Ehrenamt', info: 'Fuer nebenberufliche Taetigkeit als Uebungsleiter, Trainer etc.' },
  { name: 'Ehrenamtspauschale', betrag: 840, paragraph: '§ 3 Nr. 26a EStG', kategorie: 'Ehrenamt', info: 'Fuer gemeinnuetzige/kirchliche Taetigkeit' },
  { name: 'Behinderten-Pauschbetrag (GdB 50)', betrag: 1140, paragraph: '§ 33b EStG', kategorie: 'Behinderung', info: 'Abhaengig vom Grad der Behinderung (GdB 20: 384 – GdB 100: 2.840)' },
  { name: 'Pflege-Pauschbetrag', betrag: 1800, paragraph: '§ 33b Abs. 6 EStG', kategorie: 'Pflege', info: 'Pflegegrad 4-5 (PG2: 600, PG3: 1.100)' },
  { name: 'Vorsorge-Hoechstbetrag', betrag: 27566, paragraph: '§ 10 Abs. 3 EStG', kategorie: 'Vorsorge', info: 'Altersvorsorge (Ruerup, GRV) – 2025: 100% abzugsfaehig' },
  { name: 'Riester-Hoechstbetrag', betrag: 2100, paragraph: '§ 10a EStG', kategorie: 'Vorsorge', info: 'Sonderausgabenabzug inkl. Zulagen' },
  { name: 'Haushaltsnahe DL (max Ermaessigung)', betrag: 4000, paragraph: '§ 35a Abs. 2 EStG', kategorie: 'Haushalt', info: '20% von max. 20.000 EUR Arbeitskosten' },
  { name: 'Handwerkerleistung (max Ermaessigung)', betrag: 1200, paragraph: '§ 35a Abs. 3 EStG', kategorie: 'Haushalt', info: '20% von max. 6.000 EUR Lohnkosten' },
  { name: 'Homeoffice-Pauschale', betrag: 1260, paragraph: '§ 4 Abs. 5 Nr. 6c EStG', kategorie: 'Werbungskosten', info: '6 EUR/Tag, max. 210 Tage' },
]

export default function SteuerFreibetraegePage() {
  const [filter, setFilter] = useState<string>('alle')
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)

  const kategorien = useMemo(() => {
    const kats = new Set(FREIBETRAEGE.map(f => f.kategorie))
    return ['alle', ...Array.from(kats)]
  }, [])

  const gefiltert = useMemo(() => {
    return filter === 'alle' ? FREIBETRAEGE : FREIBETRAEGE.filter(f => f.kategorie === filter)
  }, [filter])

  const chartData = useMemo(() => {
    return gefiltert
      .sort((a, b) => b.betrag - a.betrag)
      .slice(0, 10)
      .map(f => ({
        name: f.name.length > 20 ? f.name.slice(0, 18) + '...' : f.name,
        betrag: f.betrag,
        steuerersparnis: Math.round(f.betrag * grenzsteuersatz / 100),
      }))
  }, [gefiltert, grenzsteuersatz])

  const gesamtPotenzial = useMemo(() => {
    return gefiltert.reduce((s, f) => s + f.betrag, 0)
  }, [gefiltert])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Steuer-Freibetraege 2025
        </h1>
        <p className="text-muted-foreground mt-1">
          Alle wichtigen Freibetraege und Pauschalen im Ueberblick
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200">
              <p><strong>Freibetraege</strong> reduzieren das zu versteuernde Einkommen. <strong>Steuerermäßigungen</strong> (§ 35a) reduzieren direkt die Steuerschuld. Die tatsaechliche Ersparnis haengt vom persoenlichen Grenzsteuersatz ab.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-primary/30">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-primary">{gefiltert.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Freibetraege/Pauschalen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{gesamtPotenzial.toLocaleString('de-DE')} EUR</p>
            <p className="text-xs text-muted-foreground mt-1">Summe Freibetraege</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">{Math.round(gesamtPotenzial * grenzsteuersatz / 100).toLocaleString('de-DE')} EUR</p>
            <p className="text-xs text-muted-foreground mt-1">Max. Steuerersparnis ({grenzsteuersatz}%)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
            <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {kategorien.map(k => (
              <button key={k} onClick={() => setFilter(k)} className={`rounded-md px-3 py-1.5 text-xs ${filter === k ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {k === 'alle' ? 'Alle' : k}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabelle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Freibetraege & Pauschalen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Freibetrag</th>
                  <th className="py-2 pr-4">Paragraph</th>
                  <th className="py-2 pr-4 text-right">Betrag</th>
                  <th className="py-2 text-right">Ersparnis</th>
                </tr>
              </thead>
              <tbody>
                {gefiltert.map((f, i) => (
                  <tr key={i} className="border-b hover:bg-muted/50">
                    <td className="py-2 pr-4">
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.info}</p>
                    </td>
                    <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">{f.paragraph}</td>
                    <td className="py-2 pr-4 text-right font-medium whitespace-nowrap">
                      {f.betrag.toLocaleString('de-DE')} EUR
                      {f.splitting && <span className="text-xs text-muted-foreground ml-1">(×2)</span>}
                    </td>
                    <td className="py-2 text-right text-green-600 whitespace-nowrap">
                      {Math.round(f.betrag * grenzsteuersatz / 100).toLocaleString('de-DE')} EUR
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 10 Freibetraege</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={120} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Bar dataKey="betrag" name="Freibetrag" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
