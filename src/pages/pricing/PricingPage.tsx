import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Check,
  Leaf,
  Crown,
  Gift,
  ShoppingCart,
  ExternalLink,
  Sparkles,
  Shield,
  Cloud,
  Brain,
  Users,
  Zap,
} from 'lucide-react';
import { FINTUTTO_APPS, buildCrossMarketingLink } from '@/lib/referral';

const freeFeatures = [
  'Unbegrenzt Pflanzen verwalten',
  'Wohnungen & Raeume anlegen',
  'Giess- & Duenge-Erinnerungen',
  'Pflanzen-Scanner & Erkennung',
  'Pflanzenkatalog mit 55+ Arten',
  'Pflegeprotokoll-Generator',
  'Urlaubsplan mit Helfer-Funktion',
  'Einkaufsliste mit Partner-Shops',
  'Kalenderansicht',
  'Daten-Export & -Import',
  'Dark Mode',
];

const premiumFeatures = [
  { label: 'Cloud-Sync ueber alle Geraete', icon: Cloud },
  { label: 'KI-gestuetzte Pflanzenerkennung', icon: Brain },
  { label: 'Automatische Pflegetipps per Push', icon: Zap },
  { label: 'Familien-/WG-Sharing', icon: Users },
  { label: 'Erweiterte Statistiken & Trends', icon: Sparkles },
  { label: 'Prioritaets-Support', icon: Shield },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mb-4">
          <Leaf className="h-3 w-3 mr-1" />
          100% kostenlos
        </Badge>
        <h1 className="text-3xl font-bold">
          Pflanzen-Manager ist <span className="text-green-600 dark:text-green-400">kostenlos</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Alle Kernfunktionen stehen dir gratis zur Verfuegung. Fuer immer.
          Wir finanzieren uns ueber Partner-Shops und das Fintutto-Oekosystem.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className="border-green-200 dark:border-green-800 relative">
          <div className="absolute -top-3 left-4">
            <Badge className="bg-green-600 text-white">Aktuell aktiv</Badge>
          </div>
          <CardHeader className="pt-8">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                Free
              </span>
              <span className="text-3xl font-bold">0 EUR</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Fuer immer kostenlos</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {freeFeatures.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full mt-6 bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/')}
            >
              Jetzt starten
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan (Coming Soon) */}
        <Card className="border-amber-200 dark:border-amber-800 relative opacity-90">
          <div className="absolute -top-3 left-4">
            <Badge className="bg-amber-600 text-white">Bald verfuegbar</Badge>
          </div>
          <CardHeader className="pt-8">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-600" />
                Premium
              </span>
              <div className="text-right">
                <span className="text-3xl font-bold">2,99 EUR</span>
                <span className="text-sm text-muted-foreground">/Monat</span>
              </div>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Alles aus Free, plus:</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {premiumFeatures.map(feature => (
                <li key={feature.label} className="flex items-start gap-2 text-sm">
                  <feature.icon className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{feature.label}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-6 border-amber-300" disabled>
              <Crown className="h-4 w-4 mr-2" />
              Bald verfuegbar
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Erhalte {FINTUTTO_APPS.length > 0 ? '20%' : ''} Rabatt durch Empfehlungen
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* How we make money */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Wie finanziert sich das?</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-semibold text-sm">Partner-Shops</p>
              <p className="text-xs text-muted-foreground mt-1">
                Affiliate-Einnahmen durch Dehner, OBI, Hornbach, Amazon & mehr
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="font-semibold text-sm">Empfehlungen</p>
              <p className="text-xs text-muted-foreground mt-1">
                Referral-Programm fuer das gesamte Fintutto-Oekosystem
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="font-semibold text-sm">Premium (bald)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Optionales Abo fuer Cloud-Sync, KI-Scanner & Familien-Features
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Cross-marketing: Other Fintutto Apps */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-1 text-center">Mehr von Fintutto</h2>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Entdecke unsere anderen Apps - alle mit einem Konto nutzbar.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {FINTUTTO_APPS.filter(a => a.category === 'premium').map(app => (
            <a
              key={app.key}
              href={buildCrossMarketingLink(app.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow hover:border-primary/30 h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{app.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{app.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
