import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
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
import { generateAuszugsbestaetigungPDF } from '@/lib/pdf/auszugsbestaetigung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterNeueAdresse: AddressData
  mietobjektAdresse: AddressData
  auszugsdatum: string
  mietvertragVom: string
  schluesselZurueckgegeben: boolean
  zaehlerstaendeAbgelesen: boolean
  wohnungGereinigt: boolean
  wohnungGeraumt: boolean
  kautionAbgerechnet: boolean
  maengel: string
  bemerkungen: string
  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mieterNeueAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  auszugsdatum: '',
  mietvertragVom: '',
  schluesselZurueckgegeben: false,
  zaehlerstaendeAbgelesen: false,
  wohnungGereinigt: false,
  wohnungGeraumt: false,
  kautionAbgerechnet: false,
  maengel: '',
  bemerkungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function AuszugsbestaetigungPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateAuszugsbestaetigungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Auszugsbestätigung wurde als PDF gespeichert.' })
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
              <LogOut className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Auszugsbestätigung</h1>
              <p className="text-muted-foreground">Bestätigung des ordnungsgemäßen Auszugs</p>
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
                value={formData.mieterNeueAdresse}
                onChange={(v) => updateData({ mieterNeueAdresse: v })}
                label="Neue Anschrift"
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
                  <Label>Mietvertrag vom</Label>
                  <Input
                    type="date"
                    value={formData.mietvertragVom}
                    onChange={(e) => updateData({ mietvertragVom: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Auszugsdatum *</Label>
                  <Input
                    type="date"
                    value={formData.auszugsdatum}
                    onChange={(e) => updateData({ auszugsdatum: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bestätigungen */}
          <Card>
            <CardHeader>
              <CardTitle>Bestätigungen</CardTitle>
              <CardDescription>
                Folgende Punkte werden beim Auszug bestätigt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="schluessel"
                    checked={formData.schluesselZurueckgegeben}
                    onCheckedChange={(checked) => updateData({ schluesselZurueckgegeben: !!checked })}
                  />
                  <Label htmlFor="schluessel">Alle Schlüssel wurden zurückgegeben</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="zaehler"
                    checked={formData.zaehlerstaendeAbgelesen}
                    onCheckedChange={(checked) => updateData({ zaehlerstaendeAbgelesen: !!checked })}
                  />
                  <Label htmlFor="zaehler">Die Zählerstände wurden gemeinsam abgelesen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gereinigt"
                    checked={formData.wohnungGereinigt}
                    onCheckedChange={(checked) => updateData({ wohnungGereinigt: !!checked })}
                  />
                  <Label htmlFor="gereinigt">Die Wohnung wurde besenrein übergeben</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="geraumt"
                    checked={formData.wohnungGeraumt}
                    onCheckedChange={(checked) => updateData({ wohnungGeraumt: !!checked })}
                  />
                  <Label htmlFor="geraumt">Die Wohnung wurde vollständig geräumt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kaution"
                    checked={formData.kautionAbgerechnet}
                    onCheckedChange={(checked) => updateData({ kautionAbgerechnet: !!checked })}
                  />
                  <Label htmlFor="kaution">Die Kautionsabrechnung erfolgt separat</Label>
                </div>
              </div>

              <div>
                <Label>Festgestellte Mängel</Label>
                <Textarea
                  value={formData.maengel}
                  onChange={(e) => updateData({ maengel: e.target.value })}
                  placeholder="Beschreibung eventueller Mängel oder Schäden..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Sonstige Bemerkungen</Label>
                <Textarea
                  value={formData.bemerkungen}
                  onChange={(e) => updateData({ bemerkungen: e.target.value })}
                  placeholder="Weitere Anmerkungen zum Auszug..."
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
                  label="Unterschrift Mieter"
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
