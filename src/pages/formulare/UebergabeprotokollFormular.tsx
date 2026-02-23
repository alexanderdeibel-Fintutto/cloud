import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, ArrowLeft, Home, Gauge, Key, CheckCircle, AlertTriangle, Printer, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ItemStatus = 'pending' | 'ok' | 'defect'

interface RoomItem { name: string; status: ItemStatus; note: string }
interface Room { name: string; items: RoomItem[]; notes: string }
interface KeyItem { label: string; count: number; handed: boolean }
interface MeterReading { type: string; number: string; value: string }

const DEFAULT_ROOMS: { name: string; items: string[] }[] = [
  { name: 'Flur', items: ['Waende & Decke', 'Boden', 'Tueren', 'Elektro', 'Garderobe'] },
  { name: 'Wohnzimmer', items: ['Waende & Decke', 'Boden', 'Fenster', 'Tueren', 'Elektro', 'Heizung'] },
  { name: 'Schlafzimmer', items: ['Waende & Decke', 'Boden', 'Fenster', 'Tueren', 'Elektro', 'Heizung'] },
  { name: 'Kueche', items: ['Waende & Decke', 'Boden', 'Fenster', 'Elektro', 'Heizung', 'Herd/Backofen', 'Spuele', 'Dunstabzug'] },
  { name: 'Bad', items: ['Waende & Decke', 'Boden', 'Fenster', 'Elektro', 'Heizung', 'Waschbecken', 'WC', 'Dusche/Badewanne', 'Armaturen'] },
  { name: 'Balkon/Terrasse', items: ['Boden', 'Gelaender', 'Markise'] },
  { name: 'Keller', items: ['Waende & Decke', 'Boden', 'Tueren', 'Elektro'] },
]

const DEFAULT_KEYS: KeyItem[] = [
  { label: 'Haustuerschluessel', count: 2, handed: false },
  { label: 'Wohnungsschluessel', count: 2, handed: false },
  { label: 'Kellerschluessel', count: 1, handed: false },
  { label: 'Briefkastenschluessel', count: 1, handed: false },
]

