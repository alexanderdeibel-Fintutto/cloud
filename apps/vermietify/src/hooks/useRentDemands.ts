import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RentDemandStatus = "open" | "partial" | "paid" | "cancelled";

export interface RentDemand {
  id: string;
  lease_id: string;
  org_id: string;
  user_id: string;
  building_id: string | null;
  unit_id: string | null;
  tenant_id: string | null;
  charge_year: number;
  charge_month: number;
  due_date: string;
  base_rent: number;
  utility_prepayment: number;
  heating_prepayment: number;
  other_costs: number;
  total_amount: number;
  paid_amount: number;
  paid_date: string | null;
  status: RentDemandStatus;
  difference_amount: number;
  bank_transaction_id: string | null;
  notes: string | null;
  created_at: string;
  overdue_days: number;
  open_amount: number;
}

export interface RentDemandWithDetails extends RentDemand {
  tenant?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
  } | null;
  unit?: {
    id: string;
    unit_number: string;
    name: string;
    building?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export interface RentDemandFilters {
  leaseId?: string;
  tenantId?: string;
  buildingId?: string;
  unitId?: string;
  status?: RentDemandStatus | "all";
  year?: number;
  overdueOnly?: boolean;
}

export interface RentDemandSummary {
  totalOpen: number;
  totalOverdue: number;
  totalOpenAmount: number;
  totalOverdueAmount: number;
  overdueCount: number;
  partialCount: number;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

const RENT_DEMANDS_KEY = "rent_demands";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRentDemands() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  /**
   * Alle offenen Forderungen der Organisation abrufen
   * Joined mit tenants und units für die Anzeige
   */
  const useRentDemandsList = (filters?: RentDemandFilters) => {
    return useQuery({
      queryKey: [RENT_DEMANDS_KEY, "list", filters, profile?.organization_id],
      enabled: !!profile?.organization_id,
      queryFn: async (): Promise<RentDemandWithDetails[]> => {
        // rent_demands ist eine View auf rent_charges
        let query = supabase
          .from("rent_demands" as any)
          .select(`
            *,
            tenant:tenants!tenant_id(id, first_name, last_name, email),
            unit:units!unit_id(
              id, unit_number, name,
              building:buildings!building_id(id, name)
            )
          `)
          .eq("org_id", profile!.organization_id)
          .order("due_date", { ascending: true });

        if (filters?.leaseId) {
          query = query.eq("lease_id", filters.leaseId);
        }
        if (filters?.tenantId) {
          query = query.eq("tenant_id", filters.tenantId);
        }
        if (filters?.buildingId) {
          query = query.eq("building_id", filters.buildingId);
        }
        if (filters?.unitId) {
          query = query.eq("unit_id", filters.unitId);
        }
        if (filters?.status && filters.status !== "all") {
          query = query.eq("status", filters.status);
        }
        if (filters?.year) {
          query = query.eq("charge_year", filters.year);
        }
        if (filters?.overdueOnly) {
          query = query.gt("overdue_days", 0);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data as unknown as RentDemandWithDetails[]) ?? [];
      },
    });
  };

  /**
   * Zusammenfassung: Gesamtbetrag offener und überfälliger Forderungen
   */
  const useRentDemandSummary = (buildingId?: string) => {
    return useQuery({
      queryKey: [RENT_DEMANDS_KEY, "summary", buildingId, profile?.organization_id],
      enabled: !!profile?.organization_id,
      queryFn: async (): Promise<RentDemandSummary> => {
        let query = supabase
          .from("rent_demands" as any)
          .select("status, open_amount, overdue_days, total_amount")
          .eq("org_id", profile!.organization_id);

        if (buildingId) {
          query = query.eq("building_id", buildingId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const rows = (data as any[]) ?? [];
        return {
          totalOpen: rows.filter((r) => r.status === "open").length,
          totalOverdue: rows.filter((r) => r.overdue_days > 0).length,
          totalOpenAmount: rows.reduce((s, r) => s + Number(r.open_amount ?? 0), 0),
          totalOverdueAmount: rows
            .filter((r) => r.overdue_days > 0)
            .reduce((s, r) => s + Number(r.open_amount ?? 0), 0),
          overdueCount: rows.filter((r) => r.overdue_days > 0).length,
          partialCount: rows.filter((r) => r.status === "partial").length,
        };
      },
    });
  };

  /**
   * Offene Forderungen für einen bestimmten Mieter
   */
  const useRentDemandsForTenant = (tenantId: string | undefined) => {
    return useQuery({
      queryKey: [RENT_DEMANDS_KEY, "tenant", tenantId],
      enabled: !!tenantId,
      queryFn: async (): Promise<RentDemandWithDetails[]> => {
        const { data, error } = await supabase
          .from("rent_demands" as any)
          .select(`
            *,
            unit:units!unit_id(
              id, unit_number, name,
              building:buildings!building_id(id, name)
            )
          `)
          .eq("tenant_id", tenantId!)
          .order("due_date", { ascending: false });

        if (error) throw error;
        return (data as unknown as RentDemandWithDetails[]) ?? [];
      },
    });
  };

  /**
   * Transaktion mit einer Sollstellung verknüpfen (match_transaction_to_charge RPC)
   */
  const matchTransactionToCharge = useMutation({
    mutationFn: async ({
      transactionId,
      chargeId,
    }: {
      transactionId: string;
      chargeId: string;
    }) => {
      const { data, error } = await supabase.rpc("match_transaction_to_charge" as any, {
        p_transaction_id: transactionId,
        p_charge_id: chargeId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RENT_DEMANDS_KEY] });
      toast({
        title: "Zahlung zugeordnet",
        description: "Die Transaktion wurde erfolgreich mit der Sollstellung verknüpft.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Sollstellungen für einen Mietvertrag generieren (generate_rent_charges RPC)
   */
  const generateRentCharges = useMutation({
    mutationFn: async ({
      leaseId,
      startDate,
      endDate,
    }: {
      leaseId: string;
      startDate: string;
      endDate: string;
    }) => {
      const { data, error } = await supabase.rpc("generate_rent_charges" as any, {
        p_lease_id: leaseId,
        p_start_date: startDate,
        p_end_date: endDate,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [RENT_DEMANDS_KEY] });
      toast({
        title: "Sollstellungen generiert",
        description: `${count} monatliche Sollstellungen wurden erfolgreich erstellt.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Generieren",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    useRentDemandsList,
    useRentDemandSummary,
    useRentDemandsForTenant,
    matchTransactionToCharge,
    generateRentCharges,
  };
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

export function formatRentDemandMonth(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

export function getRentDemandStatusLabel(status: RentDemandStatus): string {
  const labels: Record<RentDemandStatus, string> = {
    open: "Offen",
    partial: "Teilbezahlt",
    paid: "Bezahlt",
    cancelled: "Storniert",
  };
  return labels[status];
}

export function getRentDemandStatusColor(
  status: RentDemandStatus,
  overduedays: number
): "destructive" | "warning" | "secondary" | "default" {
  if (status === "open" && overduedays > 0) return "destructive";
  if (status === "partial") return "warning";
  if (status === "open") return "secondary";
  return "default";
}
