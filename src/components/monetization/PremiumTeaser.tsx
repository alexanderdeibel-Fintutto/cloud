import { Lock, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface PremiumTeaserProps {
  feature: 'pdf' | 'save' | 'fullResult' | 'ai'
}

const messages: Record<PremiumTeaserProps['feature'], { title: string; description: string }> = {
  pdf: {
    title: 'PDF-Export freischalten',
    description: 'Laden Sie Ihre Ergebnisse als professionelles PDF herunter. Ab nur 0,99 EUR/Monat.',
  },
  save: {
    title: 'Ergebnisse speichern',
    description: 'Speichern Sie alle Ihre Checker-Ergebnisse und greifen Sie jederzeit darauf zu.',
  },
  fullResult: {
    title: 'Vollständige Analyse',
    description: 'Sehen Sie alle Details, rechtliche Einschätzungen und personalisierte Empfehlungen.',
  },
  ai: {
    title: 'KI-Assistent freischalten',
    description: 'Erhalten Sie personalisierte rechtliche Einschätzungen mit KI-Unterstützung.',
  },
}

export default function PremiumTeaser({ feature }: PremiumTeaserProps) {
  const { profile } = useAuth()

  // Premium-User sehen keinen Teaser
  if (profile?.tier === 'premium') return null

  const msg = messages[feature]

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 flex-shrink-0">
            <Lock className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-purple-900">{msg.title}</h4>
            <p className="text-xs text-purple-700 mt-0.5">{msg.description}</p>
          </div>
          <Button size="sm" variant="fintutto" asChild className="flex-shrink-0">
            <Link to="/preise">
              Upgrade <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
