// TTS audio cache backed by IndexedDB
// Once heard online → always available offline in cloud quality

import { getDB, evictOldEntries, type TTSAudioEntry } from './db'
import type { VoiceQuality } from '../tts'

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const MAX_ENTRIES = 2000

function makeCacheKey(text: string, speechCode: string, quality: VoiceQuality): string {
  return `${speechCode}|${text.trim().toLowerCase()}|${quality}`
}

/**
 * Look up cached TTS audio in IndexedDB.
 */
export async function getCachedTTSAudio(
  text: string,
  speechCode: string,
  quality: VoiceQuality,
): Promise<Blob | null> {
  try {
    const db = await getDB()
    const key = makeCacheKey(text, speechCode, quality)
    const entry = await db.get('tts-audio-cache', key)

    if (!entry) return null

    // Check TTL
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      await db.delete('tts-audio-cache', key)
      return null
    }

    return entry.audioBlob
  } catch (err) {
    console.warn('[TTSCache] Read failed:', err)
    return null
  }
}

/**
 * Store TTS audio in IndexedDB cache.
 */
export async function cacheTTSAudio(
  text: string,
  speechCode: string,
  quality: VoiceQuality,
  audioBlob: Blob,
): Promise<void> {
  try {
    const db = await getDB()
    const key = makeCacheKey(text, speechCode, quality)

    const entry: TTSAudioEntry = {
      key,
      audioBlob,
      timestamp: Date.now(),
    }

    await db.put('tts-audio-cache', entry)

    // Periodic cleanup
    const count = await db.count('tts-audio-cache')
    if (count > MAX_ENTRIES) {
      await evictOldEntries('tts-audio-cache', CACHE_TTL_MS)
    }
  } catch (err) {
    console.warn('[TTSCache] Write failed:', err)
  }
}

/**
 * Get cache statistics.
 */
export async function getTTSCacheStats(): Promise<{ entryCount: number }> {
  try {
    const db = await getDB()
    const count = await db.count('tts-audio-cache')
    return { entryCount: count }
  } catch {
    return { entryCount: 0 }
  }
}

/**
 * Clear all cached TTS audio.
 */
export async function clearTTSCache(): Promise<void> {
  const db = await getDB()
  await db.clear('tts-audio-cache')
}
