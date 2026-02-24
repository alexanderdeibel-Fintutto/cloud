// IndexedDB database schema for offline storage
// Uses `idb` for a clean, promise-based API with TypeScript support

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

// --- Schema definitions ---

export interface TranslationCacheEntry {
  key: string           // "de|en|hallo welt"
  translatedText: string
  provider: string
  match: number
  timestamp: number
}

export interface TTSAudioEntry {
  key: string           // "de-DE|hallo welt|chirp3hd"
  audioBlob: Blob
  timestamp: number
}

export interface ModelMeta {
  id: string            // "opus-mt-de-en"
  type: 'translation' | 'tts' | 'stt'
  sizeBytes: number
  downloadedAt: number
  version: string
}

export interface PhrasePack {
  id: string            // "mediterranean" | "common"
  name: string
  phrases: Array<{ text: string; category: string }>
  languages: string[]   // target language codes for pre-translation
  downloadedAt: number
}

interface TranslatorDB extends DBSchema {
  'translation-cache': {
    key: string
    value: TranslationCacheEntry
    indexes: {
      'by-timestamp': number
    }
  }
  'tts-audio-cache': {
    key: string
    value: TTSAudioEntry
    indexes: {
      'by-timestamp': number
    }
  }
  'model-metadata': {
    key: string
    value: ModelMeta
    indexes: {
      'by-type': string
    }
  }
  'phrase-packs': {
    key: string
    value: PhrasePack
  }
}

const DB_NAME = 'fintutto-translator'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<TranslatorDB> | null = null

export async function getDB(): Promise<IDBPDatabase<TranslatorDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<TranslatorDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Translation cache
      if (!db.objectStoreNames.contains('translation-cache')) {
        const translationStore = db.createObjectStore('translation-cache', { keyPath: 'key' })
        translationStore.createIndex('by-timestamp', 'timestamp')
      }

      // TTS audio cache
      if (!db.objectStoreNames.contains('tts-audio-cache')) {
        const ttsStore = db.createObjectStore('tts-audio-cache', { keyPath: 'key' })
        ttsStore.createIndex('by-timestamp', 'timestamp')
      }

      // Model metadata
      if (!db.objectStoreNames.contains('model-metadata')) {
        const modelStore = db.createObjectStore('model-metadata', { keyPath: 'id' })
        modelStore.createIndex('by-type', 'type')
      }

      // Phrase packs
      if (!db.objectStoreNames.contains('phrase-packs')) {
        db.createObjectStore('phrase-packs', { keyPath: 'id' })
      }
    },
  })

  return dbInstance
}

// Utility: count entries in a store
export async function getStoreCount(storeName: 'translation-cache' | 'tts-audio-cache' | 'model-metadata' | 'phrase-packs'): Promise<number> {
  const db = await getDB()
  return db.count(storeName)
}

// Utility: clear a specific store
export async function clearStore(storeName: 'translation-cache' | 'tts-audio-cache' | 'model-metadata' | 'phrase-packs'): Promise<void> {
  const db = await getDB()
  await db.clear(storeName)
}

// Utility: evict old entries from a timestamped store
export async function evictOldEntries(
  storeName: 'translation-cache' | 'tts-audio-cache',
  maxAgeMs: number,
): Promise<number> {
  const db = await getDB()
  const cutoff = Date.now() - maxAgeMs
  const tx = db.transaction(storeName, 'readwrite')
  const index = tx.store.index('by-timestamp')
  let cursor = await index.openCursor()
  let deleted = 0

  while (cursor) {
    if (cursor.value.timestamp < cutoff) {
      await cursor.delete()
      deleted++
    } else {
      // Index is ordered, so once we pass cutoff we can stop
      break
    }
    cursor = await cursor.continue()
  }

  await tx.done
  return deleted
}
