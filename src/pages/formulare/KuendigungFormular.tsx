import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'

type KuendigungsTyp = 'ordentlich' | 'ausserordentlich'
type Absender = 'mieter' | 'vermieter'

interface FormData {
  absender: Absender
  typ: KuendigungsTyp
  absenderName: string
  absenderStrasse: string
  absenderPlzOrt: string
  empfaengerName: string
  empfaengerStrasse: string
  empfaengerPlzOrt: string
  mietobjektAdresse: string
  mietbeginn: string
  kuendigungsdatum: string
  auszugsdatum: string
  grund: string
  fristlos: boolean
  sondergrund: string
}

const SONDERGRUENDE_MIETER = [
  'Gesundheitsgefährdung (§569 Abs. 1 BGB)',
  'Erheblicher Mangel trotz Fristsetzung nicht behoben (§543 Abs. 2 BGB)',
  'Unzumutbare Belästigung durch Vermieter',
  'Vertragswidriger Gebrauch durch Vermieter',
]

const SONDERGRUENDE_VERMIETER = [
  'Eigenbedarf (§573 Abs. 2 Nr. 2 BGB)',
  'Erhebliche Vertragsverletzung (§543 BGB)',
  'Zahlungsverzug von 2+ Monatsmieten (§543 Abs. 2 Nr. 3 BGB)',
  'Wirtschaftliche Verwertung (§573 Abs. 2 Nr. 3 BGB)',
  'Unerlaubte Untervermietung',
  'Störung des Hausfriedens',
]

const initialData: FormData = {
  absender: 'mieter',
  typ: 'ordentlich',
  absenderName: '',
  absenderStrasse: '',
  absenderPlzOrt: '',
  empfaengerName: '',
  empfaengerStrasse: '',
  empfaengerPlzOrt: '',
  mietobjektAdresse: '',
  mietbeginn: '',
  kuendigungsdatum: new Date().toISOString().split('T')[0],
  auszugsdatum: '',
  grund: '',
  fristlos: false,
  sondergrund: '',
}

