import { Outlet, useNavigate } from 'react-router-dom'
import { CommandPalette, ECOSYSTEM_TOOLS } from '@fintutto/shared'
import type { CommandItem } from '@fintutto/shared'
import Header from './Header'
import EcosystemBar from './EcosystemBar'

const ABLESUNG_TOOLS: CommandItem[] = [
  { id: 'a-dashboard', title: 'Dashboard', category: 'Navigation', path: '/', icon: '📊', keywords: ['übersicht', 'start'] },
  { id: 'a-ocr', title: 'OCR Scan', category: 'Navigation', path: '/ocr', icon: '📷', keywords: ['scan', 'foto', 'erkennung'] },
  { id: 'a-rechnungen', title: 'Rechnungen', category: 'Navigation', path: '/rechnungen', icon: '📄', keywords: ['rechnung', 'beleg'] },
  { id: 'a-einstellungen', title: 'Einstellungen', category: 'Navigation', path: '/einstellungen', icon: '⚙️', keywords: ['profil', 'konto'] },
]

const allAblesungTools = [...ABLESUNG_TOOLS, ...ECOSYSTEM_TOOLS.filter(t => t.id !== 'e-ablesung')]

export default function Layout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <EcosystemBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Fintutto Ablesung. Alle Rechte vorbehalten.
        </div>
      </footer>
      <CommandPalette
        items={allAblesungTools}
        onSelect={(item) => item.external ? window.open(item.path, '_blank') : navigate(item.path)}
      />
    </div>
  )
}
