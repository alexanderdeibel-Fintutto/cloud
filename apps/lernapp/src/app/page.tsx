import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function Home() {
  return (
    <main className="min-h-dvh pb-20">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-lg mx-auto px-5 pt-14 pb-12 text-center text-white">
          <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 mb-5">
            <span className="text-xs font-medium">Fintutto</span>
            <span className="text-[10px] opacity-70">|</span>
            <span className="text-xs opacity-90">Lern-App</span>
          </div>

          <h1 className="text-3xl font-black leading-tight mb-3">
            Ich erklär&apos;s dir
            <br />
            <span className="text-accent-300">einfach.</span>
          </h1>

          <p className="text-sm text-white/80 leading-relaxed max-w-xs mx-auto mb-8">
            Fotografiere deine Aufgabe und bekomme sie so erklärt, dass du sie
            wirklich verstehst. Keine Lösungen — nur Verständnis.
          </p>

          <Link
            href="/erklaerung"
            className="inline-flex items-center gap-2 bg-white text-primary-700 rounded-2xl py-3.5 px-8 font-bold text-sm hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-black/10"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
              />
            </svg>
            Aufgabe fotografieren
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-lg mx-auto px-5 py-10">
        <h2 className="text-lg font-bold text-slate-800 text-center mb-6">
          So einfach geht&apos;s
        </h2>

        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Fotografieren",
              desc: "Mach ein Foto von deiner Aufgabe aus dem Schulbuch oder Arbeitsblatt.",
              gradient: "from-primary-400 to-primary-500",
            },
            {
              step: "2",
              title: "Schwierigkeit wählen",
              desc: "Wähle, wie einfach die Erklärung sein soll — von leicht bis kinderleicht.",
              gradient: "from-purple-400 to-purple-500",
            },
            {
              step: "3",
              title: "Verstehen",
              desc: "Bekomme eine verständliche Erklärung. Keine Lösung, sondern echtes Verständnis.",
              gradient: "from-accent-400 to-accent-500",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}
              >
                {item.step}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-lg mx-auto px-5 pb-10">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-bold mb-4">Warum diese App?</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: "🎓",
                title: "Schulkonform",
                desc: "Keine Lösungen, nur Erklärungen",
              },
              {
                icon: "⚡",
                title: "Sofort",
                desc: "Erklärung in Sekunden",
              },
              {
                icon: "🧠",
                title: "3 Level",
                desc: "Von leicht bis kinderleicht",
              },
              {
                icon: "📱",
                title: "Mobile-first",
                desc: "Optimiert fürs Handy",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white/10 rounded-xl p-3 backdrop-blur-sm"
              >
                <span className="text-xl">{feature.icon}</span>
                <h3 className="text-xs font-bold mt-1.5">{feature.title}</h3>
                <p className="text-[10px] text-white/60 mt-0.5">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-lg mx-auto px-5 pb-8">
        <div className="bg-gradient-to-br from-accent-400 to-accent-500 rounded-2xl p-6 text-center text-white">
          <p className="text-2xl mb-1">📸</p>
          <h2 className="text-lg font-bold mb-2">Bereit?</h2>
          <p className="text-xs text-white/80 mb-4">
            Mach ein Foto und verstehe deine Aufgabe in Sekunden.
          </p>
          <Link
            href="/erklaerung"
            className="inline-block bg-white text-accent-600 rounded-xl py-2.5 px-6 font-bold text-sm hover:bg-white/90 active:scale-95 transition-all"
          >
            Jetzt starten
          </Link>
        </div>
      </section>
    </main>
  );
}