export default function KuendigungFormular() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(initialData)

  const update = (fields: Partial<FormData>) => setData((d) => ({ ...d, ...fields }))

  const kuendigungsfrist = data.absender === 'mieter' ? '3 Monate' :
    data.typ === 'ausserordentlich' ? 'fristlos' : '3-9 Monate (je nach Mietdauer)'

  const steps = ['Parteien', 'Mietobjekt', 'Kündigung', 'Schreiben']

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Link to="/formulare" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Formulare
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Kündigungsschreiben</h1>
      <p className="text-muted-foreground mb-6">Rechtssicheres Kündigungsschreiben für Mietverträge nach §573/§543 BGB</p>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-xs py-2 rounded-full ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
            {s}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step 0: Parteien */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Wer kündigt?</h2>
              <div className="grid grid-cols-2 gap-3">
                {(['mieter', 'vermieter'] as Absender[]).map((a) => (
                  <button key={a} onClick={() => update({ absender: a })} className={`p-4 rounded-lg border text-center ${data.absender === a ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <span className="text-2xl">{a === 'mieter' ? '🔑' : '🏠'}</span>
                    <div className="font-medium capitalize mt-1">{a}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kündigungsart</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => update({ typ: 'ordentlich' })} className={`p-3 rounded-lg border text-sm ${data.typ === 'ordentlich' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <div className="font-medium">Ordentlich</div>
                    <div className="text-xs text-muted-foreground">Mit gesetzlicher Frist</div>
                  </button>
                  <button onClick={() => update({ typ: 'ausserordentlich' })} className={`p-3 rounded-lg border text-sm ${data.typ === 'ausserordentlich' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <div className="font-medium">Außerordentlich</div>
                    <div className="text-xs text-muted-foreground">Aus wichtigem Grund</div>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Absender ({data.absender === 'mieter' ? 'Mieter' : 'Vermieter'})</h3>
                  <input placeholder="Name" value={data.absenderName} onChange={(e) => update({ absenderName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="Straße Nr." value={data.absenderStrasse} onChange={(e) => update({ absenderStrasse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="PLZ Ort" value={data.absenderPlzOrt} onChange={(e) => update({ absenderPlzOrt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Empfänger ({data.absender === 'mieter' ? 'Vermieter' : 'Mieter'})</h3>
                  <input placeholder="Name" value={data.empfaengerName} onChange={(e) => update({ empfaengerName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="Straße Nr." value={data.empfaengerStrasse} onChange={(e) => update({ empfaengerStrasse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="PLZ Ort" value={data.empfaengerPlzOrt} onChange={(e) => update({ empfaengerPlzOrt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Mietobjekt */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Mietobjekt</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Adresse des Mietobjekts</label>
                <input value={data.mietobjektAdresse} onChange={(e) => update({ mietobjektAdresse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Musterstraße 1, 12345 Berlin" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mietbeginn</label>
                <input type="date" value={data.mietbeginn} onChange={(e) => update({ mietbeginn: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
          )}

          {/* Step 2: Kündigung */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Kündigungsdetails</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Kündigungsdatum</label>
                <input type="date" value={data.kuendigungsdatum} onChange={(e) => update({ kuendigungsdatum: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gewünschter Auszug zum</label>
                <input type="date" value={data.auszugsdatum} onChange={(e) => update({ auszugsdatum: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <strong>Kündigungsfrist:</strong> {kuendigungsfrist}
              </div>

              {data.typ === 'ausserordentlich' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Grund der außerordentlichen Kündigung</label>
                  <div className="space-y-2">
                    {(data.absender === 'mieter' ? SONDERGRUENDE_MIETER : SONDERGRUENDE_VERMIETER).map((g) => (
                      <label key={g} className="flex items-start gap-2 text-sm">
                        <input type="radio" name="sondergrund" checked={data.sondergrund === g} onChange={() => update({ sondergrund: g })} className="mt-1" />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {data.typ === 'ordentlich' && data.absender === 'vermieter' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Begründung (bei Vermieter-Kündigung Pflicht)</label>
                  <select value={data.sondergrund} onChange={(e) => update({ sondergrund: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">-- Bitte wählen --</option>
                    {SONDERGRUENDE_VERMIETER.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Zusätzliche Anmerkungen</label>
                <textarea value={data.grund} onChange={(e) => update({ grund: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optionale zusätzliche Bemerkungen..." />
              </div>
            </div>
          )}

          {/* Step 3: Schreiben */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Kündigungsschreiben</h2>
              <div className="bg-white border rounded-lg p-8 text-sm leading-relaxed print:border-0 print:p-0" id="kuendigung-print">
                <div className="mb-8">
                  <p className="font-semibold">{data.absenderName}</p>
                  <p>{data.absenderStrasse}</p>
                  <p>{data.absenderPlzOrt}</p>
                </div>
                <div className="mb-8">
                  <p>{data.empfaengerName}</p>
                  <p>{data.empfaengerStrasse}</p>
                  <p>{data.empfaengerPlzOrt}</p>
                </div>
                <p className="text-right mb-8">{data.kuendigungsdatum && new Date(data.kuendigungsdatum).toLocaleDateString('de-DE')}</p>
                <p className="font-bold mb-4">
                  {data.typ === 'ordentlich' ? 'Ordentliche Kündigung' : 'Außerordentliche Kündigung'} des Mietvertrags
                </p>
                <p className="mb-2">Sehr {data.absender === 'mieter' ? 'geehrter Vermieter' : 'geehrter Mieter'},</p>
                <p className="mb-2">
                  hiermit kündige ich das Mietverhältnis über die Wohnung in <strong>{data.mietobjektAdresse}</strong>,
                  bestehend seit dem {data.mietbeginn && new Date(data.mietbeginn).toLocaleDateString('de-DE')},
                  {data.typ === 'ordentlich'
                    ? ` ordentlich und fristgerecht zum ${data.auszugsdatum ? new Date(data.auszugsdatum).toLocaleDateString('de-DE') : '___________'}, hilfsweise zum nächstmöglichen Termin.`
                    : ` außerordentlich und fristlos aus wichtigem Grund.`
                  }
                </p>
                {data.sondergrund && <p className="mb-2"><strong>Begründung:</strong> {data.sondergrund}</p>}
                {data.grund && <p className="mb-2">{data.grund}</p>}
                <p className="mb-2">
                  Ich bitte um eine schriftliche Bestätigung der Kündigung und des Beendigungszeitpunkts.
                </p>
                {data.absender === 'mieter' && (
                  <p className="mb-2">
                    Ich bitte um Vereinbarung eines Termins zur Wohnungsübergabe und Rückgabe der Schlüssel
                    sowie um fristgerechte Rückzahlung der Kaution.
                  </p>
                )}
                <p className="mt-8">Mit freundlichen Grüßen</p>
                <p className="mt-8">_________________________</p>
                <p className="text-xs text-muted-foreground">{data.absenderName}</p>
              </div>

              <Button onClick={() => window.print()} className="w-full">
                <Printer className="h-4 w-4 mr-2" /> Drucken / PDF speichern
              </Button>
            </div>
          )}

          {/* Navigation */}
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
