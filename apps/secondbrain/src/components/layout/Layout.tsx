import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import GlobalDropZone from './GlobalDropZone'
import CommandPalette from '@/components/CommandPalette'
import ShortcutsOverlay from '@/components/ShortcutsOverlay'
import OnboardingOverlay, { useOnboarding } from '@/components/OnboardingOverlay'
import QuickNotes from '@/components/QuickNotes'
import { useAuth } from '@/contexts/AuthContext'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const { showOnboarding, complete: completeOnboarding } = useOnboarding()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex flex-1">
        <Sidebar />
        <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <GlobalDropZone />
      <CommandPalette />
      <ShortcutsOverlay />
      {user && <QuickNotes />}
      {user && showOnboarding && <OnboardingOverlay onComplete={completeOnboarding} />}
    </div>
  )
}
