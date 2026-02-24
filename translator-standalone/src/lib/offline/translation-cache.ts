// Persistent translation cache backed by IndexedDB
// Survives page reloads and app restarts (30-day TTL)

import { getDB, evictOldEntries, type TranslationCacheEntry } from './db'
import type { TranslationResult } from '../translate'

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const MAX_ENTRIES = 10_000

function makeCacheKey(text: string, sourceLang: string, targetLang: string): string {
  return `${sourceLang}|${targetLang}|${text.trim().toLowerCase()}`
}

/**
 * Look up a translation in the persistent IndexedDB cache.
 */
export async function getCachedTranslation(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult | null> {
  try {
    const db = await getDB()
    const key = makeCacheKey(text, sourceLang, targetLang)
    const entry = await db.get('translation-cache', key)

    if (!entry) return null

    // Check TTL
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      // Expired — delete and return null
      await db.delete('translation-cache', key)
      return null
    }

    return {
      translatedText: entry.translatedText,
      match: entry.match,
      provider: entry.provider as TranslationResult['provider'],
    }
  } catch (err) {
    console.warn('[TranslationCache] Read failed:', err)
    return null
  }
}

/**
 * Store a translation result in the persistent IndexedDB cache.
 */
export async function cacheTranslation(
  text: string,
  sourceLang: string,
  targetLang: string,
  result: TranslationResult,
): Promise<void> {
  try {
    const db = await getDB()
    const key = makeCacheKey(text, sourceLang, targetLang)

    const entry: TranslationCacheEntry = {
      key,
      translatedText: result.translatedText,
      provider: result.provider || 'unknown',
      match: result.match,
      timestamp: Date.now(),
    }

    await db.put('translation-cache', entry)

    // Periodic cleanup: if we're over max entries, evict old ones
    const count = await db.count('translation-cache')
    if (count > MAX_ENTRIES) {
      await evictOldEntries('translation-cache', CACHE_TTL_MS)
    }
  } catch (err) {
    console.warn('[TranslationCache] Write failed:', err)
  }
}

/**
 * Get cache statistics.
 */
export async function getCacheStats(): Promise<{
  entryCount: number
  oldestTimestamp: number | null
  newestTimestamp: number | null
}> {
  try {
    const db = await getDB()
    const count = await db.count('translation-cache')

    if (count === 0) {
      return { entryCount: 0, oldestTimestamp: null, newestTimestamp: null }
    }

    const tx = db.transaction('translation-cache', 'readonly')
    const index = tx.store.index('by-timestamp')

    // Oldest (first in timestamp order)
    const oldestCursor = await index.openCursor()
    const oldest = oldestCursor?.value.timestamp ?? null

    // Newest (last in timestamp order)
    const newestCursor = await index.openCursor(null, 'prev')
    const newest = newestCursor?.value.timestamp ?? null

    return { entryCount: count, oldestTimestamp: oldest, newestTimestamp: newest }
  } catch (err) {
    console.warn('[TranslationCache] Stats failed:', err)
    return { entryCount: 0, oldestTimestamp: null, newestTimestamp: null }
  }
}

/**
 * Clear all cached translations.
 */
export async function clearTranslationCache(): Promise<void> {
  const db = await getDB()
  await db.clear('translation-cache')
}
