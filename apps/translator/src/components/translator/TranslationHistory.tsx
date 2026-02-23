import { Clock, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { HistoryEntry } from '@/hooks/useTranslationHistory'
import { getLanguageByCode } from '@/lib/languages'

interface TranslationHistoryProps {
  history: HistoryEntry[]
  clearHistory: () => void
  removeEntry: (id: string) => void
  onSelect: (sourceText: string, sourceLang: string, targetLang: string) => void
}

export default function TranslationHistory({ history, clearHistory, removeEntry, onSelect }: TranslationHistoryProps) {

  if (history.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Letzte Übersetzungen
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-muted-foreground">
            <Trash2 className="h-3 w-3 mr-1" />
            Verlauf löschen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {history.slice(0, 10).map(entry => {
            const srcLang = getLanguageByCode(entry.sourceLang)
            const tgtLang = getLanguageByCode(entry.targetLang)
            return (
              <div
                key={entry.id}
                className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                onClick={() => onSelect(entry.sourceText, entry.sourceLang, entry.targetLang)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <span>{srcLang?.flag}</span>
                    <span>{srcLang?.name}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{tgtLang?.flag}</span>
                    <span>{tgtLang?.name}</span>
                  </div>
                  <p className="text-sm truncate">{entry.sourceText}</p>
                  <p className="text-sm text-muted-foreground truncate">{entry.translatedText}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={e => {
                    e.stopPropagation()
                    removeEntry(entry.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
