import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Palmtree, Plus, Trash2, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { generateFerienwohnungsmietvertragPDF } from '@/lib/pdf/ferienwohnungsmietvertrag-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface Gast {
  id: string
  name: string
  geburtsdatum: string
}

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData
  weitereGaeste: Gast[]
  objektAdresse: AddressData
  objektBezeichnung: string
  wohnflaeche: string
  zimmer: string
  maxPersonen: string
  anreiseDatum: string
  anreiseUhrzeit: string
  abreiseDatum: string
  abreiseUhrzeit: string
  mietpreis: number | null
  endreinigung: number | null
  kaution: number | null
  inklusivleistungen: string[]
  hausordnungHinweise: string
  stornoRegelung: string
  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  weitereGaeste: [],
  objektAdresse: { ...EMPTY_ADDRESS },
  objektBezeichnung: '',
  wohnflaeche: '',
  zimmer: '',
  maxPersonen: '',
  anreiseDatum: '',
  anreiseUhrzeit: '15:00',
  abreiseDatum: '',
  abreiseUhrzeit: '10:00',
  mietpreis: null,
  endreinigung: null,
  kaution: null,
  inklusivleistungen: ['bettwaesche', 'handtuecher', 'wlan'],
  hausordnungHinweise: '',
  stornoRegelung: 'standard',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function FerienwohnungsmietvertragPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'ferienwohnungsmietvertrag',
    generateTitle: (data) => `Ferienwohnungsmietvertrag - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Ferienwohnungsmietvertrag'
  })

  // Load existing document if editing
  React.useEffect(() => {
    const id = searchParams.get('id')
    if (id && user) {
      const doc = getDocument(id, user.id)
      if (doc?.data) {
        setFormData({ ...INITIAL_DATA, ...doc.data })
      }
    }
  }, [searchParams, user])

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addGast = () => {
    updateData({
      weitereGaeste: [...formData.weitereGaeste, { id: Date.now().toString(), name: '', geburtsdatum: '' }]
    })
  }

  const removeGast = (id: string) => {
    updateData({ weitereGaeste: formData.weitereGaeste.filter(g => g.id !== id) })
  }

  const updateGast = (id: string, updates: Partial<Gast>) => {
    updateData({
      weitereGaeste: formData.weitereGaeste.map(g => g.id === id ? { ...g, ...updates } : g)
    })
  }

  const toggleInklusiv = (item: string) => {
    if (formData.inklusivleistungen.includes(item)) {
      updateData({ inklusivleistungen: formData.inklusivleistungen.filter(i => i !== item) })
    } else {
      updateData({ inklusivleistungen: [...formData.inklusivleistungen, item] })
    }
  }

  // Aufenthaltsdauer berechnen
  const aufenthaltNaechte = React.useMemo(() => {
    if (!formData.anreiseDatum || !formData.abreiseDatum) return 0
    const anreise = new Date(formData.anreiseDatum)
    const abreise = new Date(formData.abreiseDatum)
    const diff = abreise.getTime() - anreise.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [formData.anreiseDatum, formData.abreiseDatum])

  const gesamtpreis = (formData.mietpreis || 0) + (formData.endreinigung || 0)

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateFerienwohnungsmietvertragPDF({ ...formData, aufenthaltNaechte, gesamtpreis })
      toast({ title: 'PDF erstellt', description: 'Der Ferienwohnungsmietvertrag wurde als PDF gespeichert.' })
    } catch (error) {
      toast({ title: 'Fehler', description: 'PDF konnte nicht erstellt werden.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Palmtree className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ferienwohnungsmietvertrag</h1>
              <p className="text-muted-foreground">Kurzzeitvermietung für Urlauber und Gäste</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            Für kurzfristige Vermietungen an Feriengäste. Beachten Sie die Meldepflicht nach dem
            Bundesmeldegesetz und ggf. örtliche Regelungen zur Zweckentfremdung.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter / Gastgeber</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.vermieter}
                onChange={(v) => updateData({ vermieter: v })}
                label="Vermieter"
                required
              />
              <AddressField
                value={formData.vermieterAdresse}
                onChange={(v) => updateData({ vermieterAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Mieter / Gäste */}
          <Card>
            <CardHeader>
              <CardTitle>Mieter / Hauptgast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.mieter}
                onChange={(v) => updateData({ mieter: v })}
                label="Hauptgast (Vertragspartner)"
                required
              />
              <AddressField
                value={formData.mieterAdresse}
                onChange={(v) => updateData({ mieterAdresse: v })}
                label="Anschrift"
                required
              />

              <Separator />

              <div>
                <Label className="text-base font-medium">Weitere Gäste</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Alle Personen, die die Unterkunft mitnutzen werden
                </p>

                {formData.weitereGaeste.map((gast) => (
                  <div key={gast.id} className="flex gap-2 mb-2">
                    <Input
                      value={gast.name}
                      onChange={(e) => updateGast(gast.id, { name: e.target.value })}
                      placeholder="Name"
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={gast.geburtsdatum}
                      onChange={(e) => updateGast(gast.id, { geburtsdatum: e.target.value })}
                      className="w-40"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeGast(gast.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={addGast}>
                  <Plus className="h-4 w-4 mr-2" />
                  Gast hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ferienwohnung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palmtree className="h-5 w-5" />
                Ferienwohnung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Objektbezeichnung</Label>
                <Input
                  value={formData.objektBezeichnung}
                  onChange={(e) => updateData({ objektBezeichnung: e.target.value })}
                  placeholder="z.B. Ferienwohnung 'Seeblick', Apartment 3.OG"
                />
              </div>

              <AddressField
                value={formData.objektAdresse}
                onChange={(v) => updateData({ objektAdresse: v })}
                label="Adresse der Ferienwohnung"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Wohnfläche (m²)</Label>
                  <Input
                    value={formData.wohnflaeche}
                    onChange={(e) => updateData({ wohnflaeche: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Zimmer</Label>
                  <Input
                    value={formData.zimmer}
                    onChange={(e) => updateData({ zimmer: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Max. Personen</Label>
                  <Input
                    value={formData.maxPersonen}
                    onChange={(e) => updateData({ maxPersonen: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zeitraum */}
          <Card>
            <CardHeader>
              <CardTitle>Aufenthaltszeitraum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Anreise *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={formData.anreiseDatum}
                      onChange={(e) => updateData({ anreiseDatum: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={formData.anreiseUhrzeit}
                      onChange={(e) => updateData({ anreiseUhrzeit: e.target.value })}
                      className="w-28"
                    />
                  </div>
                </div>
                <div>
                  <Label>Abreise *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={formData.abreiseDatum}
                      onChange={(e) => updateData({ abreiseDatum: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={formData.abreiseUhrzeit}
                      onChange={(e) => updateData({ abreiseUhrzeit: e.target.value })}
                      className="w-28"
                    />
                  </div>
                </div>
              </div>

              {aufenthaltNaechte > 0 && (
                <div className="p-3 bg-cyan-50 rounded-lg text-center">
                  <span className="text-lg font-medium">{aufenthaltNaechte} Nächte</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kosten */}
          <Card>
            <CardHeader>
              <CardTitle>Kosten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CurrencyField
                  label="Mietpreis (gesamt) *"
                  value={formData.mietpreis}
                  onChange={(v) => updateData({ mietpreis: v })}
                />
                <CurrencyField
                  label="Endreinigung"
                  value={formData.endreinigung}
                  onChange={(v) => updateData({ endreinigung: v })}
                />
                <CurrencyField
                  label="Kaution"
                  value={formData.kaution}
                  onChange={(v) => updateData({ kaution: v })}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Gesamtpreis:</span>
                  <span className="text-xl font-bold">{formatCurrency(gesamtpreis)}</span>
                </div>
                {aufenthaltNaechte > 0 && (
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Pro Nacht:</span>
                    <span>{formatCurrency(gesamtpreis / aufenthaltNaechte)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inklusivleistungen */}
          <Card>
            <CardHeader>
              <CardTitle>Inklusivleistungen</CardTitle>
              <CardDescription>Was ist im Mietpreis enthalten?</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { id: 'bettwaesche', label: 'Bettwäsche' },
                { id: 'handtuecher', label: 'Handtücher' },
                { id: 'wlan', label: 'WLAN' },
                { id: 'parkplatz', label: 'Parkplatz' },
                { id: 'heizung', label: 'Heizung' },
                { id: 'strom', label: 'Strom' },
                { id: 'wasser', label: 'Wasser' },
                { id: 'tvgebuehren', label: 'TV-Gebühren' },
              ].map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={formData.inklusivleistungen.includes(item.id)}
                    onCheckedChange={() => toggleInklusiv(item.id)}
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Hausordnung */}
          <Card>
            <CardHeader>
              <CardTitle>Besondere Hinweise</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.hausordnungHinweise}
                onChange={(e) => updateData({ hausordnungHinweise: e.target.value })}
                placeholder="z.B. Haustierhaltung, Rauchverbot, Nachtruhe, Müllentsorgung..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Unterschriften */}
          <Card>
            <CardHeader>
              <CardTitle>Vertragsabschluss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={formData.erstelltAm}
                  onChange={(e) => updateData({ erstelltAm: e.target.value })}
                  className="w-48"
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SignatureField
                  value={formData.unterschriftVermieter}
                  onChange={(v) => updateData({ unterschriftVermieter: v })}
                  label="Unterschrift Vermieter"
                  required
                />
                <SignatureField
                  value={formData.unterschriftMieter}
                  onChange={(v) => updateData({ unterschriftMieter: v })}
                  label="Unterschrift Mieter"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link to="/">Abbrechen</Link>
            </Button>
            {documentId && (
              <Button variant="outline" onClick={handleGeneratePDF} disabled={isLoading}>
                <FileDown className="h-4 w-4 mr-2" />
                PDF erstellen
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
