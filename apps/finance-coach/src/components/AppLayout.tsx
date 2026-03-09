import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, PiggyBank, TrendingUp, Settings,
  LogOut, Wallet, Brain, ChevronRight, ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppSwitcher } from "@fintutto/shared";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/transaktionen", label: "Transaktionen", icon: ArrowLeftRight },
  { path: "/budget", label: "Budget", icon: PiggyBank },
  { path: "/sparziele", label: "Sparziele", icon: TrendingUp },
  { path: "/insights", label: "KI-Insights", icon: Brain },
  { path: "/einstellungen", label: "Einstellungen", icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-sidebar p-4">
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Finance Coach</h1>
            <p className="text-xs text-muted-foreground">KI-Finanzberatung</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
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
          <AppSwitcher currentAppSlug="finance-coach" />
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
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">Finance Coach</span>
          </div>
        </header>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/50 flex z-50">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
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
