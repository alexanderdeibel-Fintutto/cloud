import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Message, Conversation } from "@/types";

// Mock data
const mockConversation: Conversation = {
  id: "conv1",
  company_id: "c1",
  participant_ids: ["user1", "user2"],
  title: "Hausverwaltung Müller",
  created_at: "",
};

const mockMessages: Message[] = [
  {
    id: "m1",
    conversation_id: "conv1",
    sender_id: "user2",
    content: "Guten Tag, wir haben eine neue Schadensmeldung für Parkstraße 12 erhalten.",
    read_by: ["user1", "user2"],
    created_at: "2024-01-16T09:00:00Z",
  },
  {
    id: "m2",
    conversation_id: "conv1",
    sender_id: "user1",
    content: "Danke für die Info. Um was für einen Schaden handelt es sich?",
    read_by: ["user1", "user2"],
    created_at: "2024-01-16T09:15:00Z",
  },
  {
    id: "m3",
    conversation_id: "conv1",
    sender_id: "user2",
    content: "Ein tropfender Wasserhahn in Wohnung 3A. Der Mieter hat bereits Fotos geschickt.",
    read_by: ["user1", "user2"],
    created_at: "2024-01-16T09:20:00Z",
  },
  {
    id: "m4",
    conversation_id: "conv1",
    sender_id: "user1",
    content: "Verstanden, ich kümmere mich heute Nachmittag darum.",
    read_by: ["user1", "user2"],
    created_at: "2024-01-16T09:30:00Z",
  },
  {
    id: "m5",
    conversation_id: "conv1",
    sender_id: "user2",
    content: "Die Reparatur wurde genehmigt. Bitte dokumentieren Sie die Arbeiten mit Fotos.",
    read_by: ["user2"],
    created_at: "2024-01-16T14:30:00Z",
  },
];

const currentUserId = "user1";

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `m${Date.now()}`,
      conversation_id: id || "conv1",
      sender_id: currentUserId,
      content: newMessage.trim(),
      read_by: [currentUserId],
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              HM
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-semibold">{mockConversation.title}</h1>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
        {messages.map((message, index) => {
          const isOwn = message.sender_id === currentUserId;
          const showDate = index === 0 || 
            format(new Date(message.created_at), "yyyy-MM-dd") !== 
            format(new Date(messages[index - 1].created_at), "yyyy-MM-dd");

          return (
            <div key={message.id}>
              {showDate && (
                <div className="text-center text-xs text-muted-foreground py-2">
                  {format(new Date(message.created_at), "EEEE, d. MMMM", { locale: de })}
                </div>
              )}
              <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2",
                  isOwn 
                    ? "bg-primary text-primary-foreground rounded-br-md" 
                    : "bg-muted rounded-bl-md"
                )}>
                  <p className="text-sm">{message.content}</p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {format(new Date(message.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-bottom">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Nachricht schreiben..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="touch-target"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
