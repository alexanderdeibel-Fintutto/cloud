import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, AlertTriangle, AppWindow, Wrench, Server,
  Link2, Users, Building2, CreditCard, Target, Handshake, Package, Layers,
  FileText, Home, Bot, Settings as SettingsIcon, Bell, Shield, Wallet,
  MessageSquare, MonitorDot, HelpCircle,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  section: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, section: 'Ubersicht' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, section: 'Ubersicht' },
  { label: 'Error Logs', path: '/errors', icon: AlertTriangle, section: 'Ubersicht' },
  { label: 'App Registry', path: '/apps', icon: AppWindow, section: 'Ecosystem' },
  { label: 'Tools Registry', path: '/tools', icon: Wrench, section: 'Ecosystem' },
  { label: 'Services', path: '/services', icon: Server, section: 'Ecosystem' },
  { label: 'URL Check', path: '/url-check', icon: Link2, section: 'Ecosystem' },
  { label: 'Nutzer', path: '/users', icon: Users, section: 'Kunden & Revenue' },
  { label: 'Organisationen', path: '/organizations', icon: Building2, section: 'Kunden & Revenue' },
  { label: 'Subscriptions', path: '/subscriptions', icon: CreditCard, section: 'Kunden & Revenue' },
  { label: 'Leads', path: '/leads', icon: Target, section: 'Kunden & Revenue' },
  { label: 'Partners', path: '/partners', icon: Handshake, section: 'Kunden & Revenue' },
  { label: 'Produkte', path: '/products', icon: Package, section: 'Produkte & Content' },
  { label: 'Dokumente', path: '/documents', icon: FileText, section: 'Produkte & Content' },
  { label: 'Immobilien', path: '/properties', icon: Home, section: 'Produkte & Content' },
  { label: 'KI-Config', path: '/ai-config', icon: Bot, section: 'KI & Konfiguration' },
  { label: 'KI-Center', path: '/ai-center', icon: Bot, section: 'KI & Konfiguration' },
  { label: 'Benachrichtigungen', path: '/notifications', icon: Bell, section: 'System' },
  { label: 'Rollen & Sicherheit', path: '/roles-security', icon: Shield, section: 'System' },
  { label: 'Finanzen', path: '/finance', icon: Wallet, section: 'System' },
  { label: 'Community', path: '/community', icon: MessageSquare, section: 'System' },
  { label: 'DevOps', path: '/devops', icon: MonitorDot, section: 'System' },
  { label: 'Support', path: '/support', icon: HelpCircle, section: 'Support' },
  { label: 'Einstellungen', path: '/settings', icon: SettingsIcon, section: 'Support' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
  }, [navigate]);

  const sections = Array.from(new Set(navItems.map(i => i.section)));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Seite suchen... (Cmd+K)" />
      <CommandList>
        <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
        {sections.map((section, idx) => (
          <div key={section}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={section}>
              {navItems.filter(i => i.section === section).map(item => (
                <CommandItem key={item.path} onSelect={() => handleSelect(item.path)}>
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
