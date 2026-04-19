import {
  useState, useEffect, useRef, useCallback, type ReactNode,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/useLanguage'
import { LanguageSwitcher } from '../i18n/LanguageSwitcher'
import {
  Menu, X, Search, ChevronDown, ChevronRight,
  Wallet, Home, BookOpen, Leaf, Brain, FileText,
  Scale, Users, Calculator, Globe, GraduationCap,
  Building2, Briefcase, TrendingUp, Shield, Zap,
} from 'lucide-react'

// ─── Navigation Data ─────────────────────────────────────────────────────────

const NAV_APPS = [
  {
    group: 'Finanzen',
    items: [
      { label: 'Finance Coach', sub: 'KI-Finanzcoach & Budgetierung', href: '/apps/finance-coach', icon: TrendingUp, external: false },
      { label: 'Finance Mentor', sub: 'Finanz-Bildung & Zertifikate', href: '/apps/finance-mentor', icon: GraduationCap, external: false },
      { label: 'Fintutto Biz', sub: 'Freelancer Finance OS', href: '/apps/fintutto-biz', icon: Briefcase, external: false },
      { label: 'Bescheidboxer', sub: 'Steuerbescheide prüfen & Einspruch', href: '/apps/bescheidboxer', icon: Shield, external: false },
    ],
  },
  {
    group: 'Wohnen',
    items: [
      { label: 'Vermietify', sub: 'Immobilienverwaltung für Vermieter', href: '/apps/vermietify', icon: Building2, external: false },
      { label: 'WohnHeld', sub: 'Mieter-App für Wohnungsmanagement', href: '/apps/wohnheld', icon: Home, external: false },
      { label: 'Ablesung', sub: 'Zählerablesung & Rechnungs-OCR', href: '/apps/ablesung', icon: Calculator, external: false },
      { label: 'Fintutto Portal', sub: 'Rechner & Formulare für Mietrecht', href: '/apps/portal', icon: Scale, external: false },
    ],
  },
  {
    group: 'Lernen & Alltag',
    items: [
      { label: 'LernApp', sub: 'KI-Erklärungen für Schüler', href: '/apps/lernapp', icon: BookOpen, external: false },
      { label: 'SecondBrain', sub: 'KI-Dokumentenmanagement', href: '/apps/secondbrain', icon: Brain, external: false },
      { label: 'Pflanzen-Manager', sub: 'Zimmerpflanzen-Verwaltung', href: '/apps/pflanzen', icon: Leaf, external: false },
      { label: 'Translator', sub: 'Übersetzer in 20+ Sprachen', href: '/apps/translator', icon: Globe, external: false },
    ],
  },
  {
    group: 'Soziales & Recht',
    items: [
      { label: 'Arbeitslos-Portal', sub: 'Bürgergeld, ALG I & Sozialrecht', href: '/apps/arbeitslos', icon: Users, external: false },
      { label: 'Widerspruch-Jobcenter', sub: 'Community & Tipps', href: '/apps/widerspruch', icon: FileText, external: false },
    ],
  },
]

const NAV_SOLUTIONS = [
  { label: 'Für Privatpersonen', sub: 'Finanzen, Wohnen & Alltag', href: '/loesungen/privat', icon: Wallet },
  { label: 'Für Familien', sub: 'Gemeinsam sparen & organisieren', href: '/loesungen/familien', icon: Home },
  { label: 'Für Freelancer', sub: 'Rechnungen, Steuern & Cashflow', href: '/loesungen/freelancer', icon: Briefcase },
  { label: 'Für Vermieter', sub: 'Immobilien professionell verwalten', href: '/loesungen/vermieter', icon: Building2 },
  { label: 'Für Schüler & Studenten', sub: 'Lernen mit KI-Unterstützung', href: '/loesungen/schueler', icon: GraduationCap },
]

const NAV_COMPANY = {
  left: [
    { label: 'Über uns', sub: 'Mission & Team', href: '/ueber-uns' },
    { label: 'Team', sub: 'Die Menschen hinter Fintutto', href: '/team' },
    { label: 'Roadmap', sub: 'Was als nächstes kommt', href: '/roadmap' },
    { label: 'News', sub: 'Neuigkeiten & Updates', href: '/news' },
    { label: 'Kontakt', sub: 'Schreib uns', href: '/kontakt' },
  ],
  right: [
    { label: 'Investoren', sub: 'Für Investoren & Partner', href: '/investoren' },
    { label: 'Blog ↗', sub: 'Tipps & Ratgeber', href: 'https://know.fintutto.world/blog', external: true },
    { label: 'Docs ↗', sub: 'Technische Dokumentation', href: 'https://know.fintutto.world/docs', external: true },
    { label: 'FAQ ↗', sub: 'Häufige Fragen', href: 'https://know.fintutto.world/faq-angel', external: true },
    { label: 'Presse ↗', sub: 'Pressemitteilungen & Medien', href: 'https://know.fintutto.world/presse', external: true },
  ],
}

const SEARCH_INDEX = [
  { title: 'Finance Coach', sub: 'KI-Finanzcoach', href: '/apps/finance-coach' },
  { title: 'Finance Mentor', sub: 'Finanz-Bildung', href: '/apps/finance-mentor' },
  { title: 'Fintutto Biz', sub: 'Freelancer Finance OS', href: '/apps/fintutto-biz' },
  { title: 'Bescheidboxer', sub: 'Steuerbescheide prüfen', href: '/apps/bescheidboxer' },
  { title: 'Vermietify', sub: 'Immobilienverwaltung', href: '/apps/vermietify' },
  { title: 'WohnHeld', sub: 'Mieter-App', href: '/apps/wohnheld' },
  { title: 'Ablesung', sub: 'Zählerablesung & OCR', href: '/apps/ablesung' },
  { title: 'Fintutto Portal', sub: 'Mietrecht-Rechner', href: '/apps/portal' },
  { title: 'LernApp', sub: 'KI-Erklärungen für Schüler', href: '/apps/lernapp' },
  { title: 'SecondBrain', sub: 'KI-Dokumentenmanagement', href: '/apps/secondbrain' },
  { title: 'Pflanzen-Manager', sub: 'Zimmerpflanzen', href: '/apps/pflanzen' },
  { title: 'Translator', sub: 'Übersetzer 20+ Sprachen', href: '/apps/translator' },
  { title: 'Arbeitslos-Portal', sub: 'Bürgergeld & Sozialrecht', href: '/apps/arbeitslos' },
  { title: 'Widerspruch-Jobcenter', sub: 'Community & Tipps', href: '/apps/widerspruch' },
  { title: 'Preise', sub: 'Alle Pläne & Preise', href: '/preise' },
  { title: 'Über uns', sub: 'Mission & Team', href: '/ueber-uns' },
  { title: 'Kontakt', sub: 'Schreib uns', href: '/kontakt' },
  { title: 'Für Privatpersonen', sub: 'Lösungen', href: '/loesungen/privat' },
  { title: 'Für Freelancer', sub: 'Lösungen', href: '/loesungen/freelancer' },
  { title: 'Für Vermieter', sub: 'Lösungen', href: '/loesungen/vermieter' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type DropdownType = 'apps' | 'solutions' | 'company' | null

// ─── SearchBar ────────────────────────────────────────────────────────────────

function SearchBar({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const results = query.length >= 1
    ? SEARCH_INDEX.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.sub.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  return (
    <div className="absolute inset-x-0 top-0 bg-white/95 backdrop-blur-md shadow-xl z-50 border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="App oder Funktion suchen…"
            className="flex-1 text-base outline-none bg-transparent text-slate-800 placeholder-slate-400"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        {results.length > 0 && (
          <div className="mt-2 border-t border-slate-100 pt-2 space-y-0.5">
            {results.map(r => (
              <Link
                key={r.href}
                to={r.href}
                onClick={onClose}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-slate-800">{r.title}</div>
                  <div className="text-xs text-slate-500">{r.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {query.length >= 1 && results.length === 0 && (
          <div className="mt-2 border-t border-slate-100 pt-3 text-sm text-slate-500">
            Keine Ergebnisse für „{query}". <Link to="/kontakt" onClick={onClose} className="text-indigo-600 hover:underline">Kontakt aufnehmen →</Link>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── AppsDropdown ─────────────────────────────────────────────────────────────

function AppsDropdown() {
  return (
    <div className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-40 w-[720px]">
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        {NAV_APPS.map(group => (
          <div key={group.group}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">{group.group}</div>
            {group.items.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-indigo-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-200 transition-colors">
                    <Icon size={15} className="text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.sub}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm text-slate-500">14 Apps in der Fintutto Cloud</span>
        <Link to="/apps" className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1">
          Alle Apps ansehen <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}

// ─── SolutionsDropdown ────────────────────────────────────────────────────────

function SolutionsDropdown() {
  return (
    <div className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-40 w-72">
      {NAV_SOLUTIONS.map(item => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-violet-200 transition-colors">
              <Icon size={15} className="text-violet-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">{item.label}</div>
              <div className="text-xs text-slate-500">{item.sub}</div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

// ─── CompanyDropdown ──────────────────────────────────────────────────────────

function CompanyDropdown() {
  return (
    <div className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-40 w-[480px]">
      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Das Unternehmen</div>
          {NAV_COMPANY.left.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col px-2 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800">{item.label}</span>
              <span className="text-xs text-slate-500">{item.sub}</span>
            </Link>
          ))}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Wissen & Presse</div>
          {NAV_COMPANY.right.map(item => (
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col px-2 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-800">{item.label}</span>
                <span className="text-xs text-slate-500">{item.sub}</span>
              </a>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col px-2 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-800">{item.label}</span>
                <span className="text-xs text-slate-500">{item.sub}</span>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── DesktopNav ───────────────────────────────────────────────────────────────

interface DesktopNavProps {
  activeDropdown: DropdownType
  setActiveDropdown: (d: DropdownType) => void
  isAppsActive: boolean
  isSolutionsActive: boolean
  isCompanyActive: boolean
}

function DesktopNav({ activeDropdown, setActiveDropdown, isAppsActive, isSolutionsActive, isCompanyActive }: DesktopNavProps) {
  const { t } = useLanguage()

  const toggle = (d: DropdownType) => setActiveDropdown(activeDropdown === d ? null : d)

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {/* Apps */}
      <div className="relative">
        <button
          onClick={() => toggle('apps')}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isAppsActive || activeDropdown === 'apps'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          {t('nav_apps')}
          <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'apps' ? 'rotate-180' : ''}`} />
        </button>
        {activeDropdown === 'apps' && <AppsDropdown />}
      </div>

      {/* Solutions */}
      <div className="relative">
        <button
          onClick={() => toggle('solutions')}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSolutionsActive || activeDropdown === 'solutions'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          {t('nav_solutions')}
          <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
        </button>
        {activeDropdown === 'solutions' && <SolutionsDropdown />}
      </div>

      {/* Pricing */}
      <Link
        to="/preise"
        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
      >
        {t('nav_pricing')}
      </Link>

      {/* Company */}
      <div className="relative">
        <button
          onClick={() => toggle('company')}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isCompanyActive || activeDropdown === 'company'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          {t('nav_company')}
          <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'company' ? 'rotate-180' : ''}`} />
        </button>
        {activeDropdown === 'company' && <CompanyDropdown />}
      </div>
    </nav>
  )
}

// ─── MobileBottomBar ──────────────────────────────────────────────────────────

function MobileBottomBar() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(true)
  const [pulse, setPulse] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      setVisible(current < lastScrollY.current || current < 100)
      lastScrollY.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setPulse(true), 30000)
    return () => clearTimeout(timer)
  }, [])

  const ctaText = pathname.includes('/preise') ? t('mobile_cta_pricing') : t('mobile_cta_default')
  const hint = pathname.includes('/preise') ? t('mobile_hint_pricing') : null

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3">
        <Link
          to="/starten"
          className={`block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors ${pulse ? 'animate-pulse' : ''}`}
          onAnimationEnd={() => setPulse(false)}
        >
          {ctaText}
        </Link>
        {hint && <p className="text-center text-xs text-slate-500 mt-1">{hint}</p>}
      </div>
    </div>
  )
}

// ─── CloudLayout ──────────────────────────────────────────────────────────────

interface CloudLayoutProps {
  children: ReactNode
}

export function CloudLayout({ children }: CloudLayoutProps) {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setActiveDropdown(null)
    setSearchOpen(false)
  }, [pathname])

  const isAppsActive = pathname.startsWith('/apps')
  const isSolutionsActive = pathname.startsWith('/loesungen')
  const isCompanyActive = ['/ueber-uns', '/team', '/roadmap', '/news', '/kontakt', '/investoren'].some(p => pathname.startsWith(p))

  const handleSetDropdown = useCallback((d: DropdownType) => {
    setActiveDropdown(d)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Header ── */}
      <header
        ref={dropdownRef}
        className={`sticky top-0 z-40 w-full transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
            : 'bg-white/90 backdrop-blur-sm'
        }`}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 transition-all duration-500 ${scrolled ? 'h-13' : 'h-16'}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">
              fintutto <span className="text-indigo-500 font-normal text-sm">cloud</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <DesktopNav
            activeDropdown={activeDropdown}
            setActiveDropdown={handleSetDropdown}
            isAppsActive={isAppsActive}
            isSolutionsActive={isSolutionsActive}
            isCompanyActive={isCompanyActive}
          />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="Suche"
            >
              <Search size={17} />
            </button>
            <LanguageSwitcher />
            <Link
              to="/anmelden"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2"
            >
              {t('nav_cta_login')}
            </Link>
            <Link
              to="/starten"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {t('nav_cta_start')}
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors">
              <Search size={18} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="p-2 text-slate-700 hover:text-indigo-600 rounded-lg transition-colors"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {/* Apps Accordion */}
              <button
                onClick={() => setMobileExpanded(mobileExpanded === 'apps' ? null : 'apps')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50"
              >
                {t('nav_apps')}
                <ChevronDown size={16} className={`transition-transform ${mobileExpanded === 'apps' ? 'rotate-180' : ''}`} />
              </button>
              {mobileExpanded === 'apps' && (
                <div className="pl-3 space-y-0.5">
                  {NAV_APPS.map(group => (
                    <div key={group.group}>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">{group.group}</div>
                      {group.items.map(item => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-indigo-50"
                        >
                          <item.icon size={14} className="text-indigo-500" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Solutions Accordion */}
              <button
                onClick={() => setMobileExpanded(mobileExpanded === 'solutions' ? null : 'solutions')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50"
              >
                {t('nav_solutions')}
                <ChevronDown size={16} className={`transition-transform ${mobileExpanded === 'solutions' ? 'rotate-180' : ''}`} />
              </button>
              {mobileExpanded === 'solutions' && (
                <div className="pl-3 space-y-0.5">
                  {NAV_SOLUTIONS.map(item => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-indigo-50"
                    >
                      <item.icon size={14} className="text-violet-500" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              <Link to="/preise" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50">
                {t('nav_pricing')}
              </Link>

              {/* Company Accordion */}
              <button
                onClick={() => setMobileExpanded(mobileExpanded === 'company' ? null : 'company')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50"
              >
                {t('nav_company')}
                <ChevronDown size={16} className={`transition-transform ${mobileExpanded === 'company' ? 'rotate-180' : ''}`} />
              </button>
              {mobileExpanded === 'company' && (
                <div className="pl-3 space-y-0.5">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">Das Unternehmen</div>
                  {NAV_COMPANY.left.map(item => (
                    <Link key={item.href} to={item.href} className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-indigo-50">
                      {item.label}
                    </Link>
                  ))}
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5 mt-1">Wissen & Presse</div>
                  {NAV_COMPANY.right.map(item => (
                    item.external ? (
                      <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-indigo-50">
                        {item.label}
                      </a>
                    ) : (
                      <Link key={item.href} to={item.href} className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-indigo-50">
                        {item.label}
                      </Link>
                    )
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link to="/starten" className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-xl text-sm">
                  {t('nav_cta_start')}
                </Link>
                <Link to="/anmelden" className="block w-full text-center text-slate-600 font-medium py-2 rounded-xl text-sm hover:bg-slate-50">
                  {t('nav_cta_login')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <span className="font-bold text-white text-base">
                  fintutto <span className="text-indigo-400 font-normal text-sm">cloud</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{t('footer_tagline')}</p>
            </div>

            {/* Apps */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('footer_apps')}</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/apps/finance-coach" className="hover:text-white transition-colors">Finance Coach</Link></li>
                <li><Link to="/apps/vermietify" className="hover:text-white transition-colors">Vermietify</Link></li>
                <li><Link to="/apps/lernapp" className="hover:text-white transition-colors">LernApp</Link></li>
                <li><Link to="/apps/secondbrain" className="hover:text-white transition-colors">SecondBrain</Link></li>
                <li><Link to="/apps" className="text-indigo-400 hover:text-indigo-300 transition-colors">Alle Apps →</Link></li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('footer_solutions')}</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/loesungen/privat" className="hover:text-white transition-colors">Für Privatpersonen</Link></li>
                <li><Link to="/loesungen/familien" className="hover:text-white transition-colors">Für Familien</Link></li>
                <li><Link to="/loesungen/freelancer" className="hover:text-white transition-colors">Für Freelancer</Link></li>
                <li><Link to="/loesungen/vermieter" className="hover:text-white transition-colors">Für Vermieter</Link></li>
                <li><Link to="/loesungen/schueler" className="hover:text-white transition-colors">Für Schüler</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('footer_company')}</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/ueber-uns" className="hover:text-white transition-colors">Über uns</Link></li>
                <li><Link to="/team" className="hover:text-white transition-colors">Team</Link></li>
                <li><Link to="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
                <li><Link to="/news" className="hover:text-white transition-colors">News</Link></li>
                <li><Link to="/kontakt" className="hover:text-white transition-colors">Kontakt</Link></li>
              </ul>
            </div>

            {/* Ressourcen */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Ressourcen</div>
              <ul className="space-y-2 text-sm">
                <li><a href="https://know.fintutto.world/blog" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog ↗</a></li>
                <li><a href="https://know.fintutto.world/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs ↗</a></li>
                <li><a href="https://know.fintutto.world/faq-angel" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">FAQ ↗</a></li>
                <li><a href="https://know.fintutto.world/presse" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Presse ↗</a></li>
                <li><a href="https://know.fintutto.world" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">know.fintutto.world ↗</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">{t('footer_copy')}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link to="/datenschutz" className="hover:text-slate-300 transition-colors">Datenschutz</Link>
              <Link to="/impressum" className="hover:text-slate-300 transition-colors">Impressum</Link>
              <Link to="/agb" className="hover:text-slate-300 transition-colors">AGB</Link>
              <a href="https://www.fintutto.world" className="text-indigo-400 hover:text-indigo-300 transition-colors">fintutto.world ↗</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar />
    </div>
  )
}
