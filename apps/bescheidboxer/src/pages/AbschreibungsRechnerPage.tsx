import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Calculator, Building2, Briefcase, Info } from 'lucide-react'

type AfaTyp = 'immobilie' | 'wirtschaftsgut'
type AfaMethode = 'linear' | 'degressiv'

interface AfaResult {
  jahre: { jahr: number; buchwert: number; afa: number; restbuchwert: number }[]
  gesamtAfa: number
  nutzungsdauer: number
  jahresAfa: number
}

function berechneAfa(
  anschaffungskosten: number,
  nutzungsdauer: number,
  methode: AfaMethode,
  degressivSatz: number
): AfaResult {
  const jahre: AfaResult['jahre'] = []
  let restbuchwert = anschaffungskosten
  const linearAfa = anschaffungskosten / nutzungsdauer
  let gesamtAfa = 0

  for (let i = 1; i <= nutzungsdauer && restbuchwert > 0.01; i++) {
    let afa: number
    if (methode === 'degressiv') {
      const degressivAfa = restbuchwert * (degressivSatz / 100)
      if (degressivAfa > linearAfa) {
        afa = Math.min(degressivAfa, restbuchwert)
      } else {
        afa = Math.min(linearAfa, restbuchwert)
      }
    } else {
      afa = Math.min(linearAfa, restbuchwert)
    }

    gesamtAfa += afa
    jahre.push({
      jahr: i,
      buchwert: restbuchwert,
      afa: Math.round(afa * 100) / 100,
      restbuchwert: Math.round((restbuchwert - afa) * 100) / 100,
    })
    restbuchwert -= afa
  }

  return { jahre, gesamtAfa, nutzungsdauer, jahresAfa: linearAfa }
}

const WIRTSCHAFTSGUETER = [
  { label: 'Computer/Laptop', nutzungsdauer: 3 },
  { label: 'Büromöbel', nutzungsdauer: 13 },
  { label: 'PKW', nutzungsdauer: 6 },
  { label: 'Software (Standardsoftware)', nutzungsdauer: 3 },
  { label: 'Maschinen', nutzungsdauer: 10 },
  { label: 'Telefon/Smartphone', nutzungsdauer: 5 },
  { label: 'Drucker/Scanner', nutzungsdauer: 3 },
  { label: 'Küche (Einbauküche)', nutzungsdauer: 10 },
  { label: 'Photovoltaikanlage', nutzungsdauer: 20 },
  { label: 'Benutzerdefiniert', nutzungsdauer: 0 },
]

