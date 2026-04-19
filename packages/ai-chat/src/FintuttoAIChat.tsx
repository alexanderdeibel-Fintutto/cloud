import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface FintuttoAIChatConfig {
  /** App identifier for backend routing */
  appId: "mieterportal" | "vermieter-portal" | "vermieterportal" | "vermietify" | "mieterapp" | "formulare" | "rechner" | "betriebskosten" | "hausmeister" | "mietrecht" | "checker" | "admin";
  /** Display title in chat header */
  title?: string;
  /** Primary brand color (hex) */
  primaryColor?: string;
  /** Input placeholder text */
  placeholder?: string;
  /** Supabase client instance */
  supabaseClient: any;
  /** Optional: Current user tier (free/basic/pro/business/premium) */
  userTier?: string;
  /** Optional: Additional context to send with each request */
  context?: string;
  /** Optional: Welcome message shown when chat is empty */
  welcomeMessage?: string;
  /** Optional: Position of the button */
  position?: "bottom-right" | "bottom-left";
}

// =============================================================================
// DEFAULT CONFIGS PER APP
// =============================================================================

const APP_DEFAULTS: Record<string, { title: string; primaryColor: string; placeholder: string; welcomeMessage: string }> = {
  mieterportal: {
    title: "Mieter-Assistent",
    primaryColor: "#10b981",
    placeholder: "Frag mich zu Mietrecht, Nebenkosten...",
    welcomeMessage: "Hallo! Ich bin dein Wohn-Assistent. Wie kann ich dir helfen?",
  },
  'vermieter-portal': {
    title: "Vermieter-Assistent",
    primaryColor: "#7c3aed",
    placeholder: "Frag mich zu Rechnern, Formularen, Mietrecht...",
    welcomeMessage: "Hallo! Ich helfe dir mit Rechnern, Formularen und Mietrecht-Fragen.",
  },
  // Legacy-Alias
  vermieterportal: {
    title: "Vermieter-Assistent",
    primaryColor: "#6366f1",
    placeholder: "Frag mich zu Verwaltung, Mietrecht...",
    welcomeMessage: "Guten Tag! Wie kann ich Ihnen bei der Immobilienverwaltung helfen?",
  },
  vermietify: {
    title: "Vermietify Assistent",
    primaryColor: "#6366f1",
    placeholder: "Frag mich etwas...",
    welcomeMessage: "Willkommen bei Vermietify! Wie kann ich Ihnen helfen?",
  },
  mieterapp: {
    title: "MieterApp Assistent",
    primaryColor: "#10b981",
    placeholder: "Wie kann ich dir helfen?",
    welcomeMessage: "Hey! Ich bin dein Wohnungshelfer. Was kann ich fuer dich tun?",
  },
  formulare: {
    title: "Formulare Assistent",
    primaryColor: "#8b5cf6",
    placeholder: "Welches Dokument brauchst du?",
    welcomeMessage: "Hallo! Ich helfe Ihnen bei Mietvertraegen und Dokumenten.",
  },
  rechner: {
    title: "Rechner Assistent",
    primaryColor: "#f59e0b",
    placeholder: "Was moechtest du berechnen?",
    welcomeMessage: "Willkommen! Ich helfe bei Rendite, Mieterhoehungen und mehr.",
  },
  betriebskosten: {
    title: "Nebenkosten Assistent",
    primaryColor: "#3b82f6",
    placeholder: "Fragen zur NK-Abrechnung?",
    welcomeMessage: "Hallo! Ich bin Experte fuer Nebenkostenabrechnungen.",
  },
  hausmeister: {
    title: "Hausmeister Assistent",
    primaryColor: "#ef4444",
    placeholder: "Was steht an?",
    welcomeMessage: "Hallo! Wie kann ich bei der Objektbetreuung helfen?",
  },
  mietrecht: {
    title: "Mietrecht Assistent",
    primaryColor: "#14b8a6",
    placeholder: "Fragen zum Mietrecht?",
    welcomeMessage: "Guten Tag! Ich erklaere deutsches Mietrecht verstaendlich.",
  },
  checker: {
    title: "Mieterhoehungs-Checker",
    primaryColor: "#ec4899",
    placeholder: "Mieterhoehung pruefen?",
    welcomeMessage: "Hallo! Ich pruefe ob Ihre Mieterhoehung rechtmaessig ist.",
  },
  admin: {
    title: "Admin Assistent",
    primaryColor: "#64748b",
    placeholder: "Admin-Fragen?",
    welcomeMessage: "Willkommen im Admin-Bereich. Wie kann ich helfen?",
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function FintuttoAIChat({
  appId,
  title,
  primaryColor,
  placeholder,
  supabaseClient,
  userTier = "free",
  context,
  welcomeMessage,
  position = "bottom-right",
}: FintuttoAIChatConfig) {
  const defaults = APP_DEFAULTS[appId] || APP_DEFAULTS.vermietify;

  const config = {
    title: title || defaults.title,
    primaryColor: primaryColor || defaults.primaryColor,
    placeholder: placeholder || defaults.placeholder,
    welcomeMessage: welcomeMessage || defaults.welcomeMessage,
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabaseClient.auth.getUser();

      // Call Edge Function
      const response = await supabaseClient.functions.invoke("aiCoreService", {
        body: {
          appId,
          userTier,
          prompt: userMessage,
          userId: user?.id || "anonymous",
          context,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "API Fehler");
      }

      const data = response.data;

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content, timestamp: new Date() },
        ]);
      } else if (data.rateLimitExceeded) {
        setError("Du hast dein Limit erreicht. Bitte spaeter erneut versuchen.");
      } else {
        throw new Error(data.error || "Unbekannter Fehler");
      }
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      setError(err.message || "Es gab einen Fehler. Bitte versuche es erneut.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Entschuldigung, es gab einen Fehler. Bitte versuche es erneut." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, supabaseClient, appId, userTier, context]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const positionClass = position === "bottom-left" ? "left-6" : "right-6";

  // Floating Button (closed state)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${positionClass} z-50 rounded-full p-4 shadow-lg hover:scale-110 transition-all duration-200 group`}
        style={{ backgroundColor: config.primaryColor }}
        aria-label="KI-Assistent oeffnen"
      >
        <MessageCircle className="h-6 w-6 text-white" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: config.primaryColor }}
          />
          <Sparkles className="relative inline-flex rounded-full h-4 w-4 text-yellow-300" />
        </span>
      </button>
    );
  }

  // Chat Window (open state)
  return (
    <div
      className={`fixed bottom-6 ${positionClass} z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200`}
      style={{ height: "500px", maxHeight: "70vh" }}
    >
      {/* Header */}
      <div
        className="p-4 text-white flex justify-between items-center shrink-0"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">{config.title}</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
          aria-label="Chat schliessen"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8 px-4">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${config.primaryColor}20` }}
            >
              <Sparkles className="h-8 w-8" style={{ color: config.primaryColor }} />
            </div>
            <p className="text-sm">{config.welcomeMessage}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "text-white rounded-br-md"
                  : "bg-white border border-gray-200 rounded-bl-md shadow-sm"
              }`}
              style={msg.role === "user" ? { backgroundColor: config.primaryColor } : {}}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: config.primaryColor }} />
                <span className="text-sm text-gray-500">Denke nach...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <span className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full">
              {error}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:border-transparent text-sm"
            style={{ "--tw-ring-color": config.primaryColor } as React.CSSProperties}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="rounded-full px-4 py-2.5 text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: config.primaryColor }}
            aria-label="Nachricht senden"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FintuttoAIChat;
