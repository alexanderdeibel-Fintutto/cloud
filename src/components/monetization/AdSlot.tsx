import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Crown, ArrowRight } from 'lucide-react'

interface AdSlotProps {
  placement: 'hub' | 'result' | 'sidebar'
}

export default function AdSlot({ placement }: AdSlotProps) {
  const { profile } = useAuth()

  // Zahlende Nutzer sehen keine Werbung
  if (profile?.tier === 'premium' || profile?.tier === 'basic') {
    return null
  }

  // Für den Moment: Eigenwerbung / Upgrade-Banner statt externer Werbung
  // Wird später durch Google AdSense oder direkte Partner-Banner ersetzt
  if (placement === 'hub') {
    return (
      <Card className="border-dashed border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 flex-shrink-0">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900">
                Werbefrei & unbegrenzt nutzen
              </h3>
              <p className="text-sm text-purple-700 mt-1">
                Alle 28+ Tools ohne Werbung, mit PDF-Export und Speicher-Funktion.
                Ab nur 0,99 EUR/Monat.
              </p>
            </div>
            <Button variant="fintutto" asChild className="flex-shrink-0">
              <Link to="/preise">
                Upgrade <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (placement === 'result') {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-4 text-center">
        <p className="text-xs text-gray-400 mb-2">Anzeige</p>
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-4 w-4 text-purple-500" />
          <span className="text-sm text-gray-600">
            <Link to="/preise" className="text-purple-600 font-medium hover:underline">
              Werbefrei upgraden
            </Link>
            {' '}ab 0,99 EUR/Monat
          </span>
        </div>
      </div>
    )
  }

  // sidebar
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/30 p-3 text-center">
      <p className="text-[10px] text-gray-400 mb-1">Anzeige</p>
      <p className="text-xs text-gray-500">
        <Link to="/preise" className="text-purple-600 hover:underline">Premium</Link> = Werbefrei
      </p>
    </div>
  )
}
