import { useMemo, useRef, useEffect } from 'react'
import { Brain, Sparkles } from 'lucide-react'
import ChatMessage, { type Message } from './ChatMessage'
import ChatInput from './ChatInput'
import type { Document } from '@/components/documents/DocumentCard'

const FALLBACK_SUGGESTIONS = [
  'Welche Dokumente habe ich?',
  'Fasse meine neuesten Dokumente zusammen',
  'Was sind die wichtigsten Inhalte?',
  'Erstelle eine Übersicht meiner Unterlagen',
]

interface ChatInterfaceProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (content: string) => void
  documents?: Document[]
}

function generateSuggestions(docs: Document[]): string[] {
  if (docs.length === 0) return FALLBACK_SUGGESTIONS

  const suggestions: string[] = []

  // Suggest based on document titles
  const recent = docs.slice(0, 3)
  if (recent.length > 0) {
    suggestions.push(`Was steht in "${recent[0].title}"?`)
  }

  // Suggest based on tags
  const allTags = docs.flatMap((d) => d.tags)
  const tagCounts: Record<string, number> = {}
  for (const tag of allTags) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1
  }
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 2)
  for (const [tag] of topTags) {
    suggestions.push(`Welche Dokumente habe ich zum Thema ${tag}?`)
  }

  // Suggest summaries
  if (docs.length >= 3) {
    suggestions.push('Fasse meine letzten 3 Dokumente zusammen')
  }

  // Suggest based on document types
  const hasPdf = docs.some((d) => d.file_type === 'pdf')
  const hasImage = docs.some((d) => d.file_type === 'image')
  if (hasPdf) suggestions.push('Was steht in meinen PDFs?')
  if (hasImage) suggestions.push('Welche Texte wurden aus meinen Bildern erkannt?')

  // If recent doc has summary, suggest deeper question
  if (recent.length > 1 && recent[1].summary) {
    suggestions.push(`Vergleiche "${recent[0].title}" mit "${recent[1].title}"`)
  }

  return suggestions.slice(0, 4)
}

export default function ChatInterface({ messages, isLoading, onSendMessage, documents = [] }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const suggestions = useMemo(() => generateSuggestions(documents), [documents])

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-3xl gradient-brain flex items-center justify-center mb-6 animate-pulse-brain">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Frag dein <span className="gradient-brain-text">SecondBrain</span>
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Durchsuche deine Dokumente mit natürlicher Sprache. Stelle Fragen, lasse zusammenfassen, oder finde Zusammenhänge.
            </p>

            {/* Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSendMessage(suggestion)}
                  className="text-left p-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all text-sm text-muted-foreground hover:text-foreground group"
                >
                  <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg gradient-brain flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="chat-bubble-ai">
                  <div className="typing-indicator flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-card/50">
        <ChatInput onSend={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}
