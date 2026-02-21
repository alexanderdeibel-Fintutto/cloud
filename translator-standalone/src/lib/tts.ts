// Google Cloud Text-to-Speech API integration
// Provides natural-sounding Neural2/WaveNet voices

const API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY || 'AIzaSyD0jpDgyihxFytR-jDIxEHj17kl4Oz9FGY'
const API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'

// Best available voice per language (Neural2 > WaveNet > Standard)
const VOICE_MAP: Record<string, { languageCode: string; name: string }> = {
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

export function isCloudTTSAvailable(): boolean {
  return !!API_KEY
}

function getVoiceConfig(speechCode: string) {
  // Try exact match first, then prefix match
  const exact = VOICE_MAP[speechCode]
  if (exact) return exact

  const prefix = speechCode.split('-')[0]
  for (const [key, value] of Object.entries(VOICE_MAP)) {
    if (key.startsWith(prefix)) return value
  }

  // Fallback: use the language code directly
  return { languageCode: speechCode, name: '' }
}

export async function speakWithCloudTTS(text: string, speechCode: string): Promise<HTMLAudioElement> {
  if (!API_KEY) {
    throw new Error('Google Cloud TTS API key not configured')
  }

  const voiceConfig = getVoiceConfig(speechCode)

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

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Cloud TTS failed: ${error}`)
  }

  const data = await response.json()
  const audioContent = data.audioContent as string

  // Convert base64 to audio and play
  const audioBlob = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))
  const blob = new Blob([audioBlob], { type: 'audio/mp3' })
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  // Clean up blob URL when done
  audio.addEventListener('ended', () => URL.revokeObjectURL(url))
  audio.addEventListener('error', () => URL.revokeObjectURL(url))

  return audio
}
