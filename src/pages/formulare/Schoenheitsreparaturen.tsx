import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Paintbrush, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { generateSchoenheitsreparaturenPDF } from '@/lib/pdf/schoenheitsreparaturen-pdf'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData
  mietobjektAdresse: AddressData
  raeume: string[]
  arbeiten: string[]
  farbvorgaben: string
  qualitaetsanforderungen: string
  fristBis: string
  durchfuehrung: string
  abnahmetermin: string
  sondervereinbarungen: string
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
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  raeume: [],
  arbeiten: [],
  farbvorgaben: '',
  qualitaetsanforderungen: '',
  fristBis: '',
  durchfuehrung: 'Mieter',
  abnahmetermin: '',
  sondervereinbarungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const RAEUME_OPTIONEN = [
  { value: 'wohnzimmer', label: 'Wohnzimmer' },
  { value: 'schlafzimmer', label: 'Schlafzimmer' },
  { value: 'kinderzimmer', label: 'Kinderzimmer' },
  { value: 'kueche', label: 'Küche' },
  { value: 'bad', label: 'Bad/WC' },
  { value: 'flur', label: 'Flur/Diele' },
  { value: 'abstellraum', label: 'Abstellraum' },
  { value: 'balkon', label: 'Balkon/Terrasse' },
  { value: 'keller', label: 'Keller' },
]

const ARBEITEN_OPTIONEN = [
  { value: 'streichen_waende', label: 'Streichen der Wände' },
  { value: 'streichen_decken', label: 'Streichen der Decken' },
  { value: 'streichen_tueren', label: 'Streichen der Türen und Türrahmen' },
  { value: 'streichen_fenster', label: 'Streichen der Fenster (Innenseite)' },
  { value: 'streichen_heizkoerper', label: 'Streichen der Heizkörper' },
  { value: 'tapezieren', label: 'Tapezieren' },
  { value: 'fliesen_reinigen', label: 'Reinigen der Fliesen und Fugen' },
  { value: 'bodenbelag', label: 'Grundreinigung/Aufarbeitung Bodenbelag' },
]

export default function SchoenheitsreparaturenPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'schoenheitsreparaturen',
    generateTitle: (data) => `Schönheitsreparaturen - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Schönheitsreparaturen'
  })

  React.useEffect(() => {
    const id = searchParams.get('id')
    if (id && user) {
      const loadDocument = async () => {
        const doc = await getDocument(id, user.id)
        if (doc?.data) {
          setFormData({ ...INITIAL_DATA, ...doc.data })
        }
      }
      loadDocument()
    }
  }, [searchParams, user])

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleRaum = (value: string) => {
    const current = formData.raeume
    if (current.includes(value)) {
      updateData({ raeume: current.filter(v => v !== value) })
    } else {
      updateData({ raeume: [...current, value] })
    }
  }

  const toggleArbeit = (value: string) => {
    const current = formData.arbeiten
    if (current.includes(value)) {
      updateData({ arbeiten: current.filter(v => v !== value) })
    } else {
      updateData({ arbeiten: [...current, value] })
    }
  }

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateSchoenheitsreparaturenPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Vereinbarung wurde als PDF heruntergeladen.' })
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
            <div className="p-2 bg-amber-100 rounded-lg">
              <Paintbrush className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Schönheitsreparaturen</h1>
              <p className="text-muted-foreground">Vereinbarung über durchzuführende Schönheitsreparaturen</p>
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
              <CardTitle>Mietobjekt</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse des Mietobjekts"
                required
              />
            </CardContent>
          </Card>

          {/* Räume */}
          <Card>
            <CardHeader>
              <CardTitle>Betroffene Räume</CardTitle>
              <CardDescription>
                Wählen Sie die Räume, in denen Schönheitsreparaturen durchgeführt werden sollen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {RAEUME_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`raum-${option.value}`}
                      checked={formData.raeume.includes(option.value)}
                      onCheckedChange={() => toggleRaum(option.value)}
                    />
                    <Label htmlFor={`raum-${option.value}`} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Arbeiten */}
          <Card>
            <CardHeader>
              <CardTitle>Durchzuführende Arbeiten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ARBEITEN_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`arbeit-${option.value}`}
                      checked={formData.arbeiten.includes(option.value)}
                      onCheckedChange={() => toggleArbeit(option.value)}
                    />
                    <Label htmlFor={`arbeit-${option.value}`} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Anforderungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Farbvorgaben</Label>
                <Textarea
                  value={formData.farbvorgaben}
                  onChange={(e) => updateData({ farbvorgaben: e.target.value })}
                  placeholder="z.B. Alle Wände in neutralem Weiß (RAL 9010)..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Qualitätsanforderungen</Label>
                <Textarea
                  value={formData.qualitaetsanforderungen}
                  onChange={(e) => updateData({ qualitaetsanforderungen: e.target.value })}
                  placeholder="z.B. Fachgerechte Ausführung, keine sichtbaren Farbnasen..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fristen */}
          <Card>
            <CardHeader>
              <CardTitle>Durchführung und Fristen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Durchführung durch</Label>
                <Input
                  value={formData.durchfuehrung}
                  onChange={(e) => updateData({ durchfuehrung: e.target.value })}
                  placeholder="z.B. Mieter / Fachfirma"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fertigstellung bis</Label>
                  <Input
                    type="date"
                    value={formData.fristBis}
                    onChange={(e) => updateData({ fristBis: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Abnahmetermin</Label>
                  <Input
                    type="date"
                    value={formData.abnahmetermin}
                    onChange={(e) => updateData({ abnahmetermin: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Sondervereinbarungen</Label>
                <Textarea
                  value={formData.sondervereinbarungen}
                  onChange={(e) => updateData({ sondervereinbarungen: e.target.value })}
                  placeholder="Weitere Vereinbarungen..."
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
