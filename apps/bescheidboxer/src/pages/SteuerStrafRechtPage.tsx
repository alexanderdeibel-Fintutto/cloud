import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ShieldAlert, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'


interface StraftatBestand {
  key: string
  label: string
  paragraph: string
  beschreibung: string
  strafe: string
  verjährung: number
}

const STRAFTATBESTAENDE: StraftatBestand[] = [
  { key: 'hinterziehung', label: 'Steuerhinterziehung', paragraph: '§ 370 AO', beschreibung: 'Vorsaetzlich falsche Angaben oder Verschweigen', strafe: 'Geldstrafe oder Freiheitsstrafe bis 5 Jahre', verjährung: 10 },
  { key: 'hinterziehung_schwer', label: 'Besonders schwerer Fall', paragraph: '§ 370 Abs. 3 AO', beschreibung: 'Ab 50.000 EUR Steuervorteil (BGH)', strafe: 'Freiheitsstrafe 6 Monate bis 10 Jahre', verjährung: 10 },
  { key: 'leichtfertig', label: 'Leichtfertige Steuerverkürzung', paragraph: '§ 378 AO', beschreibung: 'Grob fahrlaessig falsche Angaben', strafe: 'Geldbusse bis 50.000 EUR', verjährung: 5 },
  { key: 'ordnungswidrigkeit', label: 'Steuerordnungswidrigkeit', paragraph: '§ 379 AO', beschreibung: 'Belegverstoss, Aufzeichnungspflicht', strafe: 'Geldbusse bis 25.000 EUR', verjährung: 5 },
]

const STRAFZUMESSUNG = [
  { bis: 1000, strafe: 'Einstellung nach § 153a StPO (Geldauflage)', farbe: 'bg-green-100 text-green-700' },
  { bis: 5000, strafe: 'Geldstrafe (Tagessaetze)', farbe: 'bg-yellow-100 text-yellow-700' },
  { bis: 50000, strafe: 'Geldstrafe, ggf. Bewaehrungsstrafe', farbe: 'bg-orange-100 text-orange-700' },
  { bis: 100000, strafe: 'Bewaehrungsstrafe (6-12 Monate)', farbe: 'bg-red-100 text-red-700' },
  { bis: 1000000, strafe: 'Freiheitsstrafe auf Bewaehrung / ohne Bewaehrung', farbe: 'bg-red-200 text-red-800' },
  { bis: Infinity, strafe: 'Freiheitsstrafe ohne Bewaehrung (2+ Jahre)', farbe: 'bg-red-300 text-red-900' },
]

