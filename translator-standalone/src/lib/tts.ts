// Google Cloud Text-to-Speech API integration
// Supports Neural2 (standard) and Chirp 3 HD (premium) voices
// Audio responses are cached in IndexedDB for offline playback

import { getCachedTTSAudio, cacheTTSAudio } from './offline/tts-cache'

const API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY || 'AIzaSyD0jpDgyihxFytR-jDIxEHj17kl4Oz9FGY'
const API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'
const API_URL_BETA = 'https://texttospeech.googleapis.com/v1beta1/text:synthesize'

export type VoiceQuality = 'neural2' | 'chirp3hd'

// Neural2/WaveNet/Standard voices (current default)
const VOICE_MAP_NEURAL: Record<string, { languageCode: string; name: string }> = {
  'de-DE': { languageCode: 'de-DE', name: 'de-DE-Neural2-C' },
  'en-US': { languageCode: 'en-US', name: 'en-US-Neural2-C' },
  'fr-FR': { languageCode: 'fr-FR', name: 'fr-FR-Neural2-A' },
  'es-ES': { languageCode: 'es-ES', name: 'es-ES-Neural2-A' },
  'it-IT': { languageCode: 'it-IT', name: 'it-IT-Neural2-A' },
  'pt-PT': { languageCode: 'pt-PT', name: 'pt-PT-Neural2-A' },
  'nl-NL': { languageCode: 'nl-NL', name: 'nl-NL-Standard-A' },
  'pl-PL': { languageCode: 'pl-PL', name: 'pl-PL-Standard-A' },
  'tr-TR': { languageCode: 'tr-TR', name: 'tr-TR-Standard-A' },
  'ru-RU': { languageCode: 'ru-RU', name: 'ru-RU-Standard-A' },
  'uk-UA': { languageCode: 'uk-UA', name: 'uk-UA-Standard-A' },
  'ar-SA': { languageCode: 'ar-XA', name: 'ar-XA-Standard-A' },
  'zh-CN': { languageCode: 'cmn-CN', name: 'cmn-CN-Standard-A' },
  'ja-JP': { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B' },
  'ko-KR': { languageCode: 'ko-KR', name: 'ko-KR-Neural2-A' },
  'hi-IN': { languageCode: 'hi-IN', name: 'hi-IN-Neural2-A' },
  'sv-SE': { languageCode: 'sv-SE', name: 'sv-SE-Standard-A' },
  'da-DK': { languageCode: 'da-DK', name: 'da-DK-Standard-A' },
  'cs-CZ': { languageCode: 'cs-CZ', name: 'cs-CZ-Standard-A' },
  'ro-RO': { languageCode: 'ro-RO', name: 'ro-RO-Standard-A' },
  'el-GR': { languageCode: 'el-GR', name: 'el-GR-Standard-A' },
  'hu-HU': { languageCode: 'hu-HU', name: 'hu-HU-Standard-A' },
}

// Chirp 3 HD voices — multi-language, highest quality
// Uses v1beta1 endpoint. Falls back to Neural2 if unavailable.
const CHIRP_VOICE_MAP: Record<string, { languageCode: string; name: string }> = {
  'de-DE': { languageCode: 'de-DE', name: 'de-DE-Chirp3-HD-Achernar' },
  'en-US': { languageCode: 'en-US', name: 'en-US-Chirp3-HD-Achernar' },
  'fr-FR': { languageCode: 'fr-FR', name: 'fr-FR-Chirp3-HD-Achernar' },
  'es-ES': { languageCode: 'es-ES', name: 'es-ES-Chirp3-HD-Achernar' },
  'it-IT': { languageCode: 'it-IT', name: 'it-IT-Chirp3-HD-Achernar' },
  'pt-PT': { languageCode: 'pt-PT', name: 'pt-PT-Chirp3-HD-Achernar' },
  'ja-JP': { languageCode: 'ja-JP', name: 'ja-JP-Chirp3-HD-Achernar' },
  'ko-KR': { languageCode: 'ko-KR', name: 'ko-KR-Chirp3-HD-Achernar' },
  'zh-CN': { languageCode: 'cmn-CN', name: 'cmn-CN-Chirp3-HD-Achernar' },
  'hi-IN': { languageCode: 'hi-IN', name: 'hi-IN-Chirp3-HD-Achernar' },
  'ar-SA': { languageCode: 'ar-XA', name: 'ar-XA-Chirp3-HD-Achernar' },
  'ru-RU': { languageCode: 'ru-RU', name: 'ru-RU-Chirp3-HD-Achernar' },
  'tr-TR': { languageCode: 'tr-TR', name: 'tr-TR-Chirp3-HD-Achernar' },
  'nl-NL': { languageCode: 'nl-NL', name: 'nl-NL-Chirp3-HD-Achernar' },
  'pl-PL': { languageCode: 'pl-PL', name: 'pl-PL-Chirp3-HD-Achernar' },
  'sv-SE': { languageCode: 'sv-SE', name: 'sv-SE-Chirp3-HD-Achernar' },
}

export function isCloudTTSAvailable(): boolean {
  return !!API_KEY
}

function getVoiceConfig(speechCode: string, quality: VoiceQuality = 'neural2') {
  const map = quality === 'chirp3hd' ? CHIRP_VOICE_MAP : VOICE_MAP_NEURAL

  // Try exact match first, then prefix match
  const exact = map[speechCode]
  if (exact) return { config: exact, useBeta: quality === 'chirp3hd' }

  const prefix = speechCode.split('-')[0]
  for (const [key, value] of Object.entries(map)) {
    if (key.startsWith(prefix)) return { config: value, useBeta: quality === 'chirp3hd' }
  }

  // If Chirp not available for this language, fall back to Neural2
  if (quality === 'chirp3hd') {
    return getVoiceConfig(speechCode, 'neural2')
  }

  // Final fallback: use the language code directly
  return { config: { languageCode: speechCode, name: '' }, useBeta: false }
}

export async function speakWithCloudTTS(
  text: string,
  speechCode: string,
  quality: VoiceQuality = 'neural2',
): Promise<HTMLAudioElement> {
  // 1. Check IndexedDB cache first (for offline playback)
  try {
    const cachedBlob = await getCachedTTSAudio(text, speechCode, quality)
    if (cachedBlob) {
      console.log('[TTS] Playing from cache')
      const url = URL.createObjectURL(cachedBlob)
      const audio = new Audio(url)
      audio.addEventListener('ended', () => URL.revokeObjectURL(url))
      audio.addEventListener('error', () => URL.revokeObjectURL(url))
      return audio
    }
  } catch {
    // Cache read failed — continue to API
  }

  if (!API_KEY) {
    throw new Error('Google Cloud TTS API key not configured')
  }

  const { config: voiceConfig, useBeta } = getVoiceConfig(speechCode, quality)
  const apiUrl = useBeta ? API_URL_BETA : API_URL

  const body: Record<string, unknown> = {
    input: { text },
    voice: {
      languageCode: voiceConfig.languageCode,
      ...(voiceConfig.name ? { name: voiceConfig.name } : {}),
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.95,
      pitch: 0,
    },
  }

  const response = await fetch(`${apiUrl}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    // If Chirp fails, auto-fallback to Neural2
    if (quality === 'chirp3hd') {
      console.warn('[TTS] Chirp 3 HD failed, falling back to Neural2')
      return speakWithCloudTTS(text, speechCode, 'neural2')
    }
    const error = await response.text()
    throw new Error(`Cloud TTS failed: ${error}`)
  }

  const data = await response.json()
  const audioContent = data.audioContent as string

  // Convert base64 to audio
  const audioBytes = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))
  const blob = new Blob([audioBytes], { type: 'audio/mp3' })

  // 2. Cache the audio blob for offline use
  cacheTTSAudio(text, speechCode, quality, blob).catch(() => {})

  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  // Clean up blob URL when done
  audio.addEventListener('ended', () => URL.revokeObjectURL(url))
  audio.addEventListener('error', () => URL.revokeObjectURL(url))

  return audio
}
