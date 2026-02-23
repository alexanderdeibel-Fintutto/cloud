import { ReactNode } from 'react'
 claude/improve-app-integration-k7JF2
import { useNavigate } from 'react-router-dom'
import { CommandPalette, CHECKER_TOOLS, ECOSYSTEM_TOOLS, useScrollToTop, KeyboardShortcutsHelp } from '@fintutto/shared'

import { useLocation, useNavigate } from 'react-router-dom'
import { CommandPalette, CHECKER_TOOLS, useScrollToTop } from '@fintutto/shared'
 main
import Header from './Header'
import Footer from './Footer'
import FitTuttoNav from './FitTuttoNav'
import EcosystemBar from './EcosystemBar'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isFitTutto = pathname.startsWith('/fittutto')

  useScrollToTop()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Zum Inhalt springen
      </a>
      <EcosystemBar />
      <Header />
      {isFitTutto && <FitTuttoNav />}
      <main id="main-content" className={cn('flex-1', isFitTutto && 'pb-20 md:pb-0')} role="main">{children}</main>
      <Footer />
      <CommandPalette
        items={[...CHECKER_TOOLS, ...ECOSYSTEM_TOOLS]}
        onSelect={(item) => item.external ? window.open(item.path, '_blank') : navigate(item.path)}
      />
      <KeyboardShortcutsHelp />
    </div>
  )
}
