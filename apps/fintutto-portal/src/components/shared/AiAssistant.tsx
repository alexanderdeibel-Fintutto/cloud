import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  'Wie berechne ich die maximale Kaution?',
  'Was ist die Mietpreisbremse?',
  'Welche Nebenkosten darf der Vermieter umlegen?',
  'Wann darf der Vermieter die Miete erhöhen?',
]

// Simulated AI responses for common questions
const AI_RESPONSES: Record<string, string> = {
  'kaution': 'Die maximale Kaution beträgt 3 Nettokaltmieten (§ 551 BGB). Der Mieter hat das Recht, die Kaution in 3 gleichen monatlichen Raten zu zahlen. Die erste Rate ist zu Beginn des Mietverhältnisses fällig. Nutze unseren Kautions-Rechner unter /rechner/kaution für eine genaue Berechnung.',
  'mietpreisbremse': 'Die Mietpreisbremse (§ 556d BGB) begrenzt die Miete bei Neuvermietung auf maximal 10% über der ortsüblichen Vergleichsmiete in Gebieten mit angespanntem Wohnungsmarkt. Ausnahmen gelten für Neubauten und umfassend modernisierte Wohnungen. Nutze unseren Mietpreisbremse-Checker unter /checker/mietpreisbremse.',
  'nebenkosten': 'Umlagefähige Nebenkosten sind in § 2 BetrKV abschließend geregelt. Dazu gehören u.a.: Grundsteuer, Wasser/Abwasser, Heizkosten, Müllabfuhr, Gebäudereinigung, Gartenpflege, Versicherungen, Hausmeister, Aufzug und Kabelanschluss. Der Vermieter darf nur tatsächlich angefallene Kosten umlegen.',
  'mieterhöhung': 'Der Vermieter kann die Miete erhöhen: 1) Auf die ortsübliche Vergleichsmiete (§ 558 BGB) - max. 20% in 3 Jahren (Kappungsgrenze). 2) Nach Modernisierung (§ 559 BGB) - max. 8% der Modernisierungskosten pro Jahr. 3) Staffel- oder Indexmiete (bereits im Vertrag vereinbart). Nutze unseren Mieterhöhungs-Checker unter /checker/mieterhoehung.',
}

function getAiResponse(question: string): string {
  const lower = question.toLowerCase()
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (lower.includes(key)) return response
  }
  return 'Danke für deine Frage! Als KI-Assistent kann ich dir bei Fragen zu Mietrecht, Nebenkosten, Kaution und vielen weiteren Themen helfen. Für eine detaillierte Analyse nutze bitte unsere spezialisierten Checker und Rechner im Portal. Bitte beachte: Meine Antworten ersetzen keine Rechtsberatung.'
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hallo! Ich bin der Fintutto KI-Assistent. Wie kann ich dir bei Mietrecht-Fragen helfen?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

    const response = getAiResponse(text)
    const assistantMsg: Message = {
      id: `msg-${Date.now()}-ai`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])
    setIsTyping(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-portal text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="gradient-portal px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white" />
              <div>
                <h3 className="text-white font-semibold text-sm">KI-Assistent</h3>
                <p className="text-white/70 text-xs">Fintutto Mietrecht-Hilfe</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  msg.role === 'assistant' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {msg.role === 'assistant' ? <Bot className="h-4 w-4 text-primary" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-xl px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Vorschläge:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Frage stellen..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isTyping}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
