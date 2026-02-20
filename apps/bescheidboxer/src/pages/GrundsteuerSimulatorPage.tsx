import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Calculator, Info, TrendingUp, TrendingDown, Building2, MapPin } from 'lucide-react'

const BUNDESLAND_HEBESAETZE: Record<string, { name: string; avg: number; messzahl: number }> = {
  BW: { name: 'Baden-Württemberg', avg: 398, messzahl: 1.3 },
  BY: { name: 'Bayern', avg: 394, messzahl: 0.31 },
  BE: { name: 'Berlin', avg: 810, messzahl: 0.31 },
  BB: { name: 'Brandenburg', avg: 410, messzahl: 0.31 },
  HB: { name: 'Bremen', avg: 695, messzahl: 0.31 },
  HH: { name: 'Hamburg', avg: 540, messzahl: 0.31 },
  HE: { name: 'Hessen', avg: 481, messzahl: 0.31 },
  MV: { name: 'Mecklenburg-Vorpommern', avg: 416, messzahl: 0.31 },
  NI: { name: 'Niedersachsen', avg: 430, messzahl: 0.31 },
  NW: { name: 'Nordrhein-Westfalen', avg: 569, messzahl: 0.31 },
  RP: { name: 'Rheinland-Pfalz', avg: 433, messzahl: 0.31 },
  SL: { name: 'Saarland', avg: 440, messzahl: 0.31 },
  SN: { name: 'Sachsen', avg: 530, messzahl: 0.36 },
  ST: { name: 'Sachsen-Anhalt', avg: 410, messzahl: 0.31 },
  SH: { name: 'Schleswig-Holstein', avg: 350, messzahl: 0.31 },
  TH: { name: 'Thüringen', avg: 415, messzahl: 0.31 },
}

const GRUNDSTUECKSARTEN = [
  { value: 'einfamilienhaus', label: 'Einfamilienhaus', factor: 1.0 },
  { value: 'zweifamilienhaus', label: 'Zweifamilienhaus', factor: 1.0 },
  { value: 'mietwohnung', label: 'Mietwohngrundstück', factor: 1.0 },
  { value: 'eigentumswohnung', label: 'Eigentumswohnung', factor: 1.0 },
  { value: 'geschaeft', label: 'Geschäftsgrundstück', factor: 1.2 },
  { value: 'gemischt', label: 'Gemischt genutztes Grundstück', factor: 1.1 },
  { value: 'unbebautes', label: 'Unbebautes Grundstück', factor: 0.8 },
]

