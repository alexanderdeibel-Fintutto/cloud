import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, ArrowLeft, Printer, ChevronLeft, ChevronRight, User, Briefcase, Home, Shield, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Progress } from '../../components/ui/progress'
import { useDocumentTitle, useMetaTags, useJsonLd, useKeyboardNav, useUnsavedChanges } from '@fintutto/shared'
import { toast } from 'sonner'
import { useTrackTool } from '@/hooks/useTrackTool'

interface SelbstauskunftData {
  anrede: string; vorname: string; nachname: string; geburtsdatum: string; geburtsort: string; staatsangehoerigkeit: string
  strasse: string; plz: string; ort: string; telefon: string; email: string
  beruf: string; arbeitgeber: string; arbeitsSeit: string; nettoEinkommen: string; weitereEinkommen: string
  anzahlPersonen: string; haustiere: string; raucher: string; musikinstrumente: string; einzugsdatum: string
  vorherigerVermieter: string; vorherigeAdresse: string; mietdauer: string; kuendigungsgrund: string
  mietschuldenFrei: boolean; insolvenz: boolean; eidesstattlich: boolean; raeumungsklage: boolean
  anmerkungen: string; datenschutz: boolean
}

const INITIAL: SelbstauskunftData = {
  anrede: '', vorname: '', nachname: '', geburtsdatum: '', geburtsort: '', staatsangehoerigkeit: 'deutsch',
  strasse: '', plz: '', ort: '', telefon: '', email: '',
  beruf: '', arbeitgeber: '', arbeitsSeit: '', nettoEinkommen: '', weitereEinkommen: '',
  anzahlPersonen: '1', haustiere: 'nein', raucher: 'nein', musikinstrumente: 'nein', einzugsdatum: '',
  vorherigerVermieter: '', vorherigeAdresse: '', mietdauer: '', kuendigungsgrund: '',
  mietschuldenFrei: true, insolvenz: false, eidesstattlich: false, raeumungsklage: false,
  anmerkungen: '', datenschutz: false,
}

const STEPS = [
  { title: 'Person', icon: User },
  { title: 'Beruf', icon: Briefcase },
  { title: 'Wohnung', icon: Home },
  { title: 'Erklaerungen', icon: Shield },
  { title: 'Fertig', icon: CheckCircle },
]

