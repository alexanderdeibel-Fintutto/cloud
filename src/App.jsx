import { useState, useEffect, useRef, useMemo } from "react";
import { apps, categories } from "./data/apps";

/* ═══════════════════════════════════════════════════════════
   FINTUTTO DESIGN SYSTEM — Cloud Landing Page
   Basiert auf: docs/DESIGN_SYSTEM.md + DESIGN_SYSTEM_CATALOG.md
   ═══════════════════════════════════════════════════════════ */

// Fade-In Hook (Intersection Observer — wie fintutto.world)
function useFadeIn(delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      willChange: visible ? "auto" : "opacity, transform",
    },
  };
}

// Icon Map (Emoji-Fallbacks)
const ICONS = {
  rocket: "🚀", graduation: "🎓", lightbulb: "💡", briefcase: "💼",
  building: "🏢", wrench: "🔧", key: "🗝️", gauge: "📊", languages: "🌐",
  cloud: "☁️", users: "👥", building2: "🏛️", headphones: "🎧", layout: "📐",
  handshake: "🤝", dumbbell: "💪", leaf: "🌿", luggage: "🧳",
  trendingUp: "📈", terminal: "⌨️", shield: "🛡️", door: "🚪",
  inbox: "📥", sparkles: "✨", bookOpen: "📖", lifebuoy: "🆘", chart: "📊",
  home: "🏠", globe: "🌍", heart: "❤️", megaphone: "📣", settings: "⚙️", brain: "🧠",
};

// Kategorie-Akzentfarben (aus Design-System)
const CAT_ACCENT = {
  finance:     { color: "#34d399", glow: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.3)"  },
  property:    { color: "#38bdf8", glow: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.3)"  },
  translation: { color: "#a78bfa", glow: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.3)" },
  lifestyle:   { color: "#e879f9", glow: "rgba(232,121,249,0.15)", border: "rgba(232,121,249,0.3)" },
  sales:       { color: "#fb923c", glow: "rgba(251,146,60,0.15)",  border: "rgba(251,146,60,0.3)"  },
  admin:       { color: "#94a3b8", glow: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.3)" },
  ai:          { color: "#38bdf8", glow: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.3)"  },
};

/* ── App Card (glass-card + Hover) ── */
function AppCard({ app, delay }) {
  const { ref, style } = useFadeIn(delay);
  const icon = ICONS[app.icon] || "🔗";
  const accent = CAT_ACCENT[app.category] || CAT_ACCENT.admin;

  return (
    <div ref={ref} style={style}>
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-card p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:bg-black/50 hover:border-white/30"
        style={{ display: "flex" }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
          style={{ background: accent.glow, border: `1px solid ${accent.border}` }}
        >
          {icon}
        </div>

        {/* Name */}
        <h3 className="text-base font-bold text-white mb-1">{app.name}</h3>

        {/* Beschreibung */}
        <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.6)" }}>
          {app.description}
        </p>

        {/* CTA */}
        <div
          className="flex items-center gap-1.5 mt-4 text-sm font-semibold"
          style={{ color: accent.color }}
        >
          <span>Öffnen</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </div>
      </a>
    </div>
  );
}

