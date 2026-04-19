import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard, FileText, Receipt, FolderOpen, Users, CreditCard,
  BarChart3, Settings, Calendar, HelpCircle, Landmark, Euro, Package,
  TrendingUp, PiggyBank, Shield, Code, Archive, Gauge, Coins, Search,
  ArrowRightLeft, Zap, ShoppingCart, Wallet, HardDrive, Building2, Mail
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  path: string;
  category: 'navigation' | 'action' | 'recent';
  keywords?: string[];
}

const SEARCH_ITEMS: SearchItem[] = [
  // Navigation
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, path: '/', category: 'navigation', keywords: ['home', 'start', 'übersicht'] },
  { id: 'invoices', title: 'Rechnungen', icon: FileText, path: '/rechnungen', category: 'navigation', keywords: ['invoice', 'rechnung', 'ausgang'] },
  { id: 'receipts', title: 'Belege', icon: FolderOpen, path: '/belege', category: 'navigation', keywords: ['beleg', 'eingang', 'receipt'] },
  { id: 'bookings', title: 'Buchungen', icon: Receipt, path: '/buchungen', category: 'navigation', keywords: ['buchung', 'transaction'] },
  { id: 'contacts', title: 'Kontakte', icon: Users, path: '/kontakte', category: 'navigation', keywords: ['kunde', 'lieferant', 'contact'] },
  { id: 'bank', title: 'Bankkonten', icon: CreditCard, path: '/bankkonten', category: 'navigation', keywords: ['bank', 'konto', 'account'] },
  { id: 'reconciliation', title: 'Bank-Abstimmung', icon: ArrowRightLeft, path: '/abstimmung', category: 'navigation', keywords: ['abstimmung', 'reconcile'] },
  { id: 'reports', title: 'Berichte', icon: BarChart3, path: '/berichte', category: 'navigation', keywords: ['bericht', 'report', 'bwa', 'bilanz'] },
  { id: 'elster', title: 'ELSTER', icon: Landmark, path: '/elster', category: 'navigation', keywords: ['steuer', 'ustva', 'finanzamt'] },
  { id: 'sepa', title: 'SEPA-Zahlungen', icon: Euro, path: '/sepa', category: 'navigation', keywords: ['sepa', 'zahlung', 'überweisung'] },
  { id: 'cashflow', title: 'Cash-Flow', icon: TrendingUp, path: '/cashflow', category: 'navigation', keywords: ['cashflow', 'liquidität'] },
  { id: 'budget', title: 'Budgetplanung', icon: PiggyBank, path: '/budget', category: 'navigation', keywords: ['budget', 'planung'] },
  { id: 'assets', title: 'Anlagenverwaltung', icon: Package, path: '/anlagen', category: 'navigation', keywords: ['anlage', 'afa', 'abschreibung'] },
  { id: 'currency', title: 'Währungen', icon: Coins, path: '/waehrungen', category: 'navigation', keywords: ['währung', 'kurs', 'devisen'] },
  { id: 'archive', title: 'Dokumenten-Archiv', icon: Archive, path: '/archiv', category: 'navigation', keywords: ['archiv', 'gobd', 'dokument'] },
  { id: 'kpi', title: 'KPI-Dashboard', icon: Gauge, path: '/kpi', category: 'navigation', keywords: ['kpi', 'kennzahl', 'metric'] },
  { id: 'users', title: 'Benutzer & Rollen', icon: Shield, path: '/benutzer', category: 'navigation', keywords: ['benutzer', 'rolle', 'berechtigung'] },
  { id: 'api', title: 'API-Dokumentation', icon: Code, path: '/api-docs', category: 'navigation', keywords: ['api', 'docs', 'entwickler'] },
  { id: 'automation', title: 'Automatisierung', icon: Zap, path: '/automatisierung', category: 'navigation', keywords: ['automation', 'regel'] },
  { id: 'ecommerce', title: 'E-Commerce', icon: ShoppingCart, path: '/ecommerce', category: 'navigation', keywords: ['shop', 'amazon', 'ebay'] },
  { id: 'payments', title: 'Online-Zahlungen', icon: Wallet, path: '/zahlungen', category: 'navigation', keywords: ['stripe', 'paypal', 'zahlung'] },
  { id: 'backup', title: 'Datensicherung', icon: HardDrive, path: '/backup', category: 'navigation', keywords: ['backup', 'sicherung', 'export'] },
  { id: 'companies', title: 'Firmen', icon: Building2, path: '/firmen', category: 'navigation', keywords: ['firma', 'mandant', 'company'] },
  { id: 'calendar', title: 'Kalender', icon: Calendar, path: '/kalender', category: 'navigation', keywords: ['termin', 'fälligkeit', 'calendar'] },
  { id: 'templates', title: 'Vorlagen', icon: Mail, path: '/vorlagen', category: 'navigation', keywords: ['vorlage', 'template', 'email'] },
  { id: 'settings', title: 'Einstellungen', icon: Settings, path: '/einstellungen', category: 'navigation', keywords: ['einstellung', 'config'] },
  { id: 'help', title: 'Hilfe', icon: HelpCircle, path: '/hilfe', category: 'navigation', keywords: ['hilfe', 'faq', 'support'] },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((item: SearchItem) => {
    setOpen(false);
    navigate(item.path);
  }, [navigate]);

  const groupedItems = useMemo(() => {
    return {
      navigation: SEARCH_ITEMS.filter(i => i.category === 'navigation'),
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg border transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Suchen...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Seite oder Funktion suchen..." />
        <CommandList>
          <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {groupedItems.navigation.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item)}
                className="flex items-center gap-3"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
