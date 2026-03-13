import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { HeartHandshake, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function UnterhaltRechnerPage() {
  const [unterhaltTyp, setUnterhaltTyp] = useState<'expartner' | 'angehoerige'>('expartner')
  const [jahresunterhalt, setJahresunterhalt] = useState(8000)
  const [kvPvBeitraege, setKvPvBeitraege] = useState(2400)
  const [eigeneEinkuenfteEmpfaenger, setEigeneEinkuenfteEmpfaenger] = useState(0)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)
  const [realsplitting, setRealsplitting] = useState(true)
  const [kirchensteuer, setKirchensteuer] = useState(false)

  const ergebnis = useMemo(() => {
    if (unterhaltTyp === 'expartner') {
      // Realsplitting § 10 Abs. 1a Nr. 1 EStG
      const maxRealsplitting = 14748 // 2025
      const abzugsfaehig = realsplitting
        ? Math.min(jahresunterhalt + kvPvBeitraege, maxRealsplitting + kvPvBeitraege)
        : 0

      const steuerersparnis = Math.round(abzugsfaehig * grenzsteuersatz / 100)
      const kistErsparnis = kirchensteuer ? Math.round(steuerersparnis * 0.09) : 0
      const gesamtErsparnis = steuerersparnis + kistErsparnis

      // Nachteil: Empfaenger muss versteuern → Nachteilsausgleich
      const empfaengerSteuer = Math.round(abzugsfaehig * 0.20) // Geschaetzter Steuersatz Empfaenger
      const nachteilsausgleich = empfaengerSteuer
      const nettoVorteil = gesamtErsparnis - nachteilsausgleich

      const chartData = [
        { name: 'Unterhalt', betrag: jahresunterhalt },
        { name: 'KV/PV', betrag: kvPvBeitraege },
        { name: 'Steuerersparnis', betrag: gesamtErsparnis },
        { name: 'Nachteilsausgleich', betrag: -nachteilsausgleich },
      ]

      return {
        typ: 'expartner' as const,
        abzugsfaehig,
        maxRealsplitting,
        steuerersparnis,
        kistErsparnis,
        gesamtErsparnis,
        nachteilsausgleich,
        nettoVorteil,
        chartData,
      }
    } else {
      // Unterhalt an beduerftige Angehoerige § 33a Abs. 1 EStG
      const hoechstbetrag = 11784 // 2025 (= Grundfreibetrag 12.084 - 300 Anrechnungsfrei)
      const anrechenbar = Math.max(eigeneEinkuenfteEmpfaenger - 624, 0)
      const abzugsfaehig = Math.min(
        Math.max(hoechstbetrag - anrechenbar, 0) + kvPvBeitraege,
        jahresunterhalt + kvPvBeitraege
      )

      const steuerersparnis = Math.round(abzugsfaehig * grenzsteuersatz / 100)
      const kistErsparnis = kirchensteuer ? Math.round(steuerersparnis * 0.09) : 0
      const gesamtErsparnis = steuerersparnis + kistErsparnis

      const chartData = [
        { name: 'Unterhalt', betrag: jahresunterhalt },
        { name: 'KV/PV', betrag: kvPvBeitraege },
        { name: 'Hoechstbetrag', betrag: hoechstbetrag },
        { name: 'Abzugsfaehig', betrag: abzugsfaehig },
        { name: 'Steuerersparnis', betrag: gesamtErsparnis },
      ]

      return {
        typ: 'angehoerige' as const,
        abzugsfaehig,
        hoechstbetrag,
        anrechenbar,
        steuerersparnis,
        kistErsparnis,
        gesamtErsparnis,
        chartData,
      }
    }
  }, [unterhaltTyp, jahresunterhalt, kvPvBeitraege, eigeneEinkuenfteEmpfaenger, grenzsteuersatz, realsplitting, kirchensteuer])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-primary" />
          Unterhalt-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Unterhaltsleistungen steuerlich absetzen – § 10/§ 33a EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Ex-Partner (§ 10 Abs. 1a):</strong> Realsplitting max. <strong>14.748 EUR/Jahr</strong> + KV/PV. Empfaenger muss zustimmen und versteuern.</p>
              <p><strong>Beduerftige Angehoerige (§ 33a Abs. 1):</strong> Max. <strong>11.784 EUR</strong> + KV/PV. Eigene Einkuenfte des Empfaengers werden angerechnet (Freibetrag 624 EUR).</p>
              <p><strong>Nachteilsausgleich:</strong> Beim Realsplitting muss der Zahlende dem Empfaenger die Steuermehrbelastung erstatten.</p>
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
              <p className="text-sm font-medium mb-2">Unterhaltsart</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setUnterhaltTyp('expartner')}
                  className={`rounded-md px-4 py-2 text-sm ${unterhaltTyp === 'expartner' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  Ex-Partner
                </button>
                <button
                  onClick={() => setUnterhaltTyp('angehoerige')}
                  className={`rounded-md px-4 py-2 text-sm ${unterhaltTyp === 'angehoerige' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  Beduerftige Angehoerige
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Jahresunterhalt: {jahresunterhalt.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={20000} step={500} value={jahresunterhalt} onChange={e => setJahresunterhalt(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">KV/PV-Beitraege uebernommen: {kvPvBeitraege.toLocaleString('de-DE')} EUR/Jahr</label>
              <input type="range" min={0} max={6000} step={100} value={kvPvBeitraege} onChange={e => setKvPvBeitraege(+e.target.value)} className="w-full accent-primary" />
            </div>

            {unterhaltTyp === 'angehoerige' && (
              <div>
                <label className="text-sm font-medium">Eigene Einkuenfte Empfaenger: {eigeneEinkuenfteEmpfaenger.toLocaleString('de-DE')} EUR/Jahr</label>
                <input type="range" min={0} max={15000} step={500} value={eigeneEinkuenfteEmpfaenger} onChange={e => setEigeneEinkuenfteEmpfaenger(+e.target.value)} className="w-full accent-primary" />
                <p className="text-xs text-muted-foreground mt-1">Freibetrag: 624 EUR. Darüber wird angerechnet.</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div className="flex flex-col gap-2">
              {unterhaltTyp === 'expartner' && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={realsplitting} onChange={e => setRealsplitting(e.target.checked)} className="accent-primary" />
                  Realsplitting (§ 10 Abs. 1a) – Anlage U
                </label>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
                Kirchensteuer (9%)
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.abzugsfaehig.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Abzugsfaehig</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtErsparnis.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Steuerersparnis</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Gezahlter Unterhalt</span>
                <span className="font-medium">{jahresunterhalt.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">KV/PV-Beitraege</span>
                <span className="font-medium">{kvPvBeitraege.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.typ === 'expartner' && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Max. Realsplitting</span>
                  <span className="font-medium">{ergebnis.maxRealsplitting.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              {ergebnis.typ === 'angehoerige' && (
                <>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Hoechstbetrag</span>
                    <span className="font-medium">{ergebnis.hoechstbetrag.toLocaleString('de-DE')} EUR</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Anrechenbare Einkuenfte</span>
                    <span className="font-medium text-red-600">-{ergebnis.anrechenbar.toLocaleString('de-DE')} EUR</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Abzugsfaehig gesamt</span>
                <span className="font-medium text-primary">{ergebnis.abzugsfaehig.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerersparnis (ESt)</span>
                <span className="font-medium text-green-600">{ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.kistErsparnis > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">KiSt-Ersparnis</span>
                  <span className="font-medium text-green-600">{ergebnis.kistErsparnis.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              {ergebnis.typ === 'expartner' && (
                <>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Nachteilsausgleich an Empfaenger</span>
                    <span className="font-medium text-red-600">-{ergebnis.nachteilsausgleich.toLocaleString('de-DE')} EUR</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold">
                    <span>Netto-Vorteil</span>
                    <span className={ergebnis.nettoVorteil > 0 ? 'text-green-600' : 'text-red-600'}>
                      {ergebnis.nettoVorteil > 0 ? '+' : ''}{ergebnis.nettoVorteil.toLocaleString('de-DE')} EUR
                    </span>
                  </div>
                </>
              )}
              {ergebnis.typ === 'angehoerige' && (
                <div className="flex justify-between py-1.5 font-bold">
                  <span>Steuerersparnis gesamt</span>
                  <span className="text-green-600">{ergebnis.gesamtErsparnis.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uebersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="betrag" name="Betrag" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vergleich: Realsplitting vs. § 33a</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Realsplitting (§ 10 Abs. 1a)</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Hoher Hoechstbetrag (14.748 EUR + KV/PV)</li>
                <li>+ Sonderausgabenabzug (volle Wirkung)</li>
                <li>- Empfaenger muss zustimmen (Anlage U)</li>
                <li>- Empfaenger versteuert Unterhalt</li>
                <li>- Nachteilsausgleichspflicht</li>
                <li>= Nur fuer Ex-Ehegatten/-Lebenspartner</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Aussergewoehnliche Belastung (§ 33a)</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Keine Zustimmung noetig</li>
                <li>+ Empfaenger steuerfrei</li>
                <li>+ Auch fuer Eltern, Kinder, Geschwister</li>
                <li>- Niedrigerer Hoechstbetrag (11.784 EUR)</li>
                <li>- Eigene Einkuenfte werden angerechnet</li>
                <li>= Fuer beduerftige Angehoerige</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
