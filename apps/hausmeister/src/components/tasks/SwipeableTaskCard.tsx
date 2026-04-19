import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, X, ChevronRight, MapPin, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface SwipeableTaskCardProps {
  task: Task;
  onComplete?: (task: Task) => void;
  onReject?: (task: Task) => void;
  index?: number;
}

const priorityConfig = {
  low: { 
    label: "Niedrig", 
    className: "priority-low",
    dotColor: "bg-green-500",
    glowColor: "shadow-green-500/20"
  },
  medium: { 
    label: "Mittel", 
    className: "priority-medium",
    dotColor: "bg-yellow-500",
    glowColor: "shadow-yellow-500/20"
  },
  high: { 
    label: "Hoch", 
    className: "priority-high",
    dotColor: "bg-orange-500",
    glowColor: "shadow-orange-500/20"
  },
  urgent: { 
    label: "Dringend", 
    className: "priority-urgent",
    dotColor: "bg-red-500",
    glowColor: "shadow-red-500/20"
  },
};

const statusConfig = {
  open: { label: "Offen", className: "status-open" },
  in_progress: { label: "In Arbeit", className: "status-in-progress" },
  completed: { label: "Erledigt", className: "status-completed" },
};

export function SwipeableTaskCard({ task, onComplete, onReject, index = 0 }: SwipeableTaskCardProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const location = task.unit
    ? `${task.building?.name} • ${task.unit.unit_number}`
    : task.building?.name;

  const timeAgo = formatDistanceToNow(new Date(task.created_at), {
    addSuffix: true,
    locale: de,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    
    // Limit swipe distance
    const maxSwipe = 120;
    const newOffset = Math.max(-maxSwipe, Math.min(maxSwipe, diff));
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Threshold for action
    const threshold = 80;
    
    if (offset > threshold) {
      // Swipe right - Complete
      onComplete?.(task);
    } else if (offset < -threshold) {
      // Swipe left - Reject
      onReject?.(task);
    }
    
    // Reset position
    setOffset(0);
  };

  const swipeLeftActive = offset < -40;
  const swipeRightActive = offset > 40;

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{ 
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {/* Left action (reject) */}
        <div
          className={cn(
            "flex-1 flex items-center justify-start px-6 transition-all duration-200",
            swipeLeftActive 
              ? "bg-destructive" 
              : "bg-destructive/50"
          )}
        >
          <div className={cn(
            "flex items-center gap-2 transition-all duration-200",
            swipeLeftActive ? "scale-110 text-destructive-foreground" : "scale-100 text-destructive-foreground/70"
          )}>
            <X className="h-6 w-6" />
            <span className="font-medium">Ablehnen</span>
          </div>
        </div>
        
        {/* Right action (complete) */}
        <div
          className={cn(
            "flex-1 flex items-center justify-end px-6 transition-all duration-200",
            swipeRightActive 
              ? "bg-success" 
              : "bg-success/50"
          )}
        >
          <div className={cn(
            "flex items-center gap-2 transition-all duration-200",
            swipeRightActive ? "scale-110 text-success-foreground" : "scale-100 text-success-foreground/70"
          )}>
            <span className="font-medium">Erledigt</span>
            <Check className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Card content */}
      <div
        ref={cardRef}
        className={cn(
          "relative bg-white/[0.06] border border-white/[0.12] rounded-xl backdrop-blur-3xl transition-shadow duration-200",
          isDragging ? "shadow-2xl" : "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_24px_-4px_rgba(0,0,0,0.3)] hover:shadow-lg",
          task.priority === "urgent" && "border-destructive/30"
        )}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link to={`/aufgaben/${task.id}`} className="block">
          <div className="p-5">
            {/* Priority indicator line */}
            <div className={cn(
              "absolute left-0 top-4 bottom-4 w-1 rounded-full",
              priority.dotColor
            )} />

            <div className="flex items-start gap-3 pl-3">
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={cn("text-xs", priority.className)}>
                    {priority.label}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", status.className)}>
                    {status.label}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground text-base line-clamp-2 group-hover:text-primary transition-colors">
                  {task.title}
                </h3>

                {/* Location */}
                {location && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}

                {/* Meta info */}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  {task.reported_by_name && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{task.reported_by_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo}</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
