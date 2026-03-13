import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Accessibility, Info } from 'lucide-react'

interface GdBStufe {
  gdb: number
  pauschbetrag: number
}

const PAUSCHBETRAEGE: GdBStufe[] = [
  { gdb: 20, pauschbetrag: 384 },
  { gdb: 25, pauschbetrag: 620 },
  { gdb: 30, pauschbetrag: 620 },
  { gdb: 35, pauschbetrag: 860 },
  { gdb: 40, pauschbetrag: 860 },
  { gdb: 45, pauschbetrag: 1140 },
  { gdb: 50, pauschbetrag: 1140 },
  { gdb: 55, pauschbetrag: 1420 },
  { gdb: 60, pauschbetrag: 1420 },
  { gdb: 65, pauschbetrag: 1740 },
  { gdb: 70, pauschbetrag: 1740 },
  { gdb: 75, pauschbetrag: 2100 },
  { gdb: 80, pauschbetrag: 2100 },
  { gdb: 85, pauschbetrag: 2460 },
  { gdb: 90, pauschbetrag: 2460 },
  { gdb: 95, pauschbetrag: 2820 },
  { gdb: 100, pauschbetrag: 2820 },
]

const MERKZEICHEN = [
  { kuerzel: 'G', label: 'Gehbehindert', info: 'Erhebliche Beeinträchtigung der Bewegungsfähigkeit im Straßenverkehr' },
  { kuerzel: 'aG', label: 'Außergewöhnlich gehbehindert', info: 'Zusätzliche Fahrtkostenpauschale 4.500 €' },
  { kuerzel: 'H', label: 'Hilflos', info: 'Pauschbetrag 7.400 € (statt GdB-abhängig)' },
  { kuerzel: 'Bl', label: 'Blind', info: 'Pauschbetrag 7.400 € (statt GdB-abhängig)' },
  { kuerzel: 'TBl', label: 'Taubblind', info: 'Pauschbetrag 7.400 €' },
  { kuerzel: 'B', label: 'Begleitperson', info: 'Unentgeltliche Beförderung der Begleitperson im ÖPNV' },
  { kuerzel: 'RF', label: 'Rundfunk', info: 'Ermäßigung/Befreiung vom Rundfunkbeitrag' },
]

