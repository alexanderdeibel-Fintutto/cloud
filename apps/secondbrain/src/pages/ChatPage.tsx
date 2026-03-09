import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ChatInterface from '@/components/chat/ChatInterface'
import { useChat } from '@/hooks/useChat'
import { useDocuments } from '@/hooks/useDocuments'

export default function ChatPage() {
  const { messages, isLoading, sendMessage, clearChat } = useChat()
  const { data: documents = [] } = useDocuments()

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
          <p className="text-sm font-medium">
            KI-Chat — {messages.filter((m) => m.role === 'user').length} Nachrichten
          </p>
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Neuer Chat
          </Button>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 min-h-0">
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          documents={documents}
        />
      </div>
    </div>
  )
}
