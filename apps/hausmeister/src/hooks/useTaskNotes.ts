import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TaskNote {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function useTaskNotes(taskId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["task-notes", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("task_notes")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as TaskNote[];
    },
    enabled: !!user && !!taskId,
  });
}

export function useCreateTaskNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      taskId,
      content,
    }: {
      taskId: string;
      content: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("task_notes")
        .insert({
          task_id: taskId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-notes", variables.taskId],
      });
    },
  });
}
