import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ArrowLeft, Printer, AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

type Begruendung = 'mietspiegel' | 'gutachten' | 'vergleichswohnungen' | 'modernisierung'

const BEGRUENDUNGEN: { id: Begruendung; label: string; desc: string }[] = [
  { id: 'mietspiegel', label: 'Mietspiegel', desc: 'Bezugnahme auf den qualifizierten oder einfachen Mietspiegel der Gemeinde' },
  { id: 'gutachten', label: 'Sachverstaendigengutachten', desc: 'Gutachten eines oeffentlich bestellten Sachverstaendigen' },
  { id: 'vergleichswohnungen', label: 'Vergleichswohnungen', desc: 'Benennung von mind. 3 vergleichbaren Wohnungen' },
  { id: 'modernisierung', label: 'Modernisierung', desc: 'Umlage von Modernisierungskosten (max. 8% p.a., Paragraph 559 BGB)' },
]

export default function MieterhoehungFormular() {
  const [step, setStep] = useState<'input' | 'result' | 'letter'>('input')
  const [vermieterName, setVermieterName] = useState('')
  const [vermieterAdresse, setVermieterAdresse] = useState('')
  const [mieterName, setMieterName] = useState('')
  const [mieterAdresse, setMieterAdresse] = useState('')
  const [aktuelleKaltmiete, setAktuelleKaltmiete] = useState('')
  const [vergleichsmiete, setVergleichsmiete] = useState('')
  const [erhoehungDamals, setErhoehungDamals] = useState('')
  const [begruendung, setBegruendung] = useState<Begruendung>('mietspiegel')
  const [mietspiegelJahr, setMietspiegelJahr] = useState('')
  const [angespannt, setAngespannt] = useState(true)
  const [stichtag, setStichtag] = useState('')

  const aktuell = parseFloat(aktuelleKaltmiete) || 0
  const vergleich = parseFloat(vergleichsmiete) || 0
  const damals = parseFloat(erhoehungDamals) || 0
  const kappungsgrenze = angespannt ? 15 : 20

  const result = useMemo(() => {
    if (!aktuell || !vergleich) return null
    const gewuenscht = vergleich - aktuell
    const gewuenschtProzent = aktuell > 0 ? (gewuenscht / aktuell) * 100 : 0
    const verbleibendeKappung = Math.max(0, kappungsgrenze - damals)
    const maxProzent = Math.min(gewuenschtProzent, verbleibendeKappung)
    const maxEuro = aktuell * (maxProzent / 100)
    const neueMiete = aktuell + maxEuro
    return { gewuenscht, gewuenschtProzent, verbleibendeKappung, maxProzent, maxEuro, neueMiete, gekappt: maxProzent < gewuenschtProzent }
  }, [aktuell, vergleich, damals, kappungsgrenze])

  const heute = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div>
      <section className="gradient-vermieter py-12 print:hidden">
        <div className="container">
          <Link to="/formulare" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm"><ArrowLeft className="h-4 w-4" /> Alle Formulare</Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur"><TrendingUp className="h-8 w-8 text-white" /></div>
            <div><h1 className="text-2xl md:text-3xl font-bold text-white">Mieterhoehungsschreiben</h1><p className="text-white/80">Paragraph 558 BGB</p></div>
          </div>
        </div>
      </section>
      <section className="py-8 print:py-0">
        <div className="container max-w-3xl">
          <div className="flex gap-2 mb-6 print:hidden">
            {([['input','1. Daten'],['result','2. Berechnung'],['letter','3. Schreiben']] as const).map(([id, label]) => (
              <Button key={id} variant={step === id ? 'default' : 'outline'} size="sm" onClick={() => setStep(id)}>{label}</Button>
            ))}
          </div>

          {step === 'input' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm"><p className="font-semibold text-blue-800">Paragraph 558 BGB - Vergleichsmiete</p><p className="text-blue-700 mt-1">Kappungsgrenze: Angespannter Markt max. 15%, sonst 20% in 3 Jahren.</p></div>
              </div>
              <Card><CardHeader><CardTitle>Parteien</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Vermieter *</Label><Input value={vermieterName} onChange={e => setVermieterName(e.target.value)} /></div><div className="space-y-2"><Label>Vermieter Adresse</Label><Input value={vermieterAdresse} onChange={e => setVermieterAdresse(e.target.value)} /></div></div>
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Mieter *</Label><Input value={mieterName} onChange={e => setMieterName(e.target.value)} /></div><div className="space-y-2"><Label>Mietobjekt *</Label><Input value={mieterAdresse} onChange={e => setMieterAdresse(e.target.value)} /></div></div>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Mietdaten</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Aktuelle Kaltmiete (EUR) *</Label><Input type="number" min="0" step="0.01" value={aktuelleKaltmiete} onChange={e => setAktuelleKaltmiete(e.target.value)} placeholder="750" /></div>
                  <div className="space-y-2"><Label>Vergleichsmiete (EUR) *</Label><Input type="number" min="0" step="0.01" value={vergleichsmiete} onChange={e => setVergleichsmiete(e.target.value)} placeholder="850" /><p className="text-xs text-muted-foreground">Laut Mietspiegel oder Gutachten</p></div>
                </div>
                <div className="space-y-2"><Label>Bisherige Erhoehung in 3 Jahren (%)</Label><Input type="number" min="0" max="100" step="0.1" value={erhoehungDamals} onChange={e => setErhoehungDamals(e.target.value)} placeholder="0" /></div>
                <div className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer" onClick={() => setAngespannt(!angespannt)}>
                  <input type="checkbox" checked={angespannt} onChange={() => setAngespannt(!angespannt)} />
                  <div><p className="font-medium text-sm">Angespannter Wohnungsmarkt</p><p className="text-xs text-muted-foreground">Kappungsgrenze: {angespannt ? '15%' : '20%'}</p></div>
                </div>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Begruendung & Stichtag</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {BEGRUENDUNGEN.map(b => (
                    <div key={b.id} className={`p-4 border rounded-lg cursor-pointer ${begruendung === b.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`} onClick={() => setBegruendung(b.id)}>
                      <p className="font-medium text-sm">{b.label}</p><p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
                    </div>
                  ))}
                </div>
                {begruendung === 'mietspiegel' && <div className="space-y-2"><Label>Mietspiegel Jahr</Label><Input value={mietspiegelJahr} onChange={e => setMietspiegelJahr(e.target.value)} placeholder="2024" /></div>}
                <div className="space-y-2"><Label>Stichtag</Label><Input type="date" value={stichtag} onChange={e => setStichtag(e.target.value)} /><p className="text-xs text-muted-foreground">Zustimmungsfrist: 2 Monate (Paragraph 558b BGB)</p></div>
                <Button className="w-full" onClick={() => setStep('result')} disabled={!aktuell || !vergleich}>Berechnen</Button>
              </CardContent></Card>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-6">
              {result.gekappt && <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3"><AlertTriangle className="h-5 w-5 text-yellow-600" /><div className="text-sm"><p className="font-semibold text-yellow-800">Kappungsgrenze greift!</p><p className="text-yellow-700">Gewuenscht: {result.gewuenschtProzent.toFixed(1)}%, maximal moeglich: {result.verbleibendeKappung.toFixed(1)}%</p></div></div>}
              <div className="grid gap-4 md:grid-cols-4">
                <Card><CardContent className="pt-6 text-center"><p className="text-xs text-muted-foreground">Aktuell</p><p className="text-xl font-bold">{aktuell.toFixed(2)} EUR</p></CardContent></Card>
                <Card className="border-green-200 bg-green-50"><CardContent className="pt-6 text-center"><p className="text-xs text-green-700">Neue Miete</p><p className="text-xl font-bold text-green-700">{result.neueMiete.toFixed(2)} EUR</p></CardContent></Card>
                <Card><CardContent className="pt-6 text-center"><p className="text-xs text-muted-foreground">Erhoehung</p><p className="text-xl font-bold">+{result.maxEuro.toFixed(2)} EUR</p></CardContent></Card>
                <Card><CardContent className="pt-6 text-center"><p className="text-xs text-muted-foreground">Prozent</p><p className="text-xl font-bold">+{result.maxProzent.toFixed(1)}%</p></CardContent></Card>
              </div>
              <Card><CardHeader><CardTitle>Details</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Kaltmiete:</span><span>{aktuell.toFixed(2)} EUR</span>
                <span className="text-muted-foreground">Vergleichsmiete:</span><span>{vergleich.toFixed(2)} EUR</span>
                <span className="text-muted-foreground">Kappungsgrenze:</span><span>{kappungsgrenze}%</span>
                <span className="text-muted-foreground">Bereits genutzt:</span><span>{damals.toFixed(1)}%</span>
                <span className="text-muted-foreground">Verbleibend:</span><span>{result.verbleibendeKappung.toFixed(1)}%</span>
                <span className="text-muted-foreground font-semibold">Zulaessig:</span><span className="font-bold">{result.maxEuro.toFixed(2)} EUR ({result.maxProzent.toFixed(1)}%)</span>
                <span className="text-muted-foreground font-semibold">Neue Miete:</span><span className="font-bold text-green-700">{result.neueMiete.toFixed(2)} EUR</span>
              </div></CardContent></Card>
              <Button className="w-full" onClick={() => setStep('letter')}>Schreiben erstellen</Button>
            </div>
          )}

          {step === 'letter' && result && (
            <div className="space-y-6" id="print-area">
              <Card><CardContent className="py-8 space-y-6 text-sm leading-relaxed">
                <div className="text-right text-muted-foreground">{vermieterAdresse || vermieterName}<br />{heute}</div>
                <div>{mieterName}<br />{mieterAdresse}</div>
                <h2 className="text-lg font-bold">Mieterhoehungsverlangen gemaess Paragraph 558 BGB</h2>
                <p>Sehr geehrte/r {mieterName},</p>
                <p>hiermit mache ich von meinem Recht Gebrauch, die Miete fuer die Wohnung in {mieterAdresse} an die ortsuebliche Vergleichsmiete anzupassen.</p>
                <p>Die monatliche Kaltmiete betraegt derzeit <strong>{aktuell.toFixed(2)} EUR</strong>. Gemaess {begruendung === 'mietspiegel' ? `dem Mietspiegel${mietspiegelJahr ? ` ${mietspiegelJahr}` : ''}` : begruendung === 'gutachten' ? 'einem Sachverstaendigengutachten' : begruendung === 'vergleichswohnungen' ? 'Vergleichswohnungen' : 'der Modernisierungsmassnahme'} liegt die ortsuebliche Vergleichsmiete bei <strong>{vergleich.toFixed(2)} EUR</strong>.</p>
                <p>Unter Beruecksichtigung der Kappungsgrenze von {kappungsgrenze}% ergibt sich eine zulaessige Erhoehung um <strong>{result.maxEuro.toFixed(2)} EUR</strong> ({result.maxProzent.toFixed(1)}%).</p>
                <p>Ich bitte um Zustimmung zur Erhoehung auf</p>
                <div className="text-center py-4"><p className="text-2xl font-bold">{result.neueMiete.toFixed(2)} EUR</p><p className="text-muted-foreground">(bisher: {aktuell.toFixed(2)} EUR)</p></div>
                <p>{stichtag ? `Die neue Miete gilt ab dem ${new Date(stichtag).toLocaleDateString('de-DE')}.` : 'Die neue Miete gilt ab dem dritten Kalendermonat nach Zugang.'}</p>
                <p>Gemaess Paragraph 558b BGB bitte ich um Zustimmung innerhalb von <strong>zwei Monaten</strong>.</p>
                <p>Mit freundlichen Gruessen</p>
                <div className="pt-8"><div className="border-t border-foreground pt-2 w-64">{vermieterName}</div></div>
              </CardContent></Card>
              <div className="print:hidden"><Button onClick={() => window.print()} className="w-full" size="lg"><Printer className="h-4 w-4 mr-2" /> Drucken / PDF</Button></div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
