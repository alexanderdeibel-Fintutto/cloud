import { Brain, User, FileText, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  sources?: { title: string; id: string }[]
}

export default function ChatMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser ? 'bg-primary/20' : 'gradient-brain'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Brain className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : ''}`}>
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((source) => (
              <Badge key={source.id} variant="outline" className="text-[10px] gap-1 cursor-pointer hover:bg-accent">
                <FileText className="w-3 h-3" />
                {source.title}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(message.created_at)}
          </span>
          {!isUser && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
              {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
