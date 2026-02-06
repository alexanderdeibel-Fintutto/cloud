import { Link } from 'react-router-dom'
import {
  Shield,
  MessageCircle,
  FileText,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Clock,
  Star,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { COMMON_PROBLEMS } from '@/lib/sgb-knowledge'
import { PLANS } from '@/lib/credits'

const features = [
  {
    icon: MessageCircle,
    title: 'KI-Rechtsberater',
    description: 'Stelle deine Frage - unsere KI kennt SGB II, III und XII besser als die meisten Sachbearbeiter.',
    href: '/chat',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: FileText,
    title: 'Musterschreiben',
    description: '14+ Vorlagen fuer Widersprueche, Antraege und Beschwerden. KI-generiert und sofort einsatzbereit.',
    href: '/musterschreiben',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Community-Forum',
    description: 'Tausche dich mit anderen Betroffenen aus. Erfahrungen teilen, Tipps geben und bekommen.',
    href: '/forum',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
]

const stats = [
  { value: '14+', label: 'Musterschreiben' },
  { value: '5', label: 'SGB-Bereiche' },
  { value: '24/7', label: 'KI verfuegbar' },
  { value: '0 EUR', label: 'Einstieg' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-amt opacity-5" />
        <div className="container py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="sgb2" className="mb-4 text-sm px-4 py-1">
              Fuer Buergergeld- & ALG-Empfaenger
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Deine Rechte beim{' '}
              <span className="gradient-text-amt">Jobcenter</span>
              <br />
              kennen & durchsetzen
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              KI-gestuetzte Hilfe bei Problemen mit dem Amt. Widersprueche generieren,
              Bescheide pruefen, Rechte verstehen - einfach und verstaendlich.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="amt" asChild>
                <Link to="/chat">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Kostenlos Frage stellen
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/musterschreiben">
                  <FileText className="mr-2 h-5 w-5" />
                  Musterschreiben ansehen
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              1 kostenlose Frage pro Tag &middot; Kein Account noetig
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold gradient-text-amt">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">So hilft dir Amtshilfe24</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Drei leistungsstarke Tools, die dir helfen, dich gegen falsche Bescheide
            und unberechtigte Kuerzungen zu wehren.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.href}>
              <Card className="h-full hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                  <div className="mt-4 flex items-center text-primary font-medium text-sm">
                    Jetzt nutzen
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Common Problems */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Welches Problem hast du?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Waehle dein Problem und wir zeigen dir sofort die passenden Musterschreiben und Tipps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMON_PROBLEMS.map((problem) => (
              <Link key={problem.id} to={`/musterschreiben?problem=${problem.id}`}>
                <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <Badge variant={problem.category as 'sgb2' | 'sgb3' | 'sgb12' | 'kdu'} className="mb-3">
                      {problem.category === 'sgb2' ? 'SGB II' :
                       problem.category === 'sgb3' ? 'SGB III' :
                       problem.category === 'kdu' ? 'KdU' :
                       problem.category === 'sgb10' ? 'Verwaltung' :
                       'SGB XII'}
                    </Badge>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {problem.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{problem.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">So einfach geht's</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: '1',
              icon: Zap,
              title: 'Problem beschreiben',
              description: 'Sage uns in einfachen Worten, was passiert ist. Die KI versteht dich.',
            },
            {
              step: '2',
              icon: CheckCircle2,
              title: 'Rechte erfahren',
              description: 'Du erhaeltst sofort eine klare Einschaetzung deiner Rechte mit Paragraphen.',
            },
            {
              step: '3',
              icon: FileText,
              title: 'Schreiben generieren',
              description: 'Wir erstellen dir ein fertiges Widerspruchsschreiben zum Abschicken.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-amt text-white text-xl font-bold mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Faire Preise</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Starte kostenlos. Upgrade wenn du mehr brauchst.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {(Object.entries(PLANS) as [string, typeof PLANS.free][]).map(([key, plan]) => (
              <Card
                key={key}
                className={
                  key === 'premium' ? 'tier-premium' :
                  key === 'plus' ? 'tier-plus' : 'tier-free'
                }
              >
                <CardContent className="p-6">
                  {key === 'premium' && (
                    <Badge variant="secondary" className="mb-3 bg-orange-100 text-orange-800">Beliebt</Badge>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-extrabold">
                      {plan.price === 0 ? 'Gratis' : `${plan.price.toFixed(2).replace('.', ',')} EUR`}
                    </span>
                    {plan.price > 0 && <span className="text-muted-foreground text-sm">/Monat</span>}
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        {plan.chatQuestionsPerDay === -1
                          ? 'Unbegrenzte KI-Fragen'
                          : `${plan.chatQuestionsPerDay} KI-Frage${plan.chatQuestionsPerDay > 1 ? 'n' : ''}/Tag`}
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        {plan.lettersPerMonth === -1
                          ? 'Unbegrenzte Schreiben'
                          : plan.lettersPerMonth === 0
                          ? 'Schreiben ansehen'
                          : `${plan.lettersPerMonth} Schreiben/Monat`}
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        {plan.forumAccess === 'read'
                          ? 'Forum lesen'
                          : plan.forumAccess === 'read_write'
                          ? 'Forum lesen & schreiben'
                          : 'Forum + Priority-Support'}
                      </span>
                    </li>
                    {plan.includedLetters > 0 && (
                      <li className="flex items-start gap-2 text-sm">
                        <Star className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>{plan.includedLetters} Versandfertige Briefe inklusive</span>
                      </li>
                    )}
                  </ul>
                  <Button
                    className="w-full"
                    variant={key === 'premium' ? 'amt' : key === 'plus' ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={key === 'free' ? '/chat' : '/preise'}>
                      {key === 'free' ? 'Jetzt starten' : 'Upgrade'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Integration */}
      <section className="container py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Teil des Fintutto-Oekosystems</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Probleme mit der Miete? Unser Mieter-Checker hilft weiter.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                KdU-Probleme?
                <Badge variant="kdu">KdU</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Das Amt zahlt nicht die volle Miete? Der Mieter-Checker prueft, ob deine Miete
                angemessen ist - und erstellt dir den passenden Widerspruch.
              </p>
              <a
                href="https://mieter.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Zum Mieter-Checker
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Vermieter-Bescheinigung?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Brauchst du eine Wohnungsgeberbescheinigung oder andere Vermieter-Dokumente?
                Das Vermieter-Portal hat alle Formulare.
              </p>
              <a
                href="https://vermieter.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Zum Vermieter-Portal
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-amt text-white py-16">
        <div className="container text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Widerspruchsfrist laeuft?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Du hast nur 1 Monat Zeit fuer einen Widerspruch. Starte jetzt - unsere KI
            hilft dir in Minuten, nicht Wochen.
          </p>
          <Button size="xl" className="bg-white text-emerald-800 hover:bg-white/90" asChild>
            <Link to="/chat">
              <MessageCircle className="mr-2 h-5 w-5" />
              Jetzt kostenlos Frage stellen
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
