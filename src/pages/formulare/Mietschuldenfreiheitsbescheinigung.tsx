import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileCheck, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { generateMietschuldenfreiheitsbescheinigungPDF } from '@/lib/pdf/mietschuldenfreiheitsbescheinigung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData
  mietobjektAdresse: AddressData
  mietverhaeltnisVon: string
  mietverhaeltnisBis: string
  mietverhaeltnisLaufend: boolean
  keineMietrueckstaende: boolean
  keineNebenkostenrueckstaende: boolean
  keineSchaeden: boolean
  bemerkungen: string
  ausstellungsdatum: string
  ausstellungsort: string
  unterschriftVermieter: SignatureData
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mietverhaeltnisVon: '',
  mietverhaeltnisBis: '',
  mietverhaeltnisLaufend: true,
  keineMietrueckstaende: true,
  keineNebenkostenrueckstaende: true,
  keineSchaeden: true,
  bemerkungen: '',
  ausstellungsdatum: new Date().toISOString().split('T')[0],
  ausstellungsort: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
}

export default function MietschuldenfreiheitsbescheinigungPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateMietschuldenfreiheitsbescheinigungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Bescheinigung wurde als PDF gespeichert.' })
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
              <FileCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mietschuldenfreiheitsbescheinigung</h1>
              <p className="text-muted-foreground">Bestätigung für neuen Vermieter</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter (Aussteller)</CardTitle>
              <CardDescription>Der aktuelle oder bisherige Vermieter</CardDescription>
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
              <CardDescription>Für wen wird die Bescheinigung ausgestellt?</CardDescription>
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
                  <Label>Mietverhältnis seit *</Label>
                  <Input
                    type="date"
                    value={formData.mietverhaeltnisVon}
                    onChange={(e) => updateData({ mietverhaeltnisVon: e.target.value })}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="laufend"
                      checked={formData.mietverhaeltnisLaufend}
                      onCheckedChange={(c) => updateData({ mietverhaeltnisLaufend: !!c })}
                    />
                    <Label htmlFor="laufend">Mietverhältnis besteht noch</Label>
                  </div>
                  {!formData.mietverhaeltnisLaufend && (
                    <>
                      <Label>Mietverhältnis bis</Label>
                      <Input
                        type="date"
                        value={formData.mietverhaeltnisBis}
                        onChange={(e) => updateData({ mietverhaeltnisBis: e.target.value })}
                      />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bestätigungen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Bestätigungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keineMiete"
                  checked={formData.keineMietrueckstaende}
                  onCheckedChange={(c) => updateData({ keineMietrueckstaende: !!c })}
                />
                <Label htmlFor="keineMiete">Es bestehen keine Mietrückstände</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keineNebenkosten"
                  checked={formData.keineNebenkostenrueckstaende}
                  onCheckedChange={(c) => updateData({ keineNebenkostenrueckstaende: !!c })}
                />
                <Label htmlFor="keineNebenkosten">Es bestehen keine Nebenkostenrückstände</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keineSchaeden"
                  checked={formData.keineSchaeden}
                  onCheckedChange={(c) => updateData({ keineSchaeden: !!c })}
                />
                <Label htmlFor="keineSchaeden">Es sind keine offenen Schadensersatzforderungen bekannt</Label>
              </div>
              <Separator />
              <div>
                <Label>Bemerkungen (optional)</Label>
                <Textarea
                  value={formData.bemerkungen}
                  onChange={(e) => updateData({ bemerkungen: e.target.value })}
                  placeholder="Zusätzliche Anmerkungen..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Ausstellung und Unterschrift</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Ausstellungsort *</Label>
                  <Input
                    value={formData.ausstellungsort}
                    onChange={(e) => updateData({ ausstellungsort: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Ausstellungsdatum *</Label>
                  <Input
                    type="date"
                    value={formData.ausstellungsdatum}
                    onChange={(e) => updateData({ ausstellungsdatum: e.target.value })}
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
            <Button onClick={handleGeneratePDF} disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'PDF erstellen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
