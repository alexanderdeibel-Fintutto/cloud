import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { isCloudTTSAvailable, speakWithCloudTTS } from '@/lib/tts'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsEngine, setTtsEngine] = useState<'cloud' | 'browser' | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const queueRef = useRef<Array<{ text: string; lang: string }>>([])
  const isProcessingRef = useRef(false)
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

  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) return
    isProcessingRef.current = true

    const { text, lang } = queueRef.current.shift()!
    speakImmediate(text, lang)

    function speakImmediate(text: string, lang: string) {
      if (useCloudTTS) {
        setIsSpeaking(true)
        setTtsEngine('cloud')
        speakWithCloudTTS(text, lang)
          .then(audio => {
            audioRef.current = audio
            audio.addEventListener('ended', onFinished)
            audio.addEventListener('error', () => {
              audioRef.current = null
              // Fallback to browser TTS on error
              speakBrowserQueued(text, lang, true)
            })
            audio.play()
          })
          .catch((err) => {
            console.error('[TTS] Cloud TTS failed:', err)
            speakBrowserQueued(text, lang, true)
          })
      } else {
        speakBrowserQueued(text, lang)
      }
    }

    function speakBrowserQueued(text: string, lang: string, isFallback = false) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onFinished()
        return
      }

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
        utterance.onend = onFinished
        utterance.onerror = onFinished

        window.speechSynthesis.speak(utterance)
      }, 50)
    }

    function onFinished() {
      audioRef.current = null
      isProcessingRef.current = false
      if (queueRef.current.length > 0) {
        processQueue()
      } else {
        setIsSpeaking(false)
      }
    }
  }, [useCloudTTS])

  const speak = useCallback((text: string, lang: string) => {
    if (!text.trim()) return

    // Add to queue
    queueRef.current.push({ text, lang })

    // Process if not already processing
    if (!isProcessingRef.current) {
      processQueue()
    }
  }, [processQueue])

  const stop = useCallback(() => {
    // Clear queue
    queueRef.current = []
    isProcessingRef.current = false

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
