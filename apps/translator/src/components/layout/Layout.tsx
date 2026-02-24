import { Outlet, useNavigate } from 'react-router-dom'
import { CommandPalette, ECOSYSTEM_TOOLS } from '@fintutto/shared'
import type { CommandItem } from '@fintutto/shared'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'

const TRANSLATOR_TOOLS: CommandItem[] = [
  { id: 't-translator', title: 'Übersetzer', category: 'Navigation', path: '/', icon: '🌍', keywords: ['übersetzen', 'translate', 'sprache'] },
  { id: 't-live', title: 'Live-Übersetzung', category: 'Navigation', path: '/live', icon: '🎙️', keywords: ['live', 'echtzeit', 'session'] },
  { id: 't-info', title: 'Info', category: 'Navigation', path: '/info', icon: 'ℹ️', keywords: ['hilfe', 'über'] },
]

const allTranslatorTools = [...TRANSLATOR_TOOLS, ...ECOSYSTEM_TOOLS.filter(t => t.id !== 'e-translator')]

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
        items={allTranslatorTools}
        onSelect={(item) => item.external ? window.open(item.path, '_blank') : navigate(item.path)}
      />
    </div>
  )
}
