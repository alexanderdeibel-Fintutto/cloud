import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkUrl, checkUrls } from '@/lib/url-checker';
import type { RegisteredUrl } from '@/lib/url-registry';

const mockEntry: RegisteredUrl = {
  url: 'https://example.com',
  label: 'Test URL',
  category: 'external',
  source: 'test',
  critical: false,
};

describe('checkUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return reachable for successful opaque response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      type: 'opaque',
      status: 0,
    } as Response);

    const result = await checkUrl(mockEntry);

    expect(result.status).toBe('reachable');
    expect(result.url).toBe('https://example.com');
    expect(result.label).toBe('Test URL');
    expect(result.responseTimeMs).toBeTypeOf('number');
    expect(result.checkedAt).toBeTruthy();
    expect(result.error).toBeNull();
  });

  it('should return reachable for 200 status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      type: 'cors',
      status: 200,
    } as Response);

    const result = await checkUrl(mockEntry);

    expect(result.status).toBe('reachable');
    expect(result.statusCode).toBe(200);
  });

  it('should return unreachable for 500 status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      type: 'cors',
      status: 500,
    } as Response);

    const result = await checkUrl(mockEntry);

    expect(result.status).toBe('unreachable');
    expect(result.statusCode).toBe(500);
    expect(result.error).toBe('HTTP 500');
  });

  it('should return timeout for aborted requests', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }),
    );

    const result = await checkUrl(mockEntry);

    expect(result.status).toBe('timeout');
    expect(result.error).toBe('Zeitüberschreitung (10s)');
  });

  it('should return unreachable for network errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await checkUrl(mockEntry);

    expect(result.status).toBe('unreachable');
    expect(result.error).toBe('Failed to fetch');
  });

  it('should preserve entry metadata in result', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      type: 'opaque',
      status: 0,
    } as Response);

    const critical: RegisteredUrl = { ...mockEntry, critical: true, category: 'api' };
    const result = await checkUrl(critical);

    expect(result.critical).toBe(true);
    expect(result.category).toBe('api');
    expect(result.source).toBe('test');
  });
});

describe('checkUrls', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should check all URLs and return results array', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      type: 'opaque',
      status: 0,
    } as Response);

    const entries: RegisteredUrl[] = [
      { ...mockEntry, url: 'https://a.com', label: 'A' },
      { ...mockEntry, url: 'https://b.com', label: 'B' },
      { ...mockEntry, url: 'https://c.com', label: 'C' },
    ];

    const results = await checkUrls(entries);

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.status === 'reachable')).toBe(true);
  });

  it('should call onProgress for each checked URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      type: 'opaque',
      status: 0,
    } as Response);

    const entries: RegisteredUrl[] = [
      { ...mockEntry, url: 'https://a.com', label: 'A' },
      { ...mockEntry, url: 'https://b.com', label: 'B' },
    ];

    const onProgress = vi.fn();
    await checkUrls(entries, onProgress);

    expect(onProgress).toHaveBeenCalledTimes(2);
  });

  it('should handle mixed results (some reachable, some not)', async () => {
    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      callCount++;
      if (callCount === 2) {
        throw new TypeError('Failed to fetch');
      }
      return { type: 'opaque', status: 0 } as Response;
    });

    const entries: RegisteredUrl[] = [
      { ...mockEntry, url: 'https://a.com', label: 'A' },
      { ...mockEntry, url: 'https://b.com', label: 'B' },
      { ...mockEntry, url: 'https://c.com', label: 'C' },
    ];

    const results = await checkUrls(entries, undefined, 1);

    expect(results[0].status).toBe('reachable');
    expect(results[1].status).toBe('unreachable');
    expect(results[2].status).toBe('reachable');
  });
});
