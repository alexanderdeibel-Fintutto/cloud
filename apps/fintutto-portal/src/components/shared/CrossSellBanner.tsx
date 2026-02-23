import { ExternalLink, Zap, Building2, Shield, FileText, BarChart3, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AppPromo {
  name: string
  description: string
  icon: typeof Zap
  color: string
  url: string
  badge?: string
}

const APPS: AppPromo[] = [
  {
    name: 'Vermietify',
    description: 'Professionelle Immobilienverwaltung mit Steuer, AfA und mehr',
    icon: Building2,
    color: 'bg-purple-100 text-purple-700',
    url: '/apps',
    badge: 'Beliebt',
  },
  {
    name: 'Ablesung',
    description: 'Zählerablesung mit OCR & Energieanalyse',
    icon: Zap,
    color: 'bg-green-100 text-green-700',
    url: '/apps',
  },
  {
    name: 'BescheidBoxer',
    description: 'Steuer- und Bescheid-Dokumenten-Tool',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700',
    url: '/apps',
  },
  {
    name: 'HausmeisterPro',
    description: 'Facility Management & Hausmeister-Tool',
    icon: Shield,
    color: 'bg-orange-100 text-orange-700',
    url: '/apps',
  },
]

interface CrossSellBannerProps {
  currentApp?: string
  context?: 'rechner' | 'checker' | 'formular' | 'general'
  maxItems?: number
}

export default function CrossSellBanner({ currentApp, context, maxItems = 2 }: CrossSellBannerProps) {
  // Filter out current app and select relevant ones
  let relevantApps = APPS.filter((app) => app.name !== currentApp)

  // Context-based sorting
  if (context === 'rechner' || context === 'formular') {
    // Vermieter tools -> suggest Vermietify first
    relevantApps.sort((a, b) => (a.name === 'Vermietify' ? -1 : b.name === 'Vermietify' ? 1 : 0))
  } else if (context === 'checker') {
    // Mieter tools -> suggest BescheidBoxer
    relevantApps.sort((a, b) => (a.name === 'BescheidBoxer' ? -1 : b.name === 'BescheidBoxer' ? 1 : 0))
  }

  const displayed = relevantApps.slice(0, maxItems)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Mehr von Fintutto
      </h3>
      <div className="grid gap-3">
        {displayed.map((app) => (
          <Card key={app.name} className="hover:shadow-md transition-shadow">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${app.color}`}>
                  <app.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{app.name}</h4>
                    {app.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
                        {app.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{app.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" asChild>
                  <a href={app.url}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
