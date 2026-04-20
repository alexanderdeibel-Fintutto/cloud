import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Document {
  id: string;
  company_id: string;
  building_id: string | null;
  task_id: string | null;
  sender_email: string;
  subject: string | null;
  file_url: string;
  file_name: string;
  file_size_bytes: number | null;
  status: string;
  document_type: string | null;
  extracted_data: Record<string, unknown>;
  amount: number | null;
  vendor_name: string | null;
  invoice_date: string | null;
  invoice_number: string | null;
  notes: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentQuestion {
  id: string;
  document_id: string;
  company_id: string;
  question: string;
  question_type: string;
  suggested_answer: string | null;
  answer: string | null;
  answered_by: string | null;
  answered_at: string | null;
  status: string;
  created_at: string;
  document?: Document;
}

export interface EmailInbox {
  id: string;
  company_id: string;
  email_address: string;
  email_prefix: string;
  is_active: boolean;
  created_at: string;
}

export interface VerifiedSender {
  id: string;
  company_id: string;
  email: string;
  is_verified: boolean;
  verified_at: string | null;
  added_by: string;
  created_at: string;
}

export function useEmailInbox() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["email-inbox", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_inboxes")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as EmailInbox | null;
    },
    enabled: !!user,
  });
}

export function useCreateInbox() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ companyId, prefix }: { companyId: string; prefix: string }) => {
      const emailAddress = `${prefix.toLowerCase().replace(/[^a-z0-9-]/g, "")}@eingang.vermietify.de`;
      const { data, error } = await supabase
        .from("email_inboxes")
        .insert({
          company_id: companyId,
          email_prefix: prefix,
          email_address: emailAddress,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-inbox"] });
      toast.success("E-Mail-Adresse erstellt");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Erstellen: " + error.message);
    },
  });
}

export function useVerifiedSenders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["verified-senders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verified_senders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VerifiedSender[];
    },
    enabled: !!user,
  });
}

export function useAddVerifiedSender() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ companyId, email }: { companyId: string; email: string }) => {
      const { data, error } = await supabase
        .from("verified_senders")
        .insert({
          company_id: companyId,
          email: email.toLowerCase().trim(),
          added_by: user!.id,
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verified-senders"] });
      toast.success("Absender hinzugefügt");
    },
    onError: (error: Error) => {
      toast.error("Fehler: " + error.message);
    },
  });
}

export function useRemoveVerifiedSender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (senderId: string) => {
      const { error } = await supabase
        .from("verified_senders")
        .delete()
        .eq("id", senderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verified-senders"] });
      toast.success("Absender entfernt");
    },
  });
}

export function useDocuments(status?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["documents", user?.id, status],
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user,
  });
}

export function useDocumentQuestions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["document-questions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_questions")
        .select("*, documents(*)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((q: any) => ({
        ...q,
        document: q.documents,
      })) as DocumentQuestion[];
    },
    enabled: !!user,
  });
}

export function useAnswerQuestion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const { error } = await supabase
        .from("document_questions")
        .update({
          answer,
          answered_by: user!.id,
          answered_at: new Date().toISOString(),
          status: "answered",
        })
        .eq("id", questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-questions"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Frage beantwortet");
    },
  });
}

export function useUserCompany() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-company", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_company_assignments")
        .select("company_id, companies(*)")
        .eq("user_id", user!.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as { company_id: string; companies: { id: string; name: string } } | null;
    },
    enabled: !!user,
  });
}
