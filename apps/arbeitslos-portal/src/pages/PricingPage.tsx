import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Star,
  Shield,
  Zap,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANS, type PlanType } from '@/lib/credits'

const planFeatures: Record<PlanType, { icon: typeof Shield; features: string[]; highlight?: string }> = {
  free: {
    icon: Shield,
    features: [
      '1 KI-Frage pro Tag',
      'Alle Musterschreiben ansehen',
      'Forum lesen',
      'Basis-Rechtsinfos',
    ],
  },
  plus: {
    icon: Zap,
    highlight: 'Beliebteste Wahl',
    features: [
      '20 KI-Fragen pro Tag',
      '3 Musterschreiben/Monat generieren',
      'Forum lesen & schreiben',
      'KI-gestuetzte Schreiben',
      'Alle Rechtsgebiete (SGB II, III, X, XII)',
      'Weitere Schreiben: 1,99 EUR/Stueck',
    ],
  },
  premium: {
    icon: Star,
    features: [
      'Unbegrenzte KI-Fragen',
      'Unbegrenzte Musterschreiben',
      'Forum + Priority-Support',
      '3 versandfertige Briefe inklusive',
      'Alle Rechtsgebiete + KdU-Spezialtipps',
      'Weitere Briefe: nur 0,99 EUR/Stueck',
      'Mieter-Checker Premium inklusive',
    ],
  },
}

const faqItems = [
  {
    q: 'Was ist der Unterschied zwischen Musterschreiben ansehen und generieren?',
    a: 'Im kostenlosen Tarif kannst du alle Vorlagen einsehen und die Tipps lesen. Zum Generieren eines personalisierten Schreibens mit deinen Daten brauchst du den Plus-Tarif oder kaufst einzelne Schreiben.',
  },
  {
    q: 'Ist die KI-Beratung eine echte Rechtsberatung?',
    a: 'Nein, Amtshilfe24 bietet KI-gestuetzte Informationen basierend auf den Sozialgesetzbüchern. Es ersetzt keine anwaltliche Beratung. Bei komplexen Faellen empfehlen wir eine Beratung beim Sozialverband (VdK, SoVD).',
  },
  {
    q: 'Kann ich jederzeit kuendigen?',
    a: 'Ja, du kannst dein Abo monatlich kuendigen. Es laeuft dann bis zum Ende des bezahlten Zeitraums weiter.',
  },
  {
    q: 'Was kostet der Versand eines Briefs?',
    a: 'Im Premium-Tarif sind 3 versandfertige Briefe pro Monat inklusive. Danach kostet der Versand nur 0,99 EUR. Im Plus-Tarif kosten versandfertige Briefe 1,99 EUR pro Stueck.',
  },
  {
    q: 'Funktioniert das auch fuer ALG I (SGB III)?',
    a: 'Ja! Unser KI-Berater kennt SGB II (Buergergeld), SGB III (ALG I), SGB XII (Sozialhilfe) und SGB X (Verwaltungsrecht). Die Musterschreiben decken die haeufigsten Probleme ab.',
  },
  {
    q: 'Wie verbindet sich das mit dem Mieter-Checker?',
    a: 'Bei Problemen mit den Kosten der Unterkunft (KdU) verlinken wir direkt auf den Fintutto Mieter-Checker, der prueft ob deine Miete angemessen ist. Im Premium-Tarif ist der Mieter-Checker inklusive.',
  },
]

export default function PricingPage() {
  return (
    <div className="container py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Faire Preise fuer deine Rechte
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Starte kostenlos und upgrade wenn du mehr brauchst. Keine versteckten Kosten.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
        {(Object.entries(PLANS) as [PlanType, typeof PLANS.free][]).map(([key, plan]) => {
          const meta = planFeatures[key]
          return (
            <Card
              key={key}
              className={`relative ${
                key === 'premium' ? 'tier-premium' :
                key === 'plus' ? 'tier-plus' : 'tier-free'
              }`}
            >
              {meta.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary" className="bg-orange-500 text-white border-0 px-4">
                    {meta.highlight}
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-amt text-white mx-auto mb-3">
                  <meta.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold">
                    {plan.price === 0 ? '0' : plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.price === 0 ? ' EUR' : ' EUR/Monat'}
                  </span>
                </div>
                {plan.priceYearly > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    oder {plan.priceYearly.toFixed(2).replace('.', ',')} EUR/Jahr (spare {Math.round((1 - plan.priceYearly / (plan.price * 12)) * 100)}%)
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-6">
                  {meta.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={key === 'premium' ? 'amt' : key === 'plus' ? 'default' : 'outline'}
                  size="lg"
                  asChild
                >
                  <Link to={key === 'free' ? '/chat' : '/register'}>
                    {key === 'free' ? 'Kostenlos starten' : `${plan.name} waehlen`}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Alles auf einen Blick</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Feature</th>
                <th className="text-center py-3 px-4 font-medium">Kostenlos</th>
                <th className="text-center py-3 px-4 font-medium text-primary">Plus</th>
                <th className="text-center py-3 px-4 font-medium text-secondary">Premium</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['KI-Fragen', '1/Tag', '20/Tag', 'Unbegrenzt'],
                ['Musterschreiben ansehen', 'Ja', 'Ja', 'Ja'],
                ['Schreiben generieren', 'Einzelkauf', '3/Monat', 'Unbegrenzt'],
                ['Forum lesen', 'Ja', 'Ja', 'Ja'],
                ['Forum schreiben', '-', 'Ja', 'Ja'],
                ['KI-gestuetzte Schreiben', '-', 'Ja', 'Ja'],
                ['Versandfertige Briefe', '-', '1,99 EUR', '3 inkl.'],
                ['Priority-Support', '-', '-', 'Ja'],
                ['Mieter-Checker', '-', '-', 'Inklusive'],
              ].map(([feature, free, plus, premium]) => (
                <tr key={feature} className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium">{feature}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">{free}</td>
                  <td className="py-3 px-4 text-center">{plus}</td>
                  <td className="py-3 px-4 text-center font-medium">{premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Haeufige Fragen</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <Card key={item.q}>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2 flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  {item.q}
                </h3>
                <p className="text-sm text-muted-foreground ml-6">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
