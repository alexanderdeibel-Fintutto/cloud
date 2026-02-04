import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Key, Info, Download, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AddressField } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { generateUntermietvertragPDF } from '@/lib/pdf/untermietvertrag-pdf'

interface UntermietvertragData {
  // Hauptmieter
  hauptmieterName: string
  hauptmieterAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  hauptmieterTelefon: string
  hauptmieterEmail: string

  // Untermieter
  untermieterName: string
  untermieterGeburtsdatum: string
  untermieterBeruf: string
  untermieterAktuelleAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }

  // Vermieter-Zustimmung
  vermieterName: string
  vermieterZustimmungVom: string
  zustimmungBefristet: boolean
  zustimmungBefristetBis: string

  // Mietobjekt
  mietobjektAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  untervermieteterTeil: 'ganz' | 'zimmer' | 'bereich'
  zimmerAnzahl: string
  zimmerBeschreibung: string
  wohnflaeche: number
  moebliertGrad: 'unmoebliert' | 'teilmoebliert' | 'vollmoebliert'
  inventarliste: string

  // Mietdauer
  mietbeginn: string
  befristet: boolean
  mietende: string
  befristungsgrund: string

  // Mietkosten
  untermiete: number
  moeblierungszuschlag: number
  nebenkostenPauschale: number
  nebenkostenVorauszahlung: number
  nebenkostenart: 'pauschale' | 'vorauszahlung'
  gesamtmiete: number

  // Kaution
  kaution: number
  kautionZahlweise: 'einmalig' | 'raten'
  kautionRaten: number

  // Nutzung
  personenanzahl: number
  tierhaltung: boolean
  tierart: string
  rauchen: boolean
  gewerblicheNutzung: boolean

  // Schlüssel
  schluesselAnzahl: {
    hausschluessel: number
    wohnungsschluessel: number
    zimmerschluessel: number
    briefkastenschluessel: number
    kellerschluessel: number
  }

  // Pflichten
  hausordnungAkzeptiert: boolean
  reinigungspflicht: string
  besuchsregelung: string

  // Kündigungsfristen
  kuendigungsfrist: string
  sonderkuendigungsrecht: string

  // Unterschriften
  unterschriftHauptmieter: SignatureData
  unterschriftUntermieter: SignatureData
  unterschriftDatum: string
  unterschriftOrt: string
}

const steps = [
  { id: 1, title: 'Parteien', description: 'Hauptmieter & Untermieter' },
  { id: 2, title: 'Zustimmung', description: 'Vermieter-Genehmigung' },
  { id: 3, title: 'Mietobjekt', description: 'Untervermietetes Objekt' },
  { id: 4, title: 'Konditionen', description: 'Miete & Kaution' },
  { id: 5, title: 'Regelungen', description: 'Nutzung & Pflichten' },
  { id: 6, title: 'Abschluss', description: 'Zusammenfassung & Unterschrift' },
]

const initialData: UntermietvertragData = {
  hauptmieterName: '',
  hauptmieterAdresse: { strasse: '', hausnummer: '', plz: '', ort: '' },
  hauptmieterTelefon: '',
  hauptmieterEmail: '',
  untermieterName: '',
  untermieterGeburtsdatum: '',
  untermieterBeruf: '',
  untermieterAktuelleAdresse: { strasse: '', hausnummer: '', plz: '', ort: '' },
  vermieterName: '',
  vermieterZustimmungVom: '',
  zustimmungBefristet: false,
  zustimmungBefristetBis: '',
  mietobjektAdresse: { strasse: '', hausnummer: '', plz: '', ort: '' },
  untervermieteterTeil: 'zimmer',
  zimmerAnzahl: '1',
  zimmerBeschreibung: '',
  wohnflaeche: 0,
  moebliertGrad: 'unmoebliert',
  inventarliste: '',
  mietbeginn: '',
  befristet: false,
  mietende: '',
  befristungsgrund: '',
  untermiete: 0,
  moeblierungszuschlag: 0,
  nebenkostenPauschale: 0,
  nebenkostenVorauszahlung: 0,
  nebenkostenart: 'pauschale',
  gesamtmiete: 0,
  kaution: 0,
  kautionZahlweise: 'einmalig',
  kautionRaten: 3,
  personenanzahl: 1,
  tierhaltung: false,
  tierart: '',
  rauchen: false,
  gewerblicheNutzung: false,
  schluesselAnzahl: {
    hausschluessel: 1,
    wohnungsschluessel: 1,
    zimmerschluessel: 0,
    briefkastenschluessel: 1,
    kellerschluessel: 0,
  },
  hausordnungAkzeptiert: false,
  reinigungspflicht: '',
  besuchsregelung: '',
  kuendigungsfrist: '3monate',
  sonderkuendigungsrecht: '',
  unterschriftHauptmieter: { imageData: null, signerName: '', signedAt: null },
  unterschriftUntermieter: { imageData: null, signerName: '', signedAt: null },
  unterschriftDatum: '',
  unterschriftOrt: '',
}

