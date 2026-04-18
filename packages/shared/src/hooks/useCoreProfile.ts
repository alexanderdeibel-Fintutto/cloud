/**
 * useCoreProfile – SSOT Hook für Nutzerprofile
 *
 * Wird von allen Apps im Portal-Repo genutzt, um das zentrale Nutzerprofil
 * aus der `profiles`-Tabelle zu laden und zu aktualisieren.
 *
 * Jede App muss ihren eigenen Supabase-Client übergeben, da die
 * Supabase-Instanz app-spezifisch konfiguriert ist.
 */
import { useState, useEffect, useCallback } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface CoreProfile {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  // SSOT: Verknüpfung zur zentralen Adresse
  core_address_id?: string | null;
  // Aus core_contact_id (falls Nutzer auch ein Kontakt ist)
  core_contact_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UseCoreProfileReturn {
  profile: CoreProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<CoreProfile>) => Promise<void>;
  refetch: () => void;
}

export function useCoreProfile(
  supabase: SupabaseClient,
  userId: string | null | undefined
): UseCoreProfileReturn {
  const [profile, setProfile] = useState<CoreProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (fetchError) throw fetchError;
      setProfile(data as CoreProfile);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Profil konnte nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<CoreProfile>) => {
    if (!userId) return;
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (updateError) throw updateError;
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Profil konnte nicht aktualisiert werden');
      throw err;
    }
  }, [supabase, userId]);

  return { profile, isLoading, error, updateProfile, refetch: fetchProfile };
}
