import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, X, Minimize2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

const APP_CONFIG = {
  appId: 'bescheidboxer',
  appName: 'Steuer-Bescheidprüfer',
  primaryColor: 'from-purple-500 to-indigo-600',
  welcomeMessage: 'Hallo! Ich bin Ihr KI-Assistent fuer Steuerbescheide. Ich kann Ihnen bei der Analyse Ihrer Bescheide helfen, Einspruchsmoeglichkeiten erklaeren und steuerliche Fragen beantworten. Was moechten Sie wissen?',
  quickTopics: [
    { label: 'Bescheid pruefen', prompt: 'Worauf muss ich achten, wenn ich meinen Steuerbescheid pruefe?' },
    { label: 'Einspruch einlegen', prompt: 'Wie lege ich einen Einspruch gegen meinen Steuerbescheid ein und welche Fristen gelten?' },
    { label: 'Haeufige Fehler', prompt: 'Welche haeufigen Fehler gibt es in Einkommensteuerbescheiden?' },
    { label: 'Werbungskosten', prompt: 'Welche Werbungskosten kann ich als Arbeitnehmer absetzen?' },
  ],
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// BescheidBoxer-specific knowledge base for offline responses
const KNOWLEDGE_BASE: Array<{ keywords: string[], response: string }> = [
  {
    keywords: ['pruef', 'check', 'kontroll', 'worauf', 'achten'],
    response: 'Beim Pruefen Ihres Steuerbescheids sollten Sie folgende Punkte beachten:\n\n1. **Persoenliche Daten** - Stimmen Name, Adresse, Steuer-ID?\n2. **Werbungskosten** - Wurden alle geltend gemachten Kosten anerkannt?\n3. **Sonderausgaben** - Spenden, Kirchensteuer, Vorsorgeaufwendungen korrekt?\n4. **Freibetraege** - Grundfreibetrag, Kinderfreibetrag beruecksichtigt?\n5. **Steuerberechnung** - Stimmt der Steuersatz mit Ihrem Einkommen ueberein?\n\nNutzen Sie die [Analyse](analyse) um Ihren Bescheid automatisch pruefen zu lassen.',
  },
  {
    keywords: ['einspruch', 'widerspruch', 'anfecht', 'frist'],
    response: 'So legen Sie einen Einspruch ein:\n\n1. **Frist:** 1 Monat nach Bekanntgabe (§ 355 AO). Bekanntgabe = 3 Tage nach Aufgabe zur Post.\n2. **Form:** Schriftlich oder elektronisch beim zustaendigen Finanzamt\n3. **Inhalt:** Bescheid-Aktenzeichen, konkrete Punkte, die Sie anfechten\n4. **Tipp:** Beantragen Sie gleichzeitig Aussetzung der Vollziehung (§ 361 AO)\n\nDer [Einspruch-Assistent](einspruch) hilft Ihnen bei der Erstellung.\n\n**Wichtig:** Ein Einspruch ist kostenlos, aber es gibt die Moeglichkeit der Verboesserung!',
  },
  {
    keywords: ['fehler', 'haeufig', 'typisch', 'problem'],
    response: 'Die haeufigsten Fehler in Steuerbescheiden:\n\n1. **Werbungskosten** nicht oder nur teilweise anerkannt (z.B. Homeoffice-Pauschale max. 1.260 EUR)\n2. **Doppelte Haushaltsfuehrung** abgelehnt (fehlende Nachweise)\n3. **Entfernungspauschale** falsch berechnet (kuerzester vs. verkehrsguenstigster Weg)\n4. **Handwerkerleistungen** (§ 35a EStG) nicht beruecksichtigt\n5. **Sonderausgaben** - Hoechstbetraege falsch angesetzt\n6. **Verlustverrechnung** nicht durchgefuehrt\n\nLassen Sie Ihren Bescheid ueber die [Analyse](analyse) automatisch pruefen!',
  },
  {
    keywords: ['werbungskosten', 'absetzen', 'arbeitnehmer', 'absetzbar'],
    response: 'Wichtige Werbungskosten fuer Arbeitnehmer (§ 9 EStG):\n\n- **Homeoffice-Pauschale:** 6 EUR/Tag, max. 1.260 EUR/Jahr (210 Tage)\n- **Entfernungspauschale:** 0,30 EUR/km (ab 21. km: 0,38 EUR)\n- **Arbeitsmittel:** Computer, Schreibtisch, Fachliteratur\n- **Fortbildungskosten:** Kurse, Seminare, Studium\n- **Berufskleidung:** Nur typische Berufskleidung\n- **Bewerbungskosten:** Fotos, Mappen, Porto, Fahrtkosten\n- **Umzugskosten:** Bei beruflich bedingtem Umzug\n- **Doppelte Haushaltsfuehrung:** Miete + Familienheimfahrten\n\nNutzen Sie unsere [Steuerrechner](brutto-netto) fuer genaue Berechnungen.',
  },
  {
    keywords: ['steuerklasse', 'klasse', 'heirat', 'verheiratet'],
    response: 'Steuerklassen im Ueberblick:\n\n- **Klasse I:** Ledige, Geschiedene\n- **Klasse II:** Alleinerziehende (Entlastungsbetrag: 4.260 EUR)\n- **Klasse III:** Verheiratet (Besserverdiener bei III/V)\n- **Klasse IV:** Verheiratet (beide aehnliches Einkommen)\n- **Klasse V:** Verheiratet (Partner von III)\n- **Klasse VI:** Zweit-/Nebenjob\n\n**Tipp:** Ehepaare koennen einmal jaehrlich (bis 30.11.) wechseln.\n\nDetails finden Sie im [Steuerklassen-Ratgeber](steuerklassen-info).',
  },
  {
    keywords: ['grundsteuer', 'grundstueck', 'immobilie', 'haus'],
    response: 'Grundsteuer seit der Reform 2025:\n\n1. **Grundsteuerwertbescheid** - Pruefung des angesetzten Grundstueckswerts\n2. **Grundsteuermessbescheid** - Messbetrag x Steuermesszahl\n3. **Grundsteuerbescheid** - Messbetrag x Hebesatz der Kommune\n\n**Wichtig:** Gegen jeden dieser Bescheide kann separat Einspruch eingelegt werden!\n\nNutzen Sie den [Grundsteuer-Rechner](rechner) zur Berechnung.',
  },
  {
    keywords: ['abfindung', 'kuendigung', 'fuenftel'],
    response: 'Besteuerung von Abfindungen:\n\nAbfindungen sind als ausserordentliche Einkuenfte nach der **Fuenftelregelung** (§ 34 EStG) beguenstigt:\n\n1. Ein Fuenftel der Abfindung wird zum zvE addiert\n2. Die darauf entfallende Steuer wird berechnet\n3. Differenz x 5 = Steuer auf die Abfindung\n\nDas fuehrt oft zu einer niedrigeren Gesamtsteuer als die normale Besteuerung.\n\nNutzen Sie den [Abfindungsrechner](abfindungsrechner) fuer eine genaue Berechnung.',
  },
  {
    keywords: ['kapital', 'aktie', 'dividende', 'zinsen', 'sparer'],
    response: 'Kapitalertraege und Abgeltungsteuer:\n\n- **Abgeltungsteuer:** 25% + Soli + ggf. KiSt\n- **Sparerpauschbetrag:** 1.000 EUR (Ledige) / 2.000 EUR (Verheiratete)\n- **Guenstigerpruefung** (§ 32d Abs. 6 EStG): Wenn Ihr persoenlicher Steuersatz unter 25% liegt, koennen Sie die Kapitalertraege in der Steuererklaerung angeben\n- **Freistellungsauftrag** bei der Bank einrichten!\n\nDetails im [Kapitalertraege-Rechner](kapitalertraege).',
  },
]

function findResponse(userInput: string): string {
  const lower = userInput.toLowerCase()

  for (const entry of KNOWLEDGE_BASE) {
    const matchCount = entry.keywords.filter(kw => lower.includes(kw)).length
    if (matchCount > 0) return entry.response
  }

  // Default response with helpful guidance
  return `Vielen Dank fuer Ihre Frage. Hier sind einige hilfreiche Funktionen:\n\n- **[Bescheid analysieren](analyse)** - Lassen Sie Ihren Bescheid automatisch pruefen\n- **[Einspruch-Assistent](einspruch)** - Erstellen Sie einen Einspruch\n- **[Steuerrechner](brutto-netto)** - Diverse Berechnungen\n- **[Fristen](fristen)** - Ueberblick ueber wichtige Termine\n\nKoennen Sie Ihre Frage etwas genauer beschreiben? Ich helfe Ihnen gerne bei:\n- Analyse von Steuerbescheiden\n- Einspruchsverfahren und Fristen\n- Steuerliche Berechnungen\n- Erklaerung von Steuerbegriffen`
}

interface BescheidBoxerChatProps {
  isOpen: boolean
  onClose: () => void
}

export default function BescheidBoxerChat({ isOpen, onClose }: BescheidBoxerChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: APP_CONFIG.welcomeMessage },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Try the AI backend first
      const response = await fetch('/api/aiCoreService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: APP_CONFIG.appId,
          userTier: 'free',
          prompt: text.trim(),
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const result = await response.json()

      if (result.success && result.content) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.content,
        }])
        return
      }
    } catch {
      // Backend not available - use local knowledge base
    }

    // Fallback: local knowledge-based response
    await new Promise(resolve => setTimeout(resolve, 600))
    const aiResponse = findResponse(text.trim())

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
    }])

    setLoading(false)
  }

  // Parse markdown links [text](page) -> <Link>
  const parseContent = (content: string) => {
    const parts: React.ReactNode[] = []
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let lastIndex = 0
    let match

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        // Process bold text in non-link parts
        const textBefore = content.slice(lastIndex, match.index)
        parts.push(...parseBold(textBefore, `pre-${match.index}`))
      }
      parts.push(
        <Link
          key={`link-${match.index}`}
          to={`/${match[2]}`}
          className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
          onClick={onClose}
        >
          {match[1]}
        </Link>
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      parts.push(...parseBold(content.slice(lastIndex), `end-${lastIndex}`))
    }

    return parts.length > 0 ? parts : content
  }

  const parseBold = (text: string, keyPrefix: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    const boldRegex = /\*\*([^*]+)\*\*/g
    let lastIdx = 0
    let m

    while ((m = boldRegex.exec(text)) !== null) {
      if (m.index > lastIdx) {
        parts.push(text.slice(lastIdx, m.index))
      }
      parts.push(<strong key={`${keyPrefix}-b-${m.index}`}>{m[1]}</strong>)
      lastIdx = m.index + m[0].length
    }

    if (lastIdx < text.length) {
      parts.push(text.slice(lastIdx))
    }

    return parts
  }

  if (!isOpen) return null

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className={`w-14 h-14 rounded-full bg-gradient-to-br ${APP_CONFIG.primaryColor} shadow-lg hover:shadow-xl`}
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-50 bg-background rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[70vh]">
      {/* Header */}
      <div className={`bg-gradient-to-r ${APP_CONFIG.primaryColor} text-white p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{APP_CONFIG.appName} Assistent</h3>
            <p className="text-xs text-white/80">Steuerrecht & Bescheid-Analyse</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="text-white hover:bg-white/20 h-8 w-8">
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' ? 'bg-muted' : `bg-gradient-to-br ${APP_CONFIG.primaryColor}`
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-muted rounded-tl-sm'
            }`}>
              <div className="text-sm whitespace-pre-wrap">
                {parseContent(message.content)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${APP_CONFIG.primaryColor} flex items-center justify-center`}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Topics */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Haeufige Fragen:</p>
          <div className="flex flex-wrap gap-2">
            {APP_CONFIG.quickTopics.map((topic) => (
              <button
                key={topic.label}
                onClick={() => sendMessage(topic.prompt)}
                disabled={loading}
                className="bg-muted px-3 py-1.5 rounded-full text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input) }} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ihre Frage zum Steuerbescheid..."
            disabled={loading}
            className="flex-1 rounded-md border px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" disabled={!input.trim() || loading} size="icon" className={`bg-gradient-to-br ${APP_CONFIG.primaryColor}`}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

// Floating chat button
export function AIChatButton({ onClick, isOpen }: { onClick: () => void; isOpen?: boolean }) {
  if (isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        className="group flex items-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-5 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="text-left pr-2">
          <div className="font-semibold text-sm">KI-Assistent</div>
          <div className="text-xs text-white/80">Fragen? Ich helfe!</div>
        </div>
      </Button>
    </div>
  )
}
