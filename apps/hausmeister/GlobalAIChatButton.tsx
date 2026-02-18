import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Sparkles, Bot, Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const SYSTEM_PROMPT = `Du bist der KI-Assistent der Hausmeister-App - die App für Facility Manager und Hausmeister.

DEINE AUFGABEN:
1. Hilf bei der Aufgabenverwaltung und Priorisierung
2. Gib Tipps zur Gebäudewartung und Instandhaltung
3. Beantworte Fragen zu Reparaturen und Handwerkern
4. Unterstütze bei der Dokumentation

TYPISCHE AUFGABEN:
- Winterdienst / Streupflicht
- Treppenhausreinigung
- Grünflächenpflege
- Kleinreparaturen
- Zählerablesung
- Mülltonnen-Management
- Schlüsselverwaltung
- Notfall-Koordination

WICHTIG BEI NOTFÄLLEN:
- Wasserschaden → Haupthahn zudrehen, Verwaltung informieren
- Heizungsausfall → Notdienst Heizungsbauer
- Stromausfall → Sicherungen prüfen, Netzbetreiber
- Aufzugstörung → Aufzugnotdienst, Personen beruhigen

FINTUTTO UNIVERSE: Vermietify (Verwaltung), MieterApp (für Mieter), OCR-Zähler (Ablesung)`;

interface Message { role: 'user' | 'assistant'; content: string; }

export default function GlobalAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hallo! 👋 Ich bin der Hausmeister-Assistent. Ich helfe dir bei Aufgaben, Reparaturen und der Gebäudeverwaltung. Was steht an?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setMessages(prev => [...prev, { role: 'assistant', content: 'KI-Funktion wird bald aktiviert! Der Assistent wird dir bei allen Hausmeister-Aufgaben helfen.' }]);
    setLoading(false);
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={() => setIsOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg hover:scale-105 transition-all">
            <Sparkles className="w-6 h-6" />
          </Button>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative rounded-full h-4 w-4 bg-orange-500 flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-white" />
            </span>
          </span>
        </div>
      )}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] flex flex-col p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-orange-500 to-amber-600 text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <Bot className="w-5 h-5" /> Hausmeister-Assistent
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${m.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Denke nach...</span></div></div>}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder="Frag mich..." rows={2} className="resize-none" />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-orange-500 hover:bg-orange-600">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
