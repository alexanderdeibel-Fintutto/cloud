import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
  delay?: number;
  className?: string;
}

export function StatsCard({
  value,
  label,
  icon,
  trend,
  gradient = "gradient-primary",
  delay = 0,
  className,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 text-white shadow-xl",
        gradient,
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 backdrop-blur-sm">
            {icon}
          </div>
        )}
        
        {/* Value */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay * 0.1 + 0.1 }}
          className="text-3xl font-bold"
        >
          {value}
        </motion.p>
        
        {/* Label */}
        <p className="text-white/80 text-sm mt-1">{label}</p>
        
        {/* Trend */}
        {trend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay * 0.1 + 0.2 }}
            className={cn(
              "inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium",
              trend.isPositive ? "bg-white/20" : "bg-black/20"
            )}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
