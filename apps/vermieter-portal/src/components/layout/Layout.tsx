import { Outlet, useNavigate } from 'react-router-dom'
import { CommandPalette, PORTAL_TOOLS } from '@fintutto/shared'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'

export default function Layout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <EcosystemBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CommandPalette
        items={PORTAL_TOOLS}
        onSelect={(item) => navigate(item.path)}
      />
    </div>
  )
}
