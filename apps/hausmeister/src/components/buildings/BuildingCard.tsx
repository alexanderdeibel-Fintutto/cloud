import { Link } from "react-router-dom";
import { Building as BuildingIcon, ChevronRight, MapPin, Home, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Building } from "@/types";

interface BuildingCardProps {
  building: Building;
  openTasks: number;
  index?: number;
}

export function BuildingCard({ building, openTasks, index = 0 }: BuildingCardProps) {
  const hasUrgentTasks = openTasks > 3;

  return (
    <Link
      to={`/objekte/${building.id}`}
      className="block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_24px_-4px_rgba(0,0,0,0.3)] p-5 transition-all duration-300",
          "hover:border-primary/30 hover:shadow-lg active:scale-[0.98]",
          hasUrgentTasks && "border-warning/30"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Building Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20 shrink-0">
            <BuildingIcon className="h-7 w-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground truncate text-base">
                {building.name}
              </h3>
              {openTasks > 0 && (
                <Badge
                  className={cn(
                    "shrink-0 border",
                    hasUrgentTasks
                      ? "bg-warning/20 text-warning border-warning/30"
                      : "bg-destructive/20 text-destructive border-destructive/30"
                  )}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {openTasks}
                </Badge>
              )}
            </div>

            {/* Address */}
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{building.address}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-secondary">
                  <Home className="h-3 w-3" />
                </div>
                {building.units_count} Einheiten
              </span>
              {building.year_built && (
                <span className="text-muted-foreground/70">
                  Bj. {building.year_built}
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
