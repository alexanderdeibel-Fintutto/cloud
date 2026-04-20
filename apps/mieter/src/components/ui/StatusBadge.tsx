import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  status: StatusVariant;
  label: string;
  showDot?: boolean;
  animate?: boolean;
  className?: string;
}

const statusStyles: Record<StatusVariant, { bg: string; text: string; dot: string }> = {
  success: {
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning",
  },
  error: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  info: {
    bg: "bg-info/10",
    text: "text-info",
    dot: "bg-info",
  },
  neutral: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export function StatusBadge({ 
  status, 
  label, 
  showDot = true, 
  animate = false,
  className 
}: StatusBadgeProps) {
  const styles = statusStyles[status];
  
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
        styles.bg,
        styles.text,
        animate && "animate-bounce-in",
        className
      )}
    >
      {showDot && (
        <span 
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            styles.dot,
            status === "warning" && "animate-pulse"
          )} 
        />
      )}
      {label}
    </span>
  );
}
