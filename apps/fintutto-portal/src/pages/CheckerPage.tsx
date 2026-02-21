import { Link } from 'react-router-dom'
import { Shield, ArrowRight, Scale, AlertTriangle, Wrench, Home, Euro, FileWarning, Ban, HardHat, Paintbrush, BookOpen } from 'lucide-react'
import { useDocumentTitle, useMetaTags, useRecentTools, Breadcrumbs, RecentToolsWidget } from '@fintutto/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const checkers = [
  {
    title: 'Mietpreisbremse',
    description: 'Ist deine Miete zu hoch? Prüfe ob die Mietpreisbremse greift und wie viel du sparen kannst.',
    icon: Euro,
    href: '/checker/mietpreisbremse',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    features: ['Mietpreisbremse §556d BGB', 'Ortsvergleich', 'Sparpotential berechnen'],
  },
  {
    title: 'Mieterhöhung',
    description: 'Ist die angekündigte Mieterhöhung rechtmäßig? Prüfe Fristen und Grenzen.',
    icon: Scale,
    href: '/checker/mieterhoehung',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: ['Kappungsgrenze prüfen', '§558 BGB', 'Widerspruchshilfe'],
  },
  {
    title: 'Nebenkosten',
    description: 'Stimmt deine Nebenkostenabrechnung? Finde mögliche Fehler und Ungereimtheiten.',
    icon: FileWarning,
    href: '/checker/nebenkosten',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    features: ['17 Kostenarten', 'Fristenprüfung', 'Umlagefähigkeit'],
  },
  {
    title: 'Betriebskosten',
    description: 'Prüfe deine Betriebskostenabrechnung auf formelle und inhaltliche Fehler.',
    icon: AlertTriangle,
    href: '/checker/betriebskosten',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    features: ['Formelle Prüfung', 'Inhaltliche Prüfung', 'Abrechnungsfrist'],
  },
  {
    title: 'Kündigung',
    description: 'Wurde dir gekündigt? Prüfe ob die Kündigung wirksam ist.',
    icon: Ban,
    href: '/checker/kuendigung',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    features: ['§573 BGB', 'Formvorschriften', 'Kündigungsfristen'],
  },
  {
    title: 'Kaution',
    description: 'Probleme mit der Kaution? Prüfe Rückzahlungsanspruch und Fristen.',
    icon: Euro,
    href: '/checker/kaution',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: ['§551 BGB', 'Verzinsung', 'Rückzahlungsfrist'],
  },
  {
    title: 'Mietminderung',
    description: 'Mängel in der Wohnung? Prüfe ob und wie viel du mindern darfst.',
    icon: Wrench,
    href: '/checker/mietminderung',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    features: ['§536 BGB', 'Minderungsquoten', 'Mangelanzeige'],
  },
  {
    title: 'Eigenbedarf',
    description: 'Eigenbedarfskündigung erhalten? Prüfe ob sie rechtmäßig ist.',
    icon: Home,
    href: '/checker/eigenbedarf',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    features: ['§573 Abs. 2 BGB', 'Begründungsprüfung', 'Härtefallprüfung'],
  },
  {
    title: 'Modernisierung',
    description: 'Modernisierungsmaßnahmen angekündigt? Prüfe deine Rechte.',
    icon: HardHat,
    href: '/checker/modernisierung',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    features: ['§559 BGB', 'Duldungspflicht', 'Mieterhöhung prüfen'],
  },
  {
    title: 'Schönheitsreparaturen',
    description: 'Musst du beim Auszug renovieren? Prüfe ob die Klausel wirksam ist.',
    icon: Paintbrush,
    href: '/checker/schoenheitsreparaturen',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    features: ['Klauselprüfung', 'BGH-Rechtsprechung', 'Fristenplan'],
  },
]

export default function CheckerPage() {
  useDocumentTitle('Mietrechts-Checker', 'Fintutto Portal')
  const { recentTools } = useRecentTools('portal')
  useMetaTags({
    title: 'Checker fuer Mieter – Fintutto Portal',
    description: '10 kostenlose Mietrechts-Checker: Mietpreisbremse, Mieterhoehung, Nebenkosten, Kuendigung und mehr.',
    path: '/checker',
  })
  return (
    <div>
      <section className="gradient-mieter py-16">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Startseite', href: '/' },
              { label: 'Checker' },
            ]}
            className="mb-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span[aria-current]]:text-white [&_span[aria-hidden]]:text-white/30"
          />
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Checker für Mieter
            </h1>
            <p className="text-lg text-white/80">
              Kenne deine Rechte. Prüfe Mieterhöhung, Kündigung, Nebenkosten und mehr –
              basierend auf aktuellem deutschem Mietrecht.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <RecentToolsWidget
            tools={recentTools}
            pathPrefix="/checker"
            renderLink={({ href, children }) => <Link key={href} to={href}>{children}</Link>}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Verfügbare Checker">
            {checkers.map((item) => (
              <Link key={item.title} to={item.href} aria-label={`${item.title} – ${item.description}`} role="listitem">
                <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all group">
                  <CardHeader>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.bgColor} mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`h-7 w-7 ${item.color}`} />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-base">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {item.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Jetzt prüfen <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
