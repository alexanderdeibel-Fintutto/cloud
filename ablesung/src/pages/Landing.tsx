import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gauge, Building2, Camera, FileSpreadsheet, 
  Shield, BarChart3, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import appLogo from '@/assets/logo.svg';

const features = [
  {
    icon: Gauge,
    title: 'Zähler verwalten',
    description: 'Strom, Gas, Wasser & Heizung – alle Zähler Ihrer Immobilien zentral erfasst.',
  },
  {
    icon: Camera,
    title: 'KI-Ablesung per Foto',
    description: 'Fotografieren Sie den Zählerstand und die KI erkennt den Wert automatisch.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Import & Export',
    description: 'CSV, Excel oder PDF – importieren Sie bestehende Ablesungen mühelos.',
  },
  {
    icon: Building2,
    title: 'Gebäude & Einheiten',
    description: 'Strukturieren Sie Ihr Portfolio nach Gebäuden, Einheiten und Mietern.',
  },
  {
    icon: BarChart3,
    title: 'Verbrauchsanalyse',
    description: 'Verfolgen Sie den Verbrauch über Zeit und erkennen Sie Auffälligkeiten.',
  },
  {
    icon: Shield,
    title: 'Sicher & DSGVO-konform',
    description: 'Ihre Daten sind verschlüsselt und werden in der EU gehostet.',
  },
];

const benefits = [
  'Unbegrenzte Gebäude & Einheiten',
  'Automatische Zählerstand-Erkennung',
  'Mehrere Nutzer pro Organisation',
  'Abrechnungsperioden verwalten',
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden gradient-mesh">
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex flex-col">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 -left-20 w-72 h-72 blob bg-gradient-to-br from-primary/30 to-secondary/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 -right-20 w-96 h-96 blob bg-gradient-to-br from-secondary/25 to-primary/15 blur-3xl"
        />

        {/* Navbar */}
        <header className="relative z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <img src={appLogo} alt="Fintutto Logo" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold text-white">Fintutto Zähler</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10" asChild>
              <Link to="/login">Anmelden</Link>
            </Button>
            <Button className="gradient-primary text-primary-foreground shadow-glow rounded-xl" asChild>
              <Link to="/register">Kostenlos starten</Link>
            </Button>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mx-auto mb-8 w-24 h-24 rounded-3xl overflow-hidden shadow-glow float"
            >
              <img src={appLogo} alt="Fintutto Logo" className="w-full h-full" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
            >
              Zählerstände{' '}
              <span className="text-gradient">
                einfach digital
              </span>{' '}
              erfassen
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto"
            >
              Verwalten Sie Zähler, Ablesungen und Verbrauchsdaten für all Ihre
              Immobilien – mit KI-gestützter Foto-Ablesung und smartem Import.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground rounded-xl px-8 text-lg shadow-glow"
                asChild
              >
                <Link to="/register">
                  Jetzt kostenlos starten
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-8 text-lg border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link to="/login">Anmelden</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Divider line */}
        <div className="relative z-10 h-px bg-white/5" />
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Alles, was Sie für Ihre{' '}
              <span className="text-gradient">Zählerverwaltung</span> brauchen
            </h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Von der einzelnen Wohnung bis zum großen Portfolio – Fintutto Zähler
              skaliert mit Ihren Anforderungen.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                custom={i + 1}
                className="group glass-card rounded-2xl p-6 card-elevated"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits / CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-10 sm:p-14 shadow-glow text-center relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-52 h-52 blob bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-52 h-52 blob bg-secondary/10 blur-3xl" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="relative z-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              Bereit für die digitale Zählerablesung?
            </h2>

            <ul className="grid sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto mb-10">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="gradient-primary text-primary-foreground rounded-xl px-10 text-lg shadow-glow"
              asChild
            >
              <Link to="/register">
                Kostenlos registrieren
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>

            <p className="mt-4 text-white/40 text-sm">
              Keine Kreditkarte erforderlich · Sofort einsatzbereit
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={appLogo} alt="Fintutto Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-sm font-medium text-white/40">
              © {new Date().getFullYear()} Fintutto
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link to="/login" className="hover:text-white transition-colors">
              Anmelden
            </Link>
            <Link to="/register" className="hover:text-white transition-colors">
              Registrieren
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
