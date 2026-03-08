import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Entitlement } from "@fintutto/shared";

interface EntitlementsState {
  entitlements: Entitlement[];
  loading: boolean;
  hasFeature: (key: string) => boolean;
  hasAnyFeature: (keys: string[]) => boolean;
}

export function useEntitlements(): EntitlementsState {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntitlements([]);
      setLoading(false);
      return;
    }

    async function fetchEntitlements() {
      const { data, error } = await supabase
        .from("entitlements")
        .select("feature_key, expires_at, source")
        .eq("user_id", user!.id);

      if (error) {
        console.error("Error fetching entitlements:", error);
        setEntitlements([]);
      } else {
        const now = new Date();
        const active = (data || []).filter(
          (e) => !e.expires_at || new Date(e.expires_at) > now
        );
        setEntitlements(active);
      }
      setLoading(false);
    }

    fetchEntitlements();
  }, [user]);

  const hasFeature = (key: string) =>
    entitlements.some((e) => e.feature_key === key);

  const hasAnyFeature = (keys: string[]) =>
    keys.some((key) => hasFeature(key));

  return { entitlements, loading, hasFeature, hasAnyFeature };
}
