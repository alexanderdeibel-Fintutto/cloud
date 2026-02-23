import { Outlet, useNavigate } from 'react-router-dom'
import { CommandPalette, PORTAL_TOOLS, ECOSYSTEM_TOOLS, useScrollToTop, PrintStyles, KeyboardShortcutsHelp } from '@fintutto/shared'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'

export default function Layout() {
  const navigate = useNavigate()
  useScrollToTop()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium">
        Zum Inhalt springen
      </a>
      <EcosystemBar />
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CommandPalette
        items={[...PORTAL_TOOLS, ...ECOSYSTEM_TOOLS.filter(t => t.id !== 'e-portal')]}
        onSelect={(item) => item.external ? window.open(item.path, '_blank') : navigate(item.path)}
      />
      <PrintStyles />
      <KeyboardShortcutsHelp />
    </div>
  )
}
