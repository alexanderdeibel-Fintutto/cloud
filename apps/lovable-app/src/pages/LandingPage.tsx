import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  FileText,
  Calculator,
  Landmark,
  BarChart3,
  Upload,
  Shield,
  Building2,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'KI-Belegerkennung',
    description: 'Laden Sie Belege hoch – die KI erkennt und verbucht automatisch.',
  },
  {
    icon: FileText,
    title: 'Rechnungserstellung',
    description: 'Professionelle Rechnungen mit PDF-Editor und automatischem Versand.',
  },
  {
    icon: Calculator,
    title: 'Doppelte Buchführung',
    description: 'SKR03/SKR04, vollständiges Journal und alle Auswertungen.',
  },
  {
    icon: Landmark,
    title: 'Banking-Integration',
    description: 'Automatischer Kontoabruf und intelligente Zuordnung.',
  },
  {
    icon: BarChart3,
    title: 'BWA & Berichte',
    description: 'BWA, GuV, Bilanz und UStVA auf Knopfdruck.',
  },
  {
    icon: Upload,
    title: 'DATEV-Export',
    description: 'Nahtlose Übergabe an Ihren Steuerberater.',
  },
  {
    icon: Shield,
    title: 'GoBD-konform',
    description: 'Revisionssichere Archivierung und Audit-Trail.',
  },
  {
    icon: Building2,
    title: 'Multi-Mandanten',
    description: 'Beliebig viele Firmen in einem Account verwalten.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50">
        <nav className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-white font-bold text-xl">Fintutto</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Anmelden
              </Link>
              <Button asChild variant="gradient">
                <Link to="/register">Kostenlos starten</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-primary-300 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Mit KI-Unterstützung bei jedem Schritt
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Finanzbuchhaltung,
            <br />
            <span className="text-gradient">die einfach funktioniert</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Vollständige Buchhaltung für GmbH, UG, KG, OHG und alle anderen Rechtsformen.
            Intelligent, automatisiert und ohne Vorkenntnisse nutzbar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              <Link to="/register">30 Tage kostenlos testen</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
              <a href="#features">Funktionen entdecken</a>
            </Button>
          </div>

          <p className="mt-6 text-gray-400 text-sm">
            Keine Kreditkarte erforderlich • Kündigung jederzeit • DSGVO-konform
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Alles, was Sie für Ihre Buchhaltung brauchen
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Von der Belegerkennung bis zum DATEV-Export – vollautomatisch und
              auf dem neuesten Stand der Technik.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-500/50 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary-600 to-accent-600">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bereit, Ihre Buchhaltung zu revolutionieren?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Starten Sie jetzt mit Fintutto und erleben Sie, wie einfach professionelle
              Finanzbuchhaltung sein kann.
            </p>
            <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              <Link to="/register">Jetzt kostenlos registrieren</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <span className="text-white font-semibold">Fintutto</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">AGB</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Fintutto. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
