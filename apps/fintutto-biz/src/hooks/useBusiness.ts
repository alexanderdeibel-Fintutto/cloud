import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  business_type: string;
  tax_id: string | null;
  vat_id: string | null;
  address: Record<string, string>;
  default_payment_terms: number;
  default_tax_rate: number;
  invoice_prefix: string;
  next_invoice_number: number;
  created_at: string;
}

export function useBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusiness = useCallback(async () => {
    if (!user) {
      setBusiness(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("biz_businesses")
      .select("*")
      .eq("owner_id", user.id)
      .limit(1)
      .single();

    if (!error && data) {
      setBusiness(data as Business);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const createBusiness = async (
    name: string,
    businessType: string,
    taxId?: string,
    vatId?: string,
  ): Promise<{ data: Business | null; error: string | null }> => {
    if (!user) return { data: null, error: "Nicht angemeldet." };

    // Strategy 1: Use RPC function (SECURITY DEFINER, bypasses RLS)
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_biz_business",
      {
        p_name: name,
        p_business_type: businessType,
        p_tax_id: taxId || null,
        p_vat_id: vatId || null,
      },
    );

    if (!rpcError && rpcData) {
      // RPC returns JSONB - check for error key
      if (rpcData.error) {
        return { data: null, error: rpcData.error };
      }
      setBusiness(rpcData as Business);
      return { data: rpcData as Business, error: null };
    }

    // Strategy 2: Fallback to direct insert if RPC doesn't exist yet
    // (migration 026 not yet applied)
    if (rpcError) {
      console.warn("RPC fallback:", rpcError.message);

      // Try to ensure public.users row exists first
      await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email ?? "",
          name: user.user_metadata?.name || user.email?.split("@")[0] || "",
          tier: "free",
          checks_used: 0,
          checks_limit: 3,
        })
        .select()
        .single();

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
        console.error("createBusiness error:", error);
        return {
          data: null,
          error: `Geschaeft konnte nicht erstellt werden: ${error.message}`,
        };
      }

      setBusiness(data as Business);
      return { data: data as Business, error: null };
    }

    return { data: null, error: "Unbekannter Fehler beim Erstellen." };
  };

  return { business, loading, createBusiness, refetch: fetchBusiness };
}
