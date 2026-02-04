import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Car, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateStellplatzvereinbarungPDF } from '@/lib/pdf/stellplatzvereinbarung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  stellplatzAdresse: AddressData
  stellplatzNr: string
  stellplatzArt: string
  kfzKennzeichen: string
  mietbeginn: string
  mietdauer: string
  befristetBis: string
  monatlicheMiete: number | null
  zahlungsweise: string
  kaution: number | null
  nutzungsbedingungen: string[]
  sonstigeVereinbarungen: string
  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  stellplatzAdresse: { ...EMPTY_ADDRESS },
  stellplatzNr: '',
  stellplatzArt: '',
  kfzKennzeichen: '',
  mietbeginn: '',
  mietdauer: 'unbefristet',
  befristetBis: '',
  monatlicheMiete: null,
  zahlungsweise: 'monatlich',
  kaution: null,
  nutzungsbedingungen: [],
  sonstigeVereinbarungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const STELLPLATZ_ARTEN = [
  { value: 'aussen', label: 'Außenstellplatz' },
  { value: 'tiefgarage', label: 'Tiefgaragenstellplatz' },
  { value: 'garage', label: 'Einzelgarage' },
  { value: 'carport', label: 'Carport' },
  { value: 'duplex', label: 'Duplex-/Stapelparker' },
]

const NUTZUNGSBEDINGUNGEN = [
  { value: 'keinwaschen', label: 'Fahrzeugwäsche auf dem Stellplatz nicht gestattet' },
  { value: 'keinereparatur', label: 'Reparaturarbeiten am Fahrzeug nicht gestattet' },
  { value: 'keinlagern', label: 'Lagerung von Gegenständen nicht gestattet' },
  { value: 'reinigung', label: 'Stellplatz ist sauber zu halten' },
  { value: 'oelspur', label: 'Ölspuren sind unverzüglich zu beseitigen' },
]

export default function StellplatzvereinbarungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'stellplatzvereinbarung',
    generateTitle: (data) => `Stellplatzvereinbarung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Stellplatzvereinbarung'
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

  const handleSubmit = () => {
    handleSave(formData)
  }

  const toggleBedingung = (value: string) => {
    const current = formData.nutzungsbedingungen
    if (current.includes(value)) {
      updateData({ nutzungsbedingungen: current.filter(v => v !== value) })
    } else {
      updateData({ nutzungsbedingungen: [...current, value] })
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateStellplatzvereinbarungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Stellplatzvereinbarung wurde als PDF gespeichert.' })
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
              <h1 className="text-2xl font-bold">Stellplatzvereinbarung</h1>
              <p className="text-muted-foreground">Mietvertrag für PKW-Stellplatz oder Garage</p>
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
              <div>
                <Label>KFZ-Kennzeichen (falls bekannt)</Label>
                <Input
                  value={formData.kfzKennzeichen}
                  onChange={(e) => updateData({ kfzKennzeichen: e.target.value })}
                  placeholder="z.B. B-AB 1234"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stellplatz */}
          <Card>
            <CardHeader>
              <CardTitle>Stellplatz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressField
                value={formData.stellplatzAdresse}
                onChange={(v) => updateData({ stellplatzAdresse: v })}
                label="Standort"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Stellplatznummer</Label>
                  <Input
                    value={formData.stellplatzNr}
                    onChange={(e) => updateData({ stellplatzNr: e.target.value })}
                    placeholder="z.B. P-12, TG-05"
                  />
                </div>
                <div>
                  <Label>Art des Stellplatzes *</Label>
                  <Select
                    value={formData.stellplatzArt}
                    onValueChange={(v) => updateData({ stellplatzArt: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Auswählen" /></SelectTrigger>
                    <SelectContent>
                      {STELLPLATZ_ARTEN.map(a => (
                        <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mietkonditionen */}
          <Card>
            <CardHeader>
              <CardTitle>Mietkonditionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mietbeginn *</Label>
                  <Input
                    type="date"
                    value={formData.mietbeginn}
                    onChange={(e) => updateData({ mietbeginn: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Mietdauer</Label>
                  <Select
                    value={formData.mietdauer}
                    onValueChange={(v) => updateData({ mietdauer: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unbefristet">Unbefristet</SelectItem>
                      <SelectItem value="befristet">Befristet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.mietdauer === 'befristet' && (
                <div>
                  <Label>Befristet bis</Label>
                  <Input
                    type="date"
                    value={formData.befristetBis}
                    onChange={(e) => updateData({ befristetBis: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Monatliche Miete *"
                  value={formData.monatlicheMiete}
                  onChange={(v) => updateData({ monatlicheMiete: v })}
                />
                <CurrencyField
                  label="Kaution"
                  value={formData.kaution}
                  onChange={(v) => updateData({ kaution: v })}
                />
              </div>

              <div>
                <Label>Zahlungsweise</Label>
                <Select
                  value={formData.zahlungsweise}
                  onValueChange={(v) => updateData({ zahlungsweise: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monatlich">Monatlich im Voraus</SelectItem>
                    <SelectItem value="vierteljaehrlich">Vierteljährlich</SelectItem>
                    <SelectItem value="jaehrlich">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Nutzungsbedingungen */}
          <Card>
            <CardHeader>
              <CardTitle>Nutzungsbedingungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {NUTZUNGSBEDINGUNGEN.map(b => (
                  <div key={b.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={b.value}
                      checked={formData.nutzungsbedingungen.includes(b.value)}
                      onCheckedChange={() => toggleBedingung(b.value)}
                    />
                    <Label htmlFor={b.value} className="font-normal">{b.label}</Label>
                  </div>
                ))}
              </div>

              <div>
                <Label>Sonstige Vereinbarungen</Label>
                <Textarea
                  value={formData.sonstigeVereinbarungen}
                  onChange={(e) => updateData({ sonstigeVereinbarungen: e.target.value })}
                  placeholder="Weitere Absprachen..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Unterschriften */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschriften</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Ort</Label>
                  <Input
                    value={formData.erstelltOrt}
                    onChange={(e) => updateData({ erstelltOrt: e.target.value })}
                    placeholder="z.B. Berlin"
                  />
                </div>
                <div>
                  <Label>Datum</Label>
                  <Input
                    type="date"
                    value={formData.erstelltAm}
                    onChange={(e) => updateData({ erstelltAm: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SignatureField
                  value={formData.unterschriftVermieter}
                  onChange={(v) => updateData({ unterschriftVermieter: v })}
                  label="Unterschrift Vermieter"
                />
                <SignatureField
                  value={formData.unterschriftMieter}
                  onChange={(v) => updateData({ unterschriftMieter: v })}
                  label="Unterschrift Mieter"
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