export default function UntermietvertragPage() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<UntermietvertragData>(initialData)

  const updateData = (updates: Partial<UntermietvertragData>) => {
    setData(prev => {
      const updated = { ...prev, ...updates }
      // Berechne Gesamtmiete
      const nebenkosten = updated.nebenkostenart === 'pauschale'
        ? updated.nebenkostenPauschale
        : updated.nebenkostenVorauszahlung
      updated.gesamtmiete = updated.untermiete + updated.moeblierungszuschlag + nebenkosten
      return updated
    })
  }

  const progress = (currentStep / steps.length) * 100

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const generatePDF = async () => {
    try {
      await generateUntermietvertragPDF({
        hauptmieterName: data.hauptmieterName,
        hauptmieterAdresse: data.hauptmieterAdresse,
        hauptmieterTelefon: data.hauptmieterTelefon,
        hauptmieterEmail: data.hauptmieterEmail,
        untermieterName: data.untermieterName,
        untermieterGeburtsdatum: data.untermieterGeburtsdatum,
        untermieterBeruf: data.untermieterBeruf,
        untermieterAktuelleAdresse: data.untermieterAktuelleAdresse,
        vermieterName: data.vermieterName,
        vermieterZustimmungVom: data.vermieterZustimmungVom,
        zustimmungBefristet: data.zustimmungBefristet,
        zustimmungBefristetBis: data.zustimmungBefristetBis,
        mietobjektAdresse: data.mietobjektAdresse,
        untervermieteterTeil: data.untervermieteterTeil,
        zimmerAnzahl: data.zimmerAnzahl,
        zimmerBeschreibung: data.zimmerBeschreibung,
        wohnflaeche: data.wohnflaeche,
        moebliertGrad: data.moebliertGrad,
        inventarliste: data.inventarliste,
        mietbeginn: data.mietbeginn,
        befristet: data.befristet,
        mietende: data.mietende,
        befristungsgrund: data.befristungsgrund,
        untermiete: data.untermiete,
        moeblierungszuschlag: data.moeblierungszuschlag,
        nebenkostenPauschale: data.nebenkostenPauschale,
        nebenkostenVorauszahlung: data.nebenkostenVorauszahlung,
        nebenkostenart: data.nebenkostenart,
        gesamtmiete: data.gesamtmiete,
        kaution: data.kaution,
        kautionZahlweise: data.kautionZahlweise,
        personenanzahl: data.personenanzahl,
        tierhaltung: data.tierhaltung,
        tierart: data.tierart,
        rauchen: data.rauchen,
        gewerblicheNutzung: data.gewerblicheNutzung,
        schluesselAnzahl: data.schluesselAnzahl,
        hausordnungAkzeptiert: data.hausordnungAkzeptiert,
        reinigungspflicht: data.reinigungspflicht,
        besuchsregelung: data.besuchsregelung,
        kuendigungsfrist: data.kuendigungsfrist,
        unterschriftHauptmieter: data.unterschriftHauptmieter.imageData || '',
        unterschriftUntermieter: data.unterschriftUntermieter.imageData || '',
        unterschriftDatum: data.unterschriftDatum,
        unterschriftOrt: data.unterschriftOrt
      })
      toast({
        title: 'PDF erstellt',
        description: 'Der Untermietvertrag wurde als PDF heruntergeladen.',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'PDF konnte nicht erstellt werden.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Key className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="font-semibold">Untermietvertrag</h1>
                <p className="text-sm text-muted-foreground">
                  Schritt {currentStep} von {steps.length}: {steps[currentStep - 1].title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="container mx-auto px-4 py-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`text-xs ${
                step.id === currentStep
                  ? 'text-purple-600 font-medium'
                  : step.id < currentStep
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Step 1: Parteien */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Vertragsparteien</CardTitle>
                <CardDescription>
                  Angaben zu Hauptmieter (Untervermieter) und Untermieter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Hauptmieter */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    Hauptmieter (Untervermieter)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Der Hauptmieter ist der eigentliche Mieter der Wohnung und wird hier zum Untervermieter (§ 540 BGB).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div>
                    <Label>Name des Hauptmieters</Label>
                    <Input
                      value={data.hauptmieterName}
                      onChange={(e) => updateData({ hauptmieterName: e.target.value })}
                      placeholder="Max Mustermann"
                    />
                  </div>
                  <AddressField
                    value={data.hauptmieterAdresse}
                    onChange={(adresse) => updateData({ hauptmieterAdresse: adresse })}
                    label="Adresse des Hauptmieters"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Telefon</Label>
                      <Input
                        value={data.hauptmieterTelefon}
                        onChange={(e) => updateData({ hauptmieterTelefon: e.target.value })}
                        placeholder="+49 123 456789"
                      />
                    </div>
                    <div>
                      <Label>E-Mail</Label>
                      <Input
                        type="email"
                        value={data.hauptmieterEmail}
                        onChange={(e) => updateData({ hauptmieterEmail: e.target.value })}
                        placeholder="email@beispiel.de"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Untermieter */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    Untermieter
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Der Untermieter mietet einen Teil der Wohnung vom Hauptmieter (§ 540 BGB).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div>
                    <Label>Name des Untermieters</Label>
                    <Input
                      value={data.untermieterName}
                      onChange={(e) => updateData({ untermieterName: e.target.value })}
                      placeholder="Erika Musterfrau"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Geburtsdatum</Label>
                      <Input
                        type="date"
                        value={data.untermieterGeburtsdatum}
                        onChange={(e) => updateData({ untermieterGeburtsdatum: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Beruf</Label>
                      <Input
                        value={data.untermieterBeruf}
                        onChange={(e) => updateData({ untermieterBeruf: e.target.value })}
                        placeholder="z.B. Student, Angestellte..."
                      />
                    </div>
                  </div>
                  <AddressField
                    value={data.untermieterAktuelleAdresse}
                    onChange={(adresse) => updateData({ untermieterAktuelleAdresse: adresse })}
                    label="Aktuelle Adresse des Untermieters"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Zustimmung */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Vermieter-Zustimmung</CardTitle>
                <CardDescription>
                  Untervermietung erfordert die Erlaubnis des Vermieters (§ 540 BGB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium">Wichtiger Hinweis</p>
                        <p className="mt-1">
                          Die Untervermietung ohne Erlaubnis des Vermieters kann zur Kündigung
                          des Hauptmietvertrags führen. Holen Sie sich immer eine schriftliche
                          Genehmigung ein!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      Name des Vermieters (Eigentümer)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Der Vermieter des Hauptmietvertrags muss der Untervermietung zustimmen (§ 540 BGB).</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      value={data.vermieterName}
                      onChange={(e) => updateData({ vermieterName: e.target.value })}
                      placeholder="Name des Eigentümers/Vermieters"
                    />
                  </div>

                  <div>
                    <Label>Datum der Zustimmung</Label>
                    <Input
                      type="date"
                      value={data.vermieterZustimmungVom}
                      onChange={(e) => updateData({ vermieterZustimmungVom: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="zustimmungBefristet"
                      checked={data.zustimmungBefristet}
                      onCheckedChange={(c) => updateData({ zustimmungBefristet: c === true })}
                    />
                    <Label htmlFor="zustimmungBefristet">Zustimmung ist befristet</Label>
                  </div>

                  {data.zustimmungBefristet && (
                    <div>
                      <Label>Befristet bis</Label>
                      <Input
                        type="date"
                        value={data.zustimmungBefristetBis}
                        onChange={(e) => updateData({ zustimmungBefristetBis: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Empfehlung: Schriftliche Genehmigung</h3>
                  <p className="text-sm text-muted-foreground">
                    Falls Sie noch keine schriftliche Genehmigung haben, können Sie folgende
                    Vorlage verwenden:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <p className="text-sm font-mono whitespace-pre-line">
{`Sehr geehrte/r [Vermieter],

hiermit bitte ich um Ihre Erlaubnis zur Untervermietung
eines Zimmers/meiner Wohnung an [Name Untermieter].

Die Untervermietung soll ab dem [Datum] beginnen.

[Begründung, z.B. beruflicher Auslandsaufenthalt]

Mit freundlichen Grüßen
[Ihr Name]`}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Mietobjekt */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Mietobjekt</CardTitle>
                <CardDescription>
                  Beschreibung des untervermieteten Wohnraums
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AddressField
                  value={data.mietobjektAdresse}
                  onChange={(adresse) => updateData({ mietobjektAdresse: adresse })}
                  label="Adresse der Wohnung"
                />

                <Separator />

                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    Untervermieteter Teil
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Geben Sie an, welcher Teil der Wohnung untervermietet wird (§ 540 BGB).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <RadioGroup
                    value={data.untervermieteterTeil}
                    onValueChange={(v: 'ganz' | 'zimmer' | 'bereich') =>
                      updateData({ untervermieteterTeil: v })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ganz" id="ganz" />
                      <Label htmlFor="ganz" className="font-normal">
                        Gesamte Wohnung
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="zimmer" id="zimmer" />
                      <Label htmlFor="zimmer" className="font-normal">
                        Einzelne Zimmer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bereich" id="bereich" />
                      <Label htmlFor="bereich" className="font-normal">
                        Bestimmter Wohnbereich
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {data.untervermieteterTeil === 'zimmer' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Anzahl der Zimmer</Label>
                      <Select
                        value={data.zimmerAnzahl}
                        onValueChange={(v) => updateData({ zimmerAnzahl: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Zimmer</SelectItem>
                          <SelectItem value="2">2 Zimmer</SelectItem>
                          <SelectItem value="3">3 Zimmer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Wohnfläche (m²)</Label>
                      <Input
                        type="number"
                        value={data.wohnflaeche || ''}
                        onChange={(e) => updateData({ wohnflaeche: parseFloat(e.target.value) || 0 })}
                        placeholder="20"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label>Beschreibung der Räumlichkeiten</Label>
                  <Textarea
                    value={data.zimmerBeschreibung}
                    onChange={(e) => updateData({ zimmerBeschreibung: e.target.value })}
                    placeholder="z.B. Zimmer im 2. OG links, mit Zugang zu Bad und Küche..."
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    Möblierungsgrad
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Bei möblierter Untervermietung kann ein Möblierungszuschlag verlangt werden.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <RadioGroup
                    value={data.moebliertGrad}
                    onValueChange={(v: 'unmoebliert' | 'teilmoebliert' | 'vollmoebliert') =>
                      updateData({ moebliertGrad: v })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unmoebliert" id="unmoebliert" />
                      <Label htmlFor="unmoebliert" className="font-normal">Unmöbliert</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teilmoebliert" id="teilmoebliert" />
                      <Label htmlFor="teilmoebliert" className="font-normal">Teilmöbliert</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vollmoebliert" id="vollmoebliert" />
                      <Label htmlFor="vollmoebliert" className="font-normal">Vollmöbliert</Label>
                    </div>
                  </RadioGroup>
                </div>

                {data.moebliertGrad !== 'unmoebliert' && (
                  <div>
                    <Label>Inventarliste (mitgemietete Gegenstände)</Label>
                    <Textarea
                      value={data.inventarliste}
                      onChange={(e) => updateData({ inventarliste: e.target.value })}
                      placeholder="z.B. Bett (IKEA Malm), Schreibtisch, Stuhl, Schrank..."
                      rows={4}
                    />
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Mietdauer</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Mietbeginn</Label>
                      <Input
                        type="date"
                        value={data.mietbeginn}
                        onChange={(e) => updateData({ mietbeginn: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="befristet"
                        checked={data.befristet}
                        onCheckedChange={(c) => updateData({ befristet: c === true })}
                      />
                      <Label htmlFor="befristet">Befristeter Vertrag</Label>
                    </div>
                  </div>

                  {data.befristet && (
                    <>
                      <div>
                        <Label>Mietende</Label>
                        <Input
                          type="date"
                          value={data.mietende}
                          onChange={(e) => updateData({ mietende: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          Befristungsgrund
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Bei Wohnraum muss ein sachlicher Grund für die Befristung vorliegen (§ 575 BGB).</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Textarea
                          value={data.befristungsgrund}
                          onChange={(e) => updateData({ befristungsgrund: e.target.value })}
                          placeholder="z.B. Eigenbedarf nach Rückkehr aus dem Ausland..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Konditionen */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Mietkonditionen</CardTitle>
                <CardDescription>
                  Miete, Nebenkosten und Kaution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        Untermiete (Kaltmiete)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Die Untermiete sollte angemessen sein (§ 5 WiStG).</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <CurrencyField
                        label="Untermiete (Kaltmiete)"
                        value={data.untermiete}
                        onChange={(v) => updateData({ untermiete: v ?? 0 })}
                      />
                    </div>

                    {data.moebliertGrad !== 'unmoebliert' && (
                      <div>
                        <CurrencyField
                          label="Möblierungszuschlag"
                          value={data.moeblierungszuschlag}
                          onChange={(v) => updateData({ moeblierungszuschlag: v ?? 0 })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Üblich: ca. 2% des Zeitwerts der Möbel pro Monat
                        </p>
                      </div>
                    )}

                    <div>
                      <Label>Nebenkosten</Label>
                      <RadioGroup
                        value={data.nebenkostenart}
                        onValueChange={(v: 'pauschale' | 'vorauszahlung') =>
                          updateData({ nebenkostenart: v })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pauschale" id="pauschale" />
                          <Label htmlFor="pauschale" className="font-normal">Pauschale</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="vorauszahlung" id="vorauszahlung" />
                          <Label htmlFor="vorauszahlung" className="font-normal">Vorauszahlung</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {data.nebenkostenart === 'pauschale' ? (
                      <div>
                        <CurrencyField
                          label="Nebenkostenpauschale"
                          value={data.nebenkostenPauschale}
                          onChange={(v) => updateData({ nebenkostenPauschale: v ?? 0 })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Keine Nachzahlung, keine Rückerstattung
                        </p>
                      </div>
                    ) : (
                      <div>
                        <CurrencyField
                          label="Nebenkostenvorauszahlung"
                          value={data.nebenkostenVorauszahlung}
                          onChange={(v) => updateData({ nebenkostenVorauszahlung: v ?? 0 })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Jährliche Abrechnung
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold text-purple-900 mb-4">Gesamtmiete monatlich</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Untermiete (Kaltmiete)</span>
                            <span>{formatCurrency(data.untermiete)}</span>
                          </div>
                          {data.moeblierungszuschlag > 0 && (
                            <div className="flex justify-between">
                              <span>Möblierungszuschlag</span>
                              <span>{formatCurrency(data.moeblierungszuschlag)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Nebenkosten</span>
                            <span>
                              {formatCurrency(
                                data.nebenkostenart === 'pauschale'
                                  ? data.nebenkostenPauschale
                                  : data.nebenkostenVorauszahlung
                              )}
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold text-lg text-purple-900">
                            <span>Gesamt</span>
                            <span>{formatCurrency(data.gesamtmiete)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    Kaution
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Die Kaution darf maximal 3 Monatskaltmieten betragen (§ 551 BGB).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <CurrencyField
                        label="Kautionshöhe"
                        value={data.kaution}
                        onChange={(v) => updateData({ kaution: v ?? 0 })}
                      />
                      {data.untermiete > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Max. erlaubt: {formatCurrency(data.untermiete * 3)} (3 Kaltmieten)
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Zahlweise</Label>
                      <Select
                        value={data.kautionZahlweise}
                        onValueChange={(v: 'einmalig' | 'raten') =>
                          updateData({ kautionZahlweise: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="einmalig">Einmalig bei Einzug</SelectItem>
                          <SelectItem value="raten">In 3 Monatsraten</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {data.kautionZahlweise === 'raten' && data.kaution > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Rate: {formatCurrency(data.kaution / 3)} pro Monat (3 Raten)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Regelungen */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Nutzungsregelungen</CardTitle>
                <CardDescription>
                  Regeln zur Nutzung und Schlüsselübergabe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Nutzung</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Personenanzahl</Label>
                      <Select
                        value={data.personenanzahl.toString()}
                        onValueChange={(v) => updateData({ personenanzahl: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Person</SelectItem>
                          <SelectItem value="2">2 Personen</SelectItem>
                          <SelectItem value="3">3 Personen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tierhaltung"
                        checked={data.tierhaltung}
                        onCheckedChange={(c) => updateData({ tierhaltung: c === true })}
                      />
                      <Label htmlFor="tierhaltung">Tierhaltung erlaubt</Label>
                    </div>
                    {data.tierhaltung && (
                      <Input
                        value={data.tierart}
                        onChange={(e) => updateData({ tierart: e.target.value })}
                        placeholder="Welche Tiere? z.B. Katze, Hund..."
                        className="ml-6"
                      />
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rauchen"
                      checked={data.rauchen}
                      onCheckedChange={(c) => updateData({ rauchen: c === true })}
                    />
                    <Label htmlFor="rauchen">Rauchen in der Wohnung erlaubt</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gewerblich"
                      checked={data.gewerblicheNutzung}
                      onCheckedChange={(c) => updateData({ gewerblicheNutzung: c === true })}
                    />
                    <Label htmlFor="gewerblich">Gewerbliche Nutzung erlaubt</Label>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Schlüsselübergabe</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Hausschlüssel</Label>
                      <Input
                        type="number"
                        min="0"
                        value={data.schluesselAnzahl.hausschluessel}
                        onChange={(e) => updateData({
                          schluesselAnzahl: {
                            ...data.schluesselAnzahl,
                            hausschluessel: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Wohnungsschlüssel</Label>
                      <Input
                        type="number"
                        min="0"
                        value={data.schluesselAnzahl.wohnungsschluessel}
                        onChange={(e) => updateData({
                          schluesselAnzahl: {
                            ...data.schluesselAnzahl,
                            wohnungsschluessel: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Zimmerschlüssel</Label>
                      <Input
                        type="number"
                        min="0"
                        value={data.schluesselAnzahl.zimmerschluessel}
                        onChange={(e) => updateData({
                          schluesselAnzahl: {
                            ...data.schluesselAnzahl,
                            zimmerschluessel: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Briefkastenschlüssel</Label>
                      <Input
                        type="number"
                        min="0"
                        value={data.schluesselAnzahl.briefkastenschluessel}
                        onChange={(e) => updateData({
                          schluesselAnzahl: {
                            ...data.schluesselAnzahl,
                            briefkastenschluessel: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Kellerschlüssel</Label>
                      <Input
                        type="number"
                        min="0"
                        value={data.schluesselAnzahl.kellerschluessel}
                        onChange={(e) => updateData({
                          schluesselAnzahl: {
                            ...data.schluesselAnzahl,
                            kellerschluessel: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hausordnung"
                      checked={data.hausordnungAkzeptiert}
                      onCheckedChange={(c) => updateData({ hausordnungAkzeptiert: c === true })}
                    />
                    <Label htmlFor="hausordnung">
                      Untermieter erkennt die Hausordnung an
                    </Label>
                  </div>

                  <div>
                    <Label>Reinigungspflichten (gemeinsame Bereiche)</Label>
                    <Textarea
                      value={data.reinigungspflicht}
                      onChange={(e) => updateData({ reinigungspflicht: e.target.value })}
                      placeholder="z.B. Wöchentliche Badreinigung im Wechsel, Küche nach Benutzung..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Besuchsregelung</Label>
                    <Textarea
                      value={data.besuchsregelung}
                      onChange={(e) => updateData({ besuchsregelung: e.target.value })}
                      placeholder="z.B. Übernachtungsbesuch nach Absprache..."
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    Kündigungsfristen
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Bei möbliertem Wohnraum kann bis zum 15. zum Monatsende gekündigt werden (§ 573c BGB).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <Select
                    value={data.kuendigungsfrist}
                    onValueChange={(v) => updateData({ kuendigungsfrist: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14tage">14 Tage (möbliert, § 573c BGB)</SelectItem>
                      <SelectItem value="1monat">1 Monat</SelectItem>
                      <SelectItem value="3monate">3 Monate (gesetzlich)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Abschluss */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Zusammenfassung & Unterschrift</CardTitle>
                  <CardDescription>
                    Bitte prüfen Sie alle Angaben und unterschreiben Sie den Vertrag
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Übersicht */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">HAUPTMIETER</h4>
                        <p className="font-medium">{data.hauptmieterName || '-'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">UNTERMIETER</h4>
                        <p className="font-medium">{data.untermieterName || '-'}</p>
                        <p className="text-sm text-muted-foreground">{data.untermieterBeruf}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">MIETOBJEKT</h4>
                        <p className="text-sm">
                          {data.mietobjektAdresse.strasse} {data.mietobjektAdresse.hausnummer}<br />
                          {data.mietobjektAdresse.plz} {data.mietobjektAdresse.ort}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {data.untervermieteterTeil === 'ganz' ? 'Gesamte Wohnung' :
                           data.untervermieteterTeil === 'zimmer' ? `${data.zimmerAnzahl} Zimmer` :
                           'Wohnbereich'}
                          {data.wohnflaeche > 0 && ` | ${data.wohnflaeche} m²`}
                          {' | '}
                          {data.moebliertGrad === 'unmoebliert' ? 'Unmöbliert' :
                           data.moebliertGrad === 'teilmoebliert' ? 'Teilmöbliert' : 'Vollmöbliert'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">MIETDAUER</h4>
                        <p className="text-sm">
                          Ab {data.mietbeginn ? formatDate(data.mietbeginn) : '-'}
                          {data.befristet && data.mietende && ` bis ${formatDate(data.mietende)}`}
                          {!data.befristet && ' (unbefristet)'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Kosten */}
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-purple-900 mb-2">Monatliche Kosten</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Untermiete</span>
                              <span>{formatCurrency(data.untermiete)}</span>
                            </div>
                            {data.moeblierungszuschlag > 0 && (
                              <div className="flex justify-between">
                                <span>Möblierung</span>
                                <span>{formatCurrency(data.moeblierungszuschlag)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Nebenkosten</span>
                              <span>
                                {formatCurrency(
                                  data.nebenkostenart === 'pauschale'
                                    ? data.nebenkostenPauschale
                                    : data.nebenkostenVorauszahlung
                                )}
                              </span>
                            </div>
                            <Separator className="my-1" />
                            <div className="flex justify-between font-bold">
                              <span>Gesamt</span>
                              <span>{formatCurrency(data.gesamtmiete)}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-900 mb-2">Kaution</h4>
                          <p className="text-2xl font-bold text-purple-700">
                            {formatCurrency(data.kaution)}
                          </p>
                          <p className="text-xs text-purple-600">
                            {data.kautionZahlweise === 'einmalig' ? 'Bei Einzug' : 'In 3 Raten'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Separator />

                  {/* Unterschriften */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Ort</Label>
                        <Input
                          value={data.unterschriftOrt}
                          onChange={(e) => updateData({ unterschriftOrt: e.target.value })}
                          placeholder="Berlin"
                        />
                      </div>
                      <div>
                        <Label>Datum</Label>
                        <Input
                          type="date"
                          value={data.unterschriftDatum}
                          onChange={(e) => updateData({ unterschriftDatum: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SignatureField
                        label="Unterschrift Hauptmieter"
                        value={data.unterschriftHauptmieter}
                        onChange={(sig) => updateData({ unterschriftHauptmieter: sig })}
                      />
                      <SignatureField
                        label="Unterschrift Untermieter"
                        value={data.unterschriftUntermieter}
                        onChange={(sig) => updateData({ unterschriftUntermieter: sig })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="lg" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
                <Button size="lg" onClick={generatePDF} className="bg-purple-600 hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  PDF herunterladen
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {currentStep < 6 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <Button onClick={nextStep}>
                Weiter
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
