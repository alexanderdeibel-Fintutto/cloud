import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { isCloudTTSAvailable, speakWithCloudTTS } from '@/lib/tts'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsEngine, setTtsEngine] = useState<'cloud' | 'browser' | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const useCloudTTS = isCloudTTSAvailable()

  const isSupported = useCloudTTS || (typeof window !== 'undefined' && 'speechSynthesis' in window)

  // Load browser voices as fallback
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  const speakBrowser = useCallback((text: string, lang: string, isFallback = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()
    setTtsEngine('browser')

    if (isFallback) {
      toast.warning('Google Cloud TTS nicht verfügbar – Browser-Stimme wird verwendet', {
        duration: 4000,
      })
    }

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.9

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
  }, [])

  const speak = useCallback((text: string, lang: string) => {
    if (!text.trim()) return

    // Stop any ongoing playback
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    if (useCloudTTS) {
      setIsSpeaking(true)
      setTtsEngine('cloud')
      speakWithCloudTTS(text, lang)
        .then(audio => {
          audioRef.current = audio
          audio.addEventListener('ended', () => {
            setIsSpeaking(false)
            audioRef.current = null
          })
          audio.addEventListener('error', () => {
            setIsSpeaking(false)
            audioRef.current = null
            // Fallback to browser TTS on error
            speakBrowser(text, lang, true)
          })
          audio.play()
        })
        .catch((err) => {
          console.error('[TTS] Cloud TTS failed:', err)
          // Fallback to browser TTS
          setIsSpeaking(false)
          speakBrowser(text, lang, true)
        })
    } else {
      speakBrowser(text, lang)
    }
  }, [useCloudTTS, speakBrowser])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  return {
    isSpeaking,
    isSupported,
    ttsEngine,
    speak,
    stop,
  }
}
