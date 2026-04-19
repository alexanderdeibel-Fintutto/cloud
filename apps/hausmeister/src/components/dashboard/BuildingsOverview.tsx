import { Link } from "react-router-dom";
import { Building, ChevronRight, Home, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Building as BuildingType } from "@/types";

interface BuildingsOverviewProps {
  buildings: BuildingType[];
}

export function BuildingsOverview({ buildings }: BuildingsOverviewProps) {
  if (buildings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Deine Objekte
        </h2>
        <Link
          to="/objekte"
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          Alle anzeigen
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {buildings.slice(0, 5).map((building, index) => (
          <Link
            key={building.id}
            to={`/objekte/${building.id}`}
            className={cn(
              "group flex flex-col min-w-[140px] rounded-2xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_24px_-4px_rgba(0,0,0,0.3)] p-4",
              "transition-all duration-300 hover:border-primary/30 hover:shadow-lg active:scale-95"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Building className="h-6 w-6 text-white" />
            </div>

            {/* Name */}
            <h3 className="mt-3 font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {building.name}
            </h3>

            {/* Units count */}
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Home className="h-3.5 w-3.5" />
              <span>{building.units_count} Einheiten</span>
            </div>
          </Link>
        ))}

        {/* Add more indicator */}
        {buildings.length > 5 && (
          <Link
            to="/objekte"
            className="flex flex-col items-center justify-center min-w-[100px] rounded-2xl border border-dashed border-border p-4 transition-all hover:border-primary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="mt-2 text-xs text-muted-foreground">
              +{buildings.length - 5} mehr
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
