import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/useLanguage'
import {
  Wallet, Home, BookOpen, Leaf, Brain, FileText,
  Scale, Users, Calculator, Globe, GraduationCap,
  Building2, Briefcase, TrendingUp, Shield,
  ArrowRight, Star, Zap, Lock, Smartphone,
} from 'lucide-react'

const APPS = [
  // Finanzen
  { label: 'Finance Coach', sub: 'KI-Finanzcoach & Multi-Bank-Budgetierung', href: '/apps/finance-coach', icon: TrendingUp, color: 'from-emerald-400 to-teal-500', badge: 'Neu' },
  { label: 'Finance Mentor', sub: 'Finanz-Bildung, Kurse & Zertifikate', href: '/apps/finance-mentor', icon: GraduationCap, color: 'from-blue-400 to-indigo-500', badge: null },
  { label: 'Fintutto Biz', sub: 'Freelancer Finance OS — Rechnungen & Steuern', href: '/apps/fintutto-biz', icon: Briefcase, color: 'from-violet-400 to-purple-500', badge: null },
  { label: 'Bescheidboxer', sub: 'Steuerbescheide prüfen & Einspruch einlegen', href: '/apps/bescheidboxer', icon: Shield, color: 'from-orange-400 to-red-500', badge: null },
  // Wohnen
  { label: 'Vermietify', sub: 'Professionelle Immobilienverwaltung für Vermieter', href: '/apps/vermietify', icon: Building2, color: 'from-sky-400 to-blue-500', badge: 'Beliebt' },
  { label: 'WohnHeld', sub: 'Mieter-App für Wohnungsmanagement', href: '/apps/wohnheld', icon: Home, color: 'from-pink-400 to-rose-500', badge: null },
  { label: 'Ablesung', sub: 'Zählerablesung & Rechnungs-OCR', href: '/apps/ablesung', icon: Calculator, color: 'from-amber-400 to-yellow-500', badge: null },
  { label: 'Fintutto Portal', sub: 'Rechner & Formulare für Mietrecht', href: '/apps/portal', icon: Scale, color: 'from-slate-400 to-slate-600', badge: null },
  // Lernen & Alltag
  { label: 'LernApp', sub: 'KI-Erklärungen für Schüler — Mathe, Deutsch & mehr', href: '/apps/lernapp', icon: BookOpen, color: 'from-lime-400 to-green-500', badge: null },
  { label: 'SecondBrain', sub: 'KI-Dokumentenmanagement — Scannen & Organisieren', href: '/apps/secondbrain', icon: Brain, color: 'from-cyan-400 to-teal-500', badge: null },
  { label: 'Pflanzen-Manager', sub: 'Zimmerpflanzen-Verwaltung & Pflegekalender', href: '/apps/pflanzen', icon: Leaf, color: 'from-green-400 to-emerald-500', badge: null },
  { label: 'Translator', sub: 'Übersetzer in 20+ Sprachen mit KI', href: '/apps/translator', icon: Globe, color: 'from-indigo-400 to-violet-500', badge: null },
  // Soziales
  { label: 'Arbeitslos-Portal', sub: 'Bürgergeld, ALG I & Sozialrecht verstehen', href: '/apps/arbeitslos', icon: Users, color: 'from-rose-400 to-pink-500', badge: null },
  { label: 'Widerspruch-Jobcenter', sub: 'Community & Tipps für Betroffene', href: '/apps/widerspruch', icon: FileText, color: 'from-slate-400 to-zinc-500', badge: null },
]

const FEATURES = [
  { icon: Zap, title: 'Sofort einsatzbereit', desc: 'Keine Installation, keine Konfiguration. Einfach registrieren und loslegen.' },
  { icon: Lock, title: 'Deine Daten, sicher', desc: 'Alle Daten verschlüsselt in deutschen Rechenzentren. DSGVO-konform.' },
  { icon: Smartphone, title: 'Auf jedem Gerät', desc: 'Smartphone, Tablet oder Desktop — deine Apps sind überall dabei.' },
  { icon: Star, title: 'Kostenlos starten', desc: '14 Tage alle Features kostenlos. Kein Risiko, keine Kreditkarte.' },
]

export function CloudHomePage() {
  const { t } = useLanguage()

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 pt-20 pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap size={12} />
            14 Apps · Eine Cloud · Kostenlos starten
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            {t('hero_title')}
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Link
              to="/starten"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-indigo-200"
            >
              {t('hero_cta_primary')}
            </Link>
            <Link
              to="/apps"
              className="w-full sm:w-auto border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
            >
              {t('hero_cta_secondary')} <ArrowRight size={16} />
            </Link>
          </div>
          <p className="text-sm text-slate-500">{t('hero_free_hint')}</p>
        </div>
      </section>

      {/* ── Wie es funktioniert ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">{t('how_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: t('how_step1_title'), desc: t('how_step1_desc'), icon: Smartphone },
              { step: '2', title: t('how_step2_title'), desc: t('how_step2_desc'), icon: Zap },
              { step: '3', title: t('how_step3_title'), desc: t('how_step3_desc'), icon: Star },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                  <item.icon size={24} className="text-white" />
                </div>
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Schritt {item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Grid ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">14 Apps für jeden Lebensbereich</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Von Finanzen über Wohnen bis Lernen — für jeden Bedarf die passende App.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {APPS.map(app => (
              <Link
                key={app.href}
                to={app.href}
                className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <app.icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{app.label}</span>
                      {app.badge && (
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{app.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{app.sub}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/apps" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline">
              Alle Apps im Detail entdecken <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Warum Fintutto Cloud?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <f.icon size={22} className="text-indigo-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">{t('social_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: t('social_quote1'), author: t('social_author1') },
              { quote: t('social_quote2'), author: t('social_author2') },
              { quote: t('social_quote3'), author: t('social_author3') },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="text-sm text-slate-700 leading-relaxed mb-4">„{item.quote}"</blockquote>
                <cite className="text-xs text-slate-500 not-italic font-medium">{item.author}</cite>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Bereit loszulegen?
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            14 Tage kostenlos alle Apps testen. Keine Kreditkarte, kein Risiko.
          </p>
          <Link
            to="/starten"
            className="inline-block bg-white text-indigo-600 font-bold px-10 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-base shadow-xl"
          >
            Jetzt kostenlos starten
          </Link>
          <p className="text-indigo-300 text-sm mt-4">{t('hero_free_hint')}</p>
        </div>
      </section>
    </>
  )
}
