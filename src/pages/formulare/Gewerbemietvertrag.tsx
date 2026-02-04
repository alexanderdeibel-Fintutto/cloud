import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Users, Euro, FileText, Shield, PenTool } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
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
import { generateGewerbemietvertragPDF } from '@/lib/pdf/gewerbemietvertrag-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

const OBJEKT_ARTEN = [
  { value: 'buero', label: 'Büro' },
  { value: 'laden', label: 'Laden / Einzelhandel' },
  { value: 'lager', label: 'Lager / Halle' },
  { value: 'werkstatt', label: 'Werkstatt' },
  { value: 'praxis', label: 'Praxis (Arzt, Anwalt, etc.)' },
  { value: 'gastro', label: 'Gastronomie' },
  { value: 'sonstige', label: 'Sonstige' },
]

const BETRIEBSKOSTEN_ARTEN = [
  { id: 'grundsteuer', label: 'Grundsteuer' },
  { id: 'wasser', label: 'Wasserversorgung' },
  { id: 'abwasser', label: 'Abwasser' },
  { id: 'heizung', label: 'Heizung' },
  { id: 'warmwasser', label: 'Warmwasser' },
  { id: 'strom_gemein', label: 'Strom Gemeinschaftsflächen' },
  { id: 'muell', label: 'Müllabfuhr' },
  { id: 'reinigung', label: 'Gebäudereinigung' },
  { id: 'hausmeister', label: 'Hausmeister' },
  { id: 'versicherung', label: 'Gebäudeversicherung' },
  { id: 'aufzug', label: 'Aufzug' },
  { id: 'garten', label: 'Gartenpflege' },
  { id: 'winterdienst', label: 'Winterdienst' },
  { id: 'verwaltung', label: 'Verwaltungskosten' },
]

interface GewerbemietvertragFormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  vermieterSteuerNr: string
  vermieterUstId: string
  mieter: PersonData
  mieterAdresse: AddressData
  mieterFirma: string
  mieterHandelsregister: string
  mieterSteuerNr: string
  mieterUstId: string
  objektAdresse: AddressData
  objektArt: string
  objektArtSonstige: string
  nutzflaeche: number | null
  nebenflaeche: number | null
  stellplaetze: number | null
  nutzungszweck: string
  nutzungsaenderungErlaubt: boolean
  mietbeginn: string
  mietende: string
  befristet: boolean
  mindestlaufzeit: number | null
  verlaengerungsoption: string
  kuendigungsfrist: number | null
  nettokaltmiete: number | null
  nebenkostenvorauszahlung: number | null
  nebenkostenPauschal: boolean
  umsatzsteuerPflichtig: boolean
  umsatzsteuerSatz: number
  kautionHoehe: number | null
  kautionArt: string
  betriebskostenUmfang: string[]
  instandhaltungMieter: string[]
  schoenheitsreparaturenMieter: boolean
  konkurrenzschutz: boolean
  konkurrenzschutzDetails: string
  werbungErlaubt: boolean
  untervermietungErlaubt: boolean
  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData
  erstelltAm: string
}

const INITIAL_DATA: GewerbemietvertragFormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  vermieterSteuerNr: '',
  vermieterUstId: '',
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  mieterFirma: '',
  mieterHandelsregister: '',
  mieterSteuerNr: '',
  mieterUstId: '',
  objektAdresse: { ...EMPTY_ADDRESS },
  objektArt: 'buero',
  objektArtSonstige: '',
  nutzflaeche: null,
  nebenflaeche: null,
  stellplaetze: null,
  nutzungszweck: '',
  nutzungsaenderungErlaubt: false,
  mietbeginn: new Date().toISOString().split('T')[0],
  mietende: '',
  befristet: false,
  mindestlaufzeit: null,
  verlaengerungsoption: '',
  kuendigungsfrist: 6,
  nettokaltmiete: null,
  nebenkostenvorauszahlung: null,
  nebenkostenPauschal: false,
  umsatzsteuerPflichtig: true,
  umsatzsteuerSatz: 19,
  kautionHoehe: null,
  kautionArt: 'barkaution',
  betriebskostenUmfang: ['grundsteuer', 'wasser', 'abwasser', 'heizung', 'muell', 'versicherung'],
  instandhaltungMieter: [],
  schoenheitsreparaturenMieter: true,
  konkurrenzschutz: false,
  konkurrenzschutzDetails: '',
  werbungErlaubt: true,
  untervermietungErlaubt: false,
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString(),
}

