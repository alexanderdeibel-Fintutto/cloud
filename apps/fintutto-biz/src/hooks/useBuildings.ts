/**
 * useBuildings — Financial Kompass
 *
 * Liest Gebäude aus der gemeinsamen `buildings`-Tabelle,
 * gefiltert nach der organization_id des eingeloggten Benutzers.
 * Dieselben Gebäude, die in Vermietify und der Ablesung-App sichtbar sind.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Building {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  building_type: string | null;
  total_area: number | null;
  year_built: number | null;
  organization_id: string;
  created_at: string;
}

export interface BuildingFinancials {
  building_id: string;
  building_name: string;
  address: string | null;
  city: string | null;
  organization_id: string;
  total_expenses: number;
  total_revenue: number;
  expense_count: number;
  invoice_count: number;
}

export function useBuildings() {
  const { user } = useAuth();

  // Alle Gebäude der Organisation laden
  const {
    data: buildings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["biz-buildings", user?.id],
    queryFn: async (): Promise<Building[]> => {
      if (!user) return [];

      // Profil laden um organization_id zu erhalten
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile?.organization_id) return [];

      const { data, error: buildingsError } = await supabase
        .from("buildings")
        .select("id, name, address, city, postal_code, building_type, total_area, year_built, organization_id, created_at")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (buildingsError) throw buildingsError;
      return (data || []) as Building[];
    },
    enabled: !!user,
  });

  // Finanzübersicht pro Gebäude (aus View v_building_financials)
  const {
    data: buildingFinancials = [],
    isLoading: isLoadingFinancials,
  } = useQuery({
    queryKey: ["biz-building-financials", user?.id],
    queryFn: async (): Promise<BuildingFinancials[]> => {
      if (!user) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("v_building_financials")
        .select("*")
        .eq("organization_id", profile.organization_id);

      if (error) {
        console.warn("v_building_financials nicht verfügbar:", error.message);
        return [];
      }
      return (data || []) as BuildingFinancials[];
    },
    enabled: !!user,
  });

  return {
    buildings,
    buildingFinancials,
    isLoading,
    isLoadingFinancials,
    error,
    refetch,
  };
}
