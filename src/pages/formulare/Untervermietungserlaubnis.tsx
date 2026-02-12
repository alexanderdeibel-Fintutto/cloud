import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, UserPlus, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateUntervermietungserlaubnisPDF } from '@/lib/pdf/untervermietungserlaubnis-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  untermieter: PersonData
  untermietflaeche: string
  untermietbeginn: string
  untermietende: string
  unbefristet: boolean
  untermiete: number | null
  aufschlag: number | null
  bedingungen: string[]
  sonstigeBedingungen: string
  unterschriftVermieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  untermieter: { ...EMPTY_PERSON },
  untermietflaeche: '',
  untermietbeginn: '',
  untermietende: '',
  unbefristet: true,
  untermiete: null,
  aufschlag: null,
  bedingungen: [],
  sonstigeBedingungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const BEDINGUNGEN_OPTIONS = [
  { id: 'anmeldung', label: 'Der Untermieter muss sich ordnungsgemäß anmelden' },
  { id: 'hausordnung', label: 'Der Untermieter muss die Hausordnung einhalten' },
  { id: 'haftung', label: 'Der Hauptmieter haftet für den Untermieter' },
  { id: 'kuendigung', label: 'Bei Beendigung des Hauptmietverhältnisses endet auch die Untervermietung' },
  { id: 'meldepflicht', label: 'Änderungen in der Person des Untermieters sind anzuzeigen' },
]

export default function UntervermietungserlaubnisPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'untervermietungserlaubnis',
    generateTitle: (data) => `Untervermietungserlaubnis - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Untervermietungserlaubnis'
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

  const toggleBedingung = (id: string) => {
    if (formData.bedingungen.includes(id)) {
      updateData({ bedingungen: formData.bedingungen.filter(b => b !== id) })
    } else {
      updateData({ bedingungen: [...formData.bedingungen, id] })
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateUntervermietungserlaubnisPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Untervermietungserlaubnis wurde als PDF gespeichert.' })
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
              <UserPlus className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Untervermietungserlaubnis</h1>
              <p className="text-muted-foreground">Genehmigung zur Untervermietung gemäß § 540 BGB</p>
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
              <CardTitle>Hauptmieter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.mieter}
                onChange={(v) => updateData({ mieter: v })}
                label="Hauptmieter"
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

          {/* Untermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Untermieter</CardTitle>
              <CardDescription>
                Person, die als Untermieter einziehen soll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.untermieter}
                onChange={(v) => updateData({ untermieter: v })}
                label="Untermieter"
                required
              />
            </CardContent>
          </Card>

          {/* Details der Untervermietung */}
          <Card>
            <CardHeader>
              <CardTitle>Details der Untervermietung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Untervermietete Fläche / Räume</Label>
                <Input
                  value={formData.untermietflaeche}
                  onChange={(e) => updateData({ untermietflaeche: e.target.value })}
                  placeholder="z.B. 1 Zimmer, ca. 18 m²"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Untervermietung ab *</Label>
                  <Input
                    type="date"
                    value={formData.untermietbeginn}
                    onChange={(e) => updateData({ untermietbeginn: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Untervermietung bis</Label>
                  <Input
                    type="date"
                    value={formData.untermietende}
                    onChange={(e) => updateData({ untermietende: e.target.value })}
                    disabled={formData.unbefristet}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unbefristet"
                  checked={formData.unbefristet}
                  onCheckedChange={(c) => updateData({ unbefristet: c === true })}
                />
                <Label htmlFor="unbefristet">Unbefristete Erlaubnis</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Geplante Untermiete (optional)"
                  value={formData.untermiete}
                  onChange={(v) => updateData({ untermiete: v })}
                />
                <CurrencyField
                  label="Untervermietungszuschlag (optional)"
                  value={formData.aufschlag}
                  onChange={(v) => updateData({ aufschlag: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bedingungen */}
          <Card>
            <CardHeader>
              <CardTitle>Bedingungen</CardTitle>
              <CardDescription>
                Auflagen für die Untervermietung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {BEDINGUNGEN_OPTIONS.map(option => (
                <div key={option.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={formData.bedingungen.includes(option.id)}
                    onCheckedChange={() => toggleBedingung(option.id)}
                  />
                  <Label htmlFor={option.id} className="leading-tight">{option.label}</Label>
                </div>
              ))}

              <div>
                <Label>Sonstige Bedingungen</Label>
                <Textarea
                  value={formData.sonstigeBedingungen}
                  onChange={(e) => updateData({ sonstigeBedingungen: e.target.value })}
                  placeholder="Weitere Auflagen oder Bedingungen..."
                  rows={3}
                />
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
