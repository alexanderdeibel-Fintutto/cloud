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

  const createBusiness = async (name: string, businessType: string, taxId?: string, vatId?: string) => {
    if (!user) return null;

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

    if (!error && data) {
      setBusiness(data as Business);
      return data as Business;
    }
    return null;
  };

  return { business, loading, createBusiness, refetch: fetchBusiness };
}
