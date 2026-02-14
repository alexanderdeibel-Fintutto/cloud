import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Bewohner {
  name: string
  geburtsdatum: string
}

interface FormData {
  wohnungsgeberName: string
  wohnungsgeberStrasse: string
  wohnungsgeberPlzOrt: string
  wohnungAdresse: string
  wohnungPlzOrt: string
  wohnflaeche: string
  zimmer: string
  einzugsdatum: string
  auszugsdatum: string
  istEinzug: boolean
  bewohner: Bewohner[]
  datum: string
}

const initial: FormData = {
  wohnungsgeberName: '', wohnungsgeberStrasse: '', wohnungsgeberPlzOrt: '',
  wohnungAdresse: '', wohnungPlzOrt: '',
  wohnflaeche: '', zimmer: '',
  einzugsdatum: '', auszugsdatum: '',
  istEinzug: true,
  bewohner: [{ name: '', geburtsdatum: '' }],
  datum: new Date().toISOString().split('T')[0],
}

export default function WohnungsgeberbestaetigungFormular() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(initial)

  const update = (fields: Partial<FormData>) => setData((d) => ({ ...d, ...fields }))

  const addBewohner = () => {
    setData((d) => ({ ...d, bewohner: [...d.bewohner, { name: '', geburtsdatum: '' }] }))
  }

  const updateBewohner = (i: number, fields: Partial<Bewohner>) => {
    setData((d) => ({
      ...d,
      bewohner: d.bewohner.map((b, idx) => idx === i ? { ...b, ...fields } : b),
    }))
  }

  const removeBewohner = (i: number) => {
    if (data.bewohner.length <= 1) return
    setData((d) => ({ ...d, bewohner: d.bewohner.filter((_, idx) => idx !== i) }))
  }

  const steps = ['Wohnungsgeber', 'Wohnung', 'Bewohner', 'Bestätigung']

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Link to="/formulare" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Formulare
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Wohnungsgeberbestätigung</h1>
      <p className="text-muted-foreground mb-6">Pflichtdokument nach §19 BMG für die Anmeldung beim Einwohnermeldeamt</p>

      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-xs py-2 rounded-full ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
            {s}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Wohnungsgeber</h2>
              <p className="text-sm text-muted-foreground">
                Der Wohnungsgeber ist in der Regel der Vermieter oder Eigentümer der Wohnung.
              </p>
              <input placeholder="Name / Firma" value={data.wohnungsgeberName} onChange={(e) => update({ wohnungsgeberName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Straße Nr." value={data.wohnungsgeberStrasse} onChange={(e) => update({ wohnungsgeberStrasse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="PLZ Ort" value={data.wohnungsgeberPlzOrt} onChange={(e) => update({ wohnungsgeberPlzOrt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Wohnung</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Anschrift der Wohnung</label>
                <input value={data.wohnungAdresse} onChange={(e) => update({ wohnungAdresse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" placeholder="Musterstraße 1" />
                <input value={data.wohnungPlzOrt} onChange={(e) => update({ wohnungPlzOrt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="12345 Berlin" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Wohnfläche (m²)</label>
                  <input value={data.wohnflaeche} onChange={(e) => update({ wohnflaeche: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="65" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zimmer</label>
                  <input value={data.zimmer} onChange={(e) => update({ zimmer: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="3" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Art der Meldung</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => update({ istEinzug: true })} className={`p-3 rounded-lg border text-sm ${data.istEinzug ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <div className="font-medium">Einzug</div>
                    <div className="text-xs text-muted-foreground">Anmeldung einer Wohnung</div>
                  </button>
                  <button onClick={() => update({ istEinzug: false })} className={`p-3 rounded-lg border text-sm ${!data.istEinzug ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <div className="font-medium">Auszug</div>
                    <div className="text-xs text-muted-foreground">Abmeldung einer Wohnung</div>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{data.istEinzug ? 'Einzugsdatum' : 'Auszugsdatum'}</label>
                {data.istEinzug ? (
                  <input type="date" value={data.einzugsdatum} onChange={(e) => update({ einzugsdatum: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                ) : (
                  <input type="date" value={data.auszugsdatum} onChange={(e) => update({ auszugsdatum: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Meldepflichtige Personen</h2>
              <p className="text-sm text-muted-foreground">Alle Personen, die in die Wohnung ein- oder ausziehen.</p>
              {data.bewohner.map((b, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 p-3 bg-muted/50 rounded-lg">
                  <input placeholder="Vollständiger Name" value={b.name} onChange={(e) => updateBewohner(i, { name: e.target.value })} className="col-span-2 px-3 py-2 border rounded-lg text-sm" />
                  <input type="date" value={b.geburtsdatum} onChange={(e) => updateBewohner(i, { geburtsdatum: e.target.value })} className="col-span-2 px-3 py-2 border rounded-lg text-sm" />
                  <Button variant="outline" size="sm" onClick={() => removeBewohner(i)} disabled={data.bewohner.length <= 1} className="text-red-500">×</Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addBewohner}>+ Person hinzufügen</Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Wohnungsgeberbestätigung</h2>
              <div className="bg-white border rounded-lg p-8 text-sm leading-relaxed" id="wohnungsgeberbestaetigung-print">
                <p className="font-bold text-lg mb-6 text-center">
                  Wohnungsgeberbestätigung<br />
                  <span className="text-sm font-normal text-muted-foreground">gemäß §19 Bundesmeldegesetz (BMG)</span>
                </p>

                <div className="mb-6">
                  <p className="font-semibold mb-1">1. Name und Anschrift des Wohnungsgebers</p>
                  <p>{data.wohnungsgeberName}</p>
                  <p>{data.wohnungsgeberStrasse}, {data.wohnungsgeberPlzOrt}</p>
                </div>

                <div className="mb-6">
                  <p className="font-semibold mb-1">2. Art der Meldung</p>
                  <p>☑ {data.istEinzug ? 'Einzug' : 'Auszug'} &nbsp;&nbsp; ☐ {data.istEinzug ? 'Auszug' : 'Einzug'}</p>
                </div>

                <div className="mb-6">
                  <p className="font-semibold mb-1">3. Datum des {data.istEinzug ? 'Einzugs' : 'Auszugs'}</p>
                  <p>{data.istEinzug
                    ? (data.einzugsdatum && new Date(data.einzugsdatum).toLocaleDateString('de-DE'))
                    : (data.auszugsdatum && new Date(data.auszugsdatum).toLocaleDateString('de-DE'))
                  }</p>
                </div>

                <div className="mb-6">
                  <p className="font-semibold mb-1">4. Anschrift der Wohnung</p>
                  <p>{data.wohnungAdresse}</p>
                  <p>{data.wohnungPlzOrt}</p>
                  {data.wohnflaeche && <p>Wohnfläche: {data.wohnflaeche} m², {data.zimmer} Zimmer</p>}
                </div>

                <div className="mb-6">
                  <p className="font-semibold mb-1">5. Name der meldepflichtigen Personen</p>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Name</th>
                        <th className="text-left py-1">Geburtsdatum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bewohner.map((b, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-1">{b.name}</td>
                          <td className="py-1">{b.geburtsdatum && new Date(b.geburtsdatum).toLocaleDateString('de-DE')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-6 text-xs">
                  <strong>Hinweis:</strong> Der Wohnungsgeber ist gemäß §19 BMG verpflichtet, den {data.istEinzug ? 'Einzug' : 'Auszug'} der
                  oben genannten Person(en) zu bestätigen. Diese Bestätigung ist innerhalb von zwei Wochen nach
                  dem {data.istEinzug ? 'Einzug' : 'Auszug'} der Meldebehörde vorzulegen.
                </div>

                <p className="mb-1">{data.wohnungsgeberPlzOrt}, den {new Date(data.datum).toLocaleDateString('de-DE')}</p>
                <p className="mt-8">_________________________</p>
                <p className="text-xs text-muted-foreground">{data.wohnungsgeberName}</p>
                <p className="text-xs text-muted-foreground">Unterschrift des Wohnungsgebers</p>
              </div>
              <Button onClick={() => window.print()} className="w-full">
                <Printer className="h-4 w-4 mr-2" /> Drucken / PDF speichern
              </Button>
            </div>
          )}

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
            </Button>
            <Button onClick={() => setStep(step + 1)} disabled={step === steps.length - 1}>
              Weiter <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
