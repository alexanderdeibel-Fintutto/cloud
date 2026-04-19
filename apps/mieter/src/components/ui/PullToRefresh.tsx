import { useState, useRef, useCallback, ReactNode } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  pullDistance?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  pullDistance = 80,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useMotionValue(0);

  const progress = useTransform(currentY, [0, pullDistance], [0, 1]);
  const rotation = useTransform(currentY, [0, pullDistance], [0, 180]);
  const scale = useTransform(currentY, [0, pullDistance * 0.5, pullDistance], [0.5, 0.8, 1]);
  const opacity = useTransform(currentY, [0, pullDistance * 0.3], [0, 1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      // Resistance effect - pull gets harder
      const resistance = Math.min(diff * 0.5, pullDistance * 1.2);
      currentY.set(resistance);
    }
  }, [isPulling, isRefreshing, currentY, pullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    setIsPulling(false);

    const pullValue = currentY.get();
    if (pullValue >= pullDistance && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    currentY.set(0);
  }, [isPulling, currentY, pullDistance, isRefreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
            style={{
              top: useTransform(currentY, (y) => Math.max(y - 48, -48)),
              opacity,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={cn(
                "w-12 h-12 rounded-full bg-background shadow-lg border border-border flex items-center justify-center",
                isRefreshing && "bg-primary/10"
              )}
              style={{ scale }}
            >
              <motion.div
                style={{ rotate: isRefreshing ? undefined : rotation }}
                animate={isRefreshing ? { rotate: 360 } : undefined}
                transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : undefined}
              >
                <RefreshCw className={cn(
                  "w-5 h-5",
                  isRefreshing ? "text-primary" : "text-muted-foreground"
                )} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with pull transform */}
      <motion.div
        style={{
          y: isPulling ? currentY : 0,
        }}
        animate={!isPulling && !isRefreshing ? { y: 0 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
