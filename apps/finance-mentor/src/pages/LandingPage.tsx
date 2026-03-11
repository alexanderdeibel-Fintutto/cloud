import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  Shield,
  Users,
  Check,
  ArrowRight,
  Brain,
  PiggyBank,
  BarChart3,
  Target,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Strukturierte Kurse",
    description:
      "Von Grundlagen bis Expertenwissen - lerne Finanzen Schritt fuer Schritt mit didaktisch aufbereiteten Kursen.",
  },
  {
    icon: Brain,
    title: "KI-Tutor",
    description:
      "Dein persoenlicher KI-Tutor beantwortet Fragen zu den Kursinhalten und hilft dir, komplexe Themen zu verstehen.",
  },
  {
    icon: Award,
    title: "Zertifikate",
    description:
      "Erhalte anerkannte Zertifikate nach erfolgreichem Kursabschluss - fuer deinen Lebenslauf und deine Motivation.",
  },
  {
    icon: TrendingUp,
    title: "Praxisnahes Wissen",
    description:
      "Budgetierung, Investieren, Steuern, Vorsorge - alles was du fuer deine finanzielle Zukunft brauchst.",
  },
  {
    icon: Target,
    title: "Lernfortschritt",
    description:
      "Verfolge deinen Fortschritt mit detaillierten Statistiken und setze dir persoenliche Lernziele.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Tausche dich mit anderen Lernenden aus und profitiere von einer engagierten Finanz-Community.",
  },
];

const COURSES = [
  { title: "Budgetierung Basics", level: "Einsteiger", icon: PiggyBank },
  { title: "Schuldenmanagement", level: "Einsteiger", icon: Shield },
  { title: "Investieren lernen", level: "Fortgeschritten", icon: BarChart3 },
  { title: "Steuern & Vorsorge", level: "Fortgeschritten", icon: TrendingUp },
];

const PLANS = [
  {
    name: "Free",
    price: "0",
    period: "fuer immer",
    features: [
      "2 kostenlose Grundlagen-Kurse",
      "Erste Lektionen aller Kurse",
      "Lern-Dashboard",
      "Community-Zugang",
    ],
    highlight: false,
  },
  {
    name: "Premium",
    price: "4,99",
    period: "/Monat",
    features: [
      "Alle Kurse freigeschaltet",
      "Zertifikate nach Abschluss",
      "KI-Tutor fuer Fragen",
      "Offline-Modus",
      "20 KI-Nachrichten/Monat",
      "Bevorzugter Support",
    ],
    highlight: true,
    badge: "Beliebt",
  },
  {
    name: "Kursbundle",
    price: "29,99",
    period: "einmalig",
    features: [
      "Alle Kurse dauerhaft freigeschaltet",
      "Alle Zertifikate",
      "Lebenslanger Zugang",
      "Zukuenftige Kurse inklusive",
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
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg">Finance Mentor</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#kurse" className="hover:text-foreground transition-colors">Kurse</a>
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
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Fintutto Oekosystem</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
          Finanzwissen aufbauen.
          <br />
          <span className="text-primary">Zukunft sichern.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Lerne alles ueber Budgetierung, Investieren, Steuern und Vorsorge - mit
          strukturierten Kursen, KI-Tutor und anerkannten Zertifikaten.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">
              Kostenlos starten <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#kurse">Kurse entdecken</a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Keine Kreditkarte erforderlich - 2 Kurse kostenlos
        </p>
      </section>

      {/* Features */}
      <section id="features" className="container max-w-6xl py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Warum Finance Mentor?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Alles was du brauchst, um finanziell durchzustarten.
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

      {/* Courses Preview */}
      <section id="kurse" className="container max-w-6xl py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Beliebte Kurse
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Starte mit einem unserer meistbesuchten Kurse.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COURSES.map((course) => (
            <Card key={course.title} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <course.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{course.title}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {course.level}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/register">Alle Kurse ansehen <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Pricing */}
      <section id="preise" className="container max-w-5xl py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Einfache Preise
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Starte kostenlos und upgrade wenn du bereit bist.
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
            <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              Bereit, dein Finanzwissen aufzubauen?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Starte jetzt kostenlos und lerne alles, was du fuer eine sichere finanzielle Zukunft brauchst.
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
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-bold">Finance Mentor</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ein Produkt der Fintutto UG (haftungsbeschraenkt) i.G.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Produkt</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><a href="#features" className="hover:text-foreground transition-colors">Features</a></div>
                <div><a href="#kurse" className="hover:text-foreground transition-colors">Kurse</a></div>
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
