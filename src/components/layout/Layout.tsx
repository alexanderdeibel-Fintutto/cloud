import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommandPalette, CHECKER_TOOLS } from '@fintutto/shared'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <EcosystemBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CommandPalette
        items={CHECKER_TOOLS}
        onSelect={(item) => navigate(item.path)}
      />
    </div>
  )
}
