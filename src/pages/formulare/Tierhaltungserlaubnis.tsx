import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, PawPrint, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateTierhaltungserlaubnisPDF } from '@/lib/pdf/tierhaltungserlaubnis-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  tierart: string
  tierrasse: string
  tiername: string
  anzahl: string
  auflagen: string[]
  sonstigeAuflagen: string
  widerrufsvorbehalt: boolean
  unterschriftVermieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  tierart: '',
  tierrasse: '',
  tiername: '',
  anzahl: '1',
  auflagen: ['haftpflicht', 'reinigung'],
  sonstigeAuflagen: '',
  widerrufsvorbehalt: true,
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const AUFLAGEN_OPTIONS = [
  { id: 'haftpflicht', label: 'Tierhalterhaftpflichtversicherung abschließen' },
  { id: 'reinigung', label: 'Für Reinigung bei Auszug sorgen' },
  { id: 'laerm', label: 'Lärmbelästigung vermeiden' },
  { id: 'leine', label: 'Tier in Gemeinschaftsräumen an der Leine führen' },
  { id: 'kot', label: 'Tierkot sofort entfernen' },
  { id: 'melden', label: 'Änderungen dem Vermieter melden' },
]

export default function TierhaltungserlaubnisPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'tierhaltungserlaubnis',
    generateTitle: (data) => `Tierhaltungserlaubnis - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Tierhaltungserlaubnis'
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

  const toggleAuflage = (id: string) => {
    if (formData.auflagen.includes(id)) {
      updateData({ auflagen: formData.auflagen.filter(a => a !== id) })
    } else {
      updateData({ auflagen: [...formData.auflagen, id] })
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateTierhaltungserlaubnisPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Tierhaltungserlaubnis wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <PawPrint className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tierhaltungserlaubnis</h1>
              <p className="text-muted-foreground">Genehmigung zur Haltung von Haustieren</p>
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
              <CardTitle>Mieter (Tierhalter)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.mieter}
                onChange={(v) => updateData({ mieter: v })}
                label="Mieter"
                required
              />
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Mietobjekt"
                required
              />
            </CardContent>
          </Card>

          {/* Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5" />
                Angaben zum Tier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tierart *</Label>
                  <Select
                    value={formData.tierart}
                    onValueChange={(v) => updateData({ tierart: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hund">Hund</SelectItem>
                      <SelectItem value="katze">Katze</SelectItem>
                      <SelectItem value="vogel">Vogel</SelectItem>
                      <SelectItem value="nagetier">Nagetier (Hamster, Meerschweinchen, etc.)</SelectItem>
                      <SelectItem value="fische">Fische / Aquarium</SelectItem>
                      <SelectItem value="reptil">Reptil</SelectItem>
                      <SelectItem value="sonstige">Sonstige</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rasse / Art</Label>
                  <Input
                    value={formData.tierrasse}
                    onChange={(e) => updateData({ tierrasse: e.target.value })}
                    placeholder="z.B. Golden Retriever, Perserkatze"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name des Tieres (optional)</Label>
                  <Input
                    value={formData.tiername}
                    onChange={(e) => updateData({ tiername: e.target.value })}
                    placeholder="z.B. Max, Luna"
                  />
                </div>
                <div>
                  <Label>Anzahl</Label>
                  <Input
                    value={formData.anzahl}
                    onChange={(e) => updateData({ anzahl: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auflagen */}
          <Card>
            <CardHeader>
              <CardTitle>Auflagen</CardTitle>
              <CardDescription>
                Bedingungen für die Tierhaltung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {AUFLAGEN_OPTIONS.map(option => (
                <div key={option.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={formData.auflagen.includes(option.id)}
                    onCheckedChange={() => toggleAuflage(option.id)}
                  />
                  <Label htmlFor={option.id} className="leading-tight">{option.label}</Label>
                </div>
              ))}

              <div>
                <Label>Sonstige Auflagen</Label>
                <Textarea
                  value={formData.sonstigeAuflagen}
                  onChange={(e) => updateData({ sonstigeAuflagen: e.target.value })}
                  placeholder="Weitere individuelle Auflagen..."
                  rows={2}
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="widerruf"
                  checked={formData.widerrufsvorbehalt}
                  onCheckedChange={(c) => updateData({ widerrufsvorbehalt: c === true })}
                />
                <Label htmlFor="widerruf" className="leading-tight">
                  Widerrufsvorbehalt bei Verstößen aufnehmen
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Genehmigung</CardTitle>
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
