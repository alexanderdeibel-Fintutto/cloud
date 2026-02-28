// Translation providers: Google Cloud (primary) -> MyMemory (fallback) -> LibreTranslate (fallback)

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY || 'AIzaSyD0jpDgyihxFytR-jDIxEHj17kl4Oz9FGY'
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'
const MYMEMORY_API = 'https://api.mymemory.translated.net/get'
const LIBRE_API = 'https://libretranslate.com/translate'

export interface TranslationResult {
  translatedText: string
  match: number
  provider?: 'google' | 'mymemory' | 'libre'
}

const cache = new Map<string, { result: TranslationResult; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

interface CircuitState {
  failCount: number
  isOpen: boolean
  resetAt: number
}

const circuits: Record<string, CircuitState> = {
  google: { failCount: 0, isOpen: false, resetAt: 0 },
  mymemory: { failCount: 0, isOpen: false, resetAt: 0 },
}
const CIRCUIT_THRESHOLD = 3
const CIRCUIT_RESET_MS = 30_000

function getCacheKey(text: string, sourceLang: string, targetLang: string): string {
  return `${sourceLang}|${targetLang}|${text.trim().toLowerCase()}`
}

function isHealthy(provider: string): boolean {
  const c = circuits[provider]
  if (!c || !c.isOpen) return true
  if (Date.now() > c.resetAt) {
    c.isOpen = false
    c.failCount = 0
    return true
  }
  return false
}

function recordFailure(provider: string) {
  const c = circuits[provider]
  if (!c) return
  c.failCount++
  if (c.failCount >= CIRCUIT_THRESHOLD) {
    c.isOpen = true
    c.resetAt = Date.now() + CIRCUIT_RESET_MS
  }
}

function recordSuccess(provider: string) {
  const c = circuits[provider]
  if (!c) return
  c.failCount = 0
  c.isOpen = false
}

async function translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
  const response = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: sourceLang, target: targetLang, format: 'text' }),
  })
  if (!response.ok) throw new Error(`Google Translate failed (${response.status})`)
  const data = await response.json()
  const translated = data.data?.translations?.[0]?.translatedText
  if (!translated) throw new Error('Google Translate returned empty result')
  return { translatedText: translated, match: 1.0, provider: 'google' }
}

async function translateWithMyMemory(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
  const langPair = `${sourceLang}|${targetLang}`
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`MyMemory failed: ${response.statusText}`)
  const data = await response.json()
  if (data.responseStatus !== 200 && data.responseStatus !== '200') {
    throw new Error(data.responseDetails || 'MyMemory translation failed')
  }
  return { translatedText: data.responseData.translatedText, match: data.responseData.match, provider: 'mymemory' }
}

async function translateWithLibre(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
  const response = await fetch(LIBRE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: sourceLang, target: targetLang, format: 'text' }),
  })
  if (!response.ok) throw new Error(`LibreTranslate failed: ${response.statusText}`)
  const data = await response.json()
  return { translatedText: data.translatedText, match: 0.8, provider: 'libre' }
}

type ProviderDef = {
  name: string
  fn: (text: string, src: string, tgt: string) => Promise<TranslationResult>
  circuitKey?: string
}

const providers: ProviderDef[] = [
  { name: 'Google', fn: translateWithGoogle, circuitKey: 'google' },
  { name: 'MyMemory', fn: translateWithMyMemory, circuitKey: 'mymemory' },
  { name: 'LibreTranslate', fn: translateWithLibre },
]

export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
  if (!text.trim()) return { translatedText: '', match: 0 }

  const cacheKey = getCacheKey(text, sourceLang, targetLang)
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.result

  let lastError: Error | null = null

  for (const provider of providers) {
    if (provider.circuitKey && !isHealthy(provider.circuitKey)) continue
    try {
      const result = await provider.fn(text, sourceLang, targetLang)
      if (provider.circuitKey) recordSuccess(provider.circuitKey)
      cache.set(cacheKey, { result, timestamp: Date.now() })
      if (cache.size > 500) {
        const now = Date.now()
        for (const [key, entry] of cache) {
          if (now - entry.timestamp > CACHE_TTL) cache.delete(key)
        }
      }
      return result
    } catch (err) {
      if (provider.circuitKey) recordFailure(provider.circuitKey)
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError || new Error('Uebersetzung fehlgeschlagen')
}
