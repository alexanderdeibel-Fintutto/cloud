import { useState, useCallback, useEffect, useRef } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Load voices - Chrome loads them asynchronously
  useEffect(() => {
    if (!isSupported) return

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [isSupported])

  const speak = useCallback((text: string, lang: string) => {
    if (!isSupported || !text.trim()) return

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel()

    // Chrome bug: cancel() followed immediately by speak() can silently fail.
    // A short delay ensures the engine is ready.
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.9

      // Try to find a matching voice for better pronunciation
      const voices = voicesRef.current
      if (voices.length > 0) {
        const exactMatch = voices.find(v => v.lang === lang)
        const prefixMatch = voices.find(v => v.lang.startsWith(lang.split('-')[0]))
        if (exactMatch) {
          utterance.voice = exactMatch
        } else if (prefixMatch) {
          utterance.voice = prefixMatch
        }
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }, 50)
  }, [isSupported])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
  }
}