export default function SteuerStrafRechtPage() {
  const [hinterziehungsBetrag, setHinterziehungsBetrag] = useState(25000)
  const [tatbestand, setTatbestand] = useState('hinterziehung')
  const [selbstanzeige, setSelbstanzeige] = useState(false)
  const [vollstaendig, setVollstaendig] = useState(true)
  const [entdeckt, setEntdeckt] = useState(false)

  const ergebnis = useMemo(() => {
    const tat = STRAFTATBESTAENDE.find(t => t.key === tatbestand)!

    // Strafzumessung nach BGH-Rechtsprechung
    const strafrahmen = STRAFZUMESSUNG.find(s => hinterziehungsBetrag <= s.bis)!

    // Selbstanzeige (§ 371 AO)
    let selbstanzeigeWirksam = false
    let selbstanzeigeZuschlag = 0
    let selbstanzeigeHinweis = ''

    if (selbstanzeige) {
      if (entdeckt) {
        selbstanzeigeWirksam = false
        selbstanzeigeHinweis = 'Sperrgrund: Tat bereits entdeckt (§ 371 Abs. 2 Nr. 2 AO). Selbstanzeige unwirksam!'
      } else if (!vollstaendig) {
        selbstanzeigeWirksam = false
        selbstanzeigeHinweis = 'Teilselbstanzeige seit 2015 unwirksam (§ 371 Abs. 1 AO). Muss vollstaendig sein!'
      } else {
        selbstanzeigeWirksam = true
        // Zuschlag nach § 398a AO
        if (hinterziehungsBetrag > 25000) {
          if (hinterziehungsBetrag <= 100000) selbstanzeigeZuschlag = 10
          else if (hinterziehungsBetrag <= 1000000) selbstanzeigeZuschlag = 15
          else selbstanzeigeZuschlag = 20
        }
        const zuschlagBetrag = Math.round(hinterziehungsBetrag * selbstanzeigeZuschlag / 100)
        selbstanzeigeHinweis = selbstanzeigeZuschlag > 0
          ? `Wirksam. Zuschlag § 398a AO: ${selbstanzeigeZuschlag}% = ${zuschlagBetrag.toLocaleString('de-DE')} EUR (+ Hinterziehungszinsen 6%/Jahr).`
          : 'Wirksam. Straffreiheit ohne Zuschlag (bis 25.000 EUR). Nur Nachzahlung + Zinsen.'
      }
    }

    // Hinterziehungszinsen: 6% p.a. (§ 235 AO)
    const zinsenProJahr = Math.round(hinterziehungsBetrag * 0.06)
    const zinsen3Jahre = zinsenProJahr * 3

    // Gesamtbelastung bei Selbstanzeige
    const zuschlagBetrag = Math.round(hinterziehungsBetrag * selbstanzeigeZuschlag / 100)
    const gesamtSelbstanzeige = hinterziehungsBetrag + zuschlagBetrag + zinsen3Jahre

    // Chart: Strafzumessung
    const chartData = STRAFZUMESSUNG.filter(s => s.bis !== Infinity && s.bis <= 200000).map(s => ({
      name: s.bis <= 1000 ? '< 1k' : s.bis <= 5000 ? '< 5k' : s.bis <= 50000 ? '< 50k' : '< 100k',
      schwere: s.bis,
    }))

    return {
      tat,
      strafrahmen,
      selbstanzeigeWirksam,
      selbstanzeigeZuschlag,
      selbstanzeigeHinweis,
      zuschlagBetrag,
      zinsenProJahr,
      zinsen3Jahre,
      gesamtSelbstanzeige,
      chartData,
    }
  }, [hinterziehungsBetrag, tatbestand, selbstanzeige, vollstaendig, entdeckt])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          Steuerstrafrecht
        </h1>
        <p className="text-muted-foreground mt-1">
          Strafrahmen, Selbstanzeige & Verjaehrung – §§ 369 ff. AO
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>§ 370 AO:</strong> Steuerhinterziehung – Geldstrafe oder bis 5 Jahre Freiheitsstrafe (schwere Faelle bis 10 Jahre).</p>
              <p><strong>Selbstanzeige (§ 371 AO):</strong> Straffreiheit bei vollstaendiger Offenlegung + Nachzahlung. Ab 25.000 EUR: Zuschlag (10-20%).</p>
              <p><strong>Sperrgruende:</strong> Tat entdeckt, Pruefungsanordnung, Einleitung Strafverfahren → keine wirksame Selbstanzeige mehr.</p>
              <p><strong>Hinweis:</strong> Dies ist eine allgemeine Information. Im Ernstfall unbedingt einen Fachanwalt fuer Steuerrecht konsultieren!</p>
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
              <p className="text-sm font-medium mb-2">Tatbestand</p>
              <div className="grid gap-2">
                {STRAFTATBESTAENDE.map(t => (
                  <button key={t.key} onClick={() => setTatbestand(t.key)} className={`rounded-md px-3 py-2 text-sm text-left ${tatbestand === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <span className="font-medium">{t.label}</span>
                    <span className="text-xs ml-2 opacity-75">{t.paragraph}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Hinterziehungsbetrag: {hinterziehungsBetrag.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={500} max={500000} step={500} value={hinterziehungsBetrag} onChange={e => setHinterziehungsBetrag(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selbstanzeige} onChange={e => setSelbstanzeige(e.target.checked)} className="accent-primary" />
                <span className="font-medium">Selbstanzeige erwaegen</span>
              </label>
              {selbstanzeige && (
                <div className="ml-6 space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={vollstaendig} onChange={e => setVollstaendig(e.target.checked)} className="accent-primary" />
                    Vollstaendig (alle Jahre, alle Steuerarten)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={entdeckt} onChange={e => setEntdeckt(e.target.checked)} className="accent-primary" />
                    Tat bereits entdeckt / Pruefungsanordnung
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Einschaetzung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`rounded-lg p-4 ${ergebnis.strafrahmen.farbe}`}>
              <p className="font-medium">{ergebnis.tat.paragraph}: {ergebnis.tat.label}</p>
              <p className="text-sm mt-1">{ergebnis.strafrahmen.strafe}</p>
              <p className="text-xs mt-2 opacity-75">Verjaehrungsfrist: {ergebnis.tat.verjährung} Jahre</p>
            </div>

            {selbstanzeige && (
              <div className={`rounded-lg p-4 ${ergebnis.selbstanzeigeWirksam ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {ergebnis.selbstanzeigeWirksam ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium text-sm">
                    Selbstanzeige: {ergebnis.selbstanzeigeWirksam ? 'Wirksam' : 'Unwirksam'}
                  </span>
                </div>
                <p className="text-sm">{ergebnis.selbstanzeigeHinweis}</p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Hinterzogener Betrag</span>
                <span className="font-medium">{hinterziehungsBetrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Hinterziehungszinsen (6%/Jahr)</span>
                <span className="font-medium">{ergebnis.zinsenProJahr.toLocaleString('de-DE')} EUR/J</span>
              </div>
              {selbstanzeige && ergebnis.selbstanzeigeWirksam && (
                <>
                  {ergebnis.zuschlagBetrag > 0 && (
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">Zuschlag § 398a ({ergebnis.selbstanzeigeZuschlag}%)</span>
                      <span className="font-medium">{ergebnis.zuschlagBetrag.toLocaleString('de-DE')} EUR</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Zinsen (geschaetzt 3 Jahre)</span>
                    <span className="font-medium">{ergebnis.zinsen3Jahre.toLocaleString('de-DE')} EUR</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold">
                    <span>Gesamtbelastung Selbstanzeige</span>
                    <span className="text-primary">{ergebnis.gesamtSelbstanzeige.toLocaleString('de-DE')} EUR</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Strafrahmen nach BGH-Rechtsprechung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {STRAFZUMESSUNG.map((s, i) => {
              const bisLabel = s.bis === Infinity ? '> 1.000.000' : `bis ${s.bis.toLocaleString('de-DE')}`
              const isAktiv = hinterziehungsBetrag <= s.bis && (i === 0 || hinterziehungsBetrag > (STRAFZUMESSUNG[i - 1]?.bis ?? 0))
              return (
                <div key={i} className={`rounded-lg p-3 ${isAktiv ? 'ring-2 ring-primary ' + s.farbe : 'bg-muted'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{bisLabel} EUR</span>
                    <span className="text-xs">{s.strafe}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selbstanzeige – Voraussetzungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
              <p className="font-medium text-green-700 dark:text-green-400 mb-1">Voraussetzungen</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Vollstaendig (alle Jahre, alle Steuerarten)</li>
                <li>• Vor Entdeckung der Tat</li>
                <li>• Nachzahlung innerhalb gesetzter Frist</li>
                <li>• Ab 25.000 EUR: Zuschlag nach § 398a AO</li>
              </ul>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
              <p className="font-medium text-red-700 dark:text-red-400 mb-1">Sperrgruende (§ 371 Abs. 2)</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Pruefungsanordnung bekannt gegeben</li>
                <li>• Tat ganz oder teilweise entdeckt</li>
                <li>• Steuerstrafverfahren eingeleitet</li>
                <li>• Umsatzsteuervoranmeldung/Lohnsteuer: Bekanntgabe</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
