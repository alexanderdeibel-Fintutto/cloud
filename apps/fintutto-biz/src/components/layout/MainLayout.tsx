import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { Menu, ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

export interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: Breadcrumb[];
}

export function MainLayout({ children, title, breadcrumbs }: MainLayoutProps) {
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
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  {crumb.href ? (
                    <Link to={crumb.href} className="text-muted-foreground hover:text-white transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          ) : (
            title && <h1 className="text-lg font-semibold text-white">{title}</h1>
          )}
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
