import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConversationCard } from "@/components/messages/ConversationCard";
import { Input } from "@/components/ui/input";
import type { Conversation } from "@/types";

// Mock data
const mockConversations: Conversation[] = [
  {
    id: "conv1",
    company_id: "c1",
    participant_ids: ["user1", "user2"],
    title: "Hausverwaltung Müller",
    last_message: "Die Reparatur wurde genehmigt",
    last_message_at: "2024-01-16T14:30:00Z",
    created_at: "",
    unread_count: 2,
  },
  {
    id: "conv2",
    company_id: "c1",
    participant_ids: ["user1", "user3"],
    title: "Kollege Schmidt",
    last_message: "Kannst du morgen bei der Begehung dabei sein?",
    last_message_at: "2024-01-16T10:15:00Z",
    created_at: "",
    unread_count: 0,
  },
  {
    id: "conv3",
    company_id: "c1",
    participant_ids: ["user1", "user4"],
    title: "Firma Heizungsbau GmbH",
    last_message: "Wir kommen am Donnerstag um 10 Uhr",
    last_message_at: "2024-01-15T16:45:00Z",
    created_at: "",
    unread_count: 1,
  },
  {
    id: "conv4",
    company_id: "c1",
    participant_ids: ["user1", "user5"],
    title: "Mieter Herr Weber",
    last_message: "Danke für die schnelle Hilfe!",
    last_message_at: "2024-01-14T09:00:00Z",
    created_at: "",
    unread_count: 0,
  },
];

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations] = useState(mockConversations);

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Nachrichten" 
        subtitle={totalUnread > 0 ? `${totalUnread} ungelesen` : undefined}
      />

      {/* Search */}
      <div className="px-4 py-3 border-b sticky top-[73px] z-30 backdrop-blur-xl bg-card/80">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nachrichten durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="divide-y">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Keine Nachrichten gefunden</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationCard key={conversation.id} conversation={conversation} />
          ))
        )}
      </div>
    </div>
  );
}
