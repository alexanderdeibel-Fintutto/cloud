import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, TrendingUp, Info, AlertTriangle, CheckCircle2, Save, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AddressField } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { generateMieterhoehungPDF } from '@/lib/pdf/mieterhoehung-pdf'

interface MieterhoehungData {
  // Vermieter
  vermieterName: string
  vermieterAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }

  // Mieter
  mieterName: string
  mieterAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }

  // Mietobjekt
  mietobjektAdresse: {
    strasse: string
    hausnummer: string
    plz: string
    ort: string
  }
  wohnflaeche: number
  zimmeranzahl: string
  etage: string
  baujahr: string

  // Aktuelle Miete
  aktuelleMiete: number
  aktuelleMieteProQm: number
  letzteMieterhoehung: string
  mietbeginn: string

  // Neue Miete
  neueMiete: number
  neueMieteProQm: number
  erhoehungAb: string

  // Begründung
  begruendungsart: 'mietspiegel' | 'vergleichswohnungen' | 'gutachten'
  mietspiegelJahr: string
  mietspiegelGemeinde: string
  vergleichsmieteVon: number
  vergleichsmieteBis: number

  // Vergleichswohnungen (falls gewählt)
  vergleichswohnungen: {
    adresse: string
    wohnflaeche: number
    miete: number
  }[]

  // Ausstattungsmerkmale
  ausstattung: {
    bad: string
    heizung: string
    bodenbelag: string
    balkon: boolean
    aufzug: boolean
    einbaukueche: boolean
    keller: boolean
    garage: boolean
  }

  // Kappungsgrenze
  kappungsgrenzeGeprueft: boolean
  kappungsgrenzeInfo: {
    mieteVor3Jahren: number
    maxErhoehung: number
    kappungsgrenzeProzent: number
  }

  // Sonstiges
  zustimmungsfrist: string
  hinweiseAnMieter: string
}

const steps = [
  { id: 1, title: 'Vertragsparteien', description: 'Vermieter & Mieter' },
  { id: 2, title: 'Mietobjekt', description: 'Wohnungsdaten' },
  { id: 3, title: 'Aktuelle Miete', description: 'Bisherige Konditionen' },
  { id: 4, title: 'Mieterhöhung', description: 'Neue Miete & Begründung' },
  { id: 5, title: 'Zusammenfassung', description: 'Prüfung & Download' },
]

const initialData: MieterhoehungData = {
  vermieterName: '',
  vermieterAdresse: { strasse: '', hausnummer: '', plz: '', ort: '' },
  mieterName: '',
  mieterAdresse: { strasse: '', hausnummer: '', plz: '', ort: '' },
  mietobjektAdresse: { strasse: '', hausnummer: '', plz: '', ort: '' },
  wohnflaeche: 0,
  zimmeranzahl: '',
  etage: '',
  baujahr: '',
  aktuelleMiete: 0,
  aktuelleMieteProQm: 0,
  letzteMieterhoehung: '',
  mietbeginn: '',
  neueMiete: 0,
  neueMieteProQm: 0,
  erhoehungAb: '',
  begruendungsart: 'mietspiegel',
  mietspiegelJahr: new Date().getFullYear().toString(),
  mietspiegelGemeinde: '',
  vergleichsmieteVon: 0,
  vergleichsmieteBis: 0,
  vergleichswohnungen: [],
  ausstattung: {
    bad: '',
    heizung: '',
    bodenbelag: '',
    balkon: false,
    aufzug: false,
    einbaukueche: false,
    keller: false,
    garage: false,
  },
  kappungsgrenzeGeprueft: false,
  kappungsgrenzeInfo: {
    mieteVor3Jahren: 0,
    maxErhoehung: 0,
    kappungsgrenzeProzent: 20,
  },
  zustimmungsfrist: '',
  hinweiseAnMieter: '',
}

