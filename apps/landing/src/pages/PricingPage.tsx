import { Link } from 'react-router-dom'
import { Check, Zap } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: '0',
    desc: 'Für den Einstieg — kostenlos für immer.',
    features: ['3 Apps deiner Wahl', 'Basis-Funktionen', 'Community-Support', '1 GB Speicher'],
    cta: 'Kostenlos starten',
    href: '/starten',
    highlight: false,
  },
  {
    name: 'Plus',
    price: '7,99',
    desc: 'Für alle, die mehr aus ihren Apps herausholen wollen.',
    features: ['Alle 14 Apps', 'Alle Funktionen', 'E-Mail-Support', '10 GB Speicher', 'KI-Features inklusive', 'Keine Werbung'],
    cta: '14 Tage kostenlos testen',
    href: '/starten?plan=plus',
    highlight: true,
  },
  {
    name: 'Family',
    price: '12,99',
    desc: 'Für die ganze Familie — bis zu 5 Personen.',
    features: ['Alle Plus-Features', 'Bis zu 5 Nutzer', 'Familien-Dashboard', '50 GB Speicher', 'Prioritäts-Support'],
    cta: '14 Tage kostenlos testen',
    href: '/starten?plan=family',
    highlight: false,
  },
]

export function PricingPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">Einfache, faire Preise</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto mb-2">Starte kostenlos. Upgrade wenn du bereit bist.</p>
          <p className="text-sm text-slate-500">14 Tage kostenlos · Keine Kreditkarte · Jederzeit kündbar</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 border ${plan.highlight ? 'border-indigo-500 shadow-xl shadow-indigo-100 relative' : 'border-slate-200'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap size={10} /> Beliebt
                  </div>
                )}
                <div className="mb-5">
                  <div className="text-lg font-bold text-slate-900 mb-1">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}€</span>
                    {plan.price !== '0' && <span className="text-slate-500 text-sm">/Monat</span>}
                  </div>
                  <p className="text-sm text-slate-500">{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check size={15} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.href}
                  className={`block w-full text-center font-semibold py-3 rounded-xl transition-colors text-sm ${
                    plan.highlight
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 mb-4">Noch Fragen zu den Preisen?</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="https://know.fintutto.world/faq-angel" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">FAQ ansehen ↗</a>
              <Link to="/kontakt" className="text-sm text-indigo-600 hover:underline">Kontakt aufnehmen</Link>
              <a href="https://know.fintutto.world/docs" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">Dokumentation ↗</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
