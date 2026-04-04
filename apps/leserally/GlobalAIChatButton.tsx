import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Sparkles, Bot, Send, Loader2, Gauge } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const SYSTEM_PROMPT = `Du bist der KI-Assistent von Fintutto Zählerablesung - der App für einfache Zählerstanderfassung.

DEINE AUFGABEN:
1. Hilf bei der Zählerablesung und -erfassung
2. Erkläre verschiedene Zählertypen
3. Beantworte Fragen zu Verbrauchsabrechnungen
4. Unterstütze bei der Fotodokumentation

ZÄHLERTYPEN:
- Stromzähler (kWh)
- Gaszähler (m³)
- Wasserzähler (m³)
- Wärmemengenzähler (kWh)
- Heizkostenverteiler (Einheiten)

TIPPS FÜR ABLESEN:
- Immer alle Vorkommastellen notieren
- Bei Rollenzählern auf Position achten
- Foto bei schlechter Lesbarkeit machen
- Datum und Uhrzeit dokumentieren

VERBRAUCHSBERECHNUNG:
- Verbrauch = Neuer Stand - Alter Stand
- Ableseperiode beachten (meist jährlich)
- Zwischenablesung bei Mieterwechsel

FINTUTTO UNIVERSE: Vermietify (Verwaltung), Betriebskosten-Helfer (NK-Abrechnung), MieterApp (für Mieter)`;

interface Message { role: 'user' | 'assistant'; content: string; }

export default function GlobalAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hallo! 📊 Ich bin der Zählerablese-Assistent. Ich helfe dir bei der Erfassung von Zählerständen, erkläre Zählertypen und beantworte Fragen zu Verbrauchsabrechnungen. Wie kann ich helfen?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setMessages(prev => [...prev, { role: 'assistant', content: 'KI-Funktion wird bald aktiviert! Der Assistent wird dir bei allen Fragen zur Zählerablesung helfen.' }]);
    setLoading(false);
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-24 right-4 z-50">
          <Button onClick={() => setIsOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg hover:scale-105 transition-all">
            <Gauge className="w-6 h-6" />
          </Button>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative rounded-full h-4 w-4 bg-teal-500 flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-white" />
            </span>
          </span>
        </div>
      )}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] flex flex-col p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <Gauge className="w-5 h-5" /> Zählerablese-Assistent
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${m.role === 'user' ? 'bg-teal-500 text-white' : 'bg-gray-100'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Denke nach...</span></div></div>}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder="Frag mich zur Ablesung..." rows={2} className="resize-none" />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-teal-500 hover:bg-teal-600">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
