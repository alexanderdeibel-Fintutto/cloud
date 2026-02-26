import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import EcosystemBar from './EcosystemBar'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Onboarding from '../Onboarding'
import KeyboardShortcuts from '../KeyboardShortcuts'
import PageTransition from '../PageTransition'
import { CommandPalette, ECOSYSTEM_TOOLS, EcosystemFooter } from '@fintutto/shared'
import type { CommandItem } from '@fintutto/shared'

const BESCHEIDBOXER_TOOLS: CommandItem[] = [
  { id: 'bb-dashboard', title: 'Dashboard', category: 'Navigation', path: '/', icon: '📊', keywords: ['home', 'start', 'uebersicht'] },
  { id: 'bb-bescheide', title: 'Bescheide', category: 'Navigation', path: '/bescheide', icon: '📄', keywords: ['steuer', 'liste'] },
  { id: 'bb-upload', title: 'Bescheid hochladen', category: 'Navigation', path: '/upload', icon: '📤', keywords: ['neu', 'pdf', 'foto', 'dokument'] },
  { id: 'bb-analyse', title: 'Analyse', category: 'Navigation', path: '/analyse', icon: '🔍', keywords: ['ki', 'pruefen', 'check'] },
  { id: 'bb-fristen', title: 'Fristen', category: 'Navigation', path: '/fristen', icon: '⏰', keywords: ['termin', 'deadline', 'ablauf'] },
  { id: 'bb-kalender', title: 'Steuer-Kalender', category: 'Navigation', path: '/kalender', icon: '📅', keywords: ['kalender', 'monat', 'termin'] },
  { id: 'bb-einspruch', title: 'Einspruch', category: 'Navigation', path: '/einspruch', icon: '🛡️', keywords: ['widerspruch', 'beschwerde'] },
  { id: 'bb-rechner', title: 'Steuer-Rechner', category: 'Navigation', path: '/steuerrechner', icon: '🧮', keywords: ['rechner', 'berechnen', 'steuer'] },
  { id: 'bb-vergleich', title: 'Bescheid-Vergleich', category: 'Navigation', path: '/vergleich', icon: '↔️', keywords: ['vergleich', 'diff'] },
  { id: 'bb-archiv', title: 'Archiv', category: 'Navigation', path: '/archiv', icon: '🗄️', keywords: ['archiv', 'erledigt', 'alt'] },
  { id: 'bb-statistik', title: 'Statistiken', category: 'Navigation', path: '/statistiken', icon: '📈', keywords: ['statistik', 'chart', 'auswertung'] },
  { id: 'bb-dokumente', title: 'Dokumente', category: 'Navigation', path: '/dokumente', icon: '📁', keywords: ['dokument', 'datei', 'pdf'] },
  { id: 'bb-hilfe', title: 'Hilfe & Glossar', category: 'Navigation', path: '/hilfe', icon: '❓', keywords: ['faq', 'glossar', 'hilfe'] },
  { id: 'bb-einstellungen', title: 'Einstellungen', category: 'Navigation', path: '/einstellungen', icon: '⚙️', keywords: ['einstellungen', 'konto'] },
]

const allBescheidboxerTools = [...BESCHEIDBOXER_TOOLS, ...ECOSYSTEM_TOOLS.filter(t => t.id !== 'e-bescheidboxer')]

function BescheidboxerCommandPalette() {
  const navigate = useNavigate()
  return (
    <CommandPalette
      items={allBescheidboxerTools}
      onSelect={(item) => item.external ? window.open(item.path, '_blank') : navigate(item.path)}
    />
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
      >
        Zum Inhalt springen
      </a>
      <EcosystemBar />
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto pb-20 md:pb-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <EcosystemFooter
        currentAppSlug="bescheidboxer"
        appName="BescheidBoxer"
        appIcon="📋"
        appDescription="Steuerbescheide prüfen, vergleichen und Einspruch einlegen"
        columns={[
          {
            title: 'Analyse',
            links: [
              { name: 'Dashboard', href: '/' },
              { name: 'Bescheide', href: '/bescheide' },
              { name: 'Analyse', href: '/analyse' },
              { name: 'Vergleich', href: '/vergleich' },
              { name: 'Statistiken', href: '/statistiken' },
            ],
          },
          {
            title: 'Dokumente',
            links: [
              { name: 'Hochladen', href: '/upload' },
              { name: 'Einspruch', href: '/einspruch' },
              { name: 'Fristen', href: '/fristen' },
              { name: 'Archiv', href: '/archiv' },
              { name: 'Steuer-Rechner', href: '/steuerrechner' },
            ],
          },
        ]}
      />
      <MobileNav />
      <Onboarding />
      <BescheidboxerCommandPalette />
      <KeyboardShortcuts />
    </div>
  )
}
