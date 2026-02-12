import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Wrench, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { generateHausmeistervereinbarungPDF } from '@/lib/pdf/hausmeistervereinbarung-pdf'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  auftraggeber: PersonData
  auftraggeberAdresse: AddressData
  hausmeister: PersonData
  hausmeisterAdresse: AddressData
  objektAdresse: AddressData
  vertragsbeginn: string
  verguetung: number | null
  zahlungsrhythmus: string
  aufgaben: string[]
  sonstigeAufgaben: string
  arbeitszeiten: string
  kuendigungsfrist: string
  unterschriftAuftraggeber: SignatureData
  unterschriftHausmeister: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  auftraggeber: { ...EMPTY_PERSON },
  auftraggeberAdresse: { ...EMPTY_ADDRESS },
  hausmeister: { ...EMPTY_PERSON },
  hausmeisterAdresse: { ...EMPTY_ADDRESS },
  objektAdresse: { ...EMPTY_ADDRESS },
  vertragsbeginn: '',
  verguetung: null,
  zahlungsrhythmus: 'monatlich',
  aufgaben: [],
  sonstigeAufgaben: '',
  arbeitszeiten: '',
  kuendigungsfrist: '3',
  unterschriftAuftraggeber: { ...EMPTY_SIGNATURE },
  unterschriftHausmeister: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const AUFGABEN_OPTIONEN = [
  { value: 'reinigung', label: 'Reinigung von Treppenhaus und Gemeinschaftsflächen' },
  { value: 'muell', label: 'Mülltonnenbereitstellung und -rückholung' },
  { value: 'winterdienst', label: 'Winterdienst (Schneeräumen, Streuen)' },
  { value: 'garten', label: 'Gartenpflege und Grünschnitt' },
  { value: 'licht', label: 'Kontrolle und Wechsel von Leuchtmitteln' },
  { value: 'kleinreparaturen', label: 'Kleinreparaturen (Türklinken, Schlösser etc.)' },
  { value: 'kontrolle', label: 'Regelmäßige Kontrollgänge' },
  { value: 'handwerker', label: 'Koordination von Handwerkern' },
  { value: 'heizung', label: 'Kontrolle der Heizungsanlage' },
]

export default function HausmeistervereinbarungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'hausmeistervereinbarung',
    generateTitle: (data) => `Hausmeistervereinbarung - ${data.hausmeister?.vorname || ''} ${data.hausmeister?.nachname || ''}`.trim() || 'Hausmeistervereinbarung'
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

  const toggleAufgabe = (value: string) => {
    const current = formData.aufgaben
    if (current.includes(value)) {
      updateData({ aufgaben: current.filter(v => v !== value) })
    } else {
      updateData({ aufgaben: [...current, value] })
    }
  }

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateHausmeistervereinbarungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Hausmeistervereinbarung wurde als PDF heruntergeladen.' })
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
              <Wrench className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hausmeistervereinbarung</h1>
              <p className="text-muted-foreground">Vertrag über Hausmeisterleistungen</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Auftraggeber */}
          <Card>
            <CardHeader>
              <CardTitle>Auftraggeber</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.auftraggeber}
                onChange={(v) => updateData({ auftraggeber: v })}
                label="Auftraggeber (Vermieter/Hausverwaltung)"
                required
              />
              <AddressField
                value={formData.auftraggeberAdresse}
                onChange={(v) => updateData({ auftraggeberAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Hausmeister */}
          <Card>
            <CardHeader>
              <CardTitle>Hausmeister</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.hausmeister}
                onChange={(v) => updateData({ hausmeister: v })}
                label="Hausmeister"
                required
              />
              <AddressField
                value={formData.hausmeisterAdresse}
                onChange={(v) => updateData({ hausmeisterAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Objekt */}
          <Card>
            <CardHeader>
              <CardTitle>Zu betreuendes Objekt</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressField
                value={formData.objektAdresse}
                onChange={(v) => updateData({ objektAdresse: v })}
                label="Adresse des Objekts"
                required
              />
            </CardContent>
          </Card>

          {/* Aufgaben */}
          <Card>
            <CardHeader>
              <CardTitle>Leistungsumfang</CardTitle>
              <CardDescription>
                Wählen Sie die zu erbringenden Hausmeisterleistungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {AUFGABEN_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={formData.aufgaben.includes(option.value)}
                      onCheckedChange={() => toggleAufgabe(option.value)}
                    />
                    <Label htmlFor={option.value} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>

              <div>
                <Label>Sonstige Aufgaben</Label>
                <Textarea
                  value={formData.sonstigeAufgaben}
                  onChange={(e) => updateData({ sonstigeAufgaben: e.target.value })}
                  placeholder="Weitere vereinbarte Tätigkeiten..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Arbeitszeiten / Verfügbarkeit</Label>
                <Input
                  value={formData.arbeitszeiten}
                  onChange={(e) => updateData({ arbeitszeiten: e.target.value })}
                  placeholder="z.B. Mo-Fr 8-12 Uhr, telefonisch erreichbar"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vergütung */}
          <Card>
            <CardHeader>
              <CardTitle>Vergütung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Vergütung"
                  value={formData.verguetung}
                  onChange={(v) => updateData({ verguetung: v })}
                />
                <div>
                  <Label>Zahlungsrhythmus</Label>
                  <Input
                    value={formData.zahlungsrhythmus}
                    onChange={(e) => updateData({ zahlungsrhythmus: e.target.value })}
                    placeholder="z.B. monatlich, vierteljährlich"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Vertragsbeginn</Label>
                  <Input
                    type="date"
                    value={formData.vertragsbeginn}
                    onChange={(e) => updateData({ vertragsbeginn: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Kündigungsfrist (Monate)</Label>
                  <Input
                    value={formData.kuendigungsfrist}
                    onChange={(e) => updateData({ kuendigungsfrist: e.target.value })}
                    placeholder="z.B. 3"
                  />
                </div>
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
                  value={formData.unterschriftAuftraggeber}
                  onChange={(v) => updateData({ unterschriftAuftraggeber: v })}
                  label="Unterschrift Auftraggeber"
                />
                <SignatureField
                  value={formData.unterschriftHausmeister}
                  onChange={(v) => updateData({ unterschriftHausmeister: v })}
                  label="Unterschrift Hausmeister"
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
