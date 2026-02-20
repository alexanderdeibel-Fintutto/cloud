const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

export interface TranslationResult {
  translatedText: string
  match: number
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  if (!text.trim()) {
    return { translatedText: '', match: 0 }
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

  return {
    translatedText: data.responseData.translatedText,
    match: data.responseData.match,
  }
}
