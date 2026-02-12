import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Users, Plus, Trash2, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { generateWGMietvertragPDF } from '@/lib/pdf/wg-mietvertrag-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface WGMitglied {
  id: string
  person: PersonData
  zimmerNr: string
  zimmerGroesse: string
  mietanteil: number | null
  nebenkostenanteil: number | null
}

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  wgMitglieder: WGMitglied[]
  mietobjektAdresse: AddressData
  gesamtflaeche: string
  gesamtzimmer: string
  gemeinschaftsraeume: string
  mietbeginn: string
  vertragsmodell: 'hauptmieter' | 'alle_gleichberechtigt'
  gesamtmiete: number | null
  gesamtnebenkosten: number | null
  kaution: number | null
  kuendigungsfristMonate: string
  nachmieterKlausel: boolean
  unterschriftVermieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  wgMitglieder: [
    { id: '1', person: { ...EMPTY_PERSON }, zimmerNr: '1', zimmerGroesse: '', mietanteil: null, nebenkostenanteil: null },
    { id: '2', person: { ...EMPTY_PERSON }, zimmerNr: '2', zimmerGroesse: '', mietanteil: null, nebenkostenanteil: null },
  ],
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  gesamtflaeche: '',
  gesamtzimmer: '',
  gemeinschaftsraeume: 'Küche, Bad, Flur',
  mietbeginn: '',
  vertragsmodell: 'alle_gleichberechtigt',
  gesamtmiete: null,
  gesamtnebenkosten: null,
  kaution: null,
  kuendigungsfristMonate: '3',
  nachmieterKlausel: true,
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function WGMietvertragPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'wg-mietvertrag',
    generateTitle: (data) => `WG-Mietvertrag - ${data.mietobjektAdresse?.strasse || ''} ${data.mietobjektAdresse?.hausnummer || ''}`.trim() || 'WG-Mietvertrag'
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

  const addMitglied = () => {
    const newId = Date.now().toString()
    const newNr = (formData.wgMitglieder.length + 1).toString()
    updateData({
      wgMitglieder: [
        ...formData.wgMitglieder,
        { id: newId, person: { ...EMPTY_PERSON }, zimmerNr: newNr, zimmerGroesse: '', mietanteil: null, nebenkostenanteil: null }
      ]
    })
  }

  const removeMitglied = (id: string) => {
    updateData({
      wgMitglieder: formData.wgMitglieder.filter(m => m.id !== id)
    })
  }

  const updateMitglied = (id: string, updates: Partial<WGMitglied>) => {
    updateData({
      wgMitglieder: formData.wgMitglieder.map(m =>
        m.id === id ? { ...m, ...updates } : m
      )
    })
  }

  const gesamtMietanteil = formData.wgMitglieder.reduce((sum, m) => sum + (m.mietanteil || 0), 0)
  const gesamtNebenkostenanteil = formData.wgMitglieder.reduce((sum, m) => sum + (m.nebenkostenanteil || 0), 0)

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateWGMietvertragPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Der WG-Mietvertrag wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-pink-100 rounded-lg">
              <Users className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">WG-Mietvertrag</h1>
              <p className="text-muted-foreground">Mietvertrag für Wohngemeinschaften</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            Bei einer WG können alle Mieter gemeinsam als Hauptmieter im Vertrag stehen oder
            ein Hauptmieter schließt Untermietverträge ab. Dieser Vertrag ist für das Modell
            "alle Mieter als gemeinsame Vertragspartner" konzipiert.
          </AlertDescription>
        </Alert>

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

          {/* WG-Mitglieder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                WG-Mitglieder (Mieter)
              </CardTitle>
              <CardDescription>
                Alle WG-Mitglieder werden gemeinsam Vertragspartner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.wgMitglieder.map((mitglied, idx) => (
                <div key={mitglied.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">WG-Mitglied {idx + 1}</h4>
                    {formData.wgMitglieder.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMitglied(mitglied.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <PersonField
                    value={mitglied.person}
                    onChange={(v) => updateMitglied(mitglied.id, { person: v })}
                    label="Person"
                    required
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Zimmer-Nr.</Label>
                      <Input
                        value={mitglied.zimmerNr}
                        onChange={(e) => updateMitglied(mitglied.id, { zimmerNr: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Zimmergröße (m²)</Label>
                      <Input
                        value={mitglied.zimmerGroesse}
                        onChange={(e) => updateMitglied(mitglied.id, { zimmerGroesse: e.target.value })}
                      />
                    </div>
                    <div>
                      <CurrencyField
                        label="Mietanteil"
                        value={mitglied.mietanteil}
                        onChange={(v) => updateMitglied(mitglied.id, { mietanteil: v })}
                      />
                    </div>
                    <div>
                      <CurrencyField
                        label="NK-Anteil"
                        value={mitglied.nebenkostenanteil}
                        onChange={(v) => updateMitglied(mitglied.id, { nebenkostenanteil: v })}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addMitglied} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                WG-Mitglied hinzufügen
              </Button>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Summe Mietanteile:</span>
                  <span className="font-medium">{formatCurrency(gesamtMietanteil)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Summe NK-Anteile:</span>
                  <span className="font-medium">{formatCurrency(gesamtNebenkostenanteil)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Gesamt:</span>
                  <span>{formatCurrency(gesamtMietanteil + gesamtNebenkostenanteil)}</span>
                </div>
              </div>
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
                label="Adresse der WG"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Gesamtfläche (m²) *</Label>
                  <Input
                    type="number"
                    value={formData.gesamtflaeche}
                    onChange={(e) => updateData({ gesamtflaeche: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Anzahl Zimmer</Label>
                  <Input
                    value={formData.gesamtzimmer}
                    onChange={(e) => updateData({ gesamtzimmer: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Mietbeginn *</Label>
                  <Input
                    type="date"
                    value={formData.mietbeginn}
                    onChange={(e) => updateData({ mietbeginn: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Gemeinschaftsräume</Label>
                <Input
                  value={formData.gemeinschaftsraeume}
                  onChange={(e) => updateData({ gemeinschaftsraeume: e.target.value })}
                  placeholder="z.B. Küche, Bad, Flur, Balkon"
                />
              </div>
            </CardContent>
          </Card>

          {/* Miete & Regelungen */}
          <Card>
            <CardHeader>
              <CardTitle>Miete und Kaution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CurrencyField
                  label="Gesamtmiete (Kalt) *"
                  value={formData.gesamtmiete}
                  onChange={(v) => updateData({ gesamtmiete: v })}
                />
                <CurrencyField
                  label="Gesamtnebenkosten *"
                  value={formData.gesamtnebenkosten}
                  onChange={(v) => updateData({ gesamtnebenkosten: v })}
                />
                <CurrencyField
                  label="Kaution gesamt"
                  value={formData.kaution}
                  onChange={(v) => updateData({ kaution: v })}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kündigungsfrist (Monate)</Label>
                  <Select
                    value={formData.kuendigungsfristMonate}
                    onValueChange={(v) => updateData({ kuendigungsfristMonate: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Monat</SelectItem>
                      <SelectItem value="2">2 Monate</SelectItem>
                      <SelectItem value="3">3 Monate (gesetzlich)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              <SignatureField
                value={formData.unterschriftVermieter}
                onChange={(v) => updateData({ unterschriftVermieter: v })}
                label="Unterschrift Vermieter"
                required
              />
              <p className="text-sm text-muted-foreground">
                Die WG-Mitglieder unterschreiben jeweils auf einer separaten Unterschriftenseite.
              </p>
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
