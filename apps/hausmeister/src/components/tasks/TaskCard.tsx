import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
}

const priorityConfig = {
  low: { label: "Niedrig", className: "priority-low" },
  medium: { label: "Mittel", className: "priority-medium" },
  high: { label: "Hoch", className: "priority-high" },
  urgent: { label: "Dringend", className: "priority-urgent" },
};

const statusConfig = {
  open: { label: "Offen", className: "status-open" },
  in_progress: { label: "In Arbeit", className: "status-in-progress" },
  completed: { label: "Erledigt", className: "status-completed" },
};

export function TaskCard({ task }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const location = task.unit 
    ? `${task.building?.name} - ${task.unit.unit_number}`
    : task.building?.name;

  const timeAgo = formatDistanceToNow(new Date(task.created_at), { 
    addSuffix: true,
    locale: de 
  });

  return (
    <Link to={`/aufgaben/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow active:scale-[0.98] touch-target">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn("text-xs", priority.className)}>
                  {priority.label}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", status.className)}>
                  {status.label}
                </Badge>
              </div>
              
              <h2 className="font-semibold text-foreground truncate text-base">
                {task.title}
              </h2>
              
              {location && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {location}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                {task.reported_by_name && (
                  <span>Gemeldet von {task.reported_by_name}</span>
                )}
                <span>•</span>
                <span>{timeAgo}</span>
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
