import { useState, useMemo } from "react";
import { apps, categories } from "./data/apps";

// Ring Background
function RingBg({ className, size = 400, opacity = 0.08, style }) {
  return (
    <div className={`absolute pointer-events-none select-none ${className}`} style={style}>
      <img src="/fintutto-animated.svg" alt="" style={{ width: size, height: size, opacity }} draggable={false} />
    </div>
  );
}

const CAT_ICONS = { all:"⬡", finance:"💹", property:"🏠", translation:"🌐", lifestyle:"✨", sales:"📈", admin:"⚙️", ai:"🤖" };
const APP_ICONS = {
  rocket:"🚀", graduation:"🎓", lightbulb:"💡", briefcase:"💼", building:"🏢", wrench:"🔧", key:"🗝️",
  gauge:"📊", languages:"🌐", cloud:"☁️", users:"👥", building2:"🏛️", headphones:"🎧", layout:"📐",
  handshake:"🤝", dumbbell:"💪", leaf:"🌿", luggage:"🧳", trendingUp:"📈", terminal:"⌨️", shield:"🛡️",
  door:"🚪", inbox:"📥", sparkles:"✨", bookOpen:"📖", lifebuoy:"🆘",
};
const CAT_ACCENT = {
  finance:"#10B981", property:"#2563EB", translation:"#8B5CF6",
  lifestyle:"#E879F9", sales:"#F97316", admin:"#94a3b8", ai:"#06B6D4",
};
const CAT_GRADIENT = {
  finance:"from-emerald-500/20 to-teal-600/20", property:"from-blue-500/20 to-cyan-600/20",
  translation:"from-violet-500/20 to-purple-600/20", lifestyle:"from-pink-500/20 to-rose-600/20",
  sales:"from-orange-500/20 to-amber-600/20", admin:"from-slate-500/20 to-gray-600/20",
  ai:"from-cyan-500/20 to-sky-600/20",
};

function FeaturedCard({ app }) {
  const accent = CAT_ACCENT[app.category] || "#E879F9";
  const icon = APP_ICONS[app.icon] || "🔗";
  return (
    <a href={app.url} target="_blank" rel="noopener noreferrer"
      className={`group relative flex flex-col gap-3 rounded-2xl p-5 glass card-glow overflow-hidden`}>
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${CAT_GRADIENT[app.category] || "from-purple-500/10 to-blue-600/10"} opacity-60 transition-opacity group-hover:opacity-100`} />
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-60" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
      <div className="relative z-10 flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>{icon}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm leading-tight">{app.name}</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}33` }}>Featured</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{app.description}</p>
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-1 mt-auto">
        <span className="text-[10px] font-mono" style={{ color: accent }}>{app.url.replace("https://","")}</span>
        <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }}>↗</span>
      </div>
    </a>
  );
}

function AppCard({ app }) {
  const accent = CAT_ACCENT[app.category] || "#E879F9";
  const icon = APP_ICONS[app.icon] || "🔗";
  return (
    <a href={app.url} target="_blank" rel="noopener noreferrer"
      className="group relative flex items-start gap-3 rounded-xl p-4 glass card-glow overflow-hidden">
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${CAT_GRADIENT[app.category] || "from-purple-500/10 to-blue-600/10"} opacity-0 transition-opacity group-hover:opacity-60`} />
      <div className="relative z-10 w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-110"
        style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>{icon}</div>
      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-medium text-white text-sm leading-tight truncate">{app.name}</h3>
          <span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-xs">↗</span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{app.description}</p>
      </div>
    </a>
  );
}

function HighlightCard({ icon, title, subtitle, description, url, accent, badge }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="group relative flex flex-col gap-4 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: `linear-gradient(135deg, ${accent}15 0%, ${accent}08 100%)`, border: `1px solid ${accent}30`, boxShadow: `0 0 40px -15px ${accent}40` }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl"
        style={{ background: accent, transform: "translate(30%,-30%)" }} />
      {badge && (
        <span className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-1 rounded-full"
          style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}33` }}>{badge}</span>
      )}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}>{icon}</div>
        <div>
          <div className="font-bold text-white text-base">{title}</div>
          <div className="text-xs font-medium" style={{ color: accent }}>{subtitle}</div>
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      <div className="flex items-center gap-1 text-xs font-medium mt-auto" style={{ color: accent }}>
        <span>Mehr erfahren</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </a>
  );
}

