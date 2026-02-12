import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  FolderOpen,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Link2,
  CreditCard,
  Landmark,
  ClipboardCheck,
  Calendar,
  Mail,
  HelpCircle,
  Repeat,
  FileCheck,
  ClipboardList,
  Zap,
  Euro,
  UserCheck,
  ShoppingCart,
  Wallet,
  FileSpreadsheet,
  ScanLine,
  ArrowRightLeft,
  TrendingUp,
  GitCompare,
  LineChart,
  PiggyBank,
  HardDrive,
  Package,
  Coins,
  Archive,
  Gauge,
  Shield,
  Code,
  History,
  CalendarClock,
  ClockArrowUp,
  Wand2,
  BookTemplate,
  FileInput,
  CalendarCheck,
  Wallet2,
  Target,
  ListTree,
  Calculator,
  FolderKanban,
  RefreshCw,
  FileStack,
  AlertCircle,
  Banknote,
  BarChart,
  TableProperties,
  FileBarChart,
  Boxes,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NewCompanyDialog } from '@/components/company/NewCompanyDialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Buchungen', url: '/buchungen', icon: Receipt },
  { title: 'Wiederkehrend', url: '/wiederkehrend', icon: Repeat },
  { title: 'Angebote', url: '/angebote', icon: FileCheck },
  { title: 'Aufträge', url: '/auftraege', icon: ClipboardList },
  { title: 'Rechnungen', url: '/rechnungen', icon: FileText },
  { title: 'Belege', url: '/belege', icon: FolderOpen },
  { title: 'Beleg-Scanner', url: '/scanner', icon: ScanLine },
  { title: 'Kontakte', url: '/kontakte', icon: Users },
  { title: 'Bankkonten', url: '/bankkonten', icon: CreditCard },
  { title: 'Bankverbindung', url: '/bankverbindung', icon: Link2 },
  { title: 'Bank-Abstimmung', url: '/abstimmung', icon: ArrowRightLeft },
  { title: 'Bankregeln', url: '/bankregeln', icon: Wand2 },
  { title: 'SEPA-Zahlungen', url: '/sepa', icon: Euro },
  { title: 'Übergaben', url: '/uebergabe', icon: ClipboardCheck },
  { title: 'Kalender', url: '/kalender', icon: Calendar },
  { title: 'ELSTER', url: '/elster', icon: Landmark },
  { title: 'Berichte', url: '/berichte', icon: BarChart3 },
  { title: 'Cash-Flow', url: '/cashflow', icon: TrendingUp },
  { title: 'Vergleiche', url: '/vergleiche', icon: GitCompare },
  { title: 'Prognose', url: '/prognose', icon: LineChart },
  { title: 'Budgetplanung', url: '/budget', icon: PiggyBank },
  { title: 'Automatisierung', url: '/automatisierung', icon: Zap },
  { title: 'Steuerberater', url: '/steuerberater', icon: UserCheck },
  { title: 'E-Commerce', url: '/ecommerce', icon: ShoppingCart },
  { title: 'Online-Zahlungen', url: '/zahlungen', icon: Wallet },
  { title: 'Buchhaltungssoftware', url: '/software', icon: FileSpreadsheet },
  { title: 'Datensicherung', url: '/backup', icon: HardDrive },
  { title: 'Anlagenverwaltung', url: '/anlagen', icon: Package },
  { title: 'Währungen', url: '/waehrungen', icon: Coins },
  { title: 'Archiv', url: '/archiv', icon: Archive },
  { title: 'KPI-Dashboard', url: '/kpi', icon: Gauge },
  { title: 'Benutzer & Rollen', url: '/benutzer', icon: Shield },
  { title: 'API-Dokumentation', url: '/api-docs', icon: Code },
  { title: 'Audit-Log', url: '/audit', icon: History },
  { title: 'Steuerkalender', url: '/steuerkalender', icon: CalendarClock },
  { title: 'Bericht-Scheduler', url: '/report-scheduler', icon: ClockArrowUp },
  { title: 'Buchungsvorlagen', url: '/buchungsvorlagen', icon: BookTemplate },
  { title: 'Eingangsrechnungen', url: '/eingangsrechnungen', icon: FileInput },
  { title: 'Jahresabschluss', url: '/jahresabschluss', icon: CalendarCheck },
  { title: 'Zahlungen', url: '/zahlungsuebersicht', icon: Wallet2 },
  { title: 'Kostenstellen', url: '/kostenstellen', icon: Target },
  { title: 'Kontenplan', url: '/kontenplan', icon: ListTree },
  { title: 'USt-Voranmeldung', url: '/ustva', icon: Calculator },
  { title: 'Projekte', url: '/projekte', icon: FolderKanban },
  { title: 'Dauerbuchungen', url: '/dauerbuchungen', icon: RefreshCw },
  { title: 'Offene Posten', url: '/offene-posten', icon: FileStack },
  { title: 'Mahnwesen', url: '/mahnwesen', icon: AlertCircle },
  { title: 'Kassenbuch', url: '/kassenbuch', icon: Banknote },
  { title: 'BWA', url: '/bwa', icon: BarChart },
  { title: 'Saldenliste', url: '/saldenliste', icon: TableProperties },
  { title: 'Kontoauszüge', url: '/kontoauszuege', icon: FileBarChart },
  { title: 'Inventar', url: '/inventar', icon: Boxes },
  { title: 'Firmen', url: '/firmen', icon: Building2 },
  { title: 'Vorlagen', url: '/vorlagen', icon: Mail },
  { title: 'Einstellungen', url: '/einstellungen', icon: Settings },
  { title: 'Hilfe', url: '/hilfe', icon: HelpCircle },
];

