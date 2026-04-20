import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Zap, Plus, FileText, FolderOpen, Receipt, Users, Euro,
  Upload, Download, BarChart3, Calculator, RefreshCw
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: 'create' | 'import' | 'export' | 'other';
}

export function QuickActions() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const actions: QuickAction[] = [
    // Create
    {
      id: 'new-invoice',
      title: 'Neue Rechnung',
      icon: FileText,
      action: () => navigate('/rechnungen?action=new'),
      category: 'create',
    },
    {
      id: 'new-receipt',
      title: 'Neuer Beleg',
      icon: FolderOpen,
      action: () => navigate('/belege?action=new'),
      category: 'create',
    },
    {
      id: 'new-booking',
      title: 'Neue Buchung',
      icon: Receipt,
      action: () => navigate('/buchungen?action=new'),
      category: 'create',
    },
    {
      id: 'new-contact',
      title: 'Neuer Kontakt',
      icon: Users,
      action: () => navigate('/kontakte?action=new'),
      category: 'create',
    },
    {
      id: 'new-sepa',
      title: 'SEPA-Zahlung',
      icon: Euro,
      action: () => navigate('/sepa?action=new'),
      category: 'create',
    },

    // Import
    {
      id: 'import-receipts',
      title: 'Belege importieren',
      icon: Upload,
      action: () => navigate('/scanner'),
      category: 'import',
    },
    {
      id: 'import-bank',
      title: 'Kontoauszug importieren',
      icon: Upload,
      action: () => navigate('/bankkonten?action=import'),
      category: 'import',
    },

    // Export
    {
      id: 'export-datev',
      title: 'DATEV-Export',
      icon: Download,
      action: () => navigate('/berichte?export=datev'),
      category: 'export',
    },
    {
      id: 'export-reports',
      title: 'Berichte exportieren',
      icon: BarChart3,
      action: () => navigate('/berichte'),
      category: 'export',
    },

    // Other
    {
      id: 'bank-sync',
      title: 'Bank synchronisieren',
      icon: RefreshCw,
      action: () => navigate('/bankverbindung'),
      category: 'other',
    },
    {
      id: 'calculate-vat',
      title: 'UStVA berechnen',
      icon: Calculator,
      action: () => navigate('/elster'),
      category: 'other',
    },
  ];

  const handleAction = (action: QuickAction) => {
    setOpen(false);
    action.action();
  };

  const groupedActions = {
    create: actions.filter(a => a.category === 'create'),
    import: actions.filter(a => a.category === 'import'),
    export: actions.filter(a => a.category === 'export'),
    other: actions.filter(a => a.category === 'other'),
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-2">
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">Schnellaktionen</span>
          <Plus className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Schnellaktionen</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Erstellen
          </DropdownMenuLabel>
          {groupedActions.create.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleAction(action)}
              className="gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Importieren
          </DropdownMenuLabel>
          {groupedActions.import.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleAction(action)}
              className="gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Exportieren
          </DropdownMenuLabel>
          {groupedActions.export.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleAction(action)}
              className="gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Sonstiges
          </DropdownMenuLabel>
          {groupedActions.other.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleAction(action)}
              className="gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
