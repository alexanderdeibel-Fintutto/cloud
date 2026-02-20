import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to generate short-lived signed URLs on-demand for private storage buckets.
 * This ensures RLS is re-evaluated each time an image is accessed, preventing
 * unauthorized access after permission revocation.
 * 
 * @param bucket - The storage bucket name
 * @param path - The file path (not a signed URL)
 * @param expirySeconds - URL expiry in seconds (default: 1 hour)
 */
export function useSignedUrl(
  bucket: string, 
  path: string | null | undefined, 
  expirySeconds: number = 3600
) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if no path or if path is already a signed URL
    if (!path || path.startsWith('http://') || path.startsWith('https://')) {
      setSignedUrl(path || null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const generateSignedUrl = async () => {
      try {
        const { data, error: signError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, expirySeconds);

        if (cancelled) return;

        if (signError) {
          throw signError;
        }

        setSignedUrl(data?.signedUrl || null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to generate signed URL'));
          setSignedUrl(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    generateSignedUrl();

    return () => {
      cancelled = true;
    };
  }, [bucket, path, expirySeconds]);

  return { signedUrl, loading, error };
}

/**
 * Generate a signed URL imperatively (for use outside of React components)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expirySeconds: number = 3600
): Promise<string | null> {
  // If already a URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expirySeconds);

  if (error) {
    console.error('Failed to generate signed URL:', error);
    return null;
  }

  return data?.signedUrl || null;
}
