import { ReactNode } from 'react'
 claude/fitness-training-app-nf0CN
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import FitTuttoNav from './FitTuttoNav'
import { cn } from '@/lib/utils'

import { useNavigate } from 'react-router-dom'
import { CommandPalette, CHECKER_TOOLS, useScrollToTop } from '@fintutto/shared'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'
 main

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
 claude/fitness-training-app-nf0CN
  const { pathname } = useLocation()
  const isFitTutto = pathname.startsWith('/fittutto')

  const navigate = useNavigate()
  useScrollToTop()
 main

  return (
 claude/improve-app-integration-k7JF2
    <div className="min-h-screen flex flex-col bg-gray-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium">
        Zum Inhalt springen
      </a>
      <EcosystemBar />
      <Header />
      <main id="main-content" className="flex-1">{children}</main>

    <div className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Zum Inhalt springen
      </a>
      <Header />
 claude/fitness-training-app-nf0CN
      {isFitTutto && <FitTuttoNav />}
      <main id="main-content" className={cn('flex-1', isFitTutto && 'pb-20 md:pb-0')} role="main">{children}</main>

      <main id="main-content" className="flex-1" role="main">{children}</main>
 main
 main
      <Footer />
      <CommandPalette
        items={CHECKER_TOOLS}
        onSelect={(item) => navigate(item.path)}
      />
    </div>
  )
}
