import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain, Upload, Search, FileText, ArrowRight, Shield, Zap, Building2,
  CalendarClock, MessageSquare, Star, Check, ChevronRight, Tag, FolderOpen,
  BarChart3, ExternalLink, Clock, Eye, Sparkles, Lock, Globe, Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FINTUTTO_APPS } from '@fintutto/shared'

const FEATURES = [
  {
    icon: Upload,
    title: 'Scannen & OCR',
    desc: 'Lade PDFs, Fotos oder Scans hoch — die KI erkennt automatisch den Text und analysiert den Inhalt deines Dokuments.',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Brain,
    title: 'KI-Kategorisierung',
    desc: 'Dokumenttyp, Absender, Beträge, Fristen — alles wird automatisch erkannt und zugeordnet. Kein manuelles Sortieren mehr.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: CalendarClock,
    title: 'Fristen-Tracking',
    desc: 'Widerspruchsfristen, Zahlungsziele, Vertragslaufzeiten — SecondBrain erkennt Termine und erinnert dich rechtzeitig.',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    icon: Building2,
    title: 'Firmenverwaltung',
    desc: 'Ordne Dokumente automatisch deinen Firmen zu. Perfekt für Selbstständige und Unternehmer mit mehreren Gesellschaften.',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: ArrowRight,
    title: 'Cross-App Routing',
    desc: 'Rechnungen direkt an FinTutto, Bescheide an BescheidBoxer, Mietverträge an Vermietify — ein Klick genügt.',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    icon: MessageSquare,
    title: 'KI-Chat',
    desc: 'Stelle Fragen zu deinen Dokumenten in natürlicher Sprache. „Was schulde ich dem Finanzamt?" — SecondBrain antwortet.',
    color: 'bg-pink-500/10 text-pink-500',
  },
  {
    icon: Search,
    title: 'Volltextsuche',
    desc: 'Durchsuche alle Dokumente nach Stichworten, Beträgen, Absendernamen — auch den per OCR erkannten Text.',
    color: 'bg-cyan-500/10 text-cyan-500',
  },
  {
    icon: Tag,
    title: 'Tags & Sammlungen',
    desc: 'Organisiere Dokumente mit Tags und Sammlungen. Erstelle dein eigenes Ordnungssystem — flexibel und intuitiv.',
    color: 'bg-amber-500/10 text-amber-500',
  },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Hochladen', desc: 'Lade dein Dokument hoch — PDF, Foto, Scan. Drag & Drop oder Kamera.', icon: Upload },
  { step: '2', title: 'KI analysiert', desc: 'Texterkennung, Kategorisierung, Firmenzuordnung — automatisch in Sekunden.', icon: Brain },
  { step: '3', title: 'Organisieren', desc: 'Tags setzen, Sammlung zuordnen, Fristen tracken — oder einfach die KI machen lassen.', icon: FolderOpen },
  { step: '4', title: 'Weiterleiten', desc: 'Ein Klick und dein Dokument landet in der richtigen Fintutto-App.', icon: ArrowRight },
]

const PLANS = [
  {
    name: 'Starter',
    price: '0',
    period: 'kostenlos',
    desc: 'Perfekt zum Ausprobieren',
    features: [
      '50 Dokumente',
      '100 MB Speicher',
      'OCR & KI-Analyse',
      'Volltextsuche',
      '1 Firma',
    ],
    cta: 'Kostenlos starten',
    popular: false,
  },
  {
    name: 'Pro',
    price: '9',
    period: '/ Monat',
    desc: 'Für Selbstständige & Freelancer',
    features: [
      'Unbegrenzte Dokumente',
      '5 GB Speicher',
      'KI-Chat & Smart Routing',
      'Fristen-Tracking',
      '5 Firmen',
      'Cross-App Routing',
      'Gespeicherte Suchen',
      'Daten-Export',
    ],
    cta: 'Jetzt upgraden',
    popular: true,
  },
  {
    name: 'Business',
    price: '29',
    period: '/ Monat',
    desc: 'Für Unternehmer & Steuerberater',
    features: [
      'Alles aus Pro',
      '50 GB Speicher',
      'Unbegrenzte Firmen',
      'Team-Zugang (bald)',
      'API-Zugang (bald)',
      'Prioritäts-Support',
      'Mandantenverwaltung (bald)',
      'Individuelle Workflows',
    ],
    cta: 'Kontakt aufnehmen',
    popular: false,
  },
]

const FAQ_ITEMS = [
  {
    q: 'Welche Dateiformate werden unterstützt?',
    a: 'SecondBrain unterstützt PDF, JPG, PNG, TIFF, HEIC und WebP. Du kannst Dokumente per Drag & Drop, Dateiauswahl oder direkt mit der Kamera erfassen.',
  },
  {
    q: 'Wie funktioniert die KI-Analyse?',
    a: 'Nach dem Upload wird dein Dokument per OCR (optische Zeichenerkennung) digitalisiert. Anschließend analysiert unsere KI den Text und erkennt automatisch Dokumenttyp, Absender, Beträge, Fristen und mehr.',
  },
  {
    q: 'Sind meine Daten sicher?',
    a: 'Ja. Alle Daten werden verschlüsselt übertragen und gespeichert. Wir verwenden Supabase als Infrastruktur mit Row-Level-Security — nur du hast Zugriff auf deine Dokumente.',
  },
  {
    q: 'Was bedeutet Cross-App Routing?',
    a: 'SecondBrain erkennt, welche Fintutto-App für dein Dokument am besten geeignet ist. Eine Rechnung kann mit einem Klick an FinTutto weitergeleitet werden, ein Steuerbescheid an BescheidBoxer.',
  },
  {
    q: 'Kann ich meine Daten exportieren?',
    a: 'Ja, jederzeit. SecondBrain bietet Export als JSON (vollständiges Backup), CSV (für Excel) und Markdown (lesbar). Du behältst immer die volle Kontrolle über deine Daten.',
  },
  {
    q: 'Gibt es eine mobile App?',
    a: 'SecondBrain ist als Progressive Web App (PWA) optimiert und funktioniert hervorragend auf Smartphones und Tablets — direkt im Browser, ohne Installation.',
  },
]

