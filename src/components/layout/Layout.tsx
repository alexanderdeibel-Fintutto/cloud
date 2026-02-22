import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommandPalette, CHECKER_TOOLS, ECOSYSTEM_TOOLS, useScrollToTop, KeyboardShortcutsHelp } from '@fintutto/shared'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  useScrollToTop()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Zum Inhalt springen
      </a>
      <EcosystemBar />
      <Header />
      <main id="main-content" className="flex-1" role="main">{children}</main>
      <Footer />
      <CommandPalette
        items={[...CHECKER_TOOLS, ...ECOSYSTEM_TOOLS]}
        onSelect={(item) => item.external ? window.open(item.path, '_blank') : navigate(item.path)}
      />
      <KeyboardShortcutsHelp />
    </div>
  )
}