export default function Mieterhoehung() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<MieterhoehungData>(initialData)

  const { handleSave, documentId } = useDocumentSave({
    type: 'mieterhoehung',
    generateTitle: (formData) => `Mieterhöhung - ${formData.mieterName || ''}`.trim() || 'Mieterhöhung'
  })

  // Load existing document if editing
  useEffect(() => {
    const id = searchParams.get('id')
    if (id && user) {
      const doc = getDocument(id, user.id)
      if (doc?.data) {
        setData({ ...initialData, ...doc.data })
      }
    }
  }, [searchParams, user])

  const updateData = (updates: Partial<MieterhoehungData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = () => {
    handleSave(data)
  }

  const progress = (currentStep / steps.length) * 100

  // Berechne Miete pro qm wenn Wohnfläche vorhanden
  const berechnePreisProQm = (miete: number) => {
    if (data.wohnflaeche > 0) {
      return miete / data.wohnflaeche
    }
    return 0
  }

  // Berechne Kappungsgrenze
  const berechneKappungsgrenze = () => {
    const mieteVor3Jahren = data.kappungsgrenzeInfo.mieteVor3Jahren || data.aktuelleMiete
    const kappungsProzent = data.kappungsgrenzeInfo.kappungsgrenzeProzent || 20
    const maxErhoehung = mieteVor3Jahren * (kappungsProzent / 100)
    const maxMiete = mieteVor3Jahren + maxErhoehung
    return { maxErhoehung, maxMiete, prozent: kappungsProzent }
  }

  // Prüfe ob Erhöhung zulässig
  const istErhoehungZulaessig = () => {
    const kappung = berechneKappungsgrenze()
    const neueGesamt = data.neueMiete

    // Prüfe Kappungsgrenze
    if (neueGesamt > kappung.maxMiete) {
      return { zulaessig: false, grund: 'Kappungsgrenze überschritten' }
    }

    // Prüfe ob neue Miete innerhalb Vergleichsmiete liegt
    if (data.neueMieteProQm > data.vergleichsmieteBis && data.vergleichsmieteBis > 0) {
      return { zulaessig: false, grund: 'Neue Miete liegt über ortsüblicher Vergleichsmiete' }
    }

    return { zulaessig: true, grund: '' }
  }

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
      await generateMieterhoehungPDF({
        vermieterName: data.vermieterName,
        vermieterAdresse: data.vermieterAdresse,
        mieterName: data.mieterName,
        mieterAdresse: data.mieterAdresse,
        mietobjektAdresse: data.mietobjektAdresse,
        wohnflaeche: data.wohnflaeche,
        zimmeranzahl: data.zimmeranzahl,
        baujahr: data.baujahr,
        aktuelleMiete: data.aktuelleMiete,
        letzteMieterhoehung: data.letzteMieterhoehung,
        mietbeginn: data.mietbeginn,
        neueMiete: data.neueMiete,
        erhoehungAb: data.erhoehungAb,
        begruendungsart: data.begruendungsart,
        mietspiegelJahr: data.mietspiegelJahr,
        mietspiegelGemeinde: data.mietspiegelGemeinde,
        vergleichsmieteVon: data.vergleichsmieteVon,
        vergleichsmieteBis: data.vergleichsmieteBis,
        ausstattung: {
          bad: data.ausstattung.bad,
          heizung: data.ausstattung.heizung,
          bodenbelag: data.ausstattung.bodenbelag,
          balkon: data.ausstattung.balkon,
          aufzug: data.ausstattung.aufzug,
          einbaukueche: data.ausstattung.einbaukueche
        },
        kappungsgrenzeInfo: {
          mieteVor3Jahren: data.kappungsgrenzeInfo.mieteVor3Jahren,
          kappungsgrenzeProzent: data.kappungsgrenzeInfo.kappungsgrenzeProzent
        }
      })
      toast({
        title: 'PDF erstellt',
        description: 'Das Mieterhöhungsverlangen wurde als PDF heruntergeladen.',
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h1 className="font-semibold">Mieterhöhungsverlangen</h1>
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
                  ? 'text-orange-600 font-medium'
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

          {/* Step 1: Vertragsparteien */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Vertragsparteien</CardTitle>
                <CardDescription>
                  Angaben zu Vermieter und Mieter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Vermieter */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    Vermieter
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Der Vermieter ist derjenige, der das Mieterhöhungsverlangen stellt (§ 558 BGB).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Name des Vermieters / der Vermieterin</Label>
                      <Input
                        value={data.vermieterName}
                        onChange={(e) => updateData({ vermieterName: e.target.value })}
                        placeholder="Max Mustermann / Mustermann GmbH"
                      />
                    </div>
                    <AddressField
                      value={data.vermieterAdresse}
                      onChange={(adresse) => updateData({ vermieterAdresse: adresse })}
                      label="Adresse des Vermieters"
                    />
                  </div>
                </div>

                <Separator />

                {/* Mieter */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    Mieter
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Der Mieter muss dem Erhöhungsverlangen zustimmen (§ 558b BGB).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Name des Mieters / der Mieter</Label>
                      <Input
                        value={data.mieterName}
                        onChange={(e) => updateData({ mieterName: e.target.value })}
                        placeholder="Erika Musterfrau"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Bei mehreren Mietern alle Namen angeben
                      </p>
                    </div>
                    <AddressField
                      value={data.mieterAdresse}
                      onChange={(adresse) => updateData({ mieterAdresse: adresse })}
                      label="Adresse des Mieters (falls abweichend)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Mietobjekt */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Mietobjekt</CardTitle>
                <CardDescription>
                  Angaben zur vermieteten Wohnung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AddressField
                  value={data.mietobjektAdresse}
                  onChange={(adresse) => updateData({ mietobjektAdresse: adresse })}
                  label="Adresse der Wohnung"
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Wohnfläche (m²)</Label>
                    <Input
                      type="number"
                      value={data.wohnflaeche || ''}
                      onChange={(e) => {
                        const wf = parseFloat(e.target.value) || 0
                        updateData({
                          wohnflaeche: wf,
                          aktuelleMieteProQm: wf > 0 ? data.aktuelleMiete / wf : 0,
                          neueMieteProQm: wf > 0 ? data.neueMiete / wf : 0
                        })
                      }}
                      placeholder="75"
                    />
                  </div>
                  <div>
                    <Label>Zimmer</Label>
                    <Select
                      value={data.zimmeranzahl}
                      onValueChange={(v) => updateData({ zimmeranzahl: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auswahl" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Zimmer</SelectItem>
                        <SelectItem value="2">2 Zimmer</SelectItem>
                        <SelectItem value="3">3 Zimmer</SelectItem>
                        <SelectItem value="4">4 Zimmer</SelectItem>
                        <SelectItem value="5">5+ Zimmer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Etage</Label>
                    <Select
                      value={data.etage}
                      onValueChange={(v) => updateData({ etage: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auswahl" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eg">Erdgeschoss</SelectItem>
                        <SelectItem value="1">1. OG</SelectItem>
                        <SelectItem value="2">2. OG</SelectItem>
                        <SelectItem value="3">3. OG</SelectItem>
                        <SelectItem value="4">4. OG</SelectItem>
                        <SelectItem value="5+">5. OG+</SelectItem>
                        <SelectItem value="dg">Dachgeschoss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Baujahr</Label>
                    <Input
                      value={data.baujahr}
                      onChange={(e) => updateData({ baujahr: e.target.value })}
                      placeholder="1985"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    Ausstattungsmerkmale
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Die Ausstattung ist relevant für die Einordnung im Mietspiegel (§ 558 Abs. 2 BGB).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Badausstattung</Label>
                      <Select
                        value={data.ausstattung.bad}
                        onValueChange={(v) => updateData({
                          ausstattung: { ...data.ausstattung, bad: v }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Auswahl" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="einfach">Einfach</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="gehoben">Gehoben</SelectItem>
                          <SelectItem value="luxus">Luxus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Heizungsart</Label>
                      <Select
                        value={data.ausstattung.heizung}
                        onValueChange={(v) => updateData({
                          ausstattung: { ...data.ausstattung, heizung: v }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Auswahl" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zentral">Zentralheizung</SelectItem>
                          <SelectItem value="etage">Etagenheizung</SelectItem>
                          <SelectItem value="ofen">Ofenheizung</SelectItem>
                          <SelectItem value="fussboden">Fußbodenheizung</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Bodenbelag</Label>
                      <Select
                        value={data.ausstattung.bodenbelag}
                        onValueChange={(v) => updateData({
                          ausstattung: { ...data.ausstattung, bodenbelag: v }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Auswahl" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pvc">PVC/Linoleum</SelectItem>
                          <SelectItem value="laminat">Laminat</SelectItem>
                          <SelectItem value="parkett">Parkett</SelectItem>
                          <SelectItem value="fliesen">Fliesen</SelectItem>
                          <SelectItem value="teppich">Teppich</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="balkon"
                        checked={data.ausstattung.balkon}
                        onCheckedChange={(c) => updateData({
                          ausstattung: { ...data.ausstattung, balkon: c === true }
                        })}
                      />
                      <Label htmlFor="balkon">Balkon/Terrasse</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="aufzug"
                        checked={data.ausstattung.aufzug}
                        onCheckedChange={(c) => updateData({
                          ausstattung: { ...data.ausstattung, aufzug: c === true }
                        })}
                      />
                      <Label htmlFor="aufzug">Aufzug</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="einbaukueche"
                        checked={data.ausstattung.einbaukueche}
                        onCheckedChange={(c) => updateData({
                          ausstattung: { ...data.ausstattung, einbaukueche: c === true }
                        })}
                      />
                      <Label htmlFor="einbaukueche">Einbauküche</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="keller"
                        checked={data.ausstattung.keller}
                        onCheckedChange={(c) => updateData({
                          ausstattung: { ...data.ausstattung, keller: c === true }
                        })}
                      />
                      <Label htmlFor="keller">Keller</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="garage"
                        checked={data.ausstattung.garage}
                        onCheckedChange={(c) => updateData({
                          ausstattung: { ...data.ausstattung, garage: c === true }
                        })}
                      />
                      <Label htmlFor="garage">Stellplatz/Garage</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Aktuelle Miete */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Aktuelle Miete</CardTitle>
                <CardDescription>
                  Bisherige Mietkonditionen und Miethistorie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        Aktuelle Nettokaltmiete
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Die Nettokaltmiete (ohne Nebenkosten) ist Basis für die Mieterhöhung (§ 558 BGB).</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <CurrencyField
                        label="Aktuelle Nettokaltmiete"
                        value={data.aktuelleMiete}
                        onChange={(v) => updateData({
                          aktuelleMiete: v ?? 0,
                          aktuelleMieteProQm: berechnePreisProQm(v ?? 0)
                        })}
                      />
                      {data.wohnflaeche > 0 && data.aktuelleMiete > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          = {formatCurrency(data.aktuelleMiete / data.wohnflaeche)}/m²
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Mietbeginn</Label>
                      <Input
                        type="date"
                        value={data.mietbeginn}
                        onChange={(e) => updateData({ mietbeginn: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        Letzte Mieterhöhung
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Zwischen zwei Mieterhöhungen müssen mindestens 15 Monate liegen (§ 558 Abs. 1 BGB).</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        type="date"
                        value={data.letzteMieterhoehung}
                        onChange={(e) => updateData({ letzteMieterhoehung: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Falls keine bisherige Erhöhung: Mietbeginn angeben
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900">Kappungsgrenze beachten</p>
                            <p className="text-blue-700 mt-1">
                              Die Miete darf innerhalb von 3 Jahren nicht um mehr als{' '}
                              <strong>{data.kappungsgrenzeInfo.kappungsgrenzeProzent}%</strong> steigen
                              (§ 558 Abs. 3 BGB).
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <Label className="flex items-center gap-2">
                        Kappungsgrenze in Ihrer Gemeinde
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">In Gebieten mit angespanntem Wohnungsmarkt kann die Kappungsgrenze auf 15% reduziert sein (§ 558 Abs. 3 BGB).</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Select
                        value={data.kappungsgrenzeInfo.kappungsgrenzeProzent.toString()}
                        onValueChange={(v) => updateData({
                          kappungsgrenzeInfo: {
                            ...data.kappungsgrenzeInfo,
                            kappungsgrenzeProzent: parseInt(v)
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20% (Standard)</SelectItem>
                          <SelectItem value="15">15% (angespannter Wohnungsmarkt)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <CurrencyField
                        label="Miete vor 3 Jahren (falls bekannt)"
                        value={data.kappungsgrenzeInfo.mieteVor3Jahren}
                        onChange={(v) => updateData({
                          kappungsgrenzeInfo: {
                            ...data.kappungsgrenzeInfo,
                            mieteVor3Jahren: v ?? 0
                          }
                        })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Für Berechnung der maximalen Erhöhung
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Mieterhöhung */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Mieterhöhung</CardTitle>
                <CardDescription>
                  Neue Miete und Begründung gemäß § 558 BGB
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Begründungsart */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    Begründung der Mieterhöhung
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Die Mieterhöhung muss begründet werden. Am häufigsten wird der Mietspiegel verwendet (§ 558a BGB).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <RadioGroup
                    value={data.begruendungsart}
                    onValueChange={(v: 'mietspiegel' | 'vergleichswohnungen' | 'gutachten') =>
                      updateData({ begruendungsart: v })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mietspiegel" id="mietspiegel" />
                      <Label htmlFor="mietspiegel" className="font-normal">
                        Mietspiegel (empfohlen)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vergleichswohnungen" id="vergleichswohnungen" />
                      <Label htmlFor="vergleichswohnungen" className="font-normal">
                        Vergleichswohnungen (mind. 3)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gutachten" id="gutachten" />
                      <Label htmlFor="gutachten" className="font-normal">
                        Sachverständigengutachten
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Mietspiegel Details */}
                {data.begruendungsart === 'mietspiegel' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Mietspiegel-Angaben</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Mietspiegel der Gemeinde</Label>
                        <Input
                          value={data.mietspiegelGemeinde}
                          onChange={(e) => updateData({ mietspiegelGemeinde: e.target.value })}
                          placeholder="z.B. Berlin, München, Hamburg..."
                        />
                      </div>
                      <div>
                        <Label>Mietspiegel-Jahr</Label>
                        <Input
                          value={data.mietspiegelJahr}
                          onChange={(e) => updateData({ mietspiegelJahr: e.target.value })}
                          placeholder="2024"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Vergleichsmiete von (€/m²)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={data.vergleichsmieteVon || ''}
                          onChange={(e) => updateData({
                            vergleichsmieteVon: parseFloat(e.target.value) || 0
                          })}
                          placeholder="8.50"
                        />
                      </div>
                      <div>
                        <Label>Vergleichsmiete bis (€/m²)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={data.vergleichsmieteBis || ''}
                          onChange={(e) => updateData({
                            vergleichsmieteBis: parseFloat(e.target.value) || 0
                          })}
                          placeholder="12.50"
                        />
                      </div>
                    </div>
                    {data.vergleichsmieteVon > 0 && data.vergleichsmieteBis > 0 && data.wohnflaeche > 0 && (
                      <Card className="bg-muted/50">
                        <CardContent className="pt-4">
                          <p className="text-sm">
                            <strong>Mietspanne laut Mietspiegel:</strong><br />
                            {formatCurrency(data.vergleichsmieteVon * data.wohnflaeche)} - {formatCurrency(data.vergleichsmieteBis * data.wohnflaeche)}
                            {' '}(bei {data.wohnflaeche} m²)
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <Separator />

                {/* Neue Miete */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Neue Miete</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="flex items-center gap-2">
                        Neue Nettokaltmiete
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Die neue Miete muss innerhalb der ortsüblichen Vergleichsmiete liegen und die Kappungsgrenze beachten (§ 558 BGB).</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <CurrencyField
                        label="Neue Nettokaltmiete"
                        value={data.neueMiete}
                        onChange={(v) => updateData({
                          neueMiete: v ?? 0,
                          neueMieteProQm: berechnePreisProQm(v ?? 0)
                        })}
                      />
                      {data.wohnflaeche > 0 && data.neueMiete > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          = {formatCurrency(data.neueMiete / data.wohnflaeche)}/m²
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Mieterhöhung wirksam ab</Label>
                      <Input
                        type="date"
                        value={data.erhoehungAb}
                        onChange={(e) => updateData({ erhoehungAb: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Frühestens nach Ablauf der Zustimmungsfrist
                      </p>
                    </div>
                  </div>

                  {/* Prüfung */}
                  {data.neueMiete > 0 && data.aktuelleMiete > 0 && (
                    <div className="space-y-3">
                      <Card className={`${
                        istErhoehungZulaessig().zulaessig
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            {istErhoehungZulaessig().zulaessig ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            )}
                            <div>
                              <p className={`font-medium ${
                                istErhoehungZulaessig().zulaessig ? 'text-green-900' : 'text-red-900'
                              }`}>
                                {istErhoehungZulaessig().zulaessig
                                  ? 'Mieterhöhung ist zulässig'
                                  : `Achtung: ${istErhoehungZulaessig().grund}`
                                }
                              </p>
                              <div className="text-sm mt-2 space-y-1">
                                <p>
                                  <strong>Erhöhung:</strong>{' '}
                                  {formatCurrency(data.neueMiete - data.aktuelleMiete)}
                                  {' '}({((data.neueMiete - data.aktuelleMiete) / data.aktuelleMiete * 100).toFixed(1)}%)
                                </p>
                                <p>
                                  <strong>Kappungsgrenze:</strong>{' '}
                                  max. {data.kappungsgrenzeInfo.kappungsgrenzeProzent}% in 3 Jahren
                                  {' '}= max. {formatCurrency(berechneKappungsgrenze().maxMiete)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Zusammenfassung */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Zusammenfassung</CardTitle>
                  <CardDescription>
                    Bitte prüfen Sie alle Angaben vor dem PDF-Export
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Übersicht */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">VERMIETER</h4>
                        <p className="font-medium">{data.vermieterName || '-'}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.vermieterAdresse.strasse} {data.vermieterAdresse.hausnummer}<br />
                          {data.vermieterAdresse.plz} {data.vermieterAdresse.ort}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">MIETER</h4>
                        <p className="font-medium">{data.mieterName || '-'}</p>
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
                          {data.wohnflaeche} m² | {data.zimmeranzahl} Zimmer | {data.etage}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Miete Vergleich */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Aktuelle Miete</p>
                      <p className="text-2xl font-bold">{formatCurrency(data.aktuelleMiete)}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.wohnflaeche > 0 && `${formatCurrency(data.aktuelleMiete / data.wohnflaeche)}/m²`}
                      </p>
                    </div>
                    <div className="p-4 flex items-center justify-center">
                      <ArrowRight className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="p-4 bg-orange-100 rounded-lg">
                      <p className="text-sm text-orange-600">Neue Miete</p>
                      <p className="text-2xl font-bold text-orange-700">{formatCurrency(data.neueMiete)}</p>
                      <p className="text-xs text-orange-600">
                        {data.wohnflaeche > 0 && `${formatCurrency(data.neueMiete / data.wohnflaeche)}/m²`}
                      </p>
                    </div>
                  </div>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-orange-900">Mieterhöhung</p>
                          <p className="text-sm text-orange-700">
                            Wirksam ab: {data.erhoehungAb ? formatDate(data.erhoehungAb) : '-'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-700">
                            +{formatCurrency(data.neueMiete - data.aktuelleMiete)}
                          </p>
                          <p className="text-sm text-orange-600">
                            +{((data.neueMiete - data.aktuelleMiete) / data.aktuelleMiete * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Separator />

                  {/* Begründung */}
                  <div>
                    <h4 className="font-semibold mb-2">Begründung</h4>
                    <p className="text-sm">
                      {data.begruendungsart === 'mietspiegel' && (
                        <>
                          Bezugnahme auf den Mietspiegel der Gemeinde {data.mietspiegelGemeinde} ({data.mietspiegelJahr}).
                          Vergleichsmiete: {formatCurrency(data.vergleichsmieteVon)}/m² - {formatCurrency(data.vergleichsmieteBis)}/m²
                        </>
                      )}
                      {data.begruendungsart === 'vergleichswohnungen' && 'Benennung von Vergleichswohnungen'}
                      {data.begruendungsart === 'gutachten' && 'Sachverständigengutachten'}
                    </p>
                  </div>

                  {/* Hinweise */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Hinweise für den Mieter</p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Zustimmungsfrist: Bis zum Ablauf des übernächsten Monats</li>
                            <li>Bei Nichtzustimmung kann der Vermieter Klage auf Zustimmung erheben</li>
                            <li>Der Mieter kann die Angaben im Mietspiegel selbst prüfen</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="lg" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
                {documentId && (
                  <Button variant="outline" size="lg" onClick={generatePDF}>
                    <FileDown className="h-4 w-4 mr-2" />
                    PDF erstellen
                  </Button>
                )}
                <Button size="lg" onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
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
