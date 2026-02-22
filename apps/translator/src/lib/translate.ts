const MYMEMORY_API = 'https://api.mymemory.translated.net/get'
const LIBRE_API = 'https://libretranslate.com/translate'

export interface TranslationResult {
  translatedText: string
  match: number
  provider?: 'mymemory' | 'libre'
}

// In-memory cache to avoid duplicate API calls for same text+language pair
const cache = new Map<string, { result: TranslationResult; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Circuit breaker state for MyMemory
let myMemoryFailCount = 0
let myMemoryCircuitOpen = false
let myMemoryCircuitResetAt = 0
const CIRCUIT_THRESHOLD = 3
const CIRCUIT_RESET_MS = 30_000 // 30 seconds

function getCacheKey(text: string, sourceLang: string, targetLang: string): string {
  return `${sourceLang}|${targetLang}|${text.trim().toLowerCase()}`
}

function isMyMemoryHealthy(): boolean {
  if (!myMemoryCircuitOpen) return true
  if (Date.now() > myMemoryCircuitResetAt) {
    // Half-open: allow one attempt
    myMemoryCircuitOpen = false
    myMemoryFailCount = 0
    return true
  }
  return false
}

function recordMyMemoryFailure() {
  myMemoryFailCount++
  if (myMemoryFailCount >= CIRCUIT_THRESHOLD) {
    myMemoryCircuitOpen = true
    myMemoryCircuitResetAt = Date.now() + CIRCUIT_RESET_MS
    console.warn(`[Translate] Circuit breaker open — switching to fallback for ${CIRCUIT_RESET_MS / 1000}s`)
  }
}

function recordMyMemorySuccess() {
  myMemoryFailCount = 0
  myMemoryCircuitOpen = false
}

async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  const langPair = `${sourceLang}|${targetLang}`
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`MyMemory failed: ${response.statusText}`)
  }

  const data = await response.json()

  if (data.responseStatus !== 200 && data.responseStatus !== '200') {
    throw new Error(data.responseDetails || 'MyMemory translation failed')
  }

  return {
    translatedText: data.responseData.translatedText,
    match: data.responseData.match,
    provider: 'mymemory',
  }
}

async function translateWithLibre(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  const response = await fetch(LIBRE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text',
    }),
  })

  if (!response.ok) {
    throw new Error(`LibreTranslate failed: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    translatedText: data.translatedText,
    match: 0.8, // LibreTranslate doesn't provide match scores
    provider: 'libre',
  }
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  if (!text.trim()) {
    return { translatedText: '', match: 0 }
  }

  // Check cache
  const cacheKey = getCacheKey(text, sourceLang, targetLang)
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result
  }

  let result: TranslationResult

  // Try MyMemory first (if circuit breaker allows)
  if (isMyMemoryHealthy()) {
    try {
      result = await translateWithMyMemory(text, sourceLang, targetLang)
      recordMyMemorySuccess()
    } catch (err) {
      console.warn('[Translate] MyMemory failed, trying fallback:', err)
      recordMyMemoryFailure()
      // Fallback to LibreTranslate
      try {
        result = await translateWithLibre(text, sourceLang, targetLang)
      } catch (libreErr) {
        console.error('[Translate] All providers failed:', libreErr)
        throw new Error('Übersetzung fehlgeschlagen — bitte versuche es erneut')
      }
    }
  } else {
    // Circuit open: go directly to fallback
    try {
      result = await translateWithLibre(text, sourceLang, targetLang)
    } catch (libreErr) {
      // Last resort: try MyMemory anyway
      try {
        result = await translateWithMyMemory(text, sourceLang, targetLang)
        recordMyMemorySuccess()
      } catch {
        throw new Error('Übersetzung fehlgeschlagen — bitte versuche es erneut')
      }
    }
  }

  // Store in cache
  cache.set(cacheKey, { result, timestamp: Date.now() })

  // Evict old entries if cache grows too large
  if (cache.size > 500) {
    const now = Date.now()
    for (const [key, entry] of cache) {
      if (now - entry.timestamp > CACHE_TTL) cache.delete(key)
    }
  }

  return result
}
