import { useState, useRef, useCallback } from 'react'
import { getBestSTTEngine, type STTEngine, type STTResult } from '@/lib/stt'

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const engineRef = useRef<STTEngine | null>(null)

  // Lazily create engine on first use
  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = getBestSTTEngine()
    }
    return engineRef.current
  }, [])

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window ||
     // Also check for native bridge
     !!(window as unknown as Record<string, unknown>).fintuttoNative)

  const stopListening = useCallback(() => {
    getEngine().stop()
    setIsListening(false)
  }, [getEngine])

  const startListening = useCallback(async (lang: string, onResult: (text: string) => void) => {
    const engine = getEngine()

    if (!engine.isSupported) {
      setError('Spracheingabe wird von diesem Browser nicht unterstützt')
      return
    }

    setError(null)
    setTranscript('')

    await engine.start(
      lang,
      (result: STTResult) => {
        setTranscript(result.text)
        if (result.isFinal) {
          onResult(result.text)
        }
      },
      (errorMsg: string) => {
        setError(errorMsg)
        setIsListening(false)
      },
    )

    setIsListening(true)
  }, [getEngine])

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    provider: getEngine().provider,
  }
}
