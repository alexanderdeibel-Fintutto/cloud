import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CookieConsent from '@/components/CookieConsent'
import BackToTop from '@/components/BackToTop'
import SpotlightSearch from '@/components/SpotlightSearch'
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp'
import MobileNavBar from '@/components/MobileNavBar'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNavBar />
      <BackToTop />
      <SpotlightSearch />
      <KeyboardShortcutsHelp />
      <CookieConsent />
    </div>
  )
}
