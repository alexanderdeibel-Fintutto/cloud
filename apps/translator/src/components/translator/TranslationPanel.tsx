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
import { useTranslationHistory } from '@/hooks/useTranslationHistory'

interface TranslationPanelProps {
  initialText?: string
  onInitialTextConsumed?: () => void
}

export default function TranslationPanel({ initialText, onInitialTextConsumed }: TranslationPanelProps) {
  const [sourceLang, setSourceLang] = useState('de')
  const [targetLang, setTargetLang] = useState('en')
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { isListening, isSupported: micSupported, startListening, stopListening } = useSpeechRecognition()
  const sourceSpeech = useSpeechSynthesis()
  const targetSpeech = useSpeechSynthesis()
  const { addEntry } = useTranslationHistory()

  // Handle initial text from quick phrases
  useEffect(() => {
    if (initialText) {
      setSourceText(initialText)
      onInitialTextConsumed?.()
    }
  }, [initialText, onInitialTextConsumed])

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

  const handleMicToggle = () => {
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
                {micSupported && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMicToggle}
                    className={isListening ? 'text-destructive pulse-mic' : ''}
                    title={isListening ? 'Aufnahme stoppen' : 'Spracheingabe'}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
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
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
