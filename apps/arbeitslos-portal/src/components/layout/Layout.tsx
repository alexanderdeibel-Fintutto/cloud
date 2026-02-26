import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'
import CookieConsent from '@/components/CookieConsent'
import BackToTop from '@/components/BackToTop'
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp'
import PageTransition from '@/components/PageTransition'
import MobileNavBar from '@/components/MobileNavBar'
import { CommandPalette, ECOSYSTEM_TOOLS } from '@fintutto/shared'
import type { CommandItem } from '@fintutto/shared'

const ARBEITSLOS_TOOLS: CommandItem[] = [
  { id: 'al-home', title: 'Startseite', category: 'Navigation', path: '/', icon: '🏠', keywords: ['home', 'start'] },
  { id: 'al-dashboard', title: 'Dashboard', category: 'Navigation', path: '/dashboard', icon: '📊', keywords: ['uebersicht', 'dashboard'] },
  { id: 'al-scan', title: 'BescheidScan', category: 'Navigation', path: '/scan', icon: '📷', keywords: ['scan', 'bescheid', 'pruefen'] },
  { id: 'al-chat', title: 'KI-Rechtsberater', category: 'Navigation', path: '/chat', icon: '💬', keywords: ['chat', 'frage', 'beratung'] },
  { id: 'al-buergergeld', title: 'Bürgergeld-Rechner', category: 'Rechner', path: '/rechner/buergergeld', icon: '🧮', keywords: ['rechner', 'buergergeld', 'regelsatz'] },
  { id: 'al-kdu', title: 'KdU-Rechner', category: 'Rechner', path: '/rechner/kdu', icon: '🏘️', keywords: ['miete', 'wohnung', 'heizung'] },
  { id: 'al-mehrbedarf', title: 'Mehrbedarf-Rechner', category: 'Rechner', path: '/rechner/mehrbedarf', icon: '➕', keywords: ['schwanger', 'alleinerziehend'] },
  { id: 'al-sanktion', title: 'Sanktions-Rechner', category: 'Rechner', path: '/rechner/sanktion', icon: '⚠️', keywords: ['sanktion', 'kuerzung'] },
  { id: 'al-fristen', title: 'Fristenrechner', category: 'Rechner', path: '/rechner/fristen', icon: '⏰', keywords: ['frist', 'widerspruch', 'klage'] },
  { id: 'al-erstausstattung', title: 'Erstausstattung', category: 'Rechner', path: '/rechner/erstausstattung', icon: '🛋️', keywords: ['moebel', 'baby'] },
  { id: 'al-umzug', title: 'Umzugskosten', category: 'Rechner', path: '/rechner/umzugskosten', icon: '📦', keywords: ['umzug', 'kaution'] },
  { id: 'al-musterschreiben', title: 'Dokumenten-Werkstatt', category: 'Navigation', path: '/musterschreiben', icon: '📝', keywords: ['brief', 'widerspruch', 'antrag'] },
  { id: 'al-tracker', title: 'Widerspruch-Tracker', category: 'Navigation', path: '/tracker', icon: '📋', keywords: ['tracker', 'status', 'frist'] },
  { id: 'al-forum', title: 'Community-Forum', category: 'Navigation', path: '/forum', icon: '👥', keywords: ['forum', 'community'] },
  { id: 'al-faq', title: 'FAQ', category: 'Navigation', path: '/faq', icon: '❓', keywords: ['frage', 'hilfe', 'antwort'] },
  { id: 'al-profil', title: 'Mein Profil', category: 'Navigation', path: '/profil', icon: '👤', keywords: ['profil', 'abo', 'einstellungen'] },
]

const allArbeitslosTools = [...ARBEITSLOS_TOOLS, ...ECOSYSTEM_TOOLS.filter(t => t.id !== 'e-arbeitslos-portal')]

function ArbeitslosCommandPalette() {
  const navigate = useNavigate()
  return (
    <CommandPalette
      items={allArbeitslosTools}
      onSelect={(item) => item.external ? window.open(item.path, '_blank') : navigate(item.path)}
    />
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="skip-to-content">
        Zum Inhalt springen
      </a>
      <EcosystemBar />
      <Header />
      <main id="main-content" className="flex-1 pb-16 md:pb-0" role="main">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <MobileNavBar />
      <BackToTop />
      <ArbeitslosCommandPalette />
      <KeyboardShortcutsHelp />
      <CookieConsent />
    </div>
  )
}
