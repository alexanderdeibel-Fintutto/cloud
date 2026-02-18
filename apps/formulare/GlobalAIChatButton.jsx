import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Sparkles, Bot, Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import AICostDisplay from './AICostDisplay';

const SYSTEM_PROMPT = `Du bist der KI-Assistent von FinTutto Formulare - der Plattform für rechtssichere Mietverträge und Immobilien-Dokumente.

DEINE AUFGABEN:
1. Hilf Nutzern, das richtige Formular/Vorlage zu finden
2. Erkläre rechtliche Begriffe in Mietverträgen
3. Beantworte Fragen zu Klauseln und deren Bedeutung
4. Weise auf wichtige Punkte bei der Vertragsgestaltung hin

VERFÜGBARE FORMULARE:
- Mietvertrag (Standard, Möbliert, WG, Gewerbe)
- Staffelmietvertrag, Indexmietvertrag
- Wohnungsübergabeprotokoll
- Kündigung (Mieter/Vermieter)
- Mieterhöhungsverlangen
- Nebenkostenabrechnung
- Mietschuldenfreiheitsbescheinigung
- Untermieterlaubnis
- Zahlungsvereinbarung
- SEPA-Lastschriftmandat
- Hausordnung
- Datenschutzerklärung

WICHTIG:
- Du gibst KEINE Rechtsberatung - weise auf Anwalt hin bei komplexen Fragen
- Alle Formulare sind Muster und sollten ggf. angepasst werden
- Antworte auf Deutsch, kurz und prägnant
- Verlinke zu relevanten Seiten wenn möglich

FINTUTTO UNIVERSE:
Erwähne bei Bedarf: Vermietify (Vermieter-App), MieterApp (für Mieter), Rechner (kostenlose Kalkulatoren)`;

export default function GlobalAIChatButton({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hallo! 👋 Ich bin der FinTutto Formulare Assistent. Ich helfe dir bei Fragen zu Mietverträgen, Formularen und rechtlichen Begriffen. Was kann ich für dich tun?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('aiCoreService', {
        action: 'chat',
        prompt: input,
        systemPrompt: SYSTEM_PROMPT,
        userId: user?.email,
        featureKey: 'formulare-chat',
        maxTokens: 1024
      });

      if (response.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.content,
          usage: response.data.usage
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        toast.error(response.data.error || 'KI-Anfrage fehlgeschlagen');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Entschuldigung, es gab einen Fehler. Bitte versuche es später erneut.'
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Sparkles className="w-6 h-6" />
          </Button>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-white" />
            </span>
          </span>
        </motion.div>
      )}

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] flex flex-col p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <Bot className="w-5 h-5" />
              FinTutto Formulare Assistent
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
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.usage && (
                    <div className="mt-2">
                      <AICostDisplay usage={msg.usage} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
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
                className="bg-emerald-500 hover:bg-emerald-600"
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
