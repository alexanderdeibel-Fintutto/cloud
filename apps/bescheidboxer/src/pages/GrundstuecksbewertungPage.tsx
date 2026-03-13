import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { MapPin, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const BEWERTUNGSVERFAHREN = {
  vergleichswert: 'Vergleichswertverfahren',
  ertragswert: 'Ertragswertverfahren',
  sachwert: 'Sachwertverfahren',
} as const

const GRUNDSTUECKSARTEN = [
  { key: 'efh', label: 'Einfamilienhaus', verfahren: 'vergleichswert' },
  { key: 'zfh', label: 'Zweifamilienhaus', verfahren: 'vergleichswert' },
  { key: 'etw', label: 'Eigentumswohnung', verfahren: 'vergleichswert' },
  { key: 'mfh', label: 'Mehrfamilienhaus', verfahren: 'ertragswert' },
  { key: 'gewerbe', label: 'Geschaeftsgrundst.', verfahren: 'ertragswert' },
  { key: 'unbebaut', label: 'Unbebautes Grundst.', verfahren: 'vergleichswert' },
] as const

const LIEGENSCHAFTSZINSSAETZE: Record<string, number> = {
  efh: 2.5,
  zfh: 3.0,
  etw: 2.5,
  mfh: 4.5,
  gewerbe: 6.0,
  unbebaut: 0,
}

const SACHWERTFAKTOREN: Record<string, number> = {
  efh: 1.15,
  zfh: 1.10,
  etw: 1.10,
  mfh: 0.95,
  gewerbe: 0.90,
  unbebaut: 1.0,
}

export default function GrundstuecksbewertungPage() {
  const [art, setArt] = useState('efh')
  const [bodenrichtwert, setBodenrichtwert] = useState(150)
  const [grundstuecksflaeche, setGrundstuecksflaeche] = useState(600)
  const [wohnflaeche, setWohnflaeche] = useState(140)
  const [baujahr, setBaujahr] = useState(1990)
  const [jahresmiete, setJahresmiete] = useState(12000)
  const [bewirtschaftungskosten, setBewirtschaftungskosten] = useState(25)
  const [vergleichswert, setVergleichswert] = useState(350000)

  const ergebnis = useMemo(() => {
    const bodenwert = bodenrichtwert * grundstuecksflaeche
    const artConfig = GRUNDSTUECKSARTEN.find(a => a.key === art)
    const liegenschaftszins = LIEGENSCHAFTSZINSSAETZE[art] || 3.0
    const sachwertfaktor = SACHWERTFAKTOREN[art] || 1.0

    // Gebaeudealter & Restnutzungsdauer
    const gebaeudeAlter = 2025 - baujahr
    const gesamtNutzungsdauer = art === 'gewerbe' ? 50 : 80
    const restnutzungsdauer = Math.max(gesamtNutzungsdauer - gebaeudeAlter, 15)

    // Vergleichswertverfahren (§ 183 BewG)
    const vergleichswertErgebnis = vergleichswert

    // Ertragswertverfahren (§ 184-188 BewG)
    const bewirtschaftungAbzug = jahresmiete * bewirtschaftungskosten / 100
    const reinertrag = jahresmiete - bewirtschaftungAbzug
    const bodenwertverzinsung = bodenwert * liegenschaftszins / 100
    const gebaeudeReinertrag = reinertrag - bodenwertverzinsung

    // Barwertfaktor (Vervielfaeltiger)
    const q = 1 + liegenschaftszins / 100
    const barwertfaktor = restnutzungsdauer > 0 ? (Math.pow(q, restnutzungsdauer) - 1) / (Math.pow(q, restnutzungsdauer) * (q - 1)) : 0
    const gebaeudeErtragswert = Math.round(gebaeudeReinertrag * barwertfaktor)
    const ertragswertGesamt = Math.max(bodenwert + gebaeudeErtragswert, bodenwert)

    // Sachwertverfahren (§ 189-191 BewG)
    // Normalherstellungskosten 2010: ca. 1.200-1.800 EUR/m²
    const nhk = art === 'gewerbe' ? 1500 : art === 'mfh' ? 1400 : 1600
    const herstellungskosten = nhk * wohnflaeche
    const alterswertminderung = Math.min(gebaeudeAlter / gesamtNutzungsdauer, 0.7)
    const gebaeudeZeitwert = Math.round(herstellungskosten * (1 - alterswertminderung))
    const vorlaeufigSachwert = bodenwert + gebaeudeZeitwert
    const sachwertErgebnis = Math.round(vorlaeufigSachwert * sachwertfaktor)

    // Ermitteltes Ergebnis (je nach Art)
    let empfohlenerWert: number
    if (art === 'unbebaut') {
      empfohlenerWert = bodenwert
    } else if (artConfig?.verfahren === 'ertragswert') {
      empfohlenerWert = ertragswertGesamt
    } else {
      empfohlenerWert = vergleichswertErgebnis
    }

    // Chart
    const chartData = [
      { name: 'Vergleichswert', wert: vergleichswertErgebnis },
      { name: 'Ertragswert', wert: ertragswertGesamt },
      { name: 'Sachwert', wert: sachwertErgebnis },
      { name: 'Bodenwert', wert: bodenwert },
    ]

    return {
      bodenwert,
      vergleichswertErgebnis,
      ertragswertGesamt,
      sachwertErgebnis,
      empfohlenerWert,
      gebaeudeAlter,
      restnutzungsdauer,
      reinertrag,
      gebaeudeReinertrag,
      barwertfaktor: Math.round(barwertfaktor * 100) / 100,
      gebaeudeErtragswert,
      gebaeudeZeitwert,
      alterswertminderung: Math.round(alterswertminderung * 100),
      verfahren: artConfig?.verfahren || 'vergleichswert',
      chartData,
    }
  }, [art, bodenrichtwert, grundstuecksflaeche, wohnflaeche, baujahr, jahresmiete, bewirtschaftungskosten, vergleichswert])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Grundstuecksbewertung
        </h1>
        <p className="text-muted-foreground mt-1">
          Bewertungsverfahren nach BewG – Erbschaft-/Schenkungsteuer & Grundsteuer
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Vergleichswert (§ 183 BewG):</strong> EFH, ZFH, ETW – marktbasiert, wenn Vergleichspreise vorliegen.</p>
              <p><strong>Ertragswert (§ 184 BewG):</strong> MFH, Gewerbe – Mieteinnahmen kapitalisiert mit Liegenschaftszins.</p>
              <p><strong>Sachwert (§ 189 BewG):</strong> Subsidiär – Herstellungskosten + Bodenwert, marktangepasst.</p>
              <p><strong>Bodenrichtwert:</strong> Vom Gutachterausschuss festgelegt (§ 196 BauGB).</p>
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
              <p className="text-sm font-medium mb-2">Grundstuecksart</p>
              <div className="grid grid-cols-2 gap-2">
                {GRUNDSTUECKSARTEN.map(a => (
                  <button key={a.key} onClick={() => setArt(a.key)} className={`rounded-md px-3 py-2 text-sm text-left ${art === a.key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Bodenrichtwert: {bodenrichtwert} EUR/m²</label>
              <input type="range" min={10} max={1000} step={5} value={bodenrichtwert} onChange={e => setBodenrichtwert(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Grundstuecksflaeche: {grundstuecksflaeche} m²</label>
              <input type="range" min={100} max={3000} step={50} value={grundstuecksflaeche} onChange={e => setGrundstuecksflaeche(+e.target.value)} className="w-full accent-primary" />
            </div>

            {art !== 'unbebaut' && (
              <>
                <div>
                  <label className="text-sm font-medium">Wohnflaeche: {wohnflaeche} m²</label>
                  <input type="range" min={30} max={500} step={5} value={wohnflaeche} onChange={e => setWohnflaeche(+e.target.value)} className="w-full accent-primary" />
                </div>

                <div>
                  <label className="text-sm font-medium">Baujahr: {baujahr}</label>
                  <input type="range" min={1900} max={2025} value={baujahr} onChange={e => setBaujahr(+e.target.value)} className="w-full accent-primary" />
                  <p className="text-xs text-muted-foreground">Gebaeudealt.: {ergebnis.gebaeudeAlter} J. | Restnutzung: {ergebnis.restnutzungsdauer} J.</p>
                </div>

                {ergebnis.verfahren === 'vergleichswert' && (
                  <div>
                    <label className="text-sm font-medium">Vergleichswert: {vergleichswert.toLocaleString('de-DE')} EUR</label>
                    <input type="range" min={50000} max={2000000} step={10000} value={vergleichswert} onChange={e => setVergleichswert(+e.target.value)} className="w-full accent-primary" />
                    <p className="text-xs text-muted-foreground">Marktpreis aus Vergleichstransaktionen</p>
                  </div>
                )}

                {(art === 'mfh' || art === 'gewerbe') && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Jahresmiete: {jahresmiete.toLocaleString('de-DE')} EUR</label>
                      <input type="range" min={3000} max={200000} step={1000} value={jahresmiete} onChange={e => setJahresmiete(+e.target.value)} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Bewirtschaftungskosten: {bewirtschaftungskosten}%</label>
                      <input type="range" min={10} max={40} value={bewirtschaftungskosten} onChange={e => setBewirtschaftungskosten(+e.target.value)} className="w-full accent-primary" />
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Bewertungsergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-primary/10 p-4 text-center mb-6">
              <p className="text-xs text-muted-foreground mb-1">
                {BEWERTUNGSVERFAHREN[ergebnis.verfahren as keyof typeof BEWERTUNGSVERFAHREN]}
              </p>
              <p className="text-3xl font-bold text-primary">{ergebnis.empfohlenerWert.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Grundbesitzwert (Bedarfswert)</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Bodenwert ({grundstuecksflaeche} m² x {bodenrichtwert} EUR)</span>
                <span className="font-medium">{ergebnis.bodenwert.toLocaleString('de-DE')} EUR</span>
              </div>

              {art !== 'unbebaut' && (
                <>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Vergleichswert</span>
                    <span className="font-medium">{ergebnis.vergleichswertErgebnis.toLocaleString('de-DE')} EUR</span>
                  </div>

                  {(art === 'mfh' || art === 'gewerbe') && (
                    <>
                      <div className="flex justify-between py-1.5 border-b">
                        <span className="text-muted-foreground">Reinertrag</span>
                        <span className="font-medium">{ergebnis.reinertrag.toLocaleString('de-DE')} EUR</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b">
                        <span className="text-muted-foreground">Gebaeude-Ertragswert (x{ergebnis.barwertfaktor})</span>
                        <span className="font-medium">{ergebnis.gebaeudeErtragswert.toLocaleString('de-DE')} EUR</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b font-bold">
                        <span>Ertragswert gesamt</span>
                        <span className="text-primary">{ergebnis.ertragswertGesamt.toLocaleString('de-DE')} EUR</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Gebaeude-Zeitwert (-{ergebnis.alterswertminderung}%)</span>
                    <span className="font-medium">{ergebnis.gebaeudeZeitwert.toLocaleString('de-DE')} EUR</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Sachwert (marktangepasst)</span>
                    <span className="font-medium">{ergebnis.sachwertErgebnis.toLocaleString('de-DE')} EUR</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {art !== 'unbebaut' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verfahrensvergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ergebnis.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                  <Legend />
                  <Bar dataKey="wert" name="Bewertung" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bewertungsverfahren</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className={`rounded-lg p-3 ${ergebnis.verfahren === 'vergleichswert' ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>
              <p className="font-medium mb-1">Vergleichswert</p>
              <p className="text-xs text-muted-foreground">EFH, ZFH, ETW. Marktpreise aus realen Transaktionen.</p>
            </div>
            <div className={`rounded-lg p-3 ${ergebnis.verfahren === 'ertragswert' ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>
              <p className="font-medium mb-1">Ertragswert</p>
              <p className="text-xs text-muted-foreground">MFH, Gewerbe. Mieteinnahmen kapitalisiert.</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium mb-1">Sachwert</p>
              <p className="text-xs text-muted-foreground">Subsidiär. Herstellungskosten + Boden.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
