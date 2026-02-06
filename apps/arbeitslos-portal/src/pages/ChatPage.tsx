import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Send,
  Shield,
  Lightbulb,
  FileText,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCreditsContext } from '@/contexts/CreditsContext'
import { LETTER_TEMPLATES } from '@/lib/sgb-knowledge'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestedTemplates?: string[]
  relatedCategories?: string[]
}

const QUICK_QUESTIONS = [
  'Mein Bescheid ist falsch berechnet. Was kann ich tun?',
  'Ich wurde sanktioniert, obwohl ich krank war.',
  'Das Amt zahlt nicht meine volle Miete.',
  'Kann ich alte Bescheide nochmal pruefen lassen?',
  'Ich brauche Geld fuer eine Waschmaschine.',
  'Mein Sachbearbeiter behandelt mich schlecht.',
]

function generateDemoResponse(question: string): ChatMessage {
  const lowerQuestion = question.toLowerCase()
  let content = ''
  let suggestedTemplates: string[] = []
  let relatedCategories: string[] = []

  if (lowerQuestion.includes('bescheid') && (lowerQuestion.includes('falsch') || lowerQuestion.includes('berechnung'))) {
    content = `**Dein Bescheid ist falsch berechnet? Das kommt leider sehr haeufig vor.**

Hier sind deine Optionen:

1. **Widerspruch einlegen** (innerhalb 1 Monat nach Zugang)
   - Du kannst erstmal ohne Begruendung Widerspruch einlegen, um die Frist zu wahren.
   - Die Begruendung kannst du nachreichen.
   - Rechtsgrundlage: § 39 SGB II, § 84 SGG

2. **Ueberpruefungsantrag** (§ 44 SGB X)
   - Wenn die Frist schon abgelaufen ist: Du kannst Bescheide der letzten **4 Jahre** pruefen lassen!
   - Das Amt muss dann korrigieren und **nachzahlen**.

3. **Was du pruefen solltest:**
   - Ist der Regelsatz korrekt? (2024: 563 EUR Alleinstehende)
   - Wurde ein Mehrbedarf beruecksichtigt? (Alleinerziehend, schwanger, krank)
   - Stimmt die Einkommensanrechnung?
   - Wird die volle Miete (KdU) uebernommen?

**Tipp:** Beantrage unbedingt Akteneinsicht (§ 25 SGB X), um alle Details zu pruefen!`
    suggestedTemplates = ['widerspruch_bescheid', 'ueberpruefungsantrag', 'akteneinsicht']
    relatedCategories = ['sgb2', 'sgb10']
  } else if (lowerQuestion.includes('sanktion') || lowerQuestion.includes('krank')) {
    content = `**Sanktion trotz Krankheit? Das ist in der Regel rechtswidrig!**

Nach § 31 SGB II darf **nicht sanktioniert** werden, wenn du einen **wichtigen Grund** hattest. Krankheit ist ein anerkannter wichtiger Grund.

**Was du tun solltest:**

1. **Sofort Widerspruch einlegen** (1 Monat Frist!)
2. **Aerztliches Attest** besorgen (am besten rueckwirkend fuer den Tag)
3. Falls kein Attest: Eigene Erklaerung abgeben

**Wichtig seit dem Buergergeld (2023):**
- Sanktionen duerfen **maximal 30%** des Regelsatzes betragen
- Die 60% und 100%-Sanktionen gibt es NICHT mehr
- Kosten der Unterkunft (Miete) duerfen NICHT gekuerzt werden

**Dein naechster Schritt:** Widerspruch mit aerztlicher Bescheinigung einlegen.`
    suggestedTemplates = ['widerspruch_sanktion']
    relatedCategories = ['sgb2']
  } else if (lowerQuestion.includes('miete') || lowerQuestion.includes('kdu') || lowerQuestion.includes('unterkunft')) {
    content = `**Das Amt zahlt nicht die volle Miete? Ein sehr haeufiges Problem.**

Die Uebernahme der "Kosten der Unterkunft" (KdU) nach § 22 SGB II ist einer der haeufigsten Streitpunkte.

**Deine Rechte:**

1. **6-Monats-Schutz:** Das Amt muss die tatsaechlichen Kosten fuer mindestens 6 Monate uebernehmen, bevor es kuerzen darf.

2. **Schluessiges Konzept:** Das Amt braucht ein "schluessiges Konzept" zur Bestimmung der Angemessenheitsgrenze. Viele Jobcenter haben das NICHT - dann gelten die tatsaechlichen Kosten!

3. **Wohnungsmarkt:** Wenn es keine guenstigere Wohnung gibt, muss das Amt die hoehere Miete akzeptieren.

4. **Kostensenkungsaufforderung:** Bevor gekuerzt wird, muss das Amt dich auffordern, die Kosten zu senken, und dir Zeit geben.

**Tipp:** Nutze unseren Mieter-Checker, um die Angemessenheit deiner Miete pruefen zu lassen!

**Naechste Schritte:**
- Widerspruch gegen den Bescheid einlegen
- Mietspiegel deiner Stadt pruefen
- Ggf. nachweisen, dass keine guenstigere Wohnung verfuegbar ist`
    suggestedTemplates = ['widerspruch_kdu', 'antrag_umzug']
    relatedCategories = ['kdu', 'sgb2']
  } else if (lowerQuestion.includes('alte bescheide') || lowerQuestion.includes('pruefen') || lowerQuestion.includes('nachtraeglich')) {
    content = `**Ja! Mit dem Ueberpruefungsantrag nach § 44 SGB X kannst du bis zu 4 Jahre zurueckgehen!**

Das ist ein maechtiges Instrument, das viele nicht kennen:

**So funktioniert es:**
1. Du stellst einen formellen Antrag auf Ueberpruefung beim Jobcenter
2. Das Amt muss den alten Bescheid nochmal pruefen
3. War er rechtswidrig, muss das Amt aendern und **nachzahlen**
4. Nachzahlungen sind fuer bis zu **4 Jahre** moeglich!

**Typische Gruende fuer Ueberpruefung:**
- Regelsatz war zu niedrig berechnet
- Mehrbedarf wurde nicht anerkannt
- KdU (Miete) wurde unrechtmaessig gekuerzt
- Einkommen wurde falsch angerechnet
- Sanktionen waren rechtswidrig

**Tipp:** Gehe ALLE Bescheide der letzten 4 Jahre durch! Bei vielen Betroffenen kommen so mehrere hundert bis tausend Euro Nachzahlung zusammen.`
    suggestedTemplates = ['ueberpruefungsantrag', 'akteneinsicht']
    relatedCategories = ['sgb10']
  } else if (lowerQuestion.includes('waschmaschine') || lowerQuestion.includes('moebel') || lowerQuestion.includes('erstausstattung')) {
    content = `**Du brauchst Geld fuer eine Waschmaschine oder andere Anschaffungen?**

Nach § 24 Abs. 3 SGB II hast du Anspruch auf **einmalige Leistungen** fuer:

- **Erstausstattung der Wohnung** (Moebel, Haushaltsgeraete)
- **Erstausstattung Bekleidung**
- **Schwangerschaftsbekleidung / Babyausstattung**

**Wichtig:** Auch wenn die Waschmaschine **kaputtgegangen** ist, kann das als Erstausstattung gelten, wenn du nachweisen kannst, dass du sie nicht aus dem Regelsatz ersetzen kannst.

**So gehst du vor:**
1. Stelle einen schriftlichen Antrag auf einmalige Leistungen
2. Begruende warum du die Anschaffung brauchst
3. Fuege Nachweise bei (Fotos vom defekten Geraet, Kostenvoranschlag)

**Hoehe:** Das Amt setzt meist Pauschalen an. In Berlin z.B. ca. 100-200 EUR fuer eine Waschmaschine. Du kannst aber auch einen hoeheren Betrag beantragen, wenn noetig.`
    suggestedTemplates = ['antrag_einmalige_leistung']
    relatedCategories = ['sgb2']
  } else if (lowerQuestion.includes('sachbearbeiter') || lowerQuestion.includes('behandelt') || lowerQuestion.includes('schlecht')) {
    content = `**Schlechte Behandlung durch den Sachbearbeiter? Das musst du nicht hinnehmen!**

Du hast mehrere Moeglichkeiten:

1. **Dienstaufsichtsbeschwerde** - Formelle Beschwerde an die Teamleitung
   - Schriftlich mit genauer Schilderung (Datum, Uhrzeit, Zeugen)
   - Das Amt MUSS darauf reagieren

2. **Teamleitungswechsel** - Du kannst beantragen, einen anderen Sachbearbeiter zu bekommen

3. **Buergerbeauftragter** - Viele Staedte haben einen Buergerbeauftragten

4. **Petitionsausschuss** - Bei schweren Faellen: Petition beim Landtag (Art. 17 GG)

**Wichtig:**
- Immer sachlich und mit Fakten argumentieren
- Termine wenn moeglich mit Begleitperson wahrnehmen
- Alles schriftlich dokumentieren
- Gespraeche schriftlich bestätigen lassen

**Dein Recht:** Du hast ein Recht auf respektvolle Behandlung! § 14 SGB I verpflichtet die Behoerden zur Beratung und Auskunft.`
    suggestedTemplates = ['beschwerde_sachbearbeiter']
    relatedCategories = ['sgb10']
  } else {
    content = `**Danke fuer deine Frage!**

Ich bin spezialisiert auf:
- **SGB II** (Buergergeld / ehem. Hartz IV)
- **SGB III** (Arbeitslosengeld I)
- **SGB XII** (Sozialhilfe)
- **KdU** (Kosten der Unterkunft / Mietuebernahme)
- **SGB X** (Widerspruch, Ueberpruefung, Verwaltungsrecht)

Beschreibe dein Problem genauer - zum Beispiel:
- "Mein Bescheid ist falsch berechnet"
- "Ich wurde sanktioniert"
- "Das Amt zahlt nicht die volle Miete"
- "Ich brauche einen Widerspruch"

Je genauer du dein Problem beschreibst, desto besser kann ich dir helfen.

**Tipp:** Halte deinen aktuellen Bescheid bereit, dann kann ich dir konkretere Tipps geben.`
    relatedCategories = ['sgb2', 'sgb3', 'sgb10']
  }

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    suggestedTemplates,
    relatedCategories,
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { checkQuestion, useQuestion } = useCreditsContext()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isLoading) return

    // Check credits
    const creditCheck = checkQuestion()
    if (!creditCheck.allowed) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Tageslimit erreicht**\n\n${creditCheck.reason}`,
        timestamp: new Date(),
      }])
      return
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Use credit
    await useQuestion()

    // Call AI API or fall back to demo
    try {
      const apiEndpoint = import.meta.env.VITE_AI_API_ENDPOINT
      if (apiEndpoint) {
        const response = await fetch(`${apiEndpoint}/amt-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            history: messages.map(m => ({ role: m.role, content: m.content })),
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
            suggestedTemplates: data.suggestedTemplates || [],
          }])
        } else {
          throw new Error('API error')
        }
      } else {
        // Demo mode - local response
        const response = generateDemoResponse(messageText)
        setMessages(prev => [...prev, response])
      }
    } catch {
      // Fallback to demo response
      const response = generateDemoResponse(messageText)
      setMessages(prev => [...prev, response])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      {/* Chat Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-amt">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">KI-Rechtsberater</h1>
              <p className="text-xs text-muted-foreground">SGB II, III, X, XII Spezialist</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {checkQuestion().allowed ? 'Frage verfuegbar' : 'Limit erreicht'}
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container max-w-3xl space-y-6">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-amt text-white mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Wie kann ich dir helfen?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Beschreibe dein Problem mit dem Amt. Ich kenne SGB II, III, X und XII
                und helfe dir, deine Rechte zu verstehen und durchzusetzen.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/50 transition-all text-sm group"
                  >
                    <Lightbulb className="h-4 w-4 text-primary mb-1" />
                    <span className="text-foreground/80 group-hover:text-foreground">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : ''}`}>
                  <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <div className="prose prose-sm max-w-none">
                      {message.content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-semibold mb-1">{line.replace(/\*\*/g, '')}</p>
                        }
                        if (line.startsWith('- ')) {
                          return <p key={i} className="ml-3 mb-0.5">&bull; {line.slice(2).replace(/\*\*/g, '')}</p>
                        }
                        if (line.match(/^\d+\./)) {
                          return <p key={i} className="ml-2 mb-0.5">{line.replace(/\*\*/g, '')}</p>
                        }
                        if (line === '') return <br key={i} />
                        return <p key={i} className="mb-1">{line.replace(/\*\*/g, '')}</p>
                      })}
                    </div>
                  </div>

                  {/* Suggested Templates */}
                  {message.suggestedTemplates && message.suggestedTemplates.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Passende Musterschreiben:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestedTemplates.map((templateId) => {
                          const template = LETTER_TEMPLATES.find(t => t.id === templateId)
                          if (!template) return null
                          return (
                            <Link
                              key={templateId}
                              to={`/generator/${templateId}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
                            >
                              <FileText className="h-3 w-3" />
                              {template.title}
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="chat-bubble-ai flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analysiere deine Frage...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card px-4 py-4">
        <div className="container max-w-3xl">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Beschreibe dein Problem mit dem Amt..."
              className="chat-input flex-1"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              variant="amt"
              size="icon"
              className="h-[46px] w-[46px] flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Keine Rechtsberatung. KI-gestuetzte Informationen.
            </p>
            <p className="text-xs text-muted-foreground">
              Enter zum Senden
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
