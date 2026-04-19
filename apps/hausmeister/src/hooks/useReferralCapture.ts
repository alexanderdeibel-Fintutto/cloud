import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const REFERRAL_STORAGE_KEY = 'referral_code';

/**
 * Captures ?ref=CODE from URL, validates it via the referral edge function,
 * and stores it in localStorage for later use at checkout.
 */
export function useReferralCapture() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (!refCode) return;

    // Store immediately
    localStorage.setItem(REFERRAL_STORAGE_KEY, refCode);

    // Remove ?ref= from URL to keep it clean
    searchParams.delete('ref');
    setSearchParams(searchParams, { replace: true });

    // Validate & track click
    supabase.functions.invoke('referral', {
      body: { action: 'track_click', referral_code: refCode },
    }).then(({ data }) => {
      if (data && !data.valid) {
        // Invalid code – remove from storage
        localStorage.removeItem(REFERRAL_STORAGE_KEY);
      }
    }).catch(() => {
      // Non-critical – keep code stored
    });
  }, [searchParams, setSearchParams]);
}

/** Get stored referral code (for checkout) */
export function getStoredReferralCode(): string | null {
  return localStorage.getItem(REFERRAL_STORAGE_KEY);
}

/** Clear stored referral code (after successful checkout) */
export function clearStoredReferralCode() {
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
}
