import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Coins, Info, CheckCircle2 } from 'lucide-react'

export default function MinijobRechnerPage() {
  const [monatslohn, setMonatslohn] = useState(538)
  const [stunden, setStunden] = useState(40)
  const [rentenversicherung, setRentenversicherung] = useState(true)

  const ergebnis = useMemo(() => {
    const jahreslohn = monatslohn * 12
    const isMinijob = monatslohn <= 538
    const isMidijob = monatslohn > 538 && monatslohn <= 2000

    // Arbeitgeber-Abgaben (Minijob)
    const agPauschsteuer = isMinijob ? monatslohn * 0.02 : 0
    const agKrankenversicherung = isMinijob ? monatslohn * 0.13 : 0
    const agRentenversicherung = isMinijob ? monatslohn * 0.15 : 0
    const agUmlageU1 = monatslohn * 0.011
    const agUmlageU2 = monatslohn * 0.0024
    const agInsolvenzgeld = monatslohn * 0.0006
    const agGesamt = agPauschsteuer + agKrankenversicherung + agRentenversicherung + agUmlageU1 + agUmlageU2 + agInsolvenzgeld

    // Arbeitnehmer-Beitrag RV (Minijob: 3,6% Eigenanteil)
    const anRentenversicherung = isMinijob && rentenversicherung ? monatslohn * 0.036 : 0
    const nettoMinijob = monatslohn - anRentenversicherung

    // Midijob-Berechnung (vereinfacht)
    let nettoMidijob = monatslohn
    let anSozialversicherung = 0
    if (isMidijob) {
      // Gleitzone: reduzierte AN-Beiträge
      const faktor = (2000 - monatslohn) / (2000 - 538)
      const reduzierung = faktor * 0.5 // bis 50% Reduzierung
      const normalerANAnteil = monatslohn * 0.20 // ca. 20% SV-Anteil
      anSozialversicherung = Math.round(normalerANAnteil * (1 - reduzierung) * 100) / 100
      nettoMidijob = monatslohn - anSozialversicherung
    }

    const stundenlohn = stunden > 0 ? (monatslohn / stunden).toFixed(2) : '0.00'
    const mindestlohn = 12.82 // 2026

    return {
      isMinijob, isMidijob, jahreslohn,
      agPauschsteuer: Math.round(agPauschsteuer * 100) / 100,
      agKrankenversicherung: Math.round(agKrankenversicherung * 100) / 100,
      agRentenversicherung: Math.round(agRentenversicherung * 100) / 100,
      agUmlageU1: Math.round(agUmlageU1 * 100) / 100,
      agUmlageU2: Math.round(agUmlageU2 * 100) / 100,
      agInsolvenzgeld: Math.round(agInsolvenzgeld * 100) / 100,
      agGesamt: Math.round(agGesamt * 100) / 100,
      anRentenversicherung: Math.round(anRentenversicherung * 100) / 100,
      nettoMinijob: Math.round(nettoMinijob * 100) / 100,
      nettoMidijob: Math.round(nettoMidijob * 100) / 100,
      anSozialversicherung: Math.round(anSozialversicherung * 100) / 100,
      stundenlohn, mindestlohn,
      stundenlohnOk: parseFloat(stundenlohn) >= mindestlohn,
    }
  }, [monatslohn, stunden, rentenversicherung])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Coins className="h-6 w-6 text-yellow-500" />
          Minijob- & Midijob-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Abgaben für Minijob (538 €) und Midijob (Übergangsbereich 538,01–2.000 €) berechnen
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Eingaben */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eingaben</CardTitle>
              <CardDescription>Verdienst und Arbeitszeit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Monatlicher Verdienst (€)</label>
                <input type="number" value={monatslohn} onChange={e => setMonatslohn(Number(e.target.value))} min={0} max={5000} step={10} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                <input type="range" min={0} max={2500} step={10} value={monatslohn} onChange={e => setMonatslohn(Number(e.target.value))} className="w-full mt-2 accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0 €</span>
                  <span className="font-medium text-primary">538 € Minijob</span>
                  <span className="font-medium text-blue-600">2.000 € Midijob</span>
                  <span>2.500 €</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Arbeitsstunden pro Monat</label>
                <input type="number" value={stunden} onChange={e => setStunden(Number(e.target.value))} min={1} max={200} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">
                    Stundenlohn: <strong>{ergebnis.stundenlohn} €</strong>
                  </span>
                  {ergebnis.stundenlohnOk ? (
                    <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />≥ Mindestlohn</span>
                  ) : (
                    <span className="text-xs text-red-600 flex items-center gap-1">Unter Mindestlohn ({ergebnis.mindestlohn} €)!</span>
                  )}
                </div>
              </div>

              {ergebnis.isMinijob && (
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="rv" checked={rentenversicherung} onChange={e => setRentenversicherung(e.target.checked)} className="rounded border-border" />
                  <label htmlFor="rv" className="text-sm">
                    Rentenversicherungspflicht (3,6% Eigenanteil)
                    <span className="block text-xs text-muted-foreground">Kann auf Antrag befreit werden</span>
                  </label>
                </div>
              )}

              <div className={`rounded-lg p-3 ${
                ergebnis.isMinijob ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900' :
                ergebnis.isMidijob ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900' :
                'bg-muted/50 border border-border'
              }`}>
                <p className={`text-sm font-medium ${
                  ergebnis.isMinijob ? 'text-green-700 dark:text-green-300' :
                  ergebnis.isMidijob ? 'text-blue-700 dark:text-blue-300' : ''
                }`}>
                  {ergebnis.isMinijob ? '✓ Minijob (geringfügige Beschäftigung)' :
                   ergebnis.isMidijob ? '↔ Midijob (Übergangsbereich)' :
                   'Reguläres Beschäftigungsverhältnis'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ergebnis */}
        <div className="space-y-4">
          {ergebnis.isMinijob && (
            <Card>
              <CardHeader>
                <CardTitle>Minijob-Abrechnung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Arbeitnehmer</h3>
                  <div className="flex justify-between text-sm">
                    <span>Bruttolohn</span>
                    <span className="font-medium">{monatslohn.toFixed(2)} €</span>
                  </div>
                  {rentenversicherung && (
                    <div className="flex justify-between text-sm">
                      <span>- RV-Eigenanteil (3,6%)</span>
                      <span className="font-medium text-red-600">-{ergebnis.anRentenversicherung.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t pt-1 font-bold">
                    <span>Netto</span>
                    <span className="text-green-600">{ergebnis.nettoMinijob.toFixed(2)} €</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Arbeitgeber-Abgaben</h3>
                  <div className="flex justify-between text-sm"><span>Pauschsteuer (2%)</span><span>{ergebnis.agPauschsteuer.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-sm"><span>Krankenversicherung (13%)</span><span>{ergebnis.agKrankenversicherung.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-sm"><span>Rentenversicherung (15%)</span><span>{ergebnis.agRentenversicherung.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-sm"><span>Umlagen U1 + U2</span><span>{(ergebnis.agUmlageU1 + ergebnis.agUmlageU2).toFixed(2)} €</span></div>
                  <div className="flex justify-between text-sm"><span>Insolvenzgeldumlage</span><span>{ergebnis.agInsolvenzgeld.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-sm border-t pt-1 font-bold">
                    <span>AG-Kosten gesamt</span>
                    <span className="text-amber-600">{(monatslohn + ergebnis.agGesamt).toFixed(2)} €</span>
                  </div>
                </div>

                <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
                  <p className="text-sm text-green-600 dark:text-green-400">Netto pro Monat</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">{ergebnis.nettoMinijob.toFixed(2)} €</p>
                  <p className="text-xs text-green-500 mt-1">{(ergebnis.nettoMinijob * 12).toFixed(2)} €/Jahr</p>
                </div>
              </CardContent>
            </Card>
          )}

          {ergebnis.isMidijob && (
            <Card>
              <CardHeader>
                <CardTitle>Midijob-Abrechnung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Bruttolohn</span>
                  <span className="font-medium">{monatslohn.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>- SV-Beitrag (reduziert, Gleitzone)</span>
                  <span className="font-medium text-red-600">-{ergebnis.anSozialversicherung.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2 font-bold">
                  <span>Geschätztes Netto</span>
                  <span className="text-green-600">{ergebnis.nettoMidijob.toFixed(2)} €</span>
                </div>
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Netto pro Monat (ca.)</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{ergebnis.nettoMidijob.toFixed(2)} €</p>
                  <p className="text-xs text-blue-500 mt-1">Reduzierte SV-Beiträge im Übergangsbereich</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>Minijob (≤ 538 €):</strong> Keine Lohnsteuer, keine SV für AN (außer RV auf Wunsch). AG zahlt Pauschalabgaben ~30%.</p>
                <p><strong>Midijob (538,01–2.000 €):</strong> Gleitzone mit reduzierten SV-Beiträgen. Voller Versicherungsschutz bei weniger Abzügen.</p>
                <p><strong>Mindestlohn 2026:</strong> {ergebnis.mindestlohn} €/Stunde</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