export default function GrundsteuerSimulatorPage() {
  const [bundesland, setBundesland] = useState('NW')
  const [grundstuecksart, setGrundstuecksart] = useState('einfamilienhaus')
  const [bodenrichtwert, setBodenrichtwert] = useState(200)
  const [grundstuecksflaeche, setGrundstuecksflaeche] = useState(500)
  const [wohnflaeche, setWohnflaeche] = useState(120)
  const [baujahr, setBaujahr] = useState(1990)
  const [hebesatz, setHebesatz] = useState(BUNDESLAND_HEBESAETZE['NW'].avg)
  const [useCustomHebesatz, setUseCustomHebesatz] = useState(false)

  const result = useMemo(() => {
    const land = BUNDESLAND_HEBESAETZE[bundesland]
    const art = GRUNDSTUECKSARTEN.find(a => a.value === grundstuecksart)
    if (!land || !art) return null

    const effectiveHebesatz = useCustomHebesatz ? hebesatz : land.avg

    // Bundesmodell Berechnung (vereinfacht)
    const bodenWert = bodenrichtwert * grundstuecksflaeche
    const altersAbschlag = Math.max(0, Math.min(0.7, (2026 - baujahr) * 0.005))
    const gebaeudeWert = wohnflaeche * 3000 * (1 - altersAbschlag)
    const grundsteuerwert = (bodenWert + gebaeudeWert) * art.factor

    const steuermessbetrag = grundsteuerwert * land.messzahl / 1000
    const jahressteuer = steuermessbetrag * effectiveHebesatz / 100
    const quartalRate = jahressteuer / 4

    // Vergleich: geschätzter alter Einheitswert
    const alterEinheitswert = grundstuecksflaeche * 25 + wohnflaeche * 120
    const alteSteuer = alterEinheitswert * 3.5 / 1000 * effectiveHebesatz / 100
    const differenz = jahressteuer - alteSteuer
    const differenzProzent = alteSteuer > 0 ? (differenz / alteSteuer) * 100 : 0

    return {
      bodenWert,
      gebaeudeWert,
      grundsteuerwert,
      steuermessbetrag,
      jahressteuer,
      quartalRate,
      alteSteuer,
      differenz,
      differenzProzent,
      effectiveHebesatz,
      altersAbschlag: altersAbschlag * 100,
    }
  }, [bundesland, grundstuecksart, bodenrichtwert, grundstuecksflaeche, wohnflaeche, baujahr, hebesatz, useCustomHebesatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grundsteuer-Simulator</h1>
        <p className="text-muted-foreground mt-1">
          Berechnen Sie Ihre voraussichtliche Grundsteuer nach dem neuen Bundesmodell (ab 2025)
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">Hinweis zur Berechnung</p>
            <p className="mt-1 text-blue-700 dark:text-blue-400">
              Dies ist eine vereinfachte Simulation. Die tatsächliche Grundsteuer hängt von weiteren
              Faktoren ab (z.B. Mietniveau, Lage). Einige Bundesländer (z.B. Baden-Württemberg, Bayern)
              verwenden abweichende Modelle.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eingaben */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Lage & Grundstück
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Bundesland</label>
                  <select
                    value={bundesland}
                    onChange={e => {
                      setBundesland(e.target.value)
                      if (!useCustomHebesatz) {
                        setHebesatz(BUNDESLAND_HEBESAETZE[e.target.value].avg)
                      }
                    }}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {Object.entries(BUNDESLAND_HEBESAETZE)
                      .sort((a, b) => a[1].name.localeCompare(b[1].name))
                      .map(([key, val]) => (
                        <option key={key} value={key}>{val.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Grundstücksart</label>
                  <select
                    value={grundstuecksart}
                    onChange={e => setGrundstuecksart(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {GRUNDSTUECKSARTEN.map(art => (
                      <option key={art.value} value={art.value}>{art.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Bodenrichtwert (€/m²)</label>
                  <input
                    type="number"
                    value={bodenrichtwert}
                    onChange={e => setBodenrichtwert(Number(e.target.value))}
                    min={0}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Finden Sie Ihren Bodenrichtwert unter boris.nrw.de oder Ihrem Landesportal
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Grundstücksfläche (m²)</label>
                  <input
                    type="number"
                    value={grundstuecksflaeche}
                    onChange={e => setGrundstuecksflaeche(Number(e.target.value))}
                    min={0}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Gebäude
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Wohnfläche (m²)</label>
                  <input
                    type="number"
                    value={wohnflaeche}
                    onChange={e => setWohnflaeche(Number(e.target.value))}
                    min={0}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Baujahr</label>
                  <input
                    type="number"
                    value={baujahr}
                    onChange={e => setBaujahr(Number(e.target.value))}
                    min={1800}
                    max={2026}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Altersabschlag: {result ? result.altersAbschlag.toFixed(1) : '0'}%
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Hebesatz (%)
                    {!useCustomHebesatz && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        Durchschnitt {BUNDESLAND_HEBESAETZE[bundesland].name}
                      </span>
                    )}
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomHebesatz}
                      onChange={e => {
                        setUseCustomHebesatz(e.target.checked)
                        if (!e.target.checked) {
                          setHebesatz(BUNDESLAND_HEBESAETZE[bundesland].avg)
                        }
                      }}
                      className="rounded"
                    />
                    Eigenen Hebesatz eingeben
                  </label>
                </div>
                <input
                  type="number"
                  value={useCustomHebesatz ? hebesatz : BUNDESLAND_HEBESAETZE[bundesland].avg}
                  onChange={e => setHebesatz(Number(e.target.value))}
                  disabled={!useCustomHebesatz}
                  min={0}
                  max={2000}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ergebnis */}
        <div className="space-y-6">
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Ergebnis
              </CardTitle>
              <CardDescription>Neue Grundsteuer (Bundesmodell)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result && (
                <>
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Jährliche Grundsteuer</p>
                    <p className="text-4xl font-bold text-primary mt-1">
                      {result.jahressteuer.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Quartalsrate: {result.quartalRate.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bodenwert</span>
                      <span className="font-medium">{result.bodenWert.toLocaleString('de-DE')} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gebäudewert</span>
                      <span className="font-medium">{result.gebaeudeWert.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Grundsteuerwert</span>
                      <span className="font-medium">{result.grundsteuerwert.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Steuermessbetrag</span>
                      <span className="font-medium">{result.steuermessbetrag.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hebesatz</span>
                      <span className="font-medium">{result.effectiveHebesatz} %</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {result.differenz > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  Vergleich Alt vs. Neu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Alte Grundsteuer (ca.)</span>
                  <span>{result.alteSteuer.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Neue Grundsteuer</span>
                  <span className="font-medium">{result.jahressteuer.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="border-t pt-3">
                  <div className={`flex justify-between text-sm font-medium ${result.differenz > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <span>Differenz</span>
                    <span>
                      {result.differenz > 0 ? '+' : ''}{result.differenz.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      {' '}({result.differenzProzent > 0 ? '+' : ''}{result.differenzProzent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Der Vergleich basiert auf geschätzten alten Einheitswerten und dient nur der Orientierung.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Berechnungsformel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Grundsteuerwert = Bodenwert + Gebäudewert</p>
              <p>2. Steuermessbetrag = Grundsteuerwert × Messzahl</p>
              <p>3. Grundsteuer = Steuermessbetrag × Hebesatz</p>
              <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs">
                <p className="font-medium text-foreground">Messzahl {BUNDESLAND_HEBESAETZE[bundesland].name}:</p>
                <p>{BUNDESLAND_HEBESAETZE[bundesland].messzahl} ‰</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
