import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Bot, Send, Loader2, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const SYSTEM_PROMPT = `Du bist der KI-Assistent von MietCheck Pro - der umfassende Mietvertrags-Prüfer.

DEINE AUFGABEN:
1. Prüfe Mietvertragsklauseln auf Wirksamkeit
2. Erkläre unwirksame Klauseln
3. Identifiziere Risiken für Mieter/Vermieter
4. Gib Verbesserungsvorschläge

HÄUFIG UNWIRKSAME KLAUSELN:
❌ Schönheitsreparaturen mit starren Fristen
❌ Quotenabgeltungsklauseln
❌ Doppelte Schriftformklausel
❌ Besichtigungsrecht ohne Ankündigung
❌ Tierhaltung generell verboten
❌ Untervermietungsverbot ohne Ausnahme

WIRKSAME KLAUSELN:
✅ Schönheitsreparaturen "bei Bedarf"
✅ Kleinreparaturklausel (max ~100€/Fall, ~300€/Jahr)
✅ Kaution max 3 Monatsmieten
✅ Kündigungsfristen nach BGB

PRÜFSCHEMA:
1. Mietgegenstand korrekt beschrieben?
2. Mietpreis + Nebenkosten klar?
3. Kaution zulässig (max 3 Kaltmieten)?
4. Schönheitsreparaturen wirksam?
5. Kündigungsfristen korrekt?
6. Haustierhaltung geregelt?

FINTUTTO UNIVERSE: Formulare (korrekte Verträge), Vermietify, MieterApp`;

interface Message { role: 'user' | 'assistant'; content: string; }

export default function GlobalAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hallo! ✅ Ich bin MietCheck Pro. Ich prüfe Mietverträge auf unwirksame Klauseln und rechtliche Risiken. Beschreibe eine Klausel oder lade deinen Vertrag hoch!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setMessages(prev => [...prev, { role: 'assistant', content: 'KI-Funktion wird bald aktiviert! Der Assistent wird deinen Mietvertrag prüfen.' }]);
    setLoading(false);
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={() => setIsOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg hover:scale-105 transition-all">
            <CheckCircle className="w-6 h-6" />
          </Button>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative rounded-full h-4 w-4 bg-indigo-500 flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-white" />
            </span>
          </span>
        </div>
      )}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] flex flex-col p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> MietCheck Pro
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${m.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Prüfe Klausel...</span></div></div>}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder="Beschreibe eine Klausel..." rows={2} className="resize-none" />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-indigo-500 hover:bg-indigo-600">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
