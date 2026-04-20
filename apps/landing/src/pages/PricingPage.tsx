import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check, Zap, Crown, Shield, Star, TrendingUp, Home, Building2,
  BookOpen, Brain, Leaf, Users, Swords, Calculator, ArrowRight,
  ChevronDown, ChevronUp
} from 'lucide-react'

// ─── Cloud-Abo (Plattform-übergreifend) ──────────────────────────────────────
const CLOUD_PLANS = [
  {
    name: 'Free',
    price: 0,
    priceYearly: 0,
    desc: 'Für den Einstieg — kostenlos für immer.',
    features: [
      '3 Apps deiner Wahl',
      'Basis-Funktionen',
      'Community-Support',
      '1 GB Speicher',
    ],
    cta: 'Kostenlos starten',
    href: 'https://fintutto.cloud/register',
    highlight: false,
    badge: null,
    icon: Shield,
    color: 'slate',
  },
  {
    name: 'Plus',
    price: 7.99,
    priceYearly: 79.90,
    desc: 'Alle 14 Apps — KI-Features inklusive.',
    features: [
      'Alle 14 Apps freigeschaltet',
      'Alle Premium-Funktionen',
      'KI-Features inklusive',
      '10 GB Speicher',
      'E-Mail-Support',
      'Keine Werbung',
    ],
    cta: '14 Tage kostenlos testen',
    href: 'https://fintutto.cloud/register?plan=plus',
    highlight: true,
    badge: 'Beliebt',
    icon: Zap,
    color: 'indigo',
  },
  {
    name: 'Family',
    price: 12.99,
    priceYearly: 129.90,
    desc: 'Für die ganze Familie — bis zu 5 Personen.',
    features: [
      'Alle Plus-Features',
      'Bis zu 5 Nutzer',
      'Familien-Dashboard',
      '50 GB Speicher',
      'Prioritäts-Support',
    ],
    cta: '14 Tage kostenlos testen',
    href: 'https://fintutto.cloud/register?plan=family',
    highlight: false,
    badge: null,
    icon: Users,
    color: 'violet',
  },
]

