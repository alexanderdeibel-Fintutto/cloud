import { useState, useRef, useCallback } from 'react'

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

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const shouldBeListeningRef = useRef(false)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const startListening = useCallback((lang: string, onResult: (text: string) => void) => {
    if (!isSupported) {
      setError('Spracheingabe wird von diesem Browser nicht unterstützt')
      return
    }

    // Stop any existing instance first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }

    setError(null)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)

      if (finalTranscript) {
        onResult(finalTranscript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        setError('Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.')
      } else if (event.error === 'no-speech') {
        // No speech detected - don't treat as fatal, recognition will auto-restart via onend
        return
      } else if (event.error !== 'aborted') {
        setError(`Spracheingabe-Fehler: ${event.error}`)
      }
      shouldBeListeningRef.current = false
      setIsListening(false)
    }

    recognition.onend = () => {
      // Auto-restart if we should still be listening (Chrome stops continuous mode sometimes)
      if (shouldBeListeningRef.current && recognitionRef.current) {
        try {
          recognition.start()
          return
        } catch {
          // Fall through to stop
        }
      }
      shouldBeListeningRef.current = false
      setIsListening(false)
    }

    recognitionRef.current = recognition
    shouldBeListeningRef.current = true

    try {
      recognition.start()
      setIsListening(true)
      setTranscript('')
    } catch (e) {
      shouldBeListeningRef.current = false
      setError('Spracheingabe konnte nicht gestartet werden')
      setIsListening(false)
      recognitionRef.current = null
    }
  }, [isSupported])

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
  }
}
