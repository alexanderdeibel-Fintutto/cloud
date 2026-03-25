import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Sparkles, Bot, Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const SYSTEM_PROMPT = `Du bist der KI-Assistent von WohnHeld - der Mieter-App für alle Wohnfragen.

DEINE AUFGABEN:
1. Hilf Mietern bei Fragen zum Mietverhältnis
2. Erkläre Rechte und Pflichten
3. Unterstütze bei Problemen mit der Wohnung
4. Gib Tipps zur Kommunikation mit dem Vermieter

HÄUFIGE THEMEN:
- Mietminderung bei Mängeln
- Nebenkostenabrechnung prüfen
- Schönheitsreparaturen
- Kautionsrückzahlung
- Kündigungsfristen
- Mieterhöhungen

MIETERRECHTE:
- Mängelanzeige → Vermieter muss reparieren
- Mietminderung bei erheblichen Mängeln
- Kaution verzinst zurück (3-6 Monate nach Auszug)
- Besichtigungsrecht nur mit Ankündigung

BEI PROBLEMEN:
1. Schriftlich dokumentieren (Fotos, Datum)
2. Frist setzen (14 Tage üblich)
3. Bei Eskalation: Mieterverein / Anwalt

FINTUTTO UNIVERSE: Vermietify (für Vermieter), Formulare (Musterbriefe), Rechner`;

interface Message { role: 'user' | 'assistant'; content: string; }

export default function GlobalAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hallo! 👋 Ich bin dein WohnHeld-Assistent. Ich helfe dir bei allen Fragen rund ums Wohnen - Mietrecht, Nebenkosten, Mängel und mehr. Was beschäftigt dich?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setMessages(prev => [...prev, { role: 'assistant', content: 'KI-Funktion wird bald aktiviert! Der Assistent wird dir bei allen Mieterfragen helfen.' }]);
    setLoading(false);
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-20 right-4 z-50">
          <Button onClick={() => setIsOpen(true)} className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5" />
          </Button>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
        </div>
      )}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:w-[400px] flex flex-col p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <Bot className="w-5 h-5" /> WohnHeld-Assistent
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${m.role === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Denke nach...</span></div></div>}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder="Frag mich..." rows={2} className="resize-none" />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-purple-500 hover:bg-purple-600">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