export default function AbschreibungsRechnerPage() {
  const [afaTyp, setAfaTyp] = useState<AfaTyp>('immobilie')
  const [methode, setMethode] = useState<AfaMethode>('linear')

  // Immobilie
  const [anschaffungskosten, setAnschaffungskosten] = useState(350000)
  const [baujahr, setBaujahr] = useState(1995)
  const [neubau, setNeubau] = useState(false)

  // Wirtschaftsgut
  const [wirtschaftsgut, setWirtschaftsgut] = useState('Computer/Laptop')
  const [wgKosten, setWgKosten] = useState(1500)
  const [customNutzungsdauer, setCustomNutzungsdauer] = useState(5)

  const [degressivSatz, setDegressivSatz] = useState(5)
  const [showAllJahre, setShowAllJahre] = useState(false)

  const result = useMemo<AfaResult | null>(() => {
    if (afaTyp === 'immobilie') {
      let nd: number
      if (neubau) {
        nd = 33
      } else if (baujahr < 1925) {
        nd = 40
      } else {
        nd = 50
      }
      return berechneAfa(anschaffungskosten, nd, methode, degressivSatz)
    } else {
      const wg = WIRTSCHAFTSGUETER.find(w => w.label === wirtschaftsgut)
      const nd = wg && wg.nutzungsdauer > 0 ? wg.nutzungsdauer : customNutzungsdauer
      if (nd <= 0 || wgKosten <= 0) return null
      return berechneAfa(wgKosten, nd, methode, degressivSatz)
    }
  }, [afaTyp, methode, anschaffungskosten, baujahr, neubau, wirtschaftsgut, wgKosten, customNutzungsdauer, degressivSatz])

  const angezeigte = result ? (showAllJahre ? result.jahre : result.jahre.slice(0, 10)) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Abschreibungsrechner (AfA)</h1>
        <p className="text-muted-foreground mt-1">
          Berechnen Sie die Absetzung für Abnutzung für Immobilien und Wirtschaftsgüter
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eingaben */}
        <div className="lg:col-span-2 space-y-6">
          {/* Typ-Auswahl */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAfaTyp('immobilie')}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                afaTyp === 'immobilie' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <Building2 className={`h-6 w-6 ${afaTyp === 'immobilie' ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="text-left">
                <p className="font-medium text-sm">Immobilie</p>
                <p className="text-xs text-muted-foreground">Gebäude-AfA</p>
              </div>
            </button>
            <button
              onClick={() => setAfaTyp('wirtschaftsgut')}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                afaTyp === 'wirtschaftsgut' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <Briefcase className={`h-6 w-6 ${afaTyp === 'wirtschaftsgut' ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="text-left">
                <p className="font-medium text-sm">Wirtschaftsgut</p>
                <p className="text-xs text-muted-foreground">Möbel, Technik, etc.</p>
              </div>
            </button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {afaTyp === 'immobilie' ? 'Immobilien-Daten' : 'Wirtschaftsgut-Daten'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {afaTyp === 'immobilie' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Anschaffungskosten (€)</label>
                      <input type="number" value={anschaffungskosten} onChange={e => setAnschaffungskosten(Number(e.target.value))} min={0} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                      <p className="text-xs text-muted-foreground mt-1">Inkl. Nebenkosten (ohne Grundstücksanteil)</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Baujahr</label>
                      <input type="number" value={baujahr} onChange={e => setBaujahr(Number(e.target.value))} min={1800} max={2026} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={neubau} onChange={e => setNeubau(e.target.checked)} className="rounded" />
                    Neubau (Baubeginn nach 30.09.2023, § 7 Abs. 5a EStG)
                  </label>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium">Wirtschaftsgut</label>
                    <select value={wirtschaftsgut} onChange={e => setWirtschaftsgut(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {WIRTSCHAFTSGUETER.map(w => <option key={w.label} value={w.label}>{w.label} {w.nutzungsdauer > 0 ? `(${w.nutzungsdauer} J.)` : ''}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Anschaffungskosten (€)</label>
                      <input type="number" value={wgKosten} onChange={e => setWgKosten(Number(e.target.value))} min={0} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                    {wirtschaftsgut === 'Benutzerdefiniert' && (
                      <div>
                        <label className="text-sm font-medium">Nutzungsdauer (Jahre)</label>
                        <input type="number" value={customNutzungsdauer} onChange={e => setCustomNutzungsdauer(Number(e.target.value))} min={1} max={100} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="border-t pt-4">
                <label className="text-sm font-medium">AfA-Methode</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button onClick={() => setMethode('linear')} className={`p-3 rounded-md border-2 text-sm text-left transition-colors ${methode === 'linear' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <p className="font-medium">Linear</p>
                    <p className="text-xs text-muted-foreground">Gleichmäßige Abschreibung</p>
                  </button>
                  <button onClick={() => setMethode('degressiv')} className={`p-3 rounded-md border-2 text-sm text-left transition-colors ${methode === 'degressiv' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <p className="font-medium">Degressiv</p>
                    <p className="text-xs text-muted-foreground">Höhere Anfangsabschreibung</p>
                  </button>
                </div>
                {methode === 'degressiv' && (
                  <div className="mt-3">
                    <label className="text-sm font-medium">Degressiver Satz (%)</label>
                    <input type="number" value={degressivSatz} onChange={e => setDegressivSatz(Number(e.target.value))} min={1} max={30} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                )}
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
            </CardHeader>
            <CardContent className="space-y-4">
              {result && (
                <>
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground">Jährliche AfA</p>
                    <p className="text-3xl font-bold text-primary mt-1">
                      {result.jahresAfa.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ({(result.jahresAfa / 12).toLocaleString('de-DE', { maximumFractionDigits: 2 })} €/Monat)
                    </p>
                  </div>
                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nutzungsdauer</span>
                      <span className="font-medium">{result.nutzungsdauer} Jahre</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AfA-Satz</span>
                      <span className="font-medium">{(100 / result.nutzungsdauer).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Methode</span>
                      <span className="font-medium">{methode === 'linear' ? 'Linear' : 'Degressiv'}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {afaTyp === 'immobilie'
                    ? 'Vor 1925: 2,5% (40 J.), ab 1925: 2% (50 J.), Neubau §7(5a): ~3% (33 J.). Grundstücksanteil nicht abschreibbar.'
                    : 'GWG bis 800 € netto: Sofortabschreibung. Sammelposten 250-1.000 €: 5 Jahre linear.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AfA-Tabelle */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Abschreibungstabelle</CardTitle>
            <CardDescription>{result.nutzungsdauer} Jahre Nutzungsdauer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Jahr</th>
                    <th className="text-right py-2 font-medium">Buchwert</th>
                    <th className="text-right py-2 font-medium">AfA</th>
                    <th className="text-right py-2 font-medium">Restbuchwert</th>
                  </tr>
                </thead>
                <tbody>
                  {angezeigte.map(j => (
                    <tr key={j.jahr} className="border-b">
                      <td className="py-2">{j.jahr}. Jahr</td>
                      <td className="text-right py-2">{j.buchwert.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €</td>
                      <td className="text-right py-2 text-primary font-medium">{j.afa.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €</td>
                      <td className="text-right py-2">{j.restbuchwert.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.jahre.length > 10 && (
              <button
                onClick={() => setShowAllJahre(!showAllJahre)}
                className="mt-3 text-sm text-primary hover:underline"
              >
                {showAllJahre ? 'Weniger anzeigen' : `Alle ${result.jahre.length} Jahre anzeigen`}
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
