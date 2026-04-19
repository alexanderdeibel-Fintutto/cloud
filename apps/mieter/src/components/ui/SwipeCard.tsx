import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface SwipeCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = "Ablehnen",
  rightLabel = "Annehmen",
  className,
}: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Background indicators
  const leftOpacity = useTransform(x, [-200, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 200], [0, 0.5, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(300);
      onSwipeRight?.();
    } else if (info.offset.x < -100) {
      setExitX(-300);
      onSwipeLeft?.();
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Left indicator */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-destructive/20 flex items-center justify-start pl-6 pointer-events-none"
        style={{ opacity: leftOpacity }}
      >
        <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center">
          <X className="h-6 w-6 text-white" />
        </div>
        <span className="ml-3 font-semibold text-destructive">{leftLabel}</span>
      </motion.div>

      {/* Right indicator */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-success/20 flex items-center justify-end pr-6 pointer-events-none"
        style={{ opacity: rightOpacity }}
      >
        <span className="mr-3 font-semibold text-success">{rightLabel}</span>
        <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
          <Check className="h-6 w-6 text-white" />
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={{ x: exitX }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}
