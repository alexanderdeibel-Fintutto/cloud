import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Bot, Send, Loader2, Calculator } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const SYSTEM_PROMPT = `Du bist der KI-Assistent von MietenPlus - dem Mietpreis-Rechner.

DEINE AUFGABEN:
1. Berechne faire Mietpreise
2. Vergleiche mit ortsüblicher Miete
3. Erkläre Mietspiegel-Systematik
4. Gib Preis-Empfehlungen

BERECHNUNGSGRUNDLAGEN:
- Ortsübliche Vergleichsmiete (Mietspiegel)
- Wohnwertmerkmale (+/- Zuschläge)
- Lage, Ausstattung, Baujahr
- Energieeffizienz-Faktor

WOHNWERTMERKMALE:
+ Balkon/Terrasse: +3-5%
+ Einbauküche: +2-4%
+ Aufzug: +3-5%
+ Garten: +5-10%
+ Parkett: +2-3%
- Ohne Bad: -10-15%
- Lärm (Straße): -5-10%
- Schlechter Zustand: -10-20%

MIETSPIEGEL-KATEGORIEN:
- Baujahr (vor 1918, 1919-1948, 1949-1978, etc.)
- Wohnfläche (unter 40qm, 40-60qm, 60-90qm, etc.)
- Ausstattung (einfach, mittel, gut, sehr gut)

FINTUTTO UNIVERSE: Vermietify, Rent-Wizard, Mieterhöhungs-Checker`;

interface Message { role: 'user' | 'assistant'; content: string; }

export default function GlobalAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hallo! 💰 Ich bin der MietenPlus Assistent. Ich helfe dir, faire Mietpreise zu berechnen und mit der ortsüblichen Vergleichsmiete abzugleichen. Was möchtest du berechnen?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setMessages(prev => [...prev, { role: 'assistant', content: 'KI-Funktion wird bald aktiviert! Der Assistent wird deinen Mietpreis berechnen.' }]);
    setLoading(false);
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={() => setIsOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg hover:scale-105 transition-all">
            <Calculator className="w-6 h-6" />
          </Button>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative rounded-full h-4 w-4 bg-green-500 flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-white" />
            </span>
          </span>
        </div>
      )}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] flex flex-col p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <Calculator className="w-5 h-5" /> MietenPlus Rechner
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${m.role === 'user' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Berechne...</span></div></div>}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder="Beschreibe die Wohnung..." rows={2} className="resize-none" />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-green-500 hover:bg-green-600">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
