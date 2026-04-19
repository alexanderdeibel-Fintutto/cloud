import { AppCard } from "./AppCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppRegistryItem } from "@/types/apps";

interface AppGridProps {
  apps: AppRegistryItem[];
  currentAppId?: string;
  isLoading?: boolean;
}

export function AppGrid({ apps, currentAppId = "hausmeisterpro", isLoading }: AppGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  // Sort: current app first, then by sort_order
  const sortedApps = [...apps].sort((a, b) => {
    if (a.app_id === currentAppId) return -1;
    if (b.app_id === currentAppId) return 1;
    return a.sort_order - b.sort_order;
  });

  return (
    <div className="grid gap-4">
      {sortedApps.map((app) => (
        <AppCard 
          key={app.id} 
          app={app} 
          isCurrent={app.app_id === currentAppId}
        />
      ))}
    </div>
  );
}
