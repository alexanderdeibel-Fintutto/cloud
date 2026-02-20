import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, ArrowLeft, Plus, Trash2, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useDocumentTitle } from '@fintutto/shared'
import { useTrackTool } from '@/hooks/useTrackTool'

type DistKey = 'flaeche' | 'personen' | 'einheiten' | 'verbrauch'

interface CostItem { id: string; name: string; amount: string; distKey: DistKey; active: boolean }
interface UnitData { name: string; tenant: string; area: string; persons: string; prepayment: string }

const DIST_LABELS: Record<DistKey, string> = { flaeche: 'Nach m2', personen: 'Nach Personen', einheiten: 'Nach Einheiten', verbrauch: 'Nach Verbrauch' }

const DEFAULT_COSTS: CostItem[] = [
  { id: 'heating', name: 'Heizung', amount: '', distKey: 'flaeche', active: true },
  { id: 'hot_water', name: 'Warmwasser', amount: '', distKey: 'verbrauch', active: true },
  { id: 'cold_water', name: 'Kaltwasser/Abwasser', amount: '', distKey: 'personen', active: true },
  { id: 'garbage', name: 'Muellabfuhr', amount: '', distKey: 'einheiten', active: true },
  { id: 'electricity', name: 'Allgemeinstrom', amount: '', distKey: 'einheiten', active: true },
  { id: 'insurance', name: 'Gebaeudeversicherung', amount: '', distKey: 'flaeche', active: true },
  { id: 'property_tax', name: 'Grundsteuer', amount: '', distKey: 'flaeche', active: true },
  { id: 'janitor', name: 'Hausmeister', amount: '', distKey: 'flaeche', active: false },
  { id: 'garden', name: 'Gartenpflege', amount: '', distKey: 'flaeche', active: false },
  { id: 'elevator', name: 'Aufzug', amount: '', distKey: 'einheiten', active: false },
  { id: 'chimney', name: 'Schornsteinfeger', amount: '', distKey: 'einheiten', active: false },
]

