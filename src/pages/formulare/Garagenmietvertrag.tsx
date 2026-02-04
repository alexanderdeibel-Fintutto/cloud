import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Car } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { generateGaragenmietvertragPDF } from '@/lib/pdf/garagenmietvertrag-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData
  objektTyp: 'garage' | 'tiefgarage' | 'stellplatz' | 'carport'
  objektAdresse: AddressData
  stellplatzNr: string
  groesse: string
  zugang: string
  mietbeginn: string
  miete: number | null
  nebenkostenPauschale: number | null
  kaution: number | null
  kuendigungsfrist: string
  nutzungErlaubt: string[]
  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  objektTyp: 'garage',
  objektAdresse: { ...EMPTY_ADDRESS },
  stellplatzNr: '',
  groesse: '',
  zugang: '',
  mietbeginn: '',
  miete: null,
  nebenkostenPauschale: null,
  kaution: null,
  kuendigungsfrist: '3',
  nutzungErlaubt: ['pkw'],
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function GaragenmietvertragPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleNutzung = (nutzung: string) => {
    if (formData.nutzungErlaubt.includes(nutzung)) {
      updateData({ nutzungErlaubt: formData.nutzungErlaubt.filter(n => n !== nutzung) })
    } else {
      updateData({ nutzungErlaubt: [...formData.nutzungErlaubt, nutzung] })
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateGaragenmietvertragPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Der Garagenmietvertrag wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-slate-100 rounded-lg">
              <Car className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Garagenmietvertrag</h1>
              <p className="text-muted-foreground">Mietvertrag für Garage, Stellplatz oder Carport</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter</CardTitle>
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

          {/* Mieter */}
          <Card>
            <CardHeader>
              <CardTitle>Mieter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.mieter}
                onChange={(v) => updateData({ mieter: v })}
                label="Mieter"
                required
              />
              <AddressField
                value={formData.mieterAdresse}
                onChange={(v) => updateData({ mieterAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Mietobjekt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Mietobjekt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Objekttyp *</Label>
                  <Select
                    value={formData.objektTyp}
                    onValueChange={(v: 'garage' | 'tiefgarage' | 'stellplatz' | 'carport') =>
                      updateData({ objektTyp: v })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="garage">Einzelgarage</SelectItem>
                      <SelectItem value="tiefgarage">Tiefgaragenstellplatz</SelectItem>
                      <SelectItem value="stellplatz">Außenstellplatz</SelectItem>
                      <SelectItem value="carport">Carport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stellplatz-Nr. / Bezeichnung</Label>
                  <Input
                    value={formData.stellplatzNr}
                    onChange={(e) => updateData({ stellplatzNr: e.target.value })}
                    placeholder="z.B. Nr. 15 oder Garage links"
                  />
                </div>
              </div>

              <AddressField
                value={formData.objektAdresse}
                onChange={(v) => updateData({ objektAdresse: v })}
                label="Standort"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Größe (m²)</Label>
                  <Input
                    value={formData.groesse}
                    onChange={(e) => updateData({ groesse: e.target.value })}
                    placeholder="z.B. 15"
                  />
                </div>
                <div>
                  <Label>Zugang / Schlüssel</Label>
                  <Input
                    value={formData.zugang}
                    onChange={(e) => updateData({ zugang: e.target.value })}
                    placeholder="z.B. Funkfernbedienung, Schlüssel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nutzung */}
          <Card>
            <CardHeader>
              <CardTitle>Zulässige Nutzung</CardTitle>
              <CardDescription>
                Welche Nutzung ist erlaubt?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 'pkw', label: 'PKW' },
                { id: 'motorrad', label: 'Motorrad / Roller' },
                { id: 'fahrrad', label: 'Fahrräder' },
                { id: 'lagerung', label: 'Lagerung (z.B. Reifen, Werkzeug)' },
                { id: 'anhaenger', label: 'Anhänger' },
              ].map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={formData.nutzungErlaubt.includes(item.id)}
                    onCheckedChange={() => toggleNutzung(item.id)}
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mietkonditionen */}
          <Card>
            <CardHeader>
              <CardTitle>Mietkonditionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mietbeginn *</Label>
                <Input
                  type="date"
                  value={formData.mietbeginn}
                  onChange={(e) => updateData({ mietbeginn: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CurrencyField
                  label="Monatliche Miete *"
                  value={formData.miete}
                  onChange={(v) => updateData({ miete: v })}
                />
                <CurrencyField
                  label="Nebenkostenpauschale"
                  value={formData.nebenkostenPauschale}
                  onChange={(v) => updateData({ nebenkostenPauschale: v })}
                />
                <CurrencyField
                  label="Kaution"
                  value={formData.kaution}
                  onChange={(v) => updateData({ kaution: v })}
                />
              </div>

              <div>
                <Label>Kündigungsfrist (Monate)</Label>
                <Select
                  value={formData.kuendigungsfrist}
                  onValueChange={(v) => updateData({ kuendigungsfrist: v })}
                >
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Monat</SelectItem>
                    <SelectItem value="2">2 Monate</SelectItem>
                    <SelectItem value="3">3 Monate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Unterschriften */}
          <Card>
            <CardHeader>
              <CardTitle>Vertragsabschluss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Ort *</Label>
                  <Input
                    value={formData.erstelltOrt}
                    onChange={(e) => updateData({ erstelltOrt: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Datum *</Label>
                  <Input
                    type="date"
                    value={formData.erstelltAm}
                    onChange={(e) => updateData({ erstelltAm: e.target.value })}
                  />
                </div>
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
            <Button onClick={handleGeneratePDF} disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'PDF erstellen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
