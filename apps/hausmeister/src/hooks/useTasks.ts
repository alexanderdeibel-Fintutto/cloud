import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Task, TaskStatus } from "@/types";

interface TaskRow {
  id: string;
  company_id: string;
  building_id: string | null;
  unit_id: string | null;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  created_by: string;
  assigned_to: string | null;
  reported_by_name: string | null;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
  buildings: {
    id: string;
    company_id: string;
    name: string;
    address: string;
    units_count: number;
    created_at: string;
  } | null;
  units: {
    id: string;
    building_id: string;
    unit_number: string;
    status: string;
  } | null;
}

function mapRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    company_id: row.company_id,
    building_id: row.building_id ?? undefined,
    unit_id: row.unit_id ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    priority: row.priority as Task["priority"],
    status: row.status as TaskStatus,
    created_by: row.created_by,
    assigned_to: row.assigned_to ?? undefined,
    reported_by_name: row.reported_by_name ?? undefined,
    due_date: row.due_date ?? undefined,
    created_at: row.created_at,
    completed_at: row.completed_at ?? undefined,
    building: row.buildings
      ? {
          id: row.buildings.id,
          company_id: row.buildings.company_id,
          name: row.buildings.name,
          address: row.buildings.address,
          units_count: row.buildings.units_count,
          created_at: row.buildings.created_at,
        }
      : undefined,
    unit: row.units
      ? {
          id: row.units.id,
          building_id: row.units.building_id,
          unit_number: row.units.unit_number,
          status: row.units.status as "occupied" | "vacant" | "maintenance",
        }
      : undefined,
  };
}

export function useTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          buildings (*),
          units (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as TaskRow[]).map(mapRowToTask);
    },
    enabled: !!user,
  });
}

export function useTask(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      if (!id) throw new Error("No task ID");
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          buildings (*),
          units (*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return mapRowToTask(data as unknown as TaskRow);
    },
    enabled: !!user && !!id,
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: TaskStatus;
    }) => {
      const updateData: Record<string, unknown> = { status };
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (task: {
      company_id: string;
      building_id?: string;
      unit_id?: string;
      title: string;
      description?: string;
      priority?: string;
      reported_by_name?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...task,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