export default function BetriebskostenFormular() {
  useDocumentTitle('Betriebskostenabrechnung', 'Fintutto Portal')
  useTrackTool('Betriebskosten')
  const [step, setStep] = useState<'building' | 'costs' | 'units' | 'result'>('building')
  const [buildingName, setBuildingName] = useState('')
  const [buildingAddress, setBuildingAddress] = useState('')
  const [periodFrom, setPeriodFrom] = useState('')
  const [periodTo, setPeriodTo] = useState('')
  const [totalArea, setTotalArea] = useState('')
  const [costs, setCosts] = useState<CostItem[]>(DEFAULT_COSTS)
  const [units, setUnits] = useState<UnitData[]>([{ name: 'Wohnung 1', tenant: '', area: '', persons: '', prepayment: '' }])

  const activeCosts = costs.filter(c => c.active)
  const totalCostsEuro = activeCosts.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
  const totalAreaNum = parseFloat(totalArea) || 1
  const totalPersons = units.reduce((s, u) => s + (parseInt(u.persons) || 0), 0) || 1
  const unitCount = units.length || 1

  const calcShare = (distKey: DistKey, amount: number, unitArea: number, unitPersons: number) => {
    switch (distKey) {
      case 'flaeche': return amount * (unitArea / totalAreaNum)
      case 'personen': return amount * (unitPersons / totalPersons)
      case 'einheiten': return amount / unitCount
      case 'verbrauch': return amount / unitCount
    }
  }

  const getUnitResult = (unit: UnitData) => {
    const area = parseFloat(unit.area) || 0
    const persons = parseInt(unit.persons) || 0
    const prepayment = parseFloat(unit.prepayment) || 0
    const share = activeCosts.reduce((s, c) => s + calcShare(c.distKey, parseFloat(c.amount) || 0, area, persons), 0)
    return { share, prepayment, result: prepayment - share }
  }

  return (
    <div>
      <section className="gradient-vermieter py-12 print:hidden">
        <div className="container">
          <Link to="/formulare" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm"><ArrowLeft className="h-4 w-4" /> Alle Formulare</Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur"><Receipt className="h-8 w-8 text-white" /></div>
            <div><h1 className="text-2xl md:text-3xl font-bold text-white">Betriebskostenabrechnung</h1><p className="text-white/80">Nebenkostenabrechnung erstellen</p></div>
          </div>
        </div>
      </section>

      <section className="py-8 print:py-0">
        <div className="container max-w-4xl">
          <div className="flex gap-2 mb-6 print:hidden">
            {([['building','1. Gebaeude'],['costs','2. Kosten'],['units','3. Einheiten'],['result','4. Ergebnis']] as const).map(([id, label]) => (
              <Button key={id} variant={step === id ? 'default' : 'outline'} size="sm" onClick={() => setStep(id)}>{label}</Button>
            ))}
          </div>

          {step === 'building' && (
            <Card>
              <CardHeader><CardTitle>Gebaeude & Abrechnungszeitraum</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Gebaeudebezeichnung</Label><Input value={buildingName} onChange={e => setBuildingName(e.target.value)} placeholder="Wohnhaus Musterstr. 1" /></div>
                  <div className="space-y-2"><Label>Adresse</Label><Input value={buildingAddress} onChange={e => setBuildingAddress(e.target.value)} placeholder="Musterstrasse 1, 10115 Berlin" /></div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2"><Label>Von *</Label><Input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Bis *</Label><Input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Gesamtflaeche (m2) *</Label><Input type="number" value={totalArea} onChange={e => setTotalArea(e.target.value)} placeholder="250" /></div>
                </div>
                <Button className="w-full" onClick={() => setStep('costs')} disabled={!periodFrom || !periodTo || !totalArea}>Weiter</Button>
              </CardContent>
            </Card>
          )}

          {step === 'costs' && (
            <Card>
              <CardHeader><CardTitle className="flex items-center justify-between"><span>Kostenarten</span><span className="text-lg font-bold text-primary">{totalCostsEuro.toFixed(2)} EUR</span></CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {costs.map((c, i) => (
                  <div key={c.id} className={`grid gap-3 items-center p-3 rounded-lg border ${c.active ? '' : 'bg-muted/50 opacity-60'}`} style={{ gridTemplateColumns: 'auto 1fr 120px 150px' }}>
                    <input type="checkbox" checked={c.active} onChange={e => setCosts(prev => prev.map((co, ci) => ci === i ? { ...co, active: e.target.checked } : co))} />
                    <span className="font-medium text-sm">{c.name}</span>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" value={c.amount} disabled={!c.active} onChange={e => setCosts(prev => prev.map((co, ci) => ci === i ? { ...co, amount: e.target.value } : co))} className="text-right" />
                    <select className="flex h-10 rounded-md border border-input bg-background px-2 py-1 text-xs" value={c.distKey} disabled={!c.active} onChange={e => setCosts(prev => prev.map((co, ci) => ci === i ? { ...co, distKey: e.target.value as DistKey } : co))}>
                      {Object.entries(DIST_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setCosts(prev => [...prev, { id: `c${Date.now()}`, name: 'Neue Kostenart', amount: '', distKey: 'einheiten', active: true }])}><Plus className="h-4 w-4 mr-2" /> Hinzufuegen</Button>
                <Button className="w-full" onClick={() => setStep('units')}>Weiter</Button>
              </CardContent>
            </Card>
          )}

          {step === 'units' && (
            <Card>
              <CardHeader><CardTitle>Mieteinheiten</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {units.map((u, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center"><h4 className="font-medium">{u.name}</h4>{units.length > 1 && <Button variant="ghost" size="icon" onClick={() => setUnits(prev => prev.filter((_, ui) => ui !== i))}><Trash2 className="h-4 w-4" /></Button>}</div>
                    <div className="grid gap-3 md:grid-cols-5">
                      <div className="space-y-1"><Label className="text-xs">Bezeichnung</Label><Input value={u.name} onChange={e => setUnits(prev => prev.map((un, ui) => ui === i ? { ...un, name: e.target.value } : un))} /></div>
                      <div className="space-y-1"><Label className="text-xs">Mieter</Label><Input value={u.tenant} onChange={e => setUnits(prev => prev.map((un, ui) => ui === i ? { ...un, tenant: e.target.value } : un))} /></div>
                      <div className="space-y-1"><Label className="text-xs">Flaeche m2</Label><Input type="number" value={u.area} onChange={e => setUnits(prev => prev.map((un, ui) => ui === i ? { ...un, area: e.target.value } : un))} /></div>
                      <div className="space-y-1"><Label className="text-xs">Personen</Label><Input type="number" value={u.persons} onChange={e => setUnits(prev => prev.map((un, ui) => ui === i ? { ...un, persons: e.target.value } : un))} /></div>
                      <div className="space-y-1"><Label className="text-xs">Vorauszahlung/J.</Label><Input type="number" value={u.prepayment} onChange={e => setUnits(prev => prev.map((un, ui) => ui === i ? { ...un, prepayment: e.target.value } : un))} /></div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setUnits(prev => [...prev, { name: `Wohnung ${prev.length + 1}`, tenant: '', area: '', persons: '', prepayment: '' }])}><Plus className="h-4 w-4 mr-2" /> Einheit</Button>
                <Button className="w-full" onClick={() => setStep('result')}>Berechnen</Button>
              </CardContent>
            </Card>
          )}

          {step === 'result' && (
            <div className="space-y-6" id="print-area">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-muted/50"><CardContent className="pt-6 text-center"><p className="text-sm text-muted-foreground">Gesamtkosten</p><p className="text-2xl font-bold">{totalCostsEuro.toFixed(2)} EUR</p></CardContent></Card>
                <Card className="border-green-200 bg-green-50"><CardContent className="pt-6 text-center"><p className="text-sm text-green-700">Guthaben</p><p className="text-2xl font-bold text-green-700">{units.filter(u => getUnitResult(u).result > 0).reduce((s, u) => s + getUnitResult(u).result, 0).toFixed(2)} EUR</p></CardContent></Card>
                <Card className="border-red-200 bg-red-50"><CardContent className="pt-6 text-center"><p className="text-sm text-red-700">Nachzahlungen</p><p className="text-2xl font-bold text-red-700">{Math.abs(units.filter(u => getUnitResult(u).result < 0).reduce((s, u) => s + getUnitResult(u).result, 0)).toFixed(2)} EUR</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Abrechnung: {buildingName || buildingAddress}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Zeitraum: {periodFrom} bis {periodTo}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b font-medium"><th className="text-left p-2">Einheit</th><th className="text-left p-2">Mieter</th><th className="text-right p-2">m2</th><th className="text-right p-2">Anteil</th><th className="text-right p-2">Vorauszahlung</th><th className="text-right p-2">Ergebnis</th></tr></thead>
                      <tbody>
                        {units.map((u, i) => { const r = getUnitResult(u); return (
                          <tr key={i} className="border-b"><td className="p-2">{u.name}</td><td className="p-2">{u.tenant || '-'}</td><td className="p-2 text-right">{u.area || '-'}</td><td className="p-2 text-right">{r.share.toFixed(2)} EUR</td><td className="p-2 text-right">{r.prepayment.toFixed(2)} EUR</td><td className={`p-2 text-right font-bold ${r.result > 0 ? 'text-green-700' : r.result < 0 ? 'text-red-700' : ''}`}>{r.result > 0 ? '+' : ''}{r.result.toFixed(2)} EUR</td></tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Kostenaufschluesselung</CardTitle></CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead><tr className="border-b font-medium"><th className="text-left p-2">Kostenart</th><th className="text-right p-2">Betrag</th><th className="text-left p-2">Schluessel</th></tr></thead>
                    <tbody>
                      {activeCosts.map(c => (<tr key={c.id} className="border-b"><td className="p-2">{c.name}</td><td className="p-2 text-right">{parseFloat(c.amount || '0').toFixed(2)} EUR</td><td className="p-2">{DIST_LABELS[c.distKey]}</td></tr>))}
                      <tr className="font-bold"><td className="p-2">Gesamt</td><td className="p-2 text-right">{totalCostsEuro.toFixed(2)} EUR</td><td></td></tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <div className="print:hidden"><Button onClick={() => window.print()} className="w-full" size="lg"><Printer className="h-4 w-4 mr-2" /> Drucken / PDF</Button></div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
