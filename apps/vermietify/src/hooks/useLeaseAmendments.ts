import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// ─── TypeScript Types ──────────────────────────────────────────────────────────

export type AmendmentType =
  | "rent_increase"       // Mieterhöhung
  | "utility_adjustment"  // Vorauszahlungsanpassung
  | "contract_extension"  // Verlängerung
  | "special_agreement"   // Sondervereinbarung
  | "other";

export type AmendmentStatus =
  | "pending"    // angelegt, noch nicht aktiv
  | "announced"  // angekündigt (Ankündigungsschreiben versendet)
  | "active"     // in Kraft getreten
  | "cancelled"; // zurückgezogen

export interface LeaseAmendment {
  id: string;
  lease_id: string;
  org_id: string | null;
  user_id: string;

  amendment_type: AmendmentType;
  effective_date: string;          // ISO date

  // Alte Werte
  old_base_rent: number | null;
  old_utility_prepayment: number | null;
  old_heating_prepayment: number | null;
  old_other_costs: number | null;

  // Neue Werte
  new_base_rent: number | null;
  new_utility_prepayment: number | null;
  new_heating_prepayment: number | null;
  new_other_costs: number | null;

  // Rechtliche Grundlage
  legal_basis: string | null;
  announcement_date: string | null;
  announcement_sent: boolean;

  document_id: string | null;
  notes: string | null;
  status: AmendmentStatus;

  created_at: string;
  updated_at: string;
}

export interface LeaseAmendmentFormData {
  amendment_type: AmendmentType;
  effective_date: string;

  // Neue Werte (Pflichtfelder je nach Typ)
  new_base_rent?: number | null;
  new_utility_prepayment?: number | null;
  new_heating_prepayment?: number | null;
  new_other_costs?: number | null;

  legal_basis?: string | null;
  announcement_date?: string | null;
  notes?: string | null;
}

