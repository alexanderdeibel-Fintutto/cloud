import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, PaintBucket, Plus, X, Save, FileDown } from 'lucide-react'
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
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateRenovierungsvereinbarungPDF } from '@/lib/pdf/renovierungsvereinbarung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface Massnahme {
  id: string
  beschreibung: string
  verantwortlich: string
}

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  renovierungsanlass: string
  massnahmen: Massnahme[]
  durchfuehrungBis: string
  kostentraeger: string
  qualitaetsstandard: string[]
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
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  renovierungsanlass: '',
  massnahmen: [{ id: '1', beschreibung: '', verantwortlich: '' }],
  durchfuehrungBis: '',
  kostentraeger: '',
  qualitaetsstandard: [],
  sonstigeVereinbarungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const QUALITAET_OPTIONEN = [
  { value: 'fachgerecht', label: 'Fachgerechte Ausführung erforderlich' },
  { value: 'neutral', label: 'Neutrale/helle Farben verwenden' },
  { value: 'tapete', label: 'Tapeten entfernen und weiß streichen' },
  { value: 'boden', label: 'Bodenbeläge in ordnungsgemäßem Zustand' },
  { value: 'original', label: 'Rückbau in ursprünglichen Zustand' },
]

export default function RenovierungsvereinbarungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'renovierungsvereinbarung',
    generateTitle: (data) => `Renovierungsvereinbarung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Renovierungsvereinbarung'
  })

  // Load existing document if editing
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

  const handleSubmit = () => {
    handleSave(formData)
  }

  const addMassnahme = () => {
    const newId = Date.now().toString()
    updateData({ massnahmen: [...formData.massnahmen, { id: newId, beschreibung: '', verantwortlich: '' }] })
  }

  const removeMassnahme = (id: string) => {
    if (formData.massnahmen.length > 1) {
      updateData({ massnahmen: formData.massnahmen.filter(m => m.id !== id) })
    }
  }

  const updateMassnahme = (id: string, field: keyof Massnahme, value: string) => {
    updateData({
      massnahmen: formData.massnahmen.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    })
  }

  const toggleQualitaet = (value: string) => {
    const current = formData.qualitaetsstandard
    if (current.includes(value)) {
      updateData({ qualitaetsstandard: current.filter(v => v !== value) })
    } else {
      updateData({ qualitaetsstandard: [...current, value] })
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateRenovierungsvereinbarungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Renovierungsvereinbarung wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-yellow-100 rounded-lg">
              <PaintBucket className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Renovierungsvereinbarung</h1>
              <p className="text-muted-foreground">Vereinbarung über Renovierungsarbeiten zwischen Vermieter und Mieter</p>
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
            </CardContent>
          </Card>

          {/* Mietobjekt */}
          <Card>
            <CardHeader>
              <CardTitle>Mietobjekt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse des Mietobjekts"
                required
              />
              <div>
                <Label>Anlass der Renovierung</Label>
                <Input
                  value={formData.renovierungsanlass}
                  onChange={(e) => updateData({ renovierungsanlass: e.target.value })}
                  placeholder="z.B. Auszug, planmäßige Renovierung, Instandsetzung"
                />
              </div>
            </CardContent>
          </Card>

          {/* Maßnahmen */}
          <Card>
            <CardHeader>
              <CardTitle>Renovierungsmaßnahmen</CardTitle>
              <CardDescription>
                Vereinbarte Arbeiten und Verantwortlichkeiten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.massnahmen.map((massnahme, index) => (
                <div key={massnahme.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Maßnahme {index + 1}</span>
                    {formData.massnahmen.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMassnahme(massnahme.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={massnahme.beschreibung}
                      onChange={(e) => updateMassnahme(massnahme.id, 'beschreibung', e.target.value)}
                      placeholder="z.B. Wände und Decken weiß streichen"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Verantwortlich</Label>
                    <Input
                      value={massnahme.verantwortlich}
                      onChange={(e) => updateMassnahme(massnahme.id, 'verantwortlich', e.target.value)}
                      placeholder="z.B. Mieter, Vermieter, Fachfirma"
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addMassnahme} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Weitere Maßnahme hinzufügen
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Durchführung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Durchführung bis</Label>
                  <Input
                    type="date"
                    value={formData.durchfuehrungBis}
                    onChange={(e) => updateData({ durchfuehrungBis: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Kostenträger</Label>
                  <Input
                    value={formData.kostentraeger}
                    onChange={(e) => updateData({ kostentraeger: e.target.value })}
                    placeholder="z.B. Mieter, Vermieter, 50/50"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Qualitätsstandards</Label>
                <div className="space-y-2">
                  {QUALITAET_OPTIONEN.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.qualitaetsstandard.includes(option.value)}
                        onCheckedChange={() => toggleQualitaet(option.value)}
                      />
                      <Label htmlFor={option.value} className="font-normal">{option.label}</Label>
                    </div>
                  ))}
                </div>
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
