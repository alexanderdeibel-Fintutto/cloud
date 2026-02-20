import { Outlet, useNavigate } from 'react-router-dom'
import { CommandPalette, PORTAL_TOOLS, CHECKER_TOOLS } from '@fintutto/shared'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'

const allTools = [...PORTAL_TOOLS, ...CHECKER_TOOLS]

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
        items={allTools}
        onSelect={(item) => navigate(item.path)}
      />
    </div>
  )
}
