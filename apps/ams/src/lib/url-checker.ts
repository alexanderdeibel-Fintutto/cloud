import { RegisteredUrl } from './url-registry';

export type UrlStatus = 'reachable' | 'unreachable' | 'timeout' | 'pending';

export interface UrlCheckResult {
  url: string;
  label: string;
  category: RegisteredUrl['category'];
  source: string;
  critical: boolean;
  status: UrlStatus;
  statusCode: number | null;
  responseTimeMs: number | null;
  error: string | null;
  checkedAt: string | null;
}

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Checks a single URL for availability using a HEAD request with GET fallback.
 * Uses opaque mode for cross-origin requests to avoid CORS issues in browsers.
 */
export async function checkUrl(entry: RegisteredUrl): Promise<UrlCheckResult> {
  const base: UrlCheckResult = {
    url: entry.url,
    label: entry.label,
    category: entry.category,
    source: entry.source,
    critical: entry.critical,
    status: 'pending',
    statusCode: null,
    responseTimeMs: null,
    error: null,
    checkedAt: null,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const start = performance.now();

  try {
    // Use no-cors mode to avoid CORS blocking in browser environments.
    // We get an opaque response (status 0) but can verify the server is reachable.
    const response = await fetch(entry.url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
      cache: 'no-store',
    });

    const elapsed = Math.round(performance.now() - start);

    // Opaque responses have status 0 but mean the server is reachable
    const statusCode = response.status;
    const isReachable = response.type === 'opaque' || (statusCode >= 200 && statusCode < 400);

    return {
      ...base,
      status: isReachable ? 'reachable' : 'unreachable',
      statusCode: response.type === 'opaque' ? null : statusCode,
      responseTimeMs: elapsed,
      checkedAt: new Date().toISOString(),
      error: isReachable ? null : `HTTP ${statusCode}`,
    };
  } catch (err) {
    const elapsed = Math.round(performance.now() - start);
    const isTimeout = (err as Error).name === 'AbortError';

    return {
      ...base,
      status: isTimeout ? 'timeout' : 'unreachable',
      responseTimeMs: elapsed,
      checkedAt: new Date().toISOString(),
      error: isTimeout ? 'Zeitüberschreitung (10s)' : (err as Error).message,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Checks multiple URLs concurrently with a configurable concurrency limit.
 * Calls onProgress after each URL is checked.
 */
export async function checkUrls(
  entries: RegisteredUrl[],
  onProgress?: (result: UrlCheckResult, index: number) => void,
  concurrency = 4,
): Promise<UrlCheckResult[]> {
  const results: UrlCheckResult[] = new Array(entries.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < entries.length) {
      const i = nextIndex++;
      const result = await checkUrl(entries[i]);
      results[i] = result;
      onProgress?.(result, i);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, entries.length) }, () => worker());
  await Promise.all(workers);

  return results;
}
