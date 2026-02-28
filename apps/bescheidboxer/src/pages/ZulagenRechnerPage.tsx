import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Coins, Info, CheckCircle2, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ZulageInfo {
  key: string
  name: string
  beschreibung: string
  jahresBetrag: number
  einkommensgrenze: number | null
  voraussetzung: string
}

const ZULAGEN: ZulageInfo[] = [
  { key: 'kindergeld', name: 'Kindergeld', beschreibung: '§ 66 EStG', jahresBetrag: 255 * 12, einkommensgrenze: null, voraussetzung: 'Kind unter 18 (oder bis 25 in Ausbildung)' },
  { key: 'riester_grund', name: 'Riester-Grundzulage', beschreibung: '§ 83 EStG', jahresBetrag: 175, einkommensgrenze: null, voraussetzung: 'Mindesteigenbeitrag 4% Brutto (max 2.100 EUR)' },
  { key: 'riester_kind', name: 'Riester-Kinderzulage', beschreibung: '§ 85 EStG', jahresBetrag: 300, einkommensgrenze: null, voraussetzung: 'Pro Kind (ab 2008 geboren: 300 EUR)' },
  { key: 'riester_beruf', name: 'Riester-Berufseinsteigerbonus', beschreibung: '§ 84 EStG', jahresBetrag: 200, einkommensgrenze: null, voraussetzung: 'Einmalig bei Abschluss unter 25 Jahren' },
  { key: 'ansparzulage_bau', name: 'AN-Sparzulage (Bauspar)', beschreibung: '§ 13 5. VermBG', jahresBetrag: 43, einkommensgrenze: 17900, voraussetzung: 'VL in Bausparvertrag, max 470 EUR/J' },
  { key: 'ansparzulage_fonds', name: 'AN-Sparzulage (Fonds)', beschreibung: '§ 13 5. VermBG', jahresBetrag: 80, einkommensgrenze: 20000, voraussetzung: 'VL in Aktienfonds, max 400 EUR/J' },
  { key: 'wop', name: 'Wohnungsbauprämie', beschreibung: '§ 3 WoPG', jahresBetrag: 70, einkommensgrenze: 35000, voraussetzung: 'Bauspar-Einzahlung max 700 EUR/J' },
  { key: 'bildungspraemie', name: 'Bildungsprämie', beschreibung: 'BMBF', jahresBetrag: 500, einkommensgrenze: 20000, voraussetzung: 'Weiterbildung, einmalig bis 500 EUR' },
]