export default function BehindertenpauschbetragPage() {
  const [gdb, setGdb] = useState(50)
  const [merkzeichenH, setMerkzeichenH] = useState(false)
  const [merkzeichenBl, setMerkzeichenBl] = useState(false)
  const [merkzeichenAG, setMerkzeichenAG] = useState(false)
  const [merkzeichenG, setMerkzeichenG] = useState(false)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)
  const [pflegeperson, setPflegeperson] = useState(false)
  const [pflegegradBetreuter, setPflegegradBetreuter] = useState(3)

  const ergebnis = useMemo(() => {
    // Pauschbetrag nach GdB
    let pauschbetrag = 0
    if (merkzeichenH || merkzeichenBl) {
      pauschbetrag = 7400
    } else {
      const stufe = PAUSCHBETRAEGE.find(s => s.gdb === gdb) || PAUSCHBETRAEGE.find(s => s.gdb >= gdb)
      pauschbetrag = stufe?.pauschbetrag || 0
    }

    // Fahrtkostenpauschale
    let fahrtkostenpauschale = 0
    if (merkzeichenAG || merkzeichenBl || merkzeichenH) {
      fahrtkostenpauschale = 4500
    } else if (merkzeichenG && gdb >= 70) {
      fahrtkostenpauschale = 900
    }

    // Pflege-Pauschbetrag (seit 2021)
    let pflegePauschbetrag = 0
    if (pflegeperson) {
      if (pflegegradBetreuter === 2) pflegePauschbetrag = 600
      else if (pflegegradBetreuter === 3) pflegePauschbetrag = 1100
      else if (pflegegradBetreuter >= 4) pflegePauschbetrag = 1800
    }

    const gesamtAbzug = pauschbetrag + fahrtkostenpauschale + pflegePauschbetrag
    const ersparnis = Math.round(gesamtAbzug * grenzsteuersatz / 100)

    return {
      pauschbetrag,
      fahrtkostenpauschale,
      pflegePauschbetrag,
      gesamtAbzug,
      ersparnis,
    }
  }, [gdb, merkzeichenH, merkzeichenBl, merkzeichenAG, merkzeichenG, grenzsteuersatz, pflegeperson, pflegegradBetreuter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Accessibility className="h-6 w-6 text-primary" />
          Behinderten-Pauschbetrag
        </h1>
        <p className="text-muted-foreground mt-1">
          § 33b EStG – Pauschbeträge nach GdB, Merkzeichen und Pflege-Pauschbetrag
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Behinderten-Pauschbetrag (§ 33b EStG):</strong> Ab GdB 20 steht ein Pauschbetrag zu. Bei Merkzeichen H oder Bl: 7.400 €/Jahr.</p>
              <p><strong>Fahrtkostenpauschale:</strong> aG/Bl/H → 4.500 €/Jahr, G + GdB ≥ 70 → 900 €/Jahr.</p>
              <p><strong>Pflege-Pauschbetrag (seit 2021):</strong> Pflegegrad 2: 600 €, Pflegegrad 3: 1.100 €, Pflegegrad 4/5: 1.800 € – ohne Nachweis einzelner Kosten.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Grad der Behinderung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">GdB: {gdb}</label>
              <input type="range" min={20} max={100} step={5} value={gdb} onChange={e => setGdb(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>20</span><span>100</span></div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Merkzeichen</p>
              {[
                { key: 'G', checked: merkzeichenG, set: setMerkzeichenG },
                { key: 'aG', checked: merkzeichenAG, set: setMerkzeichenAG },
                { key: 'H', checked: merkzeichenH, set: setMerkzeichenH },
                { key: 'Bl', checked: merkzeichenBl, set: setMerkzeichenBl },
              ].map(m => {
                const info = MERKZEICHEN.find(x => x.kuerzel === m.key)
                return (
                  <label key={m.key} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" checked={m.checked} onChange={e => m.set(e.target.checked)} className="rounded mt-0.5" />
                    <div>
                      <span className="font-medium">{m.key}</span> – {info?.label}
                      <p className="text-xs text-muted-foreground">{info?.info}</p>
                    </div>
                  </label>
                )
              })}
            </div>

            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz} %</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pflege-Pauschbetrag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pflegeperson} onChange={e => setPflegeperson(e.target.checked)} className="rounded" />
              Ich pflege eine hilflose Person (häuslich, unentgeltlich)
            </label>
            {pflegeperson && (
              <div>
                <label className="text-sm font-medium">Pflegegrad der betreuten Person</label>
                <div className="flex gap-2 mt-1">
                  {[2, 3, 4, 5].map(pg => (
                    <button key={pg} onClick={() => setPflegegradBetreuter(pg)} className={`rounded-md px-4 py-2 text-sm ${pflegegradBetreuter === pg ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      PG {pg}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  PG 2: 600 € · PG 3: 1.100 € · PG 4/5: 1.800 €
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ergebnis */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Ergebnis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{ergebnis.gesamtAbzug.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-1">Gesamter Steuerabzug</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.ersparnis.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-1">Steuerersparnis</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{Math.round(ergebnis.ersparnis / 12).toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-1">pro Monat</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Behinderten-Pauschbetrag (GdB {gdb})</span><span className="font-medium">{ergebnis.pauschbetrag.toLocaleString('de-DE')} €</span></div>
            {ergebnis.fahrtkostenpauschale > 0 && (
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Fahrtkostenpauschale</span><span className="font-medium">{ergebnis.fahrtkostenpauschale.toLocaleString('de-DE')} €</span></div>
            )}
            {ergebnis.pflegePauschbetrag > 0 && (
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Pflege-Pauschbetrag (PG {pflegegradBetreuter})</span><span className="font-medium">{ergebnis.pflegePauschbetrag.toLocaleString('de-DE')} €</span></div>
            )}
            <div className="flex justify-between py-1 font-medium"><span>Gesamt</span><span className="text-primary">{ergebnis.gesamtAbzug.toLocaleString('de-DE')} €</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Tabelle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pauschbeträge nach GdB (seit 2021)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">GdB</th>
                  <th className="py-2">Pauschbetrag/Jahr</th>
                </tr>
              </thead>
              <tbody>
                {PAUSCHBETRAEGE.filter((_, i) => i % 2 === 0).map(s => {
                  const next = PAUSCHBETRAEGE.find(x => x.gdb === s.gdb + 5)
                  return (
                    <tr key={s.gdb} className={`border-b ${gdb >= s.gdb && gdb <= (next?.gdb || s.gdb) ? 'bg-primary/5 font-medium' : ''}`}>
                      <td className="py-1.5 pr-4">{s.gdb}{next ? ` – ${next.gdb}` : ''}</td>
                      <td className="py-1.5">{s.pauschbetrag.toLocaleString('de-DE')} €</td>
                    </tr>
                  )
                })}
                <tr className={`${merkzeichenH || merkzeichenBl ? 'bg-primary/5 font-medium' : ''}`}>
                  <td className="py-1.5 pr-4">H / Bl</td>
                  <td className="py-1.5">7.400 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
