import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileCheck, Save, FileDown } from 'lucide-react'
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
import { generateAufhebungsvertragPDF } from '@/lib/pdf/aufhebungsvertrag-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData
  mietobjektAdresse: AddressData
  mietvertragVom: string
  aufhebungsdatum: string
  wohnungsuebergabe: string
  kautionRueckzahlung: boolean
  kautionHoehe: number | null
  abfindungVereinbart: boolean
  abfindungshoehe: number | null
  schoenheitsreparaturen: 'mieter' | 'vermieter' | 'keine'
  offeneForderungenVermieter: boolean
  offeneForderungenMieter: boolean
  offeneForderungenDetails: string
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
  mieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mietvertragVom: '',
  aufhebungsdatum: '',
  wohnungsuebergabe: '',
  kautionRueckzahlung: true,
  kautionHoehe: null,
  abfindungVereinbart: false,
  abfindungshoehe: null,
  schoenheitsreparaturen: 'keine',
  offeneForderungenVermieter: false,
  offeneForderungenMieter: false,
  offeneForderungenDetails: '',
  sonstigeVereinbarungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function AufhebungsvertragPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'aufhebungsvertrag',
    generateTitle: (data) => `Aufhebungsvertrag - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Aufhebungsvertrag'
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

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateAufhebungsvertragPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Der Aufhebungsvertrag wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-teal-100 rounded-lg">
              <FileCheck className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mietaufhebungsvertrag</h1>
              <p className="text-muted-foreground">Einvernehmliche Beendigung des Mietverhältnisses</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            Mit einem Aufhebungsvertrag können Vermieter und Mieter das Mietverhältnis einvernehmlich
            zu einem beliebigen Zeitpunkt beenden – unabhängig von gesetzlichen Kündigungsfristen.
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
            <CardContent className="space-y-4">
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse des Mietobjekts"
                required
              />
              <div>
                <Label>Ursprünglicher Mietvertrag vom</Label>
                <Input
                  type="date"
                  value={formData.mietvertragVom}
                  onChange={(e) => updateData({ mietvertragVom: e.target.value })}
                  className="w-48"
                />
              </div>
            </CardContent>
          </Card>

          {/* Aufhebung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Aufhebungsvereinbarung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mietende (Aufhebungsdatum) *</Label>
                  <Input
                    type="date"
                    value={formData.aufhebungsdatum}
                    onChange={(e) => updateData({ aufhebungsdatum: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Wohnungsübergabe *</Label>
                  <Input
                    type="date"
                    value={formData.wohnungsuebergabe}
                    onChange={(e) => updateData({ wohnungsuebergabe: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kaution und Abfindung */}
          <Card>
            <CardHeader>
              <CardTitle>Kaution und Abfindung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="kaution"
                  checked={formData.kautionRueckzahlung}
                  onCheckedChange={(c) => updateData({ kautionRueckzahlung: !!c })}
                />
                <Label htmlFor="kaution">Kaution wird zurückgezahlt</Label>
              </div>
              {formData.kautionRueckzahlung && (
                <CurrencyField
                  label="Kautionshöhe"
                  value={formData.kautionHoehe}
                  onChange={(v) => updateData({ kautionHoehe: v })}
                />
              )}

              <Separator />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="abfindung"
                  checked={formData.abfindungVereinbart}
                  onCheckedChange={(c) => updateData({ abfindungVereinbart: !!c })}
                />
                <Label htmlFor="abfindung">Abfindung wird gezahlt (z.B. Umzugskostenzuschuss)</Label>
              </div>
              {formData.abfindungVereinbart && (
                <CurrencyField
                  label="Abfindungshöhe"
                  value={formData.abfindungshoehe}
                  onChange={(v) => updateData({ abfindungshoehe: v })}
                />
              )}
            </CardContent>
          </Card>

          {/* Schönheitsreparaturen */}
          <Card>
            <CardHeader>
              <CardTitle>Schönheitsreparaturen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { value: 'keine', label: 'Keine Schönheitsreparaturen erforderlich' },
                  { value: 'mieter', label: 'Mieter führt Schönheitsreparaturen durch' },
                  { value: 'vermieter', label: 'Vermieter übernimmt Schönheitsreparaturen' },
                ].map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={option.value}
                      name="schoenheitsreparaturen"
                      checked={formData.schoenheitsreparaturen === option.value}
                      onChange={() => updateData({ schoenheitsreparaturen: option.value as typeof formData.schoenheitsreparaturen })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Offene Forderungen */}
          <Card>
            <CardHeader>
              <CardTitle>Offene Forderungen</CardTitle>
              <CardDescription>Gibt es noch gegenseitige Ansprüche?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="forderungenVermieter"
                  checked={formData.offeneForderungenVermieter}
                  onCheckedChange={(c) => updateData({ offeneForderungenVermieter: !!c })}
                />
                <Label htmlFor="forderungenVermieter">Offene Forderungen des Vermieters</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="forderungenMieter"
                  checked={formData.offeneForderungenMieter}
                  onCheckedChange={(c) => updateData({ offeneForderungenMieter: !!c })}
                />
                <Label htmlFor="forderungenMieter">Offene Forderungen des Mieters</Label>
              </div>
              {(formData.offeneForderungenVermieter || formData.offeneForderungenMieter) && (
                <Textarea
                  value={formData.offeneForderungenDetails}
                  onChange={(e) => updateData({ offeneForderungenDetails: e.target.value })}
                  placeholder="Beschreiben Sie die offenen Forderungen..."
                  rows={3}
                />
              )}
              {!formData.offeneForderungenVermieter && !formData.offeneForderungenMieter && (
                <p className="text-sm text-muted-foreground">
                  Mit Unterzeichnung dieses Vertrages sind alle gegenseitigen Ansprüche aus dem
                  Mietverhältnis abgegolten.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sonstige Vereinbarungen */}
          <Card>
            <CardHeader>
              <CardTitle>Sonstige Vereinbarungen</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.sonstigeVereinbarungen}
                onChange={(e) => updateData({ sonstigeVereinbarungen: e.target.value })}
                placeholder="Weitere Vereinbarungen, z.B. Übernahme von Einbauten, Möbeln, etc."
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
