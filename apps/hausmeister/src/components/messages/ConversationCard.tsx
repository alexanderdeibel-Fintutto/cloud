import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import type { Conversation } from "@/types";

interface ConversationCardProps {
  conversation: Conversation;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const initials = conversation.title
    ?.split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

  const timeAgo = conversation.last_message_at
    ? formatDistanceToNow(new Date(conversation.last_message_at), { 
        addSuffix: false,
        locale: de 
      })
    : "";

  const hasUnread = (conversation.unread_count || 0) > 0;

  return (
    <Link 
      to={`/nachrichten/${conversation.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted transition-colors touch-target"
    >
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-medium truncate ${hasUnread ? 'text-foreground' : 'text-foreground'}`}>
            {conversation.title}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {timeAgo}
          </span>
        </div>
        <p className={`text-sm truncate mt-0.5 ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          {conversation.last_message}
        </p>
      </div>

      {hasUnread && (
        <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center flex-shrink-0">
          {conversation.unread_count}
        </Badge>
      )}
    </Link>
  );
}
