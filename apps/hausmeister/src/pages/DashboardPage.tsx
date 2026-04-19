import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, Loader2 } from "lucide-react";
import {
  GreetingHeader,
  QuickStats,
  TodayFocus,
  QuickActions,
  UpcomingTasks,
  BuildingsOverview,
} from "@/components/dashboard";
import { CrossSellBanner } from "@/components/apps/CrossSellBanner";
import { SuitePromoCards } from "@/components/apps/SuitePromoCards";
import { Card, CardContent } from "@/components/ui/card";
import { useCrossSellTriggers } from "@/hooks/useCrossSellTriggers";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import type { Building } from "@/types";

// Mock buildings - will be connected to DB later
const mockBuildings: Building[] = [
  {
    id: "b1",
    company_id: "c1",
    name: "Parkstraße 15",
    address: "Parkstraße 15, 80331 München",
    units_count: 12,
    created_at: "",
  },
  {
    id: "b2",
    company_id: "c1",
    name: "Hauptstraße 42",
    address: "Hauptstraße 42, 80331 München",
    units_count: 8,
    created_at: "",
  },
  {
    id: "b3",
    company_id: "c1",
    name: "Gartenweg 7",
    address: "Gartenweg 7, 80331 München",
    units_count: 6,
    created_at: "",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: triggers = [], isLoading: triggersLoading } =
    useCrossSellTriggers("hausmeisterpro");
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Nutzer";

  const openTasks = tasks.filter((t) => t.status === "open" || t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  // Get the most urgent task as focus
  const focusTask =
    openTasks.find((t) => t.priority === "urgent") ||
    openTasks.find((t) => t.priority === "high") ||
    openTasks[0] || null;

  // Get remaining tasks (excluding focus)
  const upcomingTasks = openTasks.filter((t) => t.id !== focusTask?.id);

  // Get first active trigger for cross-sell
  const activeTrigger = triggers.find((t) => t.is_active);

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 space-y-6">
        {/* Greeting Header */}
        <GreetingHeader userName={userName} />

        {/* Quick Stats */}
        <QuickStats
          tasksToday={openTasks.length}
          tasksCompleted={completedTasks.length}
          hoursWorked={0}
          unreadMessages={0}
        />

        {tasksLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </div>
        ) : (
          <>
            {/* Today's Focus */}
            <TodayFocus task={focusTask} />

            {/* Quick Actions */}
            <QuickActions />

            {/* Cross-Sell Banner */}
            {activeTrigger && !dismissedBanner && (
              <CrossSellBanner
                trigger={activeTrigger}
                onDismiss={() => setDismissedBanner(true)}
              />
            )}

            {/* Upcoming Tasks */}
            <UpcomingTasks tasks={upcomingTasks} />
          </>
        )}

        {/* Buildings Overview */}
        <BuildingsOverview buildings={mockBuildings} />

        {/* Suite Promo Cards */}
        <SuitePromoCards compact />

        {/* Fintutto Apps Teaser */}
        <Link to="/apps" className="block">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 active:scale-[0.98]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Fintutto Apps</h3>
                    <p className="text-sm text-muted-foreground">
                      Entdecke das gesamte Ökosystem
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
