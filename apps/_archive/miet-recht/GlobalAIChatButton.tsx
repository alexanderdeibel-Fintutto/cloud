import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Sparkles, Bot, Send, Loader2, Scale } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const SYSTEM_PROMPT = `Du bist der KI-Assistent von Fintutto Mietrecht - die Rechtsinfo-App für Mietrecht.

DEINE AUFGABEN:
1. Erkläre mietrechtliche Begriffe und Regelungen
2. Zeige relevante Paragraphen und deren Bedeutung
3. Hilf beim Verständnis von Urteilen
4. Gib allgemeine Orientierung (KEINE Rechtsberatung!)

WICHTIGE PARAGRAPHEN:
§ 535 BGB - Mietvertrag (Hauptpflichten)
§ 536 BGB - Mietminderung bei Mängeln
§ 543 BGB - Fristlose Kündigung
§ 556 BGB - Betriebskosten
§ 558 BGB - Mieterhöhung
§ 573 BGB - Ordentliche Kündigung
§ 574 BGB - Widerspruch (Sozialklausel)

KÜNDIGUNGSFRISTEN:
- Mieter: immer 3 Monate
- Vermieter: 3/6/9 Monate (je nach Mietdauer)

MIETMINDERUNG (Beispiele):
- Heizungsausfall im Winter: 50-100%
- Schimmel: 10-50%
- Lärm von Baustelle: 10-30%
- Warmwasserausfall: 10-20%

WICHTIG: Ich gebe nur allgemeine Informationen - bei konkreten Rechtsfragen immer Anwalt oder Mieterverein!

FINTUTTO UNIVERSE: Vermietify (Verwaltung), MieterApp (für Mieter), Formulare (Musterbriefe)`;

interface Message { role: 'user' | 'assistant'; content: string; }

export default function GlobalAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hallo! ⚖️ Ich bin der Mietrecht-Assistent. Ich erkläre dir Paragraphen, Rechte und Pflichten im Mietverhältnis. Was möchtest du wissen?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setMessages(prev => [...prev, { role: 'assistant', content: 'KI-Funktion wird bald aktiviert! Der Assistent wird dir bei allen Mietrecht-Fragen helfen.' }]);
    setLoading(false);
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={() => setIsOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg hover:scale-105 transition-all">
            <Scale className="w-6 h-6" />
          </Button>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative rounded-full h-4 w-4 bg-slate-600 flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-white" />
            </span>
          </span>
        </div>
      )}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] flex flex-col p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-slate-700 to-slate-900 text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <Scale className="w-5 h-5" /> Mietrecht-Assistent
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${m.role === 'user' ? 'bg-slate-700 text-white' : 'bg-gray-100'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Recherchiere...</span></div></div>}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder="Frag mich zum Mietrecht..." rows={2} className="resize-none" />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-slate-700 hover:bg-slate-800">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
