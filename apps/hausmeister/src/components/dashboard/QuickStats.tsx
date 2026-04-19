import { ClipboardCheck, Clock, MessageSquare, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface StatItem {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  color: string;
  bgColor: string;
  glowClass?: string;
}

interface QuickStatsProps {
  tasksToday: number;
  tasksCompleted: number;
  hoursWorked: number;
  unreadMessages: number;
}

function AnimatedNumber({ value, className }: { value: number | string; className?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  useEffect(() => {
    const duration = 800;
    const steps = 20;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, numericValue);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(numericValue);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue]);

  const formatted = typeof value === "string" && value.includes(".")
    ? displayValue.toFixed(1)
    : Math.round(displayValue);

  return <span className={className}>{formatted}</span>;
}

export function QuickStats({ tasksToday, tasksCompleted, hoursWorked, unreadMessages }: QuickStatsProps) {
  const stats: StatItem[] = [
    {
      label: "Heute",
      value: tasksToday,
      icon: Zap,
      color: "text-primary",
      bgColor: "bg-primary/15",
      glowClass: "shadow-primary/20",
    },
    {
      label: "Erledigt",
      value: tasksCompleted,
      icon: TrendingUp,
      trend: 12,
      color: "text-green-400",
      bgColor: "bg-green-500/15",
      glowClass: "shadow-green-500/20",
    },
    {
      label: "Stunden",
      value: hoursWorked,
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-500/15",
      glowClass: "shadow-blue-500/20",
    },
    {
      label: "Neu",
      value: unreadMessages,
      icon: MessageSquare,
      color: "text-orange-400",
      bgColor: "bg-orange-500/15",
      glowClass: unreadMessages > 0 ? "shadow-orange-500/30 animate-pulse-subtle" : "shadow-orange-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "group relative flex flex-col items-center rounded-2xl bg-white/[0.06] p-3 border border-white/[0.12] backdrop-blur-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_24px_-4px_rgba(0,0,0,0.3)] transition-all duration-300",
            "hover:border-primary/30 hover:shadow-lg",
            stat.glowClass
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Glow effect on hover */}
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
            stat.bgColor,
            "blur-xl"
          )} />

          {/* Icon */}
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
              stat.bgColor
            )}
          >
            <stat.icon className={cn("h-5 w-5", stat.color)} />
          </div>

          {/* Value */}
          <div className="mt-2 flex items-baseline gap-1">
            <AnimatedNumber 
              value={stat.value} 
              className="text-xl font-bold text-foreground tabular-nums" 
            />
            {stat.trend && (
              <span className="text-[10px] font-medium text-green-400">
                +{stat.trend}%
              </span>
            )}
          </div>

          {/* Label */}
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
