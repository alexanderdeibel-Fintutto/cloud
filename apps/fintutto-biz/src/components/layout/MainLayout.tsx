import { useState, type ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { Menu } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-white/10 px-4 md:px-6 backdrop-blur-md bg-white/5">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-white/5"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
