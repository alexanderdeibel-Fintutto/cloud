import Link from "next/link";
import Navigation from "@/components/Navigation";

const plans = [
  {
    name: "Gratis",
    price: "0",
    period: "",
    description: "Zum Ausprobieren",
    features: [
      "3 Erklärungen pro Tag",
      "Alle 3 Schwierigkeitsstufen",
      "Foto-Upload",
    ],
    limitations: ["Keine Kamera-Funktion", "Werbung"],
    cta: "Kostenlos starten",
    href: "/erklaerung",
    highlighted: false,
    gradient: "",
  },
  {
    name: "Schüler",
    price: "5,99",
    period: "/Monat",
    description: "Für regelmäßiges Lernen",
    features: [
      "Unbegrenzte Erklärungen",
      "Alle 3 Schwierigkeitsstufen",
      "Kamera & Foto-Upload",
      "Keine Werbung",
      "Verlauf der letzten 30 Tage",
    ],
    limitations: [],
    cta: "Jetzt starten",
    href: "/erklaerung",
    highlighted: true,
    gradient: "from-primary-500 to-primary-600",
  },
  {
    name: "Familie",
    price: "9,99",
    period: "/Monat",
    description: "Für bis zu 4 Kinder",
    features: [
      "Alles aus Schüler",
      "Bis zu 4 Profile",
      "Eltern-Dashboard",
      "Lern-Statistiken",
      "Unbegrenzter Verlauf",
    ],
    limitations: [],
    cta: "Familie starten",
    href: "/erklaerung",
    highlighted: false,
    gradient: "",
  },
];

export default function PreisePage() {
  return (
    <main className="min-h-dvh pb-24">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-5 pt-10 pb-12 text-center text-white">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Preise</h1>
          <p className="text-xs text-white/70 mt-1">
            Investition in echtes Verständnis
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-6 space-y-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-5 shadow-sm border transition-all ${
              plan.highlighted
                ? "bg-gradient-to-br " +
                  plan.gradient +
                  " text-white border-transparent shadow-lg shadow-primary-500/20 scale-[1.02]"
                : "bg-white border-slate-100"
            }`}
          >
            {plan.highlighted && (
              <div className="inline-block bg-white/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold mb-3">
                Beliebteste Wahl
              </div>
            )}

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-black">{plan.price}€</span>
              {plan.period && (
                <span
                  className={`text-sm ${
                    plan.highlighted ? "text-white/70" : "text-slate-400"
                  }`}
                >
                  {plan.period}
                </span>
              )}
            </div>

            <h3
              className={`font-bold text-sm ${
                plan.highlighted ? "" : "text-slate-800"
              }`}
            >
              {plan.name}
            </h3>
            <p
              className={`text-xs mt-0.5 mb-4 ${
                plan.highlighted ? "text-white/70" : "text-slate-400"
              }`}
            >
              {plan.description}
            </p>

            <ul className="space-y-2 mb-5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-xs">
                  <svg
                    className={`w-4 h-4 flex-shrink-0 ${
                      plan.highlighted ? "text-white" : "text-green-500"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
              {plan.limitations.map((limitation) => (
                <li
                  key={limitation}
                  className={`flex items-center gap-2 text-xs ${
                    plan.highlighted ? "text-white/50" : "text-slate-400"
                  }`}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`block text-center rounded-xl py-2.5 px-4 font-bold text-sm transition-all active:scale-95 ${
                plan.highlighted
                  ? "bg-white text-primary-600 hover:bg-white/90"
                  : "bg-primary-50 text-primary-600 hover:bg-primary-100"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-sm text-slate-800 mb-3">
            Häufige Fragen
          </h3>
          <div className="space-y-3">
            {[
              {
                q: "Gibt die App Lösungen aus?",
                a: "Nein! Die App erklärt nur den Lösungsweg und die Konzepte. Die Lösung musst du selbst erarbeiten.",
              },
              {
                q: "Kann ich jederzeit kündigen?",
                a: "Ja, monatlich kündbar. Keine versteckten Kosten.",
              },
              {
                q: "Welche Fächer werden unterstützt?",
                a: "Mathe, Physik, Chemie, Biologie, Deutsch, Englisch und mehr — alles was man fotografieren kann.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <p className="text-xs font-semibold text-slate-700">{faq.q}</p>
                <p className="text-xs text-slate-500 mt-0.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
