import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ScrollText, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { useToast } from '@/hooks/use-toast'
import { generateHausordnungPDF } from '@/lib/pdf/hausordnung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  objektAdresse: AddressData
  objektBezeichnung: string
  ruhezeiten: {
    mittagsruhe: boolean
    mittagsruheVon: string
    mittagsruheBis: string
    nachtruheVon: string
    nachtruheBis: string
    sonntagsruhe: boolean
  }
  treppenhausreinigung: 'vermieter' | 'mieter_wechsel' | 'firma'
  reinigungsintervall: string
  muellRegelungen: string[]
  tierhaltung: 'erlaubt' | 'kleintiere' | 'verboten' | 'genehmigung'
  rauchen: 'erlaubt' | 'wohnung' | 'verboten'
  grillRegelung: string
  parkordnung: string
  winterdienst: 'vermieter' | 'mieter'
  gasteAnmeldung: boolean
  kinderspielplatz: string
  gemeinschaftsraeume: string
  zusaetzlicheRegeln: string[]
  ansprechpartner: string
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  objektAdresse: { ...EMPTY_ADDRESS },
  objektBezeichnung: '',
  ruhezeiten: {
    mittagsruhe: true,
    mittagsruheVon: '13:00',
    mittagsruheBis: '15:00',
    nachtruheVon: '22:00',
    nachtruheBis: '06:00',
    sonntagsruhe: true,
  },
  treppenhausreinigung: 'mieter_wechsel',
  reinigungsintervall: 'wöchentlich',
  muellRegelungen: ['trennung', 'tonnenZurueck'],
  tierhaltung: 'kleintiere',
  rauchen: 'wohnung',
  grillRegelung: 'Grillen ist auf dem Balkon/der Terrasse mit Elektro- oder Gasgrill erlaubt.',
  parkordnung: '',
  winterdienst: 'vermieter',
  gasteAnmeldung: false,
  kinderspielplatz: '',
  gemeinschaftsraeume: '',
  zusaetzlicheRegeln: [],
  ansprechpartner: '',
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function HausordnungPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)
  const [neueRegel, setNeueRegel] = React.useState('')

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateRuhezeiten = (updates: Partial<FormData['ruhezeiten']>) => {
    setFormData(prev => ({ ...prev, ruhezeiten: { ...prev.ruhezeiten, ...updates } }))
  }

  const toggleMuell = (regel: string) => {
    if (formData.muellRegelungen.includes(regel)) {
      updateData({ muellRegelungen: formData.muellRegelungen.filter(r => r !== regel) })
    } else {
      updateData({ muellRegelungen: [...formData.muellRegelungen, regel] })
    }
  }

  const addRegel = () => {
    if (neueRegel.trim()) {
      updateData({ zusaetzlicheRegeln: [...formData.zusaetzlicheRegeln, neueRegel.trim()] })
      setNeueRegel('')
    }
  }

  const removeRegel = (index: number) => {
    updateData({ zusaetzlicheRegeln: formData.zusaetzlicheRegeln.filter((_, i) => i !== index) })
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateHausordnungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Hausordnung wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <ScrollText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hausordnung</h1>
              <p className="text-muted-foreground">Regeln für das Zusammenleben im Haus</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vermieter/Hausverwaltung */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter / Hausverwaltung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.vermieter}
                onChange={(v) => updateData({ vermieter: v })}
                label="Vermieter/Verwaltung"
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

          {/* Objekt */}
          <Card>
            <CardHeader>
              <CardTitle>Objekt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Objektbezeichnung</Label>
                <Input
                  value={formData.objektBezeichnung}
                  onChange={(e) => updateData({ objektBezeichnung: e.target.value })}
                  placeholder="z.B. Wohnanlage Am Stadtpark"
                />
              </div>
              <AddressField
                value={formData.objektAdresse}
                onChange={(v) => updateData({ objektAdresse: v })}
                label="Adresse"
                required
              />
            </CardContent>
          </Card>

          {/* Ruhezeiten */}
          <Card>
            <CardHeader>
              <CardTitle>Ruhezeiten</CardTitle>
              <CardDescription>Zeiten, in denen besondere Rücksichtnahme geboten ist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mittagsruhe"
                  checked={formData.ruhezeiten.mittagsruhe}
                  onCheckedChange={(c) => updateRuhezeiten({ mittagsruhe: !!c })}
                />
                <Label htmlFor="mittagsruhe">Mittagsruhe</Label>
              </div>
              {formData.ruhezeiten.mittagsruhe && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label>Von</Label>
                    <Input
                      type="time"
                      value={formData.ruhezeiten.mittagsruheVon}
                      onChange={(e) => updateRuhezeiten({ mittagsruheVon: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Bis</Label>
                    <Input
                      type="time"
                      value={formData.ruhezeiten.mittagsruheBis}
                      onChange={(e) => updateRuhezeiten({ mittagsruheBis: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nachtruhe von</Label>
                  <Input
                    type="time"
                    value={formData.ruhezeiten.nachtruheVon}
                    onChange={(e) => updateRuhezeiten({ nachtruheVon: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Nachtruhe bis</Label>
                  <Input
                    type="time"
                    value={formData.ruhezeiten.nachtruheBis}
                    onChange={(e) => updateRuhezeiten({ nachtruheBis: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sonntagsruhe"
                  checked={formData.ruhezeiten.sonntagsruhe}
                  onCheckedChange={(c) => updateRuhezeiten({ sonntagsruhe: !!c })}
                />
                <Label htmlFor="sonntagsruhe">Sonn- und Feiertagsruhe (ganztägig)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Treppenhaus & Reinigung */}
          <Card>
            <CardHeader>
              <CardTitle>Treppenhaus & Reinigung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Treppenhausreinigung</Label>
                <div className="space-y-2 mt-2">
                  {[
                    { value: 'vermieter', label: 'Wird vom Vermieter/Firma erledigt' },
                    { value: 'mieter_wechsel', label: 'Im wöchentlichen Wechsel durch Mieter' },
                    { value: 'firma', label: 'Durch beauftragte Reinigungsfirma' },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={option.value}
                        name="reinigung"
                        checked={formData.treppenhausreinigung === option.value}
                        onChange={() => updateData({ treppenhausreinigung: option.value as typeof formData.treppenhausreinigung })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Müll */}
          <Card>
            <CardHeader>
              <CardTitle>Müllentsorgung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 'trennung', label: 'Mülltrennung ist Pflicht (Restmüll, Papier, Gelber Sack, Bio, Glas)' },
                { id: 'tonnenZurueck', label: 'Mülltonnen nach Leerung zurückstellen' },
                { id: 'sperr', label: 'Sperrmüll nur nach Anmeldung beim Entsorger' },
                { id: 'keine_tueten', label: 'Keine Müllsäcke neben die Tonnen stellen' },
              ].map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={formData.muellRegelungen.includes(item.id)}
                    onCheckedChange={() => toggleMuell(item.id)}
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tierhaltung & Rauchen */}
          <Card>
            <CardHeader>
              <CardTitle>Tierhaltung & Rauchen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tierhaltung</Label>
                <div className="space-y-2 mt-2">
                  {[
                    { value: 'erlaubt', label: 'Tierhaltung erlaubt' },
                    { value: 'kleintiere', label: 'Nur Kleintiere (Hamster, Fische, etc.) ohne Genehmigung' },
                    { value: 'genehmigung', label: 'Nur mit schriftlicher Genehmigung des Vermieters' },
                    { value: 'verboten', label: 'Tierhaltung nicht gestattet' },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`tier_${option.value}`}
                        name="tierhaltung"
                        checked={formData.tierhaltung === option.value}
                        onChange={() => updateData({ tierhaltung: option.value as typeof formData.tierhaltung })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`tier_${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Rauchen</Label>
                <div className="space-y-2 mt-2">
                  {[
                    { value: 'erlaubt', label: 'Rauchen überall erlaubt' },
                    { value: 'wohnung', label: 'Rauchen nur in der eigenen Wohnung' },
                    { value: 'verboten', label: 'Rauchfreies Haus' },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`rauch_${option.value}`}
                        name="rauchen"
                        checked={formData.rauchen === option.value}
                        onChange={() => updateData({ rauchen: option.value as typeof formData.rauchen })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`rauch_${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grillen */}
          <Card>
            <CardHeader>
              <CardTitle>Grillen</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.grillRegelung}
                onChange={(e) => updateData({ grillRegelung: e.target.value })}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Zusätzliche Regeln */}
          <Card>
            <CardHeader>
              <CardTitle>Zusätzliche Regeln</CardTitle>
              <CardDescription>Weitere individuelle Regeln hinzufügen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.zusaetzlicheRegeln.map((regel, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={regel} readOnly className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeRegel(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  value={neueRegel}
                  onChange={(e) => setNeueRegel(e.target.value)}
                  placeholder="Neue Regel eingeben..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addRegel()}
                />
                <Button variant="outline" onClick={addRegel}>
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ansprechpartner */}
          <Card>
            <CardHeader>
              <CardTitle>Ansprechpartner bei Problemen</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.ansprechpartner}
                onChange={(e) => updateData({ ansprechpartner: e.target.value })}
                placeholder="z.B. Hausmeister Herr Müller, Tel. 0123-456789, erreichbar Mo-Fr 8-16 Uhr"
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link to="/">Abbrechen</Link>
            </Button>
            <Button onClick={handleGeneratePDF} disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'PDF erstellen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
