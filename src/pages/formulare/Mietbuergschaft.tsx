import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
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
import { generateMietbuergschaftPDF } from '@/lib/pdf/mietbuergschaft-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  buerge: PersonData
  buergeAdresse: AddressData
  mieter: PersonData
  vermieter: PersonData
  vermieterAdresse: AddressData
  mietobjektAdresse: AddressData
  mietvertragVom: string
  buergschaftsbetrag: number | null
  buergschaftsart: string[]
  selbstschuldnerisch: boolean
  verzichtEinredeVorausklage: boolean
  befristet: boolean
  befristetBis: string
  sonstigeVereinbarungen: string
  unterschriftBuerge: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  buerge: { ...EMPTY_PERSON },
  buergeAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mietvertragVom: '',
  buergschaftsbetrag: null,
  buergschaftsart: [],
  selbstschuldnerisch: false,
  verzichtEinredeVorausklage: false,
  befristet: false,
  befristetBis: '',
  sonstigeVereinbarungen: '',
  unterschriftBuerge: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const BUERGSCHAFT_ARTEN = [
  { value: 'miete', label: 'Mietzahlungen' },
  { value: 'nebenkosten', label: 'Nebenkosten / Betriebskosten' },
  { value: 'schaeden', label: 'Schäden am Mietobjekt' },
  { value: 'renovierung', label: 'Renovierungskosten bei Auszug' },
  { value: 'alle', label: 'Alle Verpflichtungen aus dem Mietvertrag' },
]

export default function MietbuergschaftPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleArt = (value: string) => {
    const current = formData.buergschaftsart
    if (current.includes(value)) {
      updateData({ buergschaftsart: current.filter(v => v !== value) })
    } else {
      updateData({ buergschaftsart: [...current, value] })
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateMietbuergschaftPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Mietbürgschaft wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mietbürgschaft</h1>
              <p className="text-muted-foreground">Bürgschaftserklärung für ein Mietverhältnis</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Bürge */}
          <Card>
            <CardHeader>
              <CardTitle>Bürge</CardTitle>
              <CardDescription>
                Person, die für die Mietverpflichtungen bürgt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.buerge}
                onChange={(v) => updateData({ buerge: v })}
                label="Bürge"
                required
              />
              <AddressField
                value={formData.buergeAdresse}
                onChange={(v) => updateData({ buergeAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Mieter */}
          <Card>
            <CardHeader>
              <CardTitle>Mieter (Hauptschuldner)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.mieter}
                onChange={(v) => updateData({ mieter: v })}
                label="Mieter"
                required
              />
            </CardContent>
          </Card>

          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter (Bürgschaftsgläubiger)</CardTitle>
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
            <CardContent className="space-y-4">
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse des Mietobjekts"
                required
              />
              <div>
                <Label>Mietvertrag vom</Label>
                <Input
                  type="date"
                  value={formData.mietvertragVom}
                  onChange={(e) => updateData({ mietvertragVom: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bürgschaftsdetails */}
          <Card>
            <CardHeader>
              <CardTitle>Bürgschaftsumfang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CurrencyField
                label="Maximaler Bürgschaftsbetrag *"
                value={formData.buergschaftsbetrag}
                onChange={(v) => updateData({ buergschaftsbetrag: v })}
              />

              <div>
                <Label className="mb-3 block">Die Bürgschaft erstreckt sich auf:</Label>
                <div className="space-y-2">
                  {BUERGSCHAFT_ARTEN.map(art => (
                    <div key={art.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={art.value}
                        checked={formData.buergschaftsart.includes(art.value)}
                        onCheckedChange={() => toggleArt(art.value)}
                      />
                      <Label htmlFor={art.value} className="font-normal">{art.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selbstschuldnerisch"
                    checked={formData.selbstschuldnerisch}
                    onCheckedChange={(c) => updateData({ selbstschuldnerisch: !!c })}
                  />
                  <Label htmlFor="selbstschuldnerisch" className="font-medium">
                    Selbstschuldnerische Bürgschaft
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Der Bürge haftet wie ein Hauptschuldner und kann sofort in Anspruch genommen werden.
                </p>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verzicht"
                    checked={formData.verzichtEinredeVorausklage}
                    onCheckedChange={(c) => updateData({ verzichtEinredeVorausklage: !!c })}
                  />
                  <Label htmlFor="verzicht" className="font-medium">
                    Verzicht auf Einrede der Vorausklage (§ 771 BGB)
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="befristet"
                  checked={formData.befristet}
                  onCheckedChange={(c) => updateData({ befristet: !!c })}
                />
                <Label htmlFor="befristet">Bürgschaft ist zeitlich befristet</Label>
              </div>

              {formData.befristet && (
                <div>
                  <Label>Befristet bis</Label>
                  <Input
                    type="date"
                    value={formData.befristetBis}
                    onChange={(e) => updateData({ befristetBis: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label>Sonstige Vereinbarungen</Label>
                <Textarea
                  value={formData.sonstigeVereinbarungen}
                  onChange={(e) => updateData({ sonstigeVereinbarungen: e.target.value })}
                  placeholder="Weitere Absprachen zur Bürgschaft..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschrift des Bürgen</CardTitle>
              <CardDescription>
                Die Bürgschaftserklärung bedarf der Schriftform (§ 766 BGB)
              </CardDescription>
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
                value={formData.unterschriftBuerge}
                onChange={(v) => updateData({ unterschriftBuerge: v })}
                label="Unterschrift des Bürgen"
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
