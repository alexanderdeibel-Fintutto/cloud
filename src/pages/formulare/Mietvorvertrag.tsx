import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileCheck, Save, FileDown } from 'lucide-react'
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
import { generateMietvorvertragPDF } from '@/lib/pdf/mietvorvertrag-pdf'
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
  wohnungsgroesse: string
  zimmeranzahl: string
  geplanterMietbeginn: string
  kaltmiete: number | null
  nebenkosten: number | null
  kaution: number | null
  reservierungsgebuehr: number | null
  bindungsfrist: string
  ruecktrittsrecht: boolean
  bedingungen: string
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
  wohnungsgroesse: '',
  zimmeranzahl: '',
  geplanterMietbeginn: '',
  kaltmiete: null,
  nebenkosten: null,
  kaution: null,
  reservierungsgebuehr: null,
  bindungsfrist: '',
  ruecktrittsrecht: true,
  bedingungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function MietvorvertragPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'mietvorvertrag',
    generateTitle: (data) => `Mietvorvertrag - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Mietvorvertrag'
  })

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
      await generateMietvorvertragPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Der Mietvorvertrag wurde als PDF heruntergeladen.' })
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
              <h1 className="text-2xl font-bold">Mietvorvertrag</h1>
              <p className="text-muted-foreground">Reservierungsvereinbarung für eine Mietwohnung</p>
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

          {/* Mietinteressent */}
          <Card>
            <CardHeader>
              <CardTitle>Mietinteressent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.mieter}
                onChange={(v) => updateData({ mieter: v })}
                label="Mietinteressent"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Wohnfläche (m²)</Label>
                  <Input
                    value={formData.wohnungsgroesse}
                    onChange={(e) => updateData({ wohnungsgroesse: e.target.value })}
                    placeholder="z.B. 65"
                  />
                </div>
                <div>
                  <Label>Zimmeranzahl</Label>
                  <Input
                    value={formData.zimmeranzahl}
                    onChange={(e) => updateData({ zimmeranzahl: e.target.value })}
                    placeholder="z.B. 2,5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Konditionen */}
          <Card>
            <CardHeader>
              <CardTitle>Geplante Mietkonditionen</CardTitle>
              <CardDescription>
                Voraussichtliche Konditionen für den späteren Mietvertrag
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Geplanter Mietbeginn *</Label>
                <Input
                  type="date"
                  value={formData.geplanterMietbeginn}
                  onChange={(e) => updateData({ geplanterMietbeginn: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CurrencyField
                  label="Kaltmiete"
                  value={formData.kaltmiete}
                  onChange={(v) => updateData({ kaltmiete: v })}
                />
                <CurrencyField
                  label="Nebenkosten (Vorauszahlung)"
                  value={formData.nebenkosten}
                  onChange={(v) => updateData({ nebenkosten: v })}
                />
                <CurrencyField
                  label="Kaution"
                  value={formData.kaution}
                  onChange={(v) => updateData({ kaution: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reservierung */}
          <Card>
            <CardHeader>
              <CardTitle>Reservierungsdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CurrencyField
                label="Reservierungsgebühr (optional)"
                value={formData.reservierungsgebuehr}
                onChange={(v) => updateData({ reservierungsgebuehr: v })}
              />
              <p className="text-sm text-muted-foreground">
                Die Reservierungsgebühr wird bei Abschluss des Mietvertrags auf die Kaution angerechnet.
              </p>

              <div>
                <Label>Bindungsfrist bis</Label>
                <Input
                  type="date"
                  value={formData.bindungsfrist}
                  onChange={(e) => updateData({ bindungsfrist: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ruecktritt"
                  checked={formData.ruecktrittsrecht}
                  onCheckedChange={(c) => updateData({ ruecktrittsrecht: !!c })}
                />
                <Label htmlFor="ruecktritt">
                  Rücktrittsrecht für beide Parteien bis zum Ende der Bindungsfrist
                </Label>
              </div>

              <div>
                <Label>Weitere Bedingungen</Label>
                <Textarea
                  value={formData.bedingungen}
                  onChange={(e) => updateData({ bedingungen: e.target.value })}
                  placeholder="z.B. Vorlage bestimmter Unterlagen, Bonitätsprüfung..."
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
                  label="Unterschrift Mietinteressent"
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
