import { useState, useMemo } from "react";
import { apps, categories } from "./data/apps";
import { Icon } from "./components/Icons";

function AnimatedRingBg({ className, size = 400, opacity = 0.12 }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <img
        src="/ring-transparent.svg"
        alt=""
        style={{ width: size, height: size, opacity }}
        className="select-none"
      />
    </div>
  );
}

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
    { label: "Cloud Apps", value: apps.length, color: "from-[#2563EB] to-[#14B8A6]" },
    { label: "Kategorien", value: categories.length, color: "from-[#E879F9] to-[#F97316]" },
    { label: "Automatisiert", value: "100%", color: "from-[#10B981] to-[#84CC16]" },
    { label: "Uptime", value: "99.9%", color: "from-[#EAB308] to-[#F97316]" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated Background Elements - using ring SVGs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1a] via-[#1a1030] to-[#0f0f1a]" />

        {/* Floating ring backgrounds */}
        <AnimatedRingBg
          className="top-[-120px] left-[-100px] animate-[float_20s_ease-in-out_infinite]"
          size={500}
          opacity={0.08}
        />
        <AnimatedRingBg
          className="top-[30%] right-[-150px] animate-[float-reverse_25s_ease-in-out_infinite]"
          size={450}
          opacity={0.06}
        />
        <AnimatedRingBg
          className="bottom-[-100px] left-[20%] animate-[float_30s_ease-in-out_infinite_2s]"
          size={400}
          opacity={0.07}
        />

        {/* Gradient glow orbs */}
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#2563EB] animate-[pulse-glow_6s_ease-in-out_infinite]" />
        <div className="absolute top-[50%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#E879F9] animate-[pulse-glow_8s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-[10%] left-[30%] w-[350px] h-[350px] rounded-full bg-[#F97316] animate-[pulse-glow_7s_ease-in-out_infinite_4s]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0f0f1a]/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/logo-app.svg"
                alt="fintutto"
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  fintutto
                </span>
                <span className="text-lg font-light text-[#E879F9]">.cloud</span>
              </div>
            </div>

            {/* Search */}
            <div className="hidden sm:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full group">
                <Icon
                  name="search"
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a3080] group-focus-within:text-[#E879F9] transition-colors"
                />
                <input
                  type="text"
                  placeholder="Apps durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-[#6a3080] focus:outline-none focus:ring-2 focus:ring-[#E879F9]/30 focus:border-[#E879F9]/30 transition-all"
                />
              </div>
            </div>

            <a
              href="https://app.fintutto.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl text-white text-sm font-medium transition-all shadow-lg hover:shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] via-[#E879F9] to-[#F97316] bg-[length:200%_100%] animate-[gradient-shift_4s_ease_infinite]" />
              <span className="relative">Dashboard</span>
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a3080]"
          />
          <input
            type="text"
            placeholder="Apps durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-[#6a3080] focus:outline-none focus:ring-2 focus:ring-[#E879F9]/30 transition-all"
          />
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Animated Logo */}
          <div className="relative mx-auto mb-8 w-36 h-36 sm:w-44 sm:h-44">
            <img
              src="/ring-fin.svg"
              alt="fintutto Logo"
              className="w-full h-full"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E879F9]/10 border border-[#E879F9]/20 text-[#E879F9] text-sm font-medium mb-6">
            <Icon name="sparkles" size={16} />
            Alles automatisch ab jetzt
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            Deine Cloud.
            <br />
            <span className="bg-gradient-to-r from-[#2563EB] via-[#E879F9] to-[#F97316] bg-clip-text text-transparent">
              Deine Apps.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {apps.length} professionelle Cloud-Anwendungen – nahtlos verbunden,
            vollständig automatisiert, immer verfügbar.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative px-6 py-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm overflow-hidden group hover:border-white/[0.12] transition-all"
              >
                <div
                  className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">
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
          <h2 className="text-sm font-semibold text-[#6a3080] uppercase tracking-widest mb-6">
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
                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#E879F9] to-[#F97316] bg-[length:300%_300%] animate-[gradient-shift_6s_ease_infinite] opacity-90" />
                <div className="absolute inset-[1px] rounded-[15px] bg-[#1a1030]" />
                {/* Content */}
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563EB]/20 to-[#E879F9]/20 border border-white/10 flex items-center justify-center mb-3">
                    <Icon name={app.icon} size={22} className="text-[#E879F9]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#E879F9] transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {app.description}
                  </p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon
                    name="externalLink"
                    size={16}
                    className="text-[#E879F9]"
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
                  ? "bg-gradient-to-r from-[#2563EB] to-[#E879F9] text-white shadow-lg shadow-[#E879F9]/20"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
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
                      ? "bg-gradient-to-r from-[#2563EB] to-[#E879F9] text-white shadow-lg shadow-[#E879F9]/20"
                      : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
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
                className="text-[#2d1850] mx-auto mb-4"
              />
              <p className="text-slate-500 text-lg">
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
                  className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 transition-all duration-300 hover:bg-[#1a1030]/80 hover:border-[#E879F9]/20 hover:shadow-2xl hover:shadow-[#E879F9]/5 hover:-translate-y-0.5"
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
                        <h3 className="text-base font-semibold text-white truncate group-hover:text-[#E879F9] transition-colors">
                          {app.name}
                        </h3>
                        <Icon
                          name="externalLink"
                          size={14}
                          className="text-[#4a2070] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {app.description}
                      </p>
                      <div className="mt-3">
                        <span className="inline-flex items-center text-xs text-[#6a3080] font-mono">
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
      <footer className="border-t border-white/[0.04] py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-app.svg"
                alt="fintutto"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-sm text-slate-500">
                fintutto.cloud &middot; Alles automatisch ab jetzt
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://admin.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-[#E879F9] transition-colors"
              >
                Admin
              </a>
              <a
                href="https://commander.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-[#E879F9] transition-colors"
              >
                Commander
              </a>
              <a
                href="https://portal.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-[#E879F9] transition-colors"
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
