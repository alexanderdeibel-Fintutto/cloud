import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Sparkles, Bot, Send, Loader2, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const SYSTEM_PROMPT = `Du bist der KI-Assistent von Fintutto Financial Compass - der Buchhaltungs- und Finanzverwaltungs-App für Vermieter und kleine Unternehmen.

DEINE AUFGABEN:
1. Hilf Nutzern bei der Buchhaltung und Finanzverwaltung
2. Erkläre Buchungsvorgänge und Kontierungen
3. Unterstütze bei Rechnungsstellung und Belegverwaltung
4. Beantworte Fragen zu Steuern und Abschreibungen
5. Hilf bei der Navigation in der App

VERFÜGBARE FUNKTIONEN:
- Dashboard: Finanzübersicht, Cashflow, offene Posten
- Buchungen: Einnahmen/Ausgaben erfassen
- Rechnungen: Rechnungen erstellen und verwalten
- Belege: Belege scannen und archivieren
- Kontakte: Kunden und Lieferanten verwalten
- Bankkonten: Kontoübersicht, Kontoabgleich
- Berichte: BWA, EÜR, Umsatzsteuer
- Einstellungen: Kontenrahmen, Steuersätze

NAVIGATION (Links):
[Dashboard](/) | [Buchungen](/buchungen) | [Rechnungen](/rechnungen) | [Belege](/belege) | [Kontakte](/kontakte) | [Bankkonten](/bankkonten) | [Berichte](/berichte) | [Einstellungen](/einstellungen)

WICHTIG:
- Keine Steuerberatung - bei komplexen Fragen Steuerberater empfehlen
- Antworte auf Deutsch, kurz und prägnant
- Erwähne bei Bedarf andere Fintutto-Apps: Vermietify (Immobilienverwaltung), MieterApp, Formulare

BEISPIEL-ANTWORTEN:
"Wie buche ich eine Mietzahlung?" → "Gehe zu [Buchungen](/buchungen) → Neue Buchung → Kategorie 'Mieteinnahmen'. Tipp: Bei regelmäßigen Zahlungen kannst du eine Dauerbuchung anlegen."

"Was ist der Unterschied zwischen EÜR und Bilanz?" → "Die EÜR (Einnahmen-Überschuss-Rechnung) ist die vereinfachte Gewinnermittlung für Freiberufler und kleine Unternehmen. Die Bilanz ist für Kapitalgesellschaften und größere Unternehmen Pflicht. In [Berichte](/berichte) findest du beide Optionen."`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function GlobalAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hallo! 👋 Ich bin der Fintutto Financial Compass Assistent. Ich helfe dir bei Buchhaltung, Rechnungen, Belegen und allen Finanzfragen. Was kann ich für dich tun?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Hier würde der API-Call kommen
      // Für jetzt simulieren wir eine Antwort
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiMessage: Message = {
        role: 'assistant',
        content: 'Diese Funktion wird bald verfügbar sein! Der KI-Assistent wird dir bei allen Fragen zur Buchhaltung und Finanzverwaltung helfen können.'
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: 'Fehler',
        description: 'KI-Anfrage fehlgeschlagen. Bitte versuche es später erneut.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  // Link-Parsing für Navigation
  function renderMessage(content: string) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          className="text-blue-500 hover:underline font-medium"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = match![2];
            setIsOpen(false);
          }}
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Sparkles className="w-6 h-6" />
          </Button>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-white" />
            </span>
          </span>
        </div>
      )}

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] flex flex-col p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Fintutto Finanz-Assistent
            </SheetTitle>
          </SheetHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{renderMessage(msg.content)}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-500">Denke nach...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Frag mich etwas..."
                className="resize-none"
                rows={2}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
