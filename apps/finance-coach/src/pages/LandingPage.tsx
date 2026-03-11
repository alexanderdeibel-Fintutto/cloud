import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Wallet,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Brain,
  Shield,
  Check,
  ArrowRight,
  Target,
  LineChart,
  BellRing,
} from "lucide-react";

const FEATURES = [
  {
    icon: Wallet,
    title: "Budget-Planung",
    description:
      "Erstelle und verwalte Budget-Kategorien mit Echtzeit-Tracking. Behalte den Ueberblick ueber jede Ausgabe.",
  },
  {
    icon: Target,
    title: "Sparziele",
    description:
      "Setze dir Sparziele mit Deadline und tracke deinen Fortschritt visuell. Von Notgroschen bis Traumurlaub.",
  },
  {
    icon: Brain,
    title: "KI-Insights",
    description:
      "Personalisierte KI-Analysen erkennen Sparpotenziale, warnen vor Ueberausgaben und optimieren dein Budget.",
  },
  {
    icon: LineChart,
    title: "Cashflow-Prognose",
    description:
      "Schau in die Zukunft: KI-gestuetzte Prognosen zeigen dir, wie sich dein Kontostand entwickeln wird.",
  },
  {
    icon: BellRing,
    title: "Smart Alerts",
    description:
      "Automatische Benachrichtigungen bei ungewoehnlichen Ausgaben, Budget-Ueberschreitungen und Spar-Chancen.",
  },
  {
    icon: Shield,
    title: "Datenschutz First",
    description:
      "Deine Finanzdaten sind bei uns sicher. Verschluesselte Speicherung und strenge DSGVO-Konformitaet.",
  },
];

const STATS = [
  { value: "Smart", label: "KI-Budgetanalyse" },
  { value: "24/7", label: "Finanz-Ueberblick" },
  { value: "100%", label: "DSGVO-konform" },
  { value: "Echtzeit", label: "Spar-Insights" },
];

const PLANS = [
  {
    name: "Free",
    price: "0",
    period: "fuer immer",
    features: [
      "Kontostand-Dashboard",
      "3 Budget-Kategorien",
      "1 Sparziel",
      "3 Basis-Insights/Monat",
    ],
    highlight: false,
  },
  {
    name: "Premium",
    price: "4,99",
    period: "/Monat",
    features: [
      "Alles aus Free",
      "Unbegrenzte Budget-Kategorien",
      "Unbegrenzte Sparziele",
      "Multi-Bank-Anbindung",
      "KI-Insights (unbegrenzt)",
      "Cashflow-Prognose",
      "30 KI-Nachrichten/Monat",
    ],
    highlight: true,
    badge: "Beliebt",
  },
  {
    name: "AI Forecast",
    price: "+2,99",
    period: "/Monat Add-on",
    features: [
      "Alles aus Premium",
      "KI-Cashflow-Prognose",
      "Steuer-Spar-Analyse",
      "Investment-Empfehlungen",
      "Persoenlicher KI-Coach",
      "Unbegrenzt KI-Nachrichten",
    ],
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container flex items-center justify-between h-16 max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg">Finance Coach</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#preise" className="hover:text-foreground transition-colors">Preise</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Einloggen</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Kostenlos starten</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container max-w-6xl py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Fintutto Oekosystem</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
          Dein KI-Finanzcoach.
          <br />
          <span className="text-primary">Immer an deiner Seite.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Budgetplanung, Sparziele und personalisierte KI-Insights - fuer bessere
          Finanzentscheidungen, jeden Tag.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">
              Kostenlos starten <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#features">Features entdecken</a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Keine Kreditkarte erforderlich - sofort loslegen
        </p>
      </section>

      {/* Stats */}
      <section className="container max-w-4xl py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container max-w-6xl py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Alles fuer deine Finanzen
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Intelligente Tools und KI-Power fuer deine finanzielle Freiheit.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container max-w-4xl py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            So funktioniert's
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Registrieren", desc: "Erstelle kostenlos ein Konto und richte dein Dashboard ein." },
            { step: "2", title: "Budget einrichten", desc: "Lege Kategorien und Sparziele fest. Die KI hilft dir dabei." },
            { step: "3", title: "Insights erhalten", desc: "Erhalte personalisierte Empfehlungen und optimiere deine Finanzen." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-black">
                {item.step}
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="preise" className="container max-w-5xl py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Transparente Preise
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Starte kostenlos und upgrade wenn du mehr willst.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={plan.highlight ? "border-primary/50 relative" : ""}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}
              <CardContent className="p-7">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{plan.price}{"\u20ac"}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full" variant={plan.highlight ? "default" : "outline"} asChild>
                  <Link to="/register">{plan.highlight ? "Premium starten" : "Kostenlos starten"}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-4xl py-20">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-10 text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              Bereit fuer bessere Finanzen?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Starte jetzt kostenlos und lass die KI deine Finanzen optimieren.
            </p>
            <Button size="lg" asChild>
              <Link to="/register">Jetzt kostenlos starten <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-bold">Finance Coach</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ein Produkt der Fintutto UG (haftungsbeschraenkt) i.G.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Produkt</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><a href="#features" className="hover:text-foreground transition-colors">Features</a></div>
                <div><a href="#preise" className="hover:text-foreground transition-colors">Preise</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Rechtliches</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><Link to="/impressum" className="hover:text-foreground transition-colors">Impressum</Link></div>
                <div><Link to="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link></div>
                <div><Link to="/agb" className="hover:text-foreground transition-colors">AGB</Link></div>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 mt-8 pt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Fintutto UG (haftungsbeschraenkt) i.G. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
