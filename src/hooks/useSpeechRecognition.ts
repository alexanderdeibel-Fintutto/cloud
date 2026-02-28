import { useState, useRef, useCallback } from 'react'
import { getBestSTTEngine, type STTEngine, type STTResult } from '@/lib/translator/stt'

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const engineRef = useRef<STTEngine | null>(null)

  const getEngine = useCallback(() => {
    if (!engineRef.current) engineRef.current = getBestSTTEngine()
    return engineRef.current
  }, [])

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const stopListening = useCallback(() => {
    getEngine().stop()
    setIsListening(false)
  }, [getEngine])

  const startListening = useCallback(async (lang: string, onResult: (text: string) => void) => {
    const engine = getEngine()
    if (!engine.isSupported) {
      setError('Spracheingabe wird von diesem Browser nicht unterstuetzt')
      return
    }
    setError(null)
    setTranscript('')
    await engine.start(
      lang,
      (result: STTResult) => {
        setTranscript(result.text)
        if (result.isFinal) onResult(result.text)
      },
      (errorMsg: string) => {
        setError(errorMsg)
        setIsListening(false)
      },
    )
    setIsListening(true)
  }, [getEngine])

  return { isListening, transcript, isSupported, error, startListening, stopListening }
}
