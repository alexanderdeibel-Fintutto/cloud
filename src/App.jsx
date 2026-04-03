import { useState, useEffect, useRef, useMemo } from "react";
import { apps, categories } from "./data/apps";

// ─── Fly-in Animation Hook (wie fintutto.world) ───────────────────────────────
function useFadeIn(delay) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(function () {
    var el = ref.current;
    if (!el) return;
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return function () { obs.disconnect(); };
  }, []);
  return [ref, {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px)" : "translateY(24px)",
    transition: "opacity 0.55s " + (delay || 0) + "ms, transform 0.55s " + (delay || 0) + "ms",
  }];
}

// ─── Icon Map ─────────────────────────────────────────────────────────────────
var ICONS = {
  rocket: "🚀", graduation: "🎓", lightbulb: "💡", briefcase: "💼",
  building: "🏢", wrench: "🔧", key: "🗝️", gauge: "📊", languages: "🌐",
  cloud: "☁️", users: "👥", building2: "🏛️", headphones: "🎧", layout: "📐",
  handshake: "🤝", dumbbell: "💪", leaf: "🌿", luggage: "🧳",
  trendingUp: "📈", terminal: "⌨️", shield: "🛡️", door: "🚪",
  inbox: "📥", sparkles: "✨", bookOpen: "📖", lifebuoy: "🆘", chart: "📊",
};

// ─── Category Colors ──────────────────────────────────────────────────────────
var CAT_COLOR = {
  finance: "#10B981", property: "#38bdf8", translation: "#a78bfa",
  lifestyle: "#e879f9", sales: "#fb923c", admin: "#94a3b8", ai: "#34d399",
};

