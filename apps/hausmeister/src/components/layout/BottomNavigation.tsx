import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Building, FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Start", icon: Home },
  { path: "/aufgaben", label: "Aufgaben", icon: ClipboardList },
  { path: "/objekte", label: "Objekte", icon: Building },
  { path: "/belege", label: "Belege", icon: FileText },
  { path: "/nachrichten", label: "Chat", icon: MessageSquare },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[64px] touch-target transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-primary shadow-lg shadow-primary/50" />
              )}

              {/* Icon container */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                  isActive && "bg-primary/15 scale-110"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive && "stroke-[2.5]"
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] transition-all duration-200",
                  isActive ? "font-bold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
