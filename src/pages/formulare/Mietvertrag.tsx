import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Home,
  Euro,
  Calendar,
  FileText,
  Check
} from 'lucide-react'
import { FormWizard, WizardStep } from '@/components/wizard/FormWizard'
import { useToast } from '@/hooks/use-toast'
import { MietvertragData, INITIAL_MIETVERTRAG } from '@/types/mietvertrag'

// Step Components
import { Step1Vertragsparteien } from '@/pages/formulare/steps/mietvertrag/Step1Vertragsparteien'
import { Step2Mietobjekt } from '@/pages/formulare/steps/mietvertrag/Step2Mietobjekt'
import { Step3Mietkonditionen } from '@/pages/formulare/steps/mietvertrag/Step3Mietkonditionen'
import { Step4MietdauerKaution } from '@/pages/formulare/steps/mietvertrag/Step4MietdauerKaution'
import { Step5Sondervereinbarungen } from '@/pages/formulare/steps/mietvertrag/Step5Sondervereinbarungen'
import { Step6Zusammenfassung } from '@/pages/formulare/steps/mietvertrag/Step6Zusammenfassung'

import { generateMietvertragPDF } from '@/lib/pdf/mietvertrag-pdf'

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'vertragsparteien',
    title: 'Vertragsparteien',
    description: 'Vermieter und Mieter',
    icon: <Users className="h-5 w-5 text-primary" />
  },
  {
    id: 'mietobjekt',
    title: 'Mietobjekt',
    description: 'Wohnung und Ausstattung',
    icon: <Home className="h-5 w-5 text-primary" />
  },
  {
    id: 'mietkonditionen',
    title: 'Mietkonditionen',
    description: 'Miete und Nebenkosten',
    icon: <Euro className="h-5 w-5 text-primary" />
  },
  {
    id: 'mietdauer',
    title: 'Mietdauer & Kaution',
    description: 'Laufzeit und Sicherheit',
    icon: <Calendar className="h-5 w-5 text-primary" />
  },
  {
    id: 'sondervereinbarungen',
    title: 'Sondervereinbarungen',
    description: 'Zusätzliche Regelungen',
    icon: <FileText className="h-5 w-5 text-primary" />
  },
  {
    id: 'zusammenfassung',
    title: 'Zusammenfassung',
    description: 'Prüfen und Unterschreiben',
    icon: <Check className="h-5 w-5 text-primary" />
  }
]

export default function MietvertragFormularPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [formData, setFormData] = React.useState<MietvertragData>(INITIAL_MIETVERTRAG)
  const [isLoading, setIsLoading] = React.useState(false)

  // Daten aktualisieren
  const updateFormData = (updates: Partial<MietvertragData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // Gesamtmiete automatisch berechnen
  React.useEffect(() => {
    const kalt = formData.kaltmiete || 0
    const neben = formData.nebenkostenVorauszahlung || 0
    const heiz = formData.heizkostenVorauszahlung || 0
    updateFormData({ gesamtmiete: kalt + neben + heiz })
  }, [formData.kaltmiete, formData.nebenkostenVorauszahlung, formData.heizkostenVorauszahlung])

  // Entwurf speichern
  const handleSaveDraft = () => {
    try {
      localStorage.setItem('mietvertrag-draft', JSON.stringify(formData))
      toast({
        title: "Entwurf gespeichert",
        description: "Ihr Mietvertrag-Entwurf wurde lokal gespeichert.",
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Entwurf konnte nicht gespeichert werden.",
        variant: "destructive"
      })
    }
  }

  // Entwurf laden beim Start
  React.useEffect(() => {
    const draft = localStorage.getItem('mietvertrag-draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setFormData({ ...INITIAL_MIETVERTRAG, ...parsed })
        toast({
          title: "Entwurf geladen",
          description: "Ihr gespeicherter Entwurf wurde wiederhergestellt.",
        })
      } catch (error) {
        console.error('Could not load draft:', error)
      }
    }
  }, [])

  // PDF exportieren
  const handleExportPDF = async () => {
    setIsLoading(true)
    try {
      await generateMietvertragPDF(formData)
      toast({
        title: "PDF erstellt",
        description: "Ihr Mietvertrag wurde als PDF heruntergeladen.",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das PDF konnte nicht erstellt werden.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Formular abschließen
  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // Hier könnte man das Formular an ein Backend senden
      await generateMietvertragPDF(formData)

      // Entwurf löschen
      localStorage.removeItem('mietvertrag-draft')

      toast({
        title: "Mietvertrag erstellt!",
        description: "Ihr Mietvertrag wurde erfolgreich erstellt und als PDF heruntergeladen.",
        variant: "success"
      })

      // Optional: Weiterleitung
      // navigate('/meine-dokumente')
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Mietvertrag konnte nicht erstellt werden.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Aktuellen Schritt rendern
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1Vertragsparteien data={formData} onChange={updateFormData} />
      case 1:
        return <Step2Mietobjekt data={formData} onChange={updateFormData} />
      case 2:
        return <Step3Mietkonditionen data={formData} onChange={updateFormData} />
      case 3:
        return <Step4MietdauerKaution data={formData} onChange={updateFormData} />
      case 4:
        return <Step5Sondervereinbarungen data={formData} onChange={updateFormData} />
      case 5:
        return (
          <Step6Zusammenfassung
            data={formData}
            onChange={updateFormData}
            onEditStep={setCurrentStep}
          />
        )
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
      onExportPDF={currentStep === 5 ? handleExportPDF : undefined}
      title="Mietvertrag Wohnraum"
      description="Erstellen Sie einen rechtssicheren Wohnraummietvertrag"
      isLoading={isLoading}
      canProceed={true}
    >
      {renderStep()}
    </FormWizard>
  )
}
