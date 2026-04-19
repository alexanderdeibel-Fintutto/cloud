import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";

interface TaskFiltersProps {
  activeFilter: TaskStatus | "all";
  onFilterChange: (filter: TaskStatus | "all") => void;
  counts: {
    all: number;
    open: number;
    in_progress: number;
    completed: number;
  };
}

const filters = [
  { value: "all" as const, label: "Alle" },
  { value: "open" as const, label: "Offen" },
  { value: "in_progress" as const, label: "In Arbeit" },
  { value: "completed" as const, label: "Erledigt" },
];

export function TaskFilters({ activeFilter, onFilterChange, counts }: TaskFiltersProps) {
  return (
    <div className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur-xl sticky top-[73px] z-30">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;
          const count = counts[filter.value];

          return (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                "border min-h-[40px]",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              <span>{filter.label}</span>
              <span
                className={cn(
                  "inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-bold tabular-nums",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