const ECOSYSTEM_APPS = [
  FINTUTTO_APPS.portal,
  FINTUTTO_APPS.financialCompass,
  FINTUTTO_APPS.bescheidboxer,
  FINTUTTO_APPS.fintuttoBiz,
  FINTUTTO_APPS.vermietify,
  FINTUTTO_APPS.vermieterPortal,
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Teil des Fintutto-Ökosystems</span>
          </div>

          {/* Brain icon */}
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl gradient-brain flex items-center justify-center glow-indigo-strong animate-pulse-brain mx-auto">
              <Brain className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary/20 animate-float" />
            <div className="absolute -bottom-2 -left-4 w-6 h-6 rounded-full bg-primary/15 animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 -right-8 w-4 h-4 rounded-full bg-primary/10 animate-float" style={{ animationDelay: '0.5s' }} />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Dein{' '}
            <span className="gradient-brain-text">SecondBrain</span>
            <br />
            <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-muted-foreground mt-2 block">
              für alle deine Dokumente
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Scannen. KI analysiert. Automatisch organisiert. Weitergeleitet.
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-10">
            Jedes Papier nur einmal anfassen — SecondBrain erledigt den Rest.
            OCR, Kategorisierung, Fristen-Tracking und Cross-App Routing. Alles KI-gestützt.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/registrieren">
              <Button size="xl" variant="glow" className="text-lg px-8 py-6">
                Kostenlos starten
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="xl" variant="outline" className="text-lg px-8 py-6">
                Anmelden
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> DSGVO-konform</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> Ende-zu-Ende verschlüsselt</span>
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Made in Austria</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Sofort einsatzbereit</span>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 bg-muted/30" id="features">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Alles was du brauchst — <span className="gradient-brain-text">und mehr</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              SecondBrain kombiniert OCR, KI-Analyse und intelligentes Routing in einer einzigen App.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24" id="how-it-works">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">So funktioniert's</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              In 4 Schritten zur <span className="gradient-brain-text">Dokumenten-Freiheit</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative text-center group">
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
                )}
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ECOSYSTEM ===== */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Ökosystem</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nahtlos integriert in <span className="gradient-brain-text">Fintutto</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              SecondBrain ist das Herzstück des Fintutto-Ökosystems. Leite Dokumente mit einem Klick an die richtige App weiter.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {ECOSYSTEM_APPS.map((app) => (
              <a
                key={app.slug}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <span className="text-3xl">{app.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">{app.name}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-24" id="pricing">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Preise</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Einfache, <span className="gradient-brain-text">transparente</span> Preise
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Starte kostenlos. Upgrade wenn du bereit bist. Keine versteckten Kosten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`relative overflow-hidden transition-all hover:shadow-xl ${
                  plan.popular ? 'border-primary shadow-lg scale-[1.02]' : 'hover:-translate-y-1'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                )}
                <CardContent className="p-6">
                  {plan.popular && (
                    <Badge className="mb-4">Beliebteste Wahl</Badge>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold">{plan.price === '0' ? 'Gratis' : `€${plan.price}`}</span>
                    {plan.price !== '0' && (
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    )}
                  </div>

                  <Link to="/registrieren">
                    <Button
                      className="w-full mb-6"
                      variant={plan.popular ? 'glow' : 'outline'}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>

                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Alle Preise inkl. MwSt. Jederzeit kündbar. 14 Tage Geld-zurück-Garantie.
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24 bg-muted/30" id="faq">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Häufig gestellte <span className="gradient-brain-text">Fragen</span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl gradient-brain flex items-center justify-center glow-indigo mx-auto">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bereit für dein <span className="gradient-brain-text">SecondBrain</span>?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Starte jetzt kostenlos und erlebe, wie KI deine Dokumentenverwaltung revolutioniert.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registrieren">
              <Button size="xl" variant="glow" className="text-lg px-8 py-6">
                Kostenlos starten
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg gradient-brain flex items-center justify-center">
                  <Brain className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="font-bold gradient-brain-text">SecondBrain</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Die KI-Dokumentenzentrale von Fintutto.
                Scannen, analysieren, organisieren, weiterleiten.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Produkt</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Preise</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><Link to="/login" className="hover:text-foreground transition-colors">Anmelden</Link></li>
              </ul>
            </div>

            {/* Ecosystem */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Fintutto Apps</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {ECOSYSTEM_APPS.slice(0, 5).map(app => (
                  <li key={app.slug}>
                    <a href={app.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                      <span className="text-xs">{app.icon}</span> {app.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/impressum" className="hover:text-foreground transition-colors">Impressum</Link></li>
                <li><Link to="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link></li>
                <li><a href="mailto:kontakt@fintutto.com" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> kontakt@fintutto.com
                </a></li>
              </ul>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Fintutto UG (haftungsbeschränkt). Alle Rechte vorbehalten.</p>
            <div className="flex items-center gap-4">
              <Link to="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
              <Link to="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// FAQ Accordion Item
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold">{question}</h3>
        <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </div>
      {open && (
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed animate-fade-in-up">
          {answer}
        </p>
      )}
    </button>
  )
}
