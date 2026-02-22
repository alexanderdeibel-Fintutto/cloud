import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowRightLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Trash2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageSelector from './LanguageSelector'
import { translateText } from '@/lib/translate'
import { getLanguageByCode } from '@/lib/languages'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import type { HistoryEntry } from '@/hooks/useTranslationHistory'

interface TranslationPanelProps {
  initialText?: string
  initialSourceLang?: string
  initialTargetLang?: string
  onInitialTextConsumed?: () => void
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void
}

export default function TranslationPanel({ initialText, initialSourceLang, initialTargetLang, onInitialTextConsumed, addEntry }: TranslationPanelProps) {
  const [sourceLang, setSourceLang] = useState('de')
  const [targetLang, setTargetLang] = useState('en')
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [provider, setProvider] = useState<string | undefined>(undefined)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(() => {
    const saved = localStorage.getItem('translator-auto-speak')
    return saved !== null ? saved === 'true' : true
  })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSpeakRef = useRef(autoSpeak)
  const targetLangRef = useRef(targetLang)

  // Keep refs in sync
  autoSpeakRef.current = autoSpeak
  targetLangRef.current = targetLang

  const { isListening, isSupported: micSupported, error: micError, startListening, stopListening } = useSpeechRecognition()
  const sourceSpeech = useSpeechSynthesis()
  const targetSpeech = useSpeechSynthesis()
  const targetSpeakRef = useRef(targetSpeech.speak)
  targetSpeakRef.current = targetSpeech.speak

  // Show which TTS engine was last used
  const activeTtsEngine = sourceSpeech.ttsEngine || targetSpeech.ttsEngine

  // Handle initial text from quick phrases or history
  useEffect(() => {
    if (initialText) {
      setSourceText(initialText)
      if (initialSourceLang) setSourceLang(initialSourceLang)
      if (initialTargetLang) setTargetLang(initialTargetLang)
      onInitialTextConsumed?.()
    }
  }, [initialText, initialSourceLang, initialTargetLang, onInitialTextConsumed])

  const doTranslate = useCallback(async (text: string) => {
    if (!text.trim()) {
      setTranslatedText('')
      setError(null)
      return
    }

    setIsTranslating(true)
    setError(null)

    try {
      const result = await translateText(text, sourceLang, targetLang)
      setTranslatedText(result.translatedText)
      setMatchScore(result.match)
      setProvider(result.provider)

      // Auto-speak via refs to avoid re-render dependency loop
      if (autoSpeakRef.current && result.translatedText) {
        const lang = getLanguageByCode(targetLangRef.current)
        targetSpeakRef.current(result.translatedText, lang?.speechCode || targetLangRef.current)
      }

      addEntry({
        sourceText: text,
        translatedText: result.translatedText,
        sourceLang,
        targetLang,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Übersetzung fehlgeschlagen')
    } finally {
      setIsTranslating(false)
    }
  }, [sourceLang, targetLang, addEntry])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!sourceText.trim()) {
      setTranslatedText('')
      setError(null)
      return
    }

    debounceRef.current = setTimeout(() => {
      doTranslate(sourceText)
    }, 600)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [sourceText, doTranslate])

  const swapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  const [micWarning, setMicWarning] = useState<string | null>(null)

  const handleMicToggle = () => {
    if (!micSupported) {
      setMicWarning('Spracheingabe wird nur in Chrome und Edge unterstützt. Bitte wechseln Sie den Browser.')
      setTimeout(() => setMicWarning(null), 5000)
      return
    }
    setMicWarning(null)
    if (isListening) {
      stopListening()
    } else {
      const lang = getLanguageByCode(sourceLang)
      startListening(lang?.speechCode || sourceLang, (text) => {
        setSourceText(prev => prev ? prev + ' ' + text : text)
      })
    }
  }

  const handleCopy = async () => {
    if (!translatedText) return
    await navigator.clipboard.writeText(translatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSpeakSource = () => {
    if (sourceSpeech.isSpeaking) {
      sourceSpeech.stop()
    } else {
      const lang = getLanguageByCode(sourceLang)
      sourceSpeech.speak(sourceText, lang?.speechCode || sourceLang)
    }
  }

  const handleSpeakTarget = () => {
    if (targetSpeech.isSpeaking) {
      targetSpeech.stop()
    } else {
      const lang = getLanguageByCode(targetLang)
      targetSpeech.speak(translatedText, lang?.speechCode || targetLang)
    }
  }

  const toggleAutoSpeak = () => {
    setAutoSpeak(prev => {
      const next = !prev
      localStorage.setItem('translator-auto-speak', String(next))
      return next
    })
  }

  const clearAll = () => {
    setSourceText('')
    setTranslatedText('')
    setError(null)
  }

  const sourceLangData = getLanguageByCode(sourceLang)
  const targetLangData = getLanguageByCode(targetLang)

  return (
    <div className="space-y-4">
      {/* Language Selection Bar */}
      <div className="flex items-end gap-3 flex-wrap">
        <LanguageSelector value={sourceLang} onChange={setSourceLang} label="Von" />
        <Button
          variant="outline"
          size="icon"
          onClick={swapLanguages}
          className="mb-0.5 shrink-0"
          title="Sprachen tauschen"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <LanguageSelector value={targetLang} onChange={setTargetLang} label="Nach" />
        <Button
          variant={autoSpeak ? 'default' : 'outline'}
          size="sm"
          onClick={toggleAutoSpeak}
          className="mb-0.5 shrink-0 gap-1.5"
          title={autoSpeak ? 'Auto-Vorlesen aktiv' : 'Auto-Vorlesen aus'}
        >
          {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span className="text-xs">Auto</span>
        </Button>
      </div>

      {/* Translation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source */}
        <Card className="relative">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {sourceLangData?.flag} {sourceLangData?.name}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMicToggle}
                  className={isListening ? 'text-destructive pulse-mic' : !micSupported ? 'opacity-50' : ''}
                  title={!micSupported ? 'Spracheingabe (nur in Chrome/Edge verfügbar)' : isListening ? 'Aufnahme stoppen' : 'Spracheingabe'}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                {sourceSpeech.isSupported && sourceText && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSpeakSource}
                    title={sourceSpeech.isSpeaking ? 'Stoppen' : 'Vorlesen'}
                  >
                    {sourceSpeech.isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                )}
                {activeTtsEngine && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${activeTtsEngine === 'cloud' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {activeTtsEngine === 'cloud' ? '☁ Cloud' : '🖥 Browser'}
                  </span>
                )}
                {sourceText && (
                  <Button variant="ghost" size="icon" onClick={clearAll} title="Löschen">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <textarea
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
              placeholder="Text eingeben oder einsprechen..."
              className="w-full min-h-[200px] bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/60 text-base leading-relaxed"
              dir={sourceLang === 'ar' ? 'rtl' : 'ltr'}
            />
            <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
              <span className="text-xs text-muted-foreground">
                {sourceText.length} Zeichen
              </span>
              {isListening && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  Aufnahme läuft...
                </span>
              )}
              {(micError || micWarning) && (
                <span className="text-xs text-destructive">{micError || micWarning}</span>
              )}
            </div>
          </div>
        </Card>

        {/* Target */}
        <Card className="relative">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {targetLangData?.flag} {targetLangData?.name}
              </span>
              <div className="flex items-center gap-1">
                {targetSpeech.isSupported && translatedText && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSpeakTarget}
                    title={targetSpeech.isSpeaking ? 'Stoppen' : 'Vorlesen'}
                  >
                    {targetSpeech.isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                )}
                {translatedText && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    title="Kopieren"
                  >
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
            <div
              className="w-full min-h-[200px] text-base leading-relaxed"
              dir={targetLang === 'ar' ? 'rtl' : 'ltr'}
            >
              {isTranslating ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Wird übersetzt...</span>
                </div>
              ) : error ? (
                <div className="text-destructive text-sm">{error}</div>
              ) : translatedText ? (
                <p className="text-foreground">{translatedText}</p>
              ) : (
                <p className="text-muted-foreground/60">Übersetzung erscheint hier...</p>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
              <span className="text-xs text-muted-foreground">
                {translatedText.length} Zeichen
              </span>
              <div className="flex items-center gap-2">
                {provider && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {provider === 'libre' ? 'LibreTranslate' : 'MyMemory'}
                  </span>
                )}
                {matchScore !== null && matchScore > 0 && translatedText && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    matchScore >= 0.8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    matchScore >= 0.5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {Math.round(matchScore * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
