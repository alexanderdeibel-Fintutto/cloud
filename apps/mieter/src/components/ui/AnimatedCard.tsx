import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  accentColor?: "primary" | "secondary" | "mint" | "coral" | "sky" | "amber";
  hover?: boolean;
  className?: string;
}

const accentBorders: Record<string, string> = {
  primary: "hover:border-primary/30",
  secondary: "hover:border-secondary/30",
  mint: "hover:border-mint/30",
  coral: "hover:border-coral/30",
  sky: "hover:border-sky/30",
  amber: "hover:border-amber/30",
};

export function AnimatedCard({
  children,
  delay = 0,
  accentColor,
  hover = true,
  className,
}: AnimatedCardProps) {
  return (
    <Card
      className={cn(
        "animate-slide-up transition-all duration-300",
        hover && "hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 active:scale-[0.98]",
        accentColor && accentBorders[accentColor],
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
    >
      {children}
    </Card>
  );
}