interface StepInfo {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const WIZARD_STEPS: StepInfo[] = [
  { id: 'vermieter', title: 'Vermieter', description: 'Vermieter-Daten', icon: <Users className="h-5 w-5" /> },
  { id: 'mieter', title: 'Mieter', description: 'Mieter / Firma', icon: <Building2 className="h-5 w-5" /> },
  { id: 'objekt', title: 'Mietobjekt', description: 'Gewerbefläche', icon: <Building2 className="h-5 w-5" /> },
  { id: 'miete', title: 'Miete', description: 'Konditionen', icon: <Euro className="h-5 w-5" /> },
  { id: 'betriebskosten', title: 'Betriebskosten', description: 'Umlagen', icon: <FileText className="h-5 w-5" /> },
  { id: 'besonderheiten', title: 'Besonderheiten', description: 'Sondervereinbarungen', icon: <Shield className="h-5 w-5" /> },
  { id: 'unterschriften', title: 'Unterschriften', description: 'Abschluss', icon: <PenTool className="h-5 w-5" /> },
]

export default function GewerbemietvertragPage() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [formData, setFormData] = React.useState<GewerbemietvertragFormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<GewerbemietvertragFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateGewerbemietvertragPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Der Gewerbemietvertrag wurde als PDF gespeichert.' })
    } catch (error) {
      toast({ title: 'Fehler', description: 'PDF konnte nicht erstellt werden.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Vermieter
        return (
          <div className="space-y-6">
            <PersonField
              value={formData.vermieter}
              onChange={(v) => updateData({ vermieter: v })}
              label="Vermieter"
              required
            />
            <AddressField
              value={formData.vermieterAdresse}
              onChange={(v) => updateData({ vermieterAdresse: v })}
              label="Anschrift Vermieter"
              required
            />
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Steuernummer</Label>
                <Input
                  value={formData.vermieterSteuerNr}
                  onChange={(e) => updateData({ vermieterSteuerNr: e.target.value })}
                  placeholder="z.B. 12/345/67890"
                />
              </div>
              <div>
                <Label>USt-IdNr.</Label>
                <Input
                  value={formData.vermieterUstId}
                  onChange={(e) => updateData({ vermieterUstId: e.target.value })}
                  placeholder="z.B. DE123456789"
                />
              </div>
            </div>
          </div>
        )

      case 1: // Mieter
        return (
          <div className="space-y-6">
            <div>
              <Label>Firmenname *</Label>
              <Input
                value={formData.mieterFirma}
                onChange={(e) => updateData({ mieterFirma: e.target.value })}
                placeholder="z.B. Mustermann GmbH"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Handelsregister</Label>
                <Input
                  value={formData.mieterHandelsregister}
                  onChange={(e) => updateData({ mieterHandelsregister: e.target.value })}
                  placeholder="z.B. HRB 12345, AG München"
                />
              </div>
              <div>
                <Label>USt-IdNr.</Label>
                <Input
                  value={formData.mieterUstId}
                  onChange={(e) => updateData({ mieterUstId: e.target.value })}
                  placeholder="z.B. DE123456789"
                />
              </div>
            </div>
            <Separator />
            <PersonField
              value={formData.mieter}
              onChange={(v) => updateData({ mieter: v })}
              label="Vertreten durch (Geschäftsführer)"
              required
            />
            <AddressField
              value={formData.mieterAdresse}
              onChange={(v) => updateData({ mieterAdresse: v })}
              label="Geschäftsadresse"
              required
            />
          </div>
        )

      case 2: // Objekt
        return (
          <div className="space-y-6">
            <AddressField
              value={formData.objektAdresse}
              onChange={(v) => updateData({ objektAdresse: v })}
              label="Adresse der Gewerbefläche"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Art der Gewerbefläche *</Label>
                <Select
                  value={formData.objektArt}
                  onValueChange={(v) => updateData({ objektArt: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OBJEKT_ARTEN.map(art => (
                      <SelectItem key={art.value} value={art.value}>{art.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.objektArt === 'sonstige' && (
                <div>
                  <Label>Genaue Bezeichnung</Label>
                  <Input
                    value={formData.objektArtSonstige}
                    onChange={(e) => updateData({ objektArtSonstige: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Nutzfläche (m²) *</Label>
                <Input
                  type="number"
                  value={formData.nutzflaeche ?? ''}
                  onChange={(e) => updateData({ nutzflaeche: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div>
                <Label>Nebenfläche (m²)</Label>
                <Input
                  type="number"
                  value={formData.nebenflaeche ?? ''}
                  onChange={(e) => updateData({ nebenflaeche: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div>
                <Label>Stellplätze</Label>
                <Input
                  type="number"
                  value={formData.stellplaetze ?? ''}
                  onChange={(e) => updateData({ stellplaetze: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
            </div>
            <div>
              <Label>Nutzungszweck *</Label>
              <Textarea
                value={formData.nutzungszweck}
                onChange={(e) => updateData({ nutzungszweck: e.target.value })}
                placeholder="z.B. Betrieb eines Einzelhandelsgeschäfts für Bekleidung"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nutzungsaenderung"
                checked={formData.nutzungsaenderungErlaubt}
                onCheckedChange={(c) => updateData({ nutzungsaenderungErlaubt: !!c })}
              />
              <Label htmlFor="nutzungsaenderung">Nutzungsänderung mit Zustimmung des Vermieters erlaubt</Label>
            </div>
          </div>
        )

      case 3: // Miete
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Mietbeginn *</Label>
                <Input
                  type="date"
                  value={formData.mietbeginn}
                  onChange={(e) => updateData({ mietbeginn: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="befristet"
                  checked={formData.befristet}
                  onCheckedChange={(c) => updateData({ befristet: !!c })}
                />
                <Label htmlFor="befristet">Befristeter Vertrag</Label>
              </div>
            </div>
            {formData.befristet && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mietende</Label>
                  <Input
                    type="date"
                    value={formData.mietende}
                    onChange={(e) => updateData({ mietende: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Mindestlaufzeit (Monate)</Label>
                  <Input
                    type="number"
                    value={formData.mindestlaufzeit ?? ''}
                    onChange={(e) => updateData({ mindestlaufzeit: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Kündigungsfrist (Monate) *</Label>
                <Input
                  type="number"
                  value={formData.kuendigungsfrist ?? ''}
                  onChange={(e) => updateData({ kuendigungsfrist: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div>
                <Label>Verlängerungsoption</Label>
                <Input
                  value={formData.verlaengerungsoption}
                  onChange={(e) => updateData({ verlaengerungsoption: e.target.value })}
                  placeholder="z.B. 2x 5 Jahre"
                />
              </div>
            </div>
            <Separator />
            <CurrencyField
              label="Nettokaltmiete (monatlich) *"
              value={formData.nettokaltmiete}
              onChange={(v) => updateData({ nettokaltmiete: v })}
            />
            <div className="flex items-center space-x-4">
              <Checkbox
                id="ust"
                checked={formData.umsatzsteuerPflichtig}
                onCheckedChange={(c) => updateData({ umsatzsteuerPflichtig: !!c })}
              />
              <Label htmlFor="ust">Zzgl. Umsatzsteuer (Option nach § 9 UStG)</Label>
              {formData.umsatzsteuerPflichtig && (
                <Select
                  value={String(formData.umsatzsteuerSatz)}
                  onValueChange={(v) => updateData({ umsatzsteuerSatz: Number(v) })}
                >
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="19">19%</SelectItem>
                    <SelectItem value="7">7%</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <Separator />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nkPauschal"
                checked={formData.nebenkostenPauschal}
                onCheckedChange={(c) => updateData({ nebenkostenPauschal: !!c })}
              />
              <Label htmlFor="nkPauschal">Nebenkosten als Pauschale (keine Abrechnung)</Label>
            </div>
            <CurrencyField
              label={formData.nebenkostenPauschal ? 'Nebenkostenpauschale' : 'Nebenkostenvorauszahlung'}
              value={formData.nebenkostenvorauszahlung}
              onChange={(v) => updateData({ nebenkostenvorauszahlung: v })}
            />
            <Separator />
            <CurrencyField
              label="Kaution"
              value={formData.kautionHoehe}
              onChange={(v) => updateData({ kautionHoehe: v })}
            />
            <Select
              value={formData.kautionArt}
              onValueChange={(v) => updateData({ kautionArt: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="barkaution">Barkaution</SelectItem>
                <SelectItem value="buergschaft">Bankbürgschaft</SelectItem>
                <SelectItem value="keine">Keine Kaution</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 4: // Betriebskosten
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Wählen Sie die Betriebskosten, die auf den Mieter umgelegt werden sollen:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BETRIEBSKOSTEN_ARTEN.map(bk => (
                <div key={bk.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={bk.id}
                    checked={formData.betriebskostenUmfang.includes(bk.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateData({ betriebskostenUmfang: [...formData.betriebskostenUmfang, bk.id] })
                      } else {
                        updateData({ betriebskostenUmfang: formData.betriebskostenUmfang.filter(id => id !== bk.id) })
                      }
                    }}
                  />
                  <Label htmlFor={bk.id}>{bk.label}</Label>
                </div>
              ))}
            </div>
          </div>
        )

      case 5: // Besonderheiten
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Konkurrenzschutz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="konkurrenzschutz"
                    checked={formData.konkurrenzschutz}
                    onCheckedChange={(c) => updateData({ konkurrenzschutz: !!c })}
                  />
                  <Label htmlFor="konkurrenzschutz">Konkurrenzschutz vereinbart</Label>
                </div>
                {formData.konkurrenzschutz && (
                  <Textarea
                    value={formData.konkurrenzschutzDetails}
                    onChange={(e) => updateData({ konkurrenzschutzDetails: e.target.value })}
                    placeholder="Details zum Konkurrenzschutz..."
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weitere Vereinbarungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="werbung"
                    checked={formData.werbungErlaubt}
                    onCheckedChange={(c) => updateData({ werbungErlaubt: !!c })}
                  />
                  <Label htmlFor="werbung">Außenwerbung erlaubt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="untervermietung"
                    checked={formData.untervermietungErlaubt}
                    onCheckedChange={(c) => updateData({ untervermietungErlaubt: !!c })}
                  />
                  <Label htmlFor="untervermietung">Untervermietung mit Zustimmung erlaubt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="schoenheit"
                    checked={formData.schoenheitsreparaturenMieter}
                    onCheckedChange={(c) => updateData({ schoenheitsreparaturenMieter: !!c })}
                  />
                  <Label htmlFor="schoenheit">Schönheitsreparaturen durch Mieter</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 6: // Unterschriften
        return (
          <div className="space-y-6">
            <SignatureField
              value={formData.unterschriftVermieter}
              onChange={(v) => updateData({ unterschriftVermieter: v })}
              label="Unterschrift Vermieter"
              required
            />
            <Separator />
            <SignatureField
              value={formData.unterschriftMieter}
              onChange={(v) => updateData({ unterschriftMieter: v })}
              label="Unterschrift Mieter"
              required
            />
          </div>
        )

      default:
        return null
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
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gewerbemietvertrag</h1>
              <p className="text-muted-foreground">Mietvertrag für Gewerberäume</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Schritt {currentStep + 1} von {WIZARD_STEPS.length}</span>
            <span>{WIZARD_STEPS[currentStep].title}</span>
          </div>
          <Progress value={((currentStep + 1) / WIZARD_STEPS.length) * 100} />
        </div>

        {/* Step Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {WIZARD_STEPS.map((step, index) => (
            <Button
              key={step.id}
              variant={index === currentStep ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentStep(index)}
              className="whitespace-nowrap"
            >
              {step.icon}
              <span className="ml-2">{step.title}</span>
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{WIZARD_STEPS[currentStep].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Zurück
          </Button>
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Weiter
            </Button>
          ) : (
            <Button onClick={handleGeneratePDF} disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'PDF erstellen'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
