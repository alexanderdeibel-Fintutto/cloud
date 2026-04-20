import { useState } from "react";
import { Plus, Filter, Sparkles, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SwipeableTaskCard } from "@/components/tasks/SwipeableTaskCard";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { Button } from "@/components/ui/button";
import { FloatingTimer } from "@/components/time-tracking/FloatingTimer";
import { toast } from "@/hooks/use-toast";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import type { Task, TaskStatus } from "@/types";

export default function TasksPage() {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const { data: tasks = [], isLoading } = useTasks();
  const updateStatus = useUpdateTaskStatus();

  const filteredTasks = filter === "all"
    ? tasks
    : tasks.filter((task) => task.status === filter);

  const counts = {
    all: tasks.length,
    open: tasks.filter((t) => t.status === "open").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  const handleComplete = (task: Task) => {
    updateStatus.mutate(
      { taskId: task.id, status: "completed" },
      {
        onSuccess: () => {
          toast({
            title: "Aufgabe erledigt! ✅",
            description: task.title,
          });
        },
      }
    );
  };

  const handleReject = (task: Task) => {
    toast({
      title: "Aufgabe abgelehnt",
      description: task.title,
      variant: "destructive",
    });
  };

  const handleTimerStop = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    toast({
      title: "Zeit erfasst ⏱️",
      description: `${minutes} Minuten wurden gespeichert`,
    });
  };

  return (
    <div className="min-h-screen pb-40">
      <PageHeader
        title="Aufgaben"
        subtitle={`${counts.open} offen`}
        action={
          <Button
            variant="ghost"
            size="icon"
            className="touch-target"
            aria-label="Aufgaben filtern"
          >
            <Filter className="h-5 w-5" />
          </Button>
        }
      />

      <TaskFilters
        activeFilter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />

      {/* Swipe hint for first-time users */}
      {filteredTasks.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              Wische nach rechts zum Erledigen, links zum Ablehnen
            </span>
          </div>
        </div>
      )}

      <div className="px-4 py-2 space-y-3">
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Aufgaben werden geladen...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Keine Aufgaben gefunden
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Zeit für eine Pause? ☕
            </p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <SwipeableTaskCard
              key={task.id}
              task={task}
              index={index}
              onComplete={handleComplete}
              onReject={handleReject}
            />
          ))
        )}
      </div>

      {/* Floating Timer */}
      <FloatingTimer onStop={handleTimerStop} />

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-36 right-4 h-14 w-14 rounded-full shadow-lg shadow-primary/30 z-40 bg-primary hover:bg-primary/90"
        aria-label="Neue Aufgabe erstellen"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
