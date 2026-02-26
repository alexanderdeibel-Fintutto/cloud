import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Calculator,
  CreditCard,
  Settings,
  LogOut,
  Briefcase,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Rechnungen", icon: FileText, path: "/rechnungen" },
  { label: "Ausgaben", icon: Receipt, path: "/ausgaben" },
  { label: "Kunden", icon: Users, path: "/kunden" },
  { label: "Steuern", icon: Calculator, path: "/steuern" },
  { label: "Preise", icon: CreditCard, path: "/preise" },
  { label: "Einstellungen", icon: Settings, path: "/einstellungen" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-white/10 bg-background">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-white/10">
        <Briefcase className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-white">Fintutto Biz</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
