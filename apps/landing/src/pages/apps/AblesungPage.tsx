import { Link } from 'react-router-dom'
import { ArrowRight, Calculator, Zap, Shield, TrendingUp, FileText, Star } from 'lucide-react'

const FEATURES = [
  { icon: Zap, title: 'OCR-Erkennung', desc: 'Fotografiere einfach deinen Zähler — die KI liest den Wert automatisch aus.' },
  { icon: FileText, title: 'Automatische Übermittlung', desc: 'Sende Ablesewerte direkt an deinen Versorger — ohne Formulare.' },
  { icon: TrendingUp, title: 'Verbrauchshistorie', desc: 'Verfolge deinen Verbrauch über Zeit und erkenne Einsparpotenziale.' },
  { icon: Shield, title: 'Rechnungsprüfung', desc: 'Prüfe deine Energierechnungen automatisch auf Fehler und Unstimmigkeiten.' },
  { icon: Calculator, title: 'Mehrere Zähler', desc: 'Verwalte Strom, Gas und Wasser in einer App — für alle deine Objekte.' },
  { icon: Star, title: 'Erinnerungen', desc: 'Automatische Erinnerungen für fällige Ablesungen — nie wieder vergessen.' },
]

export function AblesungPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-amber-50/30 to-yellow-50/20 pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Calculator size={12} />
            Wohnen
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Ablesung
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Fotografiere deinen Zähler — die App liest den Wert automatisch aus und übermittelt ihn an deinen Versorger. Schluss mit manueller Eingabe und Fehlern.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <a
              href="#"
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg"
            >
              Jetzt kostenlos starten
            </a>
            <Link
              to="/preise"
              className="w-full sm:w-auto border border-slate-300 hover:border-amber-400 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
            >
              Preise ansehen <ArrowRight size={16} />
            </Link>
          </div>
          <p className="text-sm text-slate-500">14 Tage kostenlos · Keine Kreditkarte · Jederzeit kündbar</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Was Ablesung für dich tut</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-amber-600 to-yellow-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Bereit loszulegen?</h2>
          <p className="text-amber-200 text-lg mb-8">14 Tage kostenlos testen. Kein Risiko.</p>
          <a
            href="#"
            className="inline-block bg-white text-amber-600 font-bold px-10 py-4 rounded-xl hover:bg-amber-50 transition-colors text-base shadow-xl"
          >
            Jetzt starten
          </a>
        </div>
      </section>
    </>
  )
}
