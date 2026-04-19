import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function useChatData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chat-conversations", user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user?.id) throw new Error("Not authenticated");

      // Fetch all messages involving the user
      const { data: messages, error } = await supabase
        .from("messages")
        .select("id, sender_id, recipient_id, content, subject, created_at, is_read")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!messages || messages.length === 0) return [];

      // Collect unique partner IDs
      const partnerIds = new Set<string>();
      for (const msg of messages) {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        partnerIds.add(partnerId);
      }

      // Fetch partner names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", Array.from(partnerIds));

      const nameMap = new Map<string, string>();
      if (profiles) {
        for (const p of profiles) {
          nameMap.set(p.user_id, p.name);
        }
      }

      // Group messages by conversation partner
      const conversationMap = new Map<string, {
        lastMessage: string;
        lastMessageAt: string;
        unreadCount: number;
      }>();

      for (const msg of messages) {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            lastMessage: msg.subject || msg.content,
            lastMessageAt: msg.created_at,
            unreadCount: 0,
          });
        }

        // Count unread messages (only incoming)
        if (msg.recipient_id === user.id && !msg.is_read) {
          const conv = conversationMap.get(partnerId)!;
          conv.unreadCount++;
        }
      }

      // Build conversation list
      const conversations: Conversation[] = [];
      for (const [partnerId, conv] of conversationMap) {
        conversations.push({
          partnerId,
          partnerName: nameMap.get(partnerId) || "Unbekannt",
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: conv.unreadCount,
        });
      }

      // Sort by most recent message
      conversations.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );

      return conversations;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60,
  });
}
