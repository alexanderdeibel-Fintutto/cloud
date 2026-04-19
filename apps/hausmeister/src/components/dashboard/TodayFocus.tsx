import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, Clock, MapPin, Zap, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TodayFocusProps {
  task: Task | null;
}

const priorityConfig = {
  low: { 
    label: "Niedrig", 
    className: "bg-green-500/20 text-green-400 border-green-500/30",
    bgGradient: "from-green-500/10 via-transparent to-transparent"
  },
  medium: { 
    label: "Mittel", 
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    bgGradient: "from-yellow-500/10 via-transparent to-transparent"
  },
  high: { 
    label: "Hoch", 
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    bgGradient: "from-orange-500/10 via-transparent to-transparent"
  },
  urgent: { 
    label: "Dringend", 
    className: "bg-red-500/20 text-red-400 border-red-500/30",
    bgGradient: "from-red-500/10 via-transparent to-transparent"
  },
};

export function TodayFocus({ task }: TodayFocusProps) {
  if (!task) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-white/[0.06] backdrop-blur-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">Alles erledigt! 🎉</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Super! Du hast alle wichtigen Aufgaben erledigt. Gönn dir eine Pause.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const priority = priorityConfig[task.priority];
  const isUrgent = task.priority === "urgent" || task.priority === "high";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Fokus des Tages
        </h2>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-all duration-300",
          isUrgent
            ? "border-destructive/40 bg-gradient-to-br from-destructive/10 via-white/[0.06] to-white/[0.06] backdrop-blur-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_24px_-4px_rgba(0,0,0,0.3)]"
            : "border-white/[0.12] bg-white/[0.06] backdrop-blur-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_24px_-4px_rgba(0,0,0,0.3)] hover:border-primary/30"
        )}
      >
        {/* Animated background for urgent tasks */}
        {isUrgent && (
          <>
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-destructive/20 blur-3xl animate-pulse-subtle" />
            <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />
          </>
        )}

        <div className="relative p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Alert for urgent */}
              {isUrgent && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-destructive/20 px-2.5 py-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive animate-pulse" />
                    <span className="text-xs font-semibold text-destructive">
                      Priorität!
                    </span>
                  </div>
                </div>
              )}

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground line-clamp-2">
                {task.title}
              </h3>

              {/* Location */}
              {task.building && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>
                    {task.building.name}
                    {task.unit && ` • ${task.unit.unit_number}`}
                  </span>
                </div>
              )}

              {/* Description preview */}
              {task.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Priority Badge */}
            <Badge className={cn("shrink-0 border", priority.className)}>
              {priority.label}
            </Badge>
          </div>

          {/* Action Button */}
          <Link to={`/aufgaben/${task.id}`} className="mt-4 block">
            <Button
              className={cn(
                "w-full h-12 gap-2 text-base font-semibold rounded-xl transition-all",
                isUrgent
                  ? "bg-destructive hover:bg-destructive/90 glow-destructive"
                  : "bg-primary hover:bg-primary/90 glow-primary"
              )}
            >
              <Zap className="h-5 w-5" />
              Jetzt starten
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
