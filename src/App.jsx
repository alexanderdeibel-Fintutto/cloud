import { useState, useMemo } from "react";
import { apps, categories } from "./data/apps";
import { Icon } from "./components/Icons";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        !searchQuery ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || app.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const featuredApps = apps.filter((app) => app.featured);

  const stats = [
    { label: "Cloud Apps", value: apps.length },
    { label: "Kategorien", value: categories.length },
    { label: "Automatisiert", value: "100%" },
    { label: "Uptime", value: "99.9%" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Full-page warm gradient background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #b84c65 0%, #9a5480 15%, #6b3fa0 30%, #4a2870 45%, #7a3090 55%, #c05878 70%, #d4854a 85%, #daa520 100%)",
            backgroundSize: "400% 400%",
            animation: "gradient-shift 20s ease infinite",
          }}
        />
        {/* Overlay pattern */}
        <div className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at 20% 50%, rgba(106,63,160,0.6) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(212,133,74,0.5) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(194,86,106,0.5) 0%, transparent 50%)"
          }}
        />
      </div>

      {/* Floating signet rings as background decoration */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        <img
          src="/signet.svg"
          alt=""
          className="absolute select-none"
          style={{
            width: 600,
            height: 600,
            top: "-5%",
            left: "-8%",
            opacity: 0.12,
            animation: "float 25s ease-in-out infinite",
          }}
        />
        <img
          src="/signet.svg"
          alt=""
          className="absolute select-none"
          style={{
            width: 500,
            height: 500,
            top: "40%",
            right: "-10%",
            opacity: 0.08,
            animation: "float-reverse 30s ease-in-out infinite",
          }}
        />
        <img
          src="/signet.svg"
          alt=""
          className="absolute select-none"
          style={{
            width: 400,
            height: 400,
            bottom: "-5%",
            left: "25%",
            opacity: 0.1,
            animation: "float 22s ease-in-out infinite 3s",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#6b3fa0]/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/logo-cloud.svg"
                alt="fintutto cloud"
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  fintutto
                </span>
                <span className="text-lg font-light text-amber-300">
                  .cloud
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="hidden sm:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full group">
                <Icon
                  name="search"
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-amber-300 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Apps durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300/30 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            <a
              href="https://app.fintutto.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium transition-all hover:bg-white/25 hover:border-white/30 hover:shadow-lg"
            >
              Dashboard
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Search */}
      <div className="sm:hidden px-4 pt-4">
        <div className="relative w-full">
          <Icon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Apps durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-300/40 transition-all backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Logo with bg-full */}
          <div
            className="relative mx-auto mb-8 w-40 h-40 sm:w-52 sm:h-52"
            style={{ animation: "fade-in-up 0.8s ease-out" }}
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
              <img
                src="/bg-full.svg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <img
              src="/signet.svg"
              alt="fintutto signet"
              className="absolute inset-0 w-full h-full p-4"
              style={{ animation: "pulse-ring 4s ease-in-out infinite" }}
            />
          </div>

          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-tight"
            style={{ animation: "fade-in-up 0.8s ease-out 0.2s both" }}
          >
            alles.
            <br />
            <span className="text-amber-200">automatisch.</span>
            <br />
            ab jetzt.
          </h1>

          <p
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-6 leading-relaxed"
            style={{ animation: "fade-in-up 0.8s ease-out 0.4s both" }}
          >
            fintutto cl(α-Ω)ud – Das App-Universum
          </p>

          <p
            className="text-base text-white/50 max-w-xl mx-auto mb-10"
            style={{ animation: "fade-in-up 0.8s ease-out 0.5s both" }}
          >
            {apps.length} professionelle Cloud-Anwendungen – nahtlos verbunden,
            vollständig automatisiert, immer verfügbar.
          </p>

          {/* Stats */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
            style={{ animation: "fade-in-up 0.8s ease-out 0.6s both" }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="px-6 py-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all"
              >
                <div className="text-3xl sm:text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/50 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Featured Apps */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold text-amber-300/80 uppercase tracking-widest mb-6">
            Empfohlene Apps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {featuredApps.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1"
              >
                {/* Glass card with warm border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/40 via-pink-400/30 to-purple-500/40 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-[1px] rounded-[15px] bg-[#3a1860]/80 backdrop-blur-xl" />
                {/* Content */}
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-3">
                    <Icon name={app.icon} size={22} className="text-amber-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-200 transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-sm text-white/50 line-clamp-2">
                    {app.description}
                  </p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon
                    name="externalLink"
                    size={16}
                    className="text-amber-300"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeCategory === "all"
                  ? "bg-white/20 text-white shadow-lg border border-white/25"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              Alle ({apps.length})
            </button>
            {categories.map((cat) => {
              const count = apps.filter(
                (app) => app.category === cat.id
              ).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-white/20 text-white shadow-lg border border-white/25"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  <Icon name={cat.icon} size={16} />
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="py-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredApps.length === 0 ? (
            <div className="text-center py-20">
              <Icon
                name="search"
                size={48}
                className="text-white/20 mx-auto mb-4"
              />
              <p className="text-white/50 text-lg">
                Keine Apps gefunden für &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl bg-white/8 backdrop-blur-sm border border-white/10 p-5 transition-all duration-300 hover:bg-white/15 hover:border-white/25 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-xl transition-shadow`}
                    >
                      <Icon
                        name={app.icon}
                        size={24}
                        className="text-white"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-white truncate group-hover:text-amber-200 transition-colors">
                          {app.name}
                        </h3>
                        <Icon
                          name="externalLink"
                          size={14}
                          className="text-white/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                      </div>
                      <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
                        {app.description}
                      </p>
                      <div className="mt-3">
                        <span className="inline-flex items-center text-xs text-white/30 font-mono">
                          {app.url.replace("https://", "")}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero image in footer */}
          <div className="flex justify-center mb-8">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 relative">
              <img
                src="/bg-full.svg"
                alt="fintutto cloud"
                className="w-full h-full object-cover"
              />
              <img
                src="/signet.svg"
                alt=""
                className="absolute inset-0 w-full h-full p-8"
                style={{ animation: "pulse-ring 5s ease-in-out infinite" }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <img
                src="/logo-cloud.svg"
                alt="fintutto"
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-lg text-white/80 font-medium">
                fintutto cl(α-Ω)ud
              </span>
            </div>
            <p className="text-sm text-white/40">
              Ein Projekt – mit Leidenschaft & Herzblut entwickelt von Alexander Deibel
            </p>
            <div className="flex items-center gap-6 mt-2">
              <a
                href="https://admin.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/40 hover:text-amber-300 transition-colors"
              >
                Admin
              </a>
              <a
                href="https://commander.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/40 hover:text-amber-300 transition-colors"
              >
                Commander
              </a>
              <a
                href="https://portal.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/40 hover:text-amber-300 transition-colors"
              >
                Portal
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
