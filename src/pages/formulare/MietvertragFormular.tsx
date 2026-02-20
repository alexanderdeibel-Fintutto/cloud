import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSignature, ArrowLeft, Building2, User, Euro, FileText, CheckCircle, ChevronLeft, ChevronRight, PawPrint, Home, Wrench, Paintbrush, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

interface MietvertragData {
  objektStrasse: string
  objektHausnummer: string
  objektPlz: string
  objektOrt: string
  objektEtage: string
  objektFlaeche: string
  objektZimmer: string
  vermieterName: string
  vermieterStrasse: string
  vermieterPlz: string
  vermieterOrt: string
  mieterVorname: string
  mieterNachname: string
  mieterGeburtsdatum: string
  mieterEmail: string
  mieterTelefon: string
  mietbeginn: string
  mietende: string
  kaltmiete: string
  nebenkosten: string
  kaution: string
  zahlungstag: string
  kuendigungsfrist: string
  haustiere: boolean
  untervermietung: boolean
  kleinreparaturen: boolean
  schoenheitsreparaturen: boolean
  sondervereinbarungen: string
}

const INITIAL: MietvertragData = {
  objektStrasse: '', objektHausnummer: '', objektPlz: '', objektOrt: '',
  objektEtage: '', objektFlaeche: '', objektZimmer: '',
  vermieterName: '', vermieterStrasse: '', vermieterPlz: '', vermieterOrt: '',
  mieterVorname: '', mieterNachname: '', mieterGeburtsdatum: '', mieterEmail: '', mieterTelefon: '',
  mietbeginn: '', mietende: '', kaltmiete: '', nebenkosten: '', kaution: '',
  zahlungstag: '1', kuendigungsfrist: '3',
  haustiere: false, untervermietung: false, kleinreparaturen: true, schoenheitsreparaturen: true,
  sondervereinbarungen: '',
}

const STEPS = [
  { title: 'Mietobjekt', icon: Building2 },
  { title: 'Vermieter & Mieter', icon: User },
  { title: 'Konditionen', icon: Euro },
  { title: 'Klauseln', icon: FileText },
  { title: 'Zusammenfassung', icon: CheckCircle },
]

const CLAUSES = [
  { id: 'haustiere' as const, label: 'Haustiere erlaubt', desc: 'Der Mieter darf Haustiere in der Wohnung halten.', icon: PawPrint },
  { id: 'untervermietung' as const, label: 'Untervermietung erlaubt', desc: 'Der Mieter darf die Wohnung ganz oder teilweise untervermieten.', icon: Home },
  { id: 'kleinreparaturen' as const, label: 'Kleinreparaturklausel', desc: 'Der Mieter tragt Kosten fur Kleinreparaturen bis 100 EUR pro Fall, max. 8% der Jahresmiete.', icon: Wrench },
  { id: 'schoenheitsreparaturen' as const, label: 'Schonheitsreparaturen', desc: 'Der Mieter verpflichtet sich zu regelmaessigen Schonheitsreparaturen.', icon: Paintbrush },
]

