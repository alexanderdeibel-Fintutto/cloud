import { Link } from "react-router-dom";
import {
  ClipboardList,
  Building,
  Calendar,
  MessageSquare,
  Camera,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
  shadowColor: string;
}

const actions: QuickAction[] = [
  {
    label: "Aufgaben",
    icon: ClipboardList,
    href: "/aufgaben",
    gradient: "from-primary to-accent",
    shadowColor: "shadow-primary/30",
  },
  {
    label: "Objekte",
    icon: Building,
    href: "/objekte",
    gradient: "from-blue-500 to-cyan-500",
    shadowColor: "shadow-blue-500/30",
  },
  {
    label: "Kalender",
    icon: Calendar,
    href: "/kalender",
    gradient: "from-purple-500 to-pink-500",
    shadowColor: "shadow-purple-500/30",
  },
  {
    label: "Nachrichten",
    icon: MessageSquare,
    href: "/nachrichten",
    gradient: "from-orange-500 to-amber-500",
    shadowColor: "shadow-orange-500/30",
  },
];

export function QuickActions() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Schnellzugriff
      </h2>

      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <Link
            key={action.label}
            to={action.href}
            className={cn(
              "group relative flex flex-col items-center gap-2 rounded-2xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_24px_-4px_rgba(0,0,0,0.3)] p-4",
              "transition-all duration-300 hover:border-primary/30 active:scale-95",
              "hover:shadow-lg",
              action.shadowColor
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Icon container with gradient */}
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br transition-all duration-300",
                "group-hover:scale-110 group-hover:shadow-lg",
                action.gradient,
                action.shadowColor
              )}
            >
              <action.icon className="h-6 w-6 text-white drop-shadow-sm" />
            </div>

            {/* Label */}
            <span className="text-xs font-medium text-foreground text-center">
              {action.label}
            </span>

            {/* Hover glow effect */}
            <div
              className={cn(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
                "bg-gradient-to-br blur-xl",
                action.gradient
              )}
              style={{ opacity: 0.1 }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
