import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ThumbsUp, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateMieterhoehungszustimmungPDF } from '@/lib/pdf/mieterhoehungszustimmung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  mieter: PersonData
  mieterAdresse: AddressData
  vermieter: PersonData
  vermieterAdresse: AddressData
  mietobjektAdresse: AddressData
  mieterhoehungVom: string
  bisherigeMiete: number | null
  neueMiete: number | null
  gueltigAb: string
  zustimmungErteilt: boolean
  unterschriftMieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mieterhoehungVom: '',
  bisherigeMiete: null,
  neueMiete: null,
  gueltigAb: '',
  zustimmungErteilt: false,
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function MieterhoehungszustimmungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'mieterhoehungszustimmung',
    generateTitle: (data) => `Mieterhöhungszustimmung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Mieterhöhungszustimmung'
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

  const differenz = formData.neueMiete && formData.bisherigeMiete
    ? formData.neueMiete - formData.bisherigeMiete
    : null

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateMieterhoehungszustimmungPDF({ ...formData, differenz })
      toast({ title: 'PDF erstellt', description: 'Die Zustimmungserklärung wurde als PDF gespeichert.' })
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
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mieterhöhungszustimmung</h1>
              <p className="text-muted-foreground">Zustimmungserklärung des Mieters zur Mieterhöhung</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mieter */}
          <Card>
            <CardHeader>
              <CardTitle>Mieter (Absender)</CardTitle>
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
                label="Aktuelle Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter (Empfänger)</CardTitle>
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

          {/* Mieterhöhung */}
          <Card>
            <CardHeader>
              <CardTitle>Mieterhöhung</CardTitle>
              <CardDescription>
                Details zur Mieterhöhung, der zugestimmt wird
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mieterhöhungsschreiben vom *</Label>
                <Input
                  type="date"
                  value={formData.mieterhoehungVom}
                  onChange={(e) => updateData({ mieterhoehungVom: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Bisherige Miete (Kaltmiete)"
                  value={formData.bisherigeMiete}
                  onChange={(v) => updateData({ bisherigeMiete: v })}
                />
                <CurrencyField
                  label="Neue Miete (Kaltmiete)"
                  value={formData.neueMiete}
                  onChange={(v) => updateData({ neueMiete: v })}
                />
              </div>

              {differenz !== null && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium">Erhöhung: {differenz.toFixed(2)} € pro Monat</p>
                </div>
              )}

              <div>
                <Label>Neue Miete gültig ab *</Label>
                <Input
                  type="date"
                  value={formData.gueltigAb}
                  onChange={(e) => updateData({ gueltigAb: e.target.value })}
                />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="zustimmung"
                    checked={formData.zustimmungErteilt}
                    onCheckedChange={(c) => updateData({ zustimmungErteilt: !!c })}
                  />
                  <Label htmlFor="zustimmung" className="font-medium">
                    Ich stimme der Mieterhöhung ausdrücklich zu
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschrift</CardTitle>
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
                value={formData.unterschriftMieter}
                onChange={(v) => updateData({ unterschriftMieter: v })}
                label="Unterschrift des Mieters"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link to="/">Abbrechen</Link>
            </Button>
            {documentId && (
              <Button variant="outline" onClick={handleGeneratePDF} disabled={isLoading || !formData.zustimmungErteilt}>
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