export default function UebergabeprotokollFormular() {
  const [section, setSection] = useState<'info' | 'rooms' | 'meters' | 'keys' | 'summary'>('info')
  const [protocolType, setProtocolType] = useState<'move_in' | 'move_out'>('move_in')
  const [date, setDate] = useState('')
  const [address, setAddress] = useState('')
  const [vermieter, setVermieter] = useState('')
  const [mieter, setMieter] = useState('')
  const [currentRoom, setCurrentRoom] = useState(0)
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS.map(r => ({
    name: r.name,
    items: r.items.map(i => ({ name: i, status: 'pending' as ItemStatus, note: '' })),
    notes: '',
  })))
  const [keys, setKeys] = useState<KeyItem[]>(DEFAULT_KEYS)
  const [meters, setMeters] = useState<MeterReading[]>([
    { type: 'Strom (kWh)', number: '', value: '' },
    { type: 'Gas (m3)', number: '', value: '' },
    { type: 'Kaltwasser (m3)', number: '', value: '' },
    { type: 'Warmwasser (m3)', number: '', value: '' },
  ])

  const updateItemStatus = (roomIdx: number, itemIdx: number, status: ItemStatus) => {
    setRooms(prev => prev.map((r, ri) => ri === roomIdx ? {
      ...r, items: r.items.map((it, ii) => ii === itemIdx ? { ...it, status } : it)
    } : r))
  }

  const updateItemNote = (roomIdx: number, itemIdx: number, note: string) => {
    setRooms(prev => prev.map((r, ri) => ri === roomIdx ? {
      ...r, items: r.items.map((it, ii) => ii === itemIdx ? { ...it, note } : it)
    } : r))
  }

  const totalItems = rooms.reduce((s, r) => s + r.items.length, 0)
  const checkedItems = rooms.reduce((s, r) => s + r.items.filter(i => i.status !== 'pending').length, 0)
  const defectItems = rooms.reduce((s, r) => s + r.items.filter(i => i.status === 'defect').length, 0)

  const SECTIONS = [
    { id: 'info' as const, label: 'Grunddaten' },
    { id: 'rooms' as const, label: 'Raeume' },
    { id: 'meters' as const, label: 'Zaehler' },
    { id: 'keys' as const, label: 'Schluessel' },
    { id: 'summary' as const, label: 'Zusammenfassung' },
  ]

  return (
    <div>
      <section className="gradient-vermieter py-12 print:hidden">
        <div className="container">
          <Link to="/formulare" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" /> Alle Formulare
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <ClipboardList className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Uebergabeprotokoll</h1>
              <p className="text-white/80">{protocolType === 'move_in' ? 'Einzug' : 'Auszug'} - {checkedItems}/{totalItems} Punkte geprueft</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 print:py-0">
        <div className="container max-w-3xl">
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 print:hidden">
            {SECTIONS.map(s => (
              <Button key={s.id} variant={section === s.id ? 'default' : 'outline'} size="sm" onClick={() => setSection(s.id)}>{s.label}</Button>
            ))}
          </div>

          {section === 'info' && (
            <Card>
              <CardHeader><CardTitle>Grunddaten</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Art der Uebergabe</Label>
                  <div className="flex gap-4">
                    <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center ${protocolType === 'move_in' ? 'border-primary bg-primary/5' : ''}`}>
                      <input type="radio" className="sr-only" checked={protocolType === 'move_in'} onChange={() => setProtocolType('move_in')} />
                      <Home className="h-6 w-6 mx-auto mb-1" /><span className="text-sm font-medium">Einzug</span>
                    </label>
                    <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center ${protocolType === 'move_out' ? 'border-primary bg-primary/5' : ''}`}>
                      <input type="radio" className="sr-only" checked={protocolType === 'move_out'} onChange={() => setProtocolType('move_out')} />
                      <Home className="h-6 w-6 mx-auto mb-1" /><span className="text-sm font-medium">Auszug</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2"><Label>Datum *</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>Adresse des Mietobjekts *</Label><Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Musterstrasse 1, 10115 Berlin" /></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Vermieter *</Label><Input value={vermieter} onChange={e => setVermieter(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Mieter *</Label><Input value={mieter} onChange={e => setMieter(e.target.value)} /></div>
                </div>
                <Button className="w-full" onClick={() => setSection('rooms')} disabled={!date || !address || !vermieter || !mieter}>Weiter zu Raeumen</Button>
              </CardContent>
            </Card>
          )}

          {section === 'rooms' && (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {rooms.map((r, i) => (
                  <Button key={i} variant={currentRoom === i ? 'default' : 'outline'} size="sm" onClick={() => setCurrentRoom(i)}>
                    {r.name}
                    {r.items.every(it => it.status !== 'pending') && <CheckCircle className="h-3 w-3 ml-1" />}
                    {r.items.some(it => it.status === 'defect') && <AlertTriangle className="h-3 w-3 ml-1 text-destructive" />}
                  </Button>
                ))}
              </div>
              <Card>
                <CardHeader><CardTitle>{rooms[currentRoom].name}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {rooms[currentRoom].items.map((item, idx) => (
                    <div key={idx} className={`p-3 border rounded-lg ${item.status === 'ok' ? 'border-green-300 bg-green-50' : item.status === 'defect' ? 'border-red-300 bg-red-50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant={item.status === 'ok' ? 'default' : 'outline'} onClick={() => updateItemStatus(currentRoom, idx, 'ok')} className={item.status === 'ok' ? 'bg-green-600 hover:bg-green-700' : ''}><CheckCircle className="h-4 w-4" /></Button>
                          <Button size="sm" variant={item.status === 'defect' ? 'default' : 'outline'} onClick={() => updateItemStatus(currentRoom, idx, 'defect')} className={item.status === 'defect' ? 'bg-red-600 hover:bg-red-700' : ''}><AlertTriangle className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      {item.status === 'defect' && <Input placeholder="Mangel beschreiben..." value={item.note} onChange={e => updateItemNote(currentRoom, idx, e.target.value)} className="mt-2" />}
                    </div>
                  ))}
                  <div className="space-y-2 pt-2">
                    <Label>Anmerkungen zum Raum</Label>
                    <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={rooms[currentRoom].notes} onChange={e => setRooms(prev => prev.map((r, i) => i === currentRoom ? { ...r, notes: e.target.value } : r))} />
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" disabled={currentRoom === 0} onClick={() => setCurrentRoom(c => c - 1)}>Vorheriger Raum</Button>
                    {currentRoom < rooms.length - 1 ? <Button onClick={() => setCurrentRoom(c => c + 1)}>Naechster Raum</Button> : <Button onClick={() => setSection('meters')}>Weiter zu Zaehlern</Button>}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {section === 'meters' && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" /> Zaehlerstaende</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {meters.map((m, i) => (
                  <div key={i} className="grid gap-4 md:grid-cols-3 items-end">
                    <div className="space-y-2"><Label>{m.type}</Label><Input value={m.number} onChange={e => setMeters(prev => prev.map((me, mi) => mi === i ? { ...me, number: e.target.value } : me))} placeholder="Zaehlernummer" /></div>
                    <div className="space-y-2"><Label>Zaehlerstand</Label><Input type="number" value={m.value} onChange={e => setMeters(prev => prev.map((me, mi) => mi === i ? { ...me, value: e.target.value } : me))} placeholder="0" /></div>
                    <Button variant="ghost" size="icon" onClick={() => setMeters(prev => prev.filter((_, mi) => mi !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setMeters(prev => [...prev, { type: 'Sonstiger Zaehler', number: '', value: '' }])}><Plus className="h-4 w-4 mr-2" /> Zaehler hinzufuegen</Button>
                <Button className="w-full" onClick={() => setSection('keys')}>Weiter zu Schluesseln</Button>
              </CardContent>
            </Card>
          )}

          {section === 'keys' && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Schluesseluebergabe</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {keys.map((k, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 border rounded-lg ${k.handed ? 'border-green-300 bg-green-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={k.handed} onChange={e => setKeys(prev => prev.map((ke, ki) => ki === i ? { ...ke, handed: e.target.checked } : ke))} />
                      <span className="font-medium">{k.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Anzahl:</Label>
                      <Input type="number" min="0" value={k.count} onChange={e => setKeys(prev => prev.map((ke, ki) => ki === i ? { ...ke, count: parseInt(e.target.value) || 0 } : ke))} className="w-20" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setKeys(prev => [...prev, { label: 'Sonstiger Schluessel', count: 1, handed: false }])}><Plus className="h-4 w-4 mr-2" /> Schluessel hinzufuegen</Button>
                <Button className="w-full" onClick={() => setSection('summary')}>Zur Zusammenfassung</Button>
              </CardContent>
            </Card>
          )}

          {section === 'summary' && (
            <div className="space-y-6" id="print-area">
              <Card>
                <CardHeader><CardTitle>Uebergabeprotokoll - {protocolType === 'move_in' ? 'Einzug' : 'Auszug'}</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Datum:</span><span>{date}</span>
                    <span className="text-muted-foreground">Adresse:</span><span>{address}</span>
                    <span className="text-muted-foreground">Vermieter:</span><span>{vermieter}</span>
                    <span className="text-muted-foreground">Mieter:</span><span>{mieter}</span>
                  </div>
                  <hr />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Raeume ({checkedItems}/{totalItems} geprueft, {defectItems} Maengel)</h3>
                    {rooms.map((r, ri) => (
                      <div key={ri} className="mb-4">
                        <h4 className="font-medium mb-1">{r.name}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-sm">
                          {r.items.map((it, ii) => (
                            <span key={ii} className={it.status === 'ok' ? 'text-green-700' : it.status === 'defect' ? 'text-red-700' : 'text-muted-foreground'}>
                              {it.status === 'ok' ? 'OK' : it.status === 'defect' ? 'MANGEL' : '---'} {it.name}{it.note && ` (${it.note})`}
                            </span>
                          ))}
                        </div>
                        {r.notes && <p className="text-sm text-muted-foreground mt-1">Anmerkung: {r.notes}</p>}
                      </div>
                    ))}
                  </div>
                  <hr />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Zaehlerstaende</h3>
                    {meters.filter(m => m.value).map((m, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 text-sm"><span>{m.type}</span><span>{m.number || '-'}</span><span>{m.value}</span></div>
                    ))}
                  </div>
                  <hr />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Schluessel</h3>
                    {keys.map((k, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{k.label} (x{k.count})</span>
                        <span className={k.handed ? 'text-green-700' : 'text-red-700'}>{k.handed ? 'Uebergeben' : 'Nicht uebergeben'}</span>
                      </div>
                    ))}
                  </div>
                  <hr />
                  <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div><p className="text-sm text-muted-foreground mb-8">Ort, Datum</p><div className="border-t border-foreground pt-2 text-sm">Unterschrift Vermieter</div></div>
                    <div><p className="text-sm text-muted-foreground mb-8">Ort, Datum</p><div className="border-t border-foreground pt-2 text-sm">Unterschrift Mieter</div></div>
                  </div>
                </CardContent>
              </Card>
              <div className="print:hidden">
                <Button onClick={() => window.print()} className="w-full" size="lg"><Printer className="h-4 w-4 mr-2" /> Protokoll drucken / als PDF speichern</Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
