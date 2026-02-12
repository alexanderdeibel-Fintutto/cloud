import { GlobalSearch } from '@/components/GlobalSearch';
import { QuickActions } from '@/components/QuickActions';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { LanguageSelector } from '@/components/LanguageSelector';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Star } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useLocation } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Page title mapping
const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/rechnungen': 'Rechnungen',
  '/belege': 'Belege',
  '/buchungen': 'Buchungen',
  '/kontakte': 'Kontakte',
  '/bankkonten': 'Bankkonten',
  '/abstimmung': 'Bank-Abstimmung',
  '/berichte': 'Berichte',
  '/elster': 'ELSTER',
  '/sepa': 'SEPA-Zahlungen',
  '/cashflow': 'Cash-Flow',
  '/budget': 'Budgetplanung',
  '/anlagen': 'Anlagenverwaltung',
  '/waehrungen': 'Währungen',
  '/archiv': 'Dokumenten-Archiv',
  '/kpi': 'KPI-Dashboard',
  '/benutzer': 'Benutzer & Rollen',
  '/api-docs': 'API-Dokumentation',
  '/audit': 'Audit-Log',
  '/einstellungen': 'Einstellungen',
  '/firmen': 'Firmen',
  '/kalender': 'Kalender',
  '/hilfe': 'Hilfe',
  '/steuerkalender': 'Steuerkalender',
  '/report-scheduler': 'Bericht-Scheduler',
  '/bankregeln': 'Bankregeln',
  '/buchungsvorlagen': 'Buchungsvorlagen',
  '/eingangsrechnungen': 'Eingangsrechnungen',
  '/jahresabschluss': 'Jahresabschluss',
  '/zahlungsuebersicht': 'Zahlungen',
  '/kostenstellen': 'Kostenstellen',
  '/kontenplan': 'Kontenplan',
  '/ustva': 'USt-Voranmeldung',
  '/projekte': 'Projekt-Buchhaltung',
  '/dauerbuchungen': 'Dauerbuchungen',
  '/offene-posten': 'Offene Posten',
  '/mahnwesen': 'Mahnwesen',
  '/kassenbuch': 'Kassenbuch',
  '/bwa': 'BWA',
  '/saldenliste': 'Summen- und Saldenliste',
  '/kontoauszuege': 'Kontoauszüge',
  '/inventar': 'Inventarverwaltung',
};

export function HeaderToolbar() {
  const { theme, toggleTheme } = useTheme();
  const { toggleFavorite, isFavorite } = useFavorites();
  const location = useLocation();

  const currentPath = location.pathname;
  const currentTitle = PAGE_TITLES[currentPath] || 'Seite';
  const isCurrentFavorite = isFavorite(currentPath);

  const handleToggleFavorite = () => {
    toggleFavorite(currentPath, currentTitle);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Left: Search */}
        <div className="flex-1">
          <GlobalSearch />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Favorite Toggle */}
          {currentPath !== '/' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={isCurrentFavorite ? 'text-yellow-500' : ''}
                >
                  <Star className={`h-4 w-4 ${isCurrentFavorite ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isCurrentFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Quick Actions */}
          <QuickActions />

          {/* Keyboard Shortcuts */}
          <KeyboardShortcuts />

          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {theme === 'dark' ? 'Hellmodus' : 'Dunkelmodus'}
            </TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
