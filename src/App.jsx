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
    <div className="min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--color-surface)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/8 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl animate-pulse [animation-delay:4s]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-surface)]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Icon name="cloud" size={20} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  fintutto
                </span>
                <span className="text-lg font-light text-brand-400">
                  .cloud
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="hidden sm:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Icon
                  name="search"
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Apps durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                />
              </div>
            </div>

            <a
              href="https://app.fintutto.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-medium hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Apps durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
          />
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-6">
            <Icon name="sparkles" size={16} />
            Alles automatisch ab jetzt
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            Deine Cloud.
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-accent-400 bg-clip-text text-transparent">
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
                className="px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
              >
                <div className="text-2xl sm:text-3xl font-bold text-white">
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
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">
            Empfohlene Apps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {featuredApps.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-90`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                    <Icon name={app.icon} size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {app.name}
                  </h3>
                  <p className="text-sm text-white/75 line-clamp-2">
                    {app.description}
                  </p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon
                    name="externalLink"
                    size={16}
                    className="text-white/70"
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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === "all"
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
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
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
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
                className="text-slate-600 mx-auto mb-4"
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
                  className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12] hover:shadow-2xl hover:shadow-brand-500/5 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shrink-0 shadow-lg`}
                    >
                      <Icon
                        name={app.icon}
                        size={24}
                        className="text-white"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
                          {app.name}
                        </h3>
                        <Icon
                          name="externalLink"
                          size={14}
                          className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {app.description}
                      </p>
                      <div className="mt-3">
                        <span className="inline-flex items-center text-xs text-slate-600 font-mono">
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
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <Icon name="cloud" size={14} className="text-white" />
              </div>
              <span className="text-sm text-slate-500">
                fintutto.cloud &middot; Alles automatisch ab jetzt
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://admin.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-brand-400 transition-colors"
              >
                Admin
              </a>
              <a
                href="https://commander.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-brand-400 transition-colors"
              >
                Commander
              </a>
              <a
                href="https://portal.fintutto.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-brand-400 transition-colors"
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
