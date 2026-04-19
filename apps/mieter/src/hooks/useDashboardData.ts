import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DashboardData {
  nextRent: {
    amount: number;
    dueDate: Date | null;
    paymentDay: number;
  } | null;
  openIssuesCount: number;
  lastMessages: {
    id: string;
    senderName: string;
    content: string;
    createdAt: string;
    isRead: boolean;
  }[];
}

export function useDashboardData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-data", user?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!user?.id) throw new Error("Not authenticated");

      // Fetch lease, issues, and messages in parallel
      const [leaseResult, issuesResult, messagesResult, profileResult] = await Promise.all([
        // Active lease for this tenant
        supabase
          .from("leases")
          .select("rent_amount, utilities_advance, payment_day, start_date, end_date, status")
          .eq("tenant_id", user.id)
          .eq("status", "active")
          .maybeSingle(),

        // Count open issues
        supabase
          .from("issues")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "offen"),

        // Last messages received (most recent 3)
        supabase
          .from("messages")
          .select("id, sender_id, content, subject, created_at, is_read")
          .eq("recipient_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),

        // Profile to get sender names later
        supabase
          .from("profiles")
          .select("user_id, name")
      ]);

      // Build a name lookup from profiles
      const nameMap = new Map<string, string>();
      if (profileResult.data) {
        for (const p of profileResult.data) {
          nameMap.set(p.user_id, p.name);
        }
      }

      // Calculate next rent due date
      let nextRent: DashboardData["nextRent"] = null;
      if (leaseResult.data) {
        const lease = leaseResult.data;
        const totalRent = Number(lease.rent_amount) + Number(lease.utilities_advance || 0);
        const paymentDay = lease.payment_day || 1;
        
        // Calculate next due date
        const today = new Date();
        let dueDate = new Date(today.getFullYear(), today.getMonth(), paymentDay);
        if (dueDate <= today) {
          dueDate = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay);
        }

        nextRent = {
          amount: totalRent,
          dueDate,
          paymentDay,
        };
      }

      // Map messages
      const lastMessages = (messagesResult.data || []).map((msg) => ({
        id: msg.id,
        senderName: nameMap.get(msg.sender_id) || "Unbekannt",
        content: msg.subject || msg.content,
        createdAt: msg.created_at,
        isRead: msg.is_read,
      }));

      return {
        nextRent,
        openIssuesCount: issuesResult.count ?? 0,
        lastMessages,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
