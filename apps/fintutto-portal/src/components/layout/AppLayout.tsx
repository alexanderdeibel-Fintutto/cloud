import { ReactNode, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { NotificationCenter } from '@/components/NotificationCenter';
import { CommandPalette } from '@/components/CommandPalette';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAppShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleNewBooking = useCallback(() => {
    navigate('/buchungen?action=new');
  }, [navigate]);

  const handleNewInvoice = useCallback(() => {
    navigate('/rechnungen?action=new');
  }, [navigate]);

  const handleUploadReceipt = useCallback(() => {
    navigate('/belege?action=upload');
  }, [navigate]);

  const handleScanReceipt = useCallback(() => {
    navigate('/belege?action=scan');
  }, [navigate]);

  // Register keyboard shortcuts
  useAppShortcuts({
    onOpenCommandPalette: () => setCommandPaletteOpen(true),
    onNewBooking: handleNewBooking,
    onNewInvoice: handleNewInvoice,
    onUploadReceipt: handleUploadReceipt,
    onSearch: () => setCommandPaletteOpen(true),
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center lg:hidden">
              <SidebarTrigger>
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <span className="ml-4 font-semibold gradient-text">Fintutto</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground gap-2 w-64 justify-start"
                onClick={() => setCommandPaletteOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span>Suche...</span>
                <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationCenter />
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNewBooking={handleNewBooking}
        onNewInvoice={handleNewInvoice}
        onUploadReceipt={handleUploadReceipt}
      />

      {/* Floating Action Button (mobile only) */}
      <FloatingActionButton
        onNewBooking={handleNewBooking}
        onNewInvoice={handleNewInvoice}
        onUploadReceipt={handleUploadReceipt}
        onScanReceipt={handleScanReceipt}
      />
    </SidebarProvider>
  );
}
