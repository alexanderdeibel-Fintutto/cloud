import { useState } from 'react'
import {
  ExternalLink, ArrowRight, CheckCircle2, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FINTUTTO_APPS, APP_CATEGORIES, type AppCategory } from '@fintutto/shared'
import { useMetaTags } from '@fintutto/shared'

const apps = Object.values(FINTUTTO_APPS).filter(app => app.slug !== 'vermieter-portal')

type FilterKey = 'alle' | AppCategory

export default function AppsPage() {
  useMetaTags({
    title: 'Fintutto Ökosystem – Alle Apps',
    description: 'Entdecke alle 15 Apps im Fintutto-Ökosystem: Immobilienverwaltung, Finanztools, Lifestyle-Apps und mehr.',
    path: '/apps',
    baseUrl: 'https://vermieter.fintutto.cloud',
  })

  const [filter, setFilter] = useState<FilterKey>('alle')

  const filteredApps = apps.filter((app) => {
    if (filter === 'alle') return true
    return app.category === filter
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,80,255,0.15),transparent_70%)]" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">
                15 Apps · 1 Ökosystem · Alles kostenlos starten
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Das Fintutto Ökosystem
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Von der Immobilienverwaltung bis zum Fitness-Coaching – für jeden
              Bereich die richtige App. Alle verbunden, ein Account.
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-6 border-b bg-muted/30 sticky top-16 z-40 backdrop-blur">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { key: 'alle' as FilterKey, label: 'Alle Apps', icon: '🌐' },
              ...Object.entries(APP_CATEGORIES).map(([key, label]) => ({
                key: key as FilterKey,
                label,
                icon: key === 'immobilien' ? '🏠' : key === 'finanzen' ? '🧮' : key === 'lifestyle' ? '🌱' : '🚀',
              })),
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border hover:bg-accent'
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* App Grid */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <Card key={app.slug} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-primary/30">
                <div className="p-5 flex items-start gap-4">
                  <span className="text-3xl">{app.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{app.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {app.description}
                    </p>
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                      {APP_CATEGORIES[app.category]}
                    </span>
                  </div>
                </div>
                <CardContent className="px-5 pb-5 pt-0">
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <a href={app.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      App öffnen
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
