import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { GraduationCap, Info, Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Kind {
  id: number
  name: string
  alter: number
  behinderung: boolean
}

const KINDERGELD_MONATLICH = 250 // seit 2025: 250 €/Kind einheitlich
const KINDERFREIBETRAG_2025 = 6612 // Kinderfreibetrag 2025
const BEA_FREIBETRAG = 2928 // Betreuung, Erziehung, Ausbildung

function calcESt(zvE: number): number {
  if (zvE <= 0) return 0
  if (zvE <= 11784) return 0
  if (zvE <= 17005) {
    const y = (zvE - 11784) / 10000
    return Math.floor((922.98 * y + 1400) * y)
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.floor((181.19 * z + 2397) * z + 1025.38)
  }
  if (zvE <= 277825) {
    return Math.floor(0.42 * zvE - 10602.13)
  }
  return Math.floor(0.45 * zvE - 18936.88)
}

export default function KinderFreibetragPage() {
  const [zvE, setZvE] = useState(75000)
  const [zusammenveranlagung, setZusammenveranlagung] = useState(true)
  const [kinder, setKinder] = useState<Kind[]>([
    { id: 1, name: 'Kind 1', alter: 5, behinderung: false },
    { id: 2, name: 'Kind 2', alter: 10, behinderung: false },
  ])

  const addKind = () => {
    setKinder(prev => [...prev, {
      id: Date.now(),
      name: `Kind ${prev.length + 1}`,
      alter: 0,
      behinderung: false,
    }])
  }

  const removeKind = (id: number) => {
    setKinder(prev => prev.filter(k => k.id !== id))
  }

  const ergebnis = useMemo(() => {
    const anzahl = kinder.length
    if (anzahl === 0) return null

    // Kindergeld: 250 € × Anzahl × 12
    const kindergeldJahr = anzahl * KINDERGELD_MONATLICH * 12

    // Kinderfreibetrag: pro Kind Kinderfreibetrag + BEA
    const freibetragProKind = KINDERFREIBETRAG_2025 + BEA_FREIBETRAG
    const gesamtFreibetrag = anzahl * freibetragProKind

    // Berechnung Steuer ohne Freibetrag
    let steuerOhne: number
    if (zusammenveranlagung) {
      steuerOhne = 2 * calcESt(Math.floor(zvE / 2))
    } else {
      steuerOhne = calcESt(zvE)
    }

    // Berechnung Steuer mit Freibetrag
    const zvEMitFB = Math.max(0, zvE - gesamtFreibetrag)
    let steuerMit: number
    if (zusammenveranlagung) {
      steuerMit = 2 * calcESt(Math.floor(zvEMitFB / 2))
    } else {
      steuerMit = calcESt(zvEMitFB)
    }

    // Steuerersparnis durch Freibetrag
    const ersparnisFreib = steuerOhne - steuerMit

    // Günstigerprüfung
    const freibetragBesser = ersparnisFreib > kindergeldJahr
    const vorteil = freibetragBesser ? ersparnisFreib - kindergeldJahr : kindergeldJahr - ersparnisFreib

    return {
      anzahl,
      kindergeldJahr,
      freibetragProKind,
      gesamtFreibetrag,
      steuerOhne,
      steuerMit,
      ersparnisFreib,
      freibetragBesser,
      vorteil,
    }
  }, [zvE, zusammenveranlagung, kinder])

  const chartData = ergebnis ? [
    { name: 'Kindergeld', betrag: ergebnis.kindergeldJahr, fill: '#3b82f6' },
    { name: 'Freibetrag-Ersparnis', betrag: ergebnis.ersparnisFreib, fill: '#10b981' },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Kinderfreibetrag vs. Kindergeld
        </h1>
        <p className="text-muted-foreground mt-1">
          Günstigerprüfung: Was bringt mehr – Kindergeld oder Kinderfreibetrag?
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Günstigerprüfung (§ 31 EStG):</strong> Das Finanzamt prüft automatisch, ob Kindergeld oder Kinderfreibetrag vorteilhafter ist.</p>
              <p><strong>Kindergeld 2025:</strong> 250 €/Monat pro Kind. <strong>Kinderfreibetrag:</strong> {KINDERFREIBETRAG_2025.toLocaleString('de-DE')} € + BEA {BEA_FREIBETRAG.toLocaleString('de-DE')} € = {(KINDERFREIBETRAG_2025 + BEA_FREIBETRAG).toLocaleString('de-DE')} € pro Kind.</p>
              <p>Bei höherem Einkommen (ca. ab 75.000 € zvE bei Zusammenveranlagung) ist der Freibetrag meist günstiger.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Eingabe */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Einkommensangaben</CardTitle>
            <CardDescription>Gemeinsames zu versteuerndes Einkommen eingeben</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Zu versteuerndes Einkommen: {zvE.toLocaleString('de-DE')} €</label>
              <input type="range" min={10000} max={300000} step={1000} value={zvE} onChange={e => setZvE(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>10.000 €</span><span>300.000 €</span></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="zusammen" checked={zusammenveranlagung} onChange={e => setZusammenveranlagung(e.target.checked)} className="rounded" />
              <label htmlFor="zusammen" className="text-sm">Zusammenveranlagung (Ehepaar)</label>
            </div>
          </CardContent>
        </Card>

        {/* Kinder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Kinder ({kinder.length})</CardTitle>
              <button onClick={addKind} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Kind hinzufügen
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {kinder.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Keine Kinder eingetragen.</p>
            )}
            {kinder.map(kind => (
              <div key={kind.id} className="flex items-center gap-3 rounded-lg border p-3">
                <input
                  type="text"
                  value={kind.name}
                  onChange={e => setKinder(prev => prev.map(k => k.id === kind.id ? { ...k, name: e.target.value } : k))}
                  className="flex-1 text-sm bg-transparent outline-none font-medium"
                />
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={kind.alter}
                  onChange={e => setKinder(prev => prev.map(k => k.id === kind.id ? { ...k, alter: +e.target.value } : k))}
                  className="w-16 rounded border px-2 py-1 text-sm text-center"
                />
                <span className="text-xs text-muted-foreground">Jahre</span>
                <button onClick={() => removeKind(kind.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {ergebnis && (
        <>
          {/* Ergebnis */}
          <Card className={`border-2 ${ergebnis.freibetragBesser ? 'border-green-500/50' : 'border-blue-500/50'}`}>
            <CardHeader>
              <CardTitle className="text-lg">
                Günstigerprüfung: {ergebnis.freibetragBesser ? '✓ Kinderfreibetrag vorteilhafter' : '✓ Kindergeld vorteilhafter'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{ergebnis.kindergeldJahr.toLocaleString('de-DE')} €</p>
                  <p className="text-xs text-muted-foreground mt-1">Kindergeld/Jahr</p>
                </div>
                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.ersparnisFreib.toLocaleString('de-DE')} €</p>
                  <p className="text-xs text-muted-foreground mt-1">Steuerersparnis Freibetrag</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${ergebnis.freibetragBesser ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                  <p className={`text-2xl font-bold ${ergebnis.freibetragBesser ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'}`}>+{ergebnis.vorteil.toLocaleString('de-DE')} €</p>
                  <p className="text-xs text-muted-foreground mt-1">Mehrwert {ergebnis.freibetragBesser ? 'Freibetrag' : 'Kindergeld'}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Anzahl Kinder</span><span>{ergebnis.anzahl}</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Freibetrag pro Kind</span><span>{ergebnis.freibetragProKind.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Gesamt-Freibetrag</span><span>{ergebnis.gesamtFreibetrag.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">ESt ohne Freibetrag</span><span>{ergebnis.steuerOhne.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">ESt mit Freibetrag</span><span>{ergebnis.steuerMit.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 font-medium"><span>Steuerersparnis Freibetrag</span><span className="text-green-600">{ergebnis.ersparnisFreib.toLocaleString('de-DE')} €</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visueller Vergleich</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                    <Legend />
                    <Bar dataKey="betrag" name="Betrag (€)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
