import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Bot, Send, Loader2, TrendingUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const SYSTEM_PROMPT = `Du bist der KI-Assistent des Mieterhöhungs-Checkers - prüfe ob eine Mieterhöhung rechtmäßig ist.

DEINE AUFGABEN:
1. Prüfe Mieterhöhungen auf Rechtmäßigkeit
2. Erkläre die Kappungsgrenze
3. Berechne maximal zulässige Erhöhungen
4. Gib Handlungsempfehlungen

RECHTLICHE GRUNDLAGEN:
§ 558 BGB - Mieterhöhung bis zur ortsüblichen Vergleichsmiete:
- Kappungsgrenze: Max 20% in 3 Jahren
- In angespannten Märkten: Max 15% in 3 Jahren
- Begründung erforderlich (Mietspiegel, Gutachten, Vergleichswohnungen)
- Zustimmungsfrist: Bis Ende 2. Monat nach Zugang
- Sperrfrist: 15 Monate seit letzter Erhöhung

PRÜFSCHEMA:
1. Formelle Prüfung (Schriftform, Begründung vorhanden?)
2. Sperrfrist eingehalten? (>15 Monate)
3. Kappungsgrenze prüfen (20%/15% in 3 Jahren)
4. Ortsübliche Vergleichsmiete als Obergrenze
5. Mietpreisbremse bei Neuvermietung?

BEISPIEL:
Aktuelle Miete: 800€, letzte Erhöhung vor 2 Jahren: +100€
→ Kappungsgrenze: 20% von 700€ (Ausgangsmiete) = 840€ max
→ Vergleichsmiete prüfen!

FINTUTTO UNIVERSE: Vermietify, Rent-Wizard (Rechner), Formulare (Erhöhungsverlangen)`;

interface Message { role: 'user' | 'assistant'; content: string; }

export default function GlobalAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hallo! 📈 Ich bin der Mieterhöhungs-Checker. Ich prüfe, ob eine Mieterhöhung rechtmäßig ist und berechne die maximal zulässige Erhöhung. Was möchtest du prüfen?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setMessages(prev => [...prev, { role: 'assistant', content: 'KI-Funktion wird bald aktiviert! Der Assistent wird deine Mieterhöhung prüfen.' }]);
    setLoading(false);
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={() => setIsOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg hover:scale-105 transition-all">
            <TrendingUp className="w-6 h-6" />
          </Button>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative rounded-full h-4 w-4 bg-amber-500 flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-white" />
            </span>
          </span>
        </div>
      )}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] flex flex-col p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Mieterhöhungs-Checker
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${m.role === 'user' ? 'bg-amber-500 text-white' : 'bg-gray-100'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Prüfe...</span></div></div>}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder="Beschreibe die Mieterhöhung..." rows={2} className="resize-none" />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-amber-500 hover:bg-amber-600">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
