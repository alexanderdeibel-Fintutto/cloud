import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps {
  className?: string;
  variant?: "default" | "circle" | "card" | "text" | "avatar";
  lines?: number;
}

export function ShimmerSkeleton({ 
  className, 
  variant = "default",
  lines = 1 
}: ShimmerSkeletonProps) {
  const baseClass = "relative overflow-hidden bg-muted before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer";

  if (variant === "circle") {
    return (
      <div className={cn(baseClass, "rounded-full w-12 h-12", className)} />
    );
  }

  if (variant === "avatar") {
    return (
      <div className={cn(baseClass, "rounded-full w-10 h-10", className)} />
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-4 p-4 rounded-xl border border-border bg-card", className)}>
        <div className={cn(baseClass, "h-32 rounded-lg")} />
        <div className={cn(baseClass, "h-4 rounded w-3/4")} />
        <div className={cn(baseClass, "h-4 rounded w-1/2")} />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClass,
              "h-4 rounded",
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(baseClass, "rounded-lg h-10", className)} />
  );
}

// Pre-built skeleton layouts
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Hero skeleton */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-muted/50 to-muted">
        <ShimmerSkeleton className="h-6 w-32 mb-2" />
        <ShimmerSkeleton className="h-8 w-48 mb-4" />
        <ShimmerSkeleton className="h-4 w-24" />
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card">
            <ShimmerSkeleton variant="circle" className="w-12 h-12 mb-3" />
            <ShimmerSkeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <ShimmerSkeleton variant="avatar" />
            <div className="flex-1">
              <ShimmerSkeleton className="h-4 w-32 mb-2" />
              <ShimmerSkeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
          <ShimmerSkeleton variant="avatar" className="w-12 h-12" />
          <div className="flex-1">
            <ShimmerSkeleton className="h-4 w-28 mb-2" />
            <ShimmerSkeleton className="h-3 w-40" />
          </div>
          <ShimmerSkeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

export function FinanceSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Balance card */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-muted/50 to-muted">
        <ShimmerSkeleton className="h-4 w-24 mb-2" />
        <ShimmerSkeleton className="h-10 w-40 mb-4" />
        <div className="flex gap-4">
          <ShimmerSkeleton className="h-3 w-20" />
          <ShimmerSkeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <ShimmerSkeleton className="h-3 w-24" />
              <ShimmerSkeleton className="h-3 w-16" />
            </div>
            <ShimmerSkeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Payment history */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div>
              <ShimmerSkeleton className="h-4 w-24 mb-2" />
              <ShimmerSkeleton className="h-3 w-20" />
            </div>
            <ShimmerSkeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
