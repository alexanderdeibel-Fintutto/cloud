import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Hammer, Save, FileDown } from 'lucide-react'
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
import { generateBaulicheAenderungPDF } from '@/lib/pdf/bauliche-aenderung-pdf'
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
  beschreibung: string
  begruendung: string
  rueckbau: boolean
  rueckbauDetails: string
  auflagen: string
  genehmigt: boolean
  unterschriftVermieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  beschreibung: '',
  begruendung: '',
  rueckbau: true,
  rueckbauDetails: '',
  auflagen: '',
  genehmigt: true,
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function BaulicheAenderungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'bauliche-aenderung',
    generateTitle: (data) => `Bauliche Änderung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Bauliche Änderung'
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

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateBaulicheAenderungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Genehmigung wurde als PDF heruntergeladen.' })
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
              <Hammer className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Genehmigung baulicher Änderungen</h1>
              <p className="text-muted-foreground">Erlaubnis für bauliche Veränderungen am Mietobjekt</p>
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
              <CardTitle>Mieter (Antragsteller)</CardTitle>
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

          {/* Bauliche Änderung */}
          <Card>
            <CardHeader>
              <CardTitle>Geplante bauliche Änderung</CardTitle>
              <CardDescription>
                Beschreibung der beantragten Maßnahme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Beschreibung der Maßnahme *</Label>
                <Textarea
                  value={formData.beschreibung}
                  onChange={(e) => updateData({ beschreibung: e.target.value })}
                  placeholder="z.B. Einbau einer Einbauküche, Installation einer Klimaanlage, Anbringen von Wandregalen..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Begründung</Label>
                <Textarea
                  value={formData.begruendung}
                  onChange={(e) => updateData({ begruendung: e.target.value })}
                  placeholder="Warum wird die Maßnahme gewünscht..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Entscheidung */}
          <Card>
            <CardHeader>
              <CardTitle>Entscheidung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="genehmigt"
                  checked={formData.genehmigt}
                  onCheckedChange={(c) => updateData({ genehmigt: !!c })}
                />
                <Label htmlFor="genehmigt" className="font-medium">
                  Bauliche Änderung wird genehmigt
                </Label>
              </div>

              {formData.genehmigt && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rueckbau"
                      checked={formData.rueckbau}
                      onCheckedChange={(c) => updateData({ rueckbau: !!c })}
                    />
                    <Label htmlFor="rueckbau">
                      Rückbauverpflichtung bei Mietende
                    </Label>
                  </div>

                  {formData.rueckbau && (
                    <div>
                      <Label>Details zur Rückbauverpflichtung</Label>
                      <Textarea
                        value={formData.rueckbauDetails}
                        onChange={(e) => updateData({ rueckbauDetails: e.target.value })}
                        placeholder="Einzelheiten zum Rückbau, falls abweichend vom Standard..."
                        rows={2}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Auflagen und Bedingungen</Label>
                    <Textarea
                      value={formData.auflagen}
                      onChange={(e) => updateData({ auflagen: e.target.value })}
                      placeholder="z.B. Durchführung nur durch Fachfirma, Einholung von Genehmigungen..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschrift des Vermieters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <SignatureField
                value={formData.unterschriftVermieter}
                onChange={(v) => updateData({ unterschriftVermieter: v })}
                label="Unterschrift Vermieter"
              />
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
