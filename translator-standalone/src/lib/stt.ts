// Speech-to-Text abstraction layer
// Currently supports: Web Speech API (Chrome/Edge)
// Future: Apple SpeechAnalyzer (iOS 26), Google Cloud STT

// Type declarations for Web Speech API (not in all TS lib bundles)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export type STTProvider = 'web-speech' | 'apple-speech-analyzer' | 'google-cloud-stt' | 'whisper'

export interface STTResult {
  text: string
  isFinal: boolean
  confidence?: number
}

export interface STTEngine {
  readonly provider: STTProvider
  readonly isSupported: boolean
  start(lang: string, onResult: (result: STTResult) => void, onError: (error: string) => void): Promise<void>
  stop(): void
}

// --- Web Speech API engine (current default) ---

export function createWebSpeechEngine(): STTEngine {
  let recognition: SpeechRecognitionInstance | null = null
  let stream: MediaStream | null = null
  let shouldBeListening = false

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  return {
    provider: 'web-speech',
    isSupported,

    async start(lang, onResult, onError) {
      // Clean up existing
      if (recognition) {
        try { recognition.abort() } catch { /* ignore */ }
        recognition = null
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
        stream = null
      }

      // Request mic permission
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (e) {
        if (e instanceof DOMException && e.name === 'NotAllowedError') {
          onError('Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.')
        } else {
          onError('Mikrofon nicht verfügbar. Bitte prüfen Sie Ihre Geräte-Einstellungen.')
        }
        return
      }

      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognitionCtor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = lang

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          onResult({
            text: result[0].transcript,
            isFinal: result.isFinal,
            confidence: result[0].confidence,
          })
        }
      }

      recognition.onerror = (event) => {
        const err = event as SpeechRecognitionErrorEvent
        if (err.error === 'no-speech') return // non-fatal
        if (err.error === 'aborted') return

        shouldBeListening = false
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }

        if (err.error === 'not-allowed') {
          onError('Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.')
        } else if (err.error === 'network') {
          onError('Netzwerkfehler bei der Spracherkennung. Bitte prüfen Sie Ihre Internetverbindung.')
        } else {
          onError(`Spracheingabe-Fehler: ${err.error}`)
        }
      }

      recognition.onend = () => {
        if (shouldBeListening && recognition) {
          try { recognition.start(); return } catch { /* fall through */ }
        }
        shouldBeListening = false
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
      }

      shouldBeListening = true
      try {
        recognition.start()
      } catch {
        shouldBeListening = false
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
        recognition = null
        onError('Spracheingabe konnte nicht gestartet werden')
      }
    },

    stop() {
      shouldBeListening = false
      if (recognition) {
        try { recognition.abort() } catch { /* ignore */ }
        recognition = null
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
        stream = null
      }
    },
  }
}

// --- Apple SpeechAnalyzer stub (iOS 26+) ---
// Will be implemented when native app wrapper is built.
// Apple SpeechAnalyzer provides:
//   - On-device processing (no network needed)
//   - Multi-language support
//   - Real-time streaming transcription
//   - Integration via WKWebView message handlers

export function createAppleSpeechAnalyzerEngine(): STTEngine {
  // Check if running inside a native iOS app with SpeechAnalyzer bridge
  const isSupported =
    typeof window !== 'undefined' &&
    'webkit' in window &&
    !!(window as unknown as Record<string, unknown>).fintuttoNative

  return {
    provider: 'apple-speech-analyzer',
    isSupported,

    async start(_lang, _onResult, onError) {
      onError('Apple SpeechAnalyzer ist noch nicht verfügbar. Wird mit der nativen iOS-App freigeschaltet.')
    },

    stop() {
      // Will send stop message to WKWebView handler
    },
  }
}

// --- Engine selection ---

export function getBestSTTEngine(): STTEngine {
  // 1. Prefer Apple SpeechAnalyzer when in native iOS wrapper
  const apple = createAppleSpeechAnalyzerEngine()
  if (apple.isSupported) return apple

  // 2. Web Speech API (best for online Chrome/Edge — streaming, real-time)
  const webSpeech = createWebSpeechEngine()
  if (webSpeech.isSupported) return webSpeech

  // 3. Whisper offline (fallback for Firefox, Safari, or offline mode)
  // Lazy-imported to avoid loading Transformers.js unless needed
  return {
    provider: 'whisper',
    isSupported: typeof WebAssembly !== 'undefined',
    async start(lang, onResult, onError) {
      try {
        const { createWhisperSTTEngine } = await import('./offline/stt-engine')
        const engine = createWhisperSTTEngine()
        await engine.start(lang, onResult, onError)
        // Store engine reference for stop()
        ;(this as unknown as Record<string, STTEngine>)._activeEngine = engine
      } catch {
        onError('Offline-Spracherkennung nicht verfügbar. Bitte Whisper-Modell unter Einstellungen herunterladen.')
      }
    },
    stop() {
      const active = (this as unknown as Record<string, STTEngine>)._activeEngine
      if (active) {
        active.stop()
        delete (this as unknown as Record<string, STTEngine>)._activeEngine
      }
    },
  }
}