export interface AmendmentSummary {
  totalRentChange: number;      // Gesamtänderung Kaltmiete
  totalUtilityChange: number;   // Gesamtänderung NK
  totalHeatingChange: number;   // Gesamtänderung HK
  currentBaseRent: number;      // Aktuelle Kaltmiete (nach letzter Änderung)
  currentUtility: number;       // Aktuelle NK
  currentHeating: number;       // Aktuelle HK
  lastAmendmentDate: string | null;
  nextPlannedAmendment: LeaseAmendment | null;
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const AMENDMENT_TYPE_LABELS: Record<AmendmentType, string> = {
  rent_increase: "Mieterhöhung",
  utility_adjustment: "Vorauszahlungsanpassung",
  contract_extension: "Vertragsverlängerung",
  special_agreement: "Sondervereinbarung",
  other: "Sonstige Änderung",
};

export const AMENDMENT_STATUS_LABELS: Record<AmendmentStatus, string> = {
  pending: "Geplant",
  announced: "Angekündigt",
  active: "In Kraft",
  cancelled: "Zurückgezogen",
};

export const LEGAL_BASIS_OPTIONS = [
  { value: "§ 558 BGB Vergleichsmiete", label: "§ 558 BGB – Vergleichsmiete" },
  { value: "§ 558a BGB Begründung", label: "§ 558a BGB – Begründung der Mieterhöhung" },
  { value: "§ 559 BGB Modernisierung", label: "§ 559 BGB – Modernisierungsmieterhöhung" },
  { value: "§ 560 BGB Betriebskosten", label: "§ 560 BGB – Betriebskostenerhöhung" },
  { value: "§ 557a BGB Staffelmiete", label: "§ 557a BGB – Staffelmiete" },
  { value: "§ 557b BGB Indexmiete", label: "§ 557b BGB – Indexmiete" },
  { value: "Einvernehmliche Vereinbarung", label: "Einvernehmliche Vereinbarung" },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

const AMENDMENTS_KEY = "lease_amendments";

export function useLeaseAmendments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  // ── Alle Änderungen für einen Mietvertrag laden ──────────────────────────
  const useAmendmentsByLease = (leaseId: string | undefined) => {
    return useQuery({
      queryKey: [AMENDMENTS_KEY, "by-lease", leaseId],
      queryFn: async () => {
        if (!leaseId) throw new Error("Lease ID required");

        const { data, error } = await supabase
          .from("lease_amendments")
          .select("*")
          .eq("lease_id", leaseId)
          .order("effective_date", { ascending: false });

        if (error) throw error;
        return (data || []) as LeaseAmendment[];
      },
      enabled: !!leaseId,
    });
  };

  // ── Zusammenfassung berechnen ────────────────────────────────────────────
  const useAmendmentSummary = (
    leaseId: string | undefined,
    initialBaseRent: number,
    initialUtility: number,
    initialHeating: number
  ) => {
    return useQuery({
      queryKey: [AMENDMENTS_KEY, "summary", leaseId],
      queryFn: async () => {
        if (!leaseId) throw new Error("Lease ID required");

        const { data, error } = await supabase
          .from("lease_amendments")
          .select("*")
          .eq("lease_id", leaseId)
          .eq("status", "active")
          .order("effective_date", { ascending: true });

        if (error) throw error;

        const amendments = (data || []) as LeaseAmendment[];
        const now = new Date().toISOString().split("T")[0];

        // Aktuelle Werte berechnen (letzte aktive Änderung)
        let currentBaseRent = initialBaseRent;
        let currentUtility = initialUtility;
        let currentHeating = initialHeating;

        for (const a of amendments) {
          if (a.effective_date <= now) {
            if (a.new_base_rent !== null) currentBaseRent = a.new_base_rent;
            if (a.new_utility_prepayment !== null) currentUtility = a.new_utility_prepayment;
            if (a.new_heating_prepayment !== null) currentHeating = a.new_heating_prepayment;
          }
        }

        // Nächste geplante Änderung
        const { data: pending } = await supabase
          .from("lease_amendments")
          .select("*")
          .eq("lease_id", leaseId)
          .in("status", ["pending", "announced"])
          .gt("effective_date", now)
          .order("effective_date", { ascending: true })
          .limit(1);

        const lastActive = amendments.filter(a => a.effective_date <= now).pop();

        const summary: AmendmentSummary = {
          totalRentChange: currentBaseRent - initialBaseRent,
          totalUtilityChange: currentUtility - initialUtility,
          totalHeatingChange: currentHeating - initialHeating,
          currentBaseRent,
          currentUtility,
          currentHeating,
          lastAmendmentDate: lastActive?.effective_date || null,
          nextPlannedAmendment: pending?.[0] as LeaseAmendment || null,
        };

        return summary;
      },
      enabled: !!leaseId,
    });
  };

  // ── Neue Vertragsänderung anlegen ────────────────────────────────────────
  const createAmendment = useMutation({
    mutationFn: async ({
      leaseId,
      formData,
      currentValues,
    }: {
      leaseId: string;
      formData: LeaseAmendmentFormData;
      currentValues: {
        base_rent: number;
        utility_prepayment: number;
        heating_prepayment: number;
        other_costs: number;
      };
    }) => {
      if (!user?.id) throw new Error("Nicht angemeldet");

      const insertData = {
        lease_id: leaseId,
        org_id: profile?.organization_id || null,
        user_id: user.id,
        amendment_type: formData.amendment_type,
        effective_date: formData.effective_date,

        // Alte Werte aus aktuellem Mietvertrag
        old_base_rent: currentValues.base_rent,
        old_utility_prepayment: currentValues.utility_prepayment,
        old_heating_prepayment: currentValues.heating_prepayment,
        old_other_costs: currentValues.other_costs,

        // Neue Werte
        new_base_rent: formData.new_base_rent ?? null,
        new_utility_prepayment: formData.new_utility_prepayment ?? null,
        new_heating_prepayment: formData.new_heating_prepayment ?? null,
        new_other_costs: formData.new_other_costs ?? null,

        legal_basis: formData.legal_basis || null,
        announcement_date: formData.announcement_date || null,
        notes: formData.notes || null,
        status: "pending" as AmendmentStatus,
      };

      const { data, error } = await supabase
        .from("lease_amendments")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data as LeaseAmendment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [AMENDMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["rent_charges"] });
      queryClient.invalidateQueries({ queryKey: ["rent_demands"] });
      toast({
        title: "Vertragsänderung angelegt",
        description: `${AMENDMENT_TYPE_LABELS[data.amendment_type]} ab ${new Date(data.effective_date).toLocaleDateString("de-DE")} wurde gespeichert.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message || "Die Vertragsänderung konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });

  // ── Status einer Änderung aktualisieren ──────────────────────────────────
  const updateAmendmentStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: AmendmentStatus;
    }) => {
      const { data, error } = await supabase
        .from("lease_amendments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LeaseAmendment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [AMENDMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["rent_charges"] });
      queryClient.invalidateQueries({ queryKey: ["rent_demands"] });
      const statusLabel = AMENDMENT_STATUS_LABELS[data.status];
      toast({
        title: "Status aktualisiert",
        description: `Änderung ist jetzt: ${statusLabel}`,
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

  // ── Ankündigung als versendet markieren ──────────────────────────────────
  const markAnnouncementSent = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("lease_amendments")
        .update({
          announcement_sent: true,
          status: "announced",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LeaseAmendment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AMENDMENTS_KEY] });
      toast({
        title: "Ankündigung vermerkt",
        description: "Die Mieterhöhung wurde als angekündigt markiert.",
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

  // ── Änderung löschen ─────────────────────────────────────────────────────
  const deleteAmendment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lease_amendments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AMENDMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["rent_charges"] });
      queryClient.invalidateQueries({ queryKey: ["rent_demands"] });
      toast({
        title: "Änderung gelöscht",
        description: "Die Vertragsänderung wurde entfernt.",
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

  return {
    useAmendmentsByLease,
    useAmendmentSummary,
    createAmendment,
    updateAmendmentStatus,
    markAnnouncementSent,
    deleteAmendment,
  };
}
