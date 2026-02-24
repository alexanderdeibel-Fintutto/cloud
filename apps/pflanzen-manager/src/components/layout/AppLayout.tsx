import { Outlet, useNavigate } from 'react-router-dom';
import { CommandPalette, ECOSYSTEM_TOOLS } from '@fintutto/shared';
import type { CommandItem } from '@fintutto/shared';
import { Sidebar } from './Sidebar';
import EcosystemBar from './EcosystemBar';

const PFLANZEN_TOOLS: CommandItem[] = [
  { id: 'p-dashboard', title: 'Dashboard', category: 'Navigation', path: '/', icon: '🏠', keywords: ['übersicht', 'start'] },
  { id: 'p-plants', title: 'Meine Pflanzen', category: 'Pflanzen', path: '/plants', icon: '🌿', keywords: ['pflanze', 'liste'] },
  { id: 'p-catalog', title: 'Pflanzenkatalog', category: 'Pflanzen', path: '/catalog', icon: '📚', keywords: ['suche', 'art', 'sorte'] },
  { id: 'p-scanner', title: 'Pflanzen-Scanner', category: 'Pflanzen', path: '/scanner', icon: '📷', keywords: ['scan', 'erkennung', 'foto'] },
  { id: 'p-apartments', title: 'Wohnungen', category: 'Navigation', path: '/apartments', icon: '🏢', keywords: ['raum', 'standort'] },
  { id: 'p-care', title: 'Pflege & Gießplan', category: 'Pflege', path: '/care', icon: '💧', keywords: ['gießen', 'wasser', 'pflege'] },
  { id: 'p-calendar', title: 'Kalender', category: 'Pflege', path: '/calendar', icon: '📅', keywords: ['termin', 'datum'] },
  { id: 'p-vacation', title: 'Urlaubsplan', category: 'Pflege', path: '/vacation', icon: '✈️', keywords: ['urlaub', 'reise', 'vertretung'] },
  { id: 'p-shopping', title: 'Einkaufsliste', category: 'Navigation', path: '/shopping', icon: '🛒', keywords: ['kaufen', 'einkauf', 'erde', 'dünger'] },
  { id: 'p-settings', title: 'Einstellungen', category: 'Navigation', path: '/settings', icon: '⚙️', keywords: ['profil', 'konto'] },
];

const allPflanzenTools = [...PFLANZEN_TOOLS, ...ECOSYSTEM_TOOLS.filter(t => t.id !== 'e-pflanzen-manager')];

export function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <EcosystemBar />
      <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl py-6 px-4 lg:px-8">
          <Outlet />
        </div>
      </main>
      </div>
      <CommandPalette
        items={allPflanzenTools}
        onSelect={(item) => item.external ? window.open(item.path, '_blank') : navigate(item.path)}
      />
    </div>
  );
}
