/**
 * OnboardingGate — fintutto AMS
 *
 * Wrapper-Komponente, die beim ersten Login den Onboarding-Wizard anzeigt.
 * Prüft ob der Nutzer sein Onboarding abgeschlossen hat und zeigt ggf. den Wizard.
 */

import { useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import OnboardingWizard from './OnboardingWizard'

type Segment =
  | 'museum' | 'guide' | 'authority' | 'hospitality' | 'medical'
  | 'education' | 'conference' | 'cruise' | 'gastro' | 'park'
  | 'sacred' | 'transport' | 'ngo' | 'agency' | 'personal'

interface OnboardingGateProps {
  children: ReactNode
}

export default function OnboardingGate({ children }: OnboardingGateProps) {
  const { user } = useAuth()
  const [showWizard, setShowWizard] = useState(false)
  const [segment, setSegment] = useState<Segment>('personal')
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!user) {
      setChecked(true)
      return
    }

    async function checkOnboarding() {
      // Prüfen ob Onboarding bereits abgeschlossen
      const { data } = await supabase
        .from('fw_uar_identities')
        .select('onboarding_completed, segment')
        .eq('user_id', user!.id)
        .maybeSingle()

      if (data && !data.onboarding_completed) {
        // Segment aus User-Metadaten oder UAR ermitteln
        const userSegment = (user!.user_metadata?.segment as Segment) ||
          (data.segment as Segment) ||
          'personal'
        setSegment(userSegment)
        setShowWizard(true)
      }
      setChecked(true)
    }

    checkOnboarding()
  }, [user])

  function handleComplete() {
    setShowWizard(false)
  }

  // Noch nicht geprüft – nichts anzeigen um Flackern zu vermeiden
  if (!checked) return null

  return (
    <>
      {showWizard && user && (
        <OnboardingWizard
          segment={segment}
          userId={user.id}
          onComplete={handleComplete}
        />
      )}
      {children}
    </>
  )
}
