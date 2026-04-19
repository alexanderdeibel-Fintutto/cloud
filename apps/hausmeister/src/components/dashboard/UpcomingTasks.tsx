import { Link } from "react-router-dom";
import { ChevronRight, Clock, MapPin, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface UpcomingTasksProps {
  tasks: Task[];
}

const priorityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const priorityGlow = {
  low: "shadow-green-500/30",
  medium: "shadow-yellow-500/30",
  high: "shadow-orange-500/30",
  urgent: "shadow-red-500/30",
};

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Keine weiteren Aufgaben für heute
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Anstehende Aufgaben
        </h2>
        <Link
          to="/aufgaben"
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          Alle anzeigen
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {tasks.slice(0, 4).map((task, index) => (
          <Link
            key={task.id}
            to={`/aufgaben/${task.id}`}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_24px_-4px_rgba(0,0,0,0.3)] p-5",
              "transition-all duration-300 hover:border-primary/30 hover:shadow-lg active:scale-[0.98]",
              task.priority === "urgent" && "border-destructive/30"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Priority indicator */}
            <div
              className={cn(
                "h-12 w-1.5 rounded-full shrink-0 shadow-lg",
                priorityColors[task.priority],
                priorityGlow[task.priority]
              )}
            />

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {task.title}
              </h3>

              {/* Location */}
              {task.building && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{task.building.name}</span>
                  {task.unit && (
                    <span className="text-muted-foreground/60">
                      • {task.unit.unit_number}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Urgent indicator */}
            {task.priority === "urgent" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/20">
                <Zap className="h-4 w-4 text-destructive animate-pulse" />
              </div>
            )}

            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
