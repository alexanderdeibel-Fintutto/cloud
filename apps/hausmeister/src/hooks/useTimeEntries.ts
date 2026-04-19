import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export function useTimeEntries(taskId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["time-entries", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TimeEntry[];
    },
    enabled: !!user && !!taskId,
  });
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      taskId,
      durationSeconds,
    }: {
      taskId: string;
      durationSeconds: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - durationSeconds * 1000);
      const durationMinutes = Math.round(durationSeconds / 60);

      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          task_id: taskId,
          user_id: user.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_minutes: durationMinutes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["time-entries", variables.taskId],
      });
    },
  });
}

export function useTotalTimeForTask(taskId: string | undefined) {
  const { data: entries } = useTimeEntries(taskId);

  const totalMinutes =
    entries?.reduce((sum, e) => sum + (e.duration_minutes ?? 0), 0) ?? 0;

  return totalMinutes;
}
