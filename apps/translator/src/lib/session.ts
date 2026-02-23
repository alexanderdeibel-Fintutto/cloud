// Session code format: "TR-XXXX" (4 chars, no confusing 0/O/I/1/L)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateSessionCode(): string {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return `TR-${code}`
}

export function getSessionUrl(code: string): string {
  const base = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://translator.fintutto.cloud'
  return `${base}/live/${code}`
}

export function getChannelName(code: string): string {
  return `live-${code}`
}

// --- Message types (mirrors AI-Guide iOS protocol) ---

export interface TranslationChunk {
  id: string
  sourceText: string
  translatedText: string
  sourceLang: string
  targetLanguage: string
  isFinal: boolean
  timestamp: number
}

export interface SessionInfo {
  sessionCode: string
  speakerName: string
  sourceLanguage: string
  listenerCount: number
}

export interface StatusMessage {
  speaking: boolean
  ended: boolean
}

export interface PresenceState {
  deviceName: string
  targetLanguage: string
  joinedAt: string
}
