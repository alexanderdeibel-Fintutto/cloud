import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Bell, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { generateErinnerungNebenkostenPDF } from '@/lib/pdf/erinnerung-nebenkosten-pdf'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  mieter: PersonData
  mieterAdresse: AddressData
  vermieter: PersonData
  vermieterAdresse: AddressData
  mietobjektAdresse: AddressData
  abrechnungsjahr: string
  abrechnungsfrist: string
  hinweis556: boolean
  fristsetzung: boolean
  fristBis: string
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
  abrechnungsjahr: (new Date().getFullYear() - 1).toString(),
  abrechnungsfrist: '',
  hinweis556: true,
  fristsetzung: true,
  fristBis: '',
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function ErinnerungNebenkostenPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'erinnerung-nebenkosten',
    generateTitle: (data) => `Erinnerung Nebenkosten ${data.abrechnungsjahr || ''} - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim()
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
      await generateErinnerungNebenkostenPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Erinnerung wurde als PDF heruntergeladen.' })
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Erinnerung Nebenkostenabrechnung</h1>
              <p className="text-muted-foreground">Aufforderung zur Zusendung der Nebenkostenabrechnung</p>
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
                label="Anschrift"
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

          {/* Abrechnung */}
          <Card>
            <CardHeader>
              <CardTitle>Abrechnungsdetails</CardTitle>
              <CardDescription>
                Angaben zur ausstehenden Nebenkostenabrechnung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Abrechnungsjahr *</Label>
                  <Input
                    value={formData.abrechnungsjahr}
                    onChange={(e) => updateData({ abrechnungsjahr: e.target.value })}
                    placeholder="z.B. 2024"
                  />
                </div>
                <div>
                  <Label>Abrechnungsfrist endet am</Label>
                  <Input
                    type="date"
                    value={formData.abrechnungsfrist}
                    onChange={(e) => updateData({ abrechnungsfrist: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    12 Monate nach Ende des Abrechnungszeitraums
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hinweis556"
                    checked={formData.hinweis556}
                    onCheckedChange={(c) => updateData({ hinweis556: !!c })}
                  />
                  <Label htmlFor="hinweis556" className="font-medium">
                    Hinweis auf § 556 Abs. 3 BGB (Abrechnungsfrist)
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Nach Ablauf der Frist sind Nachforderungen ausgeschlossen.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fristsetzung"
                  checked={formData.fristsetzung}
                  onCheckedChange={(c) => updateData({ fristsetzung: !!c })}
                />
                <Label htmlFor="fristsetzung">Frist setzen für Zusendung der Abrechnung</Label>
              </div>

              {formData.fristsetzung && (
                <div>
                  <Label>Frist bis</Label>
                  <Input
                    type="date"
                    value={formData.fristBis}
                    onChange={(e) => updateData({ fristBis: e.target.value })}
                  />
                </div>
              )}
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
