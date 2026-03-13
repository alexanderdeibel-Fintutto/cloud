import { useState } from 'react'
import { Lightbulb, X } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { useBescheidContext } from '../contexts/BescheidContext'
import type { Bescheid } from '../types/bescheid'

interface Tipp {
  id: string
  title: string
  text: string
  priority: 'hoch' | 'mittel' | 'info'
}

function generateTipps(bescheide: Bescheid[]): Tipp[] {
  const tipps: Tipp[] = []

  // Check for unchecked Bescheide
  const neueBescheide = bescheide.filter(b => b.status === 'neu')
  if (neueBescheide.length > 0) {
    tipps.push({
      id: 'neue-bescheide',
      title: `${neueBescheide.length} ungepruefte Bescheid(e)`,
      text: 'Lassen Sie Ihre neuen Bescheide von der KI pruefen. Oft werden Abweichungen gefunden, die zu Erstattungen fuehren.',
      priority: 'hoch',
    })
  }

  // Check for high deviations
  const hoheAbweichungen = bescheide.filter(b => b.abweichungProzent != null && b.abweichungProzent > 5 && b.status !== 'einspruch' && b.status !== 'erledigt')
  if (hoheAbweichungen.length > 0) {
    tipps.push({
      id: 'hohe-abweichung',
      title: 'Hohe Abweichungen entdeckt',
      text: `Bei ${hoheAbweichungen.length} Bescheid(en) liegt die Abweichung ueber 5%. Ein Einspruch koennte sich lohnen.`,
      priority: 'hoch',
    })
  }

  // Check for missing Einspruch on checked Bescheide with deviations
  const geprueftMitAbweichung = bescheide.filter(b => b.status === 'geprueft' && b.abweichung != null && b.abweichung > 0)
  if (geprueftMitAbweichung.length > 0) {
    tipps.push({
      id: 'einspruch-moeglich',
      title: 'Einspruch empfohlen',
      text: `${geprueftMitAbweichung.length} gepruefte(r) Bescheid(e) mit Abweichungen. Erstellen Sie einen Einspruch bevor die Frist ablaeuft.`,
      priority: 'mittel',
    })
  }

  // General tips
  if (bescheide.length === 0) {
    tipps.push({
      id: 'erster-bescheid',
      title: 'Ersten Bescheid hochladen',
      text: 'Laden Sie Ihren Steuerbescheid als PDF oder Foto hoch. Die KI erkennt automatisch alle relevanten Daten.',
      priority: 'info',
    })
  }

  // Werbungskosten tip
  if (bescheide.some(b => b.typ === 'einkommensteuer')) {
    tipps.push({
      id: 'werbungskosten',
      title: 'Werbungskosten pruefen',
      text: 'Haben Sie alle Werbungskosten angegeben? Homeoffice-Pauschale, Fahrtkosten und Arbeitsmittel werden oft vergessen.',
      priority: 'info',
    })
  }

  // Frist tip
  if (bescheide.some(b => b.status !== 'erledigt')) {
    tipps.push({
      id: 'fristen-beachten',
      title: 'Fristen im Blick behalten',
      text: 'Die Einspruchsfrist betraegt einen Monat ab Zustellung. Der Steuer-Bescheidprüfer erinnert Sie automatisch.',
      priority: 'info',
    })
  }

  return tipps.slice(0, 3) // Show max 3 tips
}

const PRIORITY_STYLES = {
  hoch: 'border-l-4 border-l-destructive',
  mittel: 'border-l-4 border-l-warning',
  info: 'border-l-4 border-l-primary',
}

export default function SteuerTipps() {
  const { bescheide } = useBescheidContext()
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('bescheidboxer-dismissed-tipps')
      return new Set(stored ? JSON.parse(stored) : [])
    } catch {
      return new Set()
    }
  })

  const tipps = generateTipps(bescheide).filter(t => !dismissed.has(t.id))

  const dismiss = (id: string) => {
    const next = new Set(dismissed)
    next.add(id)
    setDismissed(next)
    localStorage.setItem('bescheidboxer-dismissed-tipps', JSON.stringify([...next]))
  }

  if (tipps.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold">Steuer-Tipps fuer Sie</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tipps.map(tipp => (
          <Card key={tipp.id} className={PRIORITY_STYLES[tipp.priority]}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{tipp.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tipp.text}</p>
                </div>
                <button
                  onClick={() => dismiss(tipp.id)}
                  className="shrink-0 rounded-md p-1 hover:bg-muted transition-colors"
                  aria-label="Tipp ausblenden"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
