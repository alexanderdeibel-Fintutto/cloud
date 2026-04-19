import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FinanceData {
  rent: {
    cold: number;
    utilities: number;
    total: number;
  } | null;
  payments: {
    id: string;
    date: string;
    amount: number;
    type: string;
    status: string;
  }[];
  balance: number;
}

export function useFinanceData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["finance-data", user?.id],
    queryFn: async (): Promise<FinanceData> => {
      if (!user?.id) throw new Error("Not authenticated");

      const [leaseResult, paymentsResult] = await Promise.all([
        // Active lease
        supabase
          .from("leases")
          .select("rent_amount, utilities_advance")
          .eq("tenant_id", user.id)
          .eq("status", "active")
          .maybeSingle(),

        // Payment history (most recent 20)
        supabase
          .from("payments")
          .select("id, payment_date, amount, type, status")
          .eq("user_id", user.id)
          .order("payment_date", { ascending: false })
          .limit(20),
      ]);

      // Rent breakdown
      let rent: FinanceData["rent"] = null;
      if (leaseResult.data) {
        const cold = Number(leaseResult.data.rent_amount);
        const utilities = Number(leaseResult.data.utilities_advance || 0);
        rent = { cold, utilities, total: cold + utilities };
      }

      // Map payments
      const payments = (paymentsResult.data || []).map((p) => ({
        id: p.id,
        date: new Date(p.payment_date).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        amount: Number(p.amount),
        type: formatPaymentType(p.type),
        status: formatPaymentStatus(p.status),
      }));

      // Balance: sum of credits (negative amounts like refunds) minus debits
      // Positive balance = overpaid/credit, negative = outstanding
      const balance = payments.reduce((sum, p) => {
        if (p.status === "Gutgeschrieben") return sum + p.amount;
        return sum;
      }, 0);

      return { rent, payments, balance };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
}

function formatPaymentType(type: string): string {
  const map: Record<string, string> = {
    miete: "Miete",
    nebenkosten: "Nebenkosten",
    kaution: "Kaution",
    gutschrift: "NK-Guthaben",
    nachzahlung: "Nachzahlung",
  };
  return map[type] || type;
}

function formatPaymentStatus(status: string): string {
  const map: Record<string, string> = {
    bezahlt: "Bezahlt",
    offen: "Offen",
    gutgeschrieben: "Gutgeschrieben",
    ausstehend: "Ausstehend",
  };
  return map[status] || status;
}
