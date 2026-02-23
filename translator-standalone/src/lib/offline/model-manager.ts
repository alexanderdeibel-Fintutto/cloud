// Model download and lifecycle manager
// Uses Cache API for model storage (efficient for large blobs)
// Uses IndexedDB for metadata tracking

import { getDB, type ModelMeta } from './db'

const MODEL_CACHE_NAME = 'offline-models'

// Known Opus-MT model mappings: language code → HuggingFace model ID
// These models are quantized ONNX (int8), ~30-40MB each
export const OPUS_MT_MODELS: Record<string, string> = {
  // German ↔ English
  'de-en': 'Xenova/opus-mt-de-en',
  'en-de': 'Xenova/opus-mt-en-de',
  // English ↔ Romance
  'en-fr': 'Xenova/opus-mt-en-fr',
  'fr-en': 'Xenova/opus-mt-fr-en',
  'en-es': 'Xenova/opus-mt-en-es',
  'es-en': 'Xenova/opus-mt-es-en',
  'en-it': 'Xenova/opus-mt-en-it',
  'it-en': 'Xenova/opus-mt-it-en',
  'en-pt': 'Xenova/opus-mt-en-pt',
  'pt-en': 'Xenova/opus-mt-tc-big-en-pt',
  // English ↔ Others
  'en-nl': 'Xenova/opus-mt-en-nl',
  'nl-en': 'Xenova/opus-mt-nl-en',
  'en-ru': 'Xenova/opus-mt-en-ru',
  'ru-en': 'Xenova/opus-mt-ru-en',
  'en-pl': 'Xenova/opus-mt-en-zlw',  // zlw = West Slavic (covers pl)
  'en-cs': 'Xenova/opus-mt-en-zlw',
  'en-tr': 'Xenova/opus-mt-en-trk',  // trk = Turkic
  'en-sv': 'Xenova/opus-mt-en-sv',
  'en-da': 'Xenova/opus-mt-en-da',
  'en-el': 'Xenova/opus-mt-en-el',
  'el-en': 'Xenova/opus-mt-grk-en',
}

// Language pairs that can be handled via English pivot
export function canPivotTranslate(src: string, tgt: string): boolean {
  if (src === 'en' || tgt === 'en') return false
  const srcToEn = `${src}-en`
  const enToTgt = `en-${tgt}`
  return srcToEn in OPUS_MT_MODELS && enToTgt in OPUS_MT_MODELS
}

/**
 * Get the HuggingFace model ID for a language pair.
 */
export function getModelId(src: string, tgt: string): string | null {
  return OPUS_MT_MODELS[`${src}-${tgt}`] || null
}

/**
 * Check if a specific model has been downloaded.
 */
export async function isModelDownloaded(modelId: string): Promise<boolean> {
  try {
    const db = await getDB()
    const meta = await db.get('model-metadata', modelId)
    return !!meta
  } catch {
    return false
  }
}

/**
 * Record that a model has been downloaded (Transformers.js handles actual caching).
 */
export async function recordModelDownload(
  modelId: string,
  type: ModelMeta['type'],
  sizeBytes: number,
): Promise<void> {
  const db = await getDB()
  await db.put('model-metadata', {
    id: modelId,
    type,
    sizeBytes,
    downloadedAt: Date.now(),
    version: '1.0',
  })
}

/**
 * Get all downloaded models.
 */
export async function getDownloadedModels(): Promise<ModelMeta[]> {
  const db = await getDB()
  return db.getAll('model-metadata')
}

/**
 * Get models by type.
 */
export async function getModelsByType(type: ModelMeta['type']): Promise<ModelMeta[]> {
  const db = await getDB()
  return db.getAllFromIndex('model-metadata', 'by-type', type)
}

/**
 * Delete a model's metadata and clear its cache.
 */
export async function deleteModel(modelId: string): Promise<void> {
  const db = await getDB()
  await db.delete('model-metadata', modelId)

  // Also try to clear from Cache API
  try {
    const cache = await caches.open(MODEL_CACHE_NAME)
    const keys = await cache.keys()
    for (const key of keys) {
      if (key.url.includes(modelId.replace('/', '%2F')) || key.url.includes(modelId)) {
        await cache.delete(key)
      }
    }
  } catch {
    // Cache API not available or model not in cache
  }
}

/**
 * Get total storage used by all downloaded models.
 */
export async function getTotalModelStorage(): Promise<number> {
  const models = await getDownloadedModels()
  return models.reduce((sum, m) => sum + m.sizeBytes, 0)
}

/**
 * Get downloadable language pairs based on what's available and already downloaded.
 */
export async function getLanguagePairStatus(): Promise<Array<{
  src: string
  tgt: string
  modelId: string
  downloaded: boolean
  sizeEstimateMB: number
}>> {
  const downloaded = await getDownloadedModels()
  const downloadedIds = new Set(downloaded.map(m => m.id))

  const pairs: Array<{
    src: string
    tgt: string
    modelId: string
    downloaded: boolean
    sizeEstimateMB: number
  }> = []

  for (const [pair, modelId] of Object.entries(OPUS_MT_MODELS)) {
    const [src, tgt] = pair.split('-')
    pairs.push({
      src,
      tgt,
      modelId,
      downloaded: downloadedIds.has(modelId),
      sizeEstimateMB: 35, // average Opus-MT ONNX int8 size
    })
  }

  return pairs
}