export default function ZulagenRechnerPage() {
  const [zvE, setZvE] = useState(35000)
  const [kinder, setKinder] = useState(1)
  const [familienstand, setFamilienstand] = useState<'ledig' | 'verheiratet'>('ledig')
  const [alter, setAlter] = useState(35)
  const [riesterBeitrag, setRiesterBeitrag] = useState(1200)
  const [vlBauspar, setVlBauspar] = useState(true)
  const [vlFonds, setVlFonds] = useState(false)
  const [bausparEinzahlung, setBausparEinzahlung] = useState(true)

  const ergebnis = useMemo(() => {
    const einkommensGrenzeFaktor = familienstand === 'verheiratet' ? 2 : 1

    const zulagenErgebnis = ZULAGEN.map(z => {
      let berechtigt = true
      let betrag = z.jahresBetrag
      let grund = ''

      switch (z.key) {
        case 'kindergeld':
          betrag = kinder * 255 * 12
          berechtigt = kinder > 0
          if (!berechtigt) grund = 'Keine Kinder'
          break
        case 'riester_grund':
          berechtigt = riesterBeitrag > 0
          if (!berechtigt) grund = 'Kein Riester-Vertrag'
          break
        case 'riester_kind':
          betrag = kinder * 300
          berechtigt = kinder > 0 && riesterBeitrag > 0
          if (kinder === 0) grund = 'Keine Kinder'
          else if (riesterBeitrag === 0) grund = 'Kein Riester-Vertrag'
          break
        case 'riester_beruf':
          berechtigt = alter < 25 && riesterBeitrag > 0
          if (alter >= 25) grund = 'Nur unter 25 Jahren'
          break
        case 'ansparzulage_bau':
          berechtigt = vlBauspar && zvE <= z.einkommensgrenze! * einkommensGrenzeFaktor
          if (!vlBauspar) grund = 'Kein VL-Bauspar'
          else if (zvE > z.einkommensgrenze! * einkommensGrenzeFaktor) grund = 'zvE zu hoch'
          break
        case 'ansparzulage_fonds':
          berechtigt = vlFonds && zvE <= z.einkommensgrenze! * einkommensGrenzeFaktor
          if (!vlFonds) grund = 'Kein VL-Fonds'
          else if (zvE > z.einkommensgrenze! * einkommensGrenzeFaktor) grund = 'zvE zu hoch'
          break
        case 'wop':
          berechtigt = bausparEinzahlung && zvE <= z.einkommensgrenze! * einkommensGrenzeFaktor
          if (!bausparEinzahlung) grund = 'Keine Bauspar-Einzahlung'
          else if (zvE > z.einkommensgrenze! * einkommensGrenzeFaktor) grund = 'zvE zu hoch'
          break
        case 'bildungspraemie':
          berechtigt = zvE <= z.einkommensgrenze! * einkommensGrenzeFaktor
          if (!berechtigt) grund = 'zvE zu hoch'
          break
      }

      return { ...z, berechtigt, betrag: berechtigt ? betrag : 0, grund }
    })

    const gesamtJahr = zulagenErgebnis.reduce((s, z) => s + z.betrag, 0)
    const anzahlBerechtigt = zulagenErgebnis.filter(z => z.berechtigt).length

    // Chart
    const chartData = zulagenErgebnis.filter(z => z.berechtigt && z.betrag > 0).map(z => ({
      name: z.name.replace('AN-Sparzulage ', 'ANS ').replace('Riester-', 'R-'),
      betrag: z.betrag,
    }))

    return { zulagenErgebnis, gesamtJahr, anzahlBerechtigt, chartData }
  }, [zvE, kinder, familienstand, alter, riesterBeitrag, vlBauspar, vlFonds, bausparEinzahlung])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          Zulagen-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Staatliche Zulagen & Praemien im Ueberblick
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Kindergeld:</strong> 255 EUR/Monat pro Kind (2025). Antrag bei der Familienkasse.</p>
              <p><strong>Riester:</strong> 175 EUR Grundzulage + 300 EUR/Kind. Mindesteigenbeitrag: 4% des Bruttos.</p>
              <p><strong>VL-Zulagen:</strong> Bauspar (9%, max 43 EUR) + Fonds (20%, max 80 EUR). Einkommensgrenzen beachten!</p>
              <p><strong>Tipp:</strong> Zulagen werden nicht automatisch gewaehrt – Antrag erforderlich!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ihre Situation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(['ledig', 'verheiratet'] as const).map(f => (
                <button key={f} onClick={() => setFamilienstand(f)} className={`rounded-md px-4 py-2 text-sm ${familienstand === f ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {f === 'ledig' ? 'Ledig' : 'Verheiratet'}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium">zvE: {zvE.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={10000} max={80000} step={1000} value={zvE} onChange={e => setZvE(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Alter: {alter}</label>
              <input type="range" min={18} max={65} value={alter} onChange={e => setAlter(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Kinder: {kinder}</label>
              <input type="range" min={0} max={5} value={kinder} onChange={e => setKinder(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Riester-Beitrag/Jahr: {riesterBeitrag.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={2100} step={100} value={riesterBeitrag} onChange={e => setRiesterBeitrag(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={vlBauspar} onChange={e => setVlBauspar(e.target.checked)} className="accent-primary" />
                VL in Bausparvertrag
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={vlFonds} onChange={e => setVlFonds(e.target.checked)} className="accent-primary" />
                VL in Aktienfonds
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={bausparEinzahlung} onChange={e => setBausparEinzahlung(e.target.checked)} className="accent-primary" />
                Eigene Bauspar-Einzahlungen
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ihre Zulagen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center mb-4">
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtJahr.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">{ergebnis.anzahlBerechtigt} Zulagen berechtigt</p>
            </div>

            <div className="space-y-2 text-sm">
              {ergebnis.zulagenErgebnis.map(z => (
                <div key={z.key} className={`flex items-center justify-between py-2 px-3 rounded-lg ${z.berechtigt ? 'bg-green-50 dark:bg-green-900/10' : 'bg-muted/50'}`}>
                  <div className="flex items-center gap-2">
                    {z.berechtigt ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <span className={`font-medium ${z.berechtigt ? '' : 'text-muted-foreground'}`}>{z.name}</span>
                      {!z.berechtigt && <p className="text-xs text-muted-foreground">{z.grund}</p>}
                    </div>
                  </div>
                  <span className={`font-bold ${z.berechtigt ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {z.betrag.toLocaleString('de-DE')} EUR
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {ergebnis.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zulagen im Vergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ergebnis.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v} EUR`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR/Jahr`} />
                  <Legend />
                  <Bar dataKey="betrag" name="Zulage/Jahr" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
