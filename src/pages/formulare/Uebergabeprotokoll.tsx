import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Home,
  Gauge,
  Key,
  ClipboardCheck,
  FileSignature,
  Check
} from 'lucide-react'
import { FormWizard, WizardStep } from '@/components/wizard/FormWizard'
import { useToast } from '@/hooks/use-toast'
import {
  UebergabeprotokollData,
  STANDARD_SCHLUESSEL,
  EMPTY_ZAEHLERSTAND,
  EMPTY_RAUM
} from '@/types/uebergabeprotokoll'
import { EMPTY_PERSON, EMPTY_ADDRESS, EMPTY_SIGNATURE } from '@/types/mietvertrag'
import { generateUebergabeprotokollPDF } from '@/lib/pdf/uebergabeprotokoll-pdf'

// Step Components
import { Step1Grunddaten } from './steps/uebergabeprotokoll/Step1Grunddaten'
import { Step2Zaehlerstaende } from './steps/uebergabeprotokoll/Step2Zaehlerstaende'
import { Step3Schluessel } from './steps/uebergabeprotokoll/Step3Schluessel'
import { Step4Raeume } from './steps/uebergabeprotokoll/Step4Raeume'
import { Step5Vereinbarungen } from './steps/uebergabeprotokoll/Step5Vereinbarungen'
import { Step6Unterschriften } from './steps/uebergabeprotokoll/Step6Unterschriften'

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'grunddaten',
    title: 'Grunddaten',
    description: 'Beteiligte und Objekt',
    icon: <Users className="h-5 w-5 text-primary" />
  },
  {
    id: 'zaehlerstaende',
    title: 'Zaehlerstaende',
    description: 'Strom, Gas, Wasser',
    icon: <Gauge className="h-5 w-5 text-primary" />
  },
  {
    id: 'schluessel',
    title: 'Schluessel',
    description: 'Schluesseluebergabe',
    icon: <Key className="h-5 w-5 text-primary" />
  },
  {
    id: 'raeume',
    title: 'Zustandserfassung',
    description: 'Raumweise Pruefung',
    icon: <ClipboardCheck className="h-5 w-5 text-primary" />
  },
  {
    id: 'vereinbarungen',
    title: 'Vereinbarungen',
    description: 'Maengel & Absprachen',
    icon: <Home className="h-5 w-5 text-primary" />
  },
  {
    id: 'unterschriften',
    title: 'Unterschriften',
    description: 'Protokoll abschliessen',
    icon: <FileSignature className="h-5 w-5 text-primary" />
  }
]

const INITIAL_DATA: UebergabeprotokollData = {
  protokollart: 'einzug',
  uebergabedatum: new Date().toISOString().split('T')[0],
  uebergabeuhrzeit: '10:00',

  vermieter: { ...EMPTY_PERSON },
  mieterNeu: { ...EMPTY_PERSON },
  objektAdresse: { ...EMPTY_ADDRESS },
  wohnflaeche: null,

  zaehlerstaende: [
    { ...EMPTY_ZAEHLERSTAND, zaehlerart: 'strom', einheit: 'kWh' },
    { ...EMPTY_ZAEHLERSTAND, zaehlerart: 'gas', einheit: 'm3' },
    { ...EMPTY_ZAEHLERSTAND, zaehlerart: 'wasser', einheit: 'm3' },
    { ...EMPTY_ZAEHLERSTAND, zaehlerart: 'heizung', einheit: 'Einheiten' },
  ],

  schluessel: [...STANDARD_SCHLUESSEL],

  raeume: [
    { ...EMPTY_RAUM, raumname: 'Wohnzimmer', raumtyp: 'wohnzimmer' },
    { ...EMPTY_RAUM, raumname: 'Schlafzimmer', raumtyp: 'schlafzimmer' },
    { ...EMPTY_RAUM, raumname: 'Kueche', raumtyp: 'kueche' },
    { ...EMPTY_RAUM, raumname: 'Bad', raumtyp: 'bad' },
    { ...EMPTY_RAUM, raumname: 'Flur', raumtyp: 'flur' },
  ],

  allgemeinerZustand: 'normal',
  reinigungszustand: 'besenrein',

  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieterNeu: { ...EMPTY_SIGNATURE },

  erstelltAm: new Date().toISOString()
}

export default function UebergabeprotokollPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [formData, setFormData] = React.useState<UebergabeprotokollData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateFormData = (updates: Partial<UebergabeprotokollData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('uebergabeprotokoll-draft', JSON.stringify(formData))
      toast({
        title: "Entwurf gespeichert",
        description: "Ihr Protokoll-Entwurf wurde lokal gespeichert.",
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Entwurf konnte nicht gespeichert werden.",
        variant: "destructive"
      })
    }
  }

  React.useEffect(() => {
    const draft = localStorage.getItem('uebergabeprotokoll-draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setFormData({ ...INITIAL_DATA, ...parsed })
        toast({
          title: "Entwurf geladen",
          description: "Ihr gespeicherter Entwurf wurde wiederhergestellt.",
        })
      } catch (error) {
        console.error('Could not load draft:', error)
      }
    }
  }, [])

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await generateUebergabeprotokollPDF(formData)
      localStorage.removeItem('uebergabeprotokoll-draft')
      toast({
        title: "Protokoll erstellt!",
        description: "Das Übergabeprotokoll wurde als PDF heruntergeladen.",
      })
    } catch (error) {
      console.error('PDF-Generierung fehlgeschlagen:', error)
      toast({
        title: "Fehler",
        description: "Das Protokoll konnte nicht erstellt werden.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1Grunddaten data={formData} onChange={updateFormData} />
      case 1:
        return <Step2Zaehlerstaende data={formData} onChange={updateFormData} />
      case 2:
        return <Step3Schluessel data={formData} onChange={updateFormData} />
      case 3:
        return <Step4Raeume data={formData} onChange={updateFormData} />
      case 4:
        return <Step5Vereinbarungen data={formData} onChange={updateFormData} />
      case 5:
        return <Step6Unterschriften data={formData} onChange={updateFormData} onEditStep={setCurrentStep} />
      default:
        return null
    }
  }

  return (
    <FormWizard
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onComplete={handleComplete}
      onSaveDraft={handleSaveDraft}
      title="Wohnungsuebergabeprotokoll"
      description={formData.protokollart === 'einzug' ? 'Einzugsprotokoll' : 'Auszugsprotokoll'}
      isLoading={isLoading}
      canProceed={true}
    >
      {renderStep()}
    </FormWizard>
  )
}