export default function MietvertragFormular() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<MietvertragData>(INITIAL)

  const update = (field: keyof MietvertragData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const kaltmiete = parseFloat(data.kaltmiete) || 0
  const nebenkosten = parseFloat(data.nebenkosten) || 0
  const gesamtmiete = kaltmiete + nebenkosten

  const canNext = () => {
    switch (step) {
      case 0: return data.objektStrasse && data.objektPlz && data.objektOrt && data.objektFlaeche
      case 1: return data.vermieterName && data.mieterVorname && data.mieterNachname
      case 2: return data.mietbeginn && kaltmiete > 0
      case 3: return true
      case 4: return true
      default: return false
    }
  }

  const handlePrint = () => window.print()

  return (
    <div>
      <section className="gradient-vermieter py-12 print:hidden">
        <div className="container">
          <Link to="/formulare" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" /> Alle Formulare
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <FileSignature className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Mietvertrag erstellen</h1>
              <p className="text-white/80">Schritt {step + 1} von {STEPS.length}: {STEPS[step].title}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 print:py-0">
        <div className="container max-w-3xl">
          {/* Progress */}
          <div className="mb-8 print:hidden">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} className={`flex flex-col items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i < step ? 'bg-primary text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {i < step ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-1 hidden md:block ${i === step ? 'font-medium' : 'text-muted-foreground'}`}>{s.title}</span>
                    {i < STEPS.length - 1 && <div className="sr-only" />}
                  </div>
                )
              })}
            </div>
            <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
          </div>

          {/* Step 0: Mietobjekt */}
          {step === 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Angaben zum Mietobjekt</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Strasse *</Label>
                    <Input value={data.objektStrasse} onChange={e => update('objektStrasse', e.target.value)} placeholder="Musterstrasse" />
                  </div>
                  <div className="space-y-2">
                    <Label>Hausnr. *</Label>
                    <Input value={data.objektHausnummer} onChange={e => update('objektHausnummer', e.target.value)} placeholder="12a" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>PLZ *</Label>
                    <Input value={data.objektPlz} onChange={e => update('objektPlz', e.target.value)} placeholder="10115" maxLength={5} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ort *</Label>
                    <Input value={data.objektOrt} onChange={e => update('objektOrt', e.target.value)} placeholder="Berlin" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Etage</Label>
                    <Input value={data.objektEtage} onChange={e => update('objektEtage', e.target.value)} placeholder="3. OG" />
                  </div>
                  <div className="space-y-2">
                    <Label>Wohnflaeche (m2) *</Label>
                    <Input type="number" min="1" value={data.objektFlaeche} onChange={e => update('objektFlaeche', e.target.value)} placeholder="65" />
                  </div>
                  <div className="space-y-2">
                    <Label>Zimmer</Label>
                    <Input type="number" min="1" value={data.objektZimmer} onChange={e => update('objektZimmer', e.target.value)} placeholder="3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Vermieter & Mieter */}
          {step === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Vermieter</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name / Firma *</Label>
                    <Input value={data.vermieterName} onChange={e => update('vermieterName', e.target.value)} placeholder="Max Mustermann / Muster GmbH" />
                  </div>
                  <div className="space-y-2">
                    <Label>Strasse + Nr.</Label>
                    <Input value={data.vermieterStrasse} onChange={e => update('vermieterStrasse', e.target.value)} placeholder="Vermieterstrasse 1" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>PLZ</Label>
                      <Input value={data.vermieterPlz} onChange={e => update('vermieterPlz', e.target.value)} maxLength={5} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ort</Label>
                      <Input value={data.vermieterOrt} onChange={e => update('vermieterOrt', e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Mieter</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Vorname *</Label>
                      <Input value={data.mieterVorname} onChange={e => update('mieterVorname', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Nachname *</Label>
                      <Input value={data.mieterNachname} onChange={e => update('mieterNachname', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Geburtsdatum</Label>
                    <Input type="date" value={data.mieterGeburtsdatum} onChange={e => update('mieterGeburtsdatum', e.target.value)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>E-Mail</Label>
                      <Input type="email" value={data.mieterEmail} onChange={e => update('mieterEmail', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon</Label>
                      <Input type="tel" value={data.mieterTelefon} onChange={e => update('mieterTelefon', e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Konditionen */}
          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Vertragslaufzeit</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Mietbeginn *</Label>
                      <Input type="date" value={data.mietbeginn} onChange={e => update('mietbeginn', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mietende <span className="text-muted-foreground text-xs">(leer = unbefristet)</span></Label>
                      <Input type="date" value={data.mietende} onChange={e => update('mietende', e.target.value)} min={data.mietbeginn} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Kuendigungsfrist (Monate)</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.kuendigungsfrist} onChange={e => update('kuendigungsfrist', e.target.value)}>
                      <option value="1">1 Monat</option>
                      <option value="2">2 Monate</option>
                      <option value="3">3 Monate (gesetzlich)</option>
                      <option value="6">6 Monate</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Miete & Nebenkosten</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Kaltmiete (EUR) *</Label>
                      <Input type="number" min="0" step="0.01" value={data.kaltmiete} onChange={e => update('kaltmiete', e.target.value)} placeholder="750.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nebenkosten-Vorauszahlung (EUR)</Label>
                      <Input type="number" min="0" step="0.01" value={data.nebenkosten} onChange={e => update('nebenkosten', e.target.value)} placeholder="200.00" />
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg flex justify-between items-center">
                    <span className="font-medium">Gesamtmiete monatlich</span>
                    <span className="text-xl font-bold">{gesamtmiete.toFixed(2)} EUR</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Kaution (EUR)</Label>
                      <Input type="number" min="0" step="0.01" value={data.kaution} onChange={e => update('kaution', e.target.value)} placeholder={(kaltmiete * 3).toFixed(2)} />
                      <p className="text-xs text-muted-foreground">Empfohlen: 3 Kaltmieten = {(kaltmiete * 3).toFixed(2)} EUR (max. gemaess BGB)</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Zahlungstag</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.zahlungstag} onChange={e => update('zahlungstag', e.target.value)}>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>{d}. des Monats</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Klauseln */}
          {step === 3 && (
            <Card>
              <CardHeader><CardTitle>Vertragsklauseln & Sondervereinbarungen</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {CLAUSES.map(clause => {
                    const Icon = clause.icon
                    const checked = data[clause.id] as boolean
                    return (
                      <div key={clause.id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`} onClick={() => update(clause.id, !checked)}>
                        <div className="flex items-start gap-3">
                          <input type="checkbox" checked={checked} onChange={() => update(clause.id, !checked)} className="mt-1" />
                          <div>
                            <label className="cursor-pointer flex items-center gap-2 font-medium"><Icon className="h-4 w-4" />{clause.label}</label>
                            <p className="text-sm text-muted-foreground mt-1">{clause.desc}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-2">
                  <Label>Individuelle Vereinbarungen</Label>
                  <textarea className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.sondervereinbarungen} onChange={e => update('sondervereinbarungen', e.target.value)} placeholder={'z.B.:\n- Nutzung des Gartens\n- Stellplatz-Regelungen\n- Renovierungsvereinbarungen'} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Zusammenfassung */}
          {step === 4 && (
            <div className="space-y-6" id="print-area">
              <Card>
                <CardHeader><CardTitle>Mietvertrag - Zusammenfassung</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Mietobjekt</h3>
                    <p>{data.objektStrasse} {data.objektHausnummer}, {data.objektPlz} {data.objektOrt}</p>
                    <p className="text-muted-foreground">{data.objektEtage && `${data.objektEtage}, `}{data.objektFlaeche} m2{data.objektZimmer && `, ${data.objektZimmer} Zimmer`}</p>
                  </div>
                  <hr />
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-1">Vermieter</h3>
                      <p>{data.vermieterName}</p>
                      {data.vermieterStrasse && <p className="text-muted-foreground">{data.vermieterStrasse}, {data.vermieterPlz} {data.vermieterOrt}</p>}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Mieter</h3>
                      <p>{data.mieterVorname} {data.mieterNachname}</p>
                      {data.mieterGeburtsdatum && <p className="text-muted-foreground">geb. {data.mieterGeburtsdatum}</p>}
                      {data.mieterEmail && <p className="text-muted-foreground">{data.mieterEmail}</p>}
                    </div>
                  </div>
                  <hr />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Konditionen</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Mietbeginn:</span><span>{data.mietbeginn}</span>
                      <span className="text-muted-foreground">Mietende:</span><span>{data.mietende || 'Unbefristet'}</span>
                      <span className="text-muted-foreground">Kaltmiete:</span><span>{parseFloat(data.kaltmiete || '0').toFixed(2)} EUR</span>
                      <span className="text-muted-foreground">Nebenkosten:</span><span>{parseFloat(data.nebenkosten || '0').toFixed(2)} EUR</span>
                      <span className="text-muted-foreground">Gesamtmiete:</span><span className="font-bold">{gesamtmiete.toFixed(2)} EUR</span>
                      <span className="text-muted-foreground">Kaution:</span><span>{parseFloat(data.kaution || '0').toFixed(2)} EUR</span>
                      <span className="text-muted-foreground">Zahlungstag:</span><span>{data.zahlungstag}. des Monats</span>
                      <span className="text-muted-foreground">Kuendigungsfrist:</span><span>{data.kuendigungsfrist} Monate</span>
                    </div>
                  </div>
                  <hr />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Vereinbarungen</h3>
                    <ul className="space-y-1 text-sm">
                      {data.haustiere && <li>Haustiere erlaubt</li>}
                      {data.untervermietung && <li>Untervermietung erlaubt</li>}
                      {data.kleinreparaturen && <li>Kleinreparaturklausel (bis 100 EUR/Fall, max. 8% Jahresmiete)</li>}
                      {data.schoenheitsreparaturen && <li>Schoenheitsreparaturen durch Mieter</li>}
                      {!data.haustiere && !data.untervermietung && !data.kleinreparaturen && !data.schoenheitsreparaturen && <li className="text-muted-foreground">Keine besonderen Klauseln</li>}
                    </ul>
                    {data.sondervereinbarungen && (
                      <div className="mt-3 p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">{data.sondervereinbarungen}</div>
                    )}
                  </div>
                  <hr />
                  <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-8">Ort, Datum</p>
                      <div className="border-t border-foreground pt-2 text-sm">Unterschrift Vermieter</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-8">Ort, Datum</p>
                      <div className="border-t border-foreground pt-2 text-sm">Unterschrift Mieter</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="print:hidden">
                <Button onClick={handlePrint} className="w-full" size="lg">
                  <Printer className="h-4 w-4 mr-2" /> Mietvertrag drucken / als PDF speichern
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 print:hidden">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Zurueck
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                Weiter <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