const STATS = [
  { label: "Cloud Apps", value: apps.length, color: "#2563EB" },
  { label: "Kategorien", value: categories.length, color: "#E879F9" },
  { label: "Automatisiert", value: "100%", color: "#10B981" },
  { label: "Uptime", value: "99.9%", color: "#EAB308" },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredApps = useMemo(() => apps.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (!q || app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q))
      && (activeCategory === "all" || app.category === activeCategory);
  }), [searchQuery, activeCategory]);

  const featuredApps = apps.filter((a) => a.featured);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a0a2e 0%, #0a0a14 60%)" }} />
        <div className="absolute top-[10%] left-[8%] w-[600px] h-[600px] rounded-full" style={{ background:"#2563EB", animation:"pulse-glow 8s ease-in-out infinite", filter:"blur(80px)" }} />
        <div className="absolute top-[40%] right-[5%] w-[500px] h-[500px] rounded-full" style={{ background:"#E879F9", animation:"pulse-glow 10s ease-in-out infinite 2s", filter:"blur(80px)" }} />
        <div className="absolute bottom-[5%] left-[25%] w-[400px] h-[400px] rounded-full" style={{ background:"#10B981", animation:"pulse-glow 12s ease-in-out infinite 4s", filter:"blur(80px)" }} />
        <RingBg className="top-[-80px] right-[-60px]" size={480} opacity={0.07} style={{ animation:"float 22s ease-in-out infinite" }} />
        <RingBg className="bottom-[5%] left-[-80px]" size={380} opacity={0.05} style={{ animation:"float-reverse 28s ease-in-out infinite" }} />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl" style={{ background:"rgba(10,10,20,0.75)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/fintutto-animated.svg" alt="fintutto" className="w-9 h-9" style={{ animation:"spin-slow 20s linear infinite" }} />
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-white tracking-tight">fintutto</span>
                <span className="text-lg font-light" style={{ color:"#E879F9" }}>.cloud</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center flex-1 max-w-sm mx-8">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                <input type="text" placeholder="Apps durchsuchen…" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                <img src="/fintutto-animated.svg" alt="" className="w-4 h-4" /> fintutto.world
              </a>
              <a href="https://translator.fintutto.world" target="_blank" rel="noopener noreferrer"
                className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">Translator</a>
              <a href="https://guide.fintutto.world" target="_blank" rel="noopener noreferrer"
                className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">Guide</a>
              <a href="https://portal.fintutto.cloud" target="_blank" rel="noopener noreferrer"
                className="text-sm px-4 py-1.5 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ background:"linear-gradient(135deg, #E879F9, #8B5CF6)", color:"white" }}>Portal →</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <img src="/fintutto-animated.svg" alt="fintutto" className="w-24 h-24" style={{ animation:"spin-slow 20s linear infinite" }} />
          </div>
          <div className="section-label mb-4">Das App-Universum</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight">
            <span className="text-white">fintutto</span>
            <span className="gradient-text-world">.</span>
            <span className="text-white">cloud</span>
          </h1>
          <h2 className="text-2xl sm:text-3xl font-light text-slate-300 mb-6">
            alles. <span className="gradient-text-world font-semibold">automatisch.</span> ab jetzt.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Von Finanzen über Immobilien bis KI-Tools – fintutto.cloud ist das wachsende Ökosystem smarter Apps.
            Jede App ein Baustein. Zusammen ein Universum.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background:"linear-gradient(135deg, #E879F9, #8B5CF6, #2563EB)" }}>
              <img src="/fintutto-animated.svg" alt="" className="w-5 h-5" /> fintutto.world entdecken
            </a>
            <a href="#apps" className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-300 glass glass-hover transition-all hover:-translate-y-0.5">
              Alle Apps ansehen ↓
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="glass rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flagship: Translator & Guide */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-label mb-3">Flagship-Produkte</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Zwei Welten. <span className="gradient-text-world">Eine Plattform.</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Translator und Guide sind eigenständige Produkte – und gleichzeitig Teil des fintutto.world-Ökosystems.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <HighlightCard icon="🌐" title="Fintutto Translator" subtitle="translator.fintutto.world"
              description="Die weltweit erste Übersetzungsplattform, die auch ohne Internet funktioniert. Live, in Echtzeit, für Gruppen bis 500 Personen, in 130+ Sprachen gleichzeitig."
              url="https://translator.fintutto.world" accent="#8B5CF6" badge="Live" />
            <HighlightCard icon="✨" title="Guide by fintutto" subtitle="guide.fintutto.world"
              description="Art Guide, City Guide, Region Guide – dein digitaler Begleiter. Touren, POIs, Stories auf Knopfdruck. KI-Audio-Guide in 20 Sprachen. Für Museen, Städte und Regionen."
              url="https://guide.fintutto.world" accent="#E879F9" badge="Neu" />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              { label:"🎧 Listener App", url:"https://listener.guidetranslator.com" },
              { label:"🏢 Enterprise", url:"https://enterprise.guidetranslator.com" },
              { label:"👤 Consumer", url:"https://consumer.guidetranslator.com" },
              { label:"📊 Sales Portal", url:"https://app.guidetranslator.com" },
            ].map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                className="glass glass-hover text-xs text-slate-300 hover:text-white px-4 py-2 rounded-full transition-all">{l.label}</a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Apps */}
      <section className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="section-label">Highlights</div>
            <div className="flex-1 h-px" style={{ background:"rgba(255,255,255,0.06)" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredApps.map((app) => <FeaturedCard key={app.url} app={app} />)}
          </div>
        </div>
      </section>

      {/* All Apps */}
      <section id="apps" className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="section-label mb-2">App-Universum</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Alle <span className="gradient-text-world">Apps</span></h2>
            </div>
            <div className="sm:hidden relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              <input type="text" placeholder="Suchen…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setActiveCategory("all")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={activeCategory==="all" ? { background:"rgba(232,121,249,0.12)", border:"1px solid rgba(232,121,249,0.3)", color:"#E879F9" }
                : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8" }}>
              <span>{CAT_ICONS.all}</span> Alle
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={activeCategory===cat.id ? { background:`${CAT_ACCENT[cat.id]}18`, border:`1px solid ${CAT_ACCENT[cat.id]}40`, color:CAT_ACCENT[cat.id] }
                  : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8" }}>
                <span>{CAT_ICONS[cat.id]}</span>
                <span className="hide-mobile">{cat.name}</span>
              </button>
            ))}
          </div>
          {filteredApps.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <div className="text-4xl mb-3">🔍</div>
              <p>Keine Apps gefunden für „{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredApps.map((app) => <AppCard key={app.url} app={app} />)}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 mt-8" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/fintutto-animated.svg" alt="fintutto" className="w-8 h-8" />
                <span className="font-bold text-white">fintutto<span style={{ color:"#E879F9" }}>.cloud</span></span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Das wachsende Ökosystem smarter Apps. Alles automatisch. Ab jetzt.</p>
              <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80" style={{ color:"#E879F9" }}>
                <img src="/fintutto-animated.svg" alt="" className="w-4 h-4" /> fintutto.world →
              </a>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Flagship-Produkte</div>
              <div className="flex flex-col gap-2">
                {[
                  { label:"🌐 Translator", url:"https://translator.fintutto.world" },
                  { label:"✨ Guide", url:"https://guide.fintutto.world" },
                  { label:"🎧 Listener", url:"https://listener.guidetranslator.com" },
                  { label:"🏢 Enterprise", url:"https://enterprise.guidetranslator.com" },
                ].map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-white transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Plattform</div>
              <div className="flex flex-col gap-2">
                {[
                  { label:"🚀 Portal", url:"https://portal.fintutto.cloud" },
                  { label:"⚙️ Admin", url:"https://admin.fintutto.cloud" },
                  { label:"⌨️ Commander", url:"https://commander.fintutto.cloud" },
                  { label:"🏠 Vermietify", url:"https://vermietify.fintutto.cloud" },
                  { label:"💹 Fintutto App", url:"https://app.fintutto.cloud" },
                ].map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-white transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-xs text-slate-600">© 2025 fintutto · <a href="https://fintutto.world" className="hover:text-slate-400 transition-colors">fintutto.world</a></p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-600">Ein Produkt von</span>
              <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity" style={{ color:"#E879F9" }}>
                <img src="/fintutto-animated.svg" alt="" className="w-4 h-4" /> fintutto.world
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
