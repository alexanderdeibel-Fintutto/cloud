import { Home, Wallet, Plus, MessageCircle, Menu, X, Wrench, Gauge, FileText } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/finanzen", icon: Wallet, label: "Finanzen" },
  { to: "#melden", icon: Plus, label: "Melden", isAction: true },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/mehr", icon: Menu, label: "Mehr" },
];

const reportActions = [
  { to: "/mangel-melden", label: "Mangel melden", icon: Wrench, color: "bg-coral" },
  { to: "/zaehler-ablesen", label: "Zähler ablesen", icon: Gauge, color: "bg-mint" },
  { to: "/dokument-anfragen", label: "Dokument anfragen", icon: FileText, color: "bg-sky" },
];

export function BottomNavigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Floating Action Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Floating Action Menu */}
      {isMenuOpen && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3">
          {reportActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <NavLink
                key={action.to}
                to={action.to}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 bg-card px-5 py-3.5 rounded-2xl shadow-xl animate-fab-open border border-border/50 hover:scale-105 transition-transform"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", action.color)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-foreground pr-2">{action.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Bottom Navigation Bar with Glassmorphism */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border/50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.to !== "#melden" && location.pathname === item.to;

            if (item.isAction) {
              return (
                <button
                  key={item.label}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex flex-col items-center justify-center -mt-6 transition-all duration-200"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-all duration-300",
                    isMenuOpen ? "rotate-45 scale-110" : "hover:scale-105",
                    isMenuOpen && "shadow-primary/50"
                  )}>
                    {isMenuOpen ? (
                      <X className="h-6 w-6 text-white" />
                    ) : (
                      <Plus className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <span className="text-xs mt-1.5 text-muted-foreground font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px] relative",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110 animate-bounce-in"
                )}>
                  <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary animate-scale-in" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