// ─── Glassmorphism App Card ───────────────────────────────────────────────────
function AppCard(props) {
  var app = props.app;
  var delay = props.delay || 0;
  var fadeResult = useFadeIn(delay);
  var ref = fadeResult[0];
  var style = fadeResult[1];
  var icon = ICONS[app.icon] || "🔗";
  var accent = CAT_COLOR[app.category] || "#a78bfa";
  return (
    <div ref={ref} style={style}>
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col h-full p-5 rounded-2xl border border-white/8 hover:border-white/22 transition-all duration-300 hover:-translate-y-1"
        style={{ backgroundColor: "rgba(0,0,0,0.38)", backdropFilter: "blur(12px)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
          style={{ backgroundColor: accent + "22", border: "1px solid " + accent + "44" }}
        >
          {icon}
        </div>
        <div className="text-base font-bold text-white mb-1">{app.name}</div>
        <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          {app.description}
        </p>
        <div className="flex items-center gap-1.5 mt-4 text-sm font-semibold" style={{ color: accent }}>
          <span>Öffnen</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </div>
      </a>
    </div>
  );
}

// ─── Flagship Card (Translator / Guide) ──────────────────────────────────────
function FlagshipCard(props) {
  var fadeResult = useFadeIn(props.delay || 0);
  var ref = fadeResult[0];
  var style = fadeResult[1];
  return (
    <div ref={ref} style={style}>
      <div
        className="relative overflow-hidden rounded-3xl p-8 h-full"
        style={{
          backgroundColor: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10 rounded-3xl"
          style={{ background: "linear-gradient(135deg, " + props.accent + ", transparent)" }}
        />
        <div className="relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
            style={{ backgroundColor: props.accent + "22", border: "1px solid " + props.accent + "55" }}
          >
            {props.icon}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ backgroundColor: props.accent + "22", color: props.accent }}>
            Flagship-Produkt
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{props.title}</h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
            {props.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {props.links && props.links.map(function (link) {
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: props.accent + "22", color: props.accent, border: "1px solid " + props.accent + "44" }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
          <a
            href={props.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "linear-gradient(135deg, " + props.accent + ", " + props.accent + "cc)" }}
          >
            {props.cta} →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader(props) {
  var fadeResult = useFadeIn(0);
  var ref = fadeResult[0];
  var style = fadeResult[1];
  return (
    <div ref={ref} style={style} className="text-center mb-12">
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6"
        style={{ backgroundColor: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#38bdf8" }} />
        {props.label}
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
        {props.title}{" "}
        <span style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          {props.highlight}
        </span>
      </h2>
      {props.sub && (
        <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
          {props.sub}
        </p>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  var searchState = useState("");
  var searchQuery = searchState[0];
  var setSearchQuery = searchState[1];

  var catState = useState("all");
  var activeCategory = catState[0];
  var setActiveCategory = catState[1];

  var navState = useState(false);
  var navScrolled = navState[0];
  var setNavScrolled = navState[1];

  useEffect(function () {
    function handler() { setNavScrolled(window.scrollY > 20); }
    window.addEventListener("scroll", handler, { passive: true });
    return function () { window.removeEventListener("scroll", handler); };
  }, []);

  var filteredApps = useMemo(function () {
    var q = searchQuery.toLowerCase();
    return apps.filter(function (app) {
      var matchSearch = !q || app.name.toLowerCase().indexOf(q) > -1 || app.description.toLowerCase().indexOf(q) > -1;
      var matchCat = activeCategory === "all" || app.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, activeCategory]);

  var featuredApps = useMemo(function () {
    return apps.filter(function (a) { return a.featured; });
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#0a0514" }}>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/fintutto-logo.svg"
          alt=""
          className="absolute opacity-5"
          style={{ width: "120vw", maxWidth: "none", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />
        <div
          className="absolute rounded-full"
          style={{ width: "600px", height: "600px", top: "-200px", left: "-200px", background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)", animation: "pulse 8s ease-in-out infinite" }}
        />
        <div
          className="absolute rounded-full"
          style={{ width: "500px", height: "500px", bottom: "-150px", right: "-150px", background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)", animation: "pulse 10s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute rounded-full"
          style={{ width: "400px", height: "400px", top: "40%", right: "20%", background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)", animation: "pulse 12s ease-in-out infinite 4s" }}
        />
      </div>

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ backgroundColor: navScrolled ? "rgba(10,5,20,0.96)" : "transparent", backdropFilter: navScrolled ? "blur(20px)" : "none", borderBottom: navScrolled ? "1px solid rgba(255,255,255,0.08)" : "none" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/fintutto-animated.svg" alt="fintutto" className="w-8 h-8" style={{ animation: "spin 20s linear infinite" }} />
            <span className="font-bold text-lg" style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              fintutto.cloud
            </span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>fintutto.world</a>
            <a href="https://translator.fintutto.world" target="_blank" rel="noopener noreferrer" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Translator</a>
            <a href="https://guide.fintutto.world" target="_blank" rel="noopener noreferrer" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Guide</a>
            <a href="https://portal.fintutto.cloud" target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #a78bfa, #38bdf8)" }}>
              Portal
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <img
              src="/fintutto-animated.svg"
              alt="fintutto"
              className="w-24 h-24 sm:w-32 sm:h-32"
              style={{ animation: "spin 20s linear infinite", filter: "drop-shadow(0 0 40px rgba(139,92,246,0.5))" }}
            />
          </div>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest mb-8"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Alle Apps · Ein Ökosystem
          </div>
          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
            <span style={{ backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #38bdf8 50%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              fintutto.cloud
            </span>
          </h1>
          <p className="text-xl sm:text-2xl font-light mb-4 text-white">
            Alles automatisch. Ab jetzt.
          </p>
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Die zentrale Plattform für alle fintutto-Apps – von Finanzen über Immobilien bis zu KI-gestützten Übersetzungen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#apps"
              className="px-8 py-4 rounded-full text-base font-bold text-black transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)" }}
            >
              Alle Apps entdecken →
            </a>
            <a
              href="https://fintutto.world"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full text-base font-semibold text-white transition-all hover:border-white/30"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              fintutto.world →
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { value: apps.length + "+", label: "Apps" },
              { value: categories.length, label: "Kategorien" },
              { value: "100%", label: "Cloud-native" },
              { value: "99.9%", label: "Uptime" },
            ].map(function (stat) {
              return (
                <div
                  key={stat.label}
                  className="p-4 rounded-2xl text-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="text-2xl font-black mb-1" style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flagship Products */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="Flagship-Produkte"
            title="Translator &"
            highlight="Guide"
            sub="Unsere beiden Hauptprodukte – eigenständig, mächtig und direkt auf fintutto.world verlinkt."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FlagshipCard
              icon="🌐"
              title="fintutto Translator"
              subtitle="Übersetzen mit KI"
              description="Professionelle KI-gestützte Übersetzungen für Unternehmen und Privatpersonen. Echtzeit-Übersetzung, Enterprise-Lösungen und Consumer-Apps in einem Ökosystem."
              url="https://translator.fintutto.world"
              cta="Translator öffnen"
              accent="#a78bfa"
              delay={0}
              links={[
                { label: "Listener", url: "https://listener.guidetranslator.com" },
                { label: "Enterprise", url: "https://translator.enterprise" },
                { label: "Consumer", url: "https://consumer.guidetranslator.com" },
                { label: "Sales Portal", url: "https://sales.guidetranslator.com" },
              ]}
            />
            <FlagshipCard
              icon="📖"
              title="fintutto Guide"
              subtitle="KI-Assistent"
              description="Dein intelligenter KI-Guide für alle Fragen rund um Finanzen, Immobilien und Alltag. Personalisierte Antworten, Schritt-für-Schritt-Anleitungen und smarte Empfehlungen."
              url="https://guide.fintutto.world"
              cta="Guide öffnen"
              accent="#34d399"
              delay={100}
              links={[
                { label: "AI Guide", url: "https://ai-guide.fintutto.cloud" },
                { label: "Finance Coach", url: "https://finance-coach.fintutto.cloud" },
                { label: "Finance Mentor", url: "https://finance-mentor.fintutto.cloud" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Featured Apps */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="Highlights"
            title="Featured"
            highlight="Apps"
            sub="Die beliebtesten und meistgenutzten Apps aus dem fintutto-Ökosystem."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredApps.map(function (app, i) {
              return <AppCard key={app.name} app={app} delay={i * 80} />;
            })}
          </div>
        </div>
      </section>

      {/* All Apps */}
      <section id="apps" className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="App-Universum"
            title="Alle"
            highlight="Apps"
            sub={"Durchsuche alle " + apps.length + " Apps aus " + categories.length + " Kategorien."}
          />

          {/* Search */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: "rgba(255,255,255,0.4)" }}>🔍</span>
              <input
                type="text"
                placeholder="Apps durchsuchen..."
                value={searchQuery}
                onChange={function (e) { setSearchQuery(e.target.value); }}
                className="w-full pl-12 pr-4 py-3 rounded-2xl text-white placeholder-white/30 outline-none transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={function () { setActiveCategory("all"); }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeCategory === "all" ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.05)",
                border: activeCategory === "all" ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.1)",
                color: activeCategory === "all" ? "#a78bfa" : "rgba(255,255,255,0.6)",
              }}
            >
              Alle ({apps.length})
            </button>
            {categories.map(function (cat) {
              var count = apps.filter(function (a) { return a.category === cat.id; }).length;
              var accent = CAT_COLOR[cat.id] || "#a78bfa";
              var isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={function () { setActiveCategory(cat.id); }}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: isActive ? accent + "25" : "rgba(255,255,255,0.05)",
                    border: isActive ? "1px solid " + accent + "55" : "1px solid rgba(255,255,255,0.1)",
                    color: isActive ? accent : "rgba(255,255,255,0.6)",
                  }}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Apps Grid */}
          {filteredApps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredApps.map(function (app, i) {
                return <AppCard key={app.name} app={app} delay={i * 40} />;
              })}
            </div>
          ) : (
            <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.4)" }}>
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg">Keine Apps gefunden für "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest mb-8"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Bereit loslegen
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Bereit für dein{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              App-Universum?
            </span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>
            Kostenlos starten. Keine Kreditkarte. Sofort einsatzbereit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://fintutto.world"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full text-base font-bold text-black transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)" }}
            >
              fintutto.world entdecken →
            </a>
            <a
              href="https://translator.fintutto.world"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full text-base font-semibold text-white transition-all"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Translator testen →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/fintutto-animated.svg" alt="fintutto" className="w-8 h-8" />
                <span className="font-bold" style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  fintutto.cloud
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                Die zentrale Plattform für alle fintutto-Apps. Automatisiert, vernetzt, zukunftssicher.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Flagship-Produkte</h4>
              <div className="flex flex-col gap-2">
                {[
                  { label: "fintutto Translator", url: "https://translator.fintutto.world" },
                  { label: "fintutto Guide", url: "https://guide.fintutto.world" },
                  { label: "Translator Enterprise", url: "https://translator.enterprise" },
                  { label: "Consumer App", url: "https://consumer.guidetranslator.com" },
                ].map(function (link) {
                  return (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Plattform</h4>
              <div className="flex flex-col gap-2">
                {[
                  { label: "fintutto.world", url: "https://fintutto.world" },
                  { label: "Portal", url: "https://portal.fintutto.cloud" },
                  { label: "Commander", url: "https://commander.fintutto.cloud" },
                  { label: "Admin Panel", url: "https://admin.fintutto.cloud" },
                ].map(function (link) {
                  return (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "2rem" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} fintutto.cloud · Ein Produkt von fintutto.world
            </p>
            <div className="flex items-center gap-6">
              <a href="https://fintutto.world/impressum" target="_blank" rel="noopener noreferrer"
                className="text-xs transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.25)" }}>
                Impressum
              </a>
              <a href="https://fintutto.world/datenschutz" target="_blank" rel="noopener noreferrer"
                className="text-xs transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.25)" }}>
                Datenschutz
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