const legalFormLabels: Record<string, string> = {
  gmbh: 'GmbH',
  ug: 'UG',
  ag: 'AG',
  kg: 'KG',
  ohg: 'OHG',
  gbr: 'GbR',
  einzelunternehmen: 'EU',
};

const avatarColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-amber-500',
];

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { companies, currentCompany, setCurrentCompany } = useCompany();
  const { toast } = useToast();
  const [newCompanyOpen, setNewCompanyOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const getAvatarColor = (index: number) => {
    return avatarColors[index % avatarColors.length];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCompanySwitch = (company: typeof currentCompany) => {
    if (!company || company.id === currentCompany?.id) return;
    
    // Trigger fade animation
    document.body.classList.add('animate-fade-out');
    
    setTimeout(() => {
      setCurrentCompany(company);
      document.body.classList.remove('animate-fade-out');
      document.body.classList.add('animate-fade-in');
      
      toast({
        title: 'Firma gewechselt',
        description: `Gewechselt zu ${company.name}`,
      });
      
      setTimeout(() => {
        document.body.classList.remove('animate-fade-in');
      }, 300);
    }, 150);
  };

  return (
    <>
      <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">F</span>
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">Fintutto</h1>
            <p className="text-xs text-muted-foreground">Finanzbuchhaltung</p>
          </div>
        </div>

        {/* Company Selector */}
        {companies.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full mt-4 justify-between text-left h-auto py-2 px-2 bg-sidebar-accent hover:bg-sidebar-accent/80"
              >
                <div className="flex items-center gap-2 truncate flex-1">
                  <Avatar className={cn('h-7 w-7 shrink-0', getAvatarColor(companies.findIndex(c => c.id === currentCompany?.id)))}>
                    <AvatarFallback className="text-white text-xs font-bold">
                      {currentCompany ? getInitials(currentCompany.name) : 'F'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate flex-1 min-w-0">
                    <span className="truncate block text-sm">{currentCompany?.name || 'Firma wählen'}</span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {companies.map((company, index) => (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => handleCompanySwitch(company)}
                  className={currentCompany?.id === company.id ? 'bg-accent' : ''}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className={cn('h-6 w-6 shrink-0', getAvatarColor(index))}>
                      <AvatarFallback className="text-white text-xs font-bold">
                        {getInitials(company.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate flex-1">{company.name}</span>
                    {(company as any).legal_form && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {legalFormLabels[(company as any).legal_form] || (company as any).legal_form}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <Separator className="my-1" />
              <DropdownMenuItem onClick={() => setNewCompanyOpen(true)}>
                <div className="flex items-center gap-2 w-full text-muted-foreground">
                  <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center">
                    <Plus className="h-3 w-3" />
                  </div>
                  <span>Neue Firma hinzufügen</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/20 text-primary">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      </Sidebar>

      <NewCompanyDialog open={newCompanyOpen} onOpenChange={setNewCompanyOpen} />
    </>
  );
}