/* ── Flagship Card (Translator / Guide) ── */
function FlagshipCard({ title, subtitle, badge, accent, links, delay }) {
  const { ref, style } = useFadeIn(delay);
  return (
    <div ref={ref} style={style}>
      <div
        className="glass-card p-8 h-full"
        style={{ borderColor: accent + "40" }}
      >
        {/* Gradient-Leiste oben */}
        <div
          className="w-full h-1 rounded-full mb-6"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />

        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: accent }}
        >
          {badge}
        </span>

        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-base leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          {subtitle}
        </p>

        {/* Sub-Links */}
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: accent + "22",
                border: `1px solid ${accent}44`,
                color: accent,
              }}
            >
              {l.label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Haupt-App-Komponente ── */
export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll-Listener für Navigation
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Gefilterte Apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchCat = activeCategory === "all" || app.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  const featuredApps = useMemo(() => apps.filter((a) => a.featured), []);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", color: "#fff" }}>

      {/* ── Vollbild-Hintergrund (exakt wie fintutto.world) ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <img
          src="/fintutto-logo.svg"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7, willChange: "auto", transform: "translateZ(0px)" }}
        />
      </div>

      {/* ── Navigation (Apple-Style, wie LandingLayout.tsx) ── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          transition: "all 0.3s",
          background: navScrolled ? "rgba(10,5,20,0.88)" : "transparent",
          backdropFilter: navScrolled ? "blur(40px) saturate(180%)" : "none",
          WebkitBackdropFilter: navScrolled ? "blur(40px) saturate(180%)" : "none",
          borderBottom: navScrolled ? "1px solid rgba(255,255,255,0.10)" : "none",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <img src="/fintutto-logo.svg" alt="fintutto" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
            <span style={{ fontWeight: 700, fontSize: "1.1rem", background: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              fintutto.cloud
            </span>
          </a>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }} className="hidden md:flex">
            <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
            >fintutto.world</a>
            <a href="https://fintutto.world/apps/translator" target="_blank" rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
            >Translator</a>
            <a href="https://fintutto.world/guide" target="_blank" rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
            >Guide</a>
            <a href="https://portal.fintutto.cloud" target="_blank" rel="noopener noreferrer"
              style={{ padding: "0.5rem 1.25rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 600, color: "#000", background: "linear-gradient(135deg, #a78bfa, #38bdf8)", textDecoration: "none", transition: "opacity 0.2s" }}
              onMouseEnter={e => e.target.style.opacity = "0.85"}
              onMouseLeave={e => e.target.style.opacity = "1"}
            >Portal →</a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: "none", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.5rem" }}
            className="md:hidden"
            aria-label="Menü"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ background: "rgba(8,4,20,0.96)", backdropFilter: "blur(40px)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem" }}>
            {[
              { label: "fintutto.world", url: "https://fintutto.world" },
              { label: "Translator", url: "https://fintutto.world/apps/translator" },
              { label: "Guide", url: "https://fintutto.world/guide" },
              { label: "Portal", url: "https://portal.fintutto.cloud" },
            ].map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", padding: "0.75rem 0", color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "1rem", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >{l.label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8rem 1.5rem 4rem", overflow: "hidden", zIndex: 1 }}>

        {/* Ambient Glow */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />
        </div>

        {/* Badge */}
        <div style={{ animation: "fadeInUp 0.5s ease 0.05s both" }}>
          <span className="glass-card" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", animation: "pulse-glow 2s ease-in-out infinite" }} />
            Alle Apps · Ein Ökosystem
          </span>
        </div>

        {/* H1 */}
        <div style={{ animation: "fadeInUp 0.6s ease 0.15s both" }}>
          <h1 style={{ fontSize: "clamp(3rem, 10vw, 6rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "1.5rem" }}>
            <span style={{ color: "#fff" }}>fintutto</span>
            <span className="gradient-text-primary">.</span>
            <span style={{ background: "linear-gradient(135deg, #38bdf8, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>cloud</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div style={{ animation: "fadeInUp 0.6s ease 0.3s both" }}>
          <p style={{ fontSize: "clamp(1.1rem, 3vw, 1.4rem)", color: "rgba(255,255,255,0.75)", maxWidth: "600px", lineHeight: 1.6, marginBottom: "2.5rem" }}>
            Die zentrale Plattform für alle fintutto-Apps – von Finanzen über Immobilien bis zu KI-gestützten Übersetzungen.
          </p>
        </div>

        {/* CTAs */}
        <div style={{ animation: "fadeInUp 0.6s ease 0.45s both", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "4rem" }}>
          <a href="#apps"
            style={{ padding: "1rem 2rem", borderRadius: "9999px", fontWeight: 600, fontSize: "1rem", color: "#000", background: "linear-gradient(135deg, #a78bfa, #38bdf8)", textDecoration: "none", transition: "transform 0.2s, opacity 0.2s" }}
            onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          >
            Alle Apps entdecken →
          </a>
          <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer"
            className="glass-card"
            style={{ padding: "1rem 2rem", borderRadius: "9999px", fontWeight: 600, fontSize: "1rem", color: "#fff", textDecoration: "none", transition: "transform 0.2s, background 0.2s" }}
            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.12)"}
            onMouseLeave={e => e.target.style.background = "rgba(0,0,0,0.38)"}
          >
            fintutto.world →
          </a>
        </div>

        {/* Stats */}
        <div style={{ animation: "fadeInUp 0.6s ease 0.6s both", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", maxWidth: "480px", width: "100%" }}>
          {[
            { value: "26+", label: "Apps" },
            { value: "7",   label: "Kategorien" },
            { value: "100%", label: "Cloud-native" },
            { value: "99.9%", label: "Uptime" },
          ].map((s) => (
            <div key={s.label} className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, background: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.25rem" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Hint */}
        <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", animation: "bounce-y 2s infinite" }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "1.5rem" }}>↓</span>
        </div>
      </section>

      {/* ── Flagship-Produkte: Translator & Guide ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "6rem 1.5rem", background: "rgba(0,0,0,0.42)", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

          {/* Section Header */}
          {(() => { const f = useFadeIn(0); return (
            <div ref={f.ref} style={{ ...f.style, textAlign: "center", marginBottom: "4rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#a78bfa", display: "block", marginBottom: "1rem" }}>
                Flagship-Produkte
              </span>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
                Translator &amp; <span style={{ background: "linear-gradient(135deg, #38bdf8, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Guide</span>
              </h2>
              <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.65)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.6 }}>
                Unsere beiden Hauptprodukte – eigenständig, mächtig und direkt auf fintutto.world verlinkt.
              </p>
            </div>
          ); })()}

          {/* Flagship Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            <FlagshipCard
              title="fintutto Translator"
              subtitle="Professionelle KI-gestützte Übersetzungen für Unternehmen und Privatpersonen. Echtzeit-Übersetzung, Enterprise-Lösungen und Consumer-Apps in einem Ökosystem."
              badge="Flagship-Produkt"
              accent="#a78bfa"
              delay={0}
              links={[
                { label: "Listener",      url: "https://fintutto.world/apps/live" },
                { label: "Enterprise",    url: "https://fintutto.world/apps/enterprise" },
                { label: "Consumer",      url: "https://fintutto.world/apps/translator" },
                { label: "Sales Portal",  url: "https://fintutto.world/apps/translator" },
              ]}
            />
            <FlagshipCard
              title="fintutto Guide"
              subtitle="Der smarte Audio-Guide für Museen, Städte, Kreuzfahrten und mehr. KI-gestützt, mehrsprachig und ohne Hardware."
              badge="Flagship-Produkt"
              accent="#38bdf8"
              delay={100}
              links={[
                { label: "Art Guide",     url: "https://fintutto.world/products/artguide" },
                { label: "City Guide",    url: "https://fintutto.world/products/cityguide" },
                { label: "Region Guide",  url: "https://fintutto.world/products/regionguide" },
                { label: "Kreuzfahrt",    url: "https://fintutto.world/solutions/cruise" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Featured Apps ── */}
      {featuredApps.length > 0 && (
        <section style={{ position: "relative", zIndex: 1, padding: "6rem 1.5rem", background: "rgba(0,0,0,0.52)", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

            {(() => { const f = useFadeIn(0); return (
              <div ref={f.ref} style={{ ...f.style, textAlign: "center", marginBottom: "3rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#34d399", display: "block", marginBottom: "1rem" }}>
                  Highlights
                </span>
                <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 700, color: "#fff" }}>
                  Featured Apps
                </h2>
              </div>
            ); })()}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
              {featuredApps.map((app, i) => (
                <AppCard key={app.name} app={app} delay={i * 80} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── App-Universum ── */}
      <section id="apps" style={{ position: "relative", zIndex: 1, padding: "6rem 1.5rem", background: "rgba(0,0,0,0.42)", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

          {(() => { const f = useFadeIn(0); return (
            <div ref={f.ref} style={{ ...f.style, textAlign: "center", marginBottom: "3rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#fb923c", display: "block", marginBottom: "1rem" }}>
                Das Ökosystem
              </span>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
                Alle Apps im Überblick
              </h2>
              <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.55)", maxWidth: "480px", margin: "0 auto" }}>
                {apps.length} Apps in {categories.length} Kategorien – alles aus einem Ökosystem.
              </p>
            </div>
          ); })()}

          {/* Suche + Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem", alignItems: "center" }}>

            {/* Suchfeld */}
            <div style={{ position: "relative", width: "100%", maxWidth: "480px" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: "1rem" }}>🔍</span>
              <input
                type="text"
                placeholder="App suchen…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-card"
                style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem", borderRadius: "9999px", color: "#fff", fontSize: "0.95rem", outline: "none", background: "rgba(0,0,0,0.38)" }}
              />
            </div>

            {/* Kategorie-Filter */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
              <button
                onClick={() => setActiveCategory("all")}
                style={{
                  padding: "0.4rem 1rem", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  background: activeCategory === "all" ? "linear-gradient(135deg, #a78bfa, #38bdf8)" : "rgba(0,0,0,0.38)",
                  color: activeCategory === "all" ? "#000" : "rgba(255,255,255,0.6)",
                  border: activeCategory === "all" ? "none" : "1px solid rgba(255,255,255,0.18)",
                }}
              >
                Alle
              </button>
              {categories.map((cat) => {
                const accent = CAT_ACCENT[cat.id] || CAT_ACCENT.admin;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      padding: "0.4rem 1rem", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                      background: isActive ? accent.glow : "rgba(0,0,0,0.38)",
                      color: isActive ? accent.color : "rgba(255,255,255,0.6)",
                      border: isActive ? `1px solid ${accent.border}` : "1px solid rgba(255,255,255,0.18)",
                    }}
                  >
                    {ICONS[cat.icon] || "•"} {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* App Grid */}
          {filteredApps.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
              {filteredApps.map((app, i) => (
                <AppCard key={app.name} app={app} delay={i * 40} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <p>Keine Apps gefunden für „{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA-Sektion ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "6rem 1.5rem", background: "rgba(0,0,0,0.70)", borderTop: "1px solid rgba(255,255,255,0.10)", textAlign: "center" }}>
        {(() => { const f = useFadeIn(0); return (
          <div ref={f.ref} style={{ ...f.style, maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              Bereit für das <span className="gradient-text-primary">fintutto-Ökosystem</span>?
            </h2>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.65)", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              Alle Apps. Eine Plattform. Vollständig in der Cloud.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
              <a href="https://portal.fintutto.cloud" target="_blank" rel="noopener noreferrer"
                style={{ padding: "1rem 2rem", borderRadius: "9999px", fontWeight: 600, fontSize: "1rem", color: "#000", background: "linear-gradient(135deg, #a78bfa, #38bdf8)", textDecoration: "none" }}
              >Portal öffnen →</a>
              <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer"
                className="glass-card"
                style={{ padding: "1rem 2rem", borderRadius: "9999px", fontWeight: 600, fontSize: "1rem", color: "#fff", textDecoration: "none" }}
              >fintutto.world →</a>
            </div>
          </div>
        ); })()}
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: "relative", zIndex: 1, padding: "3rem 1.5rem", background: "rgba(0,0,0,0.80)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <img src="/fintutto-logo.svg" alt="fintutto" style={{ width: "28px", height: "28px", borderRadius: "6px" }} />
              <span style={{ fontWeight: 700, background: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                fintutto.cloud
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              Die zentrale Cloud-Plattform für alle fintutto-Apps und Services.
            </p>
          </div>

          {/* Flagship */}
          <div>
            <h4 style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>
              Flagship-Produkte
            </h4>
            {[
              { label: "fintutto Translator", url: "https://fintutto.world/apps/translator" },
              { label: "fintutto Guide",      url: "https://fintutto.world/guide" },
              { label: "Art Guide",           url: "https://fintutto.world/products/artguide" },
              { label: "City Guide",          url: "https://fintutto.world/products/cityguide" },
            ].map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: "0.5rem", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
              >{l.label}</a>
            ))}
          </div>

          {/* Plattform */}
          <div>
            <h4 style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>
              Plattform
            </h4>
            {[
              { label: "fintutto.world",  url: "https://fintutto.world" },
              { label: "Portal",          url: "https://portal.fintutto.cloud" },
              { label: "Commander",       url: "https://commander.fintutto.cloud" },
              { label: "Admin",           url: "https://admin.fintutto.cloud" },
            ].map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: "0.5rem", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
              >{l.label}</a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{ maxWidth: "1280px", margin: "2rem auto 0", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
            © 2026 fintutto.cloud — Teil des fintutto-Ökosystems
          </span>
          <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.7)"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}
          >fintutto.world →</a>
        </div>
      </footer>

    </div>
  );
}
