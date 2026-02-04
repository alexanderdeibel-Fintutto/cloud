import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { generateZeitmietvertragPDF } from '@/lib/pdf/zeitmietvertrag-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData
  mietobjektAdresse: AddressData
  wohnflaeche: string
  zimmer: string
  mietbeginn: string
  mietende: string
  befristungsgrund: 'eigenbedarf' | 'bauarbeiten' | 'mitarbeiter' | 'sonstige'
  befristungsgrundDetails: string
  kaltmiete: number | null
  nebenkosten: number | null
  kaution: number | null
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
  wohnflaeche: '',
  zimmer: '',
  mietbeginn: '',
  mietende: '',
  befristungsgrund: 'eigenbedarf',
  befristungsgrundDetails: '',
  kaltmiete: null,
  nebenkosten: null,
  kaution: null,
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function ZeitmietvertragPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateZeitmietvertragPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Der Zeitmietvertrag wurde als PDF gespeichert.' })
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
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Zeitmietvertrag</h1>
              <p className="text-muted-foreground">Befristeter Mietvertrag mit qualifiziertem Befristungsgrund</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            <strong>§ 575 BGB:</strong> Ein befristeter Mietvertrag ist nur wirksam, wenn der Vermieter
            die Befristung bei Vertragsabschluss schriftlich mit einem gesetzlich anerkannten Grund
            begründet (qualifizierte Zeitmietvertrag). Ohne gültigen Grund gilt der Vertrag als unbefristet.
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
                label="Bisherige Anschrift"
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
                  <Label>Wohnfläche (m²) *</Label>
                  <Input
                    type="number"
                    value={formData.wohnflaeche}
                    onChange={(e) => updateData({ wohnflaeche: e.target.value })}
                    placeholder="z.B. 75"
                  />
                </div>
                <div>
                  <Label>Zimmer</Label>
                  <Input
                    value={formData.zimmer}
                    onChange={(e) => updateData({ zimmer: e.target.value })}
                    placeholder="z.B. 3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Befristung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Befristung
              </CardTitle>
              <CardDescription>
                Der Befristungsgrund muss konkret und nachprüfbar sein.
              </CardDescription>
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
                  <Label>Mietende *</Label>
                  <Input
                    type="date"
                    value={formData.mietende}
                    onChange={(e) => updateData({ mietende: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Befristungsgrund *</Label>
                <Select
                  value={formData.befristungsgrund}
                  onValueChange={(v: 'eigenbedarf' | 'bauarbeiten' | 'mitarbeiter' | 'sonstige') =>
                    updateData({ befristungsgrund: v })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eigenbedarf">Eigenbedarf des Vermieters</SelectItem>
                    <SelectItem value="bauarbeiten">Geplante Baumaßnahmen / Sanierung</SelectItem>
                    <SelectItem value="mitarbeiter">Vermietung an Mitarbeiter</SelectItem>
                    <SelectItem value="sonstige">Sonstiger Grund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ausführliche Begründung *</Label>
                <Textarea
                  value={formData.befristungsgrundDetails}
                  onChange={(e) => updateData({ befristungsgrundDetails: e.target.value })}
                  placeholder={
                    formData.befristungsgrund === 'eigenbedarf'
                      ? 'z.B.: Der Vermieter beabsichtigt, die Wohnung nach Ablauf der Mietzeit selbst zu bewohnen / seinem Sohn Max Mustermann zur Verfügung zu stellen...'
                      : formData.befristungsgrund === 'bauarbeiten'
                      ? 'z.B.: Nach Ablauf der Mietzeit ist eine umfassende Sanierung des Gebäudes geplant, die eine Nutzung der Wohnung unmöglich macht...'
                      : formData.befristungsgrund === 'mitarbeiter'
                      ? 'z.B.: Die Wohnung wird für den Zeitraum der befristeten Beschäftigung des Mieters als Mitarbeiterwohnung zur Verfügung gestellt...'
                      : 'Bitte beschreiben Sie den konkreten Befristungsgrund ausführlich...'
                  }
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Der Grund muss konkret und nachprüfbar sein (§ 575 BGB)
                </p>
              </div>

              <Alert variant="warning">
                <AlertDescription>
                  <strong>Wichtig:</strong> Der Mieter kann frühestens 4 Monate vor Ablauf der Befristung
                  Auskunft verlangen, ob der Befristungsgrund noch besteht. Besteht er nicht mehr,
                  kann der Mieter eine Verlängerung verlangen.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Miete */}
          <Card>
            <CardHeader>
              <CardTitle>Miete und Kaution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Kaltmiete monatlich *"
                  value={formData.kaltmiete}
                  onChange={(v) => updateData({ kaltmiete: v })}
                />
                <CurrencyField
                  label="Nebenkosten monatlich *"
                  value={formData.nebenkosten}
                  onChange={(v) => updateData({ nebenkosten: v })}
                />
              </div>
              <CurrencyField
                label="Kaution"
                value={formData.kaution}
                onChange={(v) => updateData({ kaution: v })}
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
            <Button onClick={handleGeneratePDF} disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'PDF erstellen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
