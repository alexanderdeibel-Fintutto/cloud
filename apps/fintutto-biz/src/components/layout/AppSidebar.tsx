import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBusinesses } from "@/hooks/useBusinesses";
import { BusinessSwitcher } from "@/components/BusinessSwitcher";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Calculator,
  CreditCard,
  Settings,
  LogOut,
  Clock,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Rechnungen", icon: FileText, path: "/rechnungen" },
  { label: "Ausgaben", icon: Receipt, path: "/ausgaben" },
  { label: "Zeiterfassung", icon: Clock, path: "/zeiterfassung" },
  { label: "Kunden", icon: Users, path: "/kunden" },
  { label: "Steuern", icon: Calculator, path: "/steuern" },
  { label: "Preise", icon: CreditCard, path: "/preise" },
  { label: "Einstellungen", icon: Settings, path: "/einstellungen" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { businesses, activeBusinessId, switchBusiness, createBusiness } = useBusinesses();
  const [showNewBizForm, setShowNewBizForm] = useState(false);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-white/10 bg-background">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-white/10">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">FC</span>
        </div>
        <span className="text-lg font-bold text-white">Financial Compass</span>
      </div>
      {/* Business Switcher */}
      <div className="border-b border-white/10 py-2">
        <BusinessSwitcher
          businesses={businesses}
          activeBusinessId={activeBusinessId}
          onSwitch={switchBusiness}
          onCreateNew={() => setShowNewBizForm(true)}
        />
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
      {/* Neue Firma Dialog */}
      {showNewBizForm && (
        <NewBusinessDialog
          onClose={() => setShowNewBizForm(false)}
          onCreate={async (name, type) => {
            await createBusiness(name, type);
            setShowNewBizForm(false);
          }}
        />
      )}
    </aside>
  );
}

function NewBusinessDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, type: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("freelancer");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim(), type);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">Neue Firma anlegen</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Firmenname *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Muster GmbH"
              required
              autoFocus
              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Rechtsform</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
            >
              <option value="freelancer">Freelancer</option>
              <option value="einzelunternehmen">Einzelunternehmen</option>
              <option value="gbr">GbR</option>
              <option value="ug">UG (haftungsbeschränkt)</option>
              <option value="gmbh">GmbH</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-white/10 py-2.5 text-sm text-muted-foreground hover:bg-white/5"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Wird angelegt..." : "Anlegen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
