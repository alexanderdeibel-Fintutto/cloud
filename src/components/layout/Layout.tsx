import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommandPalette, CHECKER_TOOLS, useScrollToTop } from '@fintutto/shared'
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
      <main id="main-content" className="flex-1" role="main">{children}</main>
 main
      <Footer />
      <CommandPalette
        items={CHECKER_TOOLS}
        onSelect={(item) => navigate(item.path)}
      />
    </div>
  )
}
