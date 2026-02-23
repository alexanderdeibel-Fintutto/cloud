// Offline translation engine using Transformers.js + Opus-MT ONNX models
// Supports direct pairs and English-pivot for indirect translations

import type { TranslationResult } from '../translate'
import { getModelId, canPivotTranslate, isModelDownloaded, recordModelDownload, OPUS_MT_MODELS } from './model-manager'

// Lazy-loaded pipeline instances (one per model)
const pipelines = new Map<string, unknown>()

// Dynamic import to avoid bundling Transformers.js when not needed
async function getTransformersModule() {
  return import('@huggingface/transformers')
}

/**
 * Load or retrieve a cached translation pipeline for a model.
 */
async function getPipeline(modelId: string, onProgress?: (progress: number) => void) {
  if (pipelines.has(modelId)) {
    return pipelines.get(modelId)
  }

  const { pipeline } = await getTransformersModule()

  const pipe = await pipeline('translation', modelId, {
    progress_callback: (data: { status: string; progress?: number; loaded?: number; total?: number }) => {
      if (data.status === 'progress' && data.progress !== undefined && onProgress) {
        onProgress(data.progress)
      }
      if (data.status === 'done' && data.loaded) {
        // Record the download in our metadata DB
        recordModelDownload(modelId, 'translation', data.loaded).catch(() => {})
      }
    },
  })

  pipelines.set(modelId, pipe)
  return pipe
}

/**
 * Translate text offline using Opus-MT.
 * For unsupported direct pairs, pivots through English.
 */
export async function translateOffline(
  text: string,
  sourceLang: string,
  targetLang: string,
  onProgress?: (progress: number) => void,
): Promise<TranslationResult> {
  // Direct translation
  const directModelId = getModelId(sourceLang, targetLang)
  if (directModelId) {
    const pipe = await getPipeline(directModelId, onProgress) as (input: string) => Promise<Array<{ translation_text: string }>>
    const result = await pipe(text)
    return {
      translatedText: result[0].translation_text,
      match: 0.85,
      provider: 'offline',
    }
  }

  // Pivot through English: src→en, then en→tgt
  if (canPivotTranslate(sourceLang, targetLang)) {
    const srcToEnModelId = getModelId(sourceLang, 'en')!
    const enToTgtModelId = getModelId('en', targetLang)!

    // First leg: src → en
    const pipe1 = await getPipeline(srcToEnModelId, onProgress ? (p) => onProgress(p * 0.5) : undefined) as (input: string) => Promise<Array<{ translation_text: string }>>
    const intermediate = await pipe1(text)
    const englishText = intermediate[0].translation_text

    // Second leg: en → tgt
    const pipe2 = await getPipeline(enToTgtModelId, onProgress ? (p) => onProgress(50 + p * 0.5) : undefined) as (input: string) => Promise<Array<{ translation_text: string }>>
    const result = await pipe2(englishText)

    return {
      translatedText: result[0].translation_text,
      match: 0.75, // Lower confidence for pivot translation
      provider: 'offline',
    }
  }

  throw new Error(`Keine Offline-Übersetzung verfügbar für ${sourceLang} → ${targetLang}`)
}

/**
 * Check if a language pair can be translated offline (model downloaded).
 */
export async function isLanguagePairAvailable(src: string, tgt: string): Promise<boolean> {
  const directModelId = getModelId(src, tgt)
  if (directModelId) {
    return isModelDownloaded(directModelId)
  }

  // Check pivot availability
  if (canPivotTranslate(src, tgt)) {
    const srcToEnId = getModelId(src, 'en')!
    const enToTgtId = getModelId('en', tgt)!
    const [srcDone, tgtDone] = await Promise.all([
      isModelDownloaded(srcToEnId),
      isModelDownloaded(enToTgtId),
    ])
    return srcDone && tgtDone
  }

  return false
}

/**
 * Get all language pairs that are theoretically possible offline
 * (with or without pivot), regardless of download status.
 */
export function getSupportedOfflinePairs(): Array<{ src: string; tgt: string; isDirect: boolean }> {
  const pairs: Array<{ src: string; tgt: string; isDirect: boolean }> = []

  // Direct pairs
  for (const key of Object.keys(OPUS_MT_MODELS)) {
    const [src, tgt] = key.split('-')
    pairs.push({ src, tgt, isDirect: true })
  }

  // Pivot pairs (where both legs exist)
  const srcLangs = new Set<string>()
  const tgtLangs = new Set<string>()
  for (const key of Object.keys(OPUS_MT_MODELS)) {
    const [src, tgt] = key.split('-')
    if (tgt === 'en') srcLangs.add(src)
    if (src === 'en') tgtLangs.add(tgt)
  }

  for (const src of srcLangs) {
    for (const tgt of tgtLangs) {
      if (src !== tgt && !OPUS_MT_MODELS[`${src}-${tgt}`]) {
        pairs.push({ src, tgt, isDirect: false })
      }
    }
  }

  return pairs
}

/**
 * Preload a model into memory (warm up the pipeline).
 * This downloads the model if not cached and initializes the ONNX runtime.
 */
export async function preloadModel(
  src: string,
  tgt: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  const modelId = getModelId(src, tgt)
  if (!modelId) throw new Error(`No model available for ${src}-${tgt}`)
  await getPipeline(modelId, onProgress)
}

/**
 * Unload a model from memory (free WASM resources).
 */
export function unloadModel(src: string, tgt: string): void {
  const modelId = getModelId(src, tgt)
  if (modelId) {
    pipelines.delete(modelId)
  }
}