// ─── App-spezifische Preise ───────────────────────────────────────────────────
const APP_PRICING = [
  {
    id: 'vermietify',
    name: 'Vermietify',
    icon: Building2,
    color: 'blue',
    tagline: 'Professionelle Immobilienverwaltung',
    url: 'https://vermietify.fintutto.cloud',
    plans: [
      {
        name: 'Starter',
        price: 0,
        priceYearly: 0,
        badge: null,
        features: ['1 Immobilie', '5 Einheiten', 'Basis-Dashboards', '3 Portal-Credits/Monat'],
      },
      {
        name: 'Basic',
        price: 9.99,
        priceYearly: 95.90,
        badge: null,
        features: ['3 Immobilien', '25 Einheiten', 'Alle Dashboards', 'Dokumentenverwaltung', '10 Portal-Credits/Monat'],
      },
      {
        name: 'Pro',
        price: 24.99,
        priceYearly: 239.90,
        badge: 'Beliebt',
        features: ['10 Immobilien', '100 Einheiten', 'Nebenkostenabrechnung', 'Prioritäts-Support', '30 Portal-Credits/Monat'],
      },
      {
        name: 'Enterprise',
        price: 49.99,
        priceYearly: 479.90,
        badge: null,
        features: ['Unbegrenzte Immobilien', 'API-Zugang', 'Custom Branding', 'Unbegrenzte Portal-Credits'],
      },
    ],
  },
  {
    id: 'bescheidboxer',
    name: 'Bescheidboxer',
    icon: Swords,
    color: 'red',
    tagline: 'KI-Rechtsberatung für Bürgergeld & ALG',
    url: 'https://bescheidboxer.fintutto.cloud',
    plans: [
      {
        name: 'Schnupperer',
        price: 0,
        priceYearly: 0,
        badge: null,
        features: ['3 KI-Nachrichten/Tag', '1 Bescheid-Scan/Monat', 'Forum lesen & posten', 'Basis-Rechtsinfos'],
      },
      {
        name: 'Starter',
        price: 2.99,
        priceYearly: 29.99,
        badge: null,
        features: ['10 KI-Nachrichten/Tag', '1 Schreiben/Monat', '3 Bescheid-Scans', '10 Credits/Monat'],
      },
      {
        name: 'Kämpfer',
        price: 4.99,
        priceYearly: 49.99,
        badge: 'Beliebt',
        features: ['Unbegrenzte KI-Nachrichten', '3 Schreiben/Monat', 'Unbegrenzte Scans', '25 Credits, 1 Postversand', 'MieterApp Basic inklusive'],
      },
      {
        name: 'Vollschutz',
        price: 7.99,
        priceYearly: 79.99,
        badge: 'VIP',
        features: ['Alles unbegrenzt', '50 Credits/Monat', '3 Postversand', 'VIP-Forum', 'MieterApp Premium'],
      },
    ],
  },
  {
    id: 'ablesung',
    name: 'Zählerstand / Ablesung',
    icon: Calculator,
    color: 'teal',
    tagline: 'Digitale Zählererfassung für Vermieter',
    url: 'https://zaehler.fintutto.cloud',
    plans: [
      {
        name: 'Free',
        price: 0,
        priceYearly: 0,
        badge: null,
        features: ['Basis-Zählererfassung', 'Manuelle Eingabe', 'Community-Support'],
      },
      {
        name: 'Basic',
        price: 9.99,
        priceYearly: 99.90,
        badge: null,
        features: ['Bis zu 10 Einheiten', 'OCR-Zählererfassung', 'E-Mail-Support', 'PDF-Export'],
      },
      {
        name: 'Pro',
        price: 24.99,
        priceYearly: 249.90,
        badge: 'Beliebt',
        features: ['Bis zu 50 Einheiten', 'OCR-Zählererfassung', 'Prioritäts-Support', 'Automatische Berichte', 'Energievertrags-Verwaltung'],
      },
    ],
  },
  {
    id: 'pflanzen',
    name: 'Pflanzen-Manager',
    icon: Leaf,
    color: 'green',
    tagline: 'Deine Pflanzen immer im Blick',
    url: 'https://pflanzen.fintutto.cloud',
    plans: [
      {
        name: 'Free',
        price: 0,
        priceYearly: 0,
        badge: 'Immer kostenlos',
        features: ['Unbegrenzte Pflanzen', 'Pflanzen-Scanner', 'Pflanzenkatalog 55+ Arten', 'Giess- & Düngeerinnerungen', 'Urlaubsplan', 'Daten-Export'],
      },
      {
        name: 'Premium',
        price: 2.99,
        priceYearly: 29.90,
        badge: 'Bald verfügbar',
        features: ['Cloud-Sync über alle Geräte', 'KI-Pflanzenerkennung', 'Push-Benachrichtigungen', 'Familien-/WG-Sharing', 'Erweiterte Statistiken'],
      },
    ],
  },
]

