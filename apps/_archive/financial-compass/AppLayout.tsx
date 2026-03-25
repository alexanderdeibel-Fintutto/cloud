import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Menu } from 'lucide-react';
import GlobalAIChatButton from '@/components/ai/GlobalAIChatButton';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 lg:hidden">
            <SidebarTrigger>
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <span className="ml-4 font-semibold gradient-text">Fintutto</span>
          </header>
          <div className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </div>
        </main>

        {/* Global AI Chat */}
        <GlobalAIChatButton />
      </div>
    </SidebarProvider>
  );
}
