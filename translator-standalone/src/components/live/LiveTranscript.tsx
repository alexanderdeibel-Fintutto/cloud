import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import type { TranslationChunk } from '@/lib/session'
import { getLanguageByCode } from '@/lib/languages'

interface LiveTranscriptProps {
  chunks: TranslationChunk[]
  currentText?: string
  isListener?: boolean
}

export default function LiveTranscript({ chunks, currentText, isListener }: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chunks, currentText])

  return (
    <Card className="flex-1">
      <div ref={scrollRef} className="p-4 max-h-[400px] overflow-y-auto space-y-3">
        {chunks.length === 0 && !currentText && (
          <p className="text-muted-foreground text-center py-8">
            {isListener
              ? 'Warte auf Übersetzungen vom Speaker...'
              : 'Starte die Aufnahme, um zu übersetzen...'}
          </p>
        )}

        {chunks.map((chunk) => {
          const langData = getLanguageByCode(chunk.targetLanguage)
          return (
            <div key={chunk.id} className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {langData?.flag} {new Date(chunk.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              {!isListener && (
                <p className="text-sm text-muted-foreground">{chunk.sourceText}</p>
              )}
              <p className="text-base font-medium">{chunk.translatedText}</p>
            </div>
          )
        })}

        {currentText && (
          <div className="space-y-1 opacity-60">
            <p className="text-sm italic">{currentText}...</p>
          </div>
        )}
      </div>
    </Card>
  )
}