// ─── Bescheidboxer Credit-Pakete ──────────────────────────────────────────────
const CREDIT_PACKAGES = [
  { credits: 10, price: 4.99, label: '10 Credits', discount: null },
  { credits: 25, price: 9.99, label: '25 Credits', discount: '10% Rabatt' },
  { credits: 50, price: 17.99, label: '50 Credits', discount: '20% Rabatt' },
]

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'Was ist der Unterschied zwischen dem Cloud-Abo und den App-Abos?',
    a: 'Das Fintutto Cloud-Abo gibt dir Zugang zu allen 14 Apps auf einmal. Die App-spezifischen Abos (z.B. Vermietify Pro) sind für Nutzer, die nur eine bestimmte App intensiv nutzen und deren erweiterte Funktionen benötigen — oft günstiger als das Cloud-Abo, aber auf eine App beschränkt.',
  },
  {
    q: 'Kann ich jederzeit kündigen oder den Tarif wechseln?',
    a: 'Ja, alle Abos sind monatlich kündbar. Ein Upgrade ist sofort möglich, ein Downgrade wird zum nächsten Abrechnungszeitraum wirksam. Bei Jahreszahlung gilt die Laufzeit bis zum Ende des Jahres.',
  },
  {
    q: 'Wie viel spare ich bei Jahreszahlung?',
    a: 'Bei Jahreszahlung sparst du je nach Tarif zwischen 10% und 17% gegenüber der monatlichen Abrechnung. Der Rabatt wird automatisch beim Checkout angezeigt.',
  },
  {
    q: 'Was sind Credits bei Bescheidboxer?',
    a: 'Credits sind die Währung im Bescheidboxer. Du kannst sie für Detail-Analysen von Bescheiden, Postversand und personalisierte Schreiben einsetzen. Jeder Tarif enthält ein monatliches Credit-Guthaben — zusätzliche Credits kannst du als Paket nachkaufen.',
  },
  {
    q: 'Gibt es eine kostenlose Testphase?',
    a: 'Ja! Alle kostenpflichtigen Cloud-Abos (Plus & Family) haben eine 14-tägige kostenlose Testphase ohne Kreditkarte. App-spezifische Abos haben jeweils einen kostenlosen Free-Tarif.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
      >
        {q}
        {open ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

const COLOR_MAP: Record<string, { badge: string; highlight: string; btn: string; tag: string }> = {
  indigo: { badge: 'bg-indigo-600 text-white', highlight: 'border-indigo-500 shadow-xl shadow-indigo-100', btn: 'bg-indigo-600 hover:bg-indigo-700 text-white', tag: 'bg-indigo-100 text-indigo-700' },
  blue:   { badge: 'bg-blue-600 text-white',   highlight: 'border-blue-500 shadow-xl shadow-blue-100',   btn: 'bg-blue-600 hover:bg-blue-700 text-white',   tag: 'bg-blue-100 text-blue-700' },
  red:    { badge: 'bg-red-600 text-white',     highlight: 'border-red-500 shadow-xl shadow-red-100',     btn: 'bg-red-600 hover:bg-red-700 text-white',     tag: 'bg-red-100 text-red-700' },
  teal:   { badge: 'bg-teal-600 text-white',    highlight: 'border-teal-500 shadow-xl shadow-teal-100',   btn: 'bg-teal-600 hover:bg-teal-700 text-white',   tag: 'bg-teal-100 text-teal-700' },
  green:  { badge: 'bg-green-600 text-white',   highlight: 'border-green-500 shadow-xl shadow-green-100', btn: 'bg-green-600 hover:bg-green-700 text-white',  tag: 'bg-green-100 text-green-700' },
  violet: { badge: 'bg-violet-600 text-white',  highlight: 'border-violet-500 shadow-xl shadow-violet-100', btn: 'bg-violet-600 hover:bg-violet-700 text-white', tag: 'bg-violet-100 text-violet-700' },
  slate:  { badge: 'bg-slate-600 text-white',   highlight: 'border-slate-300',                            btn: 'bg-slate-700 hover:bg-slate-800 text-white',  tag: 'bg-slate-100 text-slate-700' },
}

export function PricingPage() {
  const [yearly, setYearly] = useState(false)

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Star size={12} /> Faire Preise für jede Lebenssituation
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Transparente Preise
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Wähle das Cloud-Abo für alle 14 Apps auf einmal — oder starte direkt mit dem Abo deiner Lieblings-App. Alle Preise inkl. MwSt., jederzeit kündbar.
          </p>
          {/* Jahres-/Monats-Toggle */}
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${!yearly ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${yearly ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Jährlich <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${yearly ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>bis -17%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Cloud-Abo ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Fintutto Cloud-Abo</h2>
            <p className="text-slate-500 text-sm">Ein Abo — alle 14 Apps. Ideal für Nutzer, die mehrere Apps nutzen.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CLOUD_PLANS.map(plan => {
              const c = COLOR_MAP[plan.color] ?? COLOR_MAP.slate
              const price = yearly ? plan.priceYearly : plan.price
              const isHighlight = plan.highlight
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-7 border relative ${isHighlight ? c.highlight : 'border-slate-200'}`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${c.badge}`}>
                      <Zap size={10} /> {plan.badge}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.tag}`}>
                      <plan.icon size={16} />
                    </div>
                    <span className="font-bold text-slate-900">{plan.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-slate-900">
                      {price === 0 ? '0' : price.toFixed(2).replace('.', ',')}€
                    </span>
                    {price > 0 && (
                      <span className="text-slate-500 text-sm">/{yearly ? 'Jahr' : 'Monat'}</span>
                    )}
                  </div>
                  {yearly && plan.price > 0 && (
                    <p className="text-xs text-emerald-600 font-semibold mb-2">
                      ≈ {(plan.priceYearly / 12).toFixed(2).replace('.', ',')}€/Monat
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mb-5">{plan.desc}</p>
                  <ul className="space-y-2.5 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check size={15} className="text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={plan.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center font-semibold py-3 rounded-xl transition-colors text-sm ${
                      isHighlight ? c.btn : 'border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="bg-slate-50 py-10 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Oder wähle das Abo direkt für deine App — ideal wenn du nur eine App intensiv nutzt.
          </p>
        </div>
      </div>

      {/* ── App-spezifische Preise ── */}
      {APP_PRICING.map(app => {
        const c = COLOR_MAP[app.color] ?? COLOR_MAP.slate
        const AppIcon = app.icon
        return (
          <section key={app.id} className="py-16 bg-white border-b border-slate-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              {/* App-Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.tag}`}>
                  <AppIcon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{app.name}</h2>
                  <p className="text-sm text-slate-500">{app.tagline}</p>
                </div>
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`ml-auto text-xs font-semibold flex items-center gap-1 ${c.tag} px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity`}
                >
                  App öffnen <ArrowRight size={12} />
                </a>
              </div>

              {/* Plan-Karten */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${app.plans.length >= 4 ? 'lg:grid-cols-4' : app.plans.length === 3 ? 'lg:grid-cols-3' : ''} gap-5`}>
                {app.plans.map(plan => {
                  const price = yearly ? plan.priceYearly : plan.price
                  const isHighlight = plan.badge === 'Beliebt'
                  return (
                    <div
                      key={plan.name}
                      className={`rounded-2xl p-6 border relative ${isHighlight ? c.highlight : 'border-slate-200'}`}
                    >
                      {plan.badge && (
                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${c.badge}`}>
                          {plan.badge}
                        </div>
                      )}
                      <div className="font-bold text-slate-900 mb-1 mt-1">{plan.name}</div>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {price === 0 ? '0' : price.toFixed(2).replace('.', ',')}€
                        </span>
                        {price > 0 && (
                          <span className="text-slate-500 text-xs">/{yearly ? 'Jahr' : 'Monat'}</span>
                        )}
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-start gap-2 text-xs text-slate-700">
                            <Check size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={`${app.url}/register${plan.price > 0 ? `?plan=${plan.name.toLowerCase()}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block w-full text-center font-semibold py-2.5 rounded-xl transition-colors text-xs ${
                          isHighlight ? c.btn : 'border border-slate-300 hover:border-slate-400 text-slate-700'
                        }`}
                      >
                        {price === 0 ? 'Kostenlos starten' : 'Jetzt starten'}
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}

      {/* ── Bescheidboxer Credit-Pakete ── */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <Swords size={12} /> Bescheidboxer
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Credit-Pakete nachkaufen</h2>
            <p className="text-sm text-slate-500">Credits für Bescheid-Analysen, Postversand und personalisierte Schreiben.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {CREDIT_PACKAGES.map(pkg => (
              <div key={pkg.credits} className="bg-white rounded-2xl p-6 border border-slate-200 text-center relative">
                {pkg.discount && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {pkg.discount}
                  </div>
                )}
                <div className="text-3xl font-extrabold text-slate-900 mb-1">{pkg.credits}</div>
                <div className="text-sm text-slate-500 mb-3">Credits</div>
                <div className="text-2xl font-bold text-red-600 mb-1">{pkg.price.toFixed(2).replace('.', ',')}€</div>
                <div className="text-xs text-slate-400 mb-5">{(pkg.price / pkg.credits).toFixed(2).replace('.', ',')}€ pro Credit</div>
                <a
                  href={`https://bescheidboxer.fintutto.cloud/credits?package=${pkg.credits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center font-semibold py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition-colors text-sm"
                >
                  Paket kaufen
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            Credits werden monatlich zurückgesetzt. Nicht verbrauchte Credits verfallen am Monatsende.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">Häufige Fragen</h2>
          <div className="space-y-3">
            {FAQ.map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500 mb-4">Noch weitere Fragen?</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="https://know.fintutto.world" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">Wissensdatenbank ↗</a>
              <Link to="/kontakt" className="text-sm text-indigo-600 hover:underline">Kontakt aufnehmen</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
