import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChatSkeleton } from "@/components/ui/ShimmerSkeleton";
import { CardContent } from "@/components/ui/card";
import { ChevronRight, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useChatData } from "@/hooks/useChatData";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const avatarGradients = [
  "gradient-primary",
  "gradient-coral",
  "gradient-sky",
  "gradient-mint",
  "gradient-amber",
];

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function Chat() {
  const { data: conversations, isLoading } = useChatData();

  return (
    <MobileLayout>
      <PageHeader title="Nachrichten" subtitle="Kommunikation mit der Verwaltung" />

      {isLoading ? (
        <ChatSkeleton />
      ) : (
        <div className="px-4 -mt-2 space-y-3 pb-4">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv, index) => {
              const avatarClass = avatarGradients[index % avatarGradients.length];
              const timeAgo = formatDistanceToNow(new Date(conv.lastMessageAt), {
                addSuffix: false,
                locale: de,
              });

              return (
                <Link key={conv.partnerId} to={`/chat/${conv.partnerId}`}>
                  <AnimatedCard delay={index * 80} hover>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl ${avatarClass} flex items-center justify-center flex-shrink-0 shadow-lg relative`}>
                          <span className="text-white font-bold text-lg">{getInitials(conv.partnerName)}</span>
                          {conv.unreadCount > 0 && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-card" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-white/90">{conv.partnerName}</h3>
                            <span className="text-xs text-white/40">Vor {timeAgo}</span>
                          </div>
                          <p className="text-sm text-white/50 truncate">{conv.lastMessage}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {conv.unreadCount > 0 && (
                            <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white animate-bounce-in shadow-lg shadow-primary/30">
                              {conv.unreadCount}
                            </span>
                          )}
                          <ChevronRight className="h-5 w-5 text-white/40" />
                        </div>
                      </div>
                    </CardContent>
                  </AnimatedCard>
                </Link>
              );
            })
          ) : (
            <AnimatedCard delay={0}>
              <CardContent className="p-6">
                <EmptyState
                  icon={MessageSquare}
                  title="Keine Nachrichten"
                  description="Sie haben noch keine Unterhaltungen."
                />
              </CardContent>
            </AnimatedCard>
          )}
        </div>
      )}
    </MobileLayout>
  );
}