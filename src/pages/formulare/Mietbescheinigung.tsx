import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileCheck, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateMietbescheinigungPDF } from '@/lib/pdf/mietbescheinigung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  wohnflaeche: string
  zimmer: string
  mietbeginn: string
  mietende: string
  unbefristet: boolean
  kaltmiete: number | null
  nebenkosten: number | null
  warmmiete: number | null
  verwendungszweck: string
  unterschriftVermieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  wohnflaeche: '',
  zimmer: '',
  mietbeginn: '',
  mietende: '',
  unbefristet: true,
  kaltmiete: null,
  nebenkosten: null,
  warmmiete: null,
  verwendungszweck: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function MietbescheinigungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'mietbescheinigung',
    generateTitle: (data) => `Mietbescheinigung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Mietbescheinigung'
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

  // Berechne Warmmiete
  React.useEffect(() => {
    const warm = (formData.kaltmiete || 0) + (formData.nebenkosten || 0)
    if (warm > 0) {
      updateData({ warmmiete: warm })
    }
  }, [formData.kaltmiete, formData.nebenkosten])

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateMietbescheinigungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Mietbescheinigung wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mietbescheinigung</h1>
              <p className="text-muted-foreground">Bestätigung des Mietverhältnisses (z.B. für Behörden)</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter (Aussteller)</CardTitle>
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
            <CardContent>
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
                label="Adresse"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Wohnfläche (m²)</Label>
                  <Input
                    value={formData.wohnflaeche}
                    onChange={(e) => updateData({ wohnflaeche: e.target.value })}
                    placeholder="z.B. 75"
                  />
                </div>
                <div>
                  <Label>Anzahl Zimmer</Label>
                  <Input
                    value={formData.zimmer}
                    onChange={(e) => updateData({ zimmer: e.target.value })}
                    placeholder="z.B. 3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mietverhältnis */}
          <Card>
            <CardHeader>
              <CardTitle>Mietverhältnis</CardTitle>
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
                  <Label>Mietende (falls befristet)</Label>
                  <Input
                    type="date"
                    value={formData.mietende}
                    onChange={(e) => updateData({ mietende: e.target.value })}
                    disabled={formData.unbefristet}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CurrencyField
                  label="Kaltmiete"
                  value={formData.kaltmiete}
                  onChange={(v) => updateData({ kaltmiete: v })}
                />
                <CurrencyField
                  label="Nebenkosten"
                  value={formData.nebenkosten}
                  onChange={(v) => updateData({ nebenkosten: v })}
                />
                <CurrencyField
                  label="Warmmiete (gesamt)"
                  value={formData.warmmiete}
                  onChange={(v) => updateData({ warmmiete: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Verwendungszweck */}
          <Card>
            <CardHeader>
              <CardTitle>Verwendungszweck (optional)</CardTitle>
              <CardDescription>
                Für welche Stelle wird die Bescheinigung benötigt?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={formData.verwendungszweck}
                onChange={(e) => updateData({ verwendungszweck: e.target.value })}
                placeholder="z.B. Vorlage beim Jobcenter, Bürgergeldantrag, Wohngeldantrag"
              />
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Bestätigung</CardTitle>
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
