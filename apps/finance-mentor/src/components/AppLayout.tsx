import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, BookOpen, Award, Settings,
  LogOut, ChevronRight, Route, BookOpenCheck, Calculator, ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppSwitcher } from "@fintutto/shared";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/lernpfade", label: "Lernpfade", icon: Route },
  { path: "/kurse", label: "Kurse", icon: BookOpen },
  { path: "/zertifikate", label: "Zertifikate", icon: Award },
  { path: "/glossar", label: "Glossar", icon: BookOpenCheck },
  { path: "/rechner", label: "Rechner", icon: Calculator },
  { path: "/checkliste", label: "Checkliste", icon: ClipboardCheck },
  { path: "/einstellungen", label: "Einstellungen", icon: Settings },
];

function AppLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="18" stroke="url(#logo-grad)" strokeWidth="3" />
      <text
        x="20" y="26"
        textAnchor="middle"
        fill="url(#logo-grad)"
        fontWeight="800"
        fontSize="22"
        fontFamily="system-ui, sans-serif"
      >
        F
      </text>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#a855f7" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-background p-4">
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <AppLogo className="h-10 w-10" />
          <div>
            <h1 className="font-bold text-lg">Finance Mentor</h1>
            <p className="text-xs text-muted-foreground">Finanz-Education</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mb-3">
          <AppSwitcher currentAppSlug="finance-mentor" />
        </div>

        <div className="border-t border-border/50 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {user?.email?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Abmelden
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="lg:hidden flex items-center justify-between border-b border-border/50 p-4">
          <div className="flex items-center gap-2">
            <AppLogo className="h-8 w-8" />
            <span className="font-bold">Finance Mentor</span>
          </div>
        </header>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/50 flex z-50">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
