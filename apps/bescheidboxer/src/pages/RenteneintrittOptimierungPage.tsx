import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Clock, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function RenteneintrittOptimierungPage() {
  const [monatsrente, setMonatsrente] = useState(1800)
  const [regelAlter, setRegelAlter] = useState(67)
  const [gewuenschtesAlter, setGewuenschtesAlter] = useState(63)
  const [besteuerungsAnteil, setBesteuerungsAnteil] = useState(83)
  const [hinzuverdienst, setHinzuverdienst] = useState(0)

  const ergebnis = useMemo(() => {
    const differenzMonate = (regelAlter - gewuenschtesAlter) * 12
    const abschlag = differenzMonate > 0 ? differenzMonate * 0.003 : 0 // 0,3% pro Monat
    const zuschlag = differenzMonate < 0 ? Math.abs(differenzMonate) * 0.005 : 0 // 0,5% pro Monat

    const anpassungsFaktor = 1 - abschlag + zuschlag
    const angepassteRente = Math.round(monatsrente * anpassungsFaktor * 100) / 100
    const differenzMonatlich = Math.round((angepassteRente - monatsrente) * 100) / 100

    // Jährliche Berechnung
    const jahresrente = Math.round(angepassteRente * 12)
    const steuerpflichtigAnteil = Math.round(jahresrente * besteuerungsAnteil / 100)
    const rentenFreibetrag = jahresrente - steuerpflichtigAnteil

    // Hinzuverdienst (seit 2023 keine Grenze mehr bei regulärer Altersrente)
    const gesamtEinkuenfte = steuerpflichtigAnteil + hinzuverdienst

    // Vereinfachte ESt-Berechnung
    const estBerechnung = (eink: number): number => {
      if (eink <= 12084) return 0
      if (eink <= 17005) { const y = (eink - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
      if (eink <= 66760) { const z = (eink - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
      if (eink <= 277825) return Math.round(0.42 * eink - 10394.14)
      return Math.round(0.45 * eink - 18730.89)
    }

    const est = estBerechnung(gesamtEinkuenfte)

    // Vergleich über 20 Jahre
    const jahreBisRegelalter = regelAlter - gewuenschtesAlter
    const chartData = Array.from({ length: 5 }, (_, i) => {
      const alter = gewuenschtesAlter + i * 5
      const jahreFrueh = Math.max(alter - gewuenschtesAlter, 0)
      const jahreRegel = Math.max(alter - regelAlter, 0)

      const kumuliertFrueh = jahreFrueh * angepassteRente * 12
      const kumuliertRegel = jahreRegel * monatsrente * 12

      return {
        alter: `${alter} J.`,
        frueh: Math.round(kumuliertFrueh),
        regel: Math.round(kumuliertRegel),
      }
    })

    // Break-even Alter (wann Regelrente die Frühverrentung einholt)
    let breakEven: number | null = null
    if (differenzMonate > 0) {
      const fruehJahresBetrag = angepassteRente * 12
      const regelJahresBetrag = monatsrente * 12
      // kumuliert: Früh startete jahreBisRegelalter Jahre früher
      // fruehJahresBetrag * t = regelJahresBetrag * (t - jahreBisRegelalter)
      // t = jahreBisRegelalter * regelJahresBetrag / (regelJahresBetrag - fruehJahresBetrag)
      if (regelJahresBetrag > fruehJahresBetrag) {
        breakEven = Math.round((jahreBisRegelalter * regelJahresBetrag / (regelJahresBetrag - fruehJahresBetrag) + gewuenschtesAlter) * 10) / 10
      }
    }

    return {
      abschlag: Math.round(abschlag * 1000) / 10,
      zuschlag: Math.round(zuschlag * 1000) / 10,
      angepassteRente, differenzMonatlich,
      jahresrente, steuerpflichtigAnteil, rentenFreibetrag,
      gesamtEinkuenfte, est, breakEven, chartData,
    }
  }, [monatsrente, regelAlter, gewuenschtesAlter, besteuerungsAnteil, hinzuverdienst])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Renteneintritt-Optimierung
        </h1>
        <p className="text-muted-foreground mt-1">
          Frühverrentung vs. Aufschub – Abschläge, Zuschläge & Break-even
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Frühverrentung:</strong> 0,3% Abschlag pro Monat, max. 14,4% (48 Monate vor Regelalter).</p>
              <p><strong>Aufschub:</strong> 0,5% Zuschlag pro Monat über das Regelalter hinaus.</p>
              <p><strong>Hinzuverdienst:</strong> Seit 2023 keine Hinzuverdienstgrenze bei regulärer Altersrente.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reguläre Monatsrente: {monatsrente.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={500} max={4000} step={50} value={monatsrente} onChange={e => setMonatsrente(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Regelaltersgrenze: {regelAlter} Jahre</label>
              <input type="range" min={65} max={67} step={1} value={regelAlter} onChange={e => setRegelAlter(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Gewünschter Eintritt: {gewuenschtesAlter} Jahre</label>
              <input type="range" min={60} max={70} step={1} value={gewuenschtesAlter} onChange={e => setGewuenschtesAlter(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Besteuerungsanteil: {besteuerungsAnteil}%</label>
              <input type="range" min={50} max={100} step={1} value={besteuerungsAnteil} onChange={e => setBesteuerungsAnteil(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Hinzuverdienst p.a.: {hinzuverdienst.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={1000} value={hinzuverdienst} onChange={e => setHinzuverdienst(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.angepassteRente.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Angepasste Monatsrente</p>
              </div>
              <div className={`rounded-lg p-4 text-center ${ergebnis.differenzMonatlich >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <p className={`text-2xl font-bold ${ergebnis.differenzMonatlich >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{ergebnis.differenzMonatlich >= 0 ? '+' : ''}{ergebnis.differenzMonatlich.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Differenz monatlich</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {ergebnis.abschlag > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Abschlag (Frühverrentung)</span>
                  <span className="font-medium text-red-600">-{ergebnis.abschlag}%</span>
                </div>
              )}
              {ergebnis.zuschlag > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Zuschlag (Aufschub)</span>
                  <span className="font-medium text-green-600">+{ergebnis.zuschlag}%</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Jahresrente</span>
                <span className="font-medium">{ergebnis.jahresrente.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerpflichtiger Anteil ({besteuerungsAnteil}%)</span>
                <span className="font-medium">{ergebnis.steuerpflichtigAnteil.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Rentenfreibetrag</span>
                <span className="font-medium text-green-600">{ergebnis.rentenFreibetrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Geschätzte ESt</span>
                <span className="font-medium">{ergebnis.est.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.breakEven && (
                <div className="flex justify-between py-1.5 font-semibold">
                  <span>Break-even Alter</span>
                  <span className="text-primary">{ergebnis.breakEven} Jahre</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Kumulierter Rentenvergleich</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="alter" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="frueh" name={`Eintritt mit ${gewuenschtesAlter}`} fill="#7c3aed" />
                <Bar dataKey="regel" name={`Eintritt mit ${regelAlter}`} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
