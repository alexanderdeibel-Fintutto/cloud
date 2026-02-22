import { Outlet, useNavigate } from 'react-router-dom'
import { CommandPalette, PORTAL_TOOLS, CHECKER_TOOLS, useScrollToTop, PrintStyles, KeyboardShortcutsHelp } from '@fintutto/shared'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'
import AiAssistant from '@/components/shared/AiAssistant'

const allTools = [...PORTAL_TOOLS, ...CHECKER_TOOLS]

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
        items={allTools}
        onSelect={(item) => navigate(item.path)}
      />
      <AiAssistant />
      <PrintStyles />
      <KeyboardShortcutsHelp />
    </div>
  )
}
