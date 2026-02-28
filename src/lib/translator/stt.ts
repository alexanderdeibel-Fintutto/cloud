// Speech-to-Text abstraction layer (Web Speech API for Chrome/Edge)

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

export interface STTResult {
  text: string
  isFinal: boolean
  confidence?: number
}

export interface STTEngine {
  readonly provider: string
  readonly isSupported: boolean
  start(lang: string, onResult: (result: STTResult) => void, onError: (error: string) => void): Promise<void>
  stop(): void
}

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
      if (recognition) {
        try { recognition.abort() } catch { /* ignore */ }
        recognition = null
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
        stream = null
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (e) {
        if (e instanceof DOMException && e.name === 'NotAllowedError') {
          onError('Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.')
        } else {
          onError('Mikrofon nicht verfuegbar.')
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
          onResult({ text: result[0].transcript, isFinal: result.isFinal, confidence: result[0].confidence })
        }
      }

      recognition.onerror = (event) => {
        const err = event as SpeechRecognitionErrorEvent
        if (err.error === 'no-speech' || err.error === 'aborted') return
        shouldBeListening = false
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
        if (err.error === 'not-allowed') {
          onError('Mikrofon-Zugriff verweigert.')
        } else if (err.error === 'network') {
          onError('Netzwerkfehler bei der Spracherkennung.')
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

export function getBestSTTEngine(): STTEngine {
  return createWebSpeechEngine()
}