export default function SelbstauskunftFormular() {
  useDocumentTitle('Selbstauskunft', 'Fintutto Portal')
  useTrackTool('Selbstauskunft')
  useMetaTags({
    title: 'Mieterselbstauskunft erstellen – DSGVO-konform',
    description: 'DSGVO-konforme Mieterselbstauskunft für Wohnungsinteressenten. Mit Einkommensnachweis und Schufa-Klausel.',
    path: '/formulare/selbstauskunft',
  })
  useJsonLd({
    type: 'WebApplication',
    name: 'Selbstauskunft-Generator',
    description: 'Erstelle eine DSGVO-konforme Mieterselbstauskunft',
    url: 'https://portal.fintutto.cloud/formulare/selbstauskunft',
    offers: { price: '0', priceCurrency: 'EUR' },
  })
  const navigate = useNavigate()
  useKeyboardNav({ onEscape: () => navigate('/formulare') })
  const { setDirty } = useUnsavedChanges()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<SelbstauskunftData>(INITIAL)
  const update = (field: keyof SelbstauskunftData, value: string | boolean) => { setData(prev => ({ ...prev, [field]: value })); setDirty() }
  const canNext = () => { switch (step) { case 0: return data.vorname && data.nachname && data.geburtsdatum; case 1: return data.beruf && data.nettoEinkommen; case 2: return true; case 3: return data.datenschutz; default: return true } }

  return (
    <div>
      <section className="gradient-vermieter py-12 print:hidden">
        <div className="container">
          <Link to="/formulare" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm"><ArrowLeft className="h-4 w-4" /> Alle Formulare</Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur"><Users className="h-8 w-8 text-white" /></div>
            <div><h1 className="text-2xl md:text-3xl font-bold text-white">Mieterselbstauskunft</h1><p className="text-white/80">Schritt {step + 1}/{STEPS.length}: {STEPS[step].title}</p></div>
          </div>
        </div>
      </section>
      <section className="py-8 print:py-0">
        <div className="container max-w-3xl">
          <div className="mb-8 print:hidden"><Progress value={((step + 1) / STEPS.length) * 100} className="h-2" /></div>

          {step === 0 && (
            <Card><CardHeader><CardTitle>Persoenliche Daten</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="space-y-2"><Label>Anrede</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.anrede} onChange={e => update('anrede', e.target.value)}><option value="">---</option><option value="herr">Herr</option><option value="frau">Frau</option><option value="divers">Divers</option></select></div>
              <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Vorname *</Label><Input value={data.vorname} onChange={e => update('vorname', e.target.value)} /></div><div className="space-y-2"><Label>Nachname *</Label><Input value={data.nachname} onChange={e => update('nachname', e.target.value)} /></div></div>
              <div className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><Label>Geburtsdatum *</Label><Input type="date" value={data.geburtsdatum} onChange={e => update('geburtsdatum', e.target.value)} /></div><div className="space-y-2"><Label>Geburtsort</Label><Input value={data.geburtsort} onChange={e => update('geburtsort', e.target.value)} /></div><div className="space-y-2"><Label>Staatsangeh.</Label><Input value={data.staatsangehoerigkeit} onChange={e => update('staatsangehoerigkeit', e.target.value)} /></div></div>
              <hr /><h3 className="font-semibold">Aktuelle Adresse</h3>
              <div className="space-y-2"><Label>Strasse + Nr.</Label><Input value={data.strasse} onChange={e => update('strasse', e.target.value)} /></div>
              <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>PLZ</Label><Input value={data.plz} onChange={e => update('plz', e.target.value)} maxLength={5} /></div><div className="space-y-2"><Label>Ort</Label><Input value={data.ort} onChange={e => update('ort', e.target.value)} /></div></div>
              <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Telefon</Label><Input type="tel" value={data.telefon} onChange={e => update('telefon', e.target.value)} /></div><div className="space-y-2"><Label>E-Mail</Label><Input type="email" value={data.email} onChange={e => update('email', e.target.value)} /></div></div>
            </CardContent></Card>
          )}

          {step === 1 && (
            <Card><CardHeader><CardTitle>Beruf & Einkommen</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Beruf *</Label><Input value={data.beruf} onChange={e => update('beruf', e.target.value)} /></div><div className="space-y-2"><Label>Arbeitgeber</Label><Input value={data.arbeitgeber} onChange={e => update('arbeitgeber', e.target.value)} /></div></div>
              <div className="space-y-2"><Label>Beschaeftigt seit</Label><Input type="date" value={data.arbeitsSeit} onChange={e => update('arbeitsSeit', e.target.value)} /></div>
              <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Nettoeinkommen (EUR/Monat) *</Label><Input type="number" min="0" value={data.nettoEinkommen} onChange={e => update('nettoEinkommen', e.target.value)} /></div><div className="space-y-2"><Label>Weitere Einkuenfte (EUR)</Label><Input type="number" min="0" value={data.weitereEinkommen} onChange={e => update('weitereEinkommen', e.target.value)} /><p className="text-xs text-muted-foreground">Kindergeld, Unterhalt, Rente etc.</p></div></div>
            </CardContent></Card>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Card><CardHeader><CardTitle>Geplante Wohnsituation</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Anzahl Personen</Label><Input type="number" min="1" value={data.anzahlPersonen} onChange={e => update('anzahlPersonen', e.target.value)} /></div><div className="space-y-2"><Label>Einzugsdatum</Label><Input type="date" value={data.einzugsdatum} onChange={e => update('einzugsdatum', e.target.value)} /></div></div>
                <div className="grid gap-4 md:grid-cols-3">
                  {([['haustiere','Haustiere',['nein','Katze','Hund','Sonstige']],['raucher','Raucher',['nein','Ja']],['musikinstrumente','Musikinstrumente',['nein','Ja']]] as const).map(([id, label, opts]) => (
                    <div key={id} className="space-y-2"><Label>{label}</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data[id]} onChange={e => update(id, e.target.value)}>{opts.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}</select></div>
                  ))}
                </div>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Vorheriges Mietverhaeltnis</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Vorh. Vermieter</Label><Input value={data.vorherigerVermieter} onChange={e => update('vorherigerVermieter', e.target.value)} /></div><div className="space-y-2"><Label>Vorh. Adresse</Label><Input value={data.vorherigeAdresse} onChange={e => update('vorherigeAdresse', e.target.value)} /></div></div>
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Mietdauer</Label><Input value={data.mietdauer} onChange={e => update('mietdauer', e.target.value)} placeholder="z.B. 3 Jahre" /></div><div className="space-y-2"><Label>Kuendigungsgrund</Label><Input value={data.kuendigungsgrund} onChange={e => update('kuendigungsgrund', e.target.value)} /></div></div>
              </CardContent></Card>
            </div>
          )}

          {step === 3 && (
            <Card><CardHeader><CardTitle>Erklaerungen</CardTitle></CardHeader><CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Bitte wahrheitsgemaess beantworten. Falsche Angaben koennen zur Anfechtung fuehren.</p>
              {([['mietschuldenFrei','Frei von Mietschulden',true],['insolvenz','Insolvenzverfahren laeuft',false],['eidesstattlich','Eidesstattliche Versicherung abgegeben',false],['raeumungsklage','Raeumungsklage laeuft',false]] as const).map(([id, label, good]) => (
                <div key={id} className={`p-4 border rounded-lg cursor-pointer ${data[id] ? (good ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : ''}`} onClick={() => update(id, !data[id])}>
                  <div className="flex items-center gap-3"><input type="checkbox" checked={data[id] as boolean} onChange={() => update(id, !data[id])} /><span className="text-sm">{label}</span></div>
                </div>
              ))}
              <div className="space-y-2"><Label>Anmerkungen</Label><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.anmerkungen} onChange={e => update('anmerkungen', e.target.value)} /></div>
              <div className={`p-4 border-2 rounded-lg cursor-pointer ${data.datenschutz ? 'border-primary bg-primary/5' : 'border-dashed'}`} onClick={() => update('datenschutz', !data.datenschutz)}>
                <div className="flex items-start gap-3"><input type="checkbox" checked={data.datenschutz} onChange={() => update('datenschutz', !data.datenschutz)} className="mt-1" /><div className="text-sm"><p className="font-medium">Datenschutzerklaerung *</p><p className="text-muted-foreground">Ich willige ein, dass meine Daten zum Zweck der Wohnungsbewerbung verarbeitet werden.</p></div></div>
              </div>
            </CardContent></Card>
          )}

          {step === 4 && (
            <div className="space-y-6" id="print-area">
              <Card><CardHeader><CardTitle>Mieterselbstauskunft</CardTitle></CardHeader><CardContent className="space-y-6">
                <div><h3 className="font-semibold mb-2">Person</h3><div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span><span>{data.vorname} {data.nachname}</span>
                  <span className="text-muted-foreground">Geb.:</span><span>{data.geburtsdatum}{data.geburtsort && ` in ${data.geburtsort}`}</span>
                  {data.strasse && <><span className="text-muted-foreground">Adresse:</span><span>{data.strasse}, {data.plz} {data.ort}</span></>}
                  {data.telefon && <><span className="text-muted-foreground">Tel:</span><span>{data.telefon}</span></>}
                  {data.email && <><span className="text-muted-foreground">E-Mail:</span><span>{data.email}</span></>}
                </div></div>
                <hr />
                <div><h3 className="font-semibold mb-2">Beruf & Einkommen</h3><div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Beruf:</span><span>{data.beruf}</span>
                  {data.arbeitgeber && <><span className="text-muted-foreground">Arbeitgeber:</span><span>{data.arbeitgeber}</span></>}
                  <span className="text-muted-foreground">Netto:</span><span>{data.nettoEinkommen} EUR/Monat</span>
                </div></div>
                <hr />
                <div><h3 className="font-semibold mb-2">Wohnsituation</h3><div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Personen:</span><span>{data.anzahlPersonen}</span>
                  <span className="text-muted-foreground">Haustiere:</span><span>{data.haustiere}</span>
                  <span className="text-muted-foreground">Raucher:</span><span>{data.raucher}</span>
                </div></div>
                <hr />
                <div><h3 className="font-semibold mb-2">Erklaerungen</h3><ul className="text-sm space-y-1">
                  <li>{data.mietschuldenFrei ? 'Frei von Mietschulden' : 'Mietschulden vorhanden'}</li>
                  <li>{data.insolvenz ? 'Insolvenzverfahren' : 'Kein Insolvenzverfahren'}</li>
                  <li>{data.eidesstattlich ? 'Eidesstattl. Versicherung' : 'Keine eidesstattl. Versicherung'}</li>
                  <li>{data.raeumungsklage ? 'Raeumungsklage' : 'Keine Raeumungsklage'}</li>
                </ul></div>
                <hr />
                <div className="pt-4"><p className="text-xs text-muted-foreground mb-8">Ich versichere wahrheitsgemaesse Angaben.</p>
                  <div><p className="text-sm text-muted-foreground mb-8">Ort, Datum</p><div className="border-t border-foreground pt-2 text-sm w-64">Unterschrift</div></div>
                </div>
              </CardContent></Card>
              <div className="print:hidden"><Button onClick={() => window.print()} className="w-full" size="lg"><Printer className="h-4 w-4 mr-2" /> Drucken / PDF</Button></div>
            </div>
          )}

          <div className="flex justify-between mt-8 print:hidden">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}><ChevronLeft className="h-4 w-4 mr-2" /> Zurueck</Button>
            {step < 4 ? <Button onClick={() => { setStep(s => s + 1); if (step === 3) toast.success('Dokument erstellt') }} disabled={!canNext()}>Weiter <ChevronRight className="h-4 w-4 ml-2" /></Button> : null}
          </div>
        </div>
      </section>
    </div>
  )
}
