import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Business } from "./useBusiness";

export interface UserBusiness {
  business_id: string;
  business_name: string;
  business_type: string;
  role: "owner" | "admin" | "member" | "viewer";
  is_active: boolean;
}

const ACTIVE_BUSINESS_KEY = "fintutto_active_business_id";

export function useBusinesses() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<UserBusiness[]>([]);
  const [activeBusiness, setActiveBusinessState] = useState<Business | null>(null);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_BUSINESS_KEY)
  );
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = useCallback(async () => {
    if (!user) {
      setBusinesses([]);
      setActiveBusinessState(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Alle Businesses des Users laden (via RPC)
    const { data: bizList, error: rpcError } = await supabase.rpc("get_user_businesses");

    if (rpcError) {
      // Fallback: direkt aus biz_businesses laden (nur eigene)
      const { data: fallback } = await supabase
        .from("biz_businesses")
        .select("id, name, business_type")
        .eq("owner_id", user.id);

      if (fallback) {
        const mapped: UserBusiness[] = fallback.map((b) => ({
          business_id: b.id,
          business_name: b.name,
          business_type: b.business_type,
          role: "owner" as const,
          is_active: true,
        }));
        setBusinesses(mapped);
        await loadActiveBusiness(mapped, activeBusinessId);
      }
    } else if (bizList) {
      setBusinesses(bizList as UserBusiness[]);
      await loadActiveBusiness(bizList as UserBusiness[], activeBusinessId);
    }

    setLoading(false);
  }, [user, activeBusinessId]);

  const loadActiveBusiness = async (
    bizList: UserBusiness[],
    preferredId: string | null
  ) => {
    if (bizList.length === 0) {
      setActiveBusinessState(null);
      return;
    }

    // Bevorzugtes Business laden oder erstes nehmen
    const targetId = preferredId && bizList.find((b) => b.business_id === preferredId)
      ? preferredId
      : bizList[0].business_id;

    const { data, error } = await supabase
      .from("biz_businesses")
      .select("*")
      .eq("id", targetId)
      .single();

    if (!error && data) {
      setActiveBusinessState(data as Business);
      setActiveBusinessId(targetId);
      localStorage.setItem(ACTIVE_BUSINESS_KEY, targetId);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const switchBusiness = async (businessId: string) => {
    const target = businesses.find((b) => b.business_id === businessId);
    if (!target) return;

    const { data, error } = await supabase
      .from("biz_businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (!error && data) {
      setActiveBusinessState(data as Business);
      setActiveBusinessId(businessId);
      localStorage.setItem(ACTIVE_BUSINESS_KEY, businessId);
    }
  };

  const createBusiness = async (
    name: string,
    businessType: string,
    taxId?: string,
    vatId?: string
  ): Promise<{ data: Business | null; error: string | null }> => {
    if (!user) return { data: null, error: "Nicht angemeldet." };

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_biz_business",
      {
        p_name: name,
        p_business_type: businessType,
        p_tax_id: taxId || null,
        p_vat_id: vatId || null,
      }
    );

    if (!rpcError && rpcData && !rpcData.error) {
      await fetchBusinesses();
      return { data: rpcData as Business, error: null };
    }

    // Fallback: direktes Insert
    const { data, error } = await supabase
      .from("biz_businesses")
      .insert({
        owner_id: user.id,
        name,
        business_type: businessType,
        tax_id: taxId || null,
        vat_id: vatId || null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: `Fehler: ${error.message}` };
    }

    // Eintrag in biz_user_businesses anlegen
    await supabase.from("biz_user_businesses").insert({
      user_id: user.id,
      business_id: data.id,
      role: "owner",
      is_default: true,
    });

    await fetchBusinesses();
    return { data: data as Business, error: null };
  };

  return {
    businesses,
    activeBusiness,
    activeBusinessId,
    loading,
    switchBusiness,
    createBusiness,
    refetch: fetchBusinesses,
  };
}
