import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import FitTuttoNav from './FitTuttoNav'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const isFitTutto = pathname.startsWith('/fittutto')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Zum Inhalt springen
      </a>
      <Header />
      {isFitTutto && <FitTuttoNav />}
      <main id="main-content" className={cn('flex-1', isFitTutto && 'pb-20 md:pb-0')} role="main">{children}</main>
      <Footer />
    </div>
  )
}
