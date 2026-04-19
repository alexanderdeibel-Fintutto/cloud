import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Document } from "./useDocuments";

export function useDocument(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      if (!id) throw new Error("No document ID");
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Document;
    },
    enabled: !!user && !!id,
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<Document, "vendor_name" | "amount" | "invoice_date" | "invoice_number" | "notes" | "status" | "building_id" | "document_type">>;
    }) => {
      const { data, error } = await supabase
        .from("documents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["document", data.id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Beleg aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler: " + error.message);
    },
  });
}
