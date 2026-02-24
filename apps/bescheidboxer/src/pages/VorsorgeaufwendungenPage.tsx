import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { ShieldPlus, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Höchstbeträge 2025
const MAX_BASIS_EINZEL = 27566
const MAX_BASIS_ZUSAMMEN = 55132
const MAX_SONSTIGE_AN = 1900
const MAX_SONSTIGE_SELBST = 2800

export default function VorsorgeaufwendungenPage() {
  const [zusammen, setZusammen] = useState(false)
  const [selbstaendig, setSelbstaendig] = useState(false)

  // Basisversorgung
  const [rvBeitrag, setRvBeitrag] = useState(9300) // Rentenversicherung AN-Anteil
  const [rvAG, setRvAG] = useState(9300) // AG-Anteil (steuerlich berücksichtigt)
  const [ruerup, setRuerup] = useState(0) // Rürup-Beiträge

  // Sonstige Vorsorge
  const [krankenBasis, setKrankenBasis] = useState(4200) // Basiskrankenversicherung
  const [pflegeBasis, setPflegeBasis] = useState(850) // Pflegeversicherung
  const [haftpflicht, setHaftpflicht] = useState(120)
  const [unfall, setUnfall] = useState(200)
  const [berufsunfaehig, setBerufsunfaehig] = useState(600)
  const [risiko, setRisiko] = useState(180)
  const [sonstigeVorsorge, setSonstigeVorsorge] = useState(0)

  const ergebnis = useMemo(() => {
    // --- Basisversorgung (§ 10 Abs. 1 Nr. 2 EStG) ---
    const maxBasis = zusammen ? MAX_BASIS_ZUSAMMEN : MAX_BASIS_EINZEL
    const basisGesamt = rvBeitrag + rvAG + ruerup
    // Seit 2023: 100% abzugsfähig (vorher nur anteilig)
    const basisAbzug = Math.min(basisGesamt, maxBasis)
    // Minus AG-Anteil (steuerfreier Zuschuss)
    const basisAbzugNetto = Math.max(0, basisAbzug - rvAG)

    // --- Sonstige Vorsorge (§ 10 Abs. 1 Nr. 3/3a EStG) ---
    // Basiskranken + Pflegepflicht: unbegrenzt abziehbar
    const basiskrankenGesamt = krankenBasis + pflegeBasis

    // Sonstige (Haftpflicht, Unfall, BU, Risiko etc.): max 1.900€ (AN) / 2.800€ (Selbst.)
    const maxSonstige = selbstaendig ? MAX_SONSTIGE_SELBST : MAX_SONSTIGE_AN
    const sonstigeGesamt = haftpflicht + unfall + berufsunfaehig + risiko + sonstigeVorsorge

    // Prüfung: Wenn Basiskranken > max → keine sonstigen absetzbar
    let sonstigeAbzug = 0
    if (basiskrankenGesamt < maxSonstige) {
      sonstigeAbzug = Math.min(sonstigeGesamt, maxSonstige - basiskrankenGesamt)
    }

    const sonstigeAbzugGesamt = basiskrankenGesamt + sonstigeAbzug

    const gesamtAbzug = basisAbzugNetto + sonstigeAbzugGesamt

    return {
      maxBasis,
      basisGesamt,
      basisAbzug,
      basisAbzugNetto,
      basiskrankenGesamt,
      maxSonstige,
      sonstigeGesamt,
      sonstigeAbzug,
      sonstigeAbzugGesamt,
      gesamtAbzug,
      basisAuslastung: maxBasis > 0 ? Math.min(100, Math.round(basisGesamt / maxBasis * 100)) : 0,
      sonstigeAuslastung: maxSonstige > 0 ? Math.min(100, Math.round((basiskrankenGesamt + sonstigeGesamt) / maxSonstige * 100)) : 0,
    }
  }, [zusammen, selbstaendig, rvBeitrag, rvAG, ruerup, krankenBasis, pflegeBasis, haftpflicht, unfall, berufsunfaehig, risiko, sonstigeVorsorge])

  const chartData = [
    { name: 'Basisversorgung', eingezahlt: ergebnis.basisGesamt, abzug: ergebnis.basisAbzugNetto, max: ergebnis.maxBasis },
    { name: 'Basiskranken/Pflege', eingezahlt: ergebnis.basiskrankenGesamt, abzug: ergebnis.basiskrankenGesamt, max: ergebnis.basiskrankenGesamt },
    { name: 'Sonstige Vorsorge', eingezahlt: ergebnis.sonstigeGesamt, abzug: ergebnis.sonstigeAbzug, max: ergebnis.maxSonstige },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldPlus className="h-6 w-6 text-primary" />
          Vorsorgeaufwendungen
        </h1>
        <p className="text-muted-foreground mt-1">
          Rente, Kranken-, Pflegeversicherung & weitere Vorsorge steuerlich absetzen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Basisversorgung (Altersvorsorge):</strong> RV-Beiträge + Rürup. Seit 2023 zu 100% abzugsfähig. Höchstbetrag: {MAX_BASIS_EINZEL.toLocaleString('de-DE')} € / {MAX_BASIS_ZUSAMMEN.toLocaleString('de-DE')} € (zusammen).</p>
              <p><strong>Basiskranken-/Pflegeversicherung:</strong> Unbegrenzt abzugsfähig (Basisabsicherung).</p>
              <p><strong>Sonstige Vorsorge:</strong> Haftpflicht, Unfall, BU, Risiko-LV etc. Max. {MAX_SONSTIGE_AN.toLocaleString('de-DE')} € (AN) / {MAX_SONSTIGE_SELBST.toLocaleString('de-DE')} € (Selbst.). Aber: Basiskranken/Pflege wird zuerst angerechnet!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Eingaben */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grunddaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={zusammen} onChange={e => setZusammen(e.target.checked)} className="rounded" />
                Zusammenveranlagung
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selbstaendig} onChange={e => setSelbstaendig(e.target.checked)} className="rounded" />
                Selbständig / Freiberufler
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basisversorgung (Altersvorsorge)</CardTitle>
              <CardDescription>Rentenversicherung & Rürup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">RV AN-Anteil/Jahr (€)</label>
                  <input type="number" value={rvBeitrag} onChange={e => setRvBeitrag(+e.target.value)} className="w-full mt-0.5 rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">RV AG-Anteil/Jahr (€)</label>
                  <input type="number" value={rvAG} onChange={e => setRvAG(+e.target.value)} className="w-full mt-0.5 rounded border px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Rürup-Beiträge/Jahr (€)</label>
                <input type="number" value={ruerup} onChange={e => setRuerup(+e.target.value)} className="w-full mt-0.5 rounded border px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Auslastung Höchstbetrag</span>
                  <span>{ergebnis.basisAuslastung}% von {ergebnis.maxBasis.toLocaleString('de-DE')} €</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${ergebnis.basisAuslastung >= 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${ergebnis.basisAuslastung}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sonstige Vorsorgeaufwendungen</CardTitle>
              <CardDescription>Kranken-, Pflege- & weitere Versicherungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Basiskrankenvers./Jahr (€)</label>
                  <input type="number" value={krankenBasis} onChange={e => setKrankenBasis(+e.target.value)} className="w-full mt-0.5 rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Pflegeversicherung/Jahr (€)</label>
                  <input type="number" value={pflegeBasis} onChange={e => setPflegeBasis(+e.target.value)} className="w-full mt-0.5 rounded border px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Haftpflicht (€)</label>
                  <input type="number" value={haftpflicht} onChange={e => setHaftpflicht(+e.target.value)} className="w-full mt-0.5 rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Unfallversicherung (€)</label>
                  <input type="number" value={unfall} onChange={e => setUnfall(+e.target.value)} className="w-full mt-0.5 rounded border px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Berufsunfähigkeit (€)</label>
                  <input type="number" value={berufsunfaehig} onChange={e => setBerufsunfaehig(+e.target.value)} className="w-full mt-0.5 rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Risiko-LV (€)</label>
                  <input type="number" value={risiko} onChange={e => setRisiko(+e.target.value)} className="w-full mt-0.5 rounded border px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Sonstige Vorsorge (€)</label>
                <input type="number" value={sonstigeVorsorge} onChange={e => setSonstigeVorsorge(+e.target.value)} className="w-full mt-0.5 rounded border px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Sonstige vs. Höchstbetrag</span>
                  <span>{ergebnis.sonstigeAuslastung}% von {ergebnis.maxSonstige.toLocaleString('de-DE')} €</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${ergebnis.sonstigeAuslastung >= 100 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${Math.min(100, ergebnis.sonstigeAuslastung)}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ergebnis */}
        <div className="space-y-4">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Steuerlich abzugsfähig</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-primary/10 p-4 text-center mb-4">
                <p className="text-3xl font-bold text-primary">{ergebnis.gesamtAbzug.toLocaleString('de-DE')} €</p>
                <p className="text-xs text-muted-foreground mt-1">Gesamter Sonderausgabenabzug</p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium text-muted-foreground">Basisversorgung</p>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">RV + Rürup (eingezahlt)</span><span>{ergebnis.basisGesamt.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Abzugsfähig (100%, max. {ergebnis.maxBasis.toLocaleString('de-DE')} €)</span><span>{ergebnis.basisAbzug.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Abzüglich AG-Anteil (steuerfrei)</span><span>−{rvAG.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b font-medium"><span>Netto-Abzug Basis</span><span className="text-primary">{ergebnis.basisAbzugNetto.toLocaleString('de-DE')} €</span></div>

                <p className="font-medium text-muted-foreground mt-3">Sonstige Vorsorge</p>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Basiskranken + Pflege (unbegrenzt)</span><span>{ergebnis.basiskrankenGesamt.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Weitere Vorsorge (eingezahlt)</span><span>{ergebnis.sonstigeGesamt.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Davon abzugsfähig (Rest bis {ergebnis.maxSonstige.toLocaleString('de-DE')} €)</span><span>{ergebnis.sonstigeAbzug.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 font-medium"><span>Sonstige gesamt</span><span className="text-primary">{ergebnis.sonstigeAbzugGesamt.toLocaleString('de-DE')} €</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Übersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                    <Legend />
                    <Bar dataKey="eingezahlt" name="Eingezahlt" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="abzug" name="Abzugsfähig" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
