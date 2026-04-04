import { useState, useCallback, useRef } from 'react';
import { urlRegistry } from '@/lib/url-registry';
import { checkUrls, UrlCheckResult } from '@/lib/url-checker';

export interface UseUrlCheckerReturn {
  results: UrlCheckResult[];
  isChecking: boolean;
  progress: number;
  total: number;
  lastCheckedAt: string | null;
  runCheck: () => Promise<void>;
}

export function useUrlChecker(): UseUrlCheckerReturn {
  const [results, setResults] = useState<UrlCheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const abortRef = useRef(false);

  const total = urlRegistry.length;

  const runCheck = useCallback(async () => {
    if (isChecking) return;

    abortRef.current = false;
    setIsChecking(true);
    setProgress(0);

    // Initialize all results as pending
    setResults(
      urlRegistry.map((entry) => ({
        url: entry.url,
        label: entry.label,
        category: entry.category,
        source: entry.source,
        critical: entry.critical,
        status: 'pending' as const,
        statusCode: null,
        responseTimeMs: null,
        error: null,
        checkedAt: null,
      })),
    );

    const finalResults = await checkUrls(urlRegistry, (_result, index) => {
      if (abortRef.current) return;
      setProgress(index + 1);
      setResults((prev) => {
        const next = [...prev];
        next[index] = _result;
        return next;
      });
    });

    setResults(finalResults);
    setIsChecking(false);
    setLastCheckedAt(new Date().toISOString());
  }, [isChecking]);

  return { results, isChecking, progress, total, lastCheckedAt, runCheck };
}
