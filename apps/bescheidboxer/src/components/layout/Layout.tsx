import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Onboarding from '../Onboarding'
import CommandPalette from '../CommandPalette'
import KeyboardShortcuts from '../KeyboardShortcuts'
import PageTransition from '../PageTransition'
import BescheidBoxerChat, { AIChatButton } from '../ai/BescheidBoxerChat'

export default function Layout() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
      >
        Zum Inhalt springen
      </a>
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto pb-20 md:pb-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <MobileNav />
      <Onboarding />
      <CommandPalette />
      <KeyboardShortcuts />
      <AIChatButton onClick={() => setChatOpen(true)} isOpen={chatOpen} />
      <BescheidBoxerChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}
