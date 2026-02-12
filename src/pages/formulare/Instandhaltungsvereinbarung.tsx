import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Settings, Save, FileDown } from 'lucide-react'
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
import { generateInstandhaltungsvereinbarungPDF } from '@/lib/pdf/instandhaltungsvereinbarung-pdf'
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
  mieterPflichten: string[]
  vermieterPflichten: string[]
  kleinreparaturgrenze: string
  jahreshoechstgrenze: string
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
  mieterPflichten: [],
  vermieterPflichten: [],
  kleinreparaturgrenze: '100',
  jahreshoechstgrenze: '300',
  sondervereinbarungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const MIETER_PFLICHTEN_OPTIONEN = [
  { value: 'lampen', label: 'Lampenwechsel und Leuchtmittel' },
  { value: 'wasserhahn', label: 'Dichtungen an Wasserhähnen' },
  { value: 'tuerklinken', label: 'Türklinken und Türschlösser' },
  { value: 'jalousien', label: 'Bedienelemente von Jalousien und Rollläden' },
  { value: 'steckdosen', label: 'Steckdosen und Lichtschalter (nicht elektrisch)' },
  { value: 'duschbrause', label: 'Duschbrausen und Duschschläuche' },
  { value: 'heizkoerperventile', label: 'Heizkörperventile' },
  { value: 'silikonfugen', label: 'Silikonfugen in Bad und Küche' },
]

const VERMIETER_PFLICHTEN_OPTIONEN = [
  { value: 'heizung', label: 'Wartung und Reparatur der Heizungsanlage' },
  { value: 'dach', label: 'Dachreparaturen' },
  { value: 'fassade', label: 'Fassade und Außenwände' },
  { value: 'fenster', label: 'Fenster und Außentüren (außer Kleinreparaturen)' },
  { value: 'elektrik', label: 'Elektrische Leitungen und Sicherungen' },
  { value: 'sanitaer', label: 'Sanitäre Leitungen' },
  { value: 'aufzug', label: 'Aufzugsanlage (falls vorhanden)' },
  { value: 'treppenhaus', label: 'Gemeinschaftsflächen und Treppenhaus' },
]

export default function InstandhaltungsvereinbarungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'instandhaltungsvereinbarung',
    generateTitle: (data) => `Instandhaltungsvereinbarung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Instandhaltungsvereinbarung'
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

  const toggleMieterPflicht = (value: string) => {
    const current = formData.mieterPflichten
    if (current.includes(value)) {
      updateData({ mieterPflichten: current.filter(v => v !== value) })
    } else {
      updateData({ mieterPflichten: [...current, value] })
    }
  }

  const toggleVermieterPflicht = (value: string) => {
    const current = formData.vermieterPflichten
    if (current.includes(value)) {
      updateData({ vermieterPflichten: current.filter(v => v !== value) })
    } else {
      updateData({ vermieterPflichten: [...current, value] })
    }
  }

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateInstandhaltungsvereinbarungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Instandhaltungsvereinbarung wurde als PDF heruntergeladen.' })
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Instandhaltungsvereinbarung</h1>
              <p className="text-muted-foreground">Regelung der Instandhaltungspflichten zwischen Vermieter und Mieter</p>
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

          {/* Pflichten Mieter */}
          <Card>
            <CardHeader>
              <CardTitle>Pflichten des Mieters (Kleinreparaturen)</CardTitle>
              <CardDescription>
                Wählen Sie die Kleinreparaturen, für die der Mieter aufkommen soll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {MIETER_PFLICHTEN_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mieter-${option.value}`}
                      checked={formData.mieterPflichten.includes(option.value)}
                      onCheckedChange={() => toggleMieterPflicht(option.value)}
                    />
                    <Label htmlFor={`mieter-${option.value}`} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <Label>Obergrenze je Einzelreparatur (€)</Label>
                  <Input
                    value={formData.kleinreparaturgrenze}
                    onChange={(e) => updateData({ kleinreparaturgrenze: e.target.value })}
                    placeholder="z.B. 100"
                  />
                </div>
                <div>
                  <Label>Jahreshöchstgrenze (€)</Label>
                  <Input
                    value={formData.jahreshoechstgrenze}
                    onChange={(e) => updateData({ jahreshoechstgrenze: e.target.value })}
                    placeholder="z.B. 300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pflichten Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Pflichten des Vermieters</CardTitle>
              <CardDescription>
                Instandhaltungspflichten, die beim Vermieter verbleiben
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {VERMIETER_PFLICHTEN_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vermieter-${option.value}`}
                      checked={formData.vermieterPflichten.includes(option.value)}
                      onCheckedChange={() => toggleVermieterPflicht(option.value)}
                    />
                    <Label htmlFor={`vermieter-${option.value}`} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sondervereinbarungen */}
          <Card>
            <CardHeader>
              <CardTitle>Sondervereinbarungen</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.sondervereinbarungen}
                onChange={(e) => updateData({ sondervereinbarungen: e.target.value })}
                placeholder="Weitere Vereinbarungen zur Instandhaltung..."
                rows={4}
              />
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
