import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorVariant = "primary" | "secondary" | "mint" | "coral" | "sky" | "amber" | "success" | "warning" | "destructive" | "info";

interface IconBadgeProps {
  icon: LucideIcon;
  variant?: ColorVariant;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<ColorVariant, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  mint: "bg-mint/10 text-mint",
  coral: "bg-coral/10 text-coral",
  sky: "bg-sky/10 text-sky",
  amber: "bg-amber/10 text-amber",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

const sizeStyles = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function IconBadge({ 
  icon: Icon, 
  variant = "primary", 
  size = "md",
  pulse = false,
  className 
}: IconBadgeProps) {
  return (
    <div 
      className={cn(
        "rounded-xl flex items-center justify-center transition-all duration-300",
        variantStyles[variant],
        sizeStyles[size],
        pulse && "animate-pulse-soft",
        className
      )}
    >
      <Icon className={cn(iconSizes[size], "transition-transform")} />
    </div>
  );
}
