/**
 * Fintutto AI Chat Komponente
 * Universelle Chat-Komponente für alle Lovable Apps
 *
 * Kopiere diese Datei in deine Lovable App unter: src/components/ai/FintuttoAIChat.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Bot, User, X, Minimize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

// Konfiguration - ANPASSEN PRO APP
const APP_CONFIG = {
  appId: 'vermietify', // 'vermietify' | 'mieterapp' | 'formulare' | 'rechner'
  appName: 'Vermietify',
  primaryColor: 'from-blue-500 to-blue-600', // Gradient für Header
  welcomeMessage: 'Hallo! 👋 Ich bin Ihr digitaler Assistent für Vermietify. Wie kann ich Ihnen helfen?',
  quickTopics: [
    { label: 'Nebenkostenabrechnung', prompt: 'Wie erstelle ich eine Nebenkostenabrechnung?' },
    { label: 'Miete erhöhen', prompt: 'Kann ich die Miete erhöhen und wie?' },
    { label: 'Steuern', prompt: 'Wie funktioniert die Anlage V für meine Steuererklärung?' },
    { label: 'Neues Objekt', prompt: 'Wie lege ich ein neues Objekt an?' },
  ],
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isPremium?: boolean;
}

interface FintuttoAIChatProps {
  userTier?: 'free' | 'basic' | 'pro' | 'business';
  userId?: string;
  onUpgradeClick?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FintuttoAIChat({
  userTier = 'free',
  userId,
  onUpgradeClick,
  isOpen,
  onClose
}: FintuttoAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: APP_CONFIG.welcomeMessage }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Supabase Function aufrufen
      const response = await fetch('/api/aiCoreService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: APP_CONFIG.appId,
          userTier,
          prompt: text.trim(),
          userId,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.content,
          isPremium: userTier !== 'free',
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Entschuldigung, es gab ein Problem. Bitte versuchen Sie es erneut.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Links im Text parsen [text](page) -> <Link>
  const parseContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push(
        <Link
          key={match.index}
          to={`/${match[2]}`}
          className="text-blue-600 underline hover:text-blue-800"
          onClick={onClose}
        >
          {match[1]}
        </Link>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className={`w-14 h-14 rounded-full bg-gradient-to-br ${APP_CONFIG.primaryColor} shadow-lg hover:shadow-xl`}
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-50 bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[70vh]">
      {/* Header */}
      <div className={`bg-gradient-to-r ${APP_CONFIG.primaryColor} text-white p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{APP_CONFIG.appName} Assistent</h3>
            <p className="text-xs text-white/80">
              {userTier === 'free' ? 'Free' : userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="text-white hover:bg-white/20 h-8 w-8">
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' ? 'bg-gray-200' : `bg-gradient-to-br ${APP_CONFIG.primaryColor}`
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-gray-600" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
              <div className="text-sm whitespace-pre-wrap">
                {parseContent(message.content)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${APP_CONFIG.primaryColor} flex items-center justify-center`}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Topics (nur bei wenigen Messages) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Häufige Fragen:</p>
          <div className="flex flex-wrap gap-2">
            {APP_CONFIG.quickTopics.map((topic) => (
              <button
                key={topic.label}
                onClick={() => sendMessage(topic.prompt)}
                disabled={loading}
                className="bg-gray-100 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Free Tier Upgrade Hint */}
      {userTier === 'free' && onUpgradeClick && (
        <div className="px-4 pb-2">
          <button
            onClick={onUpgradeClick}
            className="w-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-lg p-2 text-xs text-amber-800 hover:from-amber-200 hover:to-yellow-200 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3 h-3" />
            Upgrade für unbegrenzten KI-Zugang
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t bg-gray-50">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ihre Frage..."
            disabled={loading}
            className="flex-1 bg-white"
          />
          <Button type="submit" disabled={!input.trim() || loading} className="bg-blue-600 hover:bg-blue-700" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
