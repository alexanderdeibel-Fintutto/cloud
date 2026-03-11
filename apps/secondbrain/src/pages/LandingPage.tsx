import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  FileText,
  Search,
  MessageSquare,
  Upload,
  FolderOpen,
  Star,
  Shield,
  Check,
  ArrowRight,
  ScanText,
  Sparkles,
  Lock,
} from "lucide-react";

const FEATURES = [
  {
    icon: Upload,
    title: "Dokument-Upload",
    description:
      "Lade PDFs, Bilder und Textdateien hoch - bis zu 10 Dateien gleichzeitig mit je 50 MB.",
  },
  {
    icon: ScanText,
    title: "OCR & KI-Analyse",
    description:
      "Automatische Texterkennung und intelligente Zusammenfassungen. Die KI kategorisiert und analysiert deine Dokumente.",
  },
  {
    icon: MessageSquare,
    title: "KI-Chat",
    description:
      "Stelle Fragen an deine Dokumente in natuerlicher Sprache. Die KI findet die relevanten Informationen.",
  },
  {
    icon: Search,
    title: "Volltextsuche",
    description:
      "Durchsuche alle Dokumente blitzschnell - inklusive OCR-erkannter Texte aus Bildern und Scans.",
  },
  {
    icon: FolderOpen,
    title: "Sammlungen",
    description:
      "Organisiere Dokumente in Kategorien: Miete, Finanzen, Versicherung, Arbeit, Gesundheit und mehr.",
  },
  {
    icon: Lock,
    title: "Sicher & Privat",
    description:
      "Verschluesselte Speicherung, DSGVO-konform. Deine Dokumente gehoeren nur dir.",
  },
];

const USE_CASES = [
  { title: "Mietvertraege", icon: FileText, desc: "Vertraege und Nebenkostenabrechnungen sicher verwalten." },
  { title: "Finanzdokumente", icon: Sparkles, desc: "Kontoauszuege, Steuerbescheide und Rechnungen im Griff." },
  { title: "Versicherungen", icon: Shield, desc: "Policen und Korrespondenz organisiert aufbewahren." },
  { title: "Favoriten", icon: Star, desc: "Wichtige Dokumente sofort griffbereit markieren." },
];

const PLANS = [
  {
    name: "Free",
    price: "0",
    period: "fuer immer",
    features: [
      "50 Dokumente",
      "500 MB Speicher",
      "OCR & KI-Zusammenfassungen",
      "3 Sammlungen",
      "Volltextsuche",
    ],
    highlight: false,
  },
  {
    name: "Premium",
    price: "4,99",
    period: "/Monat",
    features: [
      "Unbegrenzte Dokumente",
      "10 GB Speicher",
      "Erweiterte KI-Analyse",
      "Unbegrenzte Sammlungen",
      "KI-Chat (unbegrenzt)",
      "Prioritaets-OCR",
      "Export-Funktionen",
    ],
    highlight: true,
    badge: "Beliebt",
  },
  {
    name: "Business",
    price: "9,99",
    period: "/Monat",
    features: [
      "Alles aus Premium",
      "50 GB Speicher",
      "Team-Sammlungen",
      "API-Zugang",
      "Erweiterte Integrationen",
      "Prioritaets-Support",
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
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg">SecondBrain</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#anwendungen" className="hover:text-foreground transition-colors">Anwendungen</a>
            <a href="#preise" className="hover:text-foreground transition-colors">Preise</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Einloggen</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/registrieren">Kostenlos starten</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container max-w-6xl py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-6">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Fintutto Oekosystem</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
          Dein digitales Gedaechtnis.
          <br />
          <span className="text-primary">KI-gestuetzt.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Lade Dokumente hoch, lass sie von der KI analysieren und finde alles
          blitzschnell wieder - mit OCR, Volltextsuche und KI-Chat.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/registrieren">
              Kostenlos starten <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#features">Features entdecken</a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Keine Kreditkarte erforderlich - 50 Dokumente kostenlos
        </p>
      </section>

      {/* Features */}
      <section id="features" className="container max-w-6xl py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Intelligente Dokumentenverwaltung
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Alle deine Dokumente an einem Ort - mit KI-Power.
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

      {/* Use Cases */}
      <section id="anwendungen" className="container max-w-4xl py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Fuer alle deine Dokumente
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Egal ob Mietvertrag, Steuerbescheid oder Versicherungspolice.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {USE_CASES.map((item) => (
            <Card key={item.title} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container max-w-4xl py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            So einfach geht's
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Hochladen", desc: "Lade deine Dokumente hoch - PDFs, Bilder oder Textdateien." },
            { step: "2", title: "KI analysiert", desc: "Die KI erkennt Text, erstellt Zusammenfassungen und kategorisiert." },
            { step: "3", title: "Finden & Fragen", desc: "Durchsuche alles oder stelle der KI Fragen zu deinen Dokumenten." },
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
            Faire Preise
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Starte kostenlos und wachse mit deinen Dokumenten.
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
                  <Link to="/registrieren">{plan.highlight ? "Premium starten" : "Kostenlos starten"}</Link>
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
            <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              Bereit fuer dein digitales Gedaechtnis?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Starte jetzt kostenlos und bringe Ordnung in deine Dokumente - mit KI-Power.
            </p>
            <Button size="lg" asChild>
              <Link to="/registrieren">Jetzt kostenlos starten <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
                <Brain className="h-5 w-5 text-primary" />
                <span className="font-bold">SecondBrain</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ein Produkt der Fintutto UG (haftungsbeschraenkt) i.G.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Produkt</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><a href="#features" className="hover:text-foreground transition-colors">Features</a></div>
                <div><a href="#anwendungen" className="hover:text-foreground transition-colors">Anwendungen</a></div>
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
