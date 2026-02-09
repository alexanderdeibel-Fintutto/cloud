import { Link } from 'react-router-dom'
import { Shield, ArrowRight, Scale, AlertTriangle, Wrench, Home, Euro, FileWarning, Ban, HardHat, Paintbrush, BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const checkers = [
  {
    title: 'Mietpreisbremse',
    description: 'Ist deine Miete zu hoch? Pr\u00fcfe ob die Mietpreisbremse greift und wie viel du sparen kannst.',
    icon: Euro,
    href: '/checker/mietpreisbremse',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    features: ['Mietpreisbremse \u00a7556d BGB', 'Ortsvergleich', 'Sparpotential berechnen'],
  },
  {
    title: 'Mieterh\u00f6hung',
    description: 'Ist die angek\u00fcndigte Mieterh\u00f6hung rechtm\u00e4\u00dfig? Pr\u00fcfe Fristen und Grenzen.',
    icon: Scale,
    href: '/checker/mieterhoehung',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: ['Kappungsgrenze pr\u00fcfen', '\u00a7558 BGB', 'Widerspruchshilfe'],
  },
  {
    title: 'Nebenkosten',
    description: 'Stimmt deine Nebenkostenabrechnung? Finde m\u00f6gliche Fehler und Ungereimtheiten.',
    icon: FileWarning,
    href: '/checker/nebenkosten',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    features: ['17 Kostenarten', 'Fristenpr\u00fcfung', 'Umlagef\u00e4higkeit'],
  },
  {
    title: 'Betriebskosten',
    description: 'Pr\u00fcfe deine Betriebskostenabrechnung auf formelle und inhaltliche Fehler.',
    icon: AlertTriangle,
    href: '/checker/betriebskosten',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    features: ['Formelle Pr\u00fcfung', 'Inhaltliche Pr\u00fcfung', 'Abrechnungsfrist'],
  },
  {
    title: 'K\u00fcndigung',
    description: 'Wurde dir gek\u00fcndigt? Pr\u00fcfe ob die K\u00fcndigung wirksam ist.',
    icon: Ban,
    href: '/checker/kuendigung',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    features: ['\u00a7573 BGB', 'Formvorschriften', 'K\u00fcndigungsfristen'],
  },
  {
    title: 'Kaution',
    description: 'Probleme mit der Kaution? Pr\u00fcfe R\u00fcckzahlungsanspruch und Fristen.',
    icon: Euro,
    href: '/checker/kaution',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: ['\u00a7551 BGB', 'Verzinsung', 'R\u00fcckzahlungsfrist'],
  },
  {
    title: 'Mietminderung',
    description: 'M\u00e4ngel in der Wohnung? Pr\u00fcfe ob und wie viel du mindern darfst.',
    icon: Wrench,
    href: '/checker/mietminderung',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    features: ['\u00a7536 BGB', 'Minderungsquoten', 'Mangelanzeige'],
  },
  {
    title: 'Eigenbedarf',
    description: 'Eigenbedarfsk\u00fcndigung erhalten? Pr\u00fcfe ob sie rechtm\u00e4\u00dfig ist.',
    icon: Home,
    href: '/checker/eigenbedarf',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    features: ['\u00a7573 Abs. 2 BGB', 'Begr\u00fcndungspr\u00fcfung', 'H\u00e4rtefallpr\u00fcfung'],
  },
  {
    title: 'Modernisierung',
    description: 'Modernisierungsma\u00dfnahmen angek\u00fcndigt? Pr\u00fcfe deine Rechte.',
    icon: HardHat,
    href: '/checker/modernisierung',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    features: ['\u00a7559 BGB', 'Duldungspflicht', 'Mieterh\u00f6hung pr\u00fcfen'],
  },
  {
    title: 'Sch\u00f6nheitsreparaturen',
    description: 'Musst du beim Auszug renovieren? Pr\u00fcfe ob die Klausel wirksam ist.',
    icon: Paintbrush,
    href: '/checker/schoenheitsreparaturen',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    features: ['Klauselpr\u00fcfung', 'BGH-Rechtsprechung', 'Fristenplan'],
  },
]

export default function CheckerPage() {
  return (
    <div>
      <section className="gradient-mieter py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Checker f\u00fcr Mieter
            </h1>
            <p className="text-lg text-white/80">
              Kenne deine Rechte. Pr\u00fcfe Mieterh\u00f6hung, K\u00fcndigung, Nebenkosten und mehr \u2013
              basierend auf aktuellem deutschem Mietrecht.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {checkers.map((item) => (
              <Link key={item.title} to={item.href}>
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
                      Jetzt pr\u00fcfen <ArrowRight className="h-4 w-4" />
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
