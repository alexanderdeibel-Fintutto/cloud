const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

export interface TranslationResult {
  translatedText: string
  match: number
}

// In-memory cache to avoid duplicate API calls for same text+language pair
const cache = new Map<string, { result: TranslationResult; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(text: string, sourceLang: string, targetLang: string): string {
  return `${sourceLang}|${targetLang}|${text.trim().toLowerCase()}`
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

  const langPair = `${sourceLang}|${targetLang}`
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Translation failed: ${response.statusText}`)
  }

  const data = await response.json()

  if (data.responseStatus !== 200 && data.responseStatus !== '200') {
    throw new Error(data.responseDetails || 'Translation failed')
  }

  const result: TranslationResult = {
    translatedText: data.responseData.translatedText,
    match: data.responseData.match,
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
